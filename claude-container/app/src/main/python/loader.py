"""loader.py - dynamic module loader and safe execution wrapper.

Lives in the app's internal files dir (context.filesDir). Scans the
`modules/`, `actions/` and `tools/` subdirectories for .py files, loads or
reloads them with importlib, and runs entry points inside a wrapper that
never raises: failures come back as clean error payloads and full
tracebacks are appended to logs/errors.log.
"""
import importlib.util
import json
import os
import sys
import time
import traceback

_DEFAULT_SUBDIRS = ("modules", "actions", "tools")
_PREFIX = "dyn_"

_base_dir = None
_loaded = {}  # module name -> {"path": str, "mtime": float}


def init(base_dir=None):
    """Set the base directory (context.filesDir). Safe to call repeatedly."""
    global _base_dir
    if base_dir is None:
        base_dir = os.environ.get("CONTAINER_FILES_DIR") or os.getcwd()
    _base_dir = str(base_dir)
    for sub in _DEFAULT_SUBDIRS + ("logs",):
        os.makedirs(os.path.join(_base_dir, sub), exist_ok=True)
    return _base_dir


def _require_base():
    if _base_dir is None:
        init()
    return _base_dir


def _log_path():
    return os.path.join(_require_base(), "logs", "errors.log")


def log_error(context, exc_text):
    try:
        with open(_log_path(), "a", encoding="utf-8") as f:
            f.write("[%s] %s\n%s\n\n" % (time.strftime("%Y-%m-%d %H:%M:%S"), context, exc_text))
    except OSError:
        pass


def _error_payload(context, exc):
    tb = traceback.format_exc()
    log_error(context, tb)
    return {
        "ok": False,
        "error": {
            "type": type(exc).__name__,
            "message": str(exc),
            "context": context,
            "traceback": tb,
        },
    }


def scan(subdirs=None):
    """Return a list of .py file paths in the designated subdirectories."""
    base = _require_base()
    found = []
    for sub in subdirs or _DEFAULT_SUBDIRS:
        d = os.path.join(base, sub)
        if not os.path.isdir(d):
            continue
        for name in sorted(os.listdir(d)):
            if name.endswith(".py") and not name.startswith("_"):
                found.append(os.path.join(d, name))
    return found


def _module_name(path):
    sub = os.path.basename(os.path.dirname(path))
    stem = os.path.splitext(os.path.basename(path))[0]
    return "%s%s_%s" % (_PREFIX, sub, stem)


def load_module(path):
    """Load or reload one file. Returns {"ok": True, "module": name} or an error payload."""
    name = _module_name(path)
    try:
        spec = importlib.util.spec_from_file_location(name, path)
        if spec is None or spec.loader is None:
            raise ImportError("cannot build spec for %s" % path)
        module = importlib.util.module_from_spec(spec)
        sys.modules[name] = module  # register before exec so self-imports resolve
        try:
            spec.loader.exec_module(module)
        except BaseException:
            sys.modules.pop(name, None)
            raise
        _loaded[name] = {"path": path, "mtime": os.path.getmtime(path)}
        return {"ok": True, "module": name, "path": path}
    except Exception as exc:  # noqa: BLE001
        return _error_payload("load_module(%s)" % path, exc)


def load_all(subdirs=None):
    """Load every script found; reload only if changed since last load."""
    results = []
    for path in scan(subdirs):
        name = _module_name(path)
        info = _loaded.get(name)
        if info and info["mtime"] == os.path.getmtime(path) and name in sys.modules:
            results.append({"ok": True, "module": name, "path": path, "cached": True})
        else:
            results.append(load_module(path))
    return results


def reload_changed(subdirs=None):
    return [r for r in load_all(subdirs) if not r.get("cached")]


def unload(name):
    sys.modules.pop(name, None)
    _loaded.pop(name, None)
    return {"ok": True, "module": name}


def list_loaded():
    return {n: dict(i) for n, i in _loaded.items()}


def safe_call(module_name, func_name="run", *args, **kwargs):
    """Run module.func(*args, **kwargs); always returns a dict payload."""
    context = "%s.%s" % (module_name, func_name)
    try:
        module = sys.modules.get(module_name)
        if module is None:
            raise KeyError("module not loaded: %s" % module_name)
        func = getattr(module, func_name, None)
        if not callable(func):
            raise AttributeError("%s has no callable %r" % (module_name, func_name))
        return {"ok": True, "result": func(*args, **kwargs)}
    except Exception as exc:  # noqa: BLE001
        return _error_payload(context, exc)


def safe_call_json(module_name, func_name="run", args_json="[]"):
    """JSON in / JSON out variant for easy calls from Kotlin."""
    try:
        args = json.loads(args_json)
        if not isinstance(args, list):
            args = [args]
        out = safe_call(module_name, func_name, *args)
    except Exception as exc:  # noqa: BLE001
        out = _error_payload("safe_call_json", exc)
    return json.dumps(out, default=str)


def safe_exec_file(path, func_name="run", *args, **kwargs):
    """Load (or reload) a file then call its entry point."""
    loaded = load_module(path)
    if not loaded.get("ok"):
        return loaded
    return safe_call(loaded["module"], func_name, *args, **kwargs)
