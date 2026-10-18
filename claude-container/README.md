# Self-Evolving Android Container

Kotlin APK shell + Chaquopy Python runtime: accessibility bridge, hot-loaded tools, two-phase sandbox,
multi-provider LLM router with key rotation, an observe-decide-act agent loop, and an encrypted key vault.

## Build
- **Android Studio:** open this folder, let Gradle sync (it uses the included wrapper, Gradle 8.9, JDK 17), press Run.
  Android Studio downloads the SDK pieces it needs.
- **No Android Studio:** push this folder to a GitHub repo. The included workflow (`.github/workflows/build.yml`)
  runs the Python tests, builds a debug APK, and attaches it to the run under *Actions > Artifacts*.
  Download, unzip, and sideload the APK.
- If the build fails, paste the first red error to Claude and it will be fixed.

## First run
1. Install on an arm64 or x86_64 device/emulator (Android 8.0+, minSdk 26).
2. **Manage API keys**: confirm your screen lock, then paste one or more keys per provider
   (Groq, OpenRouter, Google AI Studio; Ollama needs no key). Tap **Test connection**.
3. **Accessibility settings**: enable "Container System Bridge".
   On Android 13+ for a sideloaded APK: App info > three-dot menu > *Allow restricted settings* first.
4. Type a goal and tap **Start agent**. **Stop** halts it at the next step.

## Key vault safeguards
- AES-256-GCM, key held in the Android Keystore (never exported), fresh IV per write, ciphertext only on disk.
- Device lock-screen confirmation to open the screen; it re-locks when you leave it.
- FLAG_SECURE: no screenshots / screen recording, blank in the recents view.
- Keys shown only as the last 4 characters; never written to logs; redacted from every agent log line and result.
- Multiple keys per provider rotate on HTTP 429 / 5xx; remove + add to replace a key; "Erase all keys" also deletes the encryption key.
- HTTPS enforced (cleartext only to localhost / 127.0.0.1 / 10.0.2.2 for a local Ollama).
- Backups and device transfer are disabled for app data.
- Keys are handed to Python in memory for the duration of a run and are not written to Python-side files.

## Agent safety procedures
- Hard step cap (25), Stop button, loop detection, abort after 3 invalid replies.
- Halts if a bank / wallet / password-manager style app is in the foreground (edit `BLOCKED_PACKAGE_HINTS` in `agent.py`).
- Never acts inside this app; never types into password fields; password text is never read from the screen.
- Screen text is treated as untrusted data (prompt-injection defence in the system prompt); strict action schema and coordinate validation.
- `run_tool` only runs modules that passed the sandbox and were promoted.
- Generated code: static AST check, a lint that blocks subprocess/ctypes/eval/exec/os.system/file deletion,
  a threaded timed run, and the module's own `selftest()` asserts must pass before promotion.

## Layout
- Kotlin: `MainActivity`, `KeysActivity`, `SecureKeyStore`, `SystemBridgeService`, `PythonHost`, `AgentRunner`, `EnvironmentProbe`
- Python (`app/src/main/python`): `agent.py`, `router.py`, `orchestrator.py`, `sandbox_evaluator.py`, `loader.py`
- Example scripts (`app/src/main/python/examples`, seed-only, not auto-loaded): `action_skip_ad.py`, `tool_security_audit.py`
- Tests: `python3 tests/test_python_engine.py` (27 desktop checks, no Android needed)

## Providers
Groq, OpenRouter, Google AI Studio, Claude (Anthropic Messages API, native `/v1/messages` support —
not OpenAI-compatible, handled as its own wire format in `router.py`), and Ollama (local, no key).
Add a key on the Keys screen for any you want to use; unconfigured providers are skipped.

## Device tier (root detection)
`EnvironmentProbe.kt` reports whether the device looks rooted, its SDK level and ABI. This is
informational only: no action in `agent.py` currently checks it or behaves differently because
of it. It exists as a real signal for a future, separately-reviewed rooted-only tool, not as a
blanket "grant more capability" switch — root changes how easily an action can be done, not
whether an unsafe action (like silently handling someone's 2FA code) becomes safe to automate.

## A line we won't cross
This project will not include anything that reads a verification/2FA code off the screen and
submits it automatically, in any app, without the user seeing it first. That pattern — silent,
app-agnostic OTP capture and auto-submit — is the same technique used by Android banking
trojans (Cerberus, Anatsa, SharkBot and similar) to take over accounts. A user-initiated,
single-field, visible-before-submit autofill is a different and legitimate feature; ask if
that's what you actually want.

## Known limits
- The Kotlin / Gradle side has never been compiled (the authoring environment could not reach Android/Maven repositories).
  It was hand-reviewed and fixed for known pitfalls, but expect to fix a small error on first build.
  The Python logic was tested on desktop with a fake bridge and fake models.
- Chaquopy 17.1.0 / AGP 8.5.2 / Kotlin 1.9.24 / Gradle 8.9 were chosen from Chaquopy's current docs (AGP 7.3-9.4 supported); not build-verified.
- The policy lint is a guard rail, not a jail. `exec()` in a thread is not a security boundary; the lint can be bypassed by determined code.
- A timed-out script keeps running in a daemon thread (Python cannot kill threads) and is never promoted.
- Default model names change over time: edit them on the Keys screen if a test says the model is not found.
- The agent runs in the app process; Android may stop it if the system is under heavy memory pressure.
- Sideloaded accessibility apps are restricted on Play Store distribution and some apps block automation.
