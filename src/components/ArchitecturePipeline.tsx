import React from 'react';
import { TabType } from '../types/blueprint';
import { 
  Smartphone, 
  Terminal, 
  ShieldCheck, 
  Network, 
  ArrowRight, 
  Layers, 
  Workflow, 
  CheckCircle, 
  FileCode,
  ExternalLink
} from 'lucide-react';

interface ArchitecturePipelineProps {
  onSelectTab: (tab: TabType) => void;
  onSelectPrompt: (promptNum: number) => void;
}

export const ArchitecturePipeline: React.FC<ArchitecturePipelineProps> = ({ onSelectTab, onSelectPrompt }) => {
  const pillars = [
    {
      id: 'HOST',
      name: 'Kotlin APK Container',
      tag: 'HOST',
      color: 'emerald',
      icon: <Smartphone className="w-5 h-5 text-emerald-400" />,
      description: 'Embeds Chaquopy Python runtime, manages Android permissions, exposes Accessibility API bindings, and maintains local application file storage.',
      specs: [
        'Native APK shell built with Kotlin 1.9+ & Android SDK 34',
        'Chaquopy plugin (com.chaquo.python) with NDK ABI filters (arm64-v8a, x86_64)',
        'Pip dependency engine bundling requests & urllib3',
        'Internal filesDir directory verification & isolated layout'
      ],
      associatedPrompts: [1, 2]
    },
    {
      id: 'EXEC',
      name: 'Dynamic Python Engine',
      tag: 'EXEC',
      color: 'cyan',
      icon: <Terminal className="w-5 h-5 text-cyan-400" />,
      description: 'Hot-reloads executable Python modules from context.filesDir/modules/ using importlib and sys.modules without triggering app reinstalls.',
      specs: [
        'Automated directory scanning across /actions/, /tools/, /modules/',
        'In-memory module cache invalidation via importlib.invalidate_caches()',
        'Dynamic spec loading with importlib.util.spec_from_file_location',
        'Safe execution wrapper catching runtime exceptions with log tracebacks'
      ],
      associatedPrompts: [3]
    },
    {
      id: 'TEST',
      name: 'Sandbox & Atomic Tester',
      tag: 'TEST',
      color: 'amber',
      icon: <ShieldCheck className="w-5 h-5 text-amber-400" />,
      description: 'Dual-phase validation engine performing static AST parsing, atomic block evaluation (eval_block), and dynamic thread execution before script promotion.',
      specs: [
        'Phase 1: AST parsing (ast.parse) & grammar compilation (compile)',
        'Granular atomic eval_block() with isolated scope dictionary',
        'Phase 2: Dynamic execution in isolated thread with 5-second timeout',
        'Zero-trust promotion: files moved from sandbox/ to modules/ only on pass'
      ],
      associatedPrompts: [4]
    },
    {
      id: 'ROUTER',
      name: 'Multi-Agent Orchestrator',
      tag: 'ROUTER',
      color: 'violet',
      icon: <Network className="w-5 h-5 text-violet-400" />,
      description: 'Manages Generator-Critic peer reviews, dynamic API key/account rotation across providers (Groq, OpenRouter, Google, Ollama), and state-handoff protocols.',
      specs: [
        'Key rotation intercepting HTTP 429 rate limits & network failovers',
        'Model A (Generator) & Model B (Critic) adversarial validation cycle',
        'Automated traceback feedback loop routing runtime errors back to generator',
        'State-serialization checkpoints & seamless model handoff injections'
      ],
      associatedPrompts: [5, 6]
    }
  ];

  const pipelineMatrix = [
    {
      module: 'Encrypted Key Vault',
      functionality: 'Hardware-backed AES-256-GCM Keystore (Anthropic, Gemini, Grok, Hugging Face)',
      verification: 'Zero plaintext leaks; in-memory decryption bridge via Chaquopy',
      prompt: 1,
      tab: 'key-vault' as TabType
    },
    {
      module: 'Tagged AI Messenger',
      functionality: 'Topic-tagged communication (#accessibility, #codegen, #security, #otp)',
      verification: 'Organized query dispatch, latency monitoring, structured JSON audit',
      prompt: 5,
      tab: 'ai-chat' as TabType
    },
    {
      module: 'Accessibility Bridge',
      functionality: 'Node-tree parsing & gesture dispatch (x, y)',
      verification: 'Verifies UI response & view hierarchy state changes',
      prompt: 2,
      tab: 'android-device' as TabType
    },
    {
      module: 'Dynamic Module Loader',
      functionality: 'In-memory module execution & hot-swapping',
      verification: 'Monitors import errors and thread execution status',
      prompt: 3,
      tab: 'sandbox-tester' as TabType
    },
    {
      module: 'Sandbox Testing Suite',
      functionality: 'Static AST check + Dynamic isolated dry-run',
      verification: 'Validates code syntax, catch exceptions, enforces timeouts',
      prompt: 4,
      tab: 'sandbox-tester' as TabType
    },
    {
      module: 'Multi-Provider Router',
      functionality: 'Key rotation & provider failover handling',
      verification: 'Intercepts HTTP 429/5xx errors; auto-switches endpoints',
      prompt: 5,
      tab: 'router-failover' as TabType
    },
    {
      module: 'Peer Review & Handoff',
      functionality: 'Generator-Critic loop & memory serialization',
      verification: 'Audits logic accuracy; serializes context JSON payloads',
      prompt: 6,
      tab: 'orchestrator-loop' as TabType
    }
  ];

  return (
    <div className="space-y-10">
      {/* Hero Master Specification Header */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span>SECTION 1</span>
              <span>·</span>
              <span>MASTER TECHNICAL SPECIFICATION</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Self-Evolving Android Container Blueprint
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              This system establishes the definitive architectural specification for an autonomous, 
              self-evolving Android operating container. The platform combines a native Kotlin APK container shell, 
              an embedded Chaquopy Python runtime, an Android Accessibility Service interface, dual-phase sandboxed testing, 
              and an adversarial multi-agent orchestration framework capable of dynamic self-modification without recompilation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={() => onSelectTab('prompts')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
            >
              <FileCode className="w-4 h-4" />
              <span>Browse Prompts 1-6</span>
            </button>
            <button
              onClick={() => onSelectTab('orchestrator-loop')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors border border-zinc-700"
            >
              <Workflow className="w-4 h-4" />
              <span>Run Live Orchestrator</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Pillars Grid */}
      <div>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-white tracking-tight">
            1. Core System Architecture & Pillars
          </h3>
          <p className="text-xs text-zinc-400">
            Four interconnected subsystems orchestrating host container lifecycle, Python engine, sandbox gatekeeper, and multi-agent routing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pillars.map((pillar) => (
            <div
              key={pillar.id}
              className="bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-zinc-800 rounded-lg">
                      {pillar.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{pillar.name}</h4>
                      <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">{pillar.tag}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {pillar.associatedPrompts.map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          onSelectPrompt(p);
                          onSelectTab('prompts');
                        }}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
                        title={`View Prompt ${p} implementation`}
                      >
                        Prompt {p}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
                  {pillar.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                  {pillar.specs.map((spec, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                      <span className="text-emerald-400 font-mono mt-0.5">›</span>
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Functional Pipeline & Verification Matrix Table */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            2. Functional Pipeline & Verification Matrix
          </h3>
          <p className="text-xs text-zinc-400">
            Mandatory execution pipeline specifying primary functionality and validation protocols for each container module.
          </p>
        </div>

        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/90 text-zinc-400 font-mono uppercase text-[11px]">
                  <th className="py-3 px-4 font-semibold">System Module</th>
                  <th className="py-3 px-4 font-semibold">Primary Functionality</th>
                  <th className="py-3 px-4 font-semibold">Validation & Verification Protocol</th>
                  <th className="py-3 px-4 font-semibold text-right">Interactive Test</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {pipelineMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{row.module}</span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">
                      {row.functionality}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">
                      {row.verification}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            onSelectPrompt(row.prompt);
                            onSelectTab('prompts');
                          }}
                          className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 font-mono text-[11px] transition-colors"
                        >
                          Code P{row.prompt}
                        </button>
                        <button
                          onClick={() => onSelectTab(row.tab)}
                          className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 rounded font-medium text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <span>Simulate</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
