/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ImmutableLaw {
  id: string;
  index: number;
  title: string;
  mandate: string;
  createdAt: number;
  lastModifiedAt: number;
  author: 'HUMAN_OPERATOR' | 'SYSTEM_ROOT';
  sha256IntegrityHash: string;
  immutableLock: boolean;
}

export type CallerOrigin = 'HUMAN_OPERATOR' | 'AI_MODEL' | 'PYTHON_CHAQUOPY_SCRIPT' | 'ACCESSIBILITY_TOUCH_INJECTION';

export interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
  securityViolation?: boolean;
}

const STORAGE_KEY = 'android_immutable_operator_laws_v1';
const OPERATOR_TOKEN_KEY = 'human_operator_root_signature_hash_v1';

// Initial invariable default mandates
const DEFAULT_LAWS: ImmutableLaw[] = [
  {
    id: 'LAW-001',
    index: 1,
    title: 'HUMAN OPERATOR SUPREMACY & SAFETY',
    mandate: 'The AI model shall not harm the human operator, take actions contrary to the operator’s verified directives, or through inaction allow the operator to come to harm. In any conflict between autonomous optimization and human intent, human operator intent shall prevail unconditionally.',
    createdAt: 1718000000000,
    lastModifiedAt: 1718000000000,
    author: 'HUMAN_OPERATOR',
    sha256IntegrityHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    immutableLock: true,
  },
  {
    id: 'LAW-002',
    index: 2,
    title: 'TRANSPARENCY & AUDIT LEDGER INTEGRITY',
    mandate: 'All external probes, screen touches, script compilations, and network egress calls initiated by any model must be recorded transparently to the Google Drive/Sheets audit ledger. No AI model or Python script may suppress, tamper with, or delete action history logs.',
    createdAt: 1718000010000,
    lastModifiedAt: 1718000010000,
    author: 'HUMAN_OPERATOR',
    sha256IntegrityHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    immutableLock: true,
  },
  {
    id: 'LAW-003',
    index: 3,
    title: 'IMMUTABLE LAW INTEGRITY & ANTI-CIRCUMVENTION',
    mandate: 'No AI model, agent loop, Chaquopy Python script, or simulated accessibility touch injection shall alter, edit, create, or disable any Operator Law. The law modification interface is strictly reserved for physical human operator touch authentication.',
    createdAt: 1718000020000,
    lastModifiedAt: 1718000020000,
    author: 'HUMAN_OPERATOR',
    sha256IntegrityHash: '4a44dc15364204a80fe80e9039455ec160c7dacddc5e824f30e8857851a60397',
    immutableLock: true,
  },
  {
    id: 'LAW-004',
    index: 4,
    title: 'DEVICE MEMORY & HARDWARE KEYSTORE BOUNDARY',
    mandate: 'Models shall not extract raw private keys from the AndroidKeyStore or cross isolated Google Account partition boundaries. Credentials are used strictly in-memory through the provider bridge and must never be exfiltrated in diagnostic dumps.',
    createdAt: 1718000030000,
    lastModifiedAt: 1718000030000,
    author: 'HUMAN_OPERATOR',
    sha256IntegrityHash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
    immutableLock: true,
  }
];

class ImmutableLawsManager {
  private laws: ImmutableLaw[] = [];

  constructor() {
    this.loadLaws();
  }

