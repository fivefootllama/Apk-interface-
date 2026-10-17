"""
Suggestion 1: YouTube Skip Ad Automation Module
Location: context.filesDir/actions/action_skip_ad.py

Production module that dynamically inspects the active window Accessibility tree,
identifies the "skip_ad_button" view node or text containing "Skip Ad", computes
its exact center coordinates, and dispatches a programmatic click gesture via
SystemBridgeService.
"""

import json
import logging
from typing import Dict, Any, Optional, Tuple
from com.selfevolving.container import SystemBridgeService  # type: ignore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ActionSkipAd")


def find_skip_ad_node(node: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Recursively traverses the Accessibility node hierarchy to locate the Skip Ad button.
    Matches viewIdResourceName containing 'skip_ad' or text containing 'Skip'.
    """
    if not isinstance(node, dict):
        return None

    view_id = str(node.get("viewIdResourceName", "")).lower()
    text = str(node.get("text", "")).lower()
    content_desc = str(node.get("contentDescription", "")).lower()

    if ("skip_ad" in view_id or "skip ad" in text or "skip" in text or "skip" in content_desc):
        if node.get("visibleToUser", True):
            return node

    for child in node.get("children", []):
        found = find_skip_ad_node(child)
        if found is not None:
            return found

    return None


def calculate_click_coordinates(node: Dict[str, Any]) -> Tuple[float, float]:
    """
    Computes screen center click coordinates (centerX, centerY) from the node bounds.
    """
    bounds = node.get("bounds", {})
    center_x = float(bounds.get("centerX", 0.0))
    center_y = float(bounds.get("centerY", 0.0))

    if center_x == 0.0 and center_y == 0.0:
        left = float(bounds.get("left", 0.0))
        right = float(bounds.get("right", 0.0))
        top = float(bounds.get("top", 0.0))
        bottom = float(bounds.get("bottom", 0.0))
        center_x = (left + right) / 2.0
        center_y = (top + bottom) / 2.0

    return center_x, center_y


def main() -> Dict[str, Any]:
    """
    Main entrypoint executed by DynamicModuleLoader:
    1. Dumps active screen hierarchy JSON
    2. Identifies target Skip Ad node
    3. Dispatches synchronous click gesture
    4. Returns structured execution payload
    """
    logger.info("Executing YouTube Skip Ad automation...")

    try:
        raw_hierarchy = SystemBridgeService.getScreenHierarchyJson()
        parsed = json.loads(raw_hierarchy)

        if parsed.get("status") != "success":
            return {
                "status": "error",
                "message": f"Hierarchy dump failed: {parsed.get('message')}"
            }

        tree_root = parsed.get("tree", {})
        target_node = find_skip_ad_node(tree_root)

        if not target_node:
            logger.info("No visible Skip Ad button found on current screen.")
            return {
                "status": "skipped",
                "reason": "Skip Ad button is not present or visible in active window",
                "package": parsed.get("packageName")
            }

        click_x, click_y = calculate_click_coordinates(target_node)
        logger.info(f"Target located at ({click_x}, {click_y}). Dispatching gesture click...")

        click_success = SystemBridgeService.dispatchClick(click_x, click_y)

        return {
            "status": "success",
            "action": "SKIP_AD_DISPATCHED",
            "coordinates": {"x": click_x, "y": click_y},
            "dispatched": click_success,
            "target_view_id": target_node.get("viewIdResourceName"),
            "target_text": target_node.get("text")
        }

    except Exception as exc:
        logger.error(f"Failed to execute Skip Ad action: {exc}")
        return {
            "status": "error",
            "error_type": type(exc).__name__,
            "message": str(exc)
        }


if __name__ == "__main__":
    result = main()
    print(json.dumps(result, indent=2))
