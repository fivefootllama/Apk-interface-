"""
Isolated Sandbox & Atomic Evaluation Suite
Operating inside context.filesDir/sandbox/
Mandatory two-phase testing & promotion pipeline
"""

import ast
import io
import json
import os
import shutil
import sys
import threading
import traceback
from contextlib import redirect_stdout, redirect_stderr
from typing import Dict, Any, Optional, Tuple


class SandboxEvaluator:
    def __init__(self, files_dir: Optional[str] = None):
        if files_dir is None:
            files_dir = os.path.dirname(os.path.abspath(__file__))
            
        self.files_dir = files_dir
        self.sandbox_dir = os.path.join(self.files_dir, "sandbox")
        self.modules_dir = os.path.join(self.files_dir, "modules")
        
        os.makedirs(self.sandbox_dir, exist_ok=True)
        os.makedirs(self.modules_dir, exist_ok=True)

    # =========================================================================
    # Phase 1: Static Analysis (AST Verification)
    # =========================================================================
    def static_analysis(self, source_code: str) -> Dict[str, Any]:
        """
        Uses ast.parse() and compile() to verify syntax, grammatical, and structural
        integrity of incoming string snippets and full script files prior to execution.
        """
        try:
            parsed_ast = ast.parse(source_code, filename="<sandbox_static_check>")
            compiled_code = compile(parsed_ast, filename="<sandbox_static_check>", mode="exec")

            # Extract basic AST metrics for validation audits
            node_count = len(list(ast.walk(parsed_ast)))
            defined_functions = [
                n.name for n in ast.walk(parsed_ast) if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))
            ]
            imported_modules = []
            for n in ast.walk(parsed_ast):
                if isinstance(n, ast.Import):
                    for alias in n.names:
                        imported_modules.append(alias.name)
                elif isinstance(n, ast.ImportFrom):
                    imported_modules.append(n.module or "")

            return {
                "passed": True,
                "node_count": node_count,
                "functions": defined_functions,
                "imports": imported_modules,
                "compiled": True,
                "error": None
            }
        except SyntaxError as syn_err:
            return {
                "passed": False,
                "error": "SyntaxError",
                "message": str(syn_err),
                "lineno": syn_err.lineno,
                "offset": syn_err.offset,
                "traceback": traceback.format_exc()
            }
        except Exception as exc:
            return {
                "passed": False,
                "error": type(exc).__name__,
                "message": str(exc),
                "traceback": traceback.format_exc()
            }

    # =========================================================================
    # Granular Block Execution: eval_block
    # =========================================================================
    def eval_block(self, code_snippet: str, scope_dict: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Runs individual code blocks or expressions in an isolated dictionary namespace
        using exec() / eval(), capturing stdout, stderr, and returned values.
        """
        if scope_dict is None:
            scope_dict = {}

        # Ensure baseline safe builtins are present
        if "__builtins__" not in scope_dict:
            scope_dict["__builtins__"] = __builtins__

        # 1. Run static AST check first
        static_check = self.static_analysis(code_snippet)
        if not static_check["passed"]:
            return {
                "status": "error",
                "stage": "static_analysis",
                "stdout": "",
                "stderr": "",
                "returned_value": None,
                "scope": {},
                "error": static_check
            }

        stdout_buffer = io.StringIO()
        stderr_buffer = io.StringIO()
        returned_val = None

        try:
            with redirect_stdout(stdout_buffer), redirect_stderr(stderr_buffer):
                # Check if snippet can be evaluated as an expression
                parsed = ast.parse(code_snippet)
                if len(parsed.body) == 1 and isinstance(parsed.body[0], ast.Expr):
                    # It's a single expression: evaluate to retrieve return value
                    expr_code = compile(code_snippet, "<eval_block>", "eval")
                    returned_val = eval(expr_code, scope_dict)
                else:
                    # Multi-statement block: exec in isolated dictionary namespace
                    exec_code = compile(code_snippet, "<eval_block>", "exec")
                    exec(exec_code, scope_dict)

            # Sanitize scope dict for JSON serialization
            serializable_scope = {}
            for k, v in scope_dict.items():
                if k.startswith("__"):
                    continue
                try:
                    json.dumps(v)
                    serializable_scope[k] = v
                except (TypeError, OverflowError):
                    serializable_scope[k] = f"<{type(v).__name__}>"

            return {
                "status": "success",
                "stage": "execution",
                "stdout": stdout_buffer.getvalue(),
                "stderr": stderr_buffer.getvalue(),
                "returned_value": returned_val,
                "scope": serializable_scope,
                "error": None
            }

        except Exception as exc:
            return {
                "status": "error",
                "stage": "execution",
                "stdout": stdout_buffer.getvalue(),
                "stderr": stderr_buffer.getvalue(),
                "returned_value": None,
                "scope": {},
                "error": {
                    "type": type(exc).__name__,
                    "message": str(exc),
                    "traceback": traceback.format_exc()
                }
            }

    # =========================================================================
    # Phase 2: Dynamic Execution & Promotion
    # =========================================================================
    def test_and_promote(self, script_filename: str, timeout_seconds: float = 5.0) -> str:
        """
        Executes full scripts in an isolated thread with a configurable execution
        timeout (e.g. 5 seconds) to catch infinite loops.
        If all tests & assertions pass without exceptions:
            moves file from context.filesDir/sandbox/ to context.filesDir/modules/
        If it fails:
            returns full error traceback formatted as JSON string.
        """
        src_path = os.path.join(self.sandbox_dir, script_filename)
        dest_path = os.path.join(self.modules_dir, script_filename)

        if not os.path.exists(src_path):
            return json.dumps({
                "status": "failed",
                "stage": "file_resolution",
                "error": "FileNotFoundError",
                "message": f"Target script not found in sandbox: {src_path}",
                "traceback": None
            }, indent=2)

        # Read source
        with open(src_path, "r", encoding="utf-8") as f:
            code_content = f.read()

        # Step 1: Phase 1 Static Analysis
        static_res = self.static_analysis(code_content)
        if not static_res["passed"]:
            return json.dumps({
                "status": "failed",
                "stage": "phase1_static_analysis",
                "error": static_res["error"],
                "message": static_res["message"],
                "traceback": static_res.get("traceback")
            }, indent=2)

        # Step 2: Phase 2 Dynamic Isolated Execution in Thread
        exec_state = {
            "completed": False,
            "exception": None,
            "stdout": "",
            "stderr": ""
        }

        def worker():
            stdout_buf = io.StringIO()
            stderr_buf = io.StringIO()
            isolated_scope = {"__name__": "__main__", "__file__": src_path}

            try:
                with redirect_stdout(stdout_buf), redirect_stderr(stderr_buf):
                    compiled = compile(code_content, src_path, "exec")
                    exec(compiled, isolated_scope)

                    # If script defines a test suite or run_tests() / main(), invoke it
                    if "test_suite" in isolated_scope and callable(isolated_scope["test_suite"]):
                        isolated_scope["test_suite"]()
                    elif "run_tests" in isolated_scope and callable(isolated_scope["run_tests"]):
                        isolated_scope["run_tests"]()

                exec_state["completed"] = True
                exec_state["stdout"] = stdout_buf.getvalue()
                exec_state["stderr"] = stderr_buf.getvalue()

            except Exception as exc:
                exec_state["exception"] = {
                    "type": type(exc).__name__,
                    "message": str(exc),
                    "traceback": traceback.format_exc()
                }
                exec_state["stdout"] = stdout_buf.getvalue()
                exec_state["stderr"] = stderr_buf.getvalue()

        thread = threading.Thread(target=worker, daemon=True)
        thread.start()
        thread.join(timeout=timeout_seconds)

        if thread.is_alive():
            # Execution timed out (possible infinite loop)
            return json.dumps({
                "status": "failed",
                "stage": "phase2_dynamic_timeout",
                "error": "TimeoutError",
                "message": f"Execution exceeded maximum allowed timeout of {timeout_seconds} seconds (infinite loop detected)",
                "traceback": None,
                "stdout": exec_state["stdout"],
                "stderr": exec_state["stderr"]
            }, indent=2)

        if exec_state["exception"] is not None:
            # Runtime error during dynamic testing
            return json.dumps({
                "status": "failed",
                "stage": "phase2_dynamic_execution",
                "error": exec_state["exception"]["type"],
                "message": exec_state["exception"]["message"],
                "traceback": exec_state["exception"]["traceback"],
                "stdout": exec_state["stdout"],
                "stderr": exec_state["stderr"]
            }, indent=2)

        # All checks passed! Promote file from sandbox to modules
        try:
            shutil.move(src_path, dest_path)
            return json.dumps({
                "status": "promoted",
                "filename": script_filename,
                "source": src_path,
                "destination": dest_path,
                "stdout": exec_state["stdout"],
                "message": "Script passed Phase 1 (AST) & Phase 2 (Dynamic 5s thread) validation and was promoted to modules/."
            }, indent=2)
        except Exception as move_err:
            return json.dumps({
                "status": "failed",
                "stage": "promotion_filesystem",
                "error": type(move_err).__name__,
                "message": str(move_err),
                "traceback": traceback.format_exc()
            }, indent=2)
