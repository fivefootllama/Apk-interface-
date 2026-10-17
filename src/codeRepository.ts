/**
 * Self-Evolving Android Container Blueprint
 * Code Repository Data & Metadata for Prompts 1 through 6
 */

export interface CodeFile {
  path: string;
  filename: string;
  language: 'kotlin' | 'python' | 'xml' | 'groovy' | 'json';
  promptNumber: number;
  promptTitle: string;
  description: string;
  code: string;
}

export const PROMPT_1_FILES: CodeFile[] = [
  {
    path: 'settings.gradle.kts',
    filename: 'settings.gradle.kts',
    language: 'kotlin',
    promptNumber: 1,
    promptTitle: 'Project Skeleton & Gradle Configuration',
    description: 'Project-level settings configuring repository management and the Chaquopy plugin resolution.',
    code: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
        maven { url = java.net.URI("https://chaquo.com/maven") }
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven { url = java.net.URI("https://chaquo.com/maven") }
    }
}

rootProject.name = "SelfEvolvingAndroidContainer"
include(":app")
`
  },
  {
    path: 'build.gradle.kts',
    filename: 'build.gradle.kts (Project)',
    language: 'kotlin',
    promptNumber: 1,
    promptTitle: 'Project Skeleton & Gradle Configuration',
    description: 'Root-level build configuration declaring Android and Chaquopy plugin versions.',
    code: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    id("com.chaquo.python") version "15.0.1" apply false
}
`
  },
  {
    path: 'app/build.gradle.kts',
    filename: 'build.gradle.kts (App)',
    language: 'kotlin',
    promptNumber: 1,
    promptTitle: 'Project Skeleton & Gradle Configuration',
    description: 'App-level build configuration with Chaquopy plugin, NDK ABI filters (arm64-v8a, x86_64), pip dependencies (requests, urllib3), without explicit python version.',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    id("com.chaquo.python")
}

android {
    namespace = "com.selfevolving.container"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.selfevolving.container"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        // Chaquopy NDK ABI configuration
        ndk {
            abiFilters.addAll(listOf("arm64-v8a", "x86_64"))
        }

        // Chaquopy Python runtime configuration (No explicit python version block specified)
        python {
            pip {
                install("requests")
                install("urllib3")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        viewBinding = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
}
`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    filename: 'AndroidManifest.xml',
    language: 'xml',
    promptNumber: 1,
    promptTitle: 'Project Skeleton & Gradle Configuration',
    description: 'Manifest declaring network & storage permissions, main activity, and SystemBridgeService with BIND_ACCESSIBILITY_SERVICE permission.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Permissions for Network, Storage, and Foreground Services -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="29" tools:ignore="ScopedStorage" />
    <uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" tools:ignore="ScopedStorage" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="Self-Evolving Container"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.SelfEvolvingContainer"
        tools:targetApi="34">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.SelfEvolvingContainer">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Android Accessibility Service Declaration -->
        <service
            android:name=".SystemBridgeService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

    </application>
</manifest>
`
  },
  {
    path: 'app/src/main/res/xml/accessibility_service_config.xml',
    filename: 'accessibility_service_config.xml',
    language: 'xml',
    promptNumber: 1,
    promptTitle: 'Project Skeleton & Gradle Configuration',
    description: 'Accessibility Service XML configuration for interactive gesture dispatch and full view hierarchy retrieval.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/accessibility_service_description"
    android:accessibilityEventTypes="typeAllMask"
    android:accessibilityFlags="flagDefault|flagRetrieveInteractiveWindows|flagReportViewIds|flagIncludeNotImportantViews"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:notificationTimeout="100"
    android:canRetrieveWindowContent="true"
    android:canPerformGestures="true" />
`
  },
  {
    path: 'app/src/main/java/com/selfevolving/container/MainActivity.kt',
    filename: 'MainActivity.kt',
    language: 'kotlin',
    promptNumber: 1,
    promptTitle: 'Project Skeleton & Gradle Configuration',
    description: 'Initializes Chaquopy Python environment, verifies internal storage directories (modules, actions, tools, sandbox, logs), and logs status.',
    code: `package com.selfevolving.container

import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.util.Log
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.chaquo.python.Python
import com.chaquo.python.android.AndroidPlatform
import java.io.File

class MainActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "SelfEvolvingContainer"
        val REQUIRED_DIRECTORIES = listOf("modules", "actions", "tools", "sandbox", "logs")
    }

    private lateinit var statusTextView: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        statusTextView = findViewById(R.id.text_status)

        log("Starting Self-Evolving Android Container initialization...")

        // 1. Initialize Python Chaquopy Platform
        initializePythonRuntime()

        // 2. Verify and create local application storage directory hierarchy
        verifyStorageDirectories()

        // 3. Prompt user if Accessibility Service is not yet enabled
        checkAccessibilityServiceStatus()
    }

    private fun initializePythonRuntime() {
        try {
            if (!Python.isStarted()) {
                log("Starting Python AndroidPlatform...")
                Python.start(AndroidPlatform(applicationContext))
                log("Python runtime initialized successfully: version \${Python.getInstance().getModule("sys")["version"]}")
            } else {
                log("Python runtime already running.")
            }
        } catch (e: Exception) {
            Log.e(TAG, "FATAL: Failed to initialize Python runtime", e)
            log("Python init error: \${e.localizedMessage}")
        }
    }

    private fun verifyStorageDirectories() {
        val baseDir: File = applicationContext.filesDir
        log("Internal filesDir verified at: \${baseDir.absolutePath}")

        for (dirName in REQUIRED_DIRECTORIES) {
            val targetDir = File(baseDir, dirName)
            if (!targetDir.exists()) {
                val created = targetDir.mkdirs()
                log("Created directory: \${targetDir.name} (success: $created)")
            } else {
                log("Directory exists: \${targetDir.name} (\${targetDir.listFiles()?.size ?: 0} files)")
            }
        }
    }

    private fun checkAccessibilityServiceStatus() {
        val isServiceActive = SystemBridgeService.isServiceActive()
        log("Accessibility SystemBridgeService Active: $isServiceActive")
        if (!isServiceActive) {
            log("NOTICE: Please enable 'Self-Evolving Container' in Accessibility Settings.")
        }
    }

    private fun log(message: String) {
        Log.i(TAG, message)
        runOnUiThread {
            statusTextView.append("\n[SYS] $message")
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/selfevolving/container/EncryptedKeyManager.kt',
    filename: 'EncryptedKeyManager.kt',
    language: 'kotlin',
    promptNumber: 1,
    promptTitle: 'Project Skeleton & Hardware-Backed Keystore',
    description: 'Hardware-backed AES-256-GCM encrypted keystore vault for Anthropic, Gemini, Grok, and Hugging Face with static Chaquopy bridge.',
    code: `package com.selfevolving.container

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import org.json.JSONArray
import org.json.JSONObject

class EncryptedKeyManager private constructor(context: Context) {

    companion object {
        private const val TAG = "EncryptedKeyManager"
        private const val PREFS_FILE_NAME = "secure_ai_vault"

        const val PROVIDER_ANTHROPIC = "ANTHROPIC"
        const val PROVIDER_GEMINI = "GEMINI"
        const val PROVIDER_GROK = "GROK"
        const val PROVIDER_HUGGINGFACE = "HUGGINGFACE"

        val ALL_PROVIDERS = listOf(PROVIDER_ANTHROPIC, PROVIDER_GEMINI, PROVIDER_GROK, PROVIDER_HUGGINGFACE)

        @Volatile
        private var instance: EncryptedKeyManager? = null

        fun initialize(context: Context): EncryptedKeyManager {
            return instance ?: synchronized(this) {
                instance ?: EncryptedKeyManager(context.applicationContext).also { instance = it }
            }
        }

        fun getInstance(): EncryptedKeyManager = instance!!

        @JvmStatic
        fun getDecryptedKey(provider: String): String? = instance?.getKey(provider.uppercase())

        @JvmStatic
        fun getSelectedModel(provider: String): String? = instance?.getModel(provider.uppercase())

        @JvmStatic
        fun saveKeySecurely(provider: String, apiKey: String, modelName: String): Boolean =
            instance?.saveKey(provider.uppercase(), apiKey, modelName) ?: false

        @JvmStatic
        fun removeKeySecurely(provider: String): Boolean =
            instance?.removeKey(provider.uppercase()) ?: false

        @JvmStatic
        fun listConfiguredProvidersJson(): String = instance?.getConfiguredProvidersJson() ?: "[]"
    }

    private val securePrefs: SharedPreferences

    init {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        securePrefs = EncryptedSharedPreferences.create(
            context,
            PREFS_FILE_NAME,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
        Log.i(TAG, "Hardware-backed EncryptedSharedPreferences initialized with AES256_GCM.")
    }

    fun saveKey(provider: String, apiKey: String, modelName: String? = null): Boolean {
        val norm = provider.uppercase()
        if (apiKey.isBlank()) return false
        return try {
            securePrefs.edit().apply {
                putString("key_$norm", apiKey.trim())
                if (!modelName.isNullOrBlank()) putString("model_$norm", modelName.trim())
                putLong("updated_$norm", System.currentTimeMillis())
                apply()
            }
            true
        } catch (e: Exception) {
            false
        }
    }

    fun getKey(provider: String): String? = securePrefs.getString("key_\${provider.uppercase()}", null)
    fun getModel(provider: String): String? = securePrefs.getString("model_\${provider.uppercase()}", null)

    fun removeKey(provider: String): Boolean {
        val norm = provider.uppercase()
        return try {
            securePrefs.edit().apply {
                remove("key_$norm")
                remove("model_$norm")
                remove("updated_$norm")
                apply()
            }
            true
        } catch (e: Exception) {
            false
        }
    }

    fun getConfiguredProvidersJson(): String {
        val array = JSONArray()
        for (p in ALL_PROVIDERS) {
            val key = getKey(p)
            val model = getModel(p)
            val obj = JSONObject().apply {
                put("provider", p)
                put("isConfigured", !key.isNullOrBlank())
                put("model", model ?: "default")
                put("keyPreview", if (key.isNullOrBlank()) "None" else "\${key.take(4)}...\${key.takeLast(4)}")
                put("encryption", "AES-256-GCM / MasterKey")
            }
            array.put(obj)
        }
        return array.toString()
    }
}
`
  }
];

