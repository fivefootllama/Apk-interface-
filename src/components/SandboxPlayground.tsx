import React, { useState } from 'react';
import { 
  Play, 
  ShieldCheck, 
  Terminal, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Code2, 
  AlertTriangle,
  FolderInput,
  FolderOutput,
  Flame
} from 'lucide-react';

export const SandboxPlayground: React.FC = () => {
  const [codeSnippet, setCodeSnippet] = useState<string>(
`# Clean test script for autonomous Android container
def calculate_target_coords(screen_w, screen_h):
    return {"x": screen_w // 2, "y": screen_h // 2}

result = calculate_target_coords(1080, 2400)
print(f"Computed center click: {result}")
`
  );

  const [timeoutSeconds, setTimeoutSeconds] = useState<number>(5.0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [evalBlockResult, setEvalBlockResult] = useState<any>(null);
  const [promotionResult, setPromotionResult] = useState<any>(null);

  // Presets demonstrating the PDF specification rules
  const presets = [
    {
      name: 'Valid Script (Passes Both Phases & Promoted)',
      code: `# Production Android helper module
def run_action():
    coords = [100, 250]
    print(f"Action dispatched to coords: {coords}")
    return {"status": "success", "target": coords}

run_action()`
    },
    {
      name: 'Syntax Error (Caught in Phase 1 AST Check)',
      code: `# Intentional syntax error
def broken_syntax(x, y
    return x + y
`
    },
    {
      name: 'Infinite Loop (Caught in Phase 2 5s Timeout)',
      code: `# Dangerous infinite loop that would freeze the Android container
print("Entering infinite processing loop...")
counter = 0
while True:
    counter += 1
`
    },
    {
      name: 'Runtime Exception (Safe Execution Wrapper Caught)',
      code: `# Runtime exception in user action
def process_data(items):
    print("Attempting division by zero...")
    return 100 / 0

process_data([])`
    }
  ];

  // Client-side simulation of sandbox_evaluator.py rules
  const handleRunEvalBlock = () => {
    setIsRunning(true);
    setPromotionResult(null);

    setTimeout(() => {
      // 1. Static AST check simulation
      const code = codeSnippet.trim();
      
      // Check syntax
      try {
        // Quick syntax check test
        if (code.includes('def broken_syntax(x, y\n')) {
          throw new SyntaxError("expected ':', line 2, offset 23");
        }

        // Check infinite loop
        if (code.includes('while True:')) {
          setEvalBlockResult({
            status: 'error',
            stage: 'execution',
            stdout: 'Entering infinite processing loop...\n',
            stderr: 'Execution timed out in eval_block thread.\n',
            returned_value: null,
            error: {
              type: 'TimeoutError',
              message: 'Execution aborted: exceeded maximum thread time',
              traceback: 'Traceback (most recent call last):\n  File "<eval_block>", line 4, in <module>\n    while True:\nTimeoutError'
            }
          });
          setIsRunning(false);
          return;
        }

        if (code.includes('100 / 0')) {
          setEvalBlockResult({
            status: 'error',
            stage: 'execution',
            stdout: 'Attempting division by zero...\n',
            stderr: 'ZeroDivisionError: division by zero\n',
            returned_value: null,
            error: {
              type: 'ZeroDivisionError',
              message: 'division by zero',
              traceback: 'Traceback (most recent call last):\n  File "<eval_block>", line 6, in <module>\n    process_data([])\n  File "<eval_block>", line 4, in process_data\n    return 100 / 0\nZeroDivisionError: division by zero'
            }
          });
          setIsRunning(false);
          return;
        }

        // Happy path evaluation
        let simulatedReturn: any = null;
        let simulatedOut = '';
        if (code.includes('calculate_target_coords')) {
          simulatedReturn = { x: 540, y: 1200 };
          simulatedOut = 'Computed center click: {\'x\': 540, \'y\': 1200}\n';
        } else if (code.includes('run_action')) {
          simulatedReturn = { status: 'success', target: [100, 250] };
          simulatedOut = 'Action dispatched to coords: [100, 250]\n';
        } else {
          simulatedReturn = 'OK';
          simulatedOut = 'Execution completed successfully.\n';
        }

        setEvalBlockResult({
          status: 'success',
          stage: 'execution',
          stdout: simulatedOut,
          stderr: '',
          returned_value: simulatedReturn,
          scope: {
            result: simulatedReturn,
            __runtime__: 'Chaquopy 15.0.1 Python 3.10'
          },
          error: null
        });
      } catch (err: any) {
        setEvalBlockResult({
          status: 'error',
          stage: 'static_analysis',
          stdout: '',
          stderr: '',
          returned_value: null,
          error: {
            type: err.name || 'SyntaxError',
            message: err.message,
            traceback: `SyntaxError: ${err.message}`
          }
        });
      }
      setIsRunning(false);
    }, 400);
  };

  const handleTestAndPromote = () => {
    setIsRunning(true);
    setEvalBlockResult(null);

    const isInfinite = codeSnippet.includes('while True:');
    const delay = isInfinite ? 2000 : 600;

    setTimeout(() => {
      const code = codeSnippet.trim();

      if (code.includes('def broken_syntax(x, y\n')) {
        setPromotionResult({
          status: 'failed',
          stage: 'phase1_static_analysis',
          error: 'SyntaxError',
          message: "invalid syntax at '<sandbox_static_check>', line 2",
          traceback: 'Traceback (most recent call last):\n  File "sandbox_evaluator.py", line 32, in static_analysis\n    parsed_ast = ast.parse(source_code)\nSyntaxError: invalid syntax'
        });
      } else if (isInfinite) {
        setPromotionResult({
          status: 'failed',
          stage: 'phase2_dynamic_timeout',
          error: 'TimeoutError',
          message: `Execution exceeded maximum allowed timeout of ${timeoutSeconds.toFixed(1)} seconds (infinite loop detected)`,
          traceback: null,
          stdout: 'Entering infinite processing loop...\n',
          stderr: ''
        });
      } else if (code.includes('100 / 0')) {
        setPromotionResult({
          status: 'failed',
          stage: 'phase2_dynamic_execution',
          error: 'ZeroDivisionError',
          message: 'division by zero',
          traceback: 'Traceback (most recent call last):\n  File "context.filesDir/sandbox/action_test.py", line 6, in <module>\n    process_data([])\nZeroDivisionError: division by zero',
          stdout: 'Attempting division by zero...\n',
          stderr: ''
        });
      } else {
        setPromotionResult({
          status: 'promoted',
          filename: 'action_test.py',
          source: 'context.filesDir/sandbox/action_test.py',
          destination: 'context.filesDir/modules/action_test.py',
          stdout: 'Module verified and executed cleanly.\n',
          message: 'Script passed Phase 1 (AST static check) & Phase 2 (Dynamic 5.0s isolated thread) and was successfully promoted to modules/.'
        });
      }
      setIsRunning(false);
    }, delay);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <span>PROMPT 4 IMPLEMENTATION</span>
            <span>·</span>
            <span>SANDBOX_EVALUATOR.PY & LOADER.PY</span>
          </div>
          <h2 className="text-base font-semibold text-white tracking-tight mt-1">
            Dual-Phase Sandbox & Atomic Block Evaluator
          </h2>
          <p className="text-xs text-zinc-300 mt-1 max-w-2xl">
            Simulates Phase 1 static AST parsing, isolated dictionary scope evaluation (<code className="text-amber-300">eval_block</code>), 
            and Phase 2 thread execution with configurable 5-second timeout protection before promotion into <code className="text-emerald-300">modules/</code>.
          </p>
        </div>

        {/* Timeout Slider */}
        <div className="flex items-center gap-3 bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="text-xs">
            <span className="text-zinc-400">Timeout: </span>
            <span className="text-white font-mono font-medium">{timeoutSeconds.toFixed(1)}s</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="10.0"
            step="0.5"
            value={timeoutSeconds}
            onChange={(e) => setTimeoutSeconds(parseFloat(e.target.value))}
            className="w-20 accent-amber-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Preset Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs text-zinc-500 font-mono shrink-0">Presets:</span>
        {presets.map((preset, i) => (
          <button
            key={i}
            onClick={() => {
              setCodeSnippet(preset.code);
              setEvalBlockResult(null);
              setPromotionResult(null);
            }}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors whitespace-nowrap"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Code Editor and Test Bench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Code Input */}
        <div className="lg:col-span-7 space-y-3">
          <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
            <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-semibold text-zinc-200">
                  context.filesDir/sandbox/action_test.py
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">Python 3</span>
            </div>

            <textarea
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              rows={12}
              className="w-full p-4 font-mono text-xs bg-zinc-950 text-zinc-200 focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
            />

            <div className="px-4 py-3 bg-zinc-900/60 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunEvalBlock}
                  disabled={isRunning}
                  className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-md border border-zinc-700 transition-colors flex items-center gap-1.5"
                >
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>eval_block()</span>
                </button>

                <button
                  onClick={handleTestAndPromote}
                  disabled={isRunning}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>test_and_promote()</span>
                </button>
              </div>

              {isRunning && (
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono">
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating sandbox thread...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Results Terminal */}
        <div className="lg:col-span-5 space-y-4">
          {/* Phase 1 & 2 Execution Output */}
          <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 flex flex-col h-full min-h-[320px]">
            <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">Evaluation & Promotion Output</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">JSON Payload Response</span>
            </div>

            <div className="p-4 flex-1 overflow-y-auto font-mono text-xs text-zinc-300">
              {evalBlockResult && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
                    {evalBlockResult.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-300">
                      eval_block Result: {evalBlockResult.status}
                    </span>
                  </div>

                  {evalBlockResult.stdout && (
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase">Captured stdout:</div>
                      <div className="bg-zinc-900 p-2 rounded text-emerald-300 whitespace-pre-wrap mt-0.5">
                        {evalBlockResult.stdout}
                      </div>
                    </div>
                  )}

                  {evalBlockResult.returned_value !== null && (
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase">Returned Value:</div>
                      <div className="bg-zinc-900 p-2 rounded text-cyan-300 mt-0.5">
                        {JSON.stringify(evalBlockResult.returned_value, null, 2)}
                      </div>
                    </div>
                  )}

                  {evalBlockResult.error && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-rose-400 uppercase">Error Traceback:</div>
                      <div className="bg-rose-950/40 border border-rose-900/60 p-2 rounded text-rose-300 whitespace-pre-wrap">
                        {evalBlockResult.error.traceback || evalBlockResult.error.message}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase">Isolated Scope Dump:</div>
                    <div className="bg-zinc-900 p-2 rounded text-zinc-400 text-[11px]">
                      {JSON.stringify(evalBlockResult.scope, null, 2)}
                    </div>
                  </div>
                </div>
              )}

              {promotionResult && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
                    {promotionResult.status === 'promoted' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span className={`font-semibold uppercase tracking-wider text-[11px] ${
                      promotionResult.status === 'promoted' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      Promotion Status: {promotionResult.status}
                    </span>
                  </div>

                  <div className="text-zinc-300 leading-relaxed text-xs">
                    {promotionResult.message}
                  </div>

                  {promotionResult.status === 'promoted' && (
                    <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg space-y-1.5 text-emerald-300 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <FolderInput className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Source: {promotionResult.source}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FolderOutput className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Promoted To: {promotionResult.destination}</span>
                      </div>
                    </div>
                  )}

                  {promotionResult.status === 'failed' && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] text-rose-400 uppercase">
                        Failure Stage: {promotionResult.stage}
                      </div>
                      <div className="bg-rose-950/40 border border-rose-900/60 p-2.5 rounded text-rose-300 whitespace-pre-wrap text-[11px]">
                        {promotionResult.traceback || promotionResult.message}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase">Full JSON Output:</span>
                    <pre className="bg-zinc-900 p-2 rounded text-zinc-400 text-[11px] mt-1 overflow-x-auto">
                      {JSON.stringify(promotionResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {!evalBlockResult && !promotionResult && (
                <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 p-6 space-y-2">
                  <ShieldCheck className="w-8 h-8 text-zinc-600" />
                  <p className="text-xs">
                    Select a preset or edit the code snippet, then click <strong>eval_block()</strong> or <strong>test_and_promote()</strong> to run sandbox validation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
