package com.example.container

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.text.InputType
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var statusView: TextView
    private lateinit var logView: TextView
    private lateinit var logScroll: ScrollView
    private lateinit var goalInput: EditText
    private lateinit var toolNameInput: EditText
    private lateinit var toolDescInput: EditText
    private lateinit var startBtn: Button

    private val handler = Handler(Looper.getMainLooper())
    private val poller = object : Runnable {
        override fun run() {
            drainLog()
            startBtn.isEnabled = !AgentRunner.running
            handler.postDelayed(this, 700)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        buildUi()
        // Start Python and wire the engine to filesDir off the main thread.
        Thread {
            try {
                PythonHost.ensureStarted(this)
                appendLog("Python engine ready.")
            } catch (e: Exception) {
                appendLog("Python failed to start: ${e.message}")
            }
        }.start()
    }

    override fun onResume() {
        super.onResume()
        refreshStatus()
        handler.post(poller)
    }

    override fun onPause() {
        super.onPause()
        handler.removeCallbacks(poller)
    }

    private fun buildUi() {
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(16), dp(16), dp(16))
        }

        statusView = TextView(this).apply { textSize = 13f }
        root.addView(statusView)

        root.addView(Button(this).apply {
            text = "Manage API keys"
            setOnClickListener { startActivity(Intent(this@MainActivity, KeysActivity::class.java)) }
        })
        root.addView(Button(this).apply {
            text = "Accessibility settings"
            setOnClickListener { startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)) }
        })

        goalInput = EditText(this).apply {
            hint = "Goal, e.g. \"Open Settings and turn on Wi-Fi\""
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_MULTI_LINE
            minLines = 2
        }
        root.addView(goalInput)

        val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        startBtn = Button(this).apply {
            text = "Start agent"
            setOnClickListener { startAgent() }
        }
        row.addView(startBtn, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
        row.addView(Button(this).apply {
            text = "Stop"
            setOnClickListener { AgentRunner.stop(this@MainActivity); appendLog("Stop requested.") }
        }, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
        root.addView(row)

        root.addView(TextView(this).apply { text = "Generate a tool (models write it, sandbox tests it)"; textSize = 13f })
        toolNameInput = EditText(this).apply { hint = "file name, e.g. battery_info.py"; setSingleLine() }
        toolDescInput = EditText(this).apply { hint = "what the tool should do" }
        root.addView(toolNameInput)
        root.addView(toolDescInput)
        root.addView(Button(this).apply {
            text = "Generate tool"
            setOnClickListener { generateTool() }
        })

        logView = TextView(this).apply { textSize = 12f; setTextIsSelectable(true) }
        logScroll = ScrollView(this).apply { addView(logView) }
        root.addView(logScroll, LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f))

        setContentView(root)
    }

    private fun startAgent() {
        if (!SystemBridgeService.isConnected()) {
            toast("Enable the accessibility service first")
            startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
            return
        }
        val goal = goalInput.text.toString().trim()
        if (goal.isEmpty()) { toast("Enter a goal"); return }
        appendLog("Starting agent…")
        AgentRunner.start(this, goal) { result -> appendLog("Result: $result") }
    }

    private fun generateTool() {
        val name = toolNameInput.text.toString().trim()
        val desc = toolDescInput.text.toString().trim()
        if (!Regex("^[A-Za-z][A-Za-z0-9_]*\\.py$").matches(name)) {
            toast("File name must look like my_tool.py"); return
        }
        if (desc.isEmpty()) { toast("Describe the tool"); return }
        appendLog("Generating $name…")
        AgentRunner.generateTool(this, name, desc) { result -> appendLog("Tool result: $result") }
    }

    private fun refreshStatus() {
        val svc = if (SystemBridgeService.isConnected()) "enabled" else "NOT enabled"
        val n = try { SecureKeyStore.usableProviderCount(this) } catch (e: Exception) { 0 }
        val env = try { EnvironmentProbe.summary() } catch (e: Exception) { emptyMap<String, Any>() }
        val tier = if (env["rooted"] == true) "rooted (extra tools not yet enabled)" else "standard (not rooted)"
        statusView.text = "Accessibility service: $svc\nProviders ready (enabled + key): $n\nDevice tier: $tier"
    }

    private fun drainLog() {
        try {
            val text = AgentRunner.drainLog(this)
            if (text.isNotEmpty()) appendLog(text)
        } catch (e: Exception) {
            // Python not ready yet; try again on the next poll.
        }
    }

    private fun appendLog(msg: String) {
        runOnUiThread {
            logView.append(msg + "\n")
            logScroll.post { logScroll.fullScroll(ScrollView.FOCUS_DOWN) }
        }
    }

    private fun toast(msg: String) = Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
    private fun dp(v: Int) = (v * resources.displayMetrics.density).toInt()
}
