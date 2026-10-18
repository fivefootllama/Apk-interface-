# 03 — Android Container Consolidation

Goal
- Consolidate `android-container/` and `claude-container/` into a single canonical Android project at `android/`, resolve Kotlin compile issues, add Gradle wrapper, and make the project CI-targetable.

Why
- CI run `39062491277` targeted `claude-container` and failed on Kotlin compile. Duplicate Android trees cause ambiguity and CI drift. Consolidation reduces risk and makes builds reproducible.

High-level plan
1. Choose canonical base: use `claude-container/` as base for continuity with CI (unless `android-container/` contains needed assets not in `claude-container/` — then merge those over)
2. Create new `android/` directory and populate it with the chosen base's contents
3. Merge resources (res/, assets/, src/) from the other container into the base, resolving conflicts by renaming or merging logic
4. Remove duplicated Kotlin classes and unify implementations. Specifically inspect `SystemBridgeService` for duplicate methods like `typeText`.
5. Add Gradle wrapper files and ensure `gradlew` executable bit is set
6. Pin Chaquopy version and add `python/requirements.txt` to the Android project if required by Chaquopy
7. Validate with `./gradlew assembleDebug` and fix compilation errors

Concrete steps & commands (safe sequence)

```bash
# on working branch proposed-finalization
git checkout proposed-finalization
# create canonical dir
mkdir android && cp -R claude-container/* android/
# bring in missing resources from android-container
rsync -av --ignore-existing android-container/ android/
# run quick Kotlin compile to capture errors
(cd android && ./gradlew assembleDebug --no-daemon)
# fix errors reported by Kotlin compiler
# add gradle wrapper if not present
(cd android && gradle wrapper --gradle-version 8.4)
# add wrapper files
git add android && git commit -m "chore(android): consolidate android projects into android/"
```

Kotlin conflict resolution guide (SystemBridgeService example)
- If duplicate functions exist with the same signature, keep one implementation and remove the other
- If two implementations differ, extract a single canonical behavior and unify callers

Example diff: remove duplicate typeText overload

```diff
-    // duplicate function found here -- remove or rename
-    fun typeText(text: String): Boolean {
-        // implementation A
-    }
+
+    // single canonical text entry that uses AccessibilityNodeInfo if available
+    fun typeText(text: String): Boolean {
+        // canonical implementation: find focused node and setText or use input connection
+        try {
+            val root = rootInActiveWindow ?: return false
+            // find focused EditText or input target
+            val focused = root.findFocus(AccessibilityNodeInfo.FOCUS_INPUT)
+            if (focused != null) {
+                val args = Bundle()
+                args.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text)
+                return focused.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args)
+            }
+        } catch (e: Exception) {
+            Log.e(TAG, "typeText failed", e)
+        }
+        return false
+    }
```

Chaquopy and NDK notes
- Ensure Chaquopy plugin version is pinned in `build.gradle.kts` and `settings.gradle.kts`
- If native libs are used, keep `ndk.abiFilters` consistent and documented

Gradle wrapper and reproducible builds
- Add `gradlew` and `gradlew.bat` plus `gradle/wrapper/gradle-wrapper.properties` and jar
- Set `distributionSha256Sum` to pin the wrapper distribution

Validation checklist
- `./gradlew tasks` runs without fatal errors
- `./gradlew assembleDebug` produces APK at `android/app/build/outputs/apk/debug/*.apk`
- Accessibility service entries in AndroidManifest are reviewed for security and `exported` settings

Rollout plan
- Merge frontend move and apply frontend CI first
- Then apply Android consolidation in a separate PR to reduce risk surface

