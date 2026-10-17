package com.example.container

import android.content.Context
import java.util.concurrent.Executors

/** Runs the Python agent / tool generation off the main thread. Keys are handed to Python in memory only. */
object AgentRunner {
    private val agentExecutor = Executors.newSingleThreadExecutor()
    private val toolExecutor = Executors.newSingleThreadExecutor()

    @Volatile
    var running = false
        private set

    fun start(ctx: Context, goal: String, maxSteps: Int = 25, onDone: (String) -> Unit) {
        val app = ctx.applicationContext
        if (running) { onDone("Agent is already running."); return }
        if (SecureKeyStore.usableProviderCount(app) == 0) {
            onDone("No enabled provider with a key. Open API Keys first."); return
        }
        running = true
        agentExecutor.execute {
            val result = try {
                val py = PythonHost.ensureStarted(app)
                py.getModule("agent").callAttr(
                    "run_goal", SecureKeyStore.toRouterJson(app), goal,
                    app.filesDir.absolutePath, maxSteps
                ).toString()
            } catch (e: Exception) {
                "Agent crashed: ${e.message}"
            } finally {
                running = false
            }
            onDone(result)
        }
    }

    fun stop(ctx: Context) {
        if (PythonHost.isReady) PythonHost.ensureStarted(ctx).getModule("agent").callAttr("request_stop")
    }

    fun drainLog(ctx: Context): String =
        if (!PythonHost.isReady) "" else
            PythonHost.ensureStarted(ctx).getModule("agent").callAttr("drain_log").toString()

    fun generateTool(ctx: Context, filename: String, description: String, onDone: (String) -> Unit) {
        val app = ctx.applicationContext
        if (SecureKeyStore.usableProviderCount(app) == 0) {
            onDone("No enabled provider with a key. Open API Keys first."); return
        }
        toolExecutor.execute {
            val result = try {
                val py = PythonHost.ensureStarted(app)
                py.getModule("agent").callAttr(
                    "generate_tool", SecureKeyStore.toRouterJson(app), filename, description,
                    app.filesDir.absolutePath
                ).toString()
            } catch (e: Exception) {
                "Tool generation crashed: ${e.message}"
            }
            onDone(result)
        }
    }
}
