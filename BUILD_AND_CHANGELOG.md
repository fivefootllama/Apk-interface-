# BUILD_AND_CHANGELOG.md

This file documents the code changes I will make to fix TypeScript/package issues, ensure the Android project is buildable, and records the rationale for each change. It also contains a prioritized checklist (Must-fix before launch / Nice-to-have) and a short changelog of modifications made in the repository.

---

## Summary of actions I will take

1. Fix TypeScript toolchain and package.json inconsistencies
   - Change `typescript` dependency from `^7.0.2` to `^5.3.0` in package.json (or the latest 5.x stable) to match the React 19 / Vite toolchain.
   - Update `esbuild` and other devDependencies to compatible versions if needed.
   - Remove `express` from dependencies and the `clean` script that removes `server.js` unless a server is required; if a server is needed I will add minimal server.js and document it.

2. Add Gradle wrapper to android-container
   - Add `gradlew`, `gradlew.bat`, and the `gradle/wrapper` files to the `android-container` directory for reproducible builds.
   - Pin Chaquopy plugin in settings or buildscript and document the required Chaquopy/Python versions.

3. Add developer docs and prioritize issues
   - Add README.md with Quick Start for frontend and Android build instructions.
   - Add CHANGELOG section describing every committed change I make.

---

## Why these changes
- The TypeScript version will currently break developer tooling and possibly CI; using a modern 5.x release ensures compatibility with React 19 and Vite.
- The Gradle wrapper is standard for Android projects and ensures reproducible builds across environments.
- Cleaning up package.json reduces confusion and accidental broken scripts.

---

## Prioritized checklist

Must-fix before launch
- [ ] Fix TypeScript version and verify `npm run lint` passes
- [ ] Ensure frontend `npm run build` produces a working bundle
- [ ] Add Gradle wrapper and verify `./gradlew assembleDebug` builds an APK
- [ ] Pin Chaquopy/python versions and pin pip deps
- [ ] Add README and basic dev setup

Nice-to-have (post-launch or later)
- [ ] Add CI workflows for frontend and Android builds
- [ ] Add unit and instrumentation tests
- [ ] Code-splitting and performance optimizations
- [ ] Linting/pre-commit hooks

---

## Changelog (planned commits)
- `chore(deps): pin typescript to ^5.3.0 and update devDependencies`
- `chore(build): add gradle wrapper to android-container`
- `docs: add README.md and BUILD_AND_CHANGELOG.md`

---

Signed,

GitHub Copilot (@copilot)
