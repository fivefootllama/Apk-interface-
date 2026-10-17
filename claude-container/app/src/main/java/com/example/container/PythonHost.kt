package com.example.container

import android.content.Context
import com.chaquo.python.Python
import com.chaquo.python.android.AndroidPlatform

/** Starts Python once and points the Python engine at this app's files directory. */
object PythonHost {
    @Volatile
    var isReady = false
        private set

    @Synchronized
    fun ensureStarted(ctx: Context): Python {
        val app = ctx.applicationContext
        if (!Python.isStarted()) Python.start(AndroidPlatform(app))
        val py = Python.getInstance()
        if (!isReady) {
            val base = app.filesDir.absolutePath
            py.getModule("loader").callAttr("init", base)
            py.getModule("sandbox_evaluator").callAttr("init", base)
            py.getModule("loader").callAttr("load_all")
            isReady = true
        }
        return py
    }
}