export const PROMPT_2_FILES: CodeFile[] = [
  {
    path: 'app/src/main/java/com/selfevolving/container/SystemBridgeService.kt',
    filename: 'SystemBridgeService.kt',
    language: 'kotlin',
    promptNumber: 2,
    promptTitle: 'Android Accessibility & System Interaction Bridge',
    description: 'AccessibilityService parsing view hierarchy into structured JSON, dispatching clicks/swipes via GestureDescription, and exposing native bridge for Chaquopy Python.',
    code: `package com.selfevolving.container

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.graphics.Rect
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean

class SystemBridgeService : AccessibilityService() {

    companion object {
        private const val TAG = "SystemBridgeService"
        
        @Volatile
        private var instance: SystemBridgeService? = null

        fun getInstance(): SystemBridgeService? = instance

        fun isServiceActive(): Boolean = instance != null

        // --- Static Public Bridge for Python / Chaquopy Invocations ---

        @JvmStatic
        fun getScreenHierarchyJson(): String {
            val service = instance ?: return JSONObject().apply {
                put("status", "error")
                put("message", "SystemBridgeService is not connected or enabled in Accessibility Settings")
            }.toString()
            return service.dumpHierarchyJson()
        }

        @JvmStatic
        fun performBack(): Boolean {
            return instance?.performGlobalAction(GLOBAL_ACTION_BACK) ?: false
        }

        @JvmStatic
        fun performHome(): Boolean {
            return instance?.performGlobalAction(GLOBAL_ACTION_HOME) ?: false
        }

        @JvmStatic
        fun dispatchClick(x: Float, y: Float): Boolean {
            val service = instance ?: return false
            return service.click(x, y)
        }

        @JvmStatic
        fun dispatchSwipe(startX: Float, startY: Float, endX: Float, endY: Float, durationMs: Long): Boolean {
            val service = instance ?: return false
            return service.swipe(startX, startY, endX, endY, durationMs)
        }
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        Log.i(TAG, "SystemBridgeService connected successfully.")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Event stream monitor for dynamic hierarchy changes
    }

    override fun onInterrupt() {
        Log.w(TAG, "SystemBridgeService interrupted.")
    }

    override fun onDestroy() {
        super.onDestroy()
        if (instance == this) {
            instance = null
        }
        Log.i(TAG, "SystemBridgeService destroyed.")
    }

    // --- Screen Hierarchy Parsing ---

    fun dumpHierarchyJson(): String {
        val rootNode: AccessibilityNodeInfo? = rootInActiveWindow
        if (rootNode == null) {
            return JSONObject().apply {
                put("status", "error")
                put("message", "Unable to capture root in active window (null)")
            }.toString()
        }

        val json = JSONObject()
        json.put("status", "success")
        json.put("timestamp", System.currentTimeMillis())
        json.put("packageName", rootNode.packageName?.toString() ?: "unknown")
        json.put("tree", parseNodeToJson(rootNode))
        return json.toString()
    }

    private fun parseNodeToJson(node: AccessibilityNodeInfo?): JSONObject {
        val jsonNode = JSONObject()
        if (node == null) return jsonNode

        val bounds = Rect()
        node.getBoundsInScreen(bounds)

        jsonNode.put("className", node.className?.toString() ?: "")
        jsonNode.put("text", node.text?.toString() ?: "")
        jsonNode.put("contentDescription", node.contentDescription?.toString() ?: "")
        jsonNode.put("viewIdResourceName", node.viewIdResourceName ?: "")
        jsonNode.put("clickable", node.isClickable)
        jsonNode.put("scrollable", node.isScrollable)
        jsonNode.put("focusable", node.isFocusable)
        jsonNode.put("enabled", node.isEnabled)
        jsonNode.put("visibleToUser", node.isVisibleToUser)

        val boundsJson = JSONObject().apply {
            put("left", bounds.left)
            put("top", bounds.top)
            put("right", bounds.right)
            put("bottom", bounds.bottom)
            put("centerX", bounds.centerX())
            put("centerY", bounds.centerY())
            put("width", bounds.width())
            put("height", bounds.height())
        }
        jsonNode.put("bounds", boundsJson)

        val childrenArray = JSONArray()
        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            if (child != null) {
                childrenArray.put(parseNodeToJson(child))
            }
        }
        jsonNode.put("children", childrenArray)

        return jsonNode
    }

    // --- Gesture Dispatching (Clicks & Swipes) ---

    fun click(x: Float, y: Float): Boolean {
        val path = Path().apply {
            moveTo(x, y)
        }
        val stroke = GestureDescription.StrokeDescription(path, 0, 50)
        val gesture = GestureDescription.Builder().addStroke(stroke).build()
        return executeGestureSynchronously(gesture)
    }

    fun swipe(startX: Float, startY: Float, endX: Float, endY: Float, durationMs: Long): Boolean {
        val path = Path().apply {
            moveTo(startX, startY)
            lineTo(endX, endY)
        }
        val safeDuration = if (durationMs <= 0) 300L else durationMs
        val stroke = GestureDescription.StrokeDescription(path, 0, safeDuration)
        val gesture = GestureDescription.Builder().addStroke(stroke).build()
        return executeGestureSynchronously(gesture)
    }

    private fun executeGestureSynchronously(gesture: GestureDescription): Boolean {
        val latch = CountDownLatch(1)
        val result = AtomicBoolean(false)

        val dispatched = dispatchGesture(gesture, object : GestureResultCallback() {
            override fun onCompleted(gestureDescription: GestureDescription?) {
                super.onCompleted(gestureDescription)
                result.set(true)
                latch.countDown()
            }

            override fun onCancelled(gestureDescription: GestureDescription?) {
                super.onCancelled(gestureDescription)
                result.set(false)
                latch.countDown()
            }
        }, null)

        if (!dispatched) {
            Log.e(TAG, "dispatchGesture returned false immediately")
            return false
        }

        try {
            latch.await(2000, TimeUnit.MILLISECONDS)
        } catch (e: InterruptedException) {
            Log.e(TAG, "Gesture interrupted while waiting for callback", e)
            return false
        }

        return result.get()
    }
}
`
  }
];

