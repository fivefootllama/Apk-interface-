/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AccessibilityNode, ProviderType } from './blueprint';

export type ModelRoleType = 
  | 'EYES_PERCEPTION' 
  | 'BRAIN_PLANNER' 
  | 'CRITIC_SUPERVISOR' 
  | 'HANDS_EXECUTOR';

export interface CollaborativeModelConfig {
  role: ModelRoleType;
  roleTitle: string;
  modelName: string;
  modelId: string;
  provider: ProviderType | 'LOCAL_CHAQUOPY';
  status: 'active' | 'busy' | 'standby';
  description: string;
  capabilities: string[];
}

export interface ApkEyesObservation {
  timestamp: number;
  foregroundPackage: string;
  activityName: string;
  screenResolution: { width: number; height: number; densityDpi: number };
  accessibilityHierarchy: AccessibilityNode;
  detectedElements: Array<{
    id: string;
    label: string;
    type: 'BUTTON' | 'INPUT' | 'TEXT' | 'IMAGE' | 'CONTAINER';
    bounds: { left: number; top: number; right: number; bottom: number; centerX: number; centerY: number };
    clickable: boolean;
    confidence: number;
  }>;
  notifications: Array<{
    id: string;
    packageName: string;
    title: string;
    text: string;
    subText?: string;
    postTime: number;
  }>;
  ocrDetectedTexts: string[];
  batteryLevel: number;
  isScreenOn: boolean;
}

export interface ApkHandsAction {
  id: string;
  actionType: 
    | 'TAP' 
    | 'SWIPE' 
    | 'INPUT_TEXT' 
    | 'KEY_EVENT' 
    | 'LAUNCH_APP' 
    | 'RUN_PYTHON' 
    | 'CLICK_NODE';
  targetCoordinates?: { x: number; y: number };
  swipePath?: { startX: number; startY: number; endX: number; endY: number; durationMs: number };
  inputPayload?: string;
  keyName?: 'BACK' | 'HOME' | 'RECENTS' | 'ENTER' | 'VOLUME_UP' | 'VOLUME_DOWN';
  targetPackage?: string;
  pythonCode?: string;
  status: 'PLANNED' | 'SUPERVISOR_VERIFYING' | 'EXECUTING' | 'SUCCESS' | 'FAILED';
  executionLatencyMs?: number;
  resultMessage?: string;
  rawJavaDispatchTrace?: string;
}

export interface ModelInterchangeMessage {
  id: string;
  timestamp: number;
  fromRole: ModelRoleType | 'USER' | 'SYSTEM';
  fromModelName: string;
  toRole: ModelRoleType | 'ALL';
  content: string;
  structuredPayload?: {
    eyesData?: ApkEyesObservation;
    plannedAction?: ApkHandsAction;
    reviewVerdict?: {
      approved: boolean;
      confidence: number;
      policyCheck: string;
      wcagPassed: boolean;
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    };
    executionResult?: {
      success: boolean;
      latencyMs: number;
      screenUpdated: boolean;
    };
  };
}

export interface DriveAuditLogEntry {
  sessionId: string;
  turnNumber: number;
  timestamp: string;
  isoTimestamp: string;
  userGoal: string;
  modelsInvolved: {
    eyes: string;
    brain: string;
    supervisor: string;
    hands: string;
  };
  eyesObservation: {
    foregroundApp: string;
    keyElementsCount: number;
    detectedTarget?: string;
  };
  brainPlan: {
    reasoning: string;
    intendedAction: string;
    targetCoords?: { x: number; y: number };
  };
  supervisorAudit: {
    approved: boolean;
    wcagCompliant: boolean;
    policyScore: number;
  };
  handsExecution: {
    actionDispatched: string;
    executionLatencyMs: number;
    nativeBridgeSuccess: boolean;
  };
  driveSync: {
    accountEmail: string;
    folderPath: string;
    driveFileId?: string;
    sheetsRowAppended: boolean;
    syncTimestamp: string;
    status: 'SYNCED_DRIVE' | 'CACHED_LOCAL' | 'FAILED';
  };
}

export type ApkAccessPointCategory = 
  | 'EYES_VISION' 
  | 'HANDS_ACTUATION' 
  | 'PYTHON_IN_APK' 
  | 'PYTHON_THROUGH_APK' 
  | 'SYSTEM_OS_TUNNEL' 
  | 'WORKSPACE_DRIVE_STORAGE';

export interface ApkAccessPoint {
  id: string;
  name: string;
  category: ApkAccessPointCategory;
  description: string;
  endpoint: string;
  permissionsRequired: string[];
  parametersSchema: Record<string, string>;
  returnType: string;
  exampleCall: string;
  status: 'ONLINE' | 'ACTIVE';
}

export type NavigationExecutionMethod = 'APK_ACCESSIBILITY_GESTURE' | 'PYTHON_CHAQUOPY_SCRIPT' | 'INTENT_LAUNCH';

export interface DeviceNavigationStep {
  stepIndex: number;
  title: string;
  explanation: string;
  chosenMethod: NavigationExecutionMethod;
  targetPackage: string;
  targetActivity?: string;
  coords?: { x: number; y: number };
  gesture?: 'TAP' | 'SWIPE' | 'INPUT_TEXT' | 'KEY_EVENT' | 'INTENT';
  textInput?: string;
  keyAction?: 'BACK' | 'HOME' | 'RECENTS' | 'NOTIFICATIONS';
  pythonCode?: string;
  latencyMs: number;
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  verificationOcr?: string;
}

export interface DeviceNavigationMission {
  id: string;
  name: string;
  description: string;
  iconName: string;
  difficulty: 'EASY' | 'MEDIUM' | 'ADVANCED';
  targetApps: string[];
  steps: DeviceNavigationStep[];
}