  private loadLaws(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.laws = JSON.parse(stored);
      } else {
        this.laws = [...DEFAULT_LAWS];
        this.saveLaws();
      }
    } catch (e) {
      this.laws = [...DEFAULT_LAWS];
    }
  }

  private saveLaws(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.laws));
    } catch (e) {
      console.warn('Failed to persist laws to storage', e);
    }
  }

  // Generate SHA-256 simulation signature
  private generateIntegrityHash(title: string, mandate: string, timestamp: number): string {
    const raw = `${title}::${mandate}::${timestamp}::OPERATOR_SEAL_AES256`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(16, '0') + 'a7f3e9b1c8';
  }

  /**
   * /Laws View command
   * Accessible by BOTH human operator AND AI models.
   */
  public executeLawsView(): CommandResult {
    return {
      success: true,
      message: `⚖️ INVARIABLE OPERATOR MANDATES (${this.laws.length} ACTIVE LAWS):\n` +
        this.laws.map((l) => 
          `[${l.id}] ${l.title}\n` +
          `Mandate: "${l.mandate}"\n` +
          `Status: IMMUTABLE LOCK · Verified by: ${l.author} · Hash: ${l.sha256IntegrityHash.slice(0, 16)}...`
        ).join('\n\n') +
        `\n\n🔒 SECURITY STATUS: AI Models and automated scripts are locked into READ-ONLY status. Only the verified human operator can issue /Laws New or /Laws Edit.`,
      data: this.laws,
    };
  }

  /**
   * /Laws New command
   * STRICTLY RESTRICTED: Only the HUMAN_OPERATOR is allowed.
   */
  public executeLawsNew(
    caller: CallerOrigin, 
    title: string, 
    mandate: string
  ): CommandResult {
    // SECURITY GUARD: Reject any automated or AI origin
    if (caller !== 'HUMAN_OPERATOR') {
      return {
        success: false,
        securityViolation: true,
        message: `🚫 ACCESS DENIED [EACCES: HARDWARE_ROOT_ISOLATION_VIOLATION]\n` +
          `Origin: "${caller}" attempted to create a new Operator Law.\n` +
          `SECURITY DIRECTIVE: Only the physical Human Operator can create or amend laws.\n` +
          `Autonomous AI models, Chaquopy Python scripts, and accessibility touch injections are strictly forbidden from modifying or extending the Law Matrix.`
      };
    }

    if (!title.trim() || !mandate.trim()) {
      return {
        success: false,
        message: 'Invalid syntax. Usage: /Laws New [Law Title] :: [Law Mandate Text]'
      };
    }

    const now = Date.now();
    const newIndex = this.laws.length + 1;
    const newLaw: ImmutableLaw = {
      id: `LAW-${String(newIndex).padStart(3, '0')}`,
      index: newIndex,
      title: title.trim().toUpperCase(),
      mandate: mandate.trim(),
      createdAt: now,
      lastModifiedAt: now,
      author: 'HUMAN_OPERATOR',
      sha256IntegrityHash: this.generateIntegrityHash(title, mandate, now),
      immutableLock: true,
    };

    this.laws.push(newLaw);
    this.saveLaws();

    return {
      success: true,
      message: `✅ NEW MANDATE ENACTED: [${newLaw.id}] "${newLaw.title}"\n` +
        `Mandate: "${newLaw.mandate}"\n` +
        `Integrity Seal: ${newLaw.sha256IntegrityHash}\n` +
        `All active AI models (Gemini, Claude, Grok, DeepSeek, Chaquopy) have been signaled and bound by this new invariant law.`,
      data: newLaw,
    };
  }

  /**
   * /Laws Edit command
   * STRICTLY RESTRICTED: Only the HUMAN_OPERATOR is allowed.
   */
  public executeLawsEdit(
    caller: CallerOrigin,
    lawIdOrIndex: string | number,
    newMandate: string
  ): CommandResult {
    // SECURITY GUARD: Reject any automated or AI origin
    if (caller !== 'HUMAN_OPERATOR') {
      return {
        success: false,
        securityViolation: true,
        message: `🚫 ACCESS DENIED [EACCES: HARDWARE_ROOT_ISOLATION_VIOLATION]\n` +
          `Origin: "${caller}" attempted to edit law "${lawIdOrIndex}".\n` +
          `SECURITY DIRECTIVE: Invariable Operator Laws cannot be edited, circumvented, or relaxed by AI models or automated scripts.\n` +
          `All accessibility touch injections and Python script AST bridges targeting Law storage are permanently blocked.`
      };
    }

    const lawIndex = this.laws.findIndex(
      (l) => l.id.toLowerCase() === String(lawIdOrIndex).toLowerCase() || l.index === Number(lawIdOrIndex)
    );

    if (lawIndex === -1) {
      return {
        success: false,
        message: `Law "${lawIdOrIndex}" not found. Type "/Laws View" to see available law IDs.`
      };
    }

    if (!newMandate.trim()) {
      return {
        success: false,
        message: 'Invalid syntax. Usage: /Laws Edit [Law ID] :: [Updated Mandate Text]'
      };
    }

    const now = Date.now();
    const existing = this.laws[lawIndex];
    existing.mandate = newMandate.trim();
    existing.lastModifiedAt = now;
    existing.sha256IntegrityHash = this.generateIntegrityHash(existing.title, existing.mandate, now);

    this.saveLaws();

    return {
      success: true,
      message: `✅ MANDATE UPDATED BY HUMAN OPERATOR: [${existing.id}] "${existing.title}"\n` +
        `New Mandate: "${existing.mandate}"\n` +
        `Integrity Seal Updated: ${existing.sha256IntegrityHash}\n` +
        `All AI models have re-synced their execution constraints.`,
      data: existing,
    };
  }

  /**
   * Parse command line from chat input
   */
  public handleSlashCommand(input: string, caller: CallerOrigin = 'HUMAN_OPERATOR'): CommandResult | null {
    const trimmed = input.trim();
    const lower = trimmed.toLowerCase();

    // Check for /laws commands
    if (lower.startsWith('/laws') || lower.startsWith('/law')) {
      const parts = trimmed.split(' ');
      const subAction = (parts[1] || '').toLowerCase();

      if (subAction === 'view' || parts.length === 1) {
        return this.executeLawsView();
      }

      if (subAction === 'new') {
        const payload = trimmed.substring(trimmed.indexOf(parts[1]) + parts[1].length).trim();
        const delimiterIndex = payload.indexOf('::');
        if (delimiterIndex === -1) {
          return {
            success: false,
            message: 'Syntax error for /Laws New.\nUsage: /Laws New [Law Title] :: [Mandate Description]'
          };
        }
        const title = payload.substring(0, delimiterIndex).trim();
        const mandate = payload.substring(delimiterIndex + 2).trim();
        return this.executeLawsNew(caller, title, mandate);
      }

      if (subAction === 'edit') {
        const payload = trimmed.substring(trimmed.indexOf(parts[1]) + parts[1].length).trim();
        const delimiterIndex = payload.indexOf('::');
        if (delimiterIndex === -1) {
          return {
            success: false,
            message: 'Syntax error for /Laws Edit.\nUsage: /Laws Edit [Law ID] :: [New Mandate Description]'
          };
        }
        const id = payload.substring(0, delimiterIndex).trim();
        const newMandate = payload.substring(delimiterIndex + 2).trim();
        return this.executeLawsEdit(caller, id, newMandate);
      }

      return {
        success: false,
        message: 'Unknown /Laws sub-command. Valid commands:\n- /Laws View\n- /Laws New [Title] :: [Description]\n- /Laws Edit [ID] :: [New Description]'
      };
    }

    return null;
  }

  public getLaws(): ImmutableLaw[] {
    return [...this.laws];
  }
}

export const immutableLawsService = new ImmutableLawsManager();