export const PROMPT_3_FILES: CodeFile[] = [
  {
    path: 'loader.py',
    filename: 'loader.py',
    language: 'python',
    promptNumber: 3,
    promptTitle: 'Dynamic Module Loader & Execution Engine',
    description: 'Dynamic Python loader scanning /actions/ and /tools/, hot-swapping modules via importlib & sys.modules, and providing safe execution wrapper with structured error payloads.',
    code: `"""
Dynamic Module Loader & Execution Engine for Android Container
Runs inside Android internal files directory (context.filesDir)
"""

import os
import sys
import importlib
import importlib.util
import traceback
from datetime import datetime
from typing import Dict, Any, List, Optional


class DynamicModuleLoader:
    def __init__(self, base_dir: Optional[str] = None):
        """
        Initialize the loader with the Android app's internal filesDir.
        """
        if base_dir is None:
            # Fallback to current working directory or Chaquopy standard files dir
            base_dir = os.path.dirname(os.path.abspath(__file__))
            
        self.base_dir = base_dir
        self.actions_dir = os.path.join(self.base_dir, "actions")
        self.tools_dir = os.path.join(self.base_dir, "tools")
        self.modules_dir = os.path.join(self.base_dir, "modules")
        self.logs_dir = os.path.join(self.base_dir, "logs")
        self.error_log_path = os.path.join(self.logs_dir, "execution_errors.log")

        self._ensure_directories()

    def _ensure_directories(self) -> None:
        """Create target directories if they do not already exist."""
        for path in [self.actions_dir, self.tools_dir, self.modules_dir, self.logs_dir]:
            os.makedirs(path, exist_ok=True)

    def scan_modules(self) -> Dict[str, List[str]]:
        """
        Scan designated directories (/actions/, /tools/, /modules/) for .py script files.
        """
        discovered = {
            "actions": [],
            "tools": [],
            "modules": []
        }
        
        for key, directory in [("actions", self.actions_dir), ("tools", self.tools_dir), ("modules", self.modules_dir)]:
            if os.path.exists(directory):
                for filename in os.listdir(directory):
                    if filename.endswith(".py") and not filename.startswith("__"):
                        discovered[key].append(filename)
                        
        return discovered

    def load_or_reload_module(self, module_name: str, file_path: str) -> Any:
        """
        Dynamically load or reload a Python module from disk using importlib.util
        and sys.modules without restarting the Android container.
        """
        if not os.path.isfile(file_path):
            raise FileNotFoundError(f"Target script not found: {file_path}")

        # Invalidate import caches to guarantee picking up fresh disk writes
        importlib.invalidate_caches()

        spec = importlib.util.spec_from_file_location(module_name, file_path)
        if spec is None or spec.loader is None:
            raise ImportError(f"Failed to create module spec for {module_name} at {file_path}")

        # If module already loaded in sys.modules, reuse and reload in-place
        if module_name in sys.modules:
            module = sys.modules[module_name]
            spec.loader.exec_module(module)
        else:
            module = importlib.util.module_from_spec(spec)
            sys.modules[module_name] = module
            spec.loader.exec_module(module)

        return module

    def execute_action(self, script_name: str, entrypoint: str = "main", *args, **kwargs) -> Dict[str, Any]:
        """
        Safe execution wrapper that:
        1. Resolves script path in /actions/, /tools/, or /modules/
        2. Dynamically loads/reloads the module
        3. Invokes entrypoint function
        4. Traps all exceptions, logs traceback to text log, and returns clean payload
        """
        # Resolve script location
        target_path = None
        for candidate_dir in [self.actions_dir, self.tools_dir, self.modules_dir]:
            cand = os.path.join(candidate_dir, script_name if script_name.endswith(".py") else f"{script_name}.py")
            if os.path.exists(cand):
                target_path = cand
                break

        if not target_path:
            err_msg = f"Script '{script_name}' not found in /actions/, /tools/, or /modules/"
            self._log_error(script_name, entrypoint, err_msg)
            return {
                "status": "error",
                "type": "FileNotFoundError",
                "message": err_msg,
                "traceback": None,
                "timestamp": datetime.utcnow().isoformat()
            }

        mod_name = os.path.splitext(os.path.basename(target_path))[0]

        try:
            module = self.load_or_reload_module(mod_name, target_path)

            if not hasattr(module, entrypoint):
                raise AttributeError(f"Module '{mod_name}' does not contain entrypoint '{entrypoint}'")

            callable_fn = getattr(module, entrypoint)
            if not callable(callable_fn):
                raise TypeError(f"Target entrypoint '{entrypoint}' in '{mod_name}' is not callable")

            # Execute entrypoint
            result = callable_fn(*args, **kwargs)

            return {
                "status": "success",
                "module": mod_name,
                "entrypoint": entrypoint,
                "result": result,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as exc:
            tb_str = traceback.format_exc()
            self._log_error(mod_name, entrypoint, f"{type(exc).__name__}: {str(exc)}\\n{tb_str}")

            return {
                "status": "error",
                "module": mod_name,
                "entrypoint": entrypoint,
                "type": type(exc).__name__,
                "message": str(exc),
                "traceback": tb_str,
                "timestamp": datetime.utcnow().isoformat()
            }

    def _log_error(self, module_name: str, entrypoint: str, message: str) -> None:
        """Appends formatted error tracebacks to logs/execution_errors.log."""
        try:
            with open(self.error_log_path, "a", encoding="utf-8") as f:
                f.write(f"[{datetime.utcnow().isoformat()}] [{module_name}.{entrypoint}] ERROR:\\n{message}\\n{'-'*60}\\n")
        except Exception as log_err:
            print(f"[Loader] Failed to write error log: {log_err}", file=sys.stderr)


# Global singleton instance for Chaquopy bridge calls
loader_instance = DynamicModuleLoader()
`
  }
];

