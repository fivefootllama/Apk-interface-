"""Example tool: audit the on-screen accessibility tree for basic WCAG / leak issues.

Seed example (not auto-loaded). Checks touch-target size, missing content
descriptions on icon buttons, and plaintext API keys visible on screen.
Adapted from a tool contributed by a second AI-built version of this project;
ported here to call this project's SystemBridgeService.getScreenTreeJson().
"""
import json

from com.example.container import SystemBridgeService  # type: ignore

Bridge = SystemBridgeService.Companion

SENSITIVE_KEY_PATTERNS = ["sk-ant-", "aizasy", "gsk_", "sk-or-", "bearer "]
MIN_TOUCH_TARGET_PX = 48  # approximate; bounds here are px, not dp


def audit_node(node, report):
    if not isinstance(node, dict):
        return
    text = str(node.get("text", ""))
    desc = str(node.get("desc", ""))
    bounds = node.get("bounds") or [0, 0, 0, 0]
    width, height = (bounds[2] - bounds[0]), (bounds[3] - bounds[1])

    combined = (text + " " + desc).lower()
    for pattern in SENSITIVE_KEY_PATTERNS:
        if pattern in combined:
            report["credential_leaks"].append({"pattern": pattern, "snippet": combined[:40]})

    if node.get("clickable"):
        if 0 < width < MIN_TOUCH_TARGET_PX or 0 < height < MIN_TOUCH_TARGET_PX:
            report["touch_target_issues"].append({"dims": [width, height]})
        if not text.strip() and not desc.strip():
            report["missing_labels"].append({"class": node.get("class", "")})

    for child in node.get("children", []):
        audit_node(child, report)


def run():
    tree = json.loads(Bridge.getScreenTreeJson())
    if "error" in tree:
        return {"status": "error", "message": tree["error"]}

    report = {"credential_leaks": [], "touch_target_issues": [], "missing_labels": []}
    audit_node(tree, report)
    score = max(0, 100 - len(report["credential_leaks"]) * 35
                - len(report["missing_labels"]) * 5 - len(report["touch_target_issues"]) * 3)
    return {"status": "success", "score": score, "findings": report}


def selftest():
    report = {"credential_leaks": [], "touch_target_issues": [], "missing_labels": []}
    audit_node({"text": "sk-ant-abc123", "children": []}, report)
    assert report["credential_leaks"]
    report2 = {"credential_leaks": [], "touch_target_issues": [], "missing_labels": []}
    audit_node({"clickable": True, "text": "", "desc": "", "bounds": [0, 0, 10, 10], "children": []}, report2)
    assert report2["missing_labels"] and report2["touch_target_issues"]


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
