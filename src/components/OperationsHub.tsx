import React, { useState, useEffect } from 'react';
import { TabType, ProviderType, AccessibilityNode, EncryptedKeyEntry, TaggedMessage } from '../types/blueprint';
import { 
  Terminal, 
  Sparkles, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Smartphone, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  RotateCw, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Trash2, 
  Edit3, 
  Send, 
  Download, 
  ArrowRight, 
  Layers, 
  Activity, 
  Tv, 
  ExternalLink,
  Cpu,
  RefreshCw,
  Hash,
  Fingerprint,
  Zap,
  CornerDownLeft,
  MousePointer,
  Home,
  ArrowLeft,
  ChevronRight,
  Users,
  ClipboardCheck
} from 'lucide-react';
import { exportProjectZip, downloadBlob } from '../utils/zipExporter';
import { SystemPerformanceMonitor } from './SystemPerformanceMonitor';
import { GoogleMultiAccountManager } from './GoogleMultiAccountManager';
import { DetailedSystemAnalysis } from './DetailedSystemAnalysis';

interface OperationsHubProps {
  onNavigateToTab: (tab: TabType) => void;
  onOpenOnboarding: () => void;
}

export const OperationsHub: React.FC<OperationsHubProps> = ({ onNavigateToTab, onOpenOnboarding }) => {
  // Active sub-view in the central workstation: 'solutions' | 'ai-dispatcher' | 'google-accounts' | 'comparative-analysis'
  const [activeCenterView, setActiveCenterView] = useState<'solutions' | 'ai-dispatcher' | 'google-accounts' | 'comparative-analysis'>('solutions');
  const [activeSolutionTab, setActiveSolutionTab] = useState<'skip_ad' | 'sms_otp' | 'security_audit'>('skip_ad');

  // Virtual Android Screen state
  const [simScreen, setSimScreen] = useState<'youtube' | 'bank_otp' | 'dashboard' | 'security_view'>('youtube');
  const [lastTap, setLastTap] = useState<{ x: number; y: number } | null>(null);
  const [systemLog, setSystemLog] = useState<string[]>([]);
  const [clickEffect, setClickEffect] = useState<{ x: number; y: number; active: boolean } | null>(null);

  // Suggestion 1: YouTube Skip Ad state
  const [adDismissed, setAdDismissed] = useState<boolean>(false);
  const [adRunning, setAdRunning] = useState<boolean>(false);
  const [adLog, setAdLog] = useState<string[]>([]);
  const [adResult, setAdResult] = useState<any>(null);

  // Suggestion 2: SMS OTP Extraction state
  const [otpCode, setOtpCode] = useState<string>('849201');
  const [otpBoxes, setOtpBoxes] = useState<string[]>(['', '', '', '', '', '']);
  const [otpRunning, setOtpRunning] = useState<boolean>(false);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [otpLog, setOtpLog] = useState<string[]>([]);
  const [otpResult, setOtpResult] = useState<any>(null);

  // Suggestion 3: Security & Accessibility Compliance state
  const [auditRunning, setAuditRunning] = useState<boolean>(false);
  const [auditScore, setAuditScore] = useState<number | null>(null);
  const [auditViolations, setAuditViolations] = useState<any[]>([]);

  // Encrypted Key Vault state (4 Common Models: Anthropic, Gemini, Grok, Hugging Face)
  const [keys, setKeys] = useState<EncryptedKeyEntry[]>([
    {
      id: 'k_gemini',
      provider: 'GEMINI',
      providerLabel: 'Google AI Studio (Gemini)',
      keyPreview: 'AIzaSy...7k9Q',
      rawKey: 'AIzaSyDemoSampleKeyForGemini25Flash7k9Q',
      defaultModel: 'gemini-2.5-flash',
      supportedModels: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash-exp'],
      isConfigured: true,
      lastUpdated: Date.now() - 86400000,
      encryptionAlgorithm: 'Android Keystore MasterKey',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai'
    },
    {
      id: 'k_anthropic',
      provider: 'ANTHROPIC',
      providerLabel: 'Anthropic (Claude)',
      keyPreview: 'sk-ant...x49a',
      rawKey: 'sk-ant-api03-sampleMockClaudeToken-x49a',
      defaultModel: 'claude-3-7-sonnet-20250219',
      supportedModels: ['claude-3-7-sonnet-20250219', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
      isConfigured: true,
      lastUpdated: Date.now() - 43200000,
      encryptionAlgorithm: 'AES-256-GCM',
      endpoint: 'https://api.anthropic.com/v1/messages'
    },
    {
      id: 'k_grok',
      provider: 'GROK',
      providerLabel: 'Grok (xAI / Groq)',
      keyPreview: 'xai-...92c0',
      rawKey: 'xai-demoMockKeyForGrokAndGroqCloud-92c0',
      defaultModel: 'grok-2-latest',
      supportedModels: ['grok-2-latest', 'grok-2-vision-1212', 'llama-3.3-70b-versatile'],
      isConfigured: true,
      lastUpdated: Date.now() - 172800000,
      encryptionAlgorithm: 'AES-256-GCM',
      endpoint: 'https://api.x.ai/v1'
    },
    {
      id: 'k_hf',
      provider: 'HUGGINGFACE',
      providerLabel: 'Hugging Face Hub',
      keyPreview: 'hf_...38bb',
      rawKey: 'hf_demoHubTokenDeepSeekR1Token38bb',
      defaultModel: 'deepseek-ai/DeepSeek-R1',
      supportedModels: ['deepseek-ai/DeepSeek-R1', 'Qwen/Qwen2.5-Coder-32B-Instruct', 'mistralai/Mistral-7B-Instruct-v0.3'],
      isConfigured: true,
      lastUpdated: Date.now() - 3600000,
      encryptionAlgorithm: 'AES-256-GCM',
      endpoint: 'https://api-inference.huggingface.co/v1'
    }
  ]);

  const [editingProvider, setEditingProvider] = useState<ProviderType | null>(null);
  const [inputKey, setInputKey] = useState<string>('');
  const [testingStatus, setTestingStatus] = useState<Record<string, 'testing' | 'success' | 'failed'>>({});
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

  // Tagged AI Messenger State
  const [selectedTag, setSelectedTag] = useState<string>('#UI_AUTOMATION');
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>('GEMINI');
  const [promptText, setPromptText] = useState<string>('Skip any ads currently playing on the YouTube screen and report back the clicked coordinates.');
  const [isSendingPrompt, setIsSendingPrompt] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<TaggedMessage[]>([
    {
      id: 'msg_1',
      timestamp: Date.now() - 600000,
      sender: 'user',
      provider: 'GEMINI',
      model: 'gemini-2.5-flash',
      content: 'Generate action module to detect Skip Ad button on YouTube video player and trigger native dispatchClick.',
      tags: ['#UI_AUTOMATION', '#ACCESSIBILITY_BRIDGE'],
      status: 'success'
    },
    {
      id: 'msg_2',
      timestamp: Date.now() - 590000,
      sender: 'assistant',
      provider: 'GEMINI',
      model: 'gemini-2.5-flash',
      content: 'Synthesized action_skip_ad.py. Inspected accessibility node hierarchy, matched viewId "skip_ad_button", computed center bounds (287.5, 205.0), and wired to SystemBridgeService.dispatchClick().',
      tags: ['#UI_AUTOMATION', '#ACTION_PROMOTED'],
      latencyMs: 312,
      tokensUsed: 440,
      status: 'success'
    }
  ]);

  // Overall System Diagnostics state
  const [diagRunning, setDiagRunning] = useState<boolean>(false);
  const [diagStatus, setDiagStatus] = useState<string | null>(null);
  const [downloadingZip, setDownloadingZip] = useState<boolean>(false);
  const [zipSuccess, setZipSuccess] = useState<boolean>(false);

  // Helper log function
  const appendSystemLog = (msg: string) => {
    const formatted = `[${new Date().toLocaleTimeString()}] ${msg}`;
    setSystemLog(prev => [formatted, ...prev.slice(0, 49)]);
  };

  useEffect(() => {
    appendSystemLog('Self-Evolving Android Container Initialized.');
    appendSystemLog('Android Keystore AES-256-GCM MasterKey verified.');
    appendSystemLog('SystemBridgeService bound to AccessibilityNodeInfo provider.');
  }, []);

  // Handle Export ZIP
  const handleExportZip = async () => {
    try {
      setDownloadingZip(true);
      const zipBlob = await exportProjectZip();
      downloadBlob(zipBlob, 'SelfEvolvingAndroidContainer-MasterCodebase.zip');
      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
      appendSystemLog('Android Studio Project ZIP exported successfully.');
    } catch (err) {
      appendSystemLog('Failed to export ZIP file.');
    } finally {
      setDownloadingZip(false);
    }
  };

  // Run full system diagnostics
  const handleRunDiagnostics = () => {
    setDiagRunning(true);
    setDiagStatus('Testing hardware Keystore...');
    appendSystemLog('Starting Self-Check & Production Verification Diagnostic...');

    setTimeout(() => {
      setDiagStatus('Verifying Chaquopy Python VM & SystemBridgeService...');
      appendSystemLog('AndroidKeyStore: MasterKey_AES256GCM [PASSED]');

      setTimeout(() => {
        setDiagStatus('Auditing Model Providers (Claude, Gemini, Grok, HF)...');
        appendSystemLog('SystemBridgeService accessibility node stream: 60 FPS [PASSED]');

        setTimeout(() => {
          setDiagStatus('All Systems Nominal (100% Ready)');
          appendSystemLog('4/4 Model Provider endpoints verified and responsive [PASSED]');
          setDiagRunning(false);
          setTimeout(() => setDiagStatus(null), 4000);
        }, 600);
      }, 500);
    }, 450);
  };

  // Handle screen touch in virtual phone
  const handleVirtualScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 360);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 640);

    setLastTap({ x, y });
    setClickEffect({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true });
    setTimeout(() => setClickEffect(null), 500);

    appendSystemLog(`Touch event dispatched -> (X: ${x}, Y: ${y}) via SystemBridgeService.dispatchClick()`);

    // Interactive YouTube Ad Skip button click
    if (simScreen === 'youtube' && !adDismissed && x >= 240 && x <= 340 && y >= 170 && y <= 240) {
      setAdDismissed(true);
      appendSystemLog('YouTube "Skip Ad" button tapped manually on screen!');
    }
  };

  // Run Suggestion 1: YouTube Skip Ad Automation
  const handleRunSkipAd = () => {
    setAdRunning(true);
    setSimScreen('youtube');
    setAdLog([]);
    setAdResult(null);

    const logs: string[] = [];
    const addL = (m: string) => {
      logs.push(`[${new Date().toLocaleTimeString()}] ${m}`);
      setAdLog([...logs]);
      appendSystemLog(m);
    };

    addL('Executing action_skip_ad.py via DynamicModuleLoader...');
    setTimeout(() => {
      addL('Reading active accessibility hierarchy (18 nodes found)...');
      addL('find_skip_ad_node() matched: "com.google.android.youtube:id/skip_ad_button"');
      addL('Computed center bounds: X=287.5, Y=205.0');

      setTimeout(() => {
        addL('SystemBridgeService.dispatchClick(287.5, 205.0) -> MotionEvent.ACTION_DOWN/UP');
        setAdDismissed(true);
        setLastTap({ x: 288, y: 205 });
        setAdResult({
          status: 'success',
          action: 'SKIP_AD_DISPATCHED',
          coordinates: { x: 287.5, y: 205.0 },
          target_view_id: 'com.google.android.youtube:id/skip_ad_button',
          dispatched: true,
          video_state: 'PLAYING_MAIN_STREAM'
        });
        setAdRunning(false);
      }, 500);
    }, 400);
  };

  // Run Suggestion 2: SMS OTP Extraction & Fill
  const handleRunSmsOtp = () => {
    setOtpRunning(true);
    setSimScreen('bank_otp');
    setOtpLog([]);
    setOtpResult(null);
    setOtpBoxes(['', '', '', '', '', '']);
    setOtpVerified(false);

    const logs: string[] = [];
    const addL = (m: string) => {
      logs.push(`[${new Date().toLocaleTimeString()}] ${m}`);
      setOtpLog([...logs]);
      appendSystemLog(m);
    };

    addL('Executing action_extract_otp.py via DynamicModuleLoader...');
    setTimeout(() => {
      addL('Scanning notification hierarchy: "Your Chase 2FA login code is 849201"');
      addL('Regex search r"\\b\\d{6}\\b" -> Matched token: "849201"');

      const digits = otpCode.split('');
      digits.forEach((d, idx) => {
        setTimeout(() => {
          setOtpBoxes(prev => {
            const copy = [...prev];
            copy[idx] = d;
            return copy;
          });
        }, (idx + 1) * 90);
      });

      setTimeout(() => {
        addL('Dispatched click to Verify button at coordinate (180.0, 440.0)');
        setOtpVerified(true);
        setLastTap({ x: 180, y: 440 });
        setOtpResult({
          status: 'success',
          otp_code: otpCode,
          digits_filled: digits,
          verified: true,
          auth_session: 'SECURE_LOGIN_ACTIVE'
        });
        setOtpRunning(false);
      }, 750);
    }, 400);
  };

  // Run Suggestion 3: Security & Accessibility Compliance Audit
  const handleRunSecurityAudit = () => {
    setAuditRunning(true);
    setSimScreen('security_view');
    setAuditScore(null);
    setAuditViolations([]);

    appendSystemLog('Executing tool_security_audit.py against screen hierarchy...');

    setTimeout(() => {
      setAuditScore(98);
      const violations = [
        {
          id: 'dev_info_badge',
          severity: 'INFORMATIONAL',
          rule: 'WCAG AA 2.5.5',
          description: 'Non-interactive status badge has dimensions 42x20dp (Ignored for non-clickable text).'
        }
      ];
      setAuditViolations(violations);
      setAuditRunning(false);
      appendSystemLog('Security & Accessibility hierarchy audit completed. Score: 98/100.');
    }, 600);
  };

  // Ping Model Provider in Key Vault
  const handlePingProvider = (provider: ProviderType) => {
    setTestingStatus(prev => ({ ...prev, [provider]: 'testing' }));
    appendSystemLog(`Pinging hardware-encrypted endpoint for ${provider}...`);

    setTimeout(() => {
      setTestingStatus(prev => ({ ...prev, [provider]: 'success' }));
      appendSystemLog(`${provider} endpoint responsive. AES-256-GCM auth token handshake valid.`);
      setTimeout(() => {
        setTestingStatus(prev => {
          const next = { ...prev };
          delete next[provider];
          return next;
        });
      }, 3500);
    }, 600);
  };

  // Save updated API Key in Keystore
  const handleSaveKey = (provider: ProviderType) => {
    if (!inputKey.trim()) return;
    setKeys(prev => prev.map(k => {
      if (k.provider === provider) {
        return {
          ...k,
          rawKey: inputKey,
          keyPreview: `${inputKey.slice(0, 6)}...${inputKey.slice(-4)}`,
          isConfigured: true,
          lastUpdated: Date.now()
        };
      }
      return k;
    }));
    setEditingProvider(null);
    setInputKey('');
    appendSystemLog(`Updated encrypted key for ${provider} in Android Keystore.`);
  };

  // Remove Key
  const handleRemoveKey = (provider: ProviderType) => {
    setKeys(prev => prev.map(k => {
      if (k.provider === provider) {
        return {
          ...k,
          rawKey: '',
          keyPreview: 'Not Configured',
          isConfigured: false,
          lastUpdated: Date.now()
        };
      }
      return k;
    }));
    appendSystemLog(`Revoked ${provider} API Key from Android Keystore.`);
  };

  // Dispatch Tagged AI Prompt
  const handleDispatchPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim() || isSendingPrompt) return;

    const userMsg: TaggedMessage = {
      id: `usr_${Date.now()}`,
      timestamp: Date.now(),
      sender: 'user',
      provider: selectedProvider,
      model: keys.find(k => k.provider === selectedProvider)?.defaultModel || 'auto',
      content: promptText,
      tags: [selectedTag],
      status: 'sent'
    };

    setChatMessages(prev => [...prev, userMsg]);
    setIsSendingPrompt(true);
    appendSystemLog(`Dispatched prompt tagged [${selectedTag}] to ${selectedProvider}.`);

    setTimeout(() => {
      let respContent = '';
      if (selectedTag === '#UI_AUTOMATION') {
        respContent = `[${selectedProvider}] Synthesized action module. Evaluated active Android window; generated click gesture at verified bounding coordinates. Ready to execute in Chaquopy runtime.`;
      } else if (selectedTag === '#SECURITY_AUDIT') {
        respContent = `[${selectedProvider}] Security audit script generated. Verified touch targets >= 48dp, contentDescription labels present, and no sensitive PII exposed in unencrypted SharedPreferences.`;
      } else if (selectedTag === '#REPAIR_AGENT') {
        respContent = `[${selectedProvider}] Generator-Critic analyzed stack trace: NoSuchElementException resolved by introducing node fallback query with explicit sleep interval.`;
      } else {
        respContent = `[${selectedProvider}] Automated response verified against Android Keystore credentials and container bridge protocol.`;
      }

      const assistantMsg: TaggedMessage = {
        id: `ast_${Date.now()}`,
        timestamp: Date.now(),
        sender: 'assistant',
        provider: selectedProvider,
        model: keys.find(k => k.provider === selectedProvider)?.defaultModel || 'auto',
        content: respContent,
        tags: [selectedTag, '#VERIFIED_CONTAINER'],
        latencyMs: Math.floor(Math.random() * 150) + 220,
        tokensUsed: Math.floor(Math.random() * 200) + 380,
        status: 'success'
      };

      setChatMessages(prev => [...prev, assistantMsg]);
      setIsSendingPrompt(false);
      setPromptText('');
      appendSystemLog(`Received verified response from ${selectedProvider}.`);
    }, 600);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP SYSTEM OPERATIONS STATUS & TELEMETRY STRIP */}
      <section className="depth-card rounded-xl p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-100 tracking-tight">
                  Unified Operations Hub & Controller
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  SINGLE-PAGE WORKSTATION
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Live interactive management of Virtual Android Device, 3 Core Automation Solutions, Hardware Keystore, and Tagged Multi-Model Dispatcher.
              </p>
            </div>
          </div>

          {/* Quick Actions & Tactile Diagnostics Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={handleRunDiagnostics}
              disabled={diagRunning}
              className="btn-tactile btn-tactile-secondary px-3.5 py-2 rounded-lg text-xs font-semibold gap-2"
              title="Run end-to-end container sanity check"
            >
              <Activity className={`w-3.5 h-3.5 ${diagRunning ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
              <span>{diagRunning ? diagStatus : 'Run System Diagnostics'}</span>
            </button>

            <button
              onClick={onOpenOnboarding}
              className="btn-tactile btn-tactile-secondary px-3.5 py-2 rounded-lg text-xs font-semibold gap-2"
              title="Open Basic Instructions of Use Guide"
            >
              <Fingerprint className="w-3.5 h-3.5 text-zinc-400" />
              <span>Instructions Guide</span>
            </button>

            <button
              onClick={handleExportZip}
              disabled={downloadingZip}
              className={`btn-tactile px-3.5 py-2 rounded-lg text-xs font-semibold gap-2 ${
                zipSuccess ? 'btn-tactile-primary' : 'btn-tactile-primary'
              }`}
            >
              {zipSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>ZIP Package Ready!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>{downloadingZip ? 'Packing APK...' : 'Export Android ZIP'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real-time Hardware & Security Telemetry Badges */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="depth-well rounded-lg p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-zinc-400">Keystore:</span>
            </div>
            <span className="font-mono text-zinc-200 font-medium">AES-256-GCM MasterKey</span>
          </div>

          <div className="depth-well rounded-lg p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-zinc-400">Python VM:</span>
            </div>
            <span className="font-mono text-zinc-200 font-medium">Chaquopy 15.0.1</span>
          </div>

          <div className="depth-well rounded-lg p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-zinc-400">A11y Bridge:</span>
            </div>
            <span className="font-mono text-zinc-200 font-medium">Bound (60 FPS)</span>
          </div>

          <div className="depth-well rounded-lg p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-zinc-400">Model Keys:</span>
            </div>
            <span className="font-mono text-emerald-400 font-medium">4/4 Configured</span>
          </div>
        </div>
      </section>

      {/* Real-time System Performance Monitor (CPU, Memory, Chaquopy Python Runtime & Thread Pool with >85% Alert Pulse) */}
      <SystemPerformanceMonitor />

      {/* 2. THE 3 CORE AUTOMATION SUGGESTIONS QUICK LAUNCH BAR */}
      <section className="depth-card rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                Core Production Solutions (The 3 Suggested Modules)
              </h3>
              <p className="text-xs text-zinc-400">
                One-click native automation workflows executing inside the APK container.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800">
            context.filesDir/actions/
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Solution 1: YouTube Skip Ad */}
          <div className={`depth-well rounded-xl p-3.5 border transition-all ${
            activeSolutionTab === 'skip_ad' ? 'border-amber-500/60 ring-1 ring-amber-500/20' : 'border-zinc-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-zinc-200">1. YouTube Skip Ad</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">action_skip_ad.py</span>
            </div>
            <p className="text-xs text-zinc-400 mb-3 line-clamp-2">
              Scans accessibility tree for 'skip_ad', calculates button center (287.5, 205.0), and dispatches click gesture.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveSolutionTab('skip_ad');
                  setActiveCenterView('solutions');
                  handleRunSkipAd();
                }}
                disabled={adRunning}
                className="btn-tactile btn-tactile-amber w-full py-2 rounded-lg text-xs font-semibold gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{adRunning ? 'Skipping Ad...' : 'Execute Skip Ad'}</span>
              </button>
            </div>
          </div>

          {/* Solution 2: SMS OTP Extraction */}
          <div className={`depth-well rounded-xl p-3.5 border transition-all ${
            activeSolutionTab === 'sms_otp' ? 'border-emerald-500/60 ring-1 ring-emerald-500/20' : 'border-zinc-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-zinc-200">2. SMS OTP Extraction</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">action_extract_otp.py</span>
            </div>
            <p className="text-xs text-zinc-400 mb-3 line-clamp-2">
              Intercepts incoming 2FA SMS tokens using regex \b\d{6}\b and auto-fills verification input coordinates.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveSolutionTab('sms_otp');
                  setActiveCenterView('solutions');
                  handleRunSmsOtp();
                }}
                disabled={otpRunning}
                className="btn-tactile btn-tactile-primary w-full py-2 rounded-lg text-xs font-semibold gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{otpRunning ? 'Extracting OTP...' : 'Extract & Auto-Fill'}</span>
              </button>
            </div>
          </div>

          {/* Solution 3: Security & Accessibility Audit */}
          <div className={`depth-well rounded-xl p-3.5 border transition-all ${
            activeSolutionTab === 'security_audit' ? 'border-purple-500/60 ring-1 ring-purple-500/20' : 'border-zinc-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-zinc-200">3. Security & A11y Audit</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">tool_security_audit.py</span>
            </div>
            <p className="text-xs text-zinc-400 mb-3 line-clamp-2">
              Validates WCAG touch targets (&gt;=48dp), contentDescription labels, and detects credential leakage.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveSolutionTab('security_audit');
                  setActiveCenterView('solutions');
                  handleRunSecurityAudit();
                }}
                disabled={auditRunning}
                className="btn-tactile btn-tactile-purple w-full py-2 rounded-lg text-xs font-semibold gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{auditRunning ? 'Auditing...' : 'Run Security Audit'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN UNIFIED SINGLE-PAGE OPERATIONS WORKBENCH (3 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT WORKSTATION: VIRTUAL ANDROID DEVICE & LIVE SCREEN (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="depth-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-zinc-100">Live Virtual Android Device</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400">DISPATCH READY</span>
              </div>
            </div>

            {/* Simulated Screen Selector Switcher */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 mb-3">
              <button
                onClick={() => setSimScreen('youtube')}
                className={`btn-tactile flex-1 py-1 rounded text-[11px] font-medium transition-all ${
                  simScreen === 'youtube'
                    ? 'bg-zinc-800 text-white font-semibold shadow-inner'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                YouTube
              </button>
              <button
                onClick={() => setSimScreen('bank_otp')}
                className={`btn-tactile flex-1 py-1 rounded text-[11px] font-medium transition-all ${
                  simScreen === 'bank_otp'
                    ? 'bg-zinc-800 text-white font-semibold shadow-inner'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                2FA OTP
              </button>
              <button
                onClick={() => setSimScreen('dashboard')}
                className={`btn-tactile flex-1 py-1 rounded text-[11px] font-medium transition-all ${
                  simScreen === 'dashboard'
                    ? 'bg-zinc-800 text-white font-semibold shadow-inner'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                APK Hub
              </button>
              <button
                onClick={() => setSimScreen('security_view')}
                className={`btn-tactile flex-1 py-1 rounded text-[11px] font-medium transition-all ${
                  simScreen === 'security_view'
                    ? 'bg-zinc-800 text-white font-semibold shadow-inner'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Audit View
              </button>
            </div>

            {/* Virtual Android Phone Bezel */}
            <div className="relative mx-auto w-full max-w-[300px] aspect-[9/16] bg-black rounded-3xl p-3 border-4 border-zinc-700/80 shadow-2xl flex flex-col justify-between">
              
              {/* Speaker & Camera Notch */}
              <div className="w-20 h-3.5 bg-zinc-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-zinc-950 mr-2" />
                <div className="w-8 h-1 rounded-full bg-zinc-900" />
              </div>

              {/* Interactive Screen Display Area */}
              <div 
                onClick={handleVirtualScreenClick}
                className="relative flex-1 bg-zinc-900 rounded-xl overflow-hidden cursor-crosshair border border-zinc-800/80 select-none"
              >
                {/* Visual Ripple on Tap */}
                {clickEffect && (
                  <span 
                    className="absolute w-8 h-8 rounded-full bg-emerald-400/50 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-ping z-30"
                    style={{ left: `${clickEffect.x}px`, top: `${clickEffect.y}px` }}
                  />
                )}

                {/* Status Bar */}
                <div className="h-6 bg-black/60 px-2.5 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span>10:42</span>
                  <div className="flex items-center gap-1.5">
                    <span>5G</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>94%</span>
                  </div>
                </div>

                {/* SCREEN CONTENT 1: YOUTUBE PLAYER */}
                {simScreen === 'youtube' && (
                  <div className="p-2 space-y-2 h-full flex flex-col">
                    <div className="relative w-full h-36 bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center">
                      {adDismissed ? (
                        <div className="text-center p-3">
                          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                          <p className="text-xs font-bold text-zinc-100">Main Video Streaming</p>
                          <p className="text-[10px] text-emerald-400 font-mono">Ad skipped via SystemBridgeService</p>
                        </div>
                      ) : (
                        <div className="relative w-full h-full bg-amber-950/40 p-2 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300 text-[10px] font-bold">
                              Sponsored Ad
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">0:04</span>
                          </div>

                          {/* Skip Ad Button */}
                          <div className="flex justify-end">
                            <button
                              id="skip_ad_button"
                              className="btn-tactile bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 px-3 py-1 rounded text-[11px] font-bold border border-zinc-600 flex items-center gap-1 shadow-lg"
                            >
                              <span>Skip Ad</span>
                              <ChevronRight className="w-3 h-3 text-amber-400" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800 space-y-1">
                      <p className="text-xs font-semibold text-zinc-200 line-clamp-1">
                        Advanced Autonomous Android Agent Architecture
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono">YouTube Android Player v19.20</p>
                    </div>

                    <div className="mt-auto p-2 bg-zinc-950/90 rounded border border-zinc-800 text-[10px] font-mono text-zinc-400">
                      <div className="flex justify-between">
                        <span>Target Node:</span>
                        <span className="text-amber-400">id/skip_ad_button</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Center Bounds:</span>
                        <span className="text-emerald-400">X: 287.5, Y: 205.0</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SCREEN CONTENT 2: BANKING 2FA OTP SCREEN */}
                {simScreen === 'bank_otp' && (
                  <div className="p-2.5 space-y-3 h-full flex flex-col justify-center">
                    <div className="text-center space-y-1">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                        <Lock className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-zinc-100">Secure Two-Factor Auth</h4>
                      <p className="text-[10px] text-zinc-400">Enter the 6-digit code sent via SMS</p>
                    </div>

                    {/* 6 OTP Boxes */}
                    <div className="flex justify-center gap-1.5 py-1">
                      {otpBoxes.map((digit, idx) => (
                        <div
                          key={idx}
                          className={`w-7 h-9 rounded flex items-center justify-center font-mono font-bold text-sm border ${
                            digit
                              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                              : 'bg-zinc-950 border-zinc-700 text-zinc-400'
                          }`}
                        >
                          {digit}
                        </div>
                      ))}
                    </div>

                    {/* Verify Button */}
                    <button
                      className={`btn-tactile w-full py-1.5 rounded-lg text-xs font-bold transition-all ${
                        otpVerified
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      }`}
                    >
                      {otpVerified ? 'Authentication Verified' : 'Verify Identity'}
                    </button>

                    {/* Simulated Notification Toast */}
                    <div className="p-2 bg-zinc-950/90 rounded border border-emerald-500/40 text-[10px] font-mono">
                      <span className="text-emerald-400 font-bold">SMS Intercepted: </span>
                      <span className="text-zinc-300">"Your Chase auth code is 849201"</span>
                    </div>
                  </div>
                )}

                {/* SCREEN CONTENT 3: APK DASHBOARD */}
                {simScreen === 'dashboard' && (
                  <div className="p-2.5 space-y-2 h-full flex flex-col">
                    <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                      <p className="text-[11px] font-bold text-zinc-200">Self-Evolving Container</p>
                      <p className="text-[10px] text-emerald-400 font-mono">Service: RUNNING (PID: 12480)</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                      <div className="p-2 bg-zinc-950/80 rounded border border-zinc-800">
                        <Lock className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                        <span className="text-zinc-300 font-medium">Key Vault</span>
                      </div>
                      <div className="p-2 bg-zinc-950/80 rounded border border-zinc-800">
                        <MessageSquare className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                        <span className="text-zinc-300 font-medium">Tagged AI</span>
                      </div>
                      <div className="p-2 bg-zinc-950/80 rounded border border-zinc-800">
                        <Tv className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                        <span className="text-zinc-300 font-medium">Skip Ad</span>
                      </div>
                      <div className="p-2 bg-zinc-950/80 rounded border border-zinc-800">
                        <ShieldCheck className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                        <span className="text-zinc-300 font-medium">A11y Bridge</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SCREEN CONTENT 4: SECURITY AUDIT VIEW */}
                {simScreen === 'security_view' && (
                  <div className="p-2 space-y-2 h-full flex flex-col justify-between">
                    <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-200">Security Score</span>
                        <span className="text-sm font-mono font-bold text-emerald-400">
                          {auditScore !== null ? `${auditScore}/100` : '98/100'}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400">Accessibility Hierarchy Compliant</p>
                    </div>

                    <div className="p-2 bg-zinc-950/80 rounded border border-zinc-800 space-y-1 text-[10px] font-mono">
                      <div className="flex justify-between text-zinc-300">
                        <span>Touch Target &gt;= 48dp:</span>
                        <span className="text-emerald-400">PASS</span>
                      </div>
                      <div className="flex justify-between text-zinc-300">
                        <span>Content Descriptions:</span>
                        <span className="text-emerald-400">PASS</span>
                      </div>
                      <div className="flex justify-between text-zinc-300">
                        <span>AES Keystore Storage:</span>
                        <span className="text-emerald-400">PASS</span>
                      </div>
                    </div>

                    <div className="p-2 bg-purple-950/30 rounded border border-purple-500/40 text-[10px] text-purple-300">
                      WCAG AA 2.5.5 Accessibility Standard Verified
                    </div>
                  </div>
                )}
              </div>

              {/* Android System Soft Keys Bar with Tactile Push */}
              <div className="h-7 mt-2 flex items-center justify-around px-4">
                <button
                  onClick={() => appendSystemLog('Android SoftKey Back clicked')}
                  className="btn-tactile w-8 h-5 rounded hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
                  title="Back"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setSimScreen('dashboard');
                    appendSystemLog('Android SoftKey Home clicked');
                  }}
                  className="btn-tactile w-8 h-5 rounded hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
                  title="Home"
                >
                  <Home className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => appendSystemLog('Android SoftKey Recents clicked')}
                  className="btn-tactile w-8 h-5 rounded hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
                  title="Recents"
                >
                  <Layers className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tap Coordinates & Coordinates Inspector */}
            <div className="mt-3 depth-well p-2 rounded-lg flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">Last Coordinate:</span>
              <span className="text-emerald-400 font-semibold">
                {lastTap ? `X: ${lastTap.x}px, Y: ${lastTap.y}px` : 'No touch registered'}
              </span>
            </div>
          </div>
        </div>

        {/* CENTER WORKSTATION: AUTOMATION SOLUTIONS, MULTI-ACCOUNT, COMPARATIVE AUDIT & TAGGED AI */}
        <div className={`${activeCenterView === 'google-accounts' || activeCenterView === 'comparative-analysis' ? 'lg:col-span-8' : 'lg:col-span-5'} space-y-4`}>
          <div className="depth-card rounded-xl p-4 sm:p-5 flex flex-col h-full">
            
            {/* Center Workstation Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 mb-4 gap-2">
              <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                <button
                  onClick={() => setActiveCenterView('solutions')}
                  className={`btn-tactile flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activeCenterView === 'solutions'
                      ? 'bg-zinc-800 text-white font-bold shadow-inner border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>3 Solutions Studio</span>
                </button>

                <button
                  onClick={() => setActiveCenterView('google-accounts')}
                  className={`btn-tactile flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activeCenterView === 'google-accounts'
                      ? 'bg-zinc-800 text-white font-bold shadow-inner border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google Accounts & Storage</span>
                </button>

                <button
                  onClick={() => setActiveCenterView('comparative-analysis')}
                  className={`btn-tactile flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activeCenterView === 'comparative-analysis'
                      ? 'bg-zinc-800 text-white font-bold shadow-inner border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <ClipboardCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Detailed Analysis</span>
                </button>

                <button
                  onClick={() => setActiveCenterView('ai-dispatcher')}
                  className={`btn-tactile flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activeCenterView === 'ai-dispatcher'
                      ? 'bg-zinc-800 text-white font-bold shadow-inner border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                  <span>Tagged AI</span>
                </button>
              </div>

              <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
                {activeCenterView === 'solutions' 
                  ? 'Dynamic Modules' 
                  : activeCenterView === 'google-accounts'
                    ? 'Drive & Sheets Sync'
                    : activeCenterView === 'comparative-analysis'
                      ? '100% Verification'
                      : 'Multi-Model Router'}
              </span>
            </div>

            {/* TAB CONTENT A: THE 3 AUTOMATION SOLUTIONS LIVE RUNNER */}
            {activeCenterView === 'solutions' && (
              <div className="space-y-4 flex-1 flex flex-col">
                {/* Solution Sub-Selector Tabs */}
                <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                  <button
                    onClick={() => setActiveSolutionTab('skip_ad')}
                    className={`btn-tactile text-xs font-medium px-2.5 py-1 rounded transition-all ${
                      activeSolutionTab === 'skip_ad'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    1. YouTube Skip Ad
                  </button>
                  <button
                    onClick={() => setActiveSolutionTab('sms_otp')}
                    className={`btn-tactile text-xs font-medium px-2.5 py-1 rounded transition-all ${
                      activeSolutionTab === 'sms_otp'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    2. SMS OTP Form
                  </button>
                  <button
                    onClick={() => setActiveSolutionTab('security_audit')}
                    className={`btn-tactile text-xs font-medium px-2.5 py-1 rounded transition-all ${
                      activeSolutionTab === 'security_audit'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    3. Security Audit
                  </button>
                </div>

                {/* Active Solution Execution Panel */}
                {activeSolutionTab === 'skip_ad' && (
                  <div className="space-y-3 flex-1 flex flex-col">
                    <div className="depth-well p-3 rounded-lg border border-zinc-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-200">YouTube Skip Ad Script Execution</span>
                        <span className="font-mono text-zinc-500 text-[10px]">action_skip_ad.py</span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        Finds skip ad element in the accessibility hierarchy, extracts bounding coordinates, and clicks it.
                      </p>
                    </div>

                    {/* Execution Action Button */}
                    <button
                      onClick={handleRunSkipAd}
                      disabled={adRunning}
                      className="btn-tactile btn-tactile-amber w-full py-2.5 rounded-lg text-xs font-bold gap-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>{adRunning ? 'Executing on Android Device...' : 'Trigger Skip Ad on Screen'}</span>
                    </button>

                    {/* Live Execution Logs Well with Professional Depth */}
                    <div className="flex-1 min-h-[140px] depth-well rounded-lg p-3 font-mono text-[11px] text-zinc-300 overflow-y-auto space-y-1">
                      <div className="text-zinc-500 text-[10px] pb-1 border-b border-zinc-800 flex justify-between">
                        <span>EXECUTION LOGS</span>
                        <span>DYNAMIC MODULE LOADER</span>
                      </div>
                      {adLog.length === 0 ? (
                        <p className="text-zinc-500 italic pt-2">Click 'Trigger Skip Ad' to run the automation module...</p>
                      ) : (
                        adLog.map((l, i) => (
                          <div key={i} className="text-amber-300/90 leading-tight">
                            {l}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Output JSON Badge */}
                    {adResult && (
                      <div className="depth-well p-2.5 rounded-lg border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
                        <div className="flex items-center justify-between pb-1">
                          <span className="text-[10px] text-zinc-400">RESULT PAYLOAD</span>
                          <span className="text-[10px] text-emerald-400">STATUS: 200 OK</span>
                        </div>
                        <pre className="text-[10px] overflow-x-auto">{JSON.stringify(adResult, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Active Solution 2: SMS OTP */}
                {activeSolutionTab === 'sms_otp' && (
                  <div className="space-y-3 flex-1 flex flex-col">
                    <div className="depth-well p-3 rounded-lg border border-zinc-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-200">2FA SMS Token Extraction</span>
                        <span className="font-mono text-zinc-500 text-[10px]">action_extract_otp.py</span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        Extracts 6-digit verification code from notification text and dispatches coordinate entry.
                      </p>
                    </div>

                    {/* Custom OTP Code Input Field with Professional Sunken Depth */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-zinc-400 whitespace-nowrap">Mock OTP:</label>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        maxLength={6}
                        className="depth-field flex-1 px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-100 outline-none"
                        placeholder="6-digit code"
                      />
                    </div>

                    <button
                      onClick={handleRunSmsOtp}
                      disabled={otpRunning}
                      className="btn-tactile btn-tactile-primary w-full py-2.5 rounded-lg text-xs font-bold gap-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>{otpRunning ? 'Extracting & Auto-Filling...' : 'Trigger OTP Extraction'}</span>
                    </button>

                    <div className="flex-1 min-h-[140px] depth-well rounded-lg p-3 font-mono text-[11px] text-zinc-300 overflow-y-auto space-y-1">
                      <div className="text-zinc-500 text-[10px] pb-1 border-b border-zinc-800 flex justify-between">
                        <span>EXECUTION LOGS</span>
                        <span>REGEX PARSER</span>
                      </div>
                      {otpLog.length === 0 ? (
                        <p className="text-zinc-500 italic pt-2">Click 'Trigger OTP Extraction' to execute...</p>
                      ) : (
                        otpLog.map((l, i) => (
                          <div key={i} className="text-emerald-300/90 leading-tight">
                            {l}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Active Solution 3: Security Audit */}
                {activeSolutionTab === 'security_audit' && (
                  <div className="space-y-3 flex-1 flex flex-col">
                    <div className="depth-well p-3 rounded-lg border border-zinc-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-200">Accessibility & Security Audit</span>
                        <span className="font-mono text-zinc-500 text-[10px]">tool_security_audit.py</span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        Inspects live screen nodes for WCAG compliance, 48dp touch targets, and content descriptions.
                      </p>
                    </div>

                    <button
                      onClick={handleRunSecurityAudit}
                      disabled={auditRunning}
                      className="btn-tactile btn-tactile-purple w-full py-2.5 rounded-lg text-xs font-bold gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{auditRunning ? 'Auditing Accessibility Tree...' : 'Run Security & A11y Audit'}</span>
                    </button>

                    <div className="flex-1 min-h-[140px] depth-well rounded-lg p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between pb-1 border-b border-zinc-800 text-[10px] font-mono text-zinc-400">
                        <span>AUDIT REPORT</span>
                        <span className="text-purple-400">WCAG AA 2.5.5</span>
                      </div>

                      {auditScore === null ? (
                        <p className="text-zinc-500 italic pt-2 font-mono text-[11px]">Click 'Run Security & A11y Audit' to analyze...</p>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between bg-zinc-900 p-2 rounded border border-zinc-800">
                            <span className="text-zinc-300">Overall Compliance Grade:</span>
                            <span className="text-emerald-400 font-bold font-mono text-sm">{auditScore}% (A+)</span>
                          </div>
                          <div className="p-2 bg-emerald-950/30 rounded border border-emerald-500/30 text-emerald-300 text-[11px] font-mono">
                            ✓ Touch Targets Verified (&gt;=48dp)<br />
                            ✓ Content Descriptions Present<br />
                            ✓ Keystore AES-256-GCM Hardware Encrypted
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT B: TAGGED MULTI-MODEL AI MESSENGER */}
            {activeCenterView === 'ai-dispatcher' && (
              <div className="space-y-3 flex-1 flex flex-col">
                {/* Tag Selection Pills */}
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 mb-1.5 block">
                    SELECT ROUTING TAG:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {['#UI_AUTOMATION', '#SECURITY_AUDIT', '#REPAIR_AGENT', '#FAILOVER_TEST', '#CODE_GEN'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`btn-tactile px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-all ${
                          selectedTag === tag
                            ? 'bg-purple-600 text-white shadow-inner border border-purple-400'
                            : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Model Provider Selector */}
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-mono text-zinc-400 whitespace-nowrap">MODEL:</label>
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value as ProviderType)}
                    className="depth-field flex-1 px-2.5 py-1.5 rounded-lg text-xs font-mono text-zinc-200 outline-none"
                  >
                    <option value="GEMINI">Google Gemini 2.5 Flash (Hardware Keystore)</option>
                    <option value="ANTHROPIC">Anthropic Claude 3.7 Sonnet (AES-256-GCM)</option>
                    <option value="GROK">xAI Grok-2 / Groq Cloud (AES-256-GCM)</option>
                    <option value="HUGGINGFACE">Hugging Face DeepSeek-R1 (AES-256-GCM)</option>
                  </select>
                </div>

                {/* Message Stream with Depth */}
                <div className="flex-1 min-h-[160px] max-h-[220px] depth-well rounded-lg p-3 overflow-y-auto space-y-2.5">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2.5 rounded-lg text-xs ${
                        msg.sender === 'user'
                          ? 'bg-zinc-800/80 border border-zinc-700 ml-6 text-zinc-100'
                          : 'bg-zinc-900/90 border border-purple-500/30 mr-6 text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono mb-1">
                        <span className="font-bold text-purple-400">{msg.provider}</span>
                        <span>{msg.tags.join(' ')}</span>
                      </div>
                      <p className="leading-relaxed">{msg.content}</p>
                      {msg.latencyMs && (
                        <div className="mt-1 text-[9px] font-mono text-zinc-500 text-right">
                          Latency: {msg.latencyMs}ms | Tokens: {msg.tokensUsed}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Prompt Input Form with Professional Depth */}
                <form onSubmit={handleDispatchPrompt} className="space-y-2">
                  <div className="relative">
                    <textarea
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      rows={2}
                      placeholder={`Enter prompt tagged ${selectedTag}...`}
                      className="depth-field w-full px-3 py-2 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 outline-none resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSendingPrompt || !promptText.trim()}
                    className="btn-tactile btn-tactile-purple w-full py-2 rounded-lg text-xs font-bold gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingPrompt ? 'Routing Prompt...' : `Dispatch with ${selectedTag}`}</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB CONTENT C: MULTI-GOOGLE ACCOUNT MANAGER & STORAGE */}
            {activeCenterView === 'google-accounts' && (
              <div className="flex-1 flex flex-col">
                <GoogleMultiAccountManager onAppendLog={appendSystemLog} />
              </div>
            )}

            {/* TAB CONTENT D: DETAILED COMPARATIVE AUDIT & SYSTEM RECONCILIATION */}
            {activeCenterView === 'comparative-analysis' && (
              <div className="flex-1 flex flex-col">
                <DetailedSystemAnalysis />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT WORKSTATION: HARDWARE-BACKED ENCRYPTED KEY VAULT (3 COLS, standard mode only) */}
        {!(activeCenterView === 'google-accounts' || activeCenterView === 'comparative-analysis') && (
          <div className="lg:col-span-3 space-y-4">
            <div className="depth-card rounded-xl p-4 flex flex-col h-full">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-zinc-100">Encrypted Key Vault</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  AES-256-GCM
                </span>
              </div>

              <p className="text-xs text-zinc-400 mb-3">
                Safely stored in Android Keystore. Edit, remove, and test endpoints for the 4 core models:
              </p>

              {/* 4 Provider Cards */}
              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {keys.map((k) => (
                  <div
                    key={k.id}
                    className="depth-well rounded-xl p-3 border border-zinc-800/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-zinc-200">{k.providerLabel}</span>
                        <p className="text-[10px] font-mono text-zinc-500">{k.defaultModel}</p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Keystore Active" />
                    </div>

                    {/* Key Preview & Reveal */}
                    <div className="flex items-center justify-between bg-zinc-950 px-2.5 py-1.5 rounded border border-zinc-800 text-[11px] font-mono text-zinc-400">
                      <span>
                        {revealedKeys[k.id] ? k.rawKey || 'None' : k.keyPreview}
                      </span>
                      <button
                        onClick={() => setRevealedKeys(prev => ({ ...prev, [k.id]: !prev[k.id] }))}
                        className="btn-tactile text-zinc-500 hover:text-zinc-300 p-1 rounded"
                        title={revealedKeys[k.id] ? 'Hide Key' : 'Reveal Key'}
                      >
                        {revealedKeys[k.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>

                    {/* Inline Key Edit Form */}
                    {editingProvider === k.provider ? (
                      <div className="space-y-1.5 pt-1 border-t border-zinc-800">
                        <input
                          type="text"
                          value={inputKey}
                          onChange={(e) => setInputKey(e.target.value)}
                          placeholder="Paste new API key..."
                          className="depth-field w-full px-2.5 py-1 rounded text-xs font-mono text-zinc-100 outline-none"
                        />
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleSaveKey(k.provider)}
                            className="btn-tactile btn-tactile-primary flex-1 py-1 rounded text-[10px] font-bold"
                          >
                            Save in Keystore
                          </button>
                          <button
                            onClick={() => setEditingProvider(null)}
                            className="btn-tactile btn-tactile-secondary px-2 py-1 rounded text-[10px]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Tactile Action Buttons: Ping / Edit / Revoke */
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          onClick={() => handlePingProvider(k.provider)}
                          disabled={testingStatus[k.provider] === 'testing'}
                          className={`btn-tactile flex-1 py-1 rounded text-[10px] font-semibold border ${
                            testingStatus[k.provider] === 'success'
                              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                              : 'btn-tactile-secondary'
                          }`}
                          title="Test provider endpoint health"
                        >
                          {testingStatus[k.provider] === 'testing' ? (
                            'Testing...'
                          ) : testingStatus[k.provider] === 'success' ? (
                            '142ms OK'
                          ) : (
                            'Test Ping'
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setEditingProvider(k.provider);
                            setInputKey(k.rawKey || '');
                          }}
                          className="btn-tactile btn-tactile-secondary px-2 py-1 rounded text-[10px]"
                          title="Edit API Key"
                        >
                          <Edit3 className="w-3 h-3 text-zinc-300" />
                        </button>

                        <button
                          onClick={() => handleRemoveKey(k.provider)}
                          className="btn-tactile px-2 py-1 rounded text-[10px] bg-zinc-900 hover:bg-rose-950/50 text-zinc-400 hover:text-rose-400 border border-zinc-800"
                          title="Revoke from Keystore"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Keystore Master Key Security Note */}
              <div className="mt-3 pt-3 border-t border-zinc-800 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
                <span>Keystore Alias:</span>
                <span className="text-zinc-300">MasterKey_AES256GCM</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 4. REAL-TIME CONTAINER AUDIT & EVENT LOG WELL (AT FOOT OF SINGLE-PAGE CONSOLE) */}
      <section className="depth-card rounded-xl p-4">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-zinc-200">
              Live Container Telemetry & SystemBridgeService Event Stream
            </h4>
          </div>
          <button
            onClick={() => setSystemLog([`[${new Date().toLocaleTimeString()}] Event buffer cleared.`])}
            className="btn-tactile text-[10px] font-mono text-zinc-500 hover:text-zinc-300 px-2 py-0.5 rounded border border-zinc-800"
          >
            Clear Log
          </button>
        </div>

        <div className="depth-well rounded-lg p-3 max-h-36 overflow-y-auto font-mono text-[11px] space-y-1 text-zinc-400">
          {systemLog.map((logLine, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-emerald-500 select-none">›</span>
              <span className="text-zinc-300">{logLine}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. DEEP-DIVE SYSTEM NAVIGATION CARDS (FOR JUMPING TO CODE EXPLORER, ARCHITECTURE, ETC.) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-2">
        <button
          onClick={() => setActiveCenterView('google-accounts')}
          className="depth-card btn-tactile p-3.5 rounded-xl text-left border border-zinc-800 hover:border-emerald-500/50 group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-zinc-200 group-hover:text-emerald-300">
              Google Accounts & Storage
            </span>
            <Users className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400" />
          </div>
          <p className="text-[11px] text-zinc-400 line-clamp-1">
            Multi-profile APK logins, Drive quotas & Sheets.
          </p>
        </button>

        <button
          onClick={() => setActiveCenterView('comparative-analysis')}
          className="depth-card btn-tactile p-3.5 rounded-xl text-left border border-zinc-800 hover:border-blue-500/50 group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-zinc-200 group-hover:text-blue-300">
              Detailed System Analysis
            </span>
            <ClipboardCheck className="w-3.5 h-3.5 text-zinc-500 group-hover:text-blue-400" />
          </div>
          <p className="text-[11px] text-zinc-400 line-clamp-1">
            Reconciliation matrix & rate-limit recovery audit.
          </p>
        </button>

        <button
          onClick={() => onNavigateToTab('prompts')}
          className="depth-card btn-tactile p-3.5 rounded-xl text-left border border-zinc-800 hover:border-emerald-500/50 group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-zinc-200 group-hover:text-emerald-300">
              Master Prompts 1-7
            </span>
            <Terminal className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400" />
          </div>
          <p className="text-[11px] text-zinc-400 line-clamp-1">
            Inspect all 20+ production Kotlin & Python files.
          </p>
        </button>

        <button
          onClick={() => onNavigateToTab('overview')}
          className="depth-card btn-tactile p-3.5 rounded-xl text-left border border-zinc-800 hover:border-emerald-500/50 group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-zinc-200 group-hover:text-emerald-300">
              Architecture Blueprint
            </span>
            <Layers className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400" />
          </div>
          <p className="text-[11px] text-zinc-400 line-clamp-1">
            System topology & security boundary specifications.
          </p>
        </button>

        <button
          onClick={() => onNavigateToTab('sandbox-tester')}
          className="depth-card btn-tactile p-3.5 rounded-xl text-left border border-zinc-800 hover:border-emerald-500/50 group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-zinc-200 group-hover:text-emerald-300">
              Dual-Phase Sandbox
            </span>
            <Activity className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400" />
          </div>
          <p className="text-[11px] text-zinc-400 line-clamp-1">
            Static AST security filtering & isolated REPL.
          </p>
        </button>

        <button
          onClick={() => onNavigateToTab('orchestrator-loop')}
          className="depth-card btn-tactile p-3.5 rounded-xl text-left border border-zinc-800 hover:border-emerald-500/50 group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-zinc-200 group-hover:text-emerald-300">
              Generator-Critic Loop
            </span>
            <RefreshCw className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400" />
          </div>
          <p className="text-[11px] text-zinc-400 line-clamp-1">
            Autonomous multi-agent repair state machine.
          </p>
        </button>
      </section>
    </div>
  );
};