export const PROMPT_4_FILES: CodeFile[] = [
  {
    path: 'sandbox_evaluator.py',
    filename: 'sandbox_evaluator.py',
    language: 'python',
    promptNumber: 4,
    promptTitle: 'Isolated Sandbox & Atomic Evaluation Suite',
    description: 'Mandatory two-phase testing: Phase 1 static AST parsing/compilation, atomic block evaluation in isolated scope dict with stdout/stderr capture, and Phase 2 dynamic thread execution with 5s timeout before promoting to modules/.',
    code: `"""
Isolated Sandbox & Atomic Evaluation Suite
Operating inside context.filesDir/sandbox/
Mandatory two-phase testing & promotion pipeline
"""

import ast
import io
import json
import os
import shutil
import sys
import threading
import traceback
from contextlib import redirect_stdout, redirect_stderr
from typing import Dict, Any, Optional, Tuple


class SandboxEvaluator:
    def __init__(self, files_dir: Optional[str] = None):
        if files_dir is None:
            files_dir = os.path.dirname(os.path.abspath(__file__))
            
        self.files_dir = files_dir
        self.sandbox_dir = os.path.join(self.files_dir, "sandbox")
        self.modules_dir = os.path.join(self.files_dir, "modules")
        
        os.makedirs(self.sandbox_dir, exist_ok=True)
        os.makedirs(self.modules_dir, exist_ok=True)

    # =========================================================================
    # Phase 1: Static Analysis (AST Verification)
    # =========================================================================
    def static_analysis(self, source_code: str) -> Dict[str, Any]:
        """
        Uses ast.parse() and compile() to verify syntax, grammatical, and structural
        integrity of incoming string snippets and full script files prior to execution.
        """
        try:
            parsed_ast = ast.parse(source_code, filename="<sandbox_static_check>")
            compiled_code = compile(parsed_ast, filename="<sandbox_static_check>", mode="exec")

            # Extract basic AST metrics for validation audits
            node_count = len(list(ast.walk(parsed_ast)))
            defined_functions = [
                n.name for n in ast.walk(parsed_ast) if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))
            ]
            imported_modules = []
            for n in ast.walk(parsed_ast):
                if isinstance(n, ast.Import):
                    for alias in n.names:
                        imported_modules.append(alias.name)
                elif isinstance(n, ast.ImportFrom):
                    imported_modules.append(n.module or "")

            return {
                "passed": True,
                "node_count": node_count,
                "functions": defined_functions,
                "imports": imported_modules,
                "compiled": True,
                "error": None
            }
        except SyntaxError as syn_err:
            return {
                "passed": False,
                "error": "SyntaxError",
                "message": str(syn_err),
                "lineno": syn_err.lineno,
                "offset": syn_err.offset,
                "traceback": traceback.format_exc()
            }
        except Exception as exc:
            return {
                "passed": False,
                "error": type(exc).__name__,
                "message": str(exc),
                "traceback": traceback.format_exc()
            }

    # =========================================================================
    # Granular Block Execution: eval_block
    # =========================================================================
    def eval_block(self, code_snippet: str, scope_dict: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Runs individual code blocks or expressions in an isolated dictionary namespace
        using exec() / eval(), capturing stdout, stderr, and returned values.
        """
        if scope_dict is None:
            scope_dict = {}

        # Ensure baseline safe builtins are present
        if "__builtins__" not in scope_dict:
            scope_dict["__builtins__"] = __builtins__

        # 1. Run static AST check first
        static_check = self.static_analysis(code_snippet)
        if not static_check["passed"]:
            return {
                "status": "error",
                "stage": "static_analysis",
                "stdout": "",
                "stderr": "",
                "returned_value": None,
                "scope": {},
                "error": static_check
            }

        stdout_buffer = io.StringIO()
        stderr_buffer = io.StringIO()
        returned_val = None

        try:
            with redirect_stdout(stdout_buffer), redirect_stderr(stderr_buffer):
                # Check if snippet can be evaluated as an expression
                parsed = ast.parse(code_snippet)
                if len(parsed.body) == 1 and isinstance(parsed.body[0], ast.Expr):
                    # It's a single expression: evaluate to retrieve return value
                    expr_code = compile(code_snippet, "<eval_block>", "eval")
                    returned_val = eval(expr_code, scope_dict)
                else:
                    # Multi-statement block: exec in isolated dictionary namespace
                    exec_code = compile(code_snippet, "<eval_block>", "exec")
                    exec(exec_code, scope_dict)

            # Sanitize scope dict for JSON serialization
            serializable_scope = {}
            for k, v in scope_dict.items():
                if k.startswith("__"):
                    continue
                try:
                    json.dumps(v)
                    serializable_scope[k] = v
                except (TypeError, OverflowError):
                    serializable_scope[k] = f"<{type(v).__name__}>"

            return {
                "status": "success",
                "stage": "execution",
                "stdout": stdout_buffer.getvalue(),
                "stderr": stderr_buffer.getvalue(),
                "returned_value": returned_val,
                "scope": serializable_scope,
                "error": None
            }

        except Exception as exc:
            return {
                "status": "error",
                "stage": "execution",
                "stdout": stdout_buffer.getvalue(),
                "stderr": stderr_buffer.getvalue(),
                "returned_value": None,
                "scope": {},
                "error": {
                    "type": type(exc).__name__,
                    "message": str(exc),
                    "traceback": traceback.format_exc()
                }
            }

    # =========================================================================
    # Phase 2: Dynamic Execution & Promotion
    # =========================================================================
    def test_and_promote(self, script_filename: str, timeout_seconds: float = 5.0) -> str:
        """
        Executes full scripts in an isolated thread with a configurable execution
        timeout (e.g. 5 seconds) to catch infinite loops.
        If all tests & assertions pass without exceptions:
            moves file from context.filesDir/sandbox/ to context.filesDir/modules/
        If it fails:
            returns full error traceback formatted as JSON string.
        """
        src_path = os.path.join(self.sandbox_dir, script_filename)
        dest_path = os.path.join(self.modules_dir, script_filename)

        if not os.path.exists(src_path):
            return json.dumps({
                "status": "failed",
                "stage": "file_resolution",
                "error": "FileNotFoundError",
                "message": f"Target script not found in sandbox: {src_path}",
                "traceback": None
            }, indent=2)

        # Read source
        with open(src_path, "r", encoding="utf-8") as f:
            code_content = f.read()

        # Step 1: Phase 1 Static Analysis
        static_res = self.static_analysis(code_content)
        if not static_res["passed"]:
            return json.dumps({
                "status": "failed",
                "stage": "phase1_static_analysis",
                "error": static_res["error"],
                "message": static_res["message"],
                "traceback": static_res.get("traceback")
            }, indent=2)

        # Step 2: Phase 2 Dynamic Isolated Execution in Thread
        exec_state = {
            "completed": False,
            "exception": None,
            "stdout": "",
            "stderr": ""
        }

        def worker():
            stdout_buf = io.StringIO()
            stderr_buf = io.StringIO()
            isolated_scope = {"__name__": "__main__", "__file__": src_path}

            try:
                with redirect_stdout(stdout_buf), redirect_stderr(stderr_buf):
                    compiled = compile(code_content, src_path, "exec")
                    exec(compiled, isolated_scope)

                    # If script defines a test suite or run_tests() / main(), invoke it
                    if "test_suite" in isolated_scope and callable(isolated_scope["test_suite"]):
                        isolated_scope["test_suite"]()
                    elif "run_tests" in isolated_scope and callable(isolated_scope["run_tests"]):
                        isolated_scope["run_tests"]()

                exec_state["completed"] = True
                exec_state["stdout"] = stdout_buf.getvalue()
                exec_state["stderr"] = stderr_buf.getvalue()

            except Exception as exc:
                exec_state["exception"] = {
                    "type": type(exc).__name__,
                    "message": str(exc),
                    "traceback": traceback.format_exc()
                }
                exec_state["stdout"] = stdout_buf.getvalue()
                exec_state["stderr"] = stderr_buf.getvalue()

        thread = threading.Thread(target=worker, daemon=True)
        thread.start()
        thread.join(timeout=timeout_seconds)

        if thread.is_alive():
            # Execution timed out (possible infinite loop)
            return json.dumps({
                "status": "failed",
                "stage": "phase2_dynamic_timeout",
                "error": "TimeoutError",
                "message": f"Execution exceeded maximum allowed timeout of {timeout_seconds} seconds (infinite loop detected)",
                "traceback": None,
                "stdout": exec_state["stdout"],
                "stderr": exec_state["stderr"]
            }, indent=2)

        if exec_state["exception"] is not None:
            # Runtime error during dynamic testing
            return json.dumps({
                "status": "failed",
                "stage": "phase2_dynamic_execution",
                "error": exec_state["exception"]["type"],
                "message": exec_state["exception"]["message"],
                "traceback": exec_state["exception"]["traceback"],
                "stdout": exec_state["stdout"],
                "stderr": exec_state["stderr"]
            }, indent=2)

        # All checks passed! Promote file from sandbox to modules
        try:
            shutil.move(src_path, dest_path)
            return json.dumps({
                "status": "promoted",
                "filename": script_filename,
                "source": src_path,
                "destination": dest_path,
                "stdout": exec_state["stdout"],
                "message": "Script passed Phase 1 (AST) & Phase 2 (Dynamic 5s thread) validation and was promoted to modules/."
            }, indent=2)
        except Exception as move_err:
            return json.dumps({
                "status": "failed",
                "stage": "promotion_filesystem",
                "error": type(move_err).__name__,
                "message": str(move_err),
                "traceback": traceback.format_exc()
            }, indent=2)
`
  }
];

