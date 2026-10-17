package com.example.container

import android.app.AlertDialog
import android.app.KeyguardManager
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.text.InputType
import android.view.WindowManager
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.SwitchCompat
import org.json.JSONObject

/**
 * Key vault screen: one card per provider with enable switch, base URL, model,
 * and any number of API keys (rotated automatically on rate limits).
 *
 * Safeguards: device-credential gate on open, FLAG_SECURE (no screenshots / hidden in
 * recents), keys masked, closes itself when it leaves the foreground, encrypted storage.
 */
class KeysActivity : AppCompatActivity() {

    private var configs: MutableList<ProviderConfig> = mutableListOf()
    private val urlFields = HashMap<String, EditText>()
    private val modelFields = HashMap<String, EditText>()
    private val enableSwitches = HashMap<String, SwitchCompat>()
    private lateinit var content: LinearLayout
    private var authInProgress = false

    private val authLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            authInProgress = false
            if (result.resultCode == RESULT_OK) unlock() else finish()
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE)
        title = "API Keys"

        val km = getSystemService(KEYGUARD_SERVICE) as KeyguardManager
        if (km.isDeviceSecure) {
            @Suppress("DEPRECATION")
            val intent = km.createConfirmDeviceCredentialIntent(
                "API keys", "Confirm it's you to view or change your API keys"
            )
            if (intent != null) {
                authInProgress = true
                authLauncher.launch(intent)
                return
            }
        }
        unlock()
    }

    override fun onStop() {
        super.onStop()
        // Re-lock whenever the screen is left (except while the credential prompt is up).
        if (!authInProgress) finish()
    }

    private fun unlock() {
        configs = SecureKeyStore.load(this)
        val scroll = ScrollView(this)
        content = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(16), dp(16), dp(32))
        }
        scroll.addView(content)
        setContentView(scroll)
        render()
    }

    // ---------- rendering ----------

    private fun render() {
        content.removeAllViews()
        urlFields.clear(); modelFields.clear(); enableSwitches.clear()

        content.addView(label("API Keys", 22f, bold = true))
        content.addView(
            label(
                "Keys are encrypted with a key held in the Android Keystore and shown only as the " +
                    "last 4 characters. Add several keys per provider and the app rotates through " +
                    "them on rate limits (HTTP 429) and errors. Remove a key and add a new one to replace it.",
                13f
            )
        )
        configs.forEach { content.addView(card(it)) }

        content.addView(Button(this).apply {
            text = "Save settings"
            setOnClickListener { if (saveAll()) toast("Saved") }
        })
        content.addView(Button(this).apply {
            text = "Erase all keys"
            setTextColor(Color.RED)
            setOnClickListener {
                AlertDialog.Builder(this@KeysActivity)
                    .setTitle("Erase all keys?")
                    .setMessage("This deletes every stored key and the encryption key. It cannot be undone.")
                    .setPositiveButton("Erase") { _, _ ->
                        SecureKeyStore.wipe(this@KeysActivity)
                        configs = SecureKeyStore.defaults()
                        render()
                    }
                    .setNegativeButton("Cancel", null)
                    .show()
            }
        })
    }

    private fun card(cfg: ProviderConfig): LinearLayout {
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(12), dp(12), dp(12), dp(12))
            background = GradientDrawable().apply {
                setStroke(dp(1), Color.GRAY); cornerRadius = dp(8).toFloat()
            }
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = dp(12) }
        }

        val header = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        header.addView(label(cfg.displayName, 18f, bold = true).apply {
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        })
        val sw = SwitchCompat(this).apply { isChecked = cfg.enabled; text = "On " }
        enableSwitches[cfg.id] = sw
        header.addView(sw)
        card.addView(header)

        card.addView(label("Base URL", 12f))
        val url = EditText(this).apply {
            setText(cfg.baseUrl); inputType = InputType.TYPE_TEXT_VARIATION_URI or InputType.TYPE_CLASS_TEXT
            setSingleLine()
        }
        urlFields[cfg.id] = url; card.addView(url)

        card.addView(label("Model", 12f))
        val model = EditText(this).apply { setText(cfg.model); setSingleLine() }
        modelFields[cfg.id] = model; card.addView(model)
        if (cfg.apiType == "anthropic") {
            card.addView(label("Uses Anthropic's Messages API. Base URL is the host only (no /v1). Get a key at console.anthropic.com.", 12f))
        }

        if (cfg.keyless) {
            card.addView(label("No key needed (local server). Plain http is allowed only for localhost, 127.0.0.1 and 10.0.2.2.", 12f))
        } else {
            card.addView(label("Keys (${cfg.keys.size})", 12f))
            cfg.keys.forEachIndexed { idx, key ->
                val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
                row.addView(label("#${idx + 1}  ${SecureKeyStore.mask(key)}", 14f).apply {
                    typeface = Typeface.MONOSPACE
                    layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
                })
                row.addView(Button(this).apply {
                    text = "Remove"
                    setOnClickListener {
                        AlertDialog.Builder(this@KeysActivity)
                            .setTitle("Remove key #${idx + 1}?")
                            .setPositiveButton("Remove") { _, _ ->
                                syncFields(); cfg.keys.removeAt(idx); persist(); render()
                            }
                            .setNegativeButton("Cancel", null).show()
                    }
                })
                card.addView(row)
            }

            val addRow = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
            val newKey = EditText(this).apply {
                hint = "Paste new key"
                inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
                setSingleLine()
                importantForAutofill = android.view.View.IMPORTANT_FOR_AUTOFILL_NO
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
            }
            addRow.addView(newKey)
            addRow.addView(Button(this).apply {
                text = "Add"
                setOnClickListener {
                    val k = newKey.text.toString().trim()
                    when {
                        k.isEmpty() -> return@setOnClickListener
                        k.any { it.isWhitespace() } -> toast("A key can't contain spaces")
                        k in cfg.keys -> toast("That key is already saved")
                        else -> { syncFields(); cfg.keys.add(k); persist(); render() }
                    }
                }
            })
            card.addView(addRow)
        }

        card.addView(Button(this).apply {
            text = "Test connection"
            setOnClickListener { testProvider(cfg) }
        })
        return card
    }

    // ---------- actions ----------

    private fun syncFields() {
        for (cfg in configs) {
            urlFields[cfg.id]?.let { cfg.baseUrl = it.text.toString().trim() }
            modelFields[cfg.id]?.let { cfg.model = it.text.toString().trim() }
            enableSwitches[cfg.id]?.let { cfg.enabled = it.isChecked }
        }
    }

    private fun persist() {
        try {
            SecureKeyStore.save(this, configs)
        } catch (e: Exception) {
            toast("Could not save securely: ${e.javaClass.simpleName}")
        }
    }

    private fun saveAll(): Boolean {
        syncFields()
        for (cfg in configs) {
            if (!SecureKeyStore.isSafeUrl(cfg.baseUrl)) {
                toast("${cfg.displayName}: use https:// (http only for localhost / 10.0.2.2)")
                return false
            }
            if (cfg.model.isBlank()) {
                toast("${cfg.displayName}: model name is required"); return false
            }
        }
        persist()
        return true
    }

    private fun testProvider(cfg: ProviderConfig) {
        if (!saveAll()) return
        val entries = SecureKeyStore.entriesFor(cfg)
        if (entries.length() == 0) { toast("Add a key first"); return }
        toast("Testing ${cfg.displayName}…")
        Thread {
            val message = try {
                val py = PythonHost.ensureStarted(this)
                val raw = py.getModule("agent").callAttr("test_provider", entries.toString()).toString()
                val o = JSONObject(raw)
                (if (o.optBoolean("ok")) "Success: " else "Failed: ") + o.optString("message")
            } catch (e: Exception) {
                "Failed: ${e.message}"
            }
            runOnUiThread {
                AlertDialog.Builder(this).setTitle(cfg.displayName).setMessage(message)
                    .setPositiveButton("OK", null).show()
            }
        }.start()
    }

    // ---------- small UI helpers ----------

    private fun label(text: String, size: Float, bold: Boolean = false) = TextView(this).apply {
        this.text = text; textSize = size
        if (bold) setTypeface(typeface, Typeface.BOLD)
        setPadding(0, dp(4), 0, dp(4))
    }

    private fun toast(msg: String) = Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
    private fun dp(v: Int) = (v * resources.displayMetrics.density).toInt()
}
