# Proposed Finalization — Master Plan

This folder contains the finalization package for merging and optimizing the repository into a single, reproducible, hardened, and maintainable Android + React + Python project. The goal of these documents is to provide a deterministic, unambiguous blueprint that an automated model or a developer can follow to recreate every file and configuration required to build a finalized APK and frontend bundle.

Summary
- Canonical repo layout (recommended):
  - android/                -> canonical Android project (merge android-container + claude-container here)
  - frontend/               -> React + TypeScript app (root `src/` may be moved here)
  - python/                 -> Python runtime, loader, sandbox and utilities
  - docs/proposed-finalization/ -> this package (MD guides and code blocks)

What this package contains (high level)
- 01-repo-audit-and-merge-map.md  — inventory, exact files to move, conflict map
- 02-frontend-optimization-and-merge.md — TS/React/Vite optimizations + code blocks
- 03-android-container-consolidation.md — merge plan, kotlin conflict fixes, gradle wrapper advice
- 04-python-sandbox-and-loader-hardening.md — hardened sandbox runner + loader templates
- 05-ci-quality-gates.md — GitHub Actions CI files and verification steps
- 06-final-model-execution-guide.md — detailed file-by-file reconstruction instructions and included code blocks

How to use these docs
1. Follow the steps in `01-repo-audit-and-merge-map.md` to create repository backups and a local branch for merging.
2. Run the small, safe frontend changes in `02-frontend-optimization-and-merge.md` and validate builds.
3. Apply android consolidation changes from `03-android-container-consolidation.md` and validate Gradle builds on a Linux host or GitHub Actions runner.
4. Integrate the hardened Python sandbox from `04-python-sandbox-and-loader-hardening.md` behind a feature flag.
5. Enable the CI gates in `05-ci-quality-gates.md` to keep the repo healthy.
6. Use `06-final-model-execution-guide.md` to instruct models to reconstruct every file verbatim from the included code blocks and index.

Success criteria
- `npm run lint` and `npm run build` pass for the frontend
- Android build succeeds: `./gradlew assembleDebug` produces an APK
- Python sandbox executes code in a subprocess with a timeout, and loader reloads modules safely
- No duplicate/conflicting project directories remain

Signed,
GitHub Copilot (@copilot)