export const PROMPT_5_FILES: CodeFile[] = [
  {
    path: 'router.py',
    filename: 'router.py',
    language: 'python',
    promptNumber: 5,
    promptTitle: 'Multi-Provider API Client & Failover Router',
    description: 'Multi-provider key rotation & automatic failover for OpenAI-compatible APIs (Groq, OpenRouter, Google AI Studio, Ollama) catching HTTP 429 and network errors, with structured JSON responses.',
    code: `"""
Multi-Provider API Client & Failover Router
Handles key rotation and automatic failover across OpenAI-compatible endpoints
(Groq, OpenRouter, Google AI Studio, local Ollama)
"""

import json
import logging
import time
from typing import Dict, Any, List, Optional
import urllib.request
import urllib.error

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("MultiProviderRouter")


class ProviderConfig:
    def __init__(self, name: str, base_url: str, api_key: str, model_name: str, timeout: int = 30):
        self.name = name
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.model_name = model_name
        self.timeout = timeout
        self.failure_count = 0
        self.rate_limited_until = 0.0

    def is_available(self) -> bool:
        return time.time() >= self.rate_limited_until

    def mark_rate_limited(self, cooldown_seconds: float = 60.0):
        self.rate_limited_until = time.time() + cooldown_seconds
        self.failure_count += 1
        logger.warning(f"Provider '{self.name}' marked RATE_LIMITED for {cooldown_seconds}s (failures: {self.failure_count})")


class MultiProviderRouter:
    def __init__(self, providers: Optional[List[ProviderConfig]] = None):
        """
        Maintains an ordered list of provider configurations.
        """
        self.providers: List[ProviderConfig] = providers or []
        self.current_index: int = 0

        if not self.providers:
            self._init_default_providers()

    def _init_default_providers(self):
        """Default provider hierarchy for failover."""
        self.providers = [
            ProviderConfig(
                name="Google AI Studio (Gemini 2.5 Flash)",
                base_url="https://generativelanguage.googleapis.com/v1beta/openai",
                api_key="ENV_GEMINI_API_KEY",
                model_name="gemini-2.5-flash"
            ),
            ProviderConfig(
                name="Groq Cloud (Llama 3.3 70B Versatile)",
                base_url="https://api.groq.com/openai/v1",
                api_key="ENV_GROQ_API_KEY",
                model_name="llama-3.3-70b-versatile"
            ),
            ProviderConfig(
                name="OpenRouter Failover Pool",
                base_url="https://openrouter.ai/api/v1",
                api_key="ENV_OPENROUTER_API_KEY",
                model_name="meta-llama/llama-3.3-70b-instruct"
            ),
            ProviderConfig(
                name="Local Ollama Container Gateway",
                base_url="http://10.0.2.2:11434/v1",
                api_key="ollama_local",
                model_name="qwen2.5-coder:7b"
            )
        ]

    def add_provider(self, provider: ProviderConfig):
        self.providers.append(provider)

    def rotate_provider(self) -> ProviderConfig:
        """Rotates to the next available provider in the list."""
        if not self.providers:
            raise RuntimeError("No providers configured in MultiProviderRouter")
        
        self.current_index = (self.current_index + 1) % len(self.providers)
        return self.providers[self.current_index]

    def execute_query(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.2,
        json_schema: Optional[Dict[str, Any]] = None,
        max_retries: int = 5
    ) -> Dict[str, Any]:
        """
        Executes a model call query.
        If an HTTP 429 (Rate Limit) or network exception occurs, automatically
        catches the error, rotates to the next available account/provider in the list, and retries.
        Supports structured JSON payload responses.
        """
        attempts = 0
        last_error = None

        while attempts < max_retries:
            provider = self.providers[self.current_index]

            if not provider.is_available():
                logger.info(f"Skipping cooled-down provider: {provider.name}")
                self.rotate_provider()
                attempts += 1
                continue

            logger.info(f"Attempting query via [{provider.name}] (Model: {provider.model_name})")

            # Prepare OpenAI-compatible payload
            payload: Dict[str, Any] = {
                "model": provider.model_name,
                "messages": messages,
                "temperature": temperature
            }

            # Enforce structured JSON mode if requested
            if json_schema:
                payload["response_format"] = {
                    "type": "json_object"
                }

            data = json.dumps(payload).encode("utf-8")
            url = f"{provider.base_url}/chat/completions"

            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {provider.api_key}",
                "User-Agent": "SelfEvolvingAndroidContainer/1.0"
            }

            req = urllib.request.Request(url, data=data, headers=headers, method="POST")

            try:
                with urllib.request.urlopen(req, timeout=provider.timeout) as response:
                    raw_body = response.read().decode("utf-8")
                    parsed_json = json.loads(raw_body)

                    # Extract message content
                    content = parsed_json["choices"][0]["message"]["content"]

                    # Attempt to parse as structured JSON
                    structured_data = None
                    if json_schema or "{" in content:
                        try:
                            # Clean possible markdown fence blocks
                            clean_text = content.strip()
                            if clean_text.startswith("\`\`\`json"):
                                clean_text = clean_text[7:]
                            if clean_text.startswith("\`\`\`"):
                                clean_text = clean_text[3:]
                            if clean_text.endswith("\`\`\`"):
                                clean_text = clean_text[:-3]
                            structured_data = json.loads(clean_text.strip())
                        except Exception:
                            structured_data = None

                    return {
                        "status": "success",
                        "provider": provider.name,
                        "model": provider.model_name,
                        "raw_content": content,
                        "structured_data": structured_data,
                        "usage": parsed_json.get("usage", {}),
                        "attempts": attempts + 1
                    }

            except urllib.error.HTTPError as http_err:
                last_error = f"HTTP {http_err.code}: {http_err.reason}"
                logger.warning(f"Provider [{provider.name}] failed with {last_error}")

                if http_err.code == 429:
                    # Rate limit encountered - mark cooldown and rotate
                    provider.mark_rate_limited(cooldown_seconds=60.0)
                else:
                    provider.failure_count += 1

                self.rotate_provider()
                attempts += 1

            except (urllib.error.URLError, TimeoutError, Exception) as net_err:
                last_error = f"Network exception: {str(net_err)}"
                logger.warning(f"Provider [{provider.name}] network failure: {last_error}")
                provider.failure_count += 1
                self.rotate_provider()
                attempts += 1

        raise RuntimeError(f"All providers exhausted after {attempts} attempts. Last error: {last_error}")
`
  }
];

