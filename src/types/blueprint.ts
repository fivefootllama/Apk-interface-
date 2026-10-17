export type TabType = 
  | 'simple-assistant'
  | 'advanced-console'
  | 'operations'
  | 'google-accounts'
  | 'comparative-analysis'
  | 'overview'
  | 'prompts'
  | 'solutions'
  | 'key-vault'
  | 'ai-chat'
  | 'android-device'
  | 'sandbox-tester'
  | 'router-failover'
  | 'orchestrator-loop';

export type ProviderType = 'ANTHROPIC' | 'GEMINI' | 'GROK' | 'HUGGINGFACE' | 'OPENAI' | 'OLLAMA' | 'DEEPSEEK' | 'CUSTOM';

export interface DynamicModelProfile {
  id: string;
  name: string;
  modelId: string;
  providerType: ProviderType;
  apiKey: string;
  locationEndpoint: string;
  description: string;
  accountOwner: string;
  status: 'DEPLOYED' | 'DISCONNECTED';
  deployedAt?: number;
  lastPingMs?: number;
  tags: string[];
  contextWindow?: string;
  encryptionAlgorithm: 'Android Keystore MasterKey' | 'AES-256-GCM';
}

export interface EncryptedKeyEntry {
  id: string;
  provider: ProviderType;
  providerLabel: string;
  keyPreview: string; // e.g. "sk-ant-...b49x"
  rawKey?: string;
  defaultModel: string;
  supportedModels: string[];
  isConfigured: boolean;
  lastUpdated: number;
  encryptionAlgorithm: 'AES-256-GCM' | 'Android Keystore MasterKey';
  endpoint: string;
}

export interface TaggedMessage {
  id: string;
  timestamp: number;
  sender: 'user' | 'assistant' | 'critic' | 'system';
  provider: ProviderType | 'SYSTEM';
  model: string;
  content: string;
  tags: string[];
  latencyMs?: number;
  tokensUsed?: number;
  status: 'sent' | 'processing' | 'success' | 'error';
  structuredData?: any;
}

export interface AccessibilityNode {
  id: string;
  className: string;
  text: string;
  contentDescription: string;
  viewIdResourceName: string;
  clickable: boolean;
  scrollable: boolean;
  focusable: boolean;
  enabled: boolean;
  visibleToUser: boolean;
  bounds: {
    left: number;
    top: number;
    right: number;
    bottom: number;
    centerX: number;
    centerY: number;
    width: number;
    height: number;
  };
  children: AccessibilityNode[];
}

export interface ProviderItem {
  id: string;
  name: string;
  providerType: ProviderType;
  baseUrl: string;
  apiKey: string;
  modelName: string;
  status: 'active' | 'rate_limited' | 'error' | 'standby';
  cooldownUntil?: number;
  failureCount: number;
  tagsSupported: string[];
}

export interface VirtualFile {
  name: string;
  folder: 'actions' | 'tools' | 'sandbox' | 'modules' | 'logs' | 'checkpoints';
  content: string;
  lastModified: number;
  size: number;
}

export interface OrchestratorTurn {
  turnNumber: number;
  tags: string[];
  modelAGenerator: {
    prompt: string;
    code: string;
    status: 'pending' | 'success' | 'failed';
    timestamp: number;
  };
  modelBCritic: {
    verdict: 'APPROVED' | 'REJECTED';
    critique: string;
    timestamp: number;
  };
  sandboxPhase: {
    staticAstPassed: boolean;
    dynamicExecuted: boolean;
    promoted: boolean;
    error?: string;
    traceback?: string;
    executionTimeMs: number;
  };
}
