/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TabType } from '../types/blueprint';
import { exportProjectZip, downloadBlob } from '../utils/zipExporter';
import { 
  MessageSquare,
  Sliders,
  Download, 
  CheckCircle2,
  Cpu,
  BookOpen,
  Sparkles,
  ChevronDown,
  Terminal,
  Smartphone,
  FlaskConical,
  Network,
  GitBranch,
  Layers,
  Users,
  ClipboardCheck,
  Lock
} from 'lucide-react';

interface HeaderNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenOnboarding: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ activeTab, setActiveTab, onOpenOnboarding }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const zipBlob = await exportProjectZip();
      downloadBlob(zipBlob, 'SelfEvolvingAndroidContainer-MasterCodebase.zip');
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setDownloading(false);
    }
  };

  const isSimpleMode = activeTab === 'simple-assistant';
  const isAdvancedConsole = activeTab === 'advanced-console' || activeTab === 'operations';

  const directTools: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'operations', label: 'Operations Workstation', icon: <Cpu className="w-4 h-4 text-emerald-400" /> },
    { id: 'google-accounts', label: 'Google Accounts & Storage', icon: <Users className="w-4 h-4 text-emerald-400" /> },
    { id: 'comparative-analysis', label: 'Detailed System Analysis', icon: <ClipboardCheck className="w-4 h-4 text-blue-400" /> },
    { id: 'solutions', label: '3 Automation Solutions', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
    { id: 'key-vault', label: 'Encrypted Key Vault', icon: <Lock className="w-4 h-4 text-cyan-400" /> },
    { id: 'android-device', label: 'Android Bridge & V-Device', icon: <Smartphone className="w-4 h-4 text-indigo-400" /> },
    { id: 'prompts', label: 'Master Prompts 1-7 Blueprints', icon: <Terminal className="w-4 h-4 text-zinc-300" /> },
    { id: 'sandbox-tester', label: 'Sandbox Evaluator', icon: <FlaskConical className="w-4 h-4 text-purple-400" /> },
    { id: 'router-failover', label: 'Failover Router', icon: <Network className="w-4 h-4 text-rose-400" /> },
    { id: 'orchestrator-loop', label: 'Generator-Critic Loop', icon: <GitBranch className="w-4 h-4 text-amber-300" /> },
    { id: 'overview', label: 'Architecture & Pipeline', icon: <Layers className="w-4 h-4 text-teal-400" /> },
  ];

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-zinc-100 tracking-tight">
                  Android AI Agent
                </h1>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                  APK Preview
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                Native Voice & Automated Screen Control
              </p>
            </div>
          </div>

          {/* Primary Multi-Mode Switcher: Simple Phone, Virtual Device, Models & Vault, Advanced Console */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1 shadow-inner overflow-x-auto">
            <button
              onClick={() => setActiveTab('simple-assistant')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                isSimpleMode
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
              title="Intuitive phone chat with native voice-to-text"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Phone AI</span>
            </button>

            <button
              onClick={() => setActiveTab('android-device')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                activeTab === 'android-device'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
              title="Virtual Android Device with touch overlay and 60FPS testbed"
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-300" />
              <span>Virtual Phone</span>
            </button>

            <button
              onClick={() => setActiveTab('key-vault')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                activeTab === 'key-vault'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
              title="Manage unlimited AI models, API keys, endpoints, and 1-click Deploy / Disconnect"
            >
              <Lock className="w-3.5 h-3.5 text-cyan-300" />
              <span>Models & Vault</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'key-vault' ? 'bg-cyan-800 text-cyan-100' : 'bg-zinc-800 text-zinc-400'
              }`}>
                Unlimited
              </span>
            </button>

            <button
              onClick={() => setActiveTab('advanced-console')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                isAdvancedConsole
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
              title="Observational page with all metrics and tools coalesced into collapsing tabs"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Advanced</span>
              <span>Console</span>
            </button>
          </div>

          {/* Action Buttons: Guide, Direct Tools, & ZIP Export */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Direct Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowToolsDropdown(!showToolsDropdown)}
                className="btn-tactile btn-tactile-secondary px-2.5 py-1.5 text-xs font-semibold rounded-lg gap-1.5"
                title="Direct navigation to specific tool views"
              >
                <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden md:inline">Jump to Tool</span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </button>

              {showToolsDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-1.5 z-50 space-y-0.5 animate-in fade-in"
                  onMouseLeave={() => setShowToolsDropdown(false)}
                >
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                    Direct Tool Navigator
                  </div>
                  {directTools.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setActiveTab(t.id);
                        setShowToolsDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-left text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                      {t.icon}
                      <span className="truncate">{t.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onOpenOnboarding}
              className="btn-tactile btn-tactile-secondary px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5"
              title="Open First-Time Instructions & Quick Start Guide"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Guide</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className={`btn-tactile px-3 py-1.5 text-xs font-semibold rounded-lg gap-2 ${
                downloadSuccess
                  ? 'btn-tactile-primary'
                  : 'btn-tactile-primary'
              }`}
              title="Download Android Studio source codebase ZIP"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span className="hidden sm:inline">Exported!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span className="hidden sm:inline">{downloading ? 'Packing...' : 'Export ZIP'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
