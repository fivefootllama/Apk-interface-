/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Cpu, 
  Users, 
  Clock, 
  Sparkles, 
  Lock, 
  Smartphone, 
  FlaskConical, 
  Terminal, 
  ClipboardCheck, 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown, 
  Layers, 
  Network,
  Maximize2,
  Minimize2,
  Filter
} from 'lucide-react';

import { SystemPerformanceMonitor } from './SystemPerformanceMonitor';
import { GoogleMultiAccountManager } from './GoogleMultiAccountManager';
import { AgentActionHistoryVisualizer } from './AgentActionHistoryVisualizer';
import { AutomationSolutionsStudio } from './AutomationSolutionsStudio';
import { KeyVaultManager } from './KeyVaultManager';
import { RouterFailoverTester } from './RouterFailoverTester';
import { VirtualAndroidDevice } from './VirtualAndroidDevice';
import { SandboxPlayground } from './SandboxPlayground';
import { PromptCodeExplorer } from './PromptCodeExplorer';
import { DetailedSystemAnalysis } from './DetailedSystemAnalysis';
import { ArchitecturePipeline } from './ArchitecturePipeline';
import { MultiModelCollaborationHub } from './MultiModelCollaborationHub';
import { OrchestratorStudio } from './OrchestratorStudio';
import { Hand, Eye, HardDrive, Code2, Workflow } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
  component: React.ReactNode;
  defaultOpen?: boolean;
}

