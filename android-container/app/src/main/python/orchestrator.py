"""
Generator-Critic Peer Review & State-Handoff Protocol
Coordinates Model A (Generator), Model B (Critic), Sandbox Evaluator, and State Handoff
"""

import json
import logging
import os
import time
from typing import Dict, Any, Optional

from router import MultiProviderRouter
from sandbox_evaluator import SandboxEvaluator

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("MultiAgentOrchestrator")


class MultiAgentOrchestrator:
    def __init__(self, files_dir: Optional[str] = None):
        self.files_dir = files_dir or os.path.dirname(os.path.abspath(__file__))
        self.router = MultiProviderRouter()
        self.sandbox = SandboxEvaluator(files_dir=self.files_dir)
        
        # State checkpoint container
        self.state_checkpoint_dir = os.path.join(self.files_dir, "checkpoints")
        os.makedirs(self.state_checkpoint_dir, exist_ok=True)

    # =========================================================================
    # 1. State Serialization Function
    # =========================================================================
    def serialize_state_checkpoint(
        self,
        current_goal: str,
        screen_state_json: Dict[str, Any],
        variable_map: Dict[str, Any],
        execution_history: list
    ) -> str:
        """
        Packages current goal, screen state JSON, variable map, and recent
        execution history into a clean JSON string checkpoint whenever a rate limit
        or token ceiling is approached.
        """
        checkpoint = {
            "checkpoint_id": f"ckpt_{int(time.time() * 1000)}",
            "timestamp": time.time(),
            "current_goal": current_goal,
            "screen_state": screen_state_json,
            "variable_map": variable_map,
            "execution_history": execution_history[-10:],  # retain recent 10 iterations
            "schema_version": "1.0.0"
        }
        serialized = json.dumps(checkpoint, indent=2)

        checkpoint_file = os.path.join(self.state_checkpoint_dir, f"{checkpoint['checkpoint_id']}.json")
        try:
            with open(checkpoint_file, "w", encoding="utf-8") as f:
                f.write(serialized)
            logger.info(f"State checkpoint serialized to {checkpoint_file}")
        except Exception as e:
            logger.error(f"Failed to persist checkpoint to disk: {e}")

        return serialized

    # =========================================================================
    # 2. State Injection Function
    # =========================================================================
    def inject_state_checkpoint(self, checkpoint_json_str: str) -> Dict[str, Any]:
        """
        Passes the checkpoint payload into the next incoming model in rotation
        to resume execution seamlessly.
        """
        try:
            checkpoint = json.loads(checkpoint_json_str)
            logger.info(f"State successfully injected from Checkpoint: {checkpoint.get('checkpoint_id')}")
            return checkpoint
        except Exception as exc:
            logger.error(f"Invalid checkpoint JSON payload: {exc}")
            raise ValueError(f"State injection failed: {exc}")

    # =========================================================================
    # 3. Adversarial Generator-Critic Loop & Promotion
    # =========================================================================
    def run_adversarial_cycle(
        self,
        goal: str,
        screen_state: Dict[str, Any],
        script_target_filename: str = "action_target.py",
        max_correction_turns: int = 3
    ) -> Dict[str, Any]:
        """
        Verification loop:
        1. Model A generates Python code in atomic blocks
        2. Model B (Critic) audits the code structure & security
        3. sandbox_evaluator statically and dynamically tests the payload before promotion
        4. If any layer fails, route traceback back to Model A for automated correction
        """
        logger.info(f"Starting Adversarial Peer-Review Cycle for goal: '{goal}'")
        
        history_log = []
        last_traceback = None
        current_code = None

        for turn in range(1, max_correction_turns + 1):
            logger.info(f"--- Cycle Turn {turn}/{max_correction_turns} ---")

            # Layer 1: Model A (Generator)
            generator_prompt = self._build_generator_prompt(goal, screen_state, last_traceback, current_code)
            gen_response = self.router.execute_query(
                messages=[
                    {"role": "system", "content": "You are Model A (Generator), an expert Android Python container developer. Output executable Python code with an entrypoint main() or run()."},
                    {"role": "user", "content": generator_prompt}
                ],
                tags=["#generator", "#android_container", "#codegen", f"#turn_{turn}"]
            )

            raw_code = self._extract_code(gen_response.get("raw_content", ""))
            current_code = raw_code
            logger.info(f"Model A produced {len(raw_code.splitlines())} lines of code.")

            # Layer 2: Model B (Critic)
            critic_prompt = self._build_critic_prompt(goal, current_code)
            critic_response = self.router.execute_query(
                messages=[
                    {"role": "system", "content": "You are Model B (Critic). Audit code for syntax, infinite loops, and Android accessibility compliance. Return JSON: {'verdict': 'APPROVED'|'REJECTED', 'critique': '...'}"},
                    {"role": "user", "content": critic_prompt}
                ],
                tags=["#critic", "#security_audit", "#accessibility", f"#turn_{turn}"],
                json_schema={"type": "json_object"}
            )

            critic_verdict = "REJECTED"
            critique = "Critic failed to parse."
            if critic_response.get("structured_data"):
                critic_verdict = critic_response["structured_data"].get("verdict", "REJECTED")
                critique = critic_response["structured_data"].get("critique", "")

            logger.info(f"Model B (Critic) verdict: {critic_verdict} (Reason: {critique})")

            if critic_verdict != "APPROVED":
                last_traceback = f"Critic Audit Rejection: {critique}"
                history_log.append({"turn": turn, "stage": "critic", "status": "failed", "feedback": critique})
                continue

            # Layer 3: Sandbox Evaluator (Static AST + Dynamic 5-Second Test)
            sandbox_path = os.path.join(self.sandbox.sandbox_dir, script_target_filename)
            with open(sandbox_path, "w", encoding="utf-8") as f:
                f.write(current_code)

            eval_result_json = self.sandbox.test_and_promote(script_target_filename, timeout_seconds=5.0)
            eval_result = json.loads(eval_result_json)

            if eval_result.get("status") == "promoted":
                logger.info(f"SUCCESS: Script passed all layers and promoted to modules/{script_target_filename}!")
                history_log.append({"turn": turn, "stage": "sandbox", "status": "promoted", "details": eval_result})
                return {
                    "status": "success",
                    "promoted": True,
                    "target_file": script_target_filename,
                    "turns_taken": turn,
                    "final_code": current_code,
                    "history": history_log
                }
            else:
                last_traceback = f"Sandbox Test Failure [{eval_result.get('stage')}]: {eval_result.get('error')} - {eval_result.get('message')}\n{eval_result.get('traceback')}"
                logger.warning(f"Sandbox test failed. Routing traceback back to Model A for automated correction.")
                history_log.append({"turn": turn, "stage": "sandbox", "status": "failed", "feedback": last_traceback})

        # If loops exhausted without passing
        checkpoint_str = self.serialize_state_checkpoint(
            current_goal=goal,
            screen_state_json=screen_state,
            variable_map={"last_code": current_code, "exhausted_turns": max_correction_turns},
            execution_history=history_log
        )

        return {
            "status": "failed",
            "promoted": False,
            "turns_taken": max_correction_turns,
            "last_error": last_traceback,
            "checkpoint": checkpoint_str,
            "history": history_log
        }

    def _extract_code(self, raw_content: str) -> str:
        """Strips markdown code fences to retrieve pristine python code."""
        lines = raw_content.strip().splitlines()
        code_lines = []
        in_fence = False
        for line in lines:
            if line.startswith("```"):
                in_fence = not in_fence
                continue
            code_lines.append(line)
        return "\n".join(code_lines).strip()

    def _build_generator_prompt(self, goal: str, screen_state: Dict[str, Any], traceback_err: Optional[str], previous_code: Optional[str]) -> str:
        prompt = f"Goal: {goal}\nScreen Hierarchy: {json.dumps(screen_state, indent=2)}\n"
        if traceback_err and previous_code:
            prompt += f"\nPRIOR ATTEMPT FAILED WITH ERROR:\n{traceback_err}\n\nPREVIOUS CODE:\n{previous_code}\n\nPlease analyze the error and output a corrected, complete script.\n"
        return prompt

    def _build_critic_prompt(self, goal: str, code: str) -> str:
        return f"Verify the following code for Goal: '{goal}'. Ensure safety, proper coordinates, exception safety, and no infinite loops.\n\nCODE:\n{code}"
