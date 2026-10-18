# 01 — Repo Audit and Merge Map

Goal
- Inventory the repository and determine exactly which files to move/merge to create a canonical project layout.

Top-level inventory (discovered from the repo root)
- .env.example
- .github/
- .gitignore
- BUILD_AND_CHANGELOG.md
- INITIALIZATION.md
- NON_SECURITY_ISSUES.md
- REPO_ACCESS_AND_MANUAL_TASKS.md
- android-container/      (Android project A)
- claude-container/       (Android project B — referenced by CI)
- firebase-applet-config.json
- index.html
- metadata.json
- package.json
- src/                    (React app)
- tsconfig.json
- vite.config.ts
- docs/

Immediate conflict observations
- Two Android projects (android-container and claude-container) are present. CI run `39062491277` targeted `claude-container` and failed at Kotlin compile due to a duplicate symbol in SystemBridgeService.
- Frontend is large with many huge TSX components (VirtualAndroidDevice, MultiModelCollaborationHub, OperationsHub, KeyVaultManager, etc.). These should be split and lazily loaded.
- Python loader and sandbox code exists in `src` (embedded through codeRepository.ts) and should be separated into a `python/` directory to avoid mixing runtime code with frontend assets.

Conflict map (high level)
- claude-container vs android-container: duplicate responsibilities and potentially duplicate Kotlin classes. Choose a canonical directory name `android/` and merge contents. Preserve client-facing Android project which CI should target.
- src/ contains UI and embedded code artifacts. Keep UI under `frontend/` and move Python runtime files into `python/`.

Planned canonical layout
```
frontend/        # React app (moved from src/)
android/         # merged Android project
python/          # loader, sandbox, helper scripts
docs/            # documentation (includes this package)
```

Step-by-step merge plan (safe, reversible)
1. Create backup branch: git branch pre-merge-backup
2. Create working branch: git checkout -b proposed-finalization (already created)
3. Create top-level directories: frontend/, android/, python/
4. Move frontend files: move `src/`, `index.html`, `package.json`, `vite.config.ts`, `tsconfig.json` into `frontend/`. Update package.json `scripts` paths if needed.
5. Move Python runtime files: extract embedded Python scripts from `src/codeRepository.ts` (PROMPT_3_FILES, PROMPT_4_FILES) into `python/` as loader.py, sandbox_evaluator.py, etc.
6. Consolidate Android projects: compare `android-container/` and `claude-container/`. Select one tree (prefer claude-container for CI continuity) as base and merge missing assets & resources from the other. Rename chosen final directory to `android/`.
7. Resolve Kotlin conflicts: open Kotlin files that touch SystemBridgeService and EncryptedKeyManager. Remove duplicate methods or unify implementations (see `03-android-container-consolidation.md` for exact edits).
8. Add Gradle wrapper to `android/` with `./gradlew` and `gradle/wrapper/*` files.
9. Update CI workflows to point at `android/` and `frontend/` build steps.
10. Run CI locally or on a branch and iterate on compilation errors.

Validation checklist (run after each step)
- Files moved successfully and relative imports resolved
- `npm ci` followed by `npm run lint` in `frontend/` passes
- `npm run build` in `frontend/` passes
- `./gradlew assembleDebug` in `android/` produces APK
- Python scripts (loader/sandbox) are present in `python/` and pass flake/static tests

Red flags
- Complex Kotlin symbol conflicts that require rewrite
- Python multiprocessing semantics incompatible with Chaquopy
- Frontend absolute imports break after move (update tsconfig paths accordingly)

Next actions
- Run small frontend move first and verify `npm run build` before Android consolidation.
