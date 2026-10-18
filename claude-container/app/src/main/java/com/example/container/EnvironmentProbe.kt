package com.example.container

import android.os.Build
import java.io.File

/**
 * Reports device capability tier (rooted vs. not) so the model and the UI know what's
 * available. Detecting root does NOT unlock any new agent action by itself: nothing in
 * this app reads that flag to change what the agent is allowed to do. It exists so a
 * future, separately-reviewed capability (e.g. a root-only tool that needs `su`) has a
 * real signal to gate on, instead of assuming access it doesn't have.
 */
object EnvironmentProbe {

    private val SU_PATHS = listOf(
        "/system/bin/su", "/system/xbin/su", "/sbin/su", "/system/su",
        "/system/bin/.ext/.su", "/data/local/xbin/su", "/data/local/bin/su",
        "/data/local/su", "/su/bin/su",
    )

    fun isLikelyRooted(): Boolean {
        if (SU_PATHS.any { File(it).exists() }) return true
        if (Build.TAGS?.contains("test-keys") == true) return true
        return try {
            val p = Runtime.getRuntime().exec(arrayOf("which", "su"))
            p.inputStream.bufferedReader().readLine() != null
        } catch (e: Exception) {
            false
        }
    }

    fun summary(): Map<String, Any> = mapOf(
        "rooted" to isLikelyRooted(),
        "sdkInt" to Build.VERSION.SDK_INT,
        "device" to "${Build.MANUFACTURER} ${Build.MODEL}",
        "abi" to (Build.SUPPORTED_ABIS.firstOrNull() ?: "unknown"),
    )
}
