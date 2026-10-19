// AppAuth + periodic sync scaffold
// This is intentionally small and designed to be the key integration point once the real OAuth client ID and Drive API configuration are supplied.

package com.selfevolving.container.sync

import android.content.Context
import android.util.Log
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

class DriveSyncScheduler(private val context: Context) {
    companion object {
        private const val TAG = "DriveSyncScheduler"
    }

    fun schedulePeriodicSync() {
        try {
            val request = PeriodicWorkRequestBuilder<DriveSyncWorker>(6, TimeUnit.HOURS)
                .build()
            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                "drive_sync_periodic",
                androidx.work.ExistingPeriodicWorkPolicy.UPDATE,
                request
            )
            Log.i(TAG, "Scheduled periodic Drive sync (6h)")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to schedule periodic sync", e)
        }
    }
}