export const UnifiedAdvancedConsole: React.FC = () => {
  // Collapsible state for each section
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'multi-model-hub': true,       // Open by default: Shows Multi-Model APK Eyes/Hands & Drive Logger
    'orchestrator-studio': true,   // Open by default: Shows Python Scripting Engine & Root Privileges
    'perf-monitor': true,          // Open by default so user sees live performance
    'google-accounts': false,
    'agent-history': false,
    'solutions': false,
    'key-vault': false,
    'virtual-phone': false,
    'sandbox': false,
    'prompts-code': false,
    'architecture': false,
    'comparative-audit': false,
  });

  const [filterQuery, setFilterQuery] = useState('');

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    sections.forEach(s => { next[s.id] = true; });
    setOpenSections(next);
  };

  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    sections.forEach(s => { next[s.id] = false; });
    setOpenSections(next);
  };

  const sections: Section[] = [
    {
      id: 'multi-model-hub',
      title: 'Multi-Model Interaction Hub: APK Eyes, Hands & Google Drive Logger',
      subtitle: 'Definitive setup enabling AI models to perceive via APK eyes, act via APK hands, collaborate, and hold logs on Drive',
      icon: <Hand className="w-5 h-5 text-indigo-400" />,
      badge: 'Definitive Setup',
      badgeColor: 'bg-indigo-950/80 text-indigo-400 border-indigo-800',
      component: <MultiModelCollaborationHub />,
      defaultOpen: true,
    },
    {
      id: 'orchestrator-studio',
      title: 'Python Scripting Engine & Root/Non-Root Permissions (OrchestratorStudio)',
      subtitle: 'Enables models to draft, test via AST & sandbox, and deploy Python scripts directly through Chaquopy to device APIs',
      icon: <Code2 className="w-5 h-5 text-pink-400" />,
      badge: 'Scripting Engine & Permissions',
      badgeColor: 'bg-pink-950/80 text-pink-400 border-pink-800',
      component: <OrchestratorStudio />,
      defaultOpen: true,
    },
    {
      id: 'perf-monitor',
      title: 'Real-Time System Performance & Chaquopy Threads',
      subtitle: 'Live container metrics: CPU, Memory (with 85% pulsating alert), and Python threads',
      icon: <Cpu className="w-5 h-5 text-emerald-400" />,
      badge: 'Live Telemetry',
      badgeColor: 'bg-emerald-950/80 text-emerald-400 border-emerald-800',
      component: <SystemPerformanceMonitor />,
    },
    {
      id: 'google-accounts',
      title: 'Google Accounts & Storage Partitioning Manager',
      subtitle: 'Multi-account switcher, isolated sandbox partitions, expanded Google Drive quota & Sheets logging',
      icon: <Users className="w-5 h-5 text-emerald-400" />,
      badge: 'Multi-Account',
      badgeColor: 'bg-emerald-950/80 text-emerald-400 border-emerald-800',
      component: <GoogleMultiAccountManager />,
    },
    {
      id: 'agent-history',
      title: 'Agent Action History Visualizer',
      subtitle: 'Chronological timeline of multi-agent interactions, payload state transitions, and critic ratings',
      icon: <Clock className="w-5 h-5 text-blue-400" />,
      badge: 'Multi-Agent',
      badgeColor: 'bg-blue-950/80 text-blue-400 border-blue-800',
      component: <AgentActionHistoryVisualizer />,
    },
    {
      id: 'solutions',
      title: '3 Real-World Automation Solutions Studio',
      subtitle: 'Interactive testbed for YouTube Ad Skipping, SMS OTP Extraction, and Security Scanner',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      badge: '3 Core Flows',
      badgeColor: 'bg-amber-950/80 text-amber-400 border-amber-800',
      component: <AutomationSolutionsStudio />,
    },
    {
      id: 'virtual-phone',
      title: 'Virtual Android Phone & Accessibility Bridge',
      subtitle: 'Simulated 1080x2400 device node tree with interactive tap and screen gesture execution',
      icon: <Smartphone className="w-5 h-5 text-indigo-400" />,
      badge: 'P1-P2 APK',
      badgeColor: 'bg-indigo-950/80 text-indigo-400 border-indigo-800',
      component: <VirtualAndroidDevice />,
    },
    {
      id: 'key-vault',
      title: 'Hardware-Backed Encrypted Key Vault & Multi-Provider Router',
      subtitle: 'AndroidKeyStore AES-256 encrypted credential storage and failover router',
      icon: <Lock className="w-5 h-5 text-cyan-400" />,
      badge: 'AES-256 GCM',
      badgeColor: 'bg-cyan-950/80 text-cyan-400 border-cyan-800',
      component: (
        <div className="space-y-6">
          <KeyVaultManager />
          <RouterFailoverTester />
        </div>
      ),
    },
    {
      id: 'sandbox',
      title: 'Dual-Phase Python Sandbox Evaluator',
      subtitle: 'Pre-execution AST node-visitor validation and timeout-enforced runtime testing',
      icon: <FlaskConical className="w-5 h-5 text-purple-400" />,
      badge: 'P3-P4 Runtime',
      badgeColor: 'bg-purple-950/80 text-purple-400 border-purple-800',
      component: <SandboxPlayground />,
    },
    {
      id: 'prompts-code',
      title: 'Master Prompts 1-7 Codebase & Chaquopy Scripts',
      subtitle: 'Exhaustive source code and blueprints for Kotlin APK shell and Python container',
      icon: <Terminal className="w-5 h-5 text-zinc-300" />,
      badge: 'Prompts 1-7',
      badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
      component: <PromptCodeExplorer initialPrompt={1} />,
    },
    {
      id: 'architecture',
      title: 'System Architecture & Execution Pipeline',
      subtitle: 'Complete technical overview of Android accessibility, IPC socket, and LLM router',
      icon: <Layers className="w-5 h-5 text-teal-400" />,
      badge: 'Architecture',
      badgeColor: 'bg-teal-950/80 text-teal-400 border-teal-800',
      component: <ArchitecturePipeline onSelectTab={() => {}} onSelectPrompt={() => {}} />,
    },
    {
      id: 'comparative-audit',
      title: 'Detailed System Analysis & Comparative Audit',
      subtitle: 'Exhaustive prompt verification, rate-limit recovery audit, and suggestion accounting',
      icon: <ClipboardCheck className="w-5 h-5 text-emerald-400" />,
      badge: '100% Verified',
      badgeColor: 'bg-emerald-950/80 text-emerald-400 border-emerald-800',
      component: <DetailedSystemAnalysis />,
    },
  ];

  const filteredSections = sections.filter(s => 
    s.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.subtitle.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Overview Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Advanced Observational Console</span>
            <span className="text-[11px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">Coalesced View</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            System Observability & Developer Tools
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mt-0.5">
            All advanced metrics, Chaquopy Python thread monitors, Google storage partitions, and prompt blueprints coalesced into single-click collapsing tabs.
          </p>
        </div>

        {/* Global Expand / Collapse and Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Filter className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter sections..."
              className="bg-zinc-950 border border-zinc-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 w-full sm:w-44"
            />
          </div>

          <button
            onClick={expandAll}
            className="btn-tactile px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center gap-1.5"
            title="Expand all collapsible sections"
          >
            <Maximize2 className="w-3 h-3 text-zinc-400" />
            <span>Expand All</span>
          </button>

          <button
            onClick={collapseAll}
            className="btn-tactile px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center gap-1.5"
            title="Collapse all sections to headers only"
          >
            <Minimize2 className="w-3 h-3 text-zinc-400" />
            <span>Collapse All</span>
          </button>
        </div>
      </div>

      {/* Accordion / Collapsible Sections Stack */}
      <div className="space-y-4">
        {filteredSections.map((sec) => {
          const isOpen = !!openSections[sec.id];
          return (
            <div 
              key={sec.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen 
                  ? 'bg-zinc-900/95 border-zinc-700 shadow-xl' 
                  : 'bg-zinc-900/60 hover:bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Collapsible Section Header Bar */}
              <button
                onClick={() => toggleSection(sec.id)}
                className="w-full px-5 py-4 flex items-center justify-between text-left transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className={`p-2 rounded-xl border border-zinc-700/60 shrink-0 ${isOpen ? 'bg-zinc-800' : 'bg-zinc-950'}`}>
                    {sec.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                        {sec.title}
                      </h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sec.badgeColor}`}>
                        {sec.badge}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {sec.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
                    {isOpen ? 'Click to hide' : 'Click to inspect'}
                  </span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                    isOpen 
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-200 rotate-180' 
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}>
                    <ChevronDown className="w-4 h-4 transition-transform" />
                  </div>
                </div>
              </button>

              {/* Collapsible Section Content */}
              {isOpen && (
                <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-zinc-800/80 bg-zinc-950/40">
                  {sec.component}
                </div>
              )}
            </div>
          );
        })}

        {filteredSections.length === 0 && (
          <div className="text-center py-12 text-zinc-500 text-sm bg-zinc-900/40 rounded-2xl border border-zinc-800">
            No sections match "{filterQuery}". Clear search to view all.
          </div>
        )}
      </div>
    </div>
  );
};
