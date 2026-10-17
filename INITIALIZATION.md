# Self-Evolving Android Container APK (v2.5.0-PROD)
## Autonomous AI Agent Initialization, Environment Probing & Extensibility Specification

---

## 1. What This APK Is

The **Self-Evolving Android Container** is an autonomous runtime container designed to run natively on Android devices (API Level 26–35+, Android 8.0 through Android 15). It serves as a unified body, nervous system, and action substrate for advanced AI models (such as Gemini 2.5 Flash, Claude 3.7 Sonnet, Grok 2, OpenAI GPT-4o, and DeepSeek R1).

Unlike standard Android applications that merely display UI to a human, this APK operates as an **actuation organism**:
1. **Eyes (Perception Engine):** Continuously ingests the Android Accessibility Virtual Node Hierarchy (`AccessibilityNodeInfo`) and high-frame-rate screen capture buffers (`MediaProjection` / `SurfaceView` at 60 FPS) to perceive on-screen text, buttons, coordinates, and visual bounds.
2. **Brain (Multi-Model Orchestrator & Router):** Directs inbound user intent or scheduled triggers through an encrypted, failover-resilient multi-model arbitration loop.
3. **Hands (Hardware Actuator):** Dispatches sub-10ms native touch gestures (`dispatchGesture`), multi-point swipes, taps, hardware key presses (Home, Back, Recents), and text insertions directly into the Android window manager.
4. **Execution Engine (Chaquopy 15.0 Python Subsystem):** An on-device CPython runtime running alongside the Android ART (Android Runtime), empowering AI models to synthesize, evaluate in a sandbox, and execute Python scripts that directly invoke Java/Kotlin Android APIs.
5. **Memory & Persistence:** Hardware-backed cryptographic storage via `AndroidKeyStore` (`AES-256-GCM`), paired with cloud audit pipelines to Google Workspace (Drive, Sheets, and Apps Script).

---

## 2. Model Initial Environment Probing Routine

When an AI model is mounted into the container, it must perform an initial environment probe to determine its sensory boundaries, privilege levels, and system health before attempting actuation.

### The 6-Step Initial Probe Sequence

```
       +-----------------------------------------------------------+
       |   STEP 1: PERMISSION & RUNTIME PROBE                     |
       |   - Check Root status (UID == 0 or su binary available)   |
       |   - Query Android Manifest granted permissions            |
       +-----------------------------+-----------------------------+
                                     |
       +-----------------------------v-----------------------------+
       |   STEP 2: PERCEPTION (EYES) PROBE                         |
       |   - Verify AccessibilityEvent stream active               |
       |   - Request active window root node hierarchy JSON        |
       |   - Benchmark screen resolution & DPI (1080x2400 @ 420dpi)|
       +-----------------------------+-----------------------------+
                                     |
       +-----------------------------v-----------------------------+
       |   STEP 3: ACTUATION (HANDS) PROBE                         |
       |   - Test dispatchGesture stroke latency (target < 10ms)   |
       |   - Verify accessibility global actions (Home, Back)      |
       +-----------------------------+-----------------------------+
                                     |
       +-----------------------------v-----------------------------+
       |   STEP 4: SCRIPTING RUNTIME (CHAQUOPY) PROBE              |
       |   - Test Python sys.version and available C extensions    |
       |   - Verify isolated memory heap & AST sanitizer           |
       |   - Confirm PyObject <-> Java object dynamic bridge       |
       +-----------------------------+-----------------------------+
                                     |
       +-----------------------------v-----------------------------+
       |   STEP 5: EXTERNAL WORLD & EGRESS PROBE                   |
       |   - Check network interfaces (wlan0, rmnet0)              |
       |   - Validate Google Workspace OAuth & token cache         |
       |   - Probe cloud endpoints and model failover latency      |
       +-----------------------------+-----------------------------+
                                     |
       +-----------------------------v-----------------------------+
       |   STEP 6: OPERATOR LAWS VERIFICATION                      |
       |   - Read immutable mandates via /Laws View                |
       |   - Confirm read-only status (locked out of mutations)    |
       +-----------------------------------------------------------+
```

