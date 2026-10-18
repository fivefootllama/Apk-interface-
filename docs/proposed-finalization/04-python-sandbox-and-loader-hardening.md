# 04 — Python Sandbox and Loader Hardening

Goal
- Extract Python runtime code from frontend sources and place it under `python/` as proper `.py` modules. Replace unsafe exec/eval-in-process patterns with a subprocess/multiprocessing-based sandbox that enforces time and memory limits and a strict import whitelist.

Files to create in python/
- python/loader.py                (dynamic module loader)
- python/sandbox_evaluator.py     (two-phase sandbox evaluator + promotion)
- python/sandbox_secure.py        (subprocess sandbox runner template)
- python/requirements.txt         (pip dependencies for offline analysis)

Loader.py
- The repository already contains a loader implementation embedded in `src/codeRepository.ts` as a code string (PROMPT_3_FILES). Extract that content and place it in `python/loader.py`. The implementation uses importlib.util to load/reload modules, writes errors to logs/execution_errors.log, and exposes loader_instance.

Below is the ready-to-drop loader.py derived from codeRepository.ts PROMPT_3_FILES (verbatim):

```python
"""
Dynamic Module Loader & Execution Engine for Android Container
Runs inside Android internal files directory (context.filesDir)
"""

import os
import sys
import importlib
import importlib.util
import traceback
from datetime import datetime
from typing import Dict, Any, List, Optional


class DynamicModuleLoader:
    def __init__(self, base_dir: Optional[str] = None):
        if base_dir is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
        self.base_dir = base_dir
        self.actions_dir = os.path.join(self.base_dir, "actions")
        self.tools_dir = os.path.join(self.base_dir, "tools")
        self.modules_dir = os.path.join(self.base_dir, "modules")
        self.logs_dir = os.path.join(self.base_dir, "logs")
        self.error_log_path = os.path.join(self.logs_dir, "execution_errors.log")

        self._ensure_directories()

    def _ensure_directories(self) -> None:
        for path in [self.actions_dir, self.tools_dir, self.modules_dir, self.logs_dir]:
            os.makedirs(path, exist_ok=True)

    def scan_modules(self) -> Dict[str, List[str]]:
        discovered = {"actions": [], "tools": [], "modules": []}
        for key, directory in [("actions", self.actions_dir), ("tools", self.tools_dir), ("modules", self.modules_dir)]:
            if os.path.exists(directory):
                for filename in os.listdir(directory):
                    if filename.endswith(".py") and not filename.startswith("__"):
                        discovered[key].append(filename)
        return discovered

    def load_or_reload_module(self, module_name: str, file_path: str) -> Any:
        if not os.path.isfile(file_path):
            raise FileNotFoundError(f"Target script not found: {file_path}")

        importlib.invalidate_caches()

        spec = importlib.util.spec_from_file_location(module_name, file_path)
        if spec is None or spec.loader is None:
            raise ImportError(f"Failed to create module spec for {module_name} at {file_path}")

        if module_name in sys.modules:
            module = sys.modules[module_name]
            spec.loader.exec_module(module)
        else:
            module = importlib.util.module_from_spec(spec)
            sys.modules[module_name] = module
            spec.loader.exec_module(module)

        return module

    def execute_action(self, script_name: str, entrypoint: str = "main", *args, **kwargs) -> Dict[str, Any]:
        target_path = None
        for candidate_dir in [self.actions_dir, self.tools_dir, self.modules_dir]:
            cand = os.path.join(candidate_dir, script_name if script_name.endswith(".py") else f"{script_name}.py")
            if os.path.exists(cand):
                target_path = cand
                break

        if not target_path:
            err_msg = f"Script '{script_name}' not found in /actions/, /tools/, or /modules/"
            self._log_error(script_name, entrypoint, err_msg)
            return {"status": "error", "type": "FileNotFoundError", "message": err_msg, "traceback": None, "timestamp": datetime.utcnow().isoformat()}

        mod_name = os.path.splitext(os.path.basename(target_path))[0]

        try:
            module = self.load_or_reload_module(mod_name, target_path)

            if not hasattr(module, entrypoint):
                raise AttributeError(f"Module '{mod_name}' does not contain entrypoint '{entrypoint}'")

            callable_fn = getattr(module, entrypoint)
            if not callable(callable_fn):
                raise TypeError(f"Target entrypoint '{entrypoint}' in '{mod_name}' is not callable")

            result = callable_fn(*args, **kwargs)

            return {"status": "success", "module": mod_name, "entrypoint": entrypoint, "result": result, "timestamp": datetime.utcnow().isoformat()}

        except Exception as exc:
            tb_str = traceback.format_exc()
            self._log_error(mod_name, entrypoint, f"{type(exc).__name__}: {str(exc)}\n{tb_str}")
            return {"status": "error", "module": mod_name, "entrypoint": entrypoint, "type": type(exc).__name__, "message": str(exc), "traceback": tb_str, "timestamp": datetime.utcnow().isoformat()}

    def _log_error(self, module_name: str, entrypoint: str, message: str) -> None:
        try:
            with open(self.error_log_path, "a", encoding="utf-8") as f:
                f.write(f"[{datetime.utcnow().isoformat()}] [{module_name}.{entrypoint}] ERROR:\n{message}\n{'-'*60}\n")
        except Exception as log_err:
            print(f"[Loader] Failed to write error log: {log_err}", file=sys.stderr)


# Global singleton instance for Chaquopy bridge calls
loader_instance = DynamicModuleLoader()
```

