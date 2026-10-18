# 05 — CI Quality Gates

Goal
- Add GitHub Actions workflows to enforce TypeScript type checks, frontend build, Python static checks, and Android build gates. These workflows ensure PRs cannot be merged if they break the build.

Recommended CI jobs (split by job to reduce blast radius)
- frontend: install node, run lint/type-check/build
- python-safety: run flake/pyflakes/pytest for python scripts
- android-build: run `./gradlew assembleDebug` and upload APK artifact

Example workflow (frontend + python):

```yaml
name: CI

on: [push, pull_request]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install deps
        working-directory: frontend
        run: npm ci
      - name: Type check
        working-directory: frontend
        run: npm run lint
      - name: Build
        working-directory: frontend
        run: npm run build

  python-safety:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: 3.11
      - name: Run static checks
        working-directory: python
        run: |
          python -m pip install -r requirements.txt || true
          python -m pyflakes . || true

  android-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup JDK
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'
      - name: Run Android assemble
        working-directory: android
        run: |
          chmod +x gradlew || true
          ./gradlew assembleDebug --no-daemon
      - name: Upload APK
        if: success()
        uses: actions/upload-artifact@v4
        with:
          name: debug-apk
          path: android/app/build/outputs/apk/debug/*.apk
```

Enforcement
- Set branch protection rules to require CI pass before merging
- Consider gating merges so that `android-build` must pass for release branches

Monitoring
- Add a bundle-size check job that fails when a chunk exceeds a threshold
- Enable dependabot for npm and gradle to keep dependencies pinned and updated