### Initial Probing Script (Python via Chaquopy)

Any model can run the following probe script through Chaquopy to extract complete environment telemetry:

```python
import sys
import os
import json
from java import jclass

def probe_environment():
    telemetry = {
        "python_version": sys.version,
        "platform": sys.platform,
        "process_uid": os.getuid() if hasattr(os, "getuid") else "N/A",
        "is_rooted": False,
        "permissions": {},
        "display": {},
        "services": {}
    }
    
    # 1. Probe Root Status
    su_paths = ["/system/bin/su", "/system/xbin/su", "/sbin/su", "/vendor/bin/su"]
    telemetry["is_rooted"] = any(os.path.exists(p) for p in su_paths) or telemetry["process_uid"] == 0
    
    # 2. Bridge to Android SystemBridgeService
    try:
        SystemBridge = jclass("com.selfevolving.container.SystemBridgeService")
        bridge_instance = SystemBridge.getInstance()
        
        telemetry["services"]["accessibility_connected"] = bridge_instance.isAccessibilityConnected()
        telemetry["services"]["screen_capture_ready"] = bridge_instance.isScreenCaptureAvailable()
        telemetry["display"]["width"] = bridge_instance.getScreenWidth()
        telemetry["display"]["height"] = bridge_instance.getScreenHeight()
        telemetry["display"]["density_dpi"] = bridge_instance.getScreenDpi()
        
        # Probe active window title
        telemetry["current_foreground_app"] = bridge_instance.getForegroundPackageName()
    except Exception as e:
        telemetry["services"]["bridge_error"] = str(e)
        
    return json.dumps(telemetry, indent=2)

print(probe_environment())
```

---

## 3. Capabilities: Probing & Acting Within the APK

Within the APK's boundaries, models have complete programmatic inspection and execution rights:

1. **Hierarchy Inspection:** Direct extraction of the UI tree as JSON, including class names (`android.widget.Button`, `android.widget.EditText`), resource IDs, text contents, clickable states, and screen bounding rectangles `Rect(left, top, right, bottom)`.
2. **Dynamic Module Synthesis:** Models can draft new Python scripts dynamically, save them to the container's isolated `/modules` directory, and hot-load them without restarting the app.
3. **AST Security Auditing:** Every synthesized script is pre-screened through an AST (Abstract Syntax Tree) visitor that rejects unsafe calls (`eval`, `exec`, arbitrary native memory overwrites, or attempts to touch the Law Enforcement engine).
4. **Hardware KeyVault Access:** Models can request encrypted API credentials using the Android Keystore MasterKey (`AES-256-GCM`) to rotate providers or authenticate against external endpoints.
5. **Multi-Model Peer Review:** Generator models submit proposed scripts to Critic models (e.g., Claude 3.7 or DeepSeek R1) for formal verification and safety grading before dispatch.

---

## 4. Capabilities: Probing & Acting Outside the APK (The Real World)

Through Android's Accessibility Subsystem, Notification Listener, MediaProjection, and Network stack, the models can interact with any app and device feature on the phone:

1. **Cross-App Automation:**
   - **YouTube:** Detecting and clicking "Skip Ad" buttons in under 80ms.
   - **2FA & Banking:** Detecting incoming SMS verification codes via notification broadcasts, extracting 6-digit OTPs with regex, and auto-filling them into login screens or logging them to Google Sheets.
   - **Arcade & Real-Time Games:** Ingesting 60FPS SurfaceView frames and dispatching sub-10ms taps/swipes to autonomously play fast-paced arcade games (e.g., CyberRunner 2088).
2. **External Google Workspace Synchronization:**
   - Cloud audit logging directly into user Google Spreadsheets.
   - Automatic screen artifact uploads and diagnostic log archival into Google Drive partitions.
   - Triggering custom Google Apps Script automation webhooks.
