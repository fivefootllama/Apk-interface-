// Top-level build file. Plugin versions declared here with plain id()/version,
// matching claude-container's CI-verified pattern instead of a version catalog
// (android-container previously used alias(libs.plugins...) with no
// gradle/libs.versions.toml in the repo, which fails before Gradle even
// reaches configuration).
plugins {
    id("com.android.application") version "8.5.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.24" apply false
    id("com.chaquo.python") version "17.1.0" apply false
}
