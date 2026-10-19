// AppAuth integration scaffold for Google OAuth + refresh token persistence
// This file is intentionally small and just wires the AppAuth + encrypted refresh token model. The final runtime integration should be completed in the Android project once the real OAuth client ID is provided by Google Cloud / AI Studio.

package com.selfevolving.container.oauth

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import org.json.JSONObject

class OAuthTokenStore(private val context: Context) {
    private val prefs by lazy {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        EncryptedSharedPreferences.create(
            "oauth_tokens",
            masterKey,
            context,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    fun saveRefreshToken(accountId: String, refreshToken: String) {
        prefs.edit().putString("refresh_token_$accountId", refreshToken).apply()
    }

    fun getRefreshToken(accountId: String): String? {
        return prefs.getString("refresh_token_$accountId", null)
    }

    fun saveAccessToken(accountId: String, accessToken: String, expiresAtMs: Long) {
        prefs.edit().putString("access_token_$accountId", accessToken).apply()
        prefs.edit().putLong("access_expiry_$accountId", expiresAtMs).apply()
    }

    fun getAccessToken(accountId: String): String? {
        return prefs.getString("access_token_$accountId", null)
    }

    fun getAccessExpiry(accountId: String): Long {
        return prefs.getLong("access_expiry_$accountId", 0L)
    }

    fun clearAccount(accountId: String) {
        prefs.edit()
            .remove("refresh_token_$accountId")
            .remove("access_token_$accountId")
            .remove("access_expiry_$accountId")
            .apply()
    }

    fun saveAccountMeta(accountId: String, email: String, displayName: String) {
        val obj = JSONObject().apply {
            put("email", email)
            .put("displayName", displayName)
        }
        prefs.edit().putString("meta_$accountId", obj.toString()).apply()
    }
}
