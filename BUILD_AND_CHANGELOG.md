# BUILD_AND_CHANGELOG.md

This file documents the code changes, build issues, branch strategy, and next-step recommendations for the Android/Kotlin build and the collaborative repo workflow. It also contains a living spec and task list for the model orchestration and accessibility work so models (and engineers) can pick up work from this document.

---

## Summary of actions taken

1. Investigated the failed GitHub Actions run for the claude-container Android project.
2. Confirmed the build failure was caused by a Kotlin compile error in the Android accessibility bridge.
3. Identified the root blocker as a duplicate/conflicting `typeText` declaration in `SystemBridgeService`.
4. Updated the branch changelog to capture the build issue, CI impact, and the fix pattern.
5. Applied the fix pattern to the working branch: a single canonical instance method (`performTypeText`) and a single static bridge (`typeText`).

---

## Root cause summary

The failing workflow run was:
- https://github.com/fivefootllama/Apk-interface-/actions/runs/39062491277

The key findings were:
- Python tests passed.
- Gradle failed during `:app:compileDebugKotlin`.
- The compiler reported a duplicate/conflicting `typeText` declaration in `com.example.container.SystemBridgeService`.
- Because the Kotlin compile failed, no APK was produced.
- The upload-artifact step then failed because the APK output path was empty.

This means the actual blocker was in the Android source, not the Python test harness.

---

## Code fix pattern used

The canonical pattern is:

```kotlin
fun performTypeText(text: String): Boolean {
    val root = rootInActiveWindow ?: return false
    val focused = root.findFocus(AccessibilityNodeInfo.FOCUS_INPUT) ?: return false
    val args = android.os.Bundle().apply {
        putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text)
    }
    return focused.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args)
}

companion object {
    @JvmStatic
    fun typeText(text: String): Boolean =
        instance?.performTypeText(text) ?: false
}
```

This keeps exactly one source-of-truth method for text entry and avoids the Kotlin duplicate symbol problem.

---

## Issues identified

1) Android/Kotlin compile failure blocks the APK build
- Status: Confirmed
- Impact: `:app:compileDebugKotlin` failed; no APK was produced.

2) Duplicate/conflicting Kotlin declaration in `SystemBridgeService`
- Status: Confirmed
- Impact: Kotlin compiler aborted due to duplicate/conflicting `typeText` API surface.

3) No APK artifact generated
- Status: Confirmed
- Impact: artifact step failed because `claude-container/app/build/outputs/apk/debug/*.apk` did not exist.

4) Python tests passing did not validate Android build health
- Status: Confirmed
- Impact: Python success masked an Android compile failure.

5) Repo structure confusion between Android subprojects
- Status: Confirmed
- Impact: both `android-container/` and `claude-container/` exist; CI specifically targets `claude-container`.

6) Collaborative branch workflow requires coordination
- Status: Confirmed
- Impact: both the `claude-merge` branch and the AI-studio path may need the same fix applied and propagated to remain synced.

---

## Work completed

### Branch state
- Working fix branch created: `fix/claude-container-kotlin-build`
- Updated file: `claude-container/app/src/main/java/com/example/container/SystemBridgeService.kt`
- Updated file: `BUILD_AND_CHANGELOG.md`

### Documentation added
- This file now records:
  - the root-build issue
  - the failing workflow URL
  - the Kotlin symbol conflict
  - the fix pattern applied
  - the next-step recommendations for branch propagation and verification

---

## Verification checklist

### Local validation command
```bash
cd claude-container
./gradlew assembleDebug --stacktrace
```

### Expected success criteria
- `BUILD SUCCESSFUL`
- APK exists under `app/build/outputs/apk/debug/`
- No duplicate Kotlin symbol errors around `typeText` or `SystemBridgeService`

### Failure criteria
- Kotlin compile error in `:app:compileDebugKotlin`
- duplicate declaration warnings/errors around `typeText`
- missing APK under `app/build/outputs/apk/debug/`

---

## Recommended next steps

1. Validate the fix locally in the claude-container project.
   - Command: `cd claude-container && ./gradlew assembleDebug --stacktrace`

2. If the local build succeeds, merge the fix branch into `claude-merge` first.
   - This matches the failing workflow target and is the lowest-risk validation path.

3. After the claude-container branch is green, propagate the same fix to the related AI-studio branch and then to `main` if that is the project-wide merge policy.

