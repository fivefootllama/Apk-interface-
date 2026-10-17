import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Activity, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Trash2, 
  Layers, 
  Sliders, 
  ChevronRight,
  Server,
  Play,
  RotateCcw
} from 'lucide-react';

interface ThreadInfo {
  id: string;
  name: string;
  type: 'CPython Main' | 'Watchdog' | 'AST Worker' | 'A11y Bridge' | 'Garbage Collector';
  state: 'RUNNING' | 'WAITING' | 'IDLE' | 'ACTIVE';
  cpuShare: number;
  gilHold: boolean;
}

export const SystemPerformanceMonitor: React.FC = () => {
  // Live system metrics
  const [cpuUsage, setCpuUsage] = useState<number>(38.4);
  const [memoryUsage, setMemoryUsage] = useState<number>(768); // MB
  const maxMemory = 2048; // MB container cap
  const memoryPercent = Math.round((memoryUsage / maxMemory) * 100);

  // Per-core utilization (8 virtual cores allocated to Android Container)
  const [coreLoads, setCoreLoads] = useState<number[]>([42, 35, 51, 28, 44, 30, 22, 55]);

  // Chaquopy Runtime status
  const [gilAcquired, setGilAcquired] = useState<boolean>(false);
  const [pythonVersion] = useState<string>('3.11.8 (Chaquopy 15.0.1 runtime)');
  const [activeThreads, setActiveThreads] = useState<ThreadInfo[]>([
    { id: 'T-101', name: 'Chaquopy-CPython-Main', type: 'CPython Main', state: 'RUNNING', cpuShare: 16.2, gilHold: true },
    { id: 'T-102', name: 'Sandbox-Dynamic-Watchdog', type: 'Watchdog', state: 'ACTIVE', cpuShare: 4.8, gilHold: false },
    { id: 'T-103', name: 'AST-Static-Validator-Daemon', type: 'AST Worker', state: 'IDLE', cpuShare: 1.1, gilHold: false },
    { id: 'T-104', name: 'A11y-Event-Dispatcher', type: 'A11y Bridge', state: 'ACTIVE', cpuShare: 8.5, gilHold: false },
    { id: 'T-105', name: 'Python-GC-Collector', type: 'Garbage Collector', state: 'WAITING', cpuShare: 0.4, gilHold: false }
  ]);

  // Live telemetry polling
  const [isLiveTelemetry, setIsLiveTelemetry] = useState<boolean>(true);
  const [lastGcTime, setLastGcTime] = useState<string>('Just now');
  const [isCollectingGc, setIsCollectingGc] = useState<boolean>(false);

  // Check alert condition: CPU or Memory > 85%
  const isCpuCritical = cpuUsage >= 85.0;
  const isMemoryCritical = memoryPercent >= 85;
  const isAlertActive = isCpuCritical || isMemoryCritical;

  // Background fluctuation simulation
  useEffect(() => {
    if (!isLiveTelemetry) return;

    const interval = setInterval(() => {
      // Natural jitter around current values unless in manual override
      setCpuUsage(prev => {
        if (prev >= 85) {
          // Keep in high range during spike test with minor jitter
          const jitter = (Math.random() - 0.45) * 3;
          return Math.min(99.5, Math.max(85.1, +(prev + jitter).toFixed(1)));
        }
        const delta = (Math.random() - 0.5) * 4;
        return Math.min(82, Math.max(24, +(prev + delta).toFixed(1)));
      });

      setMemoryUsage(prev => {
        if (prev >= maxMemory * 0.85) {
          // Keep in high range during spike
          const jitter = Math.floor((Math.random() - 0.5) * 15);
          return Math.min(maxMemory - 20, Math.max(Math.floor(maxMemory * 0.85) + 5, prev + jitter));
        }
        const delta = Math.floor((Math.random() - 0.5) * 12);
        return Math.min(1450, Math.max(680, prev + delta));
      });

      setCoreLoads(prev => 
        prev.map(load => {
          const delta = Math.floor((Math.random() - 0.5) * 8);
          return Math.min(98, Math.max(12, load + delta));
        })
      );

      // Chaquopy GIL toggle simulation
      setGilAcquired(prev => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLiveTelemetry]);

  // Manual Trigger: Simulate Resource Spike (>85%)
  const handleSimulateSpike = () => {
    setCpuUsage(89.4);
    setMemoryUsage(1820); // 88.8% of 2048 MB
    setCoreLoads([92, 88, 94, 86, 90, 84, 87, 85]);
    setGilAcquired(true);
    setActiveThreads(prev => 
      prev.map(t => ({
        ...t,
        state: 'RUNNING',
        cpuShare: t.name.includes('Main') ? 48.5 : +(t.cpuShare * 2.2).toFixed(1)
      }))
    );
  };

  // Manual Trigger: Normalize load to healthy status
  const handleNormalizeLoad = () => {
    setCpuUsage(34.2);
    setMemoryUsage(730); // ~35.6%
    setCoreLoads([32, 28, 41, 35, 29, 33, 25, 38]);
    setGilAcquired(false);
    setActiveThreads([
      { id: 'T-101', name: 'Chaquopy-CPython-Main', type: 'CPython Main', state: 'RUNNING', cpuShare: 14.2, gilHold: false },
      { id: 'T-102', name: 'Sandbox-Dynamic-Watchdog', type: 'Watchdog', state: 'ACTIVE', cpuShare: 3.5, gilHold: false },
      { id: 'T-103', name: 'AST-Static-Validator-Daemon', type: 'AST Worker', state: 'IDLE', cpuShare: 0.8, gilHold: false },
      { id: 'T-104', name: 'A11y-Event-Dispatcher', type: 'A11y Bridge', state: 'ACTIVE', cpuShare: 7.2, gilHold: false },
      { id: 'T-105', name: 'Python-GC-Collector', type: 'Garbage Collector', state: 'WAITING', cpuShare: 0.2, gilHold: false }
    ]);
  };

  // Manual Trigger: Run Chaquopy Garbage Collector
  const handleRunGc = () => {
    setIsCollectingGc(true);
    setTimeout(() => {
      setMemoryUsage(prev => Math.max(680, prev - 180));
      setLastGcTime(new Date().toLocaleTimeString());
      setIsCollectingGc(false);
    }, 600);
  };

  return (
    <div 
      className={`depth-card rounded-xl p-5 border transition-all duration-300 relative overflow-hidden ${
        isAlertActive 
          ? 'card-alert-pulse border-red-500/70 bg-gradient-to-b from-red-950/20 via-zinc-900 to-zinc-900' 
          : 'border-zinc-800'
      }`}
    >
      {/* Visual Alert Pulsating Banner if CPU or Memory > 85% */}
      {isAlertActive && (
        <div className="mb-4 p-3 rounded-lg bg-red-950/70 border border-red-500/50 flex items-center justify-between gap-3 text-red-200 animate-pulse">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold tracking-wide uppercase text-red-300">
                Performance Alert (Threshold &gt; 85% Exceeded):
              </span>{' '}
              {isCpuCritical && isMemoryCritical 
                ? 'Both CPU and Memory allocations exceed safe threshold (>85%). Chaquopy thread latency elevated.'
                : isCpuCritical 
                ? `Container CPU usage reached ${cpuUsage}% (>85%). Core throttling risk.`
                : `Container Memory reached ${memoryPercent}% (${memoryUsage} MB / ${maxMemory} MB). Risk of Out-Of-Memory kill.`
              }
            </div>
          </div>
          <button
            onClick={handleNormalizeLoad}
            className="btn-tactile px-2.5 py-1 rounded bg-red-800 hover:bg-red-700 text-white text-[11px] font-mono shrink-0"
          >
            Reset Load
          </button>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className={isAlertActive ? 'text-red-400 font-bold' : 'text-emerald-400'}>
              {isAlertActive ? 'ALERT: HIGH RESOURCE LOAD' : 'CONTAINER TELEMETRY'}
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-400">Android ART + Chaquopy CPython VM</span>
            {isAlertActive && (
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/40 animate-pulse">
                &gt;85% LIMIT BREACH
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2 mt-0.5">
            <Activity className={`w-4 h-4 ${isAlertActive ? 'text-red-400 animate-bounce' : 'text-emerald-400'}`} />
            <span>Real-Time System Performance Monitor</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Hardware telemetry tracking container CPU load, allocated JVM/CPython heap, and native execution thread pool.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsLiveTelemetry(prev => !prev)}
            className={`btn-tactile px-3 py-1.5 rounded-lg text-xs font-semibold gap-1.5 ${
              isLiveTelemetry ? 'btn-tactile-secondary text-emerald-300' : 'btn-tactile-secondary text-zinc-400'
            }`}
            title="Toggle live telemetry updates"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLiveTelemetry ? 'animate-spin' : ''}`} />
            <span>{isLiveTelemetry ? 'Live Feed On' : 'Feed Paused'}</span>
          </button>

          <button
            onClick={handleSimulateSpike}
            className={`btn-tactile px-3 py-1.5 rounded-lg text-xs font-semibold gap-1.5 ${
              isAlertActive ? 'bg-red-600 text-white' : 'btn-tactile-amber'
            }`}
            title="Simulate high workload (>85%) to test visual alert and pulsating animation"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Spike (&gt;85%)</span>
          </button>

          <button
            onClick={handleNormalizeLoad}
            className="btn-tactile btn-tactile-secondary px-3 py-1.5 rounded-lg text-xs font-semibold gap-1.5 text-zinc-300"
            title="Normalize resources back to nominal levels"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Normalize</span>
          </button>

          <button
            onClick={handleRunGc}
            disabled={isCollectingGc}
            className="btn-tactile btn-tactile-secondary px-3 py-1.5 rounded-lg text-xs font-semibold gap-1.5 text-zinc-300"
            title="Run Python gc.collect() to release unused CPython heap"
          >
            <Trash2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isCollectingGc ? 'Collecting GC...' : 'gc.collect()'}</span>
          </button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Metric 1: CPU Usage */}
        <div className={`depth-well rounded-xl p-4 border transition-all ${
          isCpuCritical ? 'border-red-500/60 bg-red-950/20' : 'border-zinc-800/80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${
                isCpuCritical ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
              }`}>
                <Cpu className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-zinc-200">Container CPU Load</span>
            </div>
            <span className={`text-base font-mono font-bold ${
              isCpuCritical ? 'text-red-400 animate-pulse' : cpuUsage > 65 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {cpuUsage.toFixed(1)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden border border-zinc-800 my-2">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                isCpuCritical ? 'bg-gradient-to-r from-red-600 to-red-400 animate-pulse' : 
                cpuUsage > 65 ? 'bg-gradient-to-r from-amber-500 to-amber-300' : 
                'bg-gradient-to-r from-emerald-600 to-emerald-400'
              }`}
              style={{ width: `${Math.min(100, cpuUsage)}%` }}
            />
          </div>

          {/* Per-Core Distribution */}
          <div className="mt-3 pt-3 border-t border-zinc-800/60">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5 font-mono">
              <span>8-Core CGroup Allocation</span>
              <span>2.40 GHz (CFS 100%)</span>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {coreLoads.map((load, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div className="w-full bg-zinc-900 h-10 rounded overflow-hidden flex flex-col justify-end p-0.5 border border-zinc-800">
                    <div 
                      className={`w-full rounded-sm transition-all duration-300 ${
                        load > 85 ? 'bg-red-500' : load > 60 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ height: `${load}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500">C{idx}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Metric 2: Memory Usage */}
        <div className={`depth-well rounded-xl p-4 border transition-all ${
          isMemoryCritical ? 'border-red-500/60 bg-red-950/20' : 'border-zinc-800/80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${
                isMemoryCritical ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/10 text-cyan-400'
              }`}>
                <Server className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-zinc-200">Container Heap & Memory</span>
            </div>
            <span className={`text-base font-mono font-bold ${
              isMemoryCritical ? 'text-red-400 animate-pulse' : memoryPercent > 65 ? 'text-amber-400' : 'text-cyan-400'
            }`}>
              {memoryPercent}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden border border-zinc-800 my-2">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                isMemoryCritical ? 'bg-gradient-to-r from-red-600 to-red-400 animate-pulse' : 
                memoryPercent > 65 ? 'bg-gradient-to-r from-amber-500 to-amber-300' : 
                'bg-gradient-to-r from-cyan-600 to-cyan-400'
              }`}
              style={{ width: `${Math.min(100, memoryPercent)}%` }}
            />
          </div>

          {/* Memory Breakdown */}
          <div className="mt-3 pt-3 border-t border-zinc-800/60 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Total Allocated:</span>
              <span className="font-mono text-zinc-200 font-semibold">{memoryUsage} MB / {maxMemory} MB</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">CPython Native Heap:</span>
              <span className="font-mono text-emerald-400">{Math.round(memoryUsage * 0.42)} MB</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Dalvik/ART JVM Heap:</span>
              <span className="font-mono text-cyan-400">{Math.round(memoryUsage * 0.41)} MB</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">A11y Node Cache Buffer:</span>
              <span className="font-mono text-zinc-400">{Math.round(memoryUsage * 0.17)} MB</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Chaquopy Python Runtime & Thread Status */}
        <div className="depth-well rounded-xl p-4 border border-zinc-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-zinc-200">Chaquopy Python Threads</span>
            </div>
            <span className="text-xs font-mono bg-violet-950/50 text-violet-300 border border-violet-800 px-2 py-0.5 rounded">
              {activeThreads.length} Threads Active
            </span>
          </div>

          {/* GIL & Runtime Badges */}
          <div className="grid grid-cols-2 gap-2 my-2 text-[11px]">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded p-1.5">
              <div className="text-zinc-500">GIL State:</div>
              <div className="font-mono font-bold flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${gilAcquired ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                <span className={gilAcquired ? 'text-amber-300' : 'text-emerald-300'}>
                  {gilAcquired ? 'ACQUIRED (Exec)' : 'RELEASED (Bridge)'}
                </span>
              </div>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded p-1.5">
              <div className="text-zinc-500">Last GC Sweep:</div>
              <div className="font-mono font-semibold text-zinc-300 mt-0.5">
                {lastGcTime}
              </div>
            </div>
          </div>

          {/* Thread List Details */}
          <div className="mt-2 space-y-1.5 max-h-24 overflow-y-auto pr-1">
            {activeThreads.map(t => (
              <div 
                key={t.id} 
                className="flex items-center justify-between p-1 rounded bg-zinc-900/50 border border-zinc-800/40 text-[10px] font-mono"
              >
                <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    t.state === 'RUNNING' ? 'bg-emerald-400' :
                    t.state === 'ACTIVE' ? 'bg-cyan-400' :
                    'bg-zinc-500'
                  }`} />
                  <span className="text-zinc-300 truncate">{t.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">{t.state}</span>
                  <span className="text-zinc-300 font-semibold">{t.cpuShare}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
