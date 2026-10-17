package com.selfevolving.container

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

        // 1. Initialize Hardware-Backed Encrypted Key Vault (AES-256-GCM)
        EncryptedKeyManager.initialize(applicationContext)
        log("Secure EncryptedKeyManager initialized for Anthropic, Gemini, Grok, Hugging Face.")

        // 2. Initialize Python Chaquopy Platform
        initializePythonRuntime()

        // 3. Verify and create local application storage directory hierarchy
        verifyStorageDirectories()

        // 4. Prompt user if Accessibility Service is not yet enabled
        checkAccessibilityServiceStatus()
    }

    private fun initializePythonRuntime() {
        try {
            if (!Python.isStarted()) {
                log("Starting Python AndroidPlatform...")
                Python.start(AndroidPlatform(applicationContext))
                log("Python runtime initialized successfully: version ${Python.getInstance().getModule("sys")["version"]}")
            } else {
                log("Python runtime already running.")
            }
        } catch (e: Exception) {
            Log.e(TAG, "FATAL: Failed to initialize Python runtime", e)
            log("Python init error: ${e.localizedMessage}")
        }
    }

    private fun verifyStorageDirectories() {
        val baseDir: File = applicationContext.filesDir
        log("Internal filesDir verified at: ${baseDir.absolutePath}")

        for (dirName in REQUIRED_DIRECTORIES) {
            val targetDir = File(baseDir, dirName)
            if (!targetDir.exists()) {
                val created = targetDir.mkdirs()
                log("Created directory: ${targetDir.name} (success: $created)")
            } else {
                log("Directory exists: ${targetDir.name} (${targetDir.listFiles()?.size ?: 0} files)")
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