4. Re-run the workflow / CI after each propagation to ensure both versions remain synchronized and buildable.

5. Keep both Android variants (`claude-container` and the AI-studio app tree) aligned on the same source-of-truth bridge/API contract to avoid future duplicate-name regressions.

---

## Branch strategy note

The repo appears to be operating across multiple collaborative branches, and the actual failing CI is tied to `claude-container` on `claude-merge`.

This means the recommended order is:
- fix the failing `claude-container` build first
- verify it passes on `claude-merge`
- then propagate the same change to the parallel AI-studio branch and/or main if needed

This avoids cherry-picking a partial fix into the wrong app tree and keeps both versions consistent.

---

## PR / merge checklist

Before merging, include:
- failing run link
- root cause summary
- files changed
- validation command used
- result of validation
- note that Python tests are separate from Android build validation

Suggested PR title:
- `fix: resolve claude-container duplicate typeText Kotlin compile error`

Suggested PR description:
- Fixes the duplicate/conflicting `typeText` Kotlin API in `SystemBridgeService`
- Restores `:app:compileDebugKotlin` compatibility
- Allows APK generation and artifact upload to proceed
- References workflow run: https://github.com/fivefootllama/Apk-interface-/actions/runs/39062491277

---

## Risk / impact summary

- Risk: Low
- Impact: Restores Android compile and APK generation
- Scope: Limited to the accessibility bridge API and compile compatibility
- Behavior: No intended Python/runtime change beyond removing the duplicate Kotlin symbol conflict

---

## Definition of done

The fix is done when all of the following are true:
- `claude-container` builds successfully
- `./gradlew assembleDebug` succeeds
- the debug APK is generated
- CI workflow passes
- the fix is propagated appropriately across the branch topology

---

## Notes on branch coordination

This repo appears to include multiple collaborative branches, but the actual failing workflow is tied to the `claude-merge` branch and the `claude-container` app.

That means the first verification target should be:
- `claude-merge` with the fix applied and passing `assembleDebug`

Once that is green, the same fix can be propagated to the AI-studio branch and then to `main` if that is the canonical final integration branch.

---

## Model & Accessibility Implementation Tasks (for models + engineers)

This section lists concrete tasks models and engineers should be able to pick up and implement. Each task includes a goal, acceptance criteria, suggested implementation notes, and testing instructions.

1) Core accessibility bridge and onboarding (HIGH PRIORITY)
- Goal: Provide a spoken onboarding flow, allow enabling the accessibility service, and provide a voice-driven entry point for goals.
- Acceptance criteria:
  - On first run, the app speaks (via TTS) an onboarding message explaining that it needs Accessibility permission and how to enable it.
  - The app guides the user to Settings if the service is not enabled and speaks confirmations when enabled.
  - The user can issue a goal via voice and receive spoken confirmations and status updates.
- Implementation notes:
  - Use Android TextToSpeech for TTS and SpeechRecognizer for voice input.
  - Ensure all spoken strings are localizable (strings.xml entries).
  - Keep prompts short and clear; provide an option to repeat the last prompt.
- Tests:
  - Manual: enable TalkBack, run onboarding, confirm TTS prompts and navigation to Accessibility settings work.
  - Automated: add instrumentation test that checks for presence of accessibility-related flags or mock a TTS engine in unit tests.

2) TalkBack & content accessibility (HIGH PRIORITY)
- Goal: Ensure UI elements have contentDescription, logical focus order, and large actionable targets.
- Acceptance criteria:
  - Every visible button, interactive view, and important label has a non-empty contentDescription.
  - Focus order flows logically when swiping with TalkBack.
  - No important action requires precise small touch targets.
- Implementation notes:
  - Audit main UI files (MainActivity, KeysActivity, any generated tool UI) and add contentDescription to Buttons, ImageViews, and custom views.
  - Use ViewCompat.setAccessibilityDelegate when needed to adjust traversal or announcement.
- Tests:
  - Accessibility Test Framework checks and an Espresso test suite with accessibility checks enabled.

3) TTS / voice feedback for model output (CRITICAL)
- Goal: Any agent/model output relevant to the user must be spoken automatically (with user control to mute) and also available as text in the UI.
- Acceptance criteria:
  - Model output is queued to TTS and spoken in a readable order without truncation.
  - A visual log is maintained for sighted reviewers and for debugging.
  - User can pause/resume speech and set speech speed.
