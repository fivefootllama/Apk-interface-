import React, { useState } from 'react';
import { ProviderItem } from '../types/blueprint';
import { 
  Network, 
  RotateCw, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Zap, 
  Flame, 
  Database,
  ArrowRight,
  ShieldAlert,
  Send,
  Sliders
} from 'lucide-react';

export const RouterFailoverTester: React.FC = () => {
  const [providers, setProviders] = useState<ProviderItem[]>([
    {
      id: 'p1',
      name: 'Google AI Studio',
      providerType: 'GEMINI',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
      apiKey: 'AIzaSy...7k9Q',
      modelName: 'gemini-2.5-flash',
      status: 'active',
      failureCount: 0,
      tagsSupported: ['#general', '#multimodal', '#fast']
    },
    {
      id: 'p2',
      name: 'Anthropic Claude Engine',
      providerType: 'ANTHROPIC',
      baseUrl: 'https://api.anthropic.com/v1',
      apiKey: 'sk-ant-...x49a',
      modelName: 'claude-3-7-sonnet-20250219',
      status: 'standby',
      failureCount: 0,
      tagsSupported: ['#reasoning', '#codegen', '#critic']
    },
    {
      id: 'p3',
      name: 'Grok / Groq Platform',
      providerType: 'GROK',
      baseUrl: 'https://api.groq.com/openai/v1',
      apiKey: 'xai-...92c0',
      modelName: 'grok-2-latest',
      status: 'standby',
      failureCount: 0,
      tagsSupported: ['#versatile', '#speed', '#automation']
    },
    {
      id: 'p4',
      name: 'Hugging Face Hub Gateway',
      providerType: 'HUGGINGFACE',
      baseUrl: 'https://api-inference.huggingface.co/v1',
      apiKey: 'hf_...38bb',
      modelName: 'deepseek-ai/DeepSeek-R1',
      status: 'standby',
      failureCount: 0,
      tagsSupported: ['#opensource', '#coder', '#deepseek']
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [simulateRateLimitOnP1, setSimulateRateLimitOnP1] = useState<boolean>(true);
  const [simulateNetworkDropOnP2, setSimulateNetworkDropOnP2] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [queryResult, setQueryResult] = useState<any>(null);

  const [userQuery, setUserQuery] = useState<string>(
    'Analyze screen state and return the optimal (x, y) coordinates to dismiss the sponsored ad in structured JSON format.'
  );

  const handleSimulateFailover = () => {
    setIsExecuting(true);
    setExecutionLog([]);
    setQueryResult(null);

    const logs: string[] = [];
    const log = (msg: string) => {
      logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
      setExecutionLog([...logs]);
    };

    log('MultiProviderRouter.execute_query() invoked.');
    log(`Target Query: "${userQuery}"`);

    let activeIdx = currentIndex;

    setTimeout(() => {
      // Step 1: Attempt Provider 1
      const p1 = providers[activeIdx];
      log(`Attempt 1: Connecting to [${p1.name}] (${p1.modelName})...`);

      if (simulateRateLimitOnP1 && activeIdx === 0) {
        log(`WARNING: HTTP 429 Too Many Requests received from ${p1.name}!`);
        log(`Provider marked RATE_LIMITED for 60.0s cooldown.`);
        
        // Update provider 1 status
        setProviders(prev => prev.map((p, idx) => idx === 0 ? {
          ...p,
          status: 'rate_limited',
          failureCount: p.failureCount + 1,
          cooldownUntil: Date.now() + 60000
        } : p));

        // Rotate
        activeIdx = (activeIdx + 1) % providers.length;
        setCurrentIndex(activeIdx);
        log(`Auto-switching to next provider: [${providers[activeIdx].name}]`);

        setTimeout(() => {
          // Step 2: Attempt Provider 2
          const p2 = providers[activeIdx];
          log(`Attempt 2: Connecting to [${p2.name}] (${p2.modelName})...`);

          if (simulateNetworkDropOnP2) {
            log(`ERROR: Network timeout connecting to ${p2.name} (Connection reset)`);
            setProviders(prev => prev.map((p, idx) => idx === activeIdx ? {
              ...p,
              status: 'error',
              failureCount: p.failureCount + 1
            } : p));

            activeIdx = (activeIdx + 1) % providers.length;
            setCurrentIndex(activeIdx);
            log(`Auto-switching to fallback provider: [${providers[activeIdx].name}]`);

            setTimeout(() => {
              // Attempt Provider 3
              finishSuccess(activeIdx, logs, log, 3);
            }, 600);
          } else {
            finishSuccess(activeIdx, logs, log, 2);
          }
        }, 700);
      } else {
        finishSuccess(activeIdx, logs, log, 1);
      }
    }, 500);
  };

  const finishSuccess = (activeIdx: number, logs: string[], log: (m: string) => void, attempts: number) => {
    const successProvider = providers[activeIdx];
    log(`SUCCESS: HTTP 200 OK received from [${successProvider.name}].`);
    log(`Payload schema validated: response_format={"type": "json_object"}`);

    const structuredResponse = {
      action: "CLICK",
      target_element: "skip_ad_button",
      view_id: "com.google.android.youtube:id/skip_ad_button",
      coordinates: {
        x: 287.5,
        y: 205.0
      },
      confidence: 0.98,
      reasoning: "Skip Ad button is clickable and visible in active window hierarchy at top right of video frame."
    };

    setQueryResult({
      status: 'success',
      provider: successProvider.name,
      model: successProvider.modelName,
      attempts: attempts,
      structured_data: structuredResponse,
      usage: {
        prompt_tokens: 142,
        completion_tokens: 88,
        total_tokens: 230
      }
    });

    setIsExecuting(false);
  };

  const resetAllProviders = () => {
    setProviders(prev => prev.map(p => ({
      ...p,
      status: 'active',
      failureCount: 0,
      cooldownUntil: undefined
    })));
    setCurrentIndex(0);
    setExecutionLog([]);
    setQueryResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
            <span>PROMPT 5 IMPLEMENTATION</span>
            <span>·</span>
            <span>ROUTER.PY</span>
          </div>
          <h2 className="text-base font-semibold text-white tracking-tight mt-1">
            Multi-Provider API Client & Failover Router
          </h2>
          <p className="text-xs text-zinc-300 mt-1 max-w-2xl">
            Demonstrates automatic key rotation, HTTP 429 Rate Limit interception, network failovers, 
            and structured JSON response handling across Google AI Studio, Groq, OpenRouter, and Ollama.
          </p>
        </div>

        <button
          onClick={resetAllProviders}
          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg border border-zinc-700 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
          <span>Reset Router Cooldowns</span>
        </button>
      </div>

      {/* Provider Priority Hierarchy Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {providers.map((p, idx) => {
          const isSelected = currentIndex === idx;
          return (
            <div
              key={p.id}
              className={`border rounded-xl p-4 transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-zinc-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/20'
                  : 'bg-zinc-900/40 border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">
                  Priority #{idx + 1}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  p.status === 'active'
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                    : p.status === 'rate_limited'
                    ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                    : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                }`}>
                  {p.status.toUpperCase()}
                </span>
              </div>

              <h4 className="text-sm font-semibold text-white truncate">{p.name}</h4>
              <p className="text-xs text-indigo-300 font-mono mt-0.5 truncate">{p.modelName}</p>
              
              <div className="mt-3 pt-2 border-t border-zinc-800 text-[11px] font-mono text-zinc-400 space-y-1">
                <div className="truncate">Key: {p.apiKey.slice(0, 10)}...</div>
                <div>Failures: {p.failureCount}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulation Controls & Query Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Query & Failover Toggles */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Failover & Error Injection Controls</span>
              </span>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulateRateLimitOnP1}
                  onChange={(e) => setSimulateRateLimitOnP1(e.target.checked)}
                  className="rounded border-zinc-700 text-indigo-600 focus:ring-0 accent-indigo-500"
                />
                <div className="text-xs">
                  <div className="text-zinc-200 font-medium">Inject HTTP 429 (Rate Limit) on Provider #1</div>
                  <div className="text-zinc-500">Forces router to catch 429, mark 60s cooldown, and auto-rotate.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulateNetworkDropOnP2}
                  onChange={(e) => setSimulateNetworkDropOnP2(e.target.checked)}
                  className="rounded border-zinc-700 text-indigo-600 focus:ring-0 accent-indigo-500"
                />
                <div className="text-xs">
                  <div className="text-zinc-200 font-medium">Inject Network Dropout on Provider #2</div>
                  <div className="text-zinc-500">Simulates URLError / timeout, triggering secondary failover.</div>
                </div>
              </label>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs text-zinc-400">Structured Tool / Screen Query:</label>
              <textarea
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                rows={3}
                className="w-full p-3 font-mono text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none leading-relaxed resize-none"
              />
            </div>

            <button
              onClick={handleSimulateFailover}
              disabled={isExecuting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {isExecuting ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Routing Query Across Providers...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Execute MultiProviderRouter.execute_query()</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Router Trace Logs & Structured JSON Output */}
        <div className="lg:col-span-6 space-y-4">
          {/* Real-time Log */}
          <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
            <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-white">Failover Interception Logs</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">router.py trace</span>
            </div>

            <div className="p-3 bg-zinc-950 min-h-[140px] max-h-[180px] overflow-y-auto font-mono text-xs text-zinc-300 space-y-1">
              {executionLog.length > 0 ? (
                executionLog.map((line, i) => (
                  <div key={i} className={`leading-relaxed ${
                    line.includes('WARNING') || line.includes('429')
                      ? 'text-amber-400'
                      : line.includes('ERROR')
                      ? 'text-rose-400'
                      : line.includes('SUCCESS')
                      ? 'text-emerald-400 font-semibold'
                      : 'text-zinc-400'
                  }`}>
                    {line}
                  </div>
                ))
              ) : (
                <div className="text-zinc-600 text-xs">Ready. Click execute to begin router query simulation.</div>
              )}
            </div>
          </div>

          {/* Structured JSON Response Result */}
          {queryResult && (
            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
              <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">
                    Validated JSON Payload ({queryResult.provider})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">
                  Total Attempts: {queryResult.attempts}
                </span>
              </div>

              <div className="p-3 font-mono text-xs text-zinc-300 max-h-52 overflow-y-auto bg-zinc-950">
                <pre>{JSON.stringify(queryResult.structured_data, null, 2)}</pre>
              </div>

              <div className="px-4 py-2 bg-zinc-900/40 border-t border-zinc-800 text-[11px] font-mono text-zinc-500 flex items-center justify-between">
                <span>Model: {queryResult.model}</span>
                <span>Tokens: {queryResult.usage.total_tokens}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
