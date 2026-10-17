package com.selfevolving.container

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