- Implementation notes:
  - Use a dedicated TTS queue manager to handle overlapping responses and interruptions.
  - Provide a short tone before speaking for context.
- Tests:
  - Manual tests with TalkBack and TTS settings; unit tests for TTS queue manager logic.

4) Multi-model router & coordination (HIGH PRIORITY)
- Goal: Implement a model router that can orchestrate 20–30 models/tools with priority, voting, and fallback logic.
- Acceptance criteria:
  - Models register with the router via a simple adapter interface.
  - The router can send a request (JSON) to a set of candidate models, collect responses, and select a final action by policy (highest confidence / weighted vote / fallback).
  - Router exposes metrics (latency, failures, confidence) to the app UI/log.
- Implementation notes:
  - Define a ModelAdapter interface (Python) with methods: prepare(request), run(request), getResult(), healthCheck().
  - Use asyncio for concurrent requests and apply per-model timeouts.
  - Policy examples: majority vote on discrete tool outputs; highest-confidence selection for scalar scores; summarizer to resolve textual conflicts.
- Tests:
  - Unit tests for router policy functions (voting, weighting, timeout behavior).
  - Integration tests running the router with mock models returning synthetic results.

5) Tool sandboxing & security model (CRITICAL)
- Goal: Tools and generated code must run in a sandbox (Python) with strict resource/time limits and no direct access to secrets.
- Acceptance criteria:
  - All generated tools are executed in an isolated environment with IO/time limits.
  - Keys and secrets are never written to disk unencrypted; only memory-passed ephemeral tokens are allowed.
- Implementation notes:
  - Continue using Chaquopy for Python, but ensure the Python side runs sandboxed scripts (time limits, syscalls restricted if possible).
  - Audit any Python call that uses shell access or file writes and add explicit allowlists.
- Tests:
  - Fuzz tests on tool runner with malicious payloads; measure that timeouts/limits trigger safely.

6) Logging, auditing & redaction (MEDIUM PRIORITY)
- Goal: Keep detailed logs for debugging while redacting sensitive material.
- Acceptance criteria:
  - Agent logs record timestamps, model identifiers, action types, and outcomes.
  - Any API key or secret-like token is redacted in logs.
- Implementation notes:
  - Use structured JSON logs written to files under the app's filesDir with rotation (e.g., last 10 files) and a drain endpoint that AgentRunner can expose.
- Tests:
  - Unit tests that ensure redact function removes known secret patterns.

7) CI and automated checks (MEDIUM PRIORITY)
- Goal: Add checks to CI that fail early for: Kotlin duplicate symbols, missing contentDescription, failing accessibility smoke tests, Gradle wrapper presence.
- Acceptance criteria:
  - PRs fail quickly when the Android project does not compile.
  - Accessibility linter issues are surfaced as warnings or failures depending on severity.
- Implementation notes:
  - Add an accessibility lint job using Android Lint and Accessibility Test Framework in GitHub Actions.
  - Ensure Gradle wrapper is present for both android-container and claude-container trees.
- Tests:
  - Run Android lint and unit tests in the workflow before packaging.

8) Privacy & consent flows (HIGH PRIORITY)
- Goal: Collect explicit user consent for data sharing with external models, telemetry, or cloud services.
- Acceptance criteria:
  - Before contacting any remote model or service, the app displays/reads a consent explanation and asks the user to opt in/out.
  - Audit logs record consent timestamps and scope.
- Implementation notes:
  - Add a ConsentActivity that reads the consent text via TTS and records the response.
  - Store consent state encrypted via EncryptedKeyManager or Android Keystore.
- Tests:
  - Manual acceptance testing with a blind user; unit test for consent state storage.

9) Model performance & fallback policies (HIGH PRIORITY)
- Goal: Provide sensible timeouts and fallback policies so user experience is robust under slow networks or offline.
- Acceptance criteria:
  - Per-model timeout defaults (e.g., 5–15s) with configurable overrides.
  - If the primary model times out, a fallback model is selected quickly.
- Implementation notes:
  - Router should expose configuration for timeouts and fallback order.
  - Use cached short answers where possible for commonly asked queries.
- Tests:
  - Integration tests that simulate slow/failed model responses and ensure the router returns a fallback.