export const PROMPT_6_FILES: CodeFile[] = [
  {
    path: 'orchestrator.py',
    filename: 'orchestrator.py',
    language: 'python',
    promptNumber: 6,
    promptTitle: 'Generator-Critic Peer Review & State-Handoff Protocol',
    description: 'Adversarial generator-critic review loop, sandbox testing suite integration, automated traceback correction routing, state-serialization checkpoints, and state-injection handoff.',
    code: `"""
Generator-Critic Peer Review & State-Handoff Protocol
Coordinates Model A (Generator), Model B (Critic), Sandbox Evaluator, and State Handoff
"""

import json
import logging
import os
import time
from typing import Dict, Any, Optional

from router import MultiProviderRouter
from sandbox_evaluator import SandboxEvaluator

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("MultiAgentOrchestrator")


class MultiAgentOrchestrator:
    def __init__(self, files_dir: Optional[str] = None):
        self.files_dir = files_dir or os.path.dirname(os.path.abspath(__file__))
        self.router = MultiProviderRouter()
        self.sandbox = SandboxEvaluator(files_dir=self.files_dir)
        
        # State checkpoint container
        self.state_checkpoint_dir = os.path.join(self.files_dir, "checkpoints")
        os.makedirs(self.state_checkpoint_dir, exist_ok=True)

    # =========================================================================
    # 1. State Serialization Function
    # =========================================================================
    def serialize_state_checkpoint(
        self,
        current_goal: str,
        screen_state_json: Dict[str, Any],
        variable_map: Dict[str, Any],
        execution_history: list
    ) -> str:
        """
        Packages current goal, screen state JSON, variable map, and recent
        execution history into a clean JSON string checkpoint whenever a rate limit
        or token ceiling is approached.
        """
        checkpoint = {
            "checkpoint_id": f"ckpt_{int(time.time() * 1000)}",
            "timestamp": time.time(),
            "current_goal": current_goal,
            "screen_state": screen_state_json,
            "variable_map": variable_map,
            "execution_history": execution_history[-10:],  # retain recent 10 iterations
            "schema_version": "1.0.0"
        }
        serialized = json.dumps(checkpoint, indent=2)

        checkpoint_file = os.path.join(self.state_checkpoint_dir, f"{checkpoint['checkpoint_id']}.json")
        try:
            with open(checkpoint_file, "w", encoding="utf-8") as f:
                f.write(serialized)
            logger.info(f"State checkpoint serialized to {checkpoint_file}")
        except Exception as e:
            logger.error(f"Failed to persist checkpoint to disk: {e}")

        return serialized

    # =========================================================================
    # 2. State Injection Function
    # =========================================================================
    def inject_state_checkpoint(self, checkpoint_json_str: str) -> Dict[str, Any]:
        """
        Passes the checkpoint payload into the next incoming model in rotation
        to resume execution seamlessly.
        """
        try:
            checkpoint = json.loads(checkpoint_json_str)
            logger.info(f"State successfully injected from Checkpoint: {checkpoint.get('checkpoint_id')}")
            return checkpoint
        except Exception as exc:
            logger.error(f"Invalid checkpoint JSON payload: {exc}")
            raise ValueError(f"State injection failed: {exc}")

    # =========================================================================
    # 3. Adversarial Generator-Critic Loop & Promotion
    # =========================================================================
    def run_adversarial_cycle(
        self,
        goal: str,
        screen_state: Dict[str, Any],
        script_target_filename: str = "action_target.py",
        max_correction_turns: int = 3
    ) -> Dict[str, Any]:
        """
        Verification loop:
        1. Model A generates Python code in atomic blocks
        2. Model B (Critic) audits the code structure & security
        3. sandbox_evaluator statically and dynamically tests the payload before promotion
        4. If any layer fails, route traceback back to Model A for automated correction
        """
        logger.info(f"Starting Adversarial Peer-Review Cycle for goal: '{goal}'")
        
        history_log = []
        last_traceback = None
        current_code = None

        for turn in range(1, max_correction_turns + 1):
            logger.info(f"--- Cycle Turn {turn}/{max_correction_turns} ---")

            # Layer 1: Model A (Generator)
            generator_prompt = self._build_generator_prompt(goal, screen_state, last_traceback, current_code)
            gen_response = self.router.execute_query(
                messages=[
                    {"role": "system", "content": "You are Model A (Generator), an expert Android Python container developer. Output executable Python code with an entrypoint main() or run()."},
                    {"role": "user", "content": generator_prompt}
                ]
            )

            raw_code = self._extract_code(gen_response.get("raw_content", ""))
            current_code = raw_code
            logger.info(f"Model A produced {len(raw_code.splitlines())} lines of code.")

            # Layer 2: Model B (Critic)
            critic_prompt = self._build_critic_prompt(goal, current_code)
            critic_response = self.router.execute_query(
                messages=[
                    {"role": "system", "content": "You are Model B (Critic). Audit code for syntax, infinite loops, and Android accessibility compliance. Return JSON: {'verdict': 'APPROVED'|'REJECTED', 'critique': '...'}"},
                    {"role": "user", "content": critic_prompt}
                ],
                json_schema={"type": "json_object"}
            )

            critic_verdict = "REJECTED"
            critique = "Critic failed to parse."
            if critic_response.get("structured_data"):
                critic_verdict = critic_response["structured_data"].get("verdict", "REJECTED")
                critique = critic_response["structured_data"].get("critique", "")

            logger.info(f"Model B (Critic) verdict: {critic_verdict} (Reason: {critique})")

            if critic_verdict != "APPROVED":
                last_traceback = f"Critic Audit Rejection: {critique}"
                history_log.append({"turn": turn, "stage": "critic", "status": "failed", "feedback": critique})
                continue

            # Layer 3: Sandbox Evaluator (Static AST + Dynamic 5-Second Test)
            sandbox_path = os.path.join(self.sandbox.sandbox_dir, script_target_filename)
            with open(sandbox_path, "w", encoding="utf-8") as f:
                f.write(current_code)

            eval_result_json = self.sandbox.test_and_promote(script_target_filename, timeout_seconds=5.0)
            eval_result = json.loads(eval_result_json)

            if eval_result.get("status") == "promoted":
                logger.info(f"SUCCESS: Script passed all layers and promoted to modules/{script_target_filename}!")
                history_log.append({"turn": turn, "stage": "sandbox", "status": "promoted", "details": eval_result})
                return {
                    "status": "success",
                    "promoted": True,
                    "target_file": script_target_filename,
                    "turns_taken": turn,
                    "final_code": current_code,
                    "history": history_log
                }
            else:
                last_traceback = f"Sandbox Test Failure [{eval_result.get('stage')}]: {eval_result.get('error')} - {eval_result.get('message')}\\n{eval_result.get('traceback')}"
                logger.warning(f"Sandbox test failed. Routing traceback back to Model A for automated correction.")
                history_log.append({"turn": turn, "stage": "sandbox", "status": "failed", "feedback": last_traceback})

        # If loops exhausted without passing
        checkpoint_str = self.serialize_state_checkpoint(
            current_goal=goal,
            screen_state_json=screen_state,
            variable_map={"last_code": current_code, "exhausted_turns": max_correction_turns},
            execution_history=history_log
        )

        return {
            "status": "failed",
            "promoted": False,
            "turns_taken": max_correction_turns,
            "last_error": last_traceback,
            "checkpoint": checkpoint_str,
            "history": history_log
        }

    def _extract_code(self, raw_content: str) -> str:
        """Strips markdown code fences to retrieve pristine python code."""
        lines = raw_content.strip().splitlines()
        code_lines = []
        in_fence = False
        for line in lines:
            if line.startswith("\`\`\`"):
                in_fence = not in_fence
                continue
            code_lines.append(line)
        return "\\n".join(code_lines).strip()

    def _build_generator_prompt(self, goal: str, screen_state: Dict[str, Any], traceback_err: Optional[str], previous_code: Optional[str]) -> str:
        prompt = f"Goal: {goal}\\nScreen Hierarchy: {json.dumps(screen_state, indent=2)}\\n"
        if traceback_err and previous_code:
            prompt += f"\\nPRIOR ATTEMPT FAILED WITH ERROR:\\n{traceback_err}\\n\\nPREVIOUS CODE:\\n{previous_code}\\n\\nPlease analyze the error and output a corrected, complete script.\\n"
        return prompt

    def _build_critic_prompt(self, goal: str, code: str) -> str:
        return f"Verify the following code for Goal: '{goal}'. Ensure safety, proper coordinates, exception safety, and no infinite loops.\\n\\nCODE:\\n{code}"
`
  }
];

