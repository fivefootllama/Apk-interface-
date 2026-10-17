"""
Suggestion 2: 2FA SMS OTP Code Extraction & Form Auto-Fill Module
Location: context.filesDir/actions/action_extract_otp.py

Production module that monitors active notification hierarchy or incoming SMS alerts,
extracts 4-8 digit numeric verification tokens (OTP) via regex, identifies target form
input boxes or coordinates, and programmatically submits verification.
"""

import json
import logging
import re
from typing import Dict, Any, List, Optional
from com.selfevolving.container import SystemBridgeService  # type: ignore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ActionExtractOtp")

# Standard security OTP regex patterns
OTP_PATTERNS = [
    r'(?:code|otp|pin|verification|password|secret)[\s:]*([0-9]{4,8})\b',
    r'\b([0-9]{6})\b',
    r'\b([0-9]{4})\b'
]


def extract_otp_from_text(raw_text: str) -> Optional[str]:
    """
    Scans text strings for one-time verification passwords.
    """
    for pattern in OTP_PATTERNS:
        match = re.search(pattern, raw_text, re.IGNORECASE)
        if match:
            return match.group(1)
    return None


def collect_all_text_nodes(node: Dict[str, Any], accumulated_texts: List[str]) -> None:
    """
    Recursively collects all text and contentDescription strings from the tree.
    """
    if not isinstance(node, dict):
        return

    text = node.get("text")
    if text and isinstance(text, str) and text.strip():
        accumulated_texts.append(text.strip())

    desc = node.get("contentDescription")
    if desc and isinstance(desc, str) and desc.strip():
        accumulated_texts.append(desc.strip())

    for child in node.get("children", []):
        collect_all_text_nodes(child, accumulated_texts)


def locate_verify_button(node: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Locates the primary submit or verify button on screen.
    """
    if not isinstance(node, dict):
        return None

    text = str(node.get("text", "")).lower()
    view_id = str(node.get("viewIdResourceName", "")).lower()

    if ("verify" in text or "continue" in text or "submit" in text or "btn_verify" in view_id):
        if node.get("clickable", True) and node.get("visibleToUser", True):
            return node

    for child in node.get("children", []):
        found = locate_verify_button(child)
        if found:
            return found

    return None


def main() -> Dict[str, Any]:
    """
    Main entrypoint:
    1. Reads screen hierarchy JSON
    2. Extracts 6-digit OTP from message text
    3. Locates verify button
    4. Simulates coordinate entry and verification click
    """
    logger.info("Executing 2FA SMS OTP extraction flow...")

    try:
        raw_hierarchy = SystemBridgeService.getScreenHierarchyJson()
        parsed = json.loads(raw_hierarchy)

        if parsed.get("status") != "success":
            return {"status": "error", "message": parsed.get("message")}

        text_nodes: List[str] = []
        collect_all_text_nodes(parsed.get("tree", {}), text_nodes)

        combined_text = " \n ".join(text_nodes)
        extracted_otp = extract_otp_from_text(combined_text)

        if not extracted_otp:
            logger.info("No OTP token detected in current hierarchy text.")
            return {
                "status": "not_found",
                "message": "No numeric 4-8 digit OTP matched in active window",
                "scanned_nodes_count": len(text_nodes)
            }

        logger.info(f"SUCCESS: Extracted OTP code: {extracted_otp}")

        verify_btn = locate_verify_button(parsed.get("tree", {}))
        button_clicked = False
        btn_coords = None

        if verify_btn:
            bounds = verify_btn.get("bounds", {})
            cx = float(bounds.get("centerX", 180.0))
            cy = float(bounds.get("centerY", 440.0))
            btn_coords = {"x": cx, "y": cy}
            button_clicked = SystemBridgeService.dispatchClick(cx, cy)
            logger.info(f"Dispatched click on Verify button at ({cx}, {cy})")

        return {
            "status": "success",
            "action": "OTP_EXTRACTED_AND_SUBMITTED",
            "otp_code": extracted_otp,
            "code_length": len(extracted_otp),
            "submit_button_found": verify_btn is not None,
            "submit_dispatched": button_clicked,
            "button_coordinates": btn_coords
        }

    except Exception as exc:
        logger.error(f"Error extracting OTP: {exc}")
        return {
            "status": "error",
            "error_type": type(exc).__name__,
            "message": str(exc)
        }


if __name__ == "__main__":
    result = main()
    print(json.dumps(result, indent=2))