10) Developer & model onboarding docs (LOW/MEDIUM PRIORITY)
- Goal: Provide clear instructions for model authors on how to create adapters and how the router expects requests and responses.
- Acceptance criteria:
  - A markdown doc under `docs/` describing ModelAdapter contract, example request JSON, example response JSON, healthcheck expectations, and retry semantics.
- Implementation notes:
  - Provide code examples in Python and a sample mock model for tests.
- Tests:
  - Sample mock model used in integration tests.

---

## Integration & API contracts (JSON examples)

These examples define the request/response shape the router and tools should use. Models must conform to these for interoperability.

1) Router request (from orchestrator to models)
```json
{
  "id": "req-0001",
  "type": "action_request",
  "timestamp": 1697660000,
  "payload": {
    "goal": "Open Settings and enable Wi-Fi",
    "context": {
      "screen_tree": "<serialized screen tree JSON>",
      "focused_view_id": "com.example:id/wifi_toggle"
    },
    "max_steps": 10
  }
}
```

2) Model response (successful)
```json
{
  "id": "req-0001",
  "model": "model-alpha-v1",
  "status": "ok",
  "confidence": 0.82,
  "action": {
    "type": "tap",
    "x": 540,
    "y": 1200
  },
  "text": "Tapping Settings Wi-Fi toggle"
}
```

3) Model response (error / timeout)
```json
{
  "id": "req-0001",
  "model": "model-beta-v2",
  "status": "error",
  "error": "timeout",
  "confidence": 0.0
}
```

Router policy examples (implementations)
- Highest-confidence selection: pick the response with the largest `confidence` value (threshold configurable).
- Majority-vote: for discrete actions (tap, swipe), group identical actions and pick the most common.
- Summarizer fusion: when multiple textual responses conflict, run a lightweight summarizer model to produce a single canonical instruction.

---

## Acceptance criteria for models

Models / model adapters must:
- Respond within the configured timeout or explicitly return `status: "error"` with `error: "timeout"`.
- Include a numeric `confidence` between 0.0 and 1.0.
- For action-based responses include an `action` object with a well-known `type` and parameters.
- Include a `text` field for any spoken feedback that should be passed to TTS.

---

## CI / testing requirements for PRs

Every PR that modifies Android code or the model router must:
- Run unit tests and Android compile steps in CI.
- Run Android Lint and accessibility checks where possible.
- Include a short description of manual accessibility tests performed (TTS flow, TalkBack navigation) in the PR description if UI changes are involved.

---

## Owners & responsibilities

- Android accessibility & UI: the primary Android maintainer (assign to project lead).
- Python model router & sandbox: Python/agent maintainer.
- Security & keys: owner of EncryptedKeyManager.
- CI & workflow edits: repository ops owner.

If you want, we can add explicit GitHub usernames for each role when you confirm who the maintainers are.

---

## Final PR draft (copy-paste-ready)

Title: `fix: resolve claude-container duplicate typeText Kotlin compile error`

Body:

This PR fixes a Kotlin compilation failure observed in the claude-container Android build (CI run: https://github.com/fivefootllama/Apk-interface-/actions/runs/39062491277).

Summary:
- The Gradle build failed at `:app:compileDebugKotlin` due to a duplicate/conflicting `typeText` declaration in `com.example.container.SystemBridgeService`.
- This change standardizes the accessibility bridge API to a single source-of-truth for text entry:
  - instance method: `performTypeText(text: String): Boolean`
  - static wrapper: `typeText(text: String): Boolean = instance?.performTypeText(text) ?: false`
- The duplicate/conflicting method was removed to avoid Kotlin compilation errors.

Files changed:
- `claude-container/app/src/main/java/com/example/container/SystemBridgeService.kt`
- `BUILD_AND_CHANGELOG.md`

Verification steps taken / to take:
1. Build locally: `cd claude-container && ./gradlew assembleDebug --stacktrace`
2. Confirm `BUILD SUCCESSFUL` and APK at `app/build/outputs/apk/debug/`
3. CI should run on merge; ensure `claude-merge` workflow passes

Why this is safe:
- The change only consolidates the bridge API surface (no change in the runtime behavior expected by Python callers; it still calls into the same instance method)
- Low-risk change that restores compilation

Notes:
- The repo contains multiple Android subprojects (`android-container` and `claude-container`); this PR targets the `claude-container` app that the CI workflow exercises.

---

Signed,

GitHub Copilot (@copilot)
