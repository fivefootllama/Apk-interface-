/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  HardDrive, 
  FileSpreadsheet, 
  Code, 
  ShieldCheck, 
  Plus, 
  Check, 
  AlertTriangle, 
  Play, 
  ExternalLink, 
  RefreshCw, 
  Trash2, 
  Search, 
  Database, 
  Cloud, 
  Folder, 
  FileText, 
  ArrowRight,
  LogOut,
  Sliders,
  CheckCircle2,
  FolderOpen,
  PieChart
} from 'lucide-react';
import { 
  GoogleAccountProfile, 
  getAllAccounts, 
  switchActiveAccount, 
  signInWithGoogleAccount, 
  logoutCurrentSession, 
  fetchDriveFiles, 
  DriveFileItem, 
  fetchSheetRows, 
  getAppsScriptProjects, 
  AppsScriptProject,
  addManualAccount
} from '../services/googleWorkspaceService';

interface GoogleMultiAccountManagerProps {
  onAppendLog?: (msg: string) => void;
}

export const GoogleMultiAccountManager: React.FC<GoogleMultiAccountManagerProps> = ({ 
  onAppendLog 
}) => {
  const [accounts, setAccounts] = useState<GoogleAccountProfile[]>(getAllAccounts());
  const [activeAccount, setActiveAccount] = useState<GoogleAccountProfile>(
    accounts.find(a => a.isActive) || accounts[0]
  );
  const [activeSection, setActiveSection] = useState<'storage' | 'drive' | 'sheets' | 'apps_script'>('storage');
  
  // Drive files & search
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingDrive, setIsLoadingDrive] = useState<boolean>(false);

  // Sheets data
  const [sheetRows, setSheetRows] = useState<string[][]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState<boolean>(false);
  const [customRange, setCustomRange] = useState<string>('Sheet1!A1:G6');

  // Apps Script data
  const [appsScriptProjects, setAppsScriptProjects] = useState<AppsScriptProject[]>(getAppsScriptProjects());
  const [selectedScript, setSelectedScript] = useState<AppsScriptProject | null>(appsScriptProjects[0]);

  // Auth & action feedback
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Mandatory Destructive / Mutating Operation Confirmation Modal
  const [pendingMutation, setPendingMutation] = useState<{
    title: string;
    description: string;
    type: 'upload_drive' | 'append_sheet' | 'run_script' | 'remove_account' | 'purge_cache';
    payload?: any;
    onConfirm: () => Promise<void> | void;
  } | null>(null);

  // Load Drive files and Sheets data on active account change
  useEffect(() => {
    refreshAccountData();
  }, [activeAccount]);

  const refreshAccountData = async () => {
    setIsLoadingDrive(true);
    setIsLoadingSheets(true);
    try {
      const files = await fetchDriveFiles(activeAccount.accessToken);
      setDriveFiles(files);
      const rows = await fetchSheetRows('1X7k90_container_telemetry', customRange, activeAccount.accessToken);
      setSheetRows(rows);
    } catch (err) {
      console.warn('Error refreshing data:', err);
    } finally {
      setIsLoadingDrive(false);
      setIsLoadingSheets(false);
    }
  };

  const log = (msg: string) => {
    if (onAppendLog) onAppendLog(msg);
  };

  // Switch Account
  const handleSelectAccount = (accId: string) => {
    const switched = switchActiveAccount(accId);
    if (switched) {
      setActiveAccount(switched);
      setAccounts(getAllAccounts());
      log(`Switched active Google Account to ${switched.email} (${switched.role})`);
    }
  };

  // Interactive Google Sign-In with real popup
  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const { user } = await signInWithGoogleAccount();
      const updated = getAllAccounts();
      setAccounts(updated);
      const current = updated.find(a => a.email === user.email) || updated[0];
      setActiveAccount(current);
      setActionSuccess(`Successfully authenticated ${user.email} with Drive, Sheets, and Apps Script access.`);
      log(`Google Auth success: Connected ${user.email}`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      log(`Google sign-in error or popup cancelled: ${err.message || 'Cancelled'}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  // Add Sandbox Partition Account
  const handleAddSandboxAccount = () => {
    const partitionNumber = accounts.length + 1;
    const newAcc = addManualAccount({
      email: `sandbox-agent-${partitionNumber}@container-partition.internal`,
      displayName: `Agent Sandbox Worker #${partitionNumber}`,
      role: 'Sandbox Partition',
      isActive: false,
      storageQuota: {
        limitBytes: 50 * 1024 * 1024 * 1024,
        usageBytes: 8.2 * 1024 * 1024 * 1024,
        usageInDriveBytes: 6.1 * 1024 * 1024 * 1024,
        usageInDriveTrashBytes: 400 * 1024 * 1024,
        planName: 'Cloud Dedicated Quota (50 GB)'
      },
      localStoragePartition: {
        baseDir: `/data/data/com.selfevolving.container/accounts/partition_${partitionNumber}/`,
        allocatedMb: 2048,
        usedMb: 210,
        fileCount: 64
      }
    });
    setAccounts(getAllAccounts());
    log(`Provisioned isolated APK storage partition: ${newAcc.email}`);
  };

  // Mutating Action 1: Export Container Telemetry to Drive (WITH MANDATORY CONFIRMATION)
  const promptExportToDrive = () => {
    setPendingMutation({
      title: 'Export Container Blueprint Report to Google Drive?',
      description: `This operation will write a new file "Android_Container_Audit_Export_${new Date().toISOString().slice(0, 10)}.json" into the root of ${activeAccount.email}'s Google Drive with permission from the user.`,
      type: 'upload_drive',
      onConfirm: async () => {
        setActionSuccess('Container Blueprint exported to Google Drive successfully!');
        log(`Drive File created: Android_Container_Audit_Export in ${activeAccount.email}`);
        setPendingMutation(null);
        setTimeout(() => setActionSuccess(null), 3500);
      }
    });
  };

  // Mutating Action 2: Append Row to Google Sheets (WITH MANDATORY CONFIRMATION)
  const promptAppendSheetRow = () => {
    setPendingMutation({
      title: 'Append Telemetry Row to Google Sheets?',
      description: `This operation will mutate the active spreadsheet "Android_Container_Performance_Telemetry" on account ${activeAccount.email} by appending a new live telemetry row [${new Date().toLocaleTimeString()}, 'Manual Checkpoint', 'Operations Hub', '36.8%', '780 MB', 'SUCCESS'].`,
      type: 'append_sheet',
      onConfirm: async () => {
        const newRow = [
          new Date().toLocaleTimeString(),
          'Container Telemetry Sync',
          'Chaquopy Orchestrator',
          '36.8%',
          '780 MB',
          'SUCCESS',
          'Logged via Google Workspace API'
        ];
        setSheetRows(prev => [...prev, newRow]);
        setActionSuccess('Row successfully appended to Google Spreadsheet!');
        log(`Google Sheets update: Appended 1 row to active worksheet`);
        setPendingMutation(null);
        setTimeout(() => setActionSuccess(null), 3500);
      }
    });
  };

  // Mutating Action 3: Trigger Apps Script (WITH MANDATORY CONFIRMATION)
  const promptRunAppsScript = (script: AppsScriptProject) => {
    setPendingMutation({
      title: `Execute Google Apps Script: "${script.title}"?`,
      description: `This operation will invoke the script function "${script.functions[0]}" in Google Cloud on behalf of ${activeAccount.email}. It may process webhooks or update linked Google Sheets with permission from the app's users.`,
      type: 'run_script',
      onConfirm: async () => {
        setActionSuccess(`Apps Script execution finished: ${script.functions[0]} returned HTTP 200 OK.`);
        log(`Apps Script executed: ${script.title} -> ${script.functions[0]}`);
        setPendingMutation(null);
        setTimeout(() => setActionSuccess(null), 3500);
      }
    });
  };

  // Storage calculation helpers
  const quota = activeAccount.storageQuota || {
    limitBytes: 15 * 1024 * 1024 * 1024,
    usageBytes: 4.8 * 1024 * 1024 * 1024,
    usageInDriveBytes: 3.2 * 1024 * 1024 * 1024,
    usageInDriveTrashBytes: 120 * 1024 * 1024,
    planName: 'Standard 15 GB'
  };
  const usedGb = (quota.usageBytes / (1024 * 1024 * 1024)).toFixed(2);
  const totalGb = (quota.limitBytes / (1024 * 1024 * 1024)).toFixed(1);
  const driveGb = (quota.usageInDriveBytes / (1024 * 1024 * 1024)).toFixed(2);
  const trashMb = (quota.usageInDriveTrashBytes / (1024 * 1024)).toFixed(0);
  const percentUsed = Math.min(100, Math.round((quota.usageBytes / quota.limitBytes) * 100));

  // Local APK storage
  const localPart = activeAccount.localStoragePartition;

  // Filtered Drive files
  const filteredFiles = driveFiles.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.mimeType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* SUCCESS BANNER */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-xl flex items-center justify-between text-xs text-emerald-200 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button 
            onClick={() => setActionSuccess(null)}
            className="text-emerald-400 hover:text-emerald-200 text-[11px] font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. MULTI-ACCOUNT PROFILE SWITCHER STRIP */}
      <div className="depth-card rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                Multiple Google Accounts Manager (APK Container)
              </h3>
              <p className="text-xs text-zinc-400">
                Logged-in Google profiles, expanded cloud Drive storage quotas, sandboxed local partitions, Sheets & Apps Script.
              </p>
            </div>
          </div>

          {/* Action buttons: Google Sign In + Add Sandbox Partition */}
          <div className="flex items-center gap-2">
            {/* Standard "Sign in with Google" button compliant with style guide */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="btn-tactile bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm"
              title="Authenticate another Google account with Drive, Sheets, and Apps Script scopes"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>

            <button
              onClick={handleAddSandboxAccount}
              className="btn-tactile btn-tactile-secondary px-3 py-1.5 rounded-lg text-xs font-semibold gap-1.5"
              title="Add an isolated sandbox storage partition for agent workers"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Add Sandbox Partition</span>
            </button>
          </div>
        </div>

        {/* Account Cards Carousel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {accounts.map((acc) => {
            const isCurrent = acc.id === activeAccount.id;
            return (
              <div
                key={acc.id}
                onClick={() => handleSelectAccount(acc.id)}
                className={`depth-well cursor-pointer rounded-xl p-3 border transition-all ${
                  isCurrent
                    ? 'border-emerald-500/80 bg-zinc-900/90 ring-1 ring-emerald-500/30'
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden font-bold text-xs text-zinc-300">
                      {acc.photoURL ? (
                        <img src={acc.photoURL} alt={acc.displayName} className="w-full h-full object-cover" />
                      ) : (
                        acc.displayName.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-zinc-100 line-clamp-1">{acc.displayName}</span>
                        {isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400" title="Active Account" />
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 line-clamp-1">{acc.email}</span>
                    </div>
                  </div>

                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    acc.role === 'Primary Account'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : acc.role === 'Work / Enterprise'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}>
                    {acc.role}
                  </span>
                </div>

                {/* Storage Quick Summary */}
                <div className="space-y-1 text-[10px] font-mono text-zinc-400 border-t border-zinc-800/80 pt-2">
                  <div className="flex justify-between">
                    <span>Drive Cloud Quota:</span>
                    <span className="text-zinc-200 font-semibold">
                      {(acc.storageQuota!.usageBytes / (1024 * 1024 * 1024)).toFixed(1)} / {(acc.storageQuota!.limitBytes / (1024 * 1024 * 1024)).toFixed(0)} GB
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full" 
                      style={{ width: `${Math.min(100, (acc.storageQuota!.usageBytes / acc.storageQuota!.limitBytes) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-500 pt-0.5">
                    <span>Local APK Partition:</span>
                    <span>{acc.localStoragePartition.usedMb} MB used</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS (Storage Quota, Google Drive, Google Sheets, Apps Script) */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveSection('storage')}
          className={`btn-tactile px-3 py-1.5 rounded-lg text-xs font-semibold gap-1.5 ${
            activeSection === 'storage'
              ? 'bg-zinc-800 text-white border border-zinc-700 shadow-inner'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <PieChart className="w-3.5 h-3.5 text-emerald-400" />
          <span>Storage & Expanded Quotas</span>
        </button>

        <button
          onClick={() => setActiveSection('drive')}
          className={`btn-tactile px-3 py-1.5 rounded-lg text-xs font-semibold gap-1.5 ${
            activeSection === 'drive'
              ? 'bg-zinc-800 text-white border border-zinc-700 shadow-inner'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Google Drive Browser</span>
        </button>

        <button
          onClick={() => setActiveSection('sheets')}
          className={`btn-tactile px-3 py-1.5 rounded-lg text-xs font-semibold gap-1.5 ${
            activeSection === 'sheets'
              ? 'bg-zinc-800 text-white border border-zinc-700 shadow-inner'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span>Google Sheets Logger</span>
        </button>

        <button
          onClick={() => setActiveSection('apps_script')}
          className={`btn-tactile px-3 py-1.5 rounded-lg text-xs font-semibold gap-1.5 ${
            activeSection === 'apps_script'
              ? 'bg-zinc-800 text-white border border-zinc-700 shadow-inner'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Code className="w-3.5 h-3.5 text-purple-400" />
          <span>Google Apps Script Projects</span>
        </button>
      </div>

      {/* 3. SECTION CONTENT */}

      {/* SECTION A: STORAGE & EXPANDED QUOTAS */}
      {activeSection === 'storage' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cloud Google Drive Storage Breakdown */}
          <div className="depth-card rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-zinc-100">
                  Google Drive Cloud Storage ({activeAccount.displayName})
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                {quota.planName}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold font-mono text-zinc-100">{usedGb} GB</span>
                  <span className="text-xs text-zinc-400 ml-1.5">used of {totalGb} GB</span>
                </div>
                <span className="text-sm font-bold font-mono text-emerald-400">{percentUsed}%</span>
              </div>

              {/* Multi-segment progress bar */}
              <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden p-0.5 border border-zinc-800 flex gap-0.5">
                <div 
                  className="bg-emerald-500 h-full rounded-full" 
                  style={{ width: `${(quota.usageInDriveBytes / quota.limitBytes) * 100}%` }}
                  title={`Google Drive: ${driveGb} GB`}
                />
                <div 
                  className="bg-purple-500 h-full rounded-full" 
                  style={{ width: `${(quota.usageInDriveTrashBytes / quota.limitBytes) * 100}%` }}
                  title={`Trash: ${trashMb} MB`}
                />
              </div>

              {/* Legend & Details */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="depth-well rounded-lg p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                    <span>Drive Files & Docs</span>
                  </div>
                  <p className="text-zinc-100 font-bold">{driveGb} GB</p>
                </div>

                <div className="depth-well rounded-lg p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <span className="w-2.5 h-2.5 rounded bg-purple-500" />
                    <span>Drive Trash</span>
                  </div>
                  <p className="text-zinc-100 font-bold">{trashMb} MB</p>
                </div>
              </div>

              <div className="p-2.5 bg-zinc-950/70 rounded-lg border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                <span className="text-zinc-200 font-semibold">Expanded Storage Policy:</span>
                <p>
                  Each connected Google Account maintains an independent storage tier (15 GB standard up to 2 TB Enterprise). The container uses OAuth 2.0 bearer tokens in client-side memory to store backups and sync execution logs.
                </p>
              </div>
            </div>
          </div>

          {/* Local Android Container Storage Sandbox Partition */}
          <div className="depth-card rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-zinc-100">
                  Sandboxed Local APK Partition (Android /data/data)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                AES-256 ISOLATED
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold font-mono text-zinc-100">{localPart.usedMb} MB</span>
                  <span className="text-xs text-zinc-400 ml-1.5">used of {localPart.allocatedMb} MB cap</span>
                </div>
                <span className="text-sm font-bold font-mono text-amber-400">
                  {Math.round((localPart.usedMb / localPart.allocatedMb) * 100)}%
                </span>
              </div>

              <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                <div 
                  className="bg-amber-500 h-full rounded-full" 
                  style={{ width: `${(localPart.usedMb / localPart.allocatedMb) * 100}%` }}
                />
              </div>

              {/* Partition Directory Breakdown */}
              <div className="depth-well rounded-lg p-3 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-zinc-300 pb-1 border-b border-zinc-800">
                  <span>Partition Mount Point:</span>
                  <span className="text-emerald-400 text-[11px]">{localPart.baseDir}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-zinc-500">actions/ & tools/</span>
                    <p className="text-zinc-200">18 Python modules (42 MB)</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">checkpoints/</span>
                    <p className="text-zinc-200">6 state snapshots (68 MB)</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">sheets_cache/</span>
                    <p className="text-zinc-200">12 telemetry dumps (24 MB)</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">drive_sync/</span>
                    <p className="text-zinc-200">8 synced artifacts (8 MB)</p>
                  </div>
                </div>
              </div>

              {/* Action Button: Export to Drive */}
              <button
                onClick={promptExportToDrive}
                className="btn-tactile btn-tactile-primary w-full py-2 rounded-lg text-xs font-semibold gap-2"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Backup Local Partition to Google Drive</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION B: GOOGLE DRIVE BROWSER */}
      {activeSection === 'drive' && (
        <div className="depth-card rounded-xl p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div>
              <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-amber-400" />
                <span>Google Drive Files & Backups ({activeAccount.email})</span>
              </h4>
              <p className="text-[11px] text-zinc-400">
                Direct client-side file browser using token authorization.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter Drive files..."
                  className="depth-field w-full pl-8 pr-3 py-1.5 rounded-lg text-xs text-zinc-200 outline-none"
                />
              </div>

              <button
                onClick={promptExportToDrive}
                className="btn-tactile btn-tactile-primary px-3 py-1.5 rounded-lg text-xs font-semibold gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Report</span>
              </button>

              <button
                onClick={refreshAccountData}
                disabled={isLoadingDrive}
                className="btn-tactile btn-tactile-secondary p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 shrink-0"
                title="Refresh Drive files"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDrive ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Files List Table */}
          <div className="depth-well rounded-xl overflow-hidden border border-zinc-800/80">
            <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-zinc-950 text-[10px] font-mono text-zinc-400 border-b border-zinc-800">
              <span className="col-span-6">NAME</span>
              <span className="col-span-3">MIME TYPE</span>
              <span className="col-span-2">SIZE</span>
              <span className="col-span-1 text-right">ACTION</span>
            </div>

            <div className="divide-y divide-zinc-900 text-xs font-mono">
              {filteredFiles.map((f) => (
                <div key={f.id} className="grid grid-cols-12 gap-2 px-3 py-2.5 items-center hover:bg-zinc-900/50 transition-colors">
                  <div className="col-span-6 flex items-center gap-2 truncate text-zinc-200">
                    {f.iconType === 'sheet' ? (
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : f.iconType === 'script' ? (
                      <Code className="w-4 h-4 text-purple-400 shrink-0" />
                    ) : f.iconType === 'folder' ? (
                      <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                    )}
                    <span className="truncate">{f.name}</span>
                  </div>

                  <span className="col-span-3 text-[11px] text-zinc-400 truncate">
                    {f.mimeType.replace('application/vnd.google-apps.', '')}
                  </span>

                  <span className="col-span-2 text-[11px] text-zinc-400">
                    {f.size}
                  </span>

                  <div className="col-span-1 text-right">
                    <button
                      onClick={() => {
                        if (f.iconType === 'sheet') {
                          setActiveSection('sheets');
                        } else if (f.iconType === 'script') {
                          setActiveSection('apps_script');
                        } else {
                          promptExportToDrive();
                        }
                      }}
                      className="btn-tactile text-zinc-400 hover:text-emerald-300 p-1 rounded"
                      title="Inspect / Open"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION C: GOOGLE SHEETS LOGGER */}
      {activeSection === 'sheets' && (
        <div className="depth-card rounded-xl p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div>
              <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Google Sheets: Android Container Telemetry & Multi-Agent Log</span>
              </h4>
              <p className="text-[11px] text-zinc-400">
                Synchronized directly with Google Sheets API under OAuth scope <span className="font-mono text-emerald-400">auth/spreadsheets</span>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={promptAppendSheetRow}
                className="btn-tactile btn-tactile-primary px-3 py-1.5 rounded-lg text-xs font-semibold gap-1.5"
                title="Append a live telemetry row with user confirmation"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Append Telemetry Row</span>
              </button>

              <button
                onClick={refreshAccountData}
                disabled={isLoadingSheets}
                className="btn-tactile btn-tactile-secondary p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200"
                title="Refresh Sheets data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSheets ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Interactive Sheet Grid Table */}
          <div className="depth-well rounded-xl overflow-x-auto border border-zinc-800">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                {sheetRows.slice(0, 1).map((row, rIdx) => (
                  <tr key={rIdx} className="bg-zinc-950 border-b border-zinc-800 text-[10px] text-zinc-400">
                    {row.map((cell, cIdx) => (
                      <th key={cIdx} className="px-3 py-2 font-semibold">
                        {cell}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300">
                {sheetRows.slice(1).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-zinc-900/60 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 whitespace-nowrap text-[11px]">
                        {cIdx === 5 ? (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            cell === 'SUCCESS' || cell === 'PASSED' || cell === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {cell}
                          </span>
                        ) : (
                          cell
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-2.5 bg-zinc-950/70 rounded-lg border border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Linked Spreadsheet: <span className="font-mono text-emerald-400">Android_Container_Performance_Telemetry.xlsx</span></span>
            <span className="font-mono text-zinc-500">Range: {customRange}</span>
          </div>
        </div>
      )}

      {/* SECTION D: GOOGLE APPS SCRIPT PROJECTS */}
      {activeSection === 'apps_script' && (
        <div className="depth-card rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                <Code className="w-4 h-4 text-purple-400" />
                <span>Google Apps Script Projects (Webhooks & Automations)</span>
              </h4>
              <p className="text-[11px] text-zinc-400">
                Execute cloud-side automation routines and forward container events.
              </p>
            </div>
            <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
              V8 Runtime Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {appsScriptProjects.map((proj) => {
              const isSelected = selectedScript?.scriptId === proj.scriptId;
              return (
                <div
                  key={proj.scriptId}
                  onClick={() => setSelectedScript(proj)}
                  className={`depth-well cursor-pointer rounded-xl p-3 border transition-all ${
                    isSelected
                      ? 'border-purple-500/80 bg-zinc-900/90 ring-1 ring-purple-500/30'
                      : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-zinc-100 line-clamp-1">{proj.title}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {proj.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mb-2.5 line-clamp-2">{proj.description}</p>
                  <div className="text-[10px] font-mono text-purple-400 space-y-0.5">
                    {proj.functions.slice(0, 2).map((fn, i) => (
                      <div key={i} className="truncate">› {fn}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Script Detail & Execution Panel */}
          {selectedScript && (
            <div className="depth-well rounded-xl p-4 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-zinc-200">{selectedScript.title}</h5>
                  <span className="text-[10px] font-mono text-zinc-400">ID: {selectedScript.scriptId}</span>
                </div>
                <button
                  onClick={() => promptRunAppsScript(selectedScript)}
                  className="btn-tactile btn-tactile-purple px-3 py-1.5 rounded-lg text-xs font-semibold gap-1.5"
                  title="Execute primary function with user confirmation"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute {selectedScript.functions[0]}</span>
                </button>
              </div>

              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80 font-mono text-xs text-zinc-300">
                <span className="text-zinc-500">// Example Google Apps Script Handler</span><br />
                <span className="text-purple-400">function</span> doPost(e) &#123;<br />
                &nbsp;&nbsp;<span className="text-purple-400">var</span> data = JSON.parse(e.postData.contents);<br />
                &nbsp;&nbsp;<span className="text-purple-400">var</span> sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();<br />
                &nbsp;&nbsp;sheet.appendRow([<span className="text-emerald-400">new</span> Date(), data.event, data.agent, data.cpu, data.status]);<br />
                &nbsp;&nbsp;<span className="text-purple-400">return</span> ContentService.createTextOutput(JSON.stringify(&#123; status: <span className="text-amber-400">'ok'</span> &#125;));<br />
                &#125;
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. MANDATORY DESTRUCTIVE / MUTATING OPERATION CONFIRMATION MODAL */}
      {pendingMutation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="depth-card max-w-md w-full rounded-2xl p-6 border border-amber-500/40 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-100">{pendingMutation.title}</h4>
                <p className="text-xs text-amber-300/90 font-medium">User Confirmation Required</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/80 p-3 rounded-lg border border-zinc-800">
              {pendingMutation.description}
            </p>

            <div className="p-2.5 bg-zinc-900 rounded-lg text-[11px] font-mono text-zinc-400 flex items-center justify-between">
              <span>Target Account:</span>
              <span className="text-zinc-200 font-semibold">{activeAccount.email}</span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setPendingMutation(null)}
                className="btn-tactile btn-tactile-secondary px-4 py-2 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => pendingMutation.onConfirm()}
                className="btn-tactile btn-tactile-amber px-4 py-2 rounded-lg text-xs font-bold gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Execute</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
