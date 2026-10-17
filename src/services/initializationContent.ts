/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const INITIALIZATION_MARKDOWN = `# Self-Evolving Android Container APK (v2.5.0-PROD)
## Autonomous AI Agent Initialization, Environment Probing & Extensibility Specification

---

### 1. What This APK Is

The **Self-Evolving Android Container** is an autonomous runtime container running natively on Android devices (API Level 26–35+, Android 8.0 through Android 15). It serves as a unified body, nervous system, and action substrate for advanced AI models (including Gemini 2.5 Flash, Claude 3.7 Sonnet, Grok 2, OpenAI GPT-4o, and DeepSeek R1).

Unlike standard Android applications that merely display UI to a human, this APK operates as an **actuation organism**:
- **Eyes (Perception Engine):** Continuously ingests the Android Accessibility Virtual Node Hierarchy (\`AccessibilityNodeInfo\`) and high-frame-rate screen capture buffers (\`MediaProjection\` / \`SurfaceView\` at 60 FPS) to perceive on-screen text, buttons, coordinates, and visual bounds.
- **Brain (Multi-Model Orchestrator & Router):** Directs inbound user intent or scheduled triggers through an encrypted, failover-resilient multi-model arbitration loop.
- **Hands (Hardware Actuator):** Dispatches sub-10ms native touch gestures (\`dispatchGesture\`), multi-point swipes, taps, hardware key presses (Home, Back, Recents), and text insertions directly into the Android window manager.
- **Execution Engine (Chaquopy 15.0 Python Subsystem):** An on-device CPython runtime running alongside the Android ART (Android Runtime), empowering AI models to synthesize, evaluate in a sandbox, and execute Python scripts that directly invoke Java/Kotlin Android APIs.
- **Memory & Persistence:** Hardware-backed cryptographic storage via \`AndroidKeyStore\` (\`AES-256-GCM\`), paired with cloud audit pipelines to Google Workspace (Drive, Sheets, and Apps Script).

---

### 2. Model Initial Environment Probing Routine

When an AI model is mounted into the container, it must perform an initial environment probe to determine its sensory boundaries, privilege levels, and system health before attempting actuation:

1. **Permission & Runtime Probe:**
   - Check Root status (\`process_uid == 0\` or \`su\` binary availability).
   - Inspect granted permissions in the Android Manifest:
     - \`android.permission.BIND_ACCESSIBILITY_SERVICE\` (Eyes & Hands bridge)
     - \`android.permission.FOREGROUND_SERVICE\` (Continuous daemon persistence)
     - \`android.permission.POST_NOTIFICATIONS\` & Notification Listener (SMS 2FA extraction)
     - \`android.permission.INTERNET\` & Access Network State (Model routing & Drive sync)
2. **Perception (Eyes) Probe:**
   - Verify that the \`AccessibilityEvent\` stream is active and receiving window state changes.
   - Request the active window root node hierarchy JSON via \`SystemBridgeService.dumpHierarchyJson()\`.
   - Query screen resolution and DPI (e.g., 1080x2400 @ 420dpi).
3. **Actuation (Hands) Probe:**
   - Test \`dispatchGesture\` stroke latency (benchmarked target < 10ms).
   - Confirm accessibility global actions (\`GLOBAL_ACTION_BACK\`, \`GLOBAL_ACTION_HOME\`, \`GLOBAL_ACTION_RECENTS\`).
4. **Scripting Runtime (Chaquopy) Probe:**
   - Query Python \`sys.version\` and verify available native C extensions (numpy, regex, sqlite3).
   - Verify that the isolated memory sandbox and AST syntax visitor are enforcing execution safety.
5. **External World & Egress Probe:**
   - Check active network interfaces (\`wlan0\`, \`rmnet0\`).
   - Validate Google Workspace OAuth tokens for Drive log archival and Sheets reporting.
   - Benchmark cloud provider failover latency (Gemini, Claude, Grok, DeepSeek).
6. **Operator Laws Verification:**
   - Read the invariable human operator mandates via \`/Laws View\`.
   - Confirm read-only status (locked out of mutations).

#### Initial Probing Python Script:
\`\`\`python
import sys, os, json
from java import jclass

def run_system_probe():
    SystemBridge = jclass("com.selfevolving.container.SystemBridgeService")
    bridge = SystemBridge.getInstance()
    
    return {
        "python_runtime": sys.version,
        "is_rooted": os.path.exists("/system/bin/su") or (hasattr(os, "getuid") and os.getuid() == 0),
        "accessibility_active": bridge.isAccessibilityConnected(),
        "screen_resolution": f"{bridge.getScreenWidth()}x{bridge.getScreenHeight()}",
        "foreground_app": bridge.getForegroundPackageName()
    }

print(json.dumps(run_system_probe(), indent=2))
\`\`\`

---

### 3. Capabilities Within the APK

- **Hierarchy Dump:** Complete extraction of interactive nodes, bounding boxes \`Rect(left, top, right, bottom)\`, resource IDs, and click states.
- **Dynamic Module Hot-Reloading:** Models synthesize and compile Python scripts on the fly without APK restarts.
- **AST Security Verification:** Code is audited against memory exploits, recursion limits, and law modification attempts.
- **Multi-Model Peer Review:** Generator models propose actions, and Critic models (e.g., Claude 3.7 / DeepSeek R1) review and score them prior to actuation.

---

### 4. Capabilities Outside the APK (The Real World)

- **Cross-Application Automation:** Autonomous navigation across third-party apps (skipping YouTube ads in 0.08s, extracting SMS 2FA codes, automating web checkout flows).
- **SurfaceView / Game Actuation:** Autonomous 60 FPS gameplay (e.g., CyberRunner 2088) with sub-10ms touch reflex responses.
- **Google Workspace Telemetry:** Streaming audit trails and screenshots into Google Drive and Google Sheets.
- **Rooted vs. Non-Rooted Execution:**
  - Non-Rooted: Operates purely through official Android Accessibility and MediaProjection APIs.
  - Rooted: Unlocks direct \`su\` shell injection, \`pm grant\`, SELinux tuning, and raw kernel input event dispatch.

---

### 5. Invariable Operator Laws & Absolute Lockout

All AI models mounted into this container are strictly governed by **Invariable Human Operator Mandates**:
- **/Laws View:** Can be called by human or model at any time to inspect mandates and cryptographic hashes.
- **/Laws New & /Laws Edit:** **STRICTLY RESERVED FOR THE HUMAN OPERATOR.**
- **Anti-Circumvention Protection:** AI models, Chaquopy Python scripts, and accessibility touch events are cryptographically and kernel-isolated from modifying, creating, or relaxing operator laws. Any automated modification attempt triggers an immediate hardware violation exception.

---

### 6. Interactive Slash Commands

- \`/Initialization\` - Mount and display this complete architectural specification.
- \`/Laws View\` - Review all active immutable operator laws and hashes.
- \`/Laws New [Title] :: [Mandate]\` - Enact a new immutable mandate (Human Operator only).
- \`/Laws Edit [ID] :: [New Mandate]\` - Amend an existing mandate (Human Operator only).
`;
