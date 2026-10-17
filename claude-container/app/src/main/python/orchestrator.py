"""orchestrator.py - generator / critic / sandbox loop with state handoff.

Flow per block: Model A generates code -> Model B (critic) audits -> sandbox
static + dynamic test -> promote. Any failure routes feedback back to A.
Checkpoints serialize goal, screen state, variables and history so the next
model in rotation can resume.
"""
import json
import time

import router as router_mod
import sandbox_evaluator as sandbox

GEN_SYSTEM = (
    "You write small, self-contained Python modules for an Android automation container. "
    "Define a `run(...)` entry point and a `selftest()` function that uses assert statements to verify "
    "run(). Do no work at import time. Do not use subprocess, ctypes, eval, exec, os.system or file deletion. "
    "Reply with ONLY the code, no prose, no markdown fences."
)
CRITIC_SYSTEM = (
    "You audit Python code. Reply with JSON: "
    '{"approved": bool, "issues": [str], "suggestions": [str]}. '
    "Reject code with logic bugs, unbounded loops, or missing error handling."
)


def strip_fences(text):
    t = text.strip()
    if t.startswith("```"):
        lines = t.splitlines()
        lines = lines[1:]
        if lines and lines[-1].strip().startswith("```"):
            lines = lines[:-1]
        t = "\n".join(lines)
    return t


class Orchestrator:
    def __init__(self, generator_router, critic_router=None, max_rounds=4, timeout=5.0):
        self.gen = generator_router
        self.critic = critic_router or generator_router
        self.max_rounds = max_rounds
        self.timeout = timeout
        self.state = {"goal": "", "screen_state": {}, "variables": {}, "history": []}

    # ----- state handoff -----

    def set_goal(self, goal):
        self.state["goal"] = goal

    def update_screen(self, screen_json):
        self.state["screen_state"] = screen_json if isinstance(screen_json, dict) else _safe_load(screen_json)

    def record(self, event, **data):
        self.state["history"].append({"t": time.time(), "event": event, **data})
        self.state["history"] = self.state["history"][-20:]

    def serialize_state(self, max_history=10):
        snap = dict(self.state)
        snap["history"] = snap["history"][-max_history:]
        return json.dumps(snap, default=str)

    def inject_state(self, checkpoint_json, target_router=None):
        """Restore a checkpoint and return a message list that primes the next model."""
        self.state = json.loads(checkpoint_json)
        msg = [
            {"role": "system", "content": "You are resuming a task from a checkpoint. Continue seamlessly."},
            {"role": "user", "content": "CHECKPOINT:\n" + checkpoint_json + "\n\nContinue toward the goal."},
        ]
        if target_router is not None:
            self.gen = target_router
        return msg

    def _handoff_if_needed(self, exc):
        """On rate/limit exhaustion, snapshot so a rotated router can resume."""
        self.record("handoff", reason=str(exc))
        return self.serialize_state()

    # ----- main loop -----

    def generate_module(self, filename, task_description):
        """Run the verification loop. Returns a result dict."""
        feedback = ""
        code = ""
        for round_no in range(1, self.max_rounds + 1):
            prompt = "Task: %s\nFilename: %s\n" % (task_description, filename)
            if feedback:
                prompt += "\nYour previous attempt failed:\n%s\n\nPrevious code:\n%s\n\nFix it." % (feedback, code)
            try:
                code = strip_fences(self.gen.complete([
                    {"role": "system", "content": GEN_SYSTEM},
                    {"role": "user", "content": prompt},
                ]))
            except router_mod.RouterError as exc:
                return {"ok": False, "stage": "generate", "checkpoint": self._handoff_if_needed(exc)}
            self.record("generated", round=round_no, file=filename)

            # Critic
            try:
                review = self.critic.complete_json([
                    {"role": "system", "content": CRITIC_SYSTEM},
                    {"role": "user", "content": "Task: %s\n\nCode:\n%s" % (task_description, code)},
                ])
            except (router_mod.RouterError, ValueError) as exc:
                review = {"approved": True, "issues": ["critic unavailable: %s" % exc]}
            if not review.get("approved", False):
                feedback = "Critic issues: " + "; ".join(map(str, review.get("issues", []))) + \
                    "\nSuggestions: " + "; ".join(map(str, review.get("suggestions", [])))
                self.record("critic_rejected", round=round_no)
                continue

            # Sandbox (static + dynamic + promote)
            result = sandbox.submit_source(filename, code, self.timeout)
            if result["ok"]:
                self.record("promoted", file=filename)
                return {"ok": True, "rounds": round_no, "path": result["path"], "code": code}
            err = result.get("error") or {}
            feedback = "Sandbox stage '%s' failed:\n%s" % (result.get("stage"), err.get("traceback") or err.get("message"))
            self.record("sandbox_failed", round=round_no, stage=result.get("stage"))

        return {"ok": False, "stage": "max_rounds", "last_feedback": feedback, "last_code": code,
                "checkpoint": self.serialize_state()}

    def generate_module_json(self, filename, task_description):
        return json.dumps(self.generate_module(filename, task_description), default=str)


def _safe_load(text):
    try:
        return json.loads(text)
    except (TypeError, ValueError):
        return {"raw": str(text)}
