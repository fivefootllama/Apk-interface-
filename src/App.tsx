/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TabType } from './types/blueprint';
import { HeaderNav } from './components/HeaderNav';
import { SimpleVoiceAssistant } from './components/SimpleVoiceAssistant';
import { UnifiedAdvancedConsole } from './components/UnifiedAdvancedConsole';
import { ArchitecturePipeline } from './components/ArchitecturePipeline';
import { PromptCodeExplorer } from './components/PromptCodeExplorer';
import { VirtualAndroidDevice } from './components/VirtualAndroidDevice';
import { SandboxPlayground } from './components/SandboxPlayground';
import { RouterFailoverTester } from './components/RouterFailoverTester';
import { OrchestratorStudio } from './components/OrchestratorStudio';
import { KeyVaultManager } from './components/KeyVaultManager';
import { TaggedAIChat } from './components/TaggedAIChat';
import { OnboardingModal } from './components/OnboardingModal';
import { AutomationSolutionsStudio } from './components/AutomationSolutionsStudio';
import { OperationsHub } from './components/OperationsHub';
import { GoogleMultiAccountManager } from './components/GoogleMultiAccountManager';
import { DetailedSystemAnalysis } from './components/DetailedSystemAnalysis';
import { ArrowLeft } from 'lucide-react';
import SendToApk from './components/SendToApk';

export default function App() {
  // Default to the intuitive Simple Voice Assistant APK view
  const [activeTab, setActiveTab] = useState<TabType>('simple-assistant');
  const [selectedPromptNum, setSelectedPromptNum] = useState<number>(1);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('hasSeenContainerOnboarding');
    } catch {
      return false; // Don't block screen on reload; accessible anytime via Guide button
    }
  });

  const handleSelectPrompt = (promptNum: number) => {
    setSelectedPromptNum(promptNum);
    setActiveTab('prompts');
  };

  const handleCloseOnboarding = () => {
    try {
      localStorage.setItem('hasSeenContainerOnboarding', 'true');
    } catch {}
    setShowOnboarding(false);
  };

  const isDirectToolView = 
    activeTab !== 'simple-assistant' && 
    activeTab !== 'advanced-console';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* First-Time Instructions & Quick Start Guide Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
        onNavigateToTab={(tab) => {
          setActiveTab(tab);
        }}
      />

      {/* Main Header & Navigation with Simple vs Advanced Switcher */}
      <HeaderNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenOnboarding={() => setShowOnboarding(true)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Back Button when viewing a direct individual sub-tool */}
        {isDirectToolView && (
          <div className="mb-4">
            <button
              onClick={() => setActiveTab('simple-assistant')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-emerald-400 transition-colors bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Phone AI Chat</span>
            </button>
          </div>
        )}

        {/* 1. PRIMARY SIMPLE APK INTERFACE (Intuitive voice-to-text chatfield for beginners) */}
        {activeTab === 'simple-assistant' && (
          <SimpleVoiceAssistant 
            onOpenAdvanced={() => setActiveTab('advanced-console')} 
          />
        )}

        {/* 2. ADVANCED OBSERVATIONAL CONSOLE (Single page with collapsing tabs) */}
        {activeTab === 'advanced-console' && (
          <UnifiedAdvancedConsole />
        )}

        {/* DIRECT SUB-TOOL VIEWS (Accessible via Jump to Tool menu) */}
        {activeTab === 'operations' && (
          <OperationsHub 
            onNavigateToTab={setActiveTab}
            onOpenOnboarding={() => setShowOnboarding(true)}
          />
        )}

        {activeTab === 'google-accounts' && (
          <GoogleMultiAccountManager />
        )}

        {activeTab === 'comparative-analysis' && (
          <DetailedSystemAnalysis />
        )}

        {activeTab === 'overview' && (
          <ArchitecturePipeline 
            onSelectTab={setActiveTab} 
            onSelectPrompt={handleSelectPrompt} 
          />
        )}

        {activeTab === 'prompts' && (
          <PromptCodeExplorer 
            initialPrompt={selectedPromptNum} 
          />
        )}

        {activeTab === 'solutions' && (
          <AutomationSolutionsStudio />
        )}

        {activeTab === 'key-vault' && (
          <KeyVaultManager />
        )}

        {activeTab === 'ai-chat' && (
          <TaggedAIChat />
        )}

        {activeTab === 'android-device' && (
          <VirtualAndroidDevice />
        )}

        {activeTab === 'sandbox-tester' && (
          <SandboxPlayground />
        )}

        {activeTab === 'router-failover' && (
          <RouterFailoverTester />
        )}

        {activeTab === 'orchestrator-loop' && (
          <OrchestratorStudio />
        )}

        {/* New simple APK bridge sender for local IPC */}
        {activeTab === 'send-to-apk' && (
          <SendToApk />
        )}
      </main>

      {/* System Status Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-4 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Self-Evolving Android Container: Native Voice-to-Text & Chaquopy 15.0 Active</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span>Kotlin APK Shell</span>
            <span>·</span>
            <span>Chaquopy 15.0.1</span>
            <span>·</span>
            <span>AndroidKeyStore AES-256</span>
            <span>·</span>
            <span>AccessibilityBridge</span>
            <span>·</span>
            <span>Dual-Phase Sandbox</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
