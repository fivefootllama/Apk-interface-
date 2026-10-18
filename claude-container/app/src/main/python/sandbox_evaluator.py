"""sandbox_evaluator.py - two-phase testing and atomic evaluation.

Phase 1: static analysis (ast.parse + compile).
Granular: eval_block() runs one snippet in an isolated namespace and captures
          stdout / stderr / result.
Phase 2: dynamic execution of a full script in a daemon thread with a timeout;
         on success the file is promoted from sandbox/ to modules/.

Caveat: exec() in a dict namespace is NOT a security boundary. This isolates
variables and catches errors/infinite loops; it does not stop a script from
touching files or the network. Only run code from models you trust.
"""
import ast
import contextlib
import io
import json
import os
import shutil
import sys
import threading
import traceback

DEFAULT_TIMEOUT = 5.0

_base_dir = None


class _ThreadStream:
    """sys.stdout/stderr proxy that captures per thread.

    contextlib.redirect_stdout swaps the process-global stream, so a script
    that times out (and keeps running) would leave it hijacked forever. This
    proxy is installed once; each thread opts in to a private buffer and all
    other threads keep writing to the real stream.
    """

    def __init__(self, real):
        self._real = real
        self._local = threading.local()

    def _target(self):
        return getattr(self._local, "buf", None) or self._real

    def capture(self, buf):
        self._local.buf = buf

    def release(self):
        self._local.buf = None

    def write(self, s):
        return self._target().write(s)

    def flush(self):
        try:
            self._target().flush()
        except Exception:  # noqa: BLE001
            pass

    def __getattr__(self, name):
        return getattr(self._real, name)


def _install_streams():
    if not isinstance(sys.stdout, _ThreadStream):
        sys.stdout = _ThreadStream(sys.stdout)
    if not isinstance(sys.stderr, _ThreadStream):
        sys.stderr = _ThreadStream(sys.stderr)


@contextlib.contextmanager
def _capture(out, err):
    """Capture this thread's stdout/stderr only."""
    _install_streams()
    sys.stdout.capture(out)
    sys.stderr.capture(err)
    try:
        yield
    finally:
        sys.stdout.release()
        sys.stderr.release()


_BLOCKED_IMPORTS = {"subprocess", "ctypes", "pty"}
_BLOCKED_CALLS = {"eval", "exec", "compile", "__import__"}
_BLOCKED_ATTRS = {
    ("os", n) for n in ("system", "popen", "remove", "unlink", "rmdir", "removedirs", "execv", "execl", "execvp")
} | {("shutil", "rmtree")}


def policy_violations(tree):
    """Lint for obviously dangerous constructs in model-written code.

    This is a guard rail, not a jail: getattr tricks and indirection can bypass it.
    """
    found = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for a in node.names:
                if a.name.split(".")[0] in _BLOCKED_IMPORTS:
                    found.append("import of %s is not allowed" % a.name)
        elif isinstance(node, ast.ImportFrom):
            mod = (node.module or "").split(".")[0]
            if mod in _BLOCKED_IMPORTS:
                found.append("import from %s is not allowed" % mod)
            for a in node.names:
                if (mod, a.name) in _BLOCKED_ATTRS:
                    found.append("%s.%s is not allowed" % (mod, a.name))
        elif isinstance(node, ast.Call):
            f = node.func
            if isinstance(f, ast.Name) and f.id in _BLOCKED_CALLS:
                found.append("call to %s() is not allowed" % f.id)
            elif isinstance(f, ast.Attribute) and isinstance(f.value, ast.Name) \
                    and (f.value.id, f.attr) in _BLOCKED_ATTRS:
                found.append("%s.%s() is not allowed" % (f.value.id, f.attr))
    return found


def init(base_dir=None):
    global _base_dir
    if base_dir is None:
        base_dir = os.environ.get("CONTAINER_FILES_DIR") or os.getcwd()
    _base_dir = str(base_dir)
    for sub in ("sandbox", "modules"):
        os.makedirs(os.path.join(_base_dir, sub), exist_ok=True)
    return _base_dir


def _dirs():
    if _base_dir is None:
        init()
    return os.path.join(_base_dir, "sandbox"), os.path.join(_base_dir, "modules")


# ---------- Phase 1 ----------

def static_check(source, filename="<snippet>"):
    """Return {"ok": bool, "error": {...}|None}."""
    try:
        tree = ast.parse(source, filename=filename)
        compile(tree, filename, "exec")
        violations = policy_violations(tree)
        if violations:
            return {"ok": False, "error": {
                "type": "PolicyViolation", "message": "; ".join(violations), "traceback": ""}}
        return {"ok": True, "error": None}
    except SyntaxError as exc:
        return {
            "ok": False,
            "error": {
                "type": "SyntaxError",
                "message": exc.msg,
                "line": exc.lineno,
                "offset": exc.offset,
                "traceback": traceback.format_exc(),
            },
        }
    except Exception as exc:  # noqa: BLE001
        return {
            "ok": False,
            "error": {"type": type(exc).__name__, "message": str(exc), "traceback": traceback.format_exc()},
        }


