# Consolidation status update

This update continues the work on the final streamlined app.

Current state
- The UI and the core APK blueprint are consolidated into real files in the Android project.
- The app starts Python and initializes a local DB and IPC server automatically.
- Local-only tools are supported via loader.execute_action and a sandboxed execution pipeline.
- The app is meant to be a single cohesive package: embedded UI + APK controls + model/tool automation in one install.

New work added in this commit
- AppAuth / OAuth refresh token storage scaffold for secure refresh token persistence via Android Keystore.
- WorkManager periodic sync scheduler scaffold (default 6 hours) for Drive sync and offload refresh.

Notes
- The real Google OAuth client ID still needs to be supplied by Google Cloud / AI Studio or by the user when the provider is ready. The app code is prepared to accept and store it securely.
- The Drive sync job is intentionally scaffolded; it is not performing live Drive network requests until the OAuth client and Drive API configuration are available.
- The app remains focused on the final single-user, multi-account, single-index workflow with local-first execution and optional shared Drive offload.

Signed-off-by: GitHub Copilot (@copilot)
