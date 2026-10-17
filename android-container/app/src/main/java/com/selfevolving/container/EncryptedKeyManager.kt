package com.selfevolving.container

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import org.json.JSONArray
import org.json.JSONObject

/**
 * EncryptedKeyManager provides hardware-backed, AES-256-GCM encrypted storage for AI model API keys.
 * Integrates Android Keystore via EncryptedSharedPreferences and exposes public @JvmStatic bridge
 * methods directly accessible by Chaquopy Python runtime scripts.
 */
class EncryptedKeyManager private constructor(context: Context) {

    companion object {
        private const val TAG = "EncryptedKeyManager"
        private const val PREFS_FILE_NAME = "secure_ai_vault"

        // Provider Identifiers
        const val PROVIDER_ANTHROPIC = "ANTHROPIC"
        const val PROVIDER_GEMINI = "GEMINI"
        const val PROVIDER_GROK = "GROK"
        const val PROVIDER_HUGGINGFACE = "HUGGINGFACE"

        val ALL_PROVIDERS = listOf(
            PROVIDER_ANTHROPIC,
            PROVIDER_GEMINI,
            PROVIDER_GROK,
            PROVIDER_HUGGINGFACE
        )

        @Volatile
        private var instance: EncryptedKeyManager? = null

        fun initialize(context: Context): EncryptedKeyManager {
            return instance ?: synchronized(this) {
                instance ?: EncryptedKeyManager(context.applicationContext).also { instance = it }
            }
        }

        fun getInstance(): EncryptedKeyManager {
            return instance ?: throw IllegalStateException("EncryptedKeyManager has not been initialized. Call initialize(context) in MainActivity.")
        }

        // ====================================================================
        // Static Bridge for Chaquopy Python Invocations
        // ====================================================================

        @JvmStatic
        fun getDecryptedKey(provider: String): String? {
            return instance?.getKey(provider.uppercase())
        }

        @JvmStatic
        fun getSelectedModel(provider: String): String? {
            return instance?.getModel(provider.uppercase())
        }

        @JvmStatic
        fun saveKeySecurely(provider: String, apiKey: String, modelName: String): Boolean {
            return instance?.saveKey(provider.uppercase(), apiKey, modelName) ?: false
        }

        @JvmStatic
        fun removeKeySecurely(provider: String): Boolean {
            return instance?.removeKey(provider.uppercase()) ?: false
        }

        @JvmStatic
        fun listConfiguredProvidersJson(): String {
            val inst = instance ?: return "[]"
            return inst.getConfiguredProvidersJson()
        }
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
        Log.i(TAG, "Hardware-backed EncryptedSharedPreferences initialized successfully with AES256_GCM.")
    }

    /**
     * Encrypts and securely persists the given API key and optional default model name.
     */
    fun saveKey(provider: String, apiKey: String, modelName: String? = null): Boolean {
        val normalized = provider.uppercase()
        if (apiKey.isBlank()) {
            Log.w(TAG, "Refusing to save blank key for $normalized")
            return false
        }

        try {
            securePrefs.edit().apply {
                putString("key_$normalized", apiKey.trim())
                if (!modelName.isNullOrBlank()) {
                    putString("model_$normalized", modelName.trim())
                }
                putLong("updated_$normalized", System.currentTimeMillis())
                apply()
            }
            Log.i(TAG, "Encrypted key securely stored for provider: $normalized")
            return true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to write encrypted key for $normalized", e)
            return false
        }
    }

    /**
     * Decrypts and retrieves the active API key for a provider.
     */
    fun getKey(provider: String): String? {
        val normalized = provider.uppercase()
        return securePrefs.getString("key_$normalized", null)
    }

    /**
     * Retrieves the configured default model for a provider.
     */
    fun getModel(provider: String): String? {
        val normalized = provider.uppercase()
        return securePrefs.getString("model_$normalized", null)
    }

    /**
     * Removes an encrypted key from the secure vault.
     */
    fun removeKey(provider: String): Boolean {
        val normalized = provider.uppercase()
        try {
            securePrefs.edit().apply {
                remove("key_$normalized")
                remove("model_$normalized")
                remove("updated_$normalized")
                apply()
            }
            Log.i(TAG, "Encrypted key deleted for provider: $normalized")
            return true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to remove key for $normalized", e)
            return false
        }
    }

    /**
     * Checks if an encrypted key is configured.
     */
    fun hasKey(provider: String): Boolean {
        val normalized = provider.uppercase()
        val key = securePrefs.getString("key_$normalized", null)
        return !key.isNullOrBlank()
    }

    /**
     * Returns a structured JSON summary of configured providers (never leaking raw keys).
     */
    fun getConfiguredProvidersJson(): String {
        val array = JSONArray()
        for (provider in ALL_PROVIDERS) {
            val key = getKey(provider)
            val model = getModel(provider)
            val updated = securePrefs.getLong("updated_$provider", 0L)

            val obj = JSONObject().apply {
                put("provider", provider)
                put("isConfigured", !key.isNullOrBlank())
                put("model", model ?: getDefaultModelForProvider(provider))
                put("keyPreview", if (key.isNullOrBlank()) "None" else maskKey(key))
                put("lastUpdated", updated)
                put("encryption", "AES-256-GCM / MasterKey")
            }
            array.put(obj)
        }
        return array.toString()
    }

    private fun maskKey(key: String): String {
        if (key.length <= 8) return "****"
        return "${key.take(4)}...${key.takeLast(4)}"
    }

    private fun getDefaultModelForProvider(provider: String): String {
        return when (provider) {
            PROVIDER_ANTHROPIC -> "claude-3-7-sonnet-20250219"
            PROVIDER_GEMINI -> "gemini-2.5-flash"
            PROVIDER_GROK -> "grok-2-latest"
            PROVIDER_HUGGINGFACE -> "deepseek-ai/DeepSeek-R1"
            else -> "default"
        }
    }
}