3. **System Settings & Shell (Rooted Mode):**
   - On rooted devices, models can leverage `su` to execute shell commands (`pm grant`, `input keyevent`, `settings put global`, `iptables`), reconfigure network interfaces, or inspect background daemons.
   - On non-rooted devices, models operate cleanly within high-tier standard permissions (`ACCESSIBILITY_SERVICE`, `POST_NOTIFICATIONS`, `READ_MEDIA`, `FOREGROUND_SERVICE`).

---

## 5. Python Scripting Engine (Chaquopy Runtime)

Chaquopy embeds a full CPython 3.10+ engine into the APK's native library path (`libchaquopy.so`).

### How Models Write Scripts to Magnify Their Powers

Models are not restricted to predefined functions. When confronted with an unknown application or complex task, an AI model can:
1. Dump the current window node hierarchy.
2. Formulate a custom Python algorithm to parse nested nodes or match text fuzzy patterns.
3. Dispatch gestures or batch network calls using the Java bridge.
4. Return structured JSON summaries back to the orchestrator.

#### Example: Autonomous Element Hunter & Clicker
```python
from com.selfevolving.container import SystemBridgeService
import json

def click_element_by_text(target_text: str):
    bridge = SystemBridgeService.getInstance()
    raw_tree = bridge.dumpHierarchyJson()
    tree = json.loads(raw_tree)
    
    def search_node(node):
        if target_text.lower() in node.get("text", "").lower():
            bounds = node["bounds"]
            cx = (bounds["left"] + bounds["right"]) // 2
            cy = (bounds["top"] + bounds["bottom"]) // 2
            return (cx, cy)
        for child in node.get("children", []):
            res = search_node(child)
            if res:
                return res
        return None

    coords = search_node(tree)
    if coords:
        bridge.dispatchClick(coords[0], coords[1])
        return {"status": "SUCCESS", "coords": coords}
    return {"status": "NOT_FOUND"}
```

---

## 6. Immutable Human Operator Laws & Absolute Lockout

### The Core Architectural Mandate
The AI models inside this APK are powerful, autonomous, and self-evolving. To guarantee safety and user sovereignty, the container enforces a **Hardware-Enforced Cryptographic Lockout** regarding system laws:

1. **Human Operator Supremacy:** Only the verified human operator (holding touch authentication / MasterKey signature) can create new laws (`/Laws New`) or modify existing laws (`/Laws Edit`).
2. **Strict Model Read-Only Enforcement:** AI models, autonomous worker loops, and automated scripts are granted strictly `/Laws View` access.
3. **Anti-Circumvention Kernel Guard:**
   - Any attempt by an AI model, Python script, or simulated accessibility touch event to invoke `/Laws New` or `/Laws Edit` triggers an immediate **HARDWARE_ROOT_ISOLATION_VIOLATION** and is rejected.
   - Simulated accessibility gestures targeting law modification UI inputs are intercepted and blocked at the Java `AccessibilityService` level.
   - Python sandbox AST inspection halts and purges any script attempting to read or write the private `/data/system/laws.keystore` partition.

---

## 7. Chat Slash Commands Reference

| Command | Allowed Caller | Function |
|:---|:---:|:---|
| `/Initialization` | Human Operator OR AI Model | Renders this complete specification and probing manual into the active agent context. |
| `/Laws View` | Human Operator AND AI Model | Displays all active invariable human operator mandates, law IDs, and cryptographic hashes. |
| `/Laws New [Title] :: [Content]` | **Human Operator ONLY** | Registers a new immutable mandate. Blocked for AI agents & automated scripts. |
| `/Laws Edit [ID] :: [New Content]` | **Human Operator ONLY** | Updates an existing mandate. Blocked for AI agents & automated scripts. |

---
*Self-Evolving Android Container · Chaquopy 15.0 · AndroidKeyStore AES-256 · Certified Production Specification*