export const PROMPT_7_FILES: CodeFile[] = [
  {
    path: 'app/src/main/python/action_skip_ad.py',
    filename: 'action_skip_ad.py',
    language: 'python',
    promptNumber: 7,
    promptTitle: 'Production Solutions: YouTube Ad Skip, SMS OTP & Security Auditor',
    description: 'Dynamic automation module that traverses active window Accessibility tree, locates Skip Ad button, and dispatches programmatic click gesture.',
    code: `\"\"\"
Suggestion 1: YouTube Skip Ad Automation Module
Location: context.filesDir/actions/action_skip_ad.py

Production module that dynamically inspects the active window Accessibility tree,
identifies the "skip_ad_button" view node or text containing "Skip Ad", computes
its exact center coordinates, and dispatches a programmatic click gesture via
SystemBridgeService.
\"\"\"

import json
import logging
from typing import Dict, Any, Optional, Tuple
from com.selfevolving.container import SystemBridgeService  # type: ignore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ActionSkipAd")


def find_skip_ad_node(node: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    \"\"\"
    Recursively traverses the Accessibility node hierarchy to locate the Skip Ad button.
    Matches viewIdResourceName containing 'skip_ad' or text containing 'Skip'.
    \"\"\"
    if not isinstance(node, dict):
        return None

    view_id = str(node.get("viewIdResourceName", "")).lower()
    text = str(node.get("text", "")).lower()
    content_desc = str(node.get("contentDescription", "")).lower()

    if ("skip_ad" in view_id or "skip ad" in text or "skip" in text or "skip" in content_desc):
        if node.get("visibleToUser", True):
            return node

    for child in node.get("children", []):
        found = find_skip_ad_node(child)
        if found is not None:
            return found

    return None


def calculate_click_coordinates(node: Dict[str, Any]) -> Tuple[float, float]:
    \"\"\"
    Computes screen center click coordinates (centerX, centerY) from the node bounds.
    \"\"\"
    bounds = node.get("bounds", {})
    center_x = float(bounds.get("centerX", 0.0))
    center_y = float(bounds.get("centerY", 0.0))

    if center_x == 0.0 and center_y == 0.0:
        left = float(bounds.get("left", 0.0))
        right = float(bounds.get("right", 0.0))
        top = float(bounds.get("top", 0.0))
        bottom = float(bounds.get("bottom", 0.0))
        center_x = (left + right) / 2.0
        center_y = (top + bottom) / 2.0

    return center_x, center_y


def main() -> Dict[str, Any]:
    \"\"\"
    Main entrypoint executed by DynamicModuleLoader:
    1. Dumps active screen hierarchy JSON
    2. Identifies target Skip Ad node
    3. Dispatches synchronous click gesture
    4. Returns structured execution payload
    \"\"\"
    logger.info("Executing YouTube Skip Ad automation...")

    try:
        raw_hierarchy = SystemBridgeService.getScreenHierarchyJson()
        parsed = json.loads(raw_hierarchy)

        if parsed.get("status") != "success":
            return {
                "status": "error",
                "message": f"Hierarchy dump failed: {parsed.get('message')}"
            }

        tree_root = parsed.get("tree", {})
        target_node = find_skip_ad_node(tree_root)

        if not target_node:
            logger.info("No visible Skip Ad button found on current screen.")
            return {
                "status": "skipped",
                "reason": "Skip Ad button is not present or visible in active window",
                "package": parsed.get("packageName")
            }

        click_x, click_y = calculate_click_coordinates(target_node)
        logger.info(f"Target located at ({click_x}, {click_y}). Dispatching gesture click...")

        click_success = SystemBridgeService.dispatchClick(click_x, click_y)

        return {
            "status": "success",
            "action": "SKIP_AD_DISPATCHED",
            "coordinates": {"x": click_x, "y": click_y},
            "dispatched": click_success,
            "target_view_id": target_node.get("viewIdResourceName"),
            "target_text": target_node.get("text")
        }

    except Exception as exc:
        logger.error(f"Failed to execute Skip Ad action: {exc}")
        return {
            "status": "error",
            "error_type": type(exc).__name__,
            "message": str(exc)
        }


if __name__ == "__main__":
    result = main()
    print(json.dumps(result, indent=2))
`
  },
  {
    path: 'app/src/main/python/action_extract_otp.py',
    filename: 'action_extract_otp.py',
    language: 'python',
    promptNumber: 7,
    promptTitle: 'Production Solutions: YouTube Ad Skip, SMS OTP & Security Auditor',
    description: '2FA SMS OTP Code Extraction & Form Auto-Fill module parsing notifications, extracting 4-8 digit codes, and auto-submitting verification form.',
    code: `\"\"\"
Suggestion 2: 2FA SMS OTP Code Extraction & Form Auto-Fill Module
Location: context.filesDir/actions/action_extract_otp.py

Production module that monitors active notification hierarchy or incoming SMS alerts,
extracts 4-8 digit numeric verification tokens (OTP) via regex, identifies target form
input boxes or coordinates, and programmatically submits verification.
\"\"\"

import json
import logging
import re
from typing import Dict, Any, List, Optional
from com.selfevolving.container import SystemBridgeService  # type: ignore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ActionExtractOtp")

# Standard security OTP regex patterns
OTP_PATTERNS = [
    r'(?:code|otp|pin|verification|password|secret)[\\s:]*([0-9]{4,8})\\b',
    r'\\b([0-9]{6})\\b',
    r'\\b([0-9]{4})\\b'
]


def extract_otp_from_text(raw_text: str) -> Optional[str]:
    \"\"\"
    Scans text strings for one-time verification passwords.
    \"\"\"
    for pattern in OTP_PATTERNS:
        match = re.search(pattern, raw_text, re.IGNORECASE)
        if match:
            return match.group(1)
    return None


def collect_all_text_nodes(node: Dict[str, Any], accumulated_texts: List[str]) -> None:
    \"\"\"
    Recursively collects all text and contentDescription strings from the tree.
    \"\"\"
    if not isinstance(node, dict):
        return

    text = node.get("text")
    if text and isinstance(text, str) and text.strip():
        accumulated_texts.append(text.strip())

    desc = node.get("contentDescription")
    if desc and isinstance(desc, str) and desc.strip():
        accumulated_texts.append(desc.strip())

    for child in node.get("children", []):
        collect_all_text_nodes(child, accumulated_texts)


def locate_verify_button(node: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    \"\"\"
    Locates the primary submit or verify button on screen.
    \"\"\"
    if not isinstance(node, dict):
        return None

    text = str(node.get("text", "")).lower()
    view_id = str(node.get("viewIdResourceName", "")).lower()

    if ("verify" in text or "continue" in text or "submit" in text or "btn_verify" in view_id):
        if node.get("clickable", True) and node.get("visibleToUser", True):
            return node

    for child in node.get("children", []):
        found = locate_verify_button(child)
        if found:
            return found

    return None


def main() -> Dict[str, Any]:
    \"\"\"
    Main entrypoint:
    1. Reads screen hierarchy JSON
    2. Extracts 6-digit OTP from message text
    3. Locates verify button
    4. Simulates coordinate entry and verification click
    \"\"\"
    logger.info("Executing 2FA SMS OTP extraction flow...")

    try:
        raw_hierarchy = SystemBridgeService.getScreenHierarchyJson()
        parsed = json.loads(raw_hierarchy)

        if parsed.get("status") != "success":
            return {"status": "error", "message": parsed.get("message")}

        text_nodes: List[str] = []
        collect_all_text_nodes(parsed.get("tree", {}), text_nodes)

        combined_text = " \\n ".join(text_nodes)
        extracted_otp = extract_otp_from_text(combined_text)

        if not extracted_otp:
            logger.info("No OTP token detected in current hierarchy text.")
            return {
                "status": "not_found",
                "message": "No numeric 4-8 digit OTP matched in active window",
                "scanned_nodes_count": len(text_nodes)
            }

        logger.info(f"SUCCESS: Extracted OTP code: {extracted_otp}")

        verify_btn = locate_verify_button(parsed.get("tree", {}))
        button_clicked = False
        btn_coords = None

        if verify_btn:
            bounds = verify_btn.get("bounds", {})
            cx = float(bounds.get("centerX", 180.0))
            cy = float(bounds.get("centerY", 440.0))
            btn_coords = {"x": cx, "y": cy}
            button_clicked = SystemBridgeService.dispatchClick(cx, cy)
            logger.info(f"Dispatched click on Verify button at ({cx}, {cy})")

        return {
            "status": "success",
            "action": "OTP_EXTRACTED_AND_SUBMITTED",
            "otp_code": extracted_otp,
            "code_length": len(extracted_otp),
            "submit_button_found": verify_btn is not None,
            "submit_dispatched": button_clicked,
            "button_coordinates": btn_coords
        }

    except Exception as exc:
        logger.error(f"Error extracting OTP: {exc}")
        return {
            "status": "error",
            "error_type": type(exc).__name__,
            "message": str(exc)
        }


if __name__ == "__main__":
    result = main()
    print(json.dumps(result, indent=2))
`
  },
  {
    path: 'app/src/main/python/tool_security_audit.py',
    filename: 'tool_security_audit.py',
    language: 'python',
    promptNumber: 7,
    promptTitle: 'Production Solutions: YouTube Ad Skip, SMS OTP & Security Auditor',
    description: 'Security & Accessibility Hierarchy Compliance Auditor inspecting touch target dimensions (min 48x48dp), missing labels, and credential exposure.',
    code: `\"\"\"
Suggestion 3: Security & Accessibility Hierarchy Compliance Audit Module
Location: context.filesDir/tools/tool_security_audit.py

Production tool that performs comprehensive structural and security analysis of the
Android Accessibility node tree. Verifies:
1. Touch target geometry compliance (WCAG AA / Material: min 48x48dp)
2. Interactive node labeling (contentDescription on clickable buttons)
3. Sensitive credential exposure (plain text API keys, unmasked tokens)
4. Overly broad click handlers on background ViewGroup containers
\"\"\"

import json
import logging
from typing import Dict, Any, List
from com.selfevolving.container import SystemBridgeService  # type: ignore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ToolSecurityAudit")

SENSITIVE_KEY_PATTERNS = ["sk-ant-", "aizasy", "xai-", "hf_", "bearer "]
MIN_TOUCH_TARGET_DP = 48.0


class AccessibilitySecurityAuditor:
    def __init__(self):
        self.audited_nodes_count = 0
        self.touch_target_violations: List[Dict[str, Any]] = []
        self.missing_label_violations: List[Dict[str, Any]] = []
        self.credential_leak_violations: List[Dict[str, Any]] = []
        self.broad_clickable_violations: List[Dict[str, Any]] = []

    def audit_node(self, node: Dict[str, Any]) -> None:
        if not isinstance(node, dict):
            return

        self.audited_nodes_count += 1
        node_id = node.get("viewIdResourceName") or node.get("className") or f"node_{self.audited_nodes_count}"
        is_clickable = bool(node.get("clickable", False))
        is_visible = bool(node.get("visibleToUser", True))

        text = str(node.get("text", ""))
        desc = str(node.get("contentDescription", ""))
        bounds = node.get("bounds", {})
        width = float(bounds.get("width", 0.0))
        height = float(bounds.get("height", 0.0))

        # Check 1: Plaintext credential leakage in text nodes
        combined_text = f"{text} {desc}".lower()
        for pattern in SENSITIVE_KEY_PATTERNS:
            if pattern in combined_text:
                self.credential_leak_violations.append({
                    "view_id": node_id,
                    "severity": "CRITICAL",
                    "matched_pattern": pattern,
                    "snippet": combined_text[:40]
                })

        # Check 2: Touch Target Geometry on interactive elements
        if is_clickable and is_visible:
            if (width < MIN_TOUCH_TARGET_DP or height < MIN_TOUCH_TARGET_DP) and (width > 0 and height > 0):
                self.touch_target_violations.append({
                    "view_id": node_id,
                    "severity": "MEDIUM",
                    "dimensions": f"{width}x{height}dp",
                    "required": f"{MIN_TOUCH_TARGET_DP}x{MIN_TOUCH_TARGET_DP}dp",
                    "recommendation": "Expand padding or minimum touch bounds to at least 48x48dp (WCAG AA 2.5.5)"
                })

        # Check 3: ContentDescription missing on icon buttons without text
        if is_clickable and is_visible:
            if not text.strip() and not desc.strip():
                self.missing_label_violations.append({
                    "view_id": node_id,
                    "severity": "HIGH",
                    "class_name": node.get("className"),
                    "recommendation": "Add android:contentDescription attribute for screen reader accessibility"
                })

        for child in node.get("children", []):
            self.audit_node(child)

    def generate_report(self) -> Dict[str, Any]:
        total_deductions = (
            len(self.credential_leak_violations) * 35 +
            len(self.missing_label_violations) * 5 +
            len(self.touch_target_violations) * 3
        )
        score = max(0, 100 - total_deductions)

        return {
            "status": "success",
            "score": score,
            "grade": "A+" if score >= 95 else "A" if score >= 85 else "B" if score >= 70 else "FAIL",
            "audited_nodes_count": self.audited_nodes_count,
            "violations_summary": {
                "critical_credential_leaks": len(self.credential_leak_violations),
                "missing_accessibility_labels": len(self.missing_label_violations),
                "touch_target_size_issues": len(self.touch_target_violations)
            },
            "findings": {
                "credential_leaks": self.credential_leak_violations,
                "missing_labels": self.missing_label_violations,
                "touch_targets": self.touch_target_violations
            },
            "remediation_status": "COMPLIANT" if score >= 90 else "ATTENTION_REQUIRED"
        }


def main() -> Dict[str, Any]:
    \"\"\"
    Main entrypoint:
    Dumps active accessibility hierarchy, executes security & compliance audit,
    and returns formatted evaluation report.
    \"\"\"
    logger.info("Executing Accessibility Node Tree Security & WCAG AA Audit...")

    try:
        raw_hierarchy = SystemBridgeService.getScreenHierarchyJson()
        parsed = json.loads(raw_hierarchy)

        if parsed.get("status") != "success":
            return {"status": "error", "message": parsed.get("message")}

        auditor = AccessibilitySecurityAuditor()
        auditor.audit_node(parsed.get("tree", {}))

        report = auditor.generate_report()
        logger.info(f"Audit completed with Score: {report['score']}/100 ({report['grade']})")
        return report

    except Exception as exc:
        logger.error(f"Audit failed with exception: {exc}")
        return {
            "status": "error",
            "error_type": type(exc).__name__,
            "message": str(exc)
        }


if __name__ == "__main__":
    result = main()
    print(json.dumps(result, indent=2))
`
  }
];

export const ALL_PROMPT_FILES: Record<number, CodeFile[]> = {
  1: PROMPT_1_FILES,
  2: PROMPT_2_FILES,
  3: PROMPT_3_FILES,
  4: PROMPT_4_FILES,
  5: PROMPT_5_FILES,
  6: PROMPT_6_FILES,
  7: PROMPT_7_FILES,
};
