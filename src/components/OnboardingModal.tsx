import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Smartphone, 
  Tag, 
  FlaskConical, 
  GitBranch, 
  Download,
  BookOpen,
  Sparkles,
  Layers,
  Cpu
} from 'lucide-react';
import { TabType } from '../types/blueprint';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: TabType) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Welcome to the Self-Evolving Android Container Blueprint',
      badge: 'QUICK START GUIDE',
      icon: <Cpu className="w-6 h-6 text-emerald-400" />,
      content: (
        <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
          <p>
            This application is the complete, master technical implementation of an <strong>autonomous, self-evolving Android operating container</strong>.
          </p>
          <p>
            It combines a native <strong>Kotlin APK container shell</strong>, an embedded <strong>Chaquopy 15.0.1 Python runtime</strong>, 
            an <strong>Android Accessibility Service bridge</strong>, hardware-backed <strong>AES-256-GCM encryption</strong> for API keys, 
            and an adversarial <strong>multi-agent orchestration framework</strong> capable of dynamic self-modification without app recompilation.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800">
              <span className="font-semibold text-emerald-400">Host APK Container</span>
              <p className="text-[11px] text-zinc-400 mt-0.5">Kotlin + Chaquopy runtime with NDK ABI filters (arm64-v8a, x86_64).</p>
            </div>
            <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800">
              <span className="font-semibold text-cyan-400">Dynamic Python Engine</span>
              <p className="text-[11px] text-zinc-400 mt-0.5">Hot-reloads modules from context.filesDir without app reinstalls.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '1. Hardware-Backed Model Key Management',
      badge: 'SECURITY & KEYSTORE',
      icon: <Lock className="w-6 h-6 text-emerald-400" />,
      content: (
        <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
          <p>
            Keys for the 4 primary model providers (<strong>Anthropic</strong>, <strong>Gemini</strong>, <strong>Grok</strong>, and <strong>Hugging Face</strong>) 
            are protected using the Android Keystore system via <code className="text-emerald-300">EncryptedSharedPreferences</code> (AES-256-GCM).
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-zinc-400">
            <li><strong>Zero plaintext leaks</strong>: Keys are never hardcoded or saved in plaintext files.</li>
            <li><strong>Python runtime bridge</strong>: Python scripts fetch keys in memory via <code className="text-zinc-200">EncryptedKeyManager.getDecryptedKey("GEMINI")</code>.</li>
            <li><strong>Full CRUD</strong>: You can add, edit, mask/unmask, test, and purge keys at any time from the Key Vault tab.</li>
          </ul>
          <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between">
            <span className="font-mono text-[11px] text-zinc-300">Tab: Encrypted Key Vault</span>
            <button
              onClick={() => {
                onNavigateToTab('key-vault');
                onClose();
              }}
              className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 underline"
            >
              Open Key Vault →
            </button>
          </div>
        </div>
      )
    },
    {
      title: '2. Tagged AI Communication Protocol',
      badge: 'ORGANIZED MESSENGER',
      icon: <Tag className="w-6 h-6 text-cyan-400" />,
      content: (
        <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
          <p>
            Communicate directly with models using an organized <strong>tagging system</strong> to categorize requests:
          </p>
          <div className="flex flex-wrap gap-1.5 py-1">
            {['#accessibility', '#automation', '#codegen', '#critic_audit', '#security', '#youtube_flow'].map(t => (
              <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700/60">
                {t}
              </span>
            ))}
          </div>
          <p>
            Every outgoing query, retry, and incoming response attaches tags to its payload, enabling instant filtering, search, and latency tracking.
          </p>
          <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between">
            <span className="font-mono text-[11px] text-zinc-300">Tab: Tagged AI Messenger</span>
            <button
              onClick={() => {
                onNavigateToTab('ai-chat');
                onClose();
              }}
              className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 underline"
            >
              Open Messenger →
            </button>
          </div>
        </div>
      )
    },
    {
      title: '3. Virtual Android Device & Accessibility Bridge',
      badge: 'VIRTUAL RUNTIME',
      icon: <Smartphone className="w-6 h-6 text-indigo-400" />,
      content: (
        <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
          <p>
            The interactive virtual smartphone simulates the real Android container with live Accessibility node hierarchy tracking:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-zinc-400">
            <li><strong>Coordinate Dispatch</strong>: Click anywhere on screen to simulate <code className="text-zinc-200">SystemBridgeService.dispatchClick(x, y)</code>.</li>
            <li><strong>Node Hierarchy JSON</strong>: View the parsed JSON tree with view IDs, bounding boxes, and clickable states.</li>
            <li><strong>Automation Flows</strong>: Test real-time automation like YouTube Skip Ad and dark mode toggles.</li>
          </ul>
          <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between">
            <span className="font-mono text-[11px] text-zinc-300">Tab: Android Bridge & V-Device</span>
            <button
              onClick={() => {
                onNavigateToTab('android-device');
                onClose();
              }}
              className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 underline"
            >
              Open Virtual Device →
            </button>
          </div>
        </div>
      )
    },
    {
      title: '4. Dual-Phase Sandbox & Multi-Agent Orchestrator',
      badge: 'EVALUATION & HANDOFF',
      icon: <GitBranch className="w-6 h-6 text-violet-400" />,
      content: (
        <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
          <p>
            The container enforces zero-trust code promotion:
          </p>
          <div className="space-y-1.5 text-zinc-300">
            <div className="flex items-start gap-2 bg-zinc-950 p-2 rounded border border-zinc-800/80">
              <span className="text-amber-400 font-mono text-[11px]">Phase 1</span>
              <span>Static AST parse check (<code className="text-amber-300">ast.parse()</code> & <code className="text-amber-300">compile()</code>) verifies syntax before execution.</span>
            </div>
            <div className="flex items-start gap-2 bg-zinc-950 p-2 rounded border border-zinc-800/80">
              <span className="text-emerald-400 font-mono text-[11px]">Phase 2</span>
              <span>Isolated thread execution with a 5.0-second timeout catching infinite loops before promotion to <code className="text-emerald-300">modules/</code>.</span>
            </div>
            <div className="flex items-start gap-2 bg-zinc-950 p-2 rounded border border-zinc-800/80">
              <span className="text-violet-400 font-mono text-[11px]">Generator-Critic</span>
              <span>Model A creates code, Model B audits, errors auto-route back for self-correction, and state is serialized into clean checkpoints.</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '5. Single-Page Unified Operations Console',
      badge: 'UNIFIED WORKBENCH',
      icon: <Cpu className="w-6 h-6 text-emerald-400" />,
      content: (
        <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
          <p>
            All critical container operations are unified on <strong>one single page</strong> like a standard native workstation:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-zinc-400">
            <li><strong>Left Workstation</strong>: Live Virtual Android Device with screen tap simulation and accessibility bounds inspector.</li>
            <li><strong>Center Workstation</strong>: Core Automation Solutions (YouTube Skip Ad, Security Audit) + Tagged Multi-Model AI Messenger.</li>
            <li><strong>Right Workstation</strong>: Hardware-backed Encrypted Key Vault (Anthropic, Gemini, Grok, Hugging Face) with live ping tests and inline key editing.</li>
            <li><strong>Bottom Stream</strong>: Real-time container event telemetry and bridge communication logs.</li>
          </ul>
          <div className="p-2.5 depth-well rounded-lg flex items-center justify-between">
            <span className="font-mono text-[11px] text-zinc-300">View: Operations Console</span>
            <button
              onClick={() => {
                onNavigateToTab('operations');
                onClose();
              }}
              className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 underline"
            >
              Open Single-Page Console →
            </button>
          </div>
        </div>
      )
    },
    {
      title: '6. Complete Android Studio Project Export',
      badge: 'PRODUCTION READY',
      icon: <Download className="w-6 h-6 text-emerald-400" />,
      content: (
        <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
          <p>
            The complete, buildable Android Studio project is ready for export:
          </p>
          <div className="p-3 depth-well rounded-lg font-mono text-[11px] text-zinc-300 space-y-1">
            <div>✓ settings.gradle.kts & root build.gradle.kts</div>
            <div>✓ app/build.gradle.kts (Chaquopy, ABI filters, pip deps, security-crypto)</div>
            <div>✓ AndroidManifest.xml & accessibility_service_config.xml</div>
            <div>✓ MainActivity.kt & EncryptedKeyManager.kt</div>
            <div>✓ SystemBridgeService.kt</div>
            <div>✓ action_skip_ad.py, tool_security_audit.py</div>
            <div>✓ loader.py, sandbox_evaluator.py, router.py, orchestrator.py</div>
          </div>
          <p className="text-zinc-400">
            Click <strong>"Export Android Studio ZIP"</strong> in the top header at any time to download the entire codebase archive.
          </p>
        </div>
      )
    }
  ];

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="depth-card rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 depth-well rounded-xl border border-zinc-800">
              {step.icon}
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                {step.badge} · Step {currentStep + 1} of {steps.length}
              </span>
              <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
                {step.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-tactile text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="min-h-[220px]">
          {step.content}
        </div>

        {/* Modal Footer Controls with Tactile Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          {/* Step Indicators */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-1.5 rounded-full transition-all ${
                  currentStep === i ? 'w-6 bg-emerald-400' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="btn-tactile btn-tactile-secondary px-3.5 py-1.5 text-xs font-semibold rounded-lg"
              >
                Back
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="btn-tactile btn-tactile-primary flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg shadow-sm"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="btn-tactile btn-tactile-primary flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Start Operating</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