Safer sandbox runner (subprocess/multiprocessing template)

```python
# python/sandbox_secure.py
import os
import sys
import json
import multiprocessing as mp
import traceback

ALLOWED_MODULES = {"math", "json", "time"}

def _worker_run(code: str, out_q: mp.Queue):
    try:
        try:
            import resource
            resource.setrlimit(resource.RLIMIT_AS, (200 * 1024 * 1024, 200 * 1024 * 1024))
            resource.setrlimit(resource.RLIMIT_CPU, (5, 5))
        except Exception:
            pass

        safe_builtins = {"True": True, "False": False, "None": None, "len": len, "range": range, "min": min, "max": max, "abs": abs, "sum": sum, "print": print}
        globs = {"__builtins__": safe_builtins, "__name__": "__sandbox__"}

        def _safe_import(name, globals=None, locals=None, fromlist=(), level=0):
            if name.split(".")[0] not in ALLOWED_MODULES:
                raise ImportError(f"Import of module '{name}' is not allowed in sandbox")
            return __import__(name, globals, locals, fromlist, level)

        globs["__builtins__"]["__import__"] = _safe_import

        compiled = compile(code, "<sandbox>", "exec")
        exec(compiled, globs, {})

        out_q.put({"status": "success", "result": None})
    except Exception as e:
        out_q.put({"status": "error", "type": type(e).__name__, "message": str(e), "traceback": traceback.format_exc()})


def run_in_sandbox(code: str, timeout_seconds: float = 3.0):
    q = mp.Queue()
    p = mp.Process(target=_worker_run, args=(code, q))
    p.start()
    p.join(timeout_seconds)
    if p.is_alive():
        p.terminate()
        p.join(1)
        return {"status": "error", "message": "timeout"}
    if not q.empty():
        return q.get()
    return {"status": "error", "message": "no_output_from_sandbox"}
```

Sandbox evaluator (two-phase) — brief guidance
- Phase 1: AST parse + compile (static verification)
- Phase 2: run in subprocess sandbox with strict builtins & import whitelist
- After passing a test suite, promote script from `sandbox/` to `modules/`

Notes on Chaquopy
- Chaquopy on Android may restrict certain modules (e.g. resource limits and multiprocessing).
- If multiprocessing is unavailable, a small subprocess-based wrapper using `subprocess` to spawn a separate Python interpreter is a fallback. The key is isolation and ensuring `SIGKILL` on timeout.

Next steps
- Extract PROMPT_3_FILES and PROMPT_4_FILES data from `src/codeRepository.ts` and write them as separate .py files inside `python/`.
- Add a lightweight test harness `python/tests/test_sandbox.py` that validates the sandbox runner with harmless snippets.

