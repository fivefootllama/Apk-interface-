import React, { useState } from 'react';
import { ALL_PROMPT_FILES, CodeFile } from '../codeRepository';
import { 
  Check, 
  Copy, 
  Download, 
  FileCode, 
  Terminal, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Network, 
  GitBranch, 
  Smartphone,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { downloadBlob } from '../utils/zipExporter';

interface PromptCodeExplorerProps {
  initialPrompt?: number;
}

export const PromptCodeExplorer: React.FC<PromptCodeExplorerProps> = ({ initialPrompt = 1 }) => {
  const [selectedPrompt, setSelectedPrompt] = useState<number>(initialPrompt);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const promptDetails: Record<number, {
    title: string;
    role: string;
    icon: React.ReactNode;
    promptText: string;
    verificationPoints: string[];
  }> = {
    1: {
      title: 'Prompt 1: Project Skeleton & Gradle Configuration',
      role: 'Act as a senior Android systems engineer.',
      icon: <Cpu className="w-4 h-4 text-emerald-400" />,
      promptText: `Act as a senior Android systems engineer. Generate the complete configuration for an Android Studio project utilizing Kotlin and Chaquopy to embed a Python runtime. Provide: 1. Project-level (\`settings.gradle.kts\`, \`build.gradle.kts\`) and app-level (\`build.gradle.kts\`) files configured with the Chaquopy Gradle plugin (\`com.chaquo.python\`), NDK ABI filters ("arm64-v8a", "x86_64"), and pip dependencies (\`requests\`, \`urllib3\`). Do NOT specify an explicit python version block in Gradle. 2. The \`AndroidManifest.xml\` declaring standard storage permissions and an AccessibilityService declaration (\`android.permission.BIND_ACCESSIBILITY_SERVICE\`). 3. Core \`MainActivity.kt\` that initializes the Python environment (\`Python.start(AndroidPlatform(context))\`) on startup, verifies local file storage directories (\`context.filesDir\`), and logs status. Output complete, production-ready code.`,
      verificationPoints: [
        'settings.gradle.kts & build.gradle.kts configured with Chaquopy Maven repo and plugin 15.0.1',
        'app/build.gradle.kts has NDK ABI filters: ["arm64-v8a", "x86_64"]',
        'Pip dependencies: requests and urllib3 installed',
        'Rule strictly adhered: NO explicit python version block specified in Gradle',
        'AndroidManifest.xml declares BIND_ACCESSIBILITY_SERVICE & accessibility_service_config.xml',
        'MainActivity.kt initializes Python.start(AndroidPlatform(context)) & verifies context.filesDir layout'
      ]
    },
    2: {
      title: 'Prompt 2: Android Accessibility & System Interaction Bridge',
      role: 'Act as an expert Android developer.',
      icon: <Smartphone className="w-4 h-4 text-cyan-400" />,
      promptText: `Act as an expert Android developer. Write the complete Kotlin code for a custom AccessibilityService class named \`SystemBridgeService.kt\` that does the following: 1. Listens for accessibility node info to parse the current screen hierarchy into a text-based tree or structured JSON format. 2. Exposes public methods reachable via Python/Chaquopy to perform global actions (\`GLOBAL_ACTION_BACK\`, \`GLOBAL_ACTION_HOME\`) or dispatch gesture clicks/swipes based on provided screen coordinates (x, y). 3. Exposes an internal broadcast or static bridge interface so Python scripts running via Chaquopy can invoke these methods natively. Output complete, production-ready Kotlin code.`,
      verificationPoints: [
        'Implements AccessibilityService in SystemBridgeService.kt',
        'Recursively parses active window AccessibilityNodeInfo into structured JSON tree with bounding boxes & view IDs',
        'Exposes dispatchGesture clicks and swipes based on (x, y) coordinates with synchronous countdown latches',
        'Exposes performGlobalAction for GLOBAL_ACTION_BACK and GLOBAL_ACTION_HOME',
        '@JvmStatic bridge methods callable directly from Chaquopy Python via Java class interop'
      ]
    },
    3: {
      title: 'Prompt 3: Dynamic Module Loader & Execution Engine',
      role: 'Act as an expert Python developer working inside an Android environment.',
      icon: <Terminal className="w-4 h-4 text-blue-400" />,
      promptText: `Act as an expert Python developer working inside an Android environment. Write a core Python control script (\`loader.py\`) designed to run inside the app's internal files directory (\`context.filesDir\`). This script must: 1. Scan a designated \`/actions/\` or \`/tools/\` subdirectory for any \`.py\` script files. 2. Use Python's \`importlib\` and \`sys.modules\` to dynamically load, reload, and execute these files at runtime without restarting the application. 3. Provide a safe execution wrapper that catches runtime exceptions, logs full error tracebacks to a text log, and returns clean error payloads to the caller. Output complete Python code.`,
      verificationPoints: [
        'Runs inside Android internal filesDir hierarchy (/actions/, /tools/, /modules/, /logs/)',
        'Scans target directories for .py script files',
        'Uses importlib.util.spec_from_file_location and sys.modules cache manipulation for in-memory hot-reloading',
        'Safe execution wrapper catches runtime exceptions without crashing Android runtime',
        'Writes formatted stack tracebacks to execution_errors.log and returns clean JSON error payload'
      ]
    },
    4: {
      title: 'Prompt 4: Isolated Sandbox & Atomic Evaluation Suite',
      role: 'Act as a principal software test automation architect.',
      icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
      promptText: `Act as a principal software test automation architect. Write a complete Python module (\`sandbox_evaluator.py\`) operating inside \`context.filesDir/sandbox/\` implementing a mandatory two-phase testing and granular code evaluation pipeline: 1. Phase 1 (Static Analysis): Use \`ast.parse()\` and \`compile()\` to verify syntax and structural integrity of incoming string snippets and full script files prior to execution. 2. Granular Block Execution: Expose an \`eval_block(code_snippet, scope_dict)\` function running individual code blocks or expressions in an isolated dictionary namespace using \`exec()\` / \`eval()\`, capturing stdout, stderr, and returned values. 3. Phase 2 (Dynamic Execution & Promotion): Execute full scripts in an isolated thread with a configurable execution timeout (e.g., 5 seconds) to catch infinite loops. If all tests and assertions pass without exceptions, move the file from \`context.filesDir/sandbox/\` to \`context.filesDir/modules/\`. If it fails, return the full error traceback formatted as JSON. Output complete Python code.`,
      verificationPoints: [
        'Phase 1 Static Analysis: ast.parse() and compile() verifying syntax and structural AST integrity',
        'Granular Block Execution: eval_block(code_snippet, scope_dict) running in isolated namespace',
        'Captures stdout & stderr via io.StringIO, redirect_stdout, and redirect_stderr',
        'Phase 2 Dynamic Execution: runs in isolated daemon thread with 5-second timeout catching infinite loops',
        'Zero-trust promotion: moves verified scripts from sandbox/ to modules/ only when all assertions pass',
        'Returns full error traceback formatted as JSON on any failure'
      ]
    },
    5: {
      title: 'Prompt 5: Multi-Provider API Client & Failover Router',
      role: 'Act as an expert AI systems engineer.',
      icon: <Network className="w-4 h-4 text-indigo-400" />,
      promptText: `Act as an expert AI systems engineer. Write a Python module (\`router.py\`) implementing a multi-provider fallback and account/key rotation strategy for OpenAI-compatible APIs (supporting Groq, OpenRouter, Google AI Studio, and local Ollama endpoints). It must: 1. Maintain an ordered list of provider configurations (Base URL, API Key, Model Name). 2. Execute a model call query; if an HTTP 429 (Rate Limit) or network exception occurs, automatically catch the error, rotate to the next available account or provider in the list, and retry. 3. Support structured JSON payload responses for tool calling and screen state evaluation. Output complete Python code.`,
      verificationPoints: [
        'Ordered ProviderConfig list (Groq, OpenRouter, Google AI Studio, Ollama)',
        'Automatic interception of HTTP 429 (Rate Limit) with cooldown cooldown marking and key rotation',
        'Catches URLError, TimeoutError, and network dropouts to failover to next provider',
        'Supports structured JSON responses with response_format: {type: "json_object"} and markdown-fence cleaning',
        'Standardized error logging and retry counting'
      ]
    },
    6: {
      title: 'Prompt 6: Generator-Critic Peer Review & State-Handoff Protocol',
      role: 'Act as an expert multi-agent systems architect.',
      icon: <GitBranch className="w-4 h-4 text-violet-400" />,
      promptText: `Act as an expert multi-agent systems architect. Write a Python script (\`orchestrator.py\`) coordinating an adversarial generator-critic review loop, the \`sandbox_evaluator.py\` testing suite, and a state handoff protocol. It must include: 1. A verification loop where Model A generates Python code in atomic blocks, Model B (Critic) audits the code structure, and \`sandbox_evaluator.py\` statically and dynamically tests the payload before promotion. If any layer fails, route the traceback back to Model A for automated correction. 2. A state-serialization function packaging current goal, screen state JSON, variable map, and recent execution history into a clean JSON string checkpoint whenever a rate limit or token ceiling is approached. 3. A state-injection function passing this checkpoint payload into the next incoming model in rotation to resume execution seamlessly. Output complete Python code.`,
      verificationPoints: [
        'Adversarial cycle: Model A (Generator) produces atomic code blocks for target Android automation',
        'Model B (Critic) performs structural and safety audit with structured JSON verdict',
        'Integrates sandbox_evaluator.py Phase 1 (AST) & Phase 2 (5s dynamic test)',
        'Traceback routing: failure tracebacks are piped back into Model A prompt for automated correction',
        'serialize_state_checkpoint: clean JSON string capturing goal, screen state, variable map, history',
        'inject_state_checkpoint: restores execution context seamlessly into the next rotated model'
      ]
    },
    7: {
      title: 'Prompt 7 / Production Solutions: YouTube Ad Skip, SMS OTP & Security Auditor',
      role: 'Act as a production Android automation & security engineer.',
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
      promptText: `Production Automation Solutions & Security Suite for Android Container:
1. action_skip_ad.py: High-speed YouTube Ad Skip automation locating 'skip_ad' resource IDs or text within active window and dispatching programmatic gesture clicks via SystemBridgeService.
2. action_extract_otp.py: SMS & Notification 2FA One-Time Password verification module extracting 4-8 digit numeric tokens and locating submission buttons for auto-fill verification.
3. tool_security_audit.py: Accessibility Hierarchy & Security compliance inspector auditing minimum 48x48dp touch target bounds, missing contentDescription labels, and unmasked credential leaks.`,
      verificationPoints: [
        'action_skip_ad.py: Traverses Accessibility tree, calculates center click coordinates, dispatches GestureDescription',
        'action_extract_otp.py: Regular expression pattern extraction for 2FA SMS tokens and auto-submission button targeting',
        'tool_security_audit.py: WCAG AA 2.5.5 touch target geometry checking (min 48x48dp), contentDescription validation, and token leak scanning',
        'All modules run dynamically via DynamicModuleLoader in context.filesDir without app recompilation'
      ]
    }
  };

  const currentPromptInfo = promptDetails[selectedPrompt];
  const currentFiles: CodeFile[] = ALL_PROMPT_FILES[selectedPrompt] || [];
  const activeFile: CodeFile = currentFiles[selectedFileIndex] || currentFiles[0];

  const handleCopy = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadFile = () => {
    if (activeFile) {
      const blob = new Blob([activeFile.code], { type: 'text/plain;charset=utf-8' });
      downloadBlob(blob, activeFile.filename);
    }
  };

  return (
    <div className="space-y-6">
      {/* Prompt Selector Pills / Steps */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-900 border border-zinc-800 rounded-xl">
        {[1, 2, 3, 4, 5, 6, 7].map((pNum) => {
          const isSelected = selectedPrompt === pNum;
          return (
            <button
              key={pNum}
              onClick={() => {
                setSelectedPrompt(pNum);
                setSelectedFileIndex(0);
              }}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                isSelected
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-mono ${
                isSelected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-500'
              }`}>
                P{pNum}
              </span>
              <span className="hidden sm:inline">
                {pNum === 1 && 'Project Skeleton'}
                {pNum === 2 && 'Accessibility Bridge'}
                {pNum === 3 && 'Module Loader'}
                {pNum === 4 && 'Sandbox Evaluator'}
                {pNum === 5 && 'Failover Router'}
                {pNum === 6 && 'Generator-Critic'}
                {pNum === 7 && 'Solutions & Audit'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Prompt Specification & Verification Header */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-zinc-800 rounded-lg">
              {currentPromptInfo.icon}
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                {currentPromptInfo.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                <span>{currentPromptInfo.role}</span>
                <span>·</span>
                <span>{currentFiles.length} production files</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded">
              PDF Spec Validated
            </span>
          </div>
        </div>

        {/* Verbatim Master Prompt Block */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            Original Master Prompt Specification (from PDF):
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap">
            {currentPromptInfo.promptText}
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="space-y-2 pt-2">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            Implementation Verification Checklist:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {currentPromptInfo.verificationPoints.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300 bg-zinc-950/40 p-2 rounded border border-zinc-800/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Code Viewer Section */}
      <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
        {/* File Tabs & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-4 py-2 gap-2">
          {/* File Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {currentFiles.map((file, idx) => {
              const isSelected = selectedFileIndex === idx;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-zinc-800 text-white font-medium border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{file.filename}</span>
                </button>
              );
            })}
          </div>

          {/* Copy & Single File Download Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-mono text-zinc-500 mr-2 hidden md:inline">
              Path: {activeFile?.path}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
              title="Copy code to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownloadFile}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
              title="Download this file"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* File Description Header */}
        {activeFile && (
          <div className="px-4 py-2 bg-zinc-900/30 border-b border-zinc-800/60 text-xs text-zinc-400 flex items-center gap-2">
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>{activeFile.description}</span>
          </div>
        )}

        {/* Code Content with Line Numbers */}
        <div className="p-4 overflow-x-auto font-mono text-xs text-zinc-300 leading-relaxed bg-zinc-950 max-h-[600px] overflow-y-auto">
          <pre className="table w-full">
            <code>
              {activeFile?.code.split('\n').map((line, idx) => (
                <div key={idx} className="table-row hover:bg-zinc-900/40">
                  <span className="table-cell select-none pr-4 text-right text-zinc-600 text-[11px] w-10">
                    {idx + 1}
                  </span>
                  <span className="table-cell whitespace-pre">{line}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};
