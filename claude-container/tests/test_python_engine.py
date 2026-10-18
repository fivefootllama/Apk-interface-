"""Desktop tests for the Python engine. Run:  python3 tests/test_python_engine.py"""
import json
import os
import sys
import tempfile
import types

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "app", "src", "main", "python"))

try:
    import requests  # noqa: F401
except ImportError:  # keep the tests runnable without the package
    sys.modules["requests"] = types.SimpleNamespace(
        post=None, RequestException=Exception)

import agent
import loader
import orchestrator
import router
import sandbox_evaluator as sb

BASE = tempfile.mkdtemp()
sb.init(BASE)
loader.init(BASE)
passed = 0


def check(name, cond):
    global passed
    print(("PASS  " if cond else "FAIL  ") + name)
    if not cond:
        sys.exit(1)
    passed += 1


# ---------- sandbox ----------
check("eval_block value", sb.eval_block("x=2+2\nresult=x*10")["value"] == 40)
check("syntax error caught", not sb.static_check("def (:")["ok"])
check("timeout caught", sb.run_script("while True: pass", timeout=0.5)["timed_out"])
check("stdout not hijacked after timeout", not isinstance(sys.stdout, types.SimpleNamespace))
check("policy blocks subprocess", sb.static_check("import subprocess")["error"]["type"] == "PolicyViolation")
check("policy blocks os.system", not sb.static_check("import os\nos.system('x')")["ok"])
check("policy blocks eval", not sb.static_check("eval('1')")["ok"])
r = sb.submit_source("good.py", "def run(a=1):\n    return a+1\ndef selftest():\n    assert run(1) == 2\n")
check("good module promoted", r["promoted"])
r = sb.submit_source("buggy.py", "def run():\n    return 1\ndef selftest():\n    assert run() == 2\n")
check("failing selftest blocks promotion", not r["promoted"] and r["stage"] == "dynamic")
check("loader loads promoted", all(x["ok"] for x in loader.load_all()))
check("safe_call works", loader.safe_call("dyn_modules_good", "run", 41)["result"] == 42)


# ---------- fakes ----------
class FakeBridge:
    def __init__(self, trees, connected=True):
        self.trees, self.calls, self.connected = list(trees), [], connected
        self.last = self.trees[-1]

    def isConnected(self): return self.connected
    def getScreenTreeJson(self):
        if self.trees: self.last = self.trees.pop(0)
        return json.dumps(self.last)
    def tap(self, x, y): self.calls.append(("tap", x, y)); return True
    def swipe(self, *a): self.calls.append(("swipe",) + a); return True
    def back(self): self.calls.append(("back",)); return True
    def home(self): self.calls.append(("home",)); return True
    def typeText(self, t): self.calls.append(("type", t)); return True


class FakeRouter:
    def __init__(self, replies): self.replies = list(replies)
    def complete(self, messages, **kw): return self.replies.pop(0)


def tree(pkg="com.android.settings", **kw):
    node = {"class": "Button", "text": "Wi-Fi", "clickable": True, "center": [100, 200], "children": []}
    node.update(kw)
    return {"package": pkg, "children": [node]}


def run(replies, trees, **kw):
    out = agent.run_goal("[]", "test goal", BASE, bridge=FakeBridge(trees), rtr=FakeRouter(replies),
                         step_delay=0, **kw)
    return json.loads(out)


# ---------- agent loop ----------
b = FakeBridge([tree()])
res = json.loads(agent.run_goal("[]", "g", BASE, bridge=b, step_delay=0,
                                rtr=FakeRouter(['{"action":"tap","x":100,"y":200,"reason":"wifi"}',
                                                '{"action":"done","reason":"ok"}'])))
check("tap then done", res["ok"] and ("tap", 100, 200) in b.calls)
check("blocked package halts", "sensitive app" in run(['{"action":"done"}'], [tree("com.mybank.app")])["outcome"])
b = FakeBridge([tree(agent.OWN_PACKAGE)])
agent.run_goal("[]", "g", BASE, bridge=b, step_delay=0,
               rtr=FakeRouter(['{"action":"tap","x":1,"y":1}', '{"action":"done"}']))