def static_check_file(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            src = f.read()
    except OSError as exc:
        return {"ok": False, "error": {"type": "OSError", "message": str(exc), "traceback": ""}}
    return static_check(src, filename=path)


# ---------- Granular block evaluation ----------

def eval_block(code_snippet, scope_dict=None):
    """Run a snippet in an isolated namespace.

    Tries eval() first (expressions), falls back to exec(). The value of a
    variable named `result` (exec mode) or the expression value (eval mode)
    is returned as "value".
    """
    scope = {"__name__": "__sandbox__"}
    if scope_dict:
        scope.update(scope_dict)
    out, err = io.StringIO(), io.StringIO()
    report = {"ok": False, "value": None, "stdout": "", "stderr": "", "error": None, "scope_keys": []}

    check = static_check(code_snippet)
    if not check["ok"]:
        report["error"] = check["error"]
        return report

    try:
        with _capture(out, err):
            try:
                value = eval(compile(code_snippet, "<block>", "eval"), scope)
            except SyntaxError:
                exec(compile(code_snippet, "<block>", "exec"), scope)
                value = scope.get("result")
        report["ok"] = True
        report["value"] = _jsonable(value)
    except BaseException as exc:  # noqa: BLE001 - includes SystemExit from snippets
        report["error"] = {"type": type(exc).__name__, "message": str(exc), "traceback": traceback.format_exc()}
    report["stdout"] = out.getvalue()
    report["stderr"] = err.getvalue()
    report["scope_keys"] = sorted(k for k in scope if not k.startswith("__"))
    return report


def eval_block_json(code_snippet, scope_json="{}"):
    try:
        scope = json.loads(scope_json) if scope_json else {}
    except ValueError as exc:
        return json.dumps({"ok": False, "error": {"type": "ValueError", "message": str(exc), "traceback": ""}})
    return json.dumps(eval_block(code_snippet, scope), default=str)


def _jsonable(v):
    try:
        json.dumps(v)
        return v
    except (TypeError, ValueError):
        return repr(v)


# ---------- Phase 2 ----------

def run_script(source, timeout=DEFAULT_TIMEOUT, filename="<script>"):
    """Execute full source in a daemon thread. Returns a report dict.

    Python cannot kill threads, so a timed-out script keeps running in the
    background; it is a daemon thread and will die with the process. Treat a
    timeout as a hard failure and never promote.
    """
    state = {"done": False, "error": None}
    scope = {"__name__": "__sandbox_run__", "__file__": filename}
    out, err = io.StringIO(), io.StringIO()

    def target():
        try:
            with _capture(out, err):
                exec(compile(source, filename, "exec"), scope)
                selftest = scope.get("selftest")
                if callable(selftest):
                    selftest()  # asserts inside count as test failures
        except BaseException as exc:  # noqa: BLE001
            state["error"] = {"type": type(exc).__name__, "message": str(exc), "traceback": traceback.format_exc()}
        finally:
            state["done"] = True

    t = threading.Thread(target=target, name="sandbox-run", daemon=True)
    t.start()
    t.join(timeout)
    if not state["done"]:
        return {
            "ok": False,
            "timed_out": True,
            "stdout": out.getvalue(),
            "stderr": err.getvalue(),
            "error": {"type": "TimeoutError", "message": "exceeded %.1fs" % timeout, "traceback": ""},
        }
    return {
        "ok": state["error"] is None,
        "timed_out": False,
        "stdout": out.getvalue(),
        "stderr": err.getvalue(),
        "error": state["error"],
    }


def test_and_promote(filename, timeout=DEFAULT_TIMEOUT):
    """Full pipeline for sandbox/<filename>: static -> dynamic -> promote."""
    sandbox_dir, modules_dir = _dirs()
    if os.path.basename(filename) != filename or not filename.endswith(".py"):
        return {"ok": False, "stage": "validate", "promoted": False,
                "error": {"type": "ValueError", "message": "filename must be a bare .py name", "traceback": ""}}
    src_path = os.path.join(sandbox_dir, filename)
    if not os.path.isfile(src_path):
        return {"ok": False, "stage": "validate", "promoted": False,
                "error": {"type": "FileNotFoundError", "message": src_path, "traceback": ""}}

    phase1 = static_check_file(src_path)
    if not phase1["ok"]:
        return {"ok": False, "stage": "static", "promoted": False, "error": phase1["error"]}

    with open(src_path, "r", encoding="utf-8") as f:
        source = f.read()
    phase2 = run_script(source, timeout=timeout, filename=src_path)
    if not phase2["ok"]:
        return {"ok": False, "stage": "dynamic", "promoted": False, "error": phase2["error"],
                "timed_out": phase2["timed_out"], "stdout": phase2["stdout"], "stderr": phase2["stderr"]}

    dest = os.path.join(modules_dir, filename)
    shutil.move(src_path, dest)
    return {"ok": True, "stage": "promoted", "promoted": True, "path": dest,
            "stdout": phase2["stdout"], "stderr": phase2["stderr"], "error": None}


def test_and_promote_json(filename, timeout=DEFAULT_TIMEOUT):
    return json.dumps(test_and_promote(filename, float(timeout)), default=str)


def submit_source(filename, source, timeout=DEFAULT_TIMEOUT):
    """Write source into sandbox/ then run the full pipeline."""
    sandbox_dir, _ = _dirs()
    if os.path.basename(filename) != filename or not filename.endswith(".py"):
        return {"ok": False, "stage": "validate", "promoted": False,
                "error": {"type": "ValueError", "message": "filename must be a bare .py name", "traceback": ""}}
    with open(os.path.join(sandbox_dir, filename), "w", encoding="utf-8") as f:
        f.write(source)
    return test_and_promote(filename, timeout)
