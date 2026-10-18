"""Example action: find and tap a "Skip Ad" button on screen.

Seed example (not auto-loaded). Copy into the app's actions/ directory, or have
the generator produce something like it, to promote it through the sandbox.
Adapted from a tool contributed by a second AI-built version of this project
(originally against a differently-named bridge); ported here to call this
project's SystemBridgeService.getScreenTreeJson() / tap().
"""
import json

from com.example.container import SystemBridgeService  # type: ignore

Bridge = SystemBridgeService.Companion


def find_skip_ad_node(node):
    if not isinstance(node, dict):
        return None
    view_id = str(node.get("id", "")).lower()
    text = str(node.get("text", "")).lower()
    desc = str(node.get("desc", "")).lower()
    if "skip_ad" in view_id or "skip" in text or "skip" in desc:
        if node.get("clickable"):
            return node
    for child in node.get("children", []):
        found = find_skip_ad_node(child)
        if found is not None:
            return found
    return None


def run():
    tree = json.loads(Bridge.getScreenTreeJson())
    if "error" in tree:
        return {"status": "error", "message": tree["error"]}

    target = find_skip_ad_node(tree)
    if target is None:
        return {"status": "skipped", "reason": "no Skip Ad button visible"}

    cx, cy = target.get("center", [0, 0])[:2]
    dispatched = bool(Bridge.tap(int(cx), int(cy)))
    return {"status": "success" if dispatched else "error", "x": cx, "y": cy, "dispatched": dispatched}


def selftest():
    # No live screen in the sandbox test run; just prove the tree walker handles
    # a missing-button case without crashing.
    assert find_skip_ad_node({"children": []}) is None
    sample = {"children": [{"clickable": True, "text": "Skip Ad", "children": []}]}
    assert find_skip_ad_node(sample) is not None


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
