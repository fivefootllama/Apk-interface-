package com.example.container

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import org.json.JSONArray
import org.json.JSONObject
import java.net.URI
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

data class ProviderConfig(
    val id: String,
    val displayName: String,
    var baseUrl: String,
    var model: String,
    var enabled: Boolean,
    val keyless: Boolean,
    val keys: MutableList<String>,
    val apiType: String = "openai",
)

/**
 * Encrypted storage for provider settings and API keys.
 *
 * - One AES-256-GCM key lives in the Android Keystore (hardware-backed where available)
 *   and never leaves it. A fresh random IV is used for every write.
 * - Only ciphertext is written to app-private SharedPreferences.
 * - Keys are never logged. The UI shows only the last 4 characters.
 */
object SecureKeyStore {
    private const val ANDROID_KS = "AndroidKeyStore"
    private const val ALIAS = "container_master_key_v1"
    private const val PREFS = "secure_store"
    private const val BLOB = "providers_blob"
    private const val GCM_TAG_BITS = 128
    private val LOCAL_HTTP_HOSTS = setOf("localhost", "127.0.0.1", "10.0.2.2")

    // ---------- crypto ----------

    private fun masterKey(): SecretKey {
        val ks = KeyStore.getInstance(ANDROID_KS).apply { load(null) }
        (ks.getKey(ALIAS, null) as? SecretKey)?.let { return it }
        val gen = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KS)
        gen.init(
            KeyGenParameterSpec.Builder(
                ALIAS, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
            )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .setRandomizedEncryptionRequired(true)
                .build()
        )
        return gen.generateKey()
    }

    private fun encrypt(plain: ByteArray): String {
        val c = Cipher.getInstance("AES/GCM/NoPadding")
        c.init(Cipher.ENCRYPT_MODE, masterKey())
        val ct = c.doFinal(plain)
        return Base64.encodeToString(c.iv, Base64.NO_WRAP) + ":" + Base64.encodeToString(ct, Base64.NO_WRAP)
    }

    private fun decrypt(blob: String): ByteArray {
        val parts = blob.split(":", limit = 2)
        require(parts.size == 2) { "bad blob" }
        val iv = Base64.decode(parts[0], Base64.NO_WRAP)
        val ct = Base64.decode(parts[1], Base64.NO_WRAP)
        val c = Cipher.getInstance("AES/GCM/NoPadding")
        c.init(Cipher.DECRYPT_MODE, masterKey(), GCMParameterSpec(GCM_TAG_BITS, iv))
        return c.doFinal(ct)
    }

    // ---------- defaults ----------

    fun defaults(): MutableList<ProviderConfig> = mutableListOf(
        ProviderConfig("groq", "Groq", "https://api.groq.com/openai/v1",
            "llama-3.3-70b-versatile", true, false, mutableListOf()),
        ProviderConfig("openrouter", "OpenRouter", "https://openrouter.ai/api/v1",
            "meta-llama/llama-3.3-70b-instruct", true, false, mutableListOf()),
        ProviderConfig("google", "Google AI Studio", "https://generativelanguage.googleapis.com/v1beta/openai",
            "gemini-2.0-flash", true, false, mutableListOf()),
        ProviderConfig("claude", "Claude (Anthropic)", "https://api.anthropic.com",
            "claude-sonnet-5-5", true, false, mutableListOf(), apiType = "anthropic"),
        ProviderConfig("ollama", "Ollama (local)", "http://127.0.0.1:11434/v1",
            "llama3.1", false, true, mutableListOf()),
    )

    // ---------- persistence ----------

    @Synchronized
    fun load(ctx: Context): MutableList<ProviderConfig> {
        val result = defaults()
        val blob = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(BLOB, null)
            ?: return result
        try {
            val arr = JSONArray(String(decrypt(blob), Charsets.UTF_8))
            for (i in 0 until arr.length()) {
                val o = arr.getJSONObject(i)
                val cfg = result.firstOrNull { it.id == o.getString("id") } ?: continue
                cfg.baseUrl = o.optString("baseUrl", cfg.baseUrl)
                cfg.model = o.optString("model", cfg.model)
                cfg.enabled = o.optBoolean("enabled", cfg.enabled)
                val ks = o.optJSONArray("keys")
                if (ks != null) for (j in 0 until ks.length()) cfg.keys.add(ks.getString(j))
            }
        } catch (e: Exception) {
            // Master key invalidated or blob corrupted: fall back to empty defaults.
        }
        return result
    }

    @Synchronized
    fun save(ctx: Context, configs: List<ProviderConfig>) {
        val arr = JSONArray()
        for (c in configs) {
            arr.put(
                JSONObject()
                    .put("id", c.id)
                    .put("baseUrl", c.baseUrl)
                    .put("model", c.model)
                    .put("enabled", c.enabled)
                    .put("keys", JSONArray(c.keys))
            )
        }
        val enc = encrypt(arr.toString().toByteArray(Charsets.UTF_8))
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(BLOB, enc).commit()
    }

    @Synchronized
    fun wipe(ctx: Context) {
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().clear().commit()
        try {
            KeyStore.getInstance(ANDROID_KS).apply { load(null) }.deleteEntry(ALIAS)
        } catch (e: Exception) {
            // Nothing to delete or Keystore unavailable; the stored data is already cleared.
        }
    }

    // ---------- helpers ----------

    fun mask(key: String): String =
        if (key.length <= 8) "••••" else "••••••••" + key.takeLast(4)

    /** https always; plain http only for loopback / emulator host so keys never cross a network in clear. */
    fun isSafeUrl(url: String): Boolean {
        return try {
            val u = URI(url.trim())
            when (u.scheme?.lowercase()) {
                "https" -> !u.host.isNullOrBlank()
                "http" -> u.host?.lowercase() in LOCAL_HTTP_HOSTS
                else -> false
            }
        } catch (e: Exception) {
            false
        }
    }

    /** Router entries for one provider: one entry per key, so rotation works across keys. */
    fun entriesFor(cfg: ProviderConfig): JSONArray {
        val out = JSONArray()
        if (cfg.keyless) {
            out.put(
                JSONObject().put("name", cfg.id).put("base_url", cfg.baseUrl)
                    .put("api_key", "").put("model", cfg.model).put("keyless", true)
                    .put("api_type", cfg.apiType)
            )
        } else {
            cfg.keys.forEachIndexed { i, k ->
                out.put(
                    JSONObject().put("name", "${cfg.id}#${i + 1}").put("base_url", cfg.baseUrl)
                        .put("api_key", k).put("model", cfg.model).put("api_type", cfg.apiType)
                )
            }
        }
        return out
    }

    /** JSON list for router.py; only enabled providers with a URL that passes [isSafeUrl]. */
    fun toRouterJson(ctx: Context): String {
        val out = JSONArray()
        for (cfg in load(ctx)) {
            if (!cfg.enabled || !isSafeUrl(cfg.baseUrl)) continue
            val entries = entriesFor(cfg)
            for (i in 0 until entries.length()) out.put(entries.get(i))
        }
        return out.toString()
    }

    fun usableProviderCount(ctx: Context): Int =
        load(ctx).count { it.enabled && isSafeUrl(it.baseUrl) && (it.keyless || it.keys.isNotEmpty()) }
}
