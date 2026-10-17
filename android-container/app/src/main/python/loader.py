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
        """
        Initialize the loader with the Android app's internal filesDir.
        """
        if base_dir is None:
            # Fallback to current working directory or Chaquopy standard files dir
            base_dir = os.path.dirname(os.path.abspath(__file__))
            
        self.base_dir = base_dir
        self.actions_dir = os.path.join(self.base_dir, "actions")
        self.tools_dir = os.path.join(self.base_dir, "tools")
        self.modules_dir = os.path.join(self.base_dir, "modules")
        self.logs_dir = os.path.join(self.base_dir, "logs")
        self.error_log_path = os.path.join(self.logs_dir, "execution_errors.log")

        self._ensure_directories()

    def _ensure_directories(self) -> None:
        """Create target directories if they do not already exist."""
        for path in [self.actions_dir, self.tools_dir, self.modules_dir, self.logs_dir]:
            os.makedirs(path, exist_ok=True)

    def scan_modules(self) -> Dict[str, List[str]]:
        """
        Scan designated directories (/actions/, /tools/, /modules/) for .py script files.
        """
        discovered = {
            "actions": [],
            "tools": [],
            "modules": []
        }
        
        for key, directory in [("actions", self.actions_dir), ("tools", self.tools_dir), ("modules", self.modules_dir)]:
            if os.path.exists(directory):
                for filename in os.listdir(directory):
                    if filename.endswith(".py") and not filename.startswith("__"):
                        discovered[key].append(filename)
                        
        return discovered

    def load_or_reload_module(self, module_name: str, file_path: str) -> Any:
        """
        Dynamically load or reload a Python module from disk using importlib.util
        and sys.modules without restarting the Android container.
        """
        if not os.path.isfile(file_path):
            raise FileNotFoundError(f"Target script not found: {file_path}")

        # Invalidate import caches to guarantee picking up fresh disk writes
        importlib.invalidate_caches()

        spec = importlib.util.spec_from_file_location(module_name, file_path)
        if spec is None or spec.loader is None:
            raise ImportError(f"Failed to create module spec for {module_name} at {file_path}")

        # If module already loaded in sys.modules, reuse and reload in-place
        if module_name in sys.modules:
            module = sys.modules[module_name]
            spec.loader.exec_module(module)
        else:
            module = importlib.util.module_from_spec(spec)
            sys.modules[module_name] = module
            spec.loader.exec_module(module)

        return module

    def execute_action(self, script_name: str, entrypoint: str = "main", *args, **kwargs) -> Dict[str, Any]:
        """
        Safe execution wrapper that:
        1. Resolves script path in /actions/, /tools/, or /modules/
        2. Dynamically loads/reloads the module
        3. Invokes entrypoint function
        4. Traps all exceptions, logs traceback to text log, and returns clean payload
        """
        # Resolve script location
        target_path = None
        for candidate_dir in [self.actions_dir, self.tools_dir, self.modules_dir]:
            cand = os.path.join(candidate_dir, script_name if script_name.endswith(".py") else f"{script_name}.py")
            if os.path.exists(cand):
                target_path = cand
                break

        if not target_path:
            err_msg = f"Script '{script_name}' not found in /actions/, /tools/, or /modules/"
            self._log_error(script_name, entrypoint, err_msg)
            return {
                "status": "error",
                "type": "FileNotFoundError",
                "message": err_msg,
                "traceback": None,
                "timestamp": datetime.utcnow().isoformat()
            }

        mod_name = os.path.splitext(os.path.basename(target_path))[0]

        try:
            module = self.load_or_reload_module(mod_name, target_path)

            if not hasattr(module, entrypoint):
                raise AttributeError(f"Module '{mod_name}' does not contain entrypoint '{entrypoint}'")

            callable_fn = getattr(module, entrypoint)
            if not callable(callable_fn):
                raise TypeError(f"Target entrypoint '{entrypoint}' in '{mod_name}' is not callable")

            # Execute entrypoint
            result = callable_fn(*args, **kwargs)

            return {
                "status": "success",
                "module": mod_name,
                "entrypoint": entrypoint,
                "result": result,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as exc:
            tb_str = traceback.format_exc()
            self._log_error(mod_name, entrypoint, f"{type(exc).__name__}: {str(exc)}\n{tb_str}")

            return {
                "status": "error",
                "module": mod_name,
                "entrypoint": entrypoint,
                "type": type(exc).__name__,
                "message": str(exc),
                "traceback": tb_str,
                "timestamp": datetime.utcnow().isoformat()
            }

    def _log_error(self, module_name: str, entrypoint: str, message: str) -> None:
        """Appends formatted error tracebacks to logs/execution_errors.log."""
        try:
            with open(self.error_log_path, "a", encoding="utf-8") as f:
                f.write(f"[{datetime.utcnow().isoformat()}] [{module_name}.{entrypoint}] ERROR:\n{message}\n{'-'*60}\n")
        except Exception as log_err:
            print(f"[Loader] Failed to write error log: {log_err}", file=sys.stderr)


# Global singleton instance for Chaquopy bridge calls
loader_instance = DynamicModuleLoader()