check("never taps inside own app", ("tap", 1, 1) not in b.calls)
b = FakeBridge([tree(children=[], password=True, focused=True, clickable=False, editable=True)])
agent.run_goal("[]", "g", BASE, bridge=b, step_delay=0,
               rtr=FakeRouter(['{"action":"type","text":"hunter2"}', '{"action":"done"}']))
check("refuses typing into password field", not any(c[0] == "type" for c in b.calls))
check("invalid replies abort",
      "invalid" in run(["nonsense", "nonsense", "nonsense"], [tree()])["outcome"])
check("loop detection", "stuck" in run(['{"action":"tap","x":5,"y":5}'] * 5, [tree()])["outcome"])
check("step limit", "limit" in run(['{"action":"back"}', '{"action":"home"}'], [tree()], max_steps=2)["outcome"])
check("accessibility off",
      "not enabled" in json.loads(agent.run_goal("[]", "g", BASE, bridge=FakeBridge([tree()], False),
                                                 rtr=FakeRouter([]), step_delay=0))["outcome"])
try:
    agent.parse_action('{"action":"run_tool","module":"os","func":"system"}')
    check("run_tool rejects non-dyn module", False)
except ValueError:
    check("run_tool rejects non-dyn module", True)
try:
    agent.parse_action('{"action":"tap","x":-5,"y":3}')
    check("coordinate range enforced", False)
except ValueError:
    check("coordinate range enforced", True)

# redaction
agent._set_secrets([{"api_key": "sk-supersecret-123456"}])
check("redacts keys", "sk-supersecret" not in agent.redact("error with sk-supersecret-123456 inside"))

# ---------- router ----------
calls = []


class Resp:
    def __init__(self, code, body=None): self.status_code, self._b = code, body or {}
    def json(self): return self._b
    def raise_for_status(self):
        if self.status_code >= 400: raise router.requests.RequestException("http %d" % self.status_code)


def fake_post(url, headers=None, json=None, timeout=None):
    calls.append((url, json.get("response_format")))
    if "a.example" in url: return Resp(429)
    if "b.example" in url and json.get("response_format"): return Resp(400)
    return Resp(200, {"choices": [{"message": {"content": "hi"}}]})


router.requests.post = fake_post
rt = router.Router([
    {"name": "a#1", "base_url": "https://a.example/v1", "api_key": "k1", "model": "m"},
    {"name": "b#1", "base_url": "https://b.example/v1", "api_key": "k2", "model": "m"},
    {"name": "none", "base_url": "https://c.example/v1", "api_key": "", "model": "m"},
])
check("rotates on 429 and retries without json_mode on 400",
      rt.complete([{"role": "user", "content": "x"}], json_mode=True) == "hi" and rt.last_provider == "b#1")
check("keyless entries are usable",
      router.Router([{"name": "ollama", "base_url": "http://127.0.0.1:11434/v1", "api_key": "",
                      "model": "m", "keyless": True}]).complete([{"role": "user", "content": "x"}]) == "hi")
check("unkeyed non-keyless entry skipped", not rt._usable(2))

tp = json.loads(agent.test_provider(json.dumps(
    [{"name": "b#1", "base_url": "https://b.example/v1", "api_key": "k2", "model": "m"}])))
check("test_provider ok", tp["ok"])

# ---------- orchestrator ----------
class Gen:
    def __init__(self, r): self.r = list(r)
    def complete(self, m, **k): return self.r.pop(0)
    def complete_json(self, m, **k): return {"approved": True}


g = Gen(["def run():\n    return 1\ndef selftest():\n    assert run() == 2\n",
         "def run():\n    return 2\ndef selftest():\n    assert run() == 2\n"])
res = orchestrator.Orchestrator(g).generate_module("fixme.py", "return 2")
check("orchestrator self-corrects via sandbox feedback", res["ok"] and res["rounds"] == 2)

print("\nAll %d checks passed." % passed)
