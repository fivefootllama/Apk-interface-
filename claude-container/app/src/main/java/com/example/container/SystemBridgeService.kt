package com.example.container

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

/**
 * Accessibility service exposing the screen tree and input actions.
 *
 * Python reaches it through the static bridge. Keep exactly one source-of-truth
 * text-entry API here to avoid Kotlin duplicate-symbol failures during compilation.
 */
class SystemBridgeService : AccessibilityService() {

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        Log.i(TAG, "SystemBridgeService connected")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Events are not processed eagerly; the tree is pulled on demand.
    }

    override fun onInterrupt() {
        Log.w(TAG, "SystemBridgeService interrupted")
    }

    override fun onUnbind(intent: android.content.Intent?): Boolean {
        if (instance === this) instance = null
        return super.onUnbind(intent)
    }

    // ---------- Screen hierarchy ----------

    fun buildTreeJson(maxDepth: Int = 40): String {
        val root = rootInActiveWindow ?: return JSONObject().put("error", "no_active_window").toString()
        return try {
            nodeToJson(root, 0, maxDepth).toString()
        } finally {
            @Suppress("DEPRECATION")
            root.recycle()
        }
    }

    fun buildTreeText(maxDepth: Int = 40): String {
        val root = rootInActiveWindow ?: return "<no active window>"
        val sb = StringBuilder()
        try {
            nodeToText(root, 0, maxDepth, sb)
        } finally {
            @Suppress("DEPRECATION")
            root.recycle()
        }
        return sb.toString()
    }

    private fun nodeToJson(node: AccessibilityNodeInfo, depth: Int, maxDepth: Int): JSONObject {
        val bounds = Rect()
        node.getBoundsInScreen(bounds)
        val obj = JSONObject()
            .put("class", node.className?.toString() ?: "")
            .put("package", node.packageName?.toString() ?: "")
            .put("text", if (node.isPassword) "" else (node.text?.toString() ?: ""))
            .put("desc", node.contentDescription?.toString() ?: "")
            .put("id", node.viewIdResourceName ?: "")
            .put("clickable", node.isClickable)
            .put("scrollable", node.isScrollable)
            .put("editable", node.isEditable)
            .put("enabled", node.isEnabled)
            .put("password", node.isPassword)
            .put("focused", node.isFocused)
            .put("bounds", JSONArray(listOf(bounds.left, bounds.top, bounds.right, bounds.bottom)))
            .put("center", JSONArray(listOf(bounds.centerX(), bounds.centerY())))
        if (depth < maxDepth && node.childCount > 0) {
            val children = JSONArray()
            for (i in 0 until node.childCount) {
                val child = node.getChild(i) ?: continue
                try {
                    children.put(nodeToJson(child, depth + 1, maxDepth))
                } finally {
                    @Suppress("DEPRECATION")
                    child.recycle()
                }
            }
            obj.put("children", children)
        }
        return obj
    }

    private fun nodeToText(node: AccessibilityNodeInfo, depth: Int, maxDepth: Int, sb: StringBuilder) {
        val bounds = Rect()
        node.getBoundsInScreen(bounds)
        sb.append("  ".repeat(depth))
            .append(node.className?.toString()?.substringAfterLast('.') ?: "?")
        if (!node.isPassword) node.text?.let { sb.append(" text=\"").append(it).append('"') }
        node.contentDescription?.let { sb.append(" desc=\"").append(it).append('"') }
        node.viewIdResourceName?.let { sb.append(" id=").append(it) }
        if (node.isClickable) sb.append(" [clickable]")
        if (node.isEditable) sb.append(" [editable]")
        sb.append(" @(").append(bounds.centerX()).append(',').append(bounds.centerY()).append(")\n")
        if (depth < maxDepth) {
            for (i in 0 until node.childCount) {
                val child = node.getChild(i) ?: continue
                try {
                    nodeToText(child, depth + 1, maxDepth, sb)
                } finally {
                    @Suppress("DEPRECATION")
                    child.recycle()
                }
            }
        }
    }

    // ---------- Actions ----------

    fun dispatchTap(x: Float, y: Float, durationMs: Long = 50): Boolean {
        val path = Path().apply { moveTo(x, y) }
        return dispatchPath(path, 0, durationMs)
    }

    fun dispatchSwipe(x1: Float, y1: Float, x2: Float, y2: Float, durationMs: Long = 300): Boolean {
        val path = Path().apply {
            moveTo(x1, y1)
            lineTo(x2, y2)
        }
        return dispatchPath(path, 0, durationMs)
    }

    private fun dispatchPath(path: Path, startDelay: Long, duration: Long): Boolean {
        val gesture = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, startDelay, duration.coerceAtLeast(1)))
            .build()
        val latch = CountDownLatch(1)
        var ok = false
        val dispatched = dispatchGesture(gesture, object : GestureResultCallback() {
            override fun onCompleted(gestureDescription: GestureDescription?) {
                ok = true
                latch.countDown()
            }

            override fun onCancelled(gestureDescription: GestureDescription?) {
                ok = false
                latch.countDown()
            }
        }, null)
        if (!dispatched) return false
        latch.await(duration + 2000, TimeUnit.MILLISECONDS)
        return ok
    }

    // Single source of truth for text entry: keep this instance method and a single
    // static wrapper only. This avoids duplicate Kotlin declarations during compile.
    fun performTypeText(text: String): Boolean {
        val root = rootInActiveWindow ?: return false
        val focused = root.findFocus(AccessibilityNodeInfo.FOCUS_INPUT) ?: return false
        val args = android.os.Bundle().apply {
            putCharSequence(
                AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE,
                text
            )
        }
        return focused.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args)
    }

    companion object {
        private const val TAG = "SystemBridge"

        @Volatile
        @JvmStatic
        var instance: SystemBridgeService? = null
            private set

        // ---- Python-facing static API (all return simple types) ----

        @JvmStatic fun isConnected(): Boolean = instance != null

        @JvmStatic fun getScreenTreeJson(): String =
            instance?.buildTreeJson() ?: """{"error":"service_not_connected"}"""

        @JvmStatic fun getScreenTreeText(): String =
            instance?.buildTreeText() ?: "<service not connected>"

        @JvmStatic fun back(): Boolean =
            instance?.performGlobalAction(AccessibilityService.GLOBAL_ACTION_BACK) ?: false

        @JvmStatic fun home(): Boolean =
            instance?.performGlobalAction(AccessibilityService.GLOBAL_ACTION_HOME) ?: false

        @JvmStatic fun recents(): Boolean =
            instance?.performGlobalAction(AccessibilityService.GLOBAL_ACTION_RECENTS) ?: false

        @JvmStatic fun tap(x: Int, y: Int): Boolean =
            instance?.dispatchTap(x.toFloat(), y.toFloat()) ?: false

        @JvmStatic fun swipe(x1: Int, y1: Int, x2: Int, y2: Int, durationMs: Int): Boolean =
            instance?.dispatchSwipe(x1.toFloat(), y1.toFloat(), x2.toFloat(), y2.toFloat(), durationMs.toLong())
                ?: false

        @JvmStatic fun typeText(text: String): Boolean =
            instance?.performTypeText(text) ?: false
    }
}
