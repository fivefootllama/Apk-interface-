import React, { useState, useMemo } from 'react';
import { 
  History, 
  Filter, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Bot, 
  ShieldCheck, 
  Layers, 
  Terminal, 
  Clock, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Sparkles, 
  Share2,
  Code2,
  RefreshCw,
  SlidersHorizontal,
  Download
} from 'lucide-react';

export interface AgentActionItem {
  id: string;
  timestamp: number;
  agent: 'Model A (Generator)' | 'Model B (Critic)' | 'AST Sandbox Evaluator' | 'Watchdog Dynamic Runner' | 'Orchestrator Core' | 'Android Bridge';
  provider: 'Claude 3.7 Sonnet' | 'Gemini 2.5 Flash' | 'Grok 2' | 'DeepSeek R1' | 'Chaquopy VM' | 'SystemBridge';
  actionType: 'PROPOSE_CODE' | 'PEER_CRITIQUE' | 'AST_VALIDATION' | 'SANDBOX_EXECUTION' | 'DECISION_REJECT' | 'DECISION_APPROVE' | 'MODULE_PROMOTION' | 'STATE_HANDOFF';
  outcome: 'APPROVED' | 'REJECTED' | 'SUCCESS' | 'WARNING' | 'CORRECTED';
  title: string;
  summary: string;
  payloadCode?: string;
  critiqueText?: string;
  metrics?: {
    latencyMs?: number;
    tokensUsed?: number;
    memoryMb?: number;
    targetCoords?: { x: number; y: number };
  };
  tags: string[];
}

interface AgentActionHistoryVisualizerProps {
  additionalActions?: AgentActionItem[];
}

export const AgentActionHistoryVisualizer: React.FC<AgentActionHistoryVisualizerProps> = ({ 
  additionalActions = [] 
}) => {
  // Initial historical log representing authentic multi-agent interactions
  const initialHistory: AgentActionItem[] = [
    {
      id: 'act-001',
      timestamp: Date.now() - 1000 * 60 * 18,
      agent: 'Model A (Generator)',
      provider: 'Claude 3.7 Sonnet',
      actionType: 'PROPOSE_CODE',
      outcome: 'SUCCESS',
      title: 'Synthesized Initial action_skip_ad.py Draft',
      summary: 'Generated atomic Python module using AccessibilityNode hierarchy. Dispatched immediate click gesture to hardcoded coordinate (287, 205).',
      payloadCode: `# Turn 1: Model A Draft
from com.selfevolving.container import SystemBridgeService

def run_action():
    # Attempt click without checking node visibility
    SystemBridgeService.dispatchClick(287, 205)
    return {"status": "clicked"}`,
      metrics: { latencyMs: 420, tokensUsed: 310 },
      tags: ['#UI_AUTOMATION', '#DRAFT', '#GENERATOR']
    },
    {
      id: 'act-002',
      timestamp: Date.now() - 1000 * 60 * 17,
      agent: 'Model B (Critic)',
      provider: 'Gemini 2.5 Flash',
      actionType: 'PEER_CRITIQUE',
      outcome: 'REJECTED',
      title: 'Peer Review Audit: Rejected (Blind Coordinate Dispatch)',
      summary: 'Critic audited Turn 1 draft. Flagged missing active window verification and lack of visibleToUser checks.',
      critiqueText: 'CRITIQUE: Script dispatches blind click coordinates without parsing the accessibility hierarchy JSON to verify that the Skip Ad button is currently visibleToUser=true and clickable=true. Must compute dynamic center bounds.',
      metrics: { latencyMs: 280, tokensUsed: 195 },
      tags: ['#PEER_REVIEW', '#CRITIC', '#REJECTED', '#SAFETY_CHECK']
    },
    {
      id: 'act-003',
      timestamp: Date.now() - 1000 * 60 * 16,
      agent: 'AST Sandbox Evaluator',
      provider: 'Chaquopy VM',
      actionType: 'AST_VALIDATION',
      outcome: 'WARNING',
      title: 'Static AST Security Scan: Passed With Caveats',
      summary: 'ast.parse() confirmed zero unsafe system imports (os.system, subprocess blocked). Flagged unhandled NoneType return if node disappears.',
      payloadCode: `AST Scan Summary:
- Allowed Imports: json, com.selfevolving.container.SystemBridgeService
- Blocked Imports: None
- Function Complexity: O(1)
- Static AST Check: PASSED`,
      metrics: { latencyMs: 38 },
      tags: ['#AST_PARSE', '#SECURITY', '#SANDBOX']
    },
    {
      id: 'act-004',
      timestamp: Date.now() - 1000 * 60 * 15,
      agent: 'Orchestrator Core',
      provider: 'SystemBridge',
      actionType: 'DECISION_REJECT',
      outcome: 'CORRECTED',
      title: 'Automated Traceback Feedback Routing -> Turn 2 Triggered',
      summary: 'Injected Critic rejection traceback directly into Model A context window for autonomous self-correction loop.',
      metrics: { latencyMs: 12 },
      tags: ['#TRACEBACK_FEEDBACK', '#SELF_CORRECTION', '#ORCHESTRATOR']
    },
    {
      id: 'act-005',
      timestamp: Date.now() - 1000 * 60 * 14,
      agent: 'Model A (Generator)',
      provider: 'Claude 3.7 Sonnet',
      actionType: 'PROPOSE_CODE',
      outcome: 'SUCCESS',
      title: 'Turn 2 Self-Corrected Code: Dynamic Bounds & Node Check',
      summary: 'Integrated accessibility tree hierarchy parsing, viewIdResourceName lookup, and bounds.centerX/centerY resolution.',
      payloadCode: `# Turn 2: Corrected Code
import json
from com.selfevolving.container import SystemBridgeService

def main():
    hierarchy = SystemBridgeService.getScreenHierarchyJson()
    tree = json.loads(hierarchy)
    target = None
    def find_node(n):
        nonlocal target
        if "skip_ad" in n.get("viewIdResourceName", ""):
            target = n
            return
        for c in n.get("children", []):
            find_node(c)
    find_node(tree.get("tree", {}))
    if target and target.get("visibleToUser"):
        bounds = target.get("bounds", {})
        cx, cy = bounds.get("centerX", 287.5), bounds.get("centerY", 205.0)
        return SystemBridgeService.dispatchClick(float(cx), float(cy))`,
      metrics: { latencyMs: 512, tokensUsed: 520, targetCoords: { x: 287.5, y: 205.0 } },
      tags: ['#UI_AUTOMATION', '#SELF_CORRECTION', '#CORRECTED']
    },
    {
      id: 'act-006',
      timestamp: Date.now() - 1000 * 60 * 13,
      agent: 'Model B (Critic)',
      provider: 'Gemini 2.5 Flash',
      actionType: 'DECISION_APPROVE',
      outcome: 'APPROVED',
      title: 'Peer Review Audit: 100% Approved',
      summary: 'Critic approved revised implementation. Dynamic bounds calculation verified safe and non-intrusive.',
      critiqueText: 'APPROVED: Script adheres to safe accessibility parsing, validates visibleToUser property, and computes dynamic center bounds without hardcoding.',
      metrics: { latencyMs: 240, tokensUsed: 140 },
      tags: ['#PEER_REVIEW', '#CRITIC', '#APPROVED']
    },
    {
      id: 'act-007',
      timestamp: Date.now() - 1000 * 60 * 12,
      agent: 'Watchdog Dynamic Runner',
      provider: 'Chaquopy VM',
      actionType: 'SANDBOX_EXECUTION',
      outcome: 'SUCCESS',
      title: '5.0-Second Sandbox Dynamic Trial Run',
      summary: 'Executed in isolated CPython sub-interpreter with mock SystemBridgeService. Completed in 112ms without memory leakage.',
      metrics: { latencyMs: 112, memoryMb: 14.8 },
      tags: ['#SANDBOX', '#DYNAMIC_RUNNER', '#WATCHDOG']
    },
    {
      id: 'act-008',
      timestamp: Date.now() - 1000 * 60 * 11,
      agent: 'Orchestrator Core',
      provider: 'SystemBridge',
      actionType: 'MODULE_PROMOTION',
      outcome: 'APPROVED',
      title: 'Promoted action_skip_ad.py to context.filesDir/actions/',
      summary: 'Atomic action module packaged and dynamically loaded via DexClassLoader into live Android application container.',
      metrics: { latencyMs: 45 },
      tags: ['#MODULE_PROMOTION', '#PRODUCTION_READY', '#APK_CONTAINER']
    },
    {
      id: 'act-009',
      timestamp: Date.now() - 1000 * 60 * 5,
      agent: 'Orchestrator Core',
      provider: 'Grok 2',
      actionType: 'STATE_HANDOFF',
      outcome: 'SUCCESS',
      title: 'Serialized Checkpoint Handoff (Token Rate Limit Preemption)',
      summary: 'Approached provider request budget. Serialized active goal, screen hierarchy JSON, and variable map into ckpt_1728929000 for seamless handover.',
      payloadCode: `{
  "checkpoint_id": "ckpt_handoff_preempt_09",
  "current_goal": "Detect YouTube ad and dispatch skip",
  "screen_state": { "windowId": 1042, "target": "skip_ad_button" },
  "handoff_target": "grok-2-latest",
  "status": "HANDOFF_SUCCESS"
}`,
      metrics: { latencyMs: 25 },
      tags: ['#STATE_HANDOFF', '#ROUTER_FAILOVER', '#RESILIENCE']
    }
  ];

  // Combined list with any live dynamic additions
  const allActions = useMemo(() => {
    return [...additionalActions, ...initialHistory].sort((a, b) => b.timestamp - a.timestamp);
  }, [additionalActions, initialHistory]);

  // Filter and Search states
  const [selectedAgent, setSelectedAgent] = useState<string>('ALL');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('ALL');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [expandedId, setExpandedId] = useState<string | null>('act-005');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract all unique tags
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    allActions.forEach(a => a.tags.forEach(t => set.add(t)));
    return Array.from(set);
  }, [allActions]);

  // Filtered list
  const filteredActions = useMemo(() => {
    return allActions.filter(item => {
      // Agent filter
      if (selectedAgent !== 'ALL' && !item.agent.includes(selectedAgent)) {
        return false;
      }
      // Outcome filter
      if (selectedOutcome !== 'ALL' && item.outcome !== selectedOutcome) {
        return false;
      }
      // Tag filter
      if (selectedTag !== 'ALL' && !item.tags.includes(selectedTag)) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inSummary = item.summary.toLowerCase().includes(q);
        const inAgent = item.agent.toLowerCase().includes(q);
        const inProvider = item.provider.toLowerCase().includes(q);
        const inCode = item.payloadCode?.toLowerCase().includes(q) || false;
        const inCritique = item.critiqueText?.toLowerCase().includes(q) || false;
        if (!inTitle && !inSummary && !inAgent && !inProvider && !inCode && !inCritique) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      return sortOrder === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
    });
  }, [allActions, selectedAgent, selectedOutcome, selectedTag, searchQuery, sortOrder]);

  const handleCopyPayload = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportTimeline = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredActions, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `agent_action_history_${Date.now()}.json`);
    dlAnchor.click();
  };

  const getOutcomeBadge = (outcome: AgentActionItem['outcome']) => {
    switch (outcome) {
      case 'APPROVED':
      case 'SUCCESS':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>{outcome}</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/30">
            <XCircle className="w-3 h-3 text-red-400" />
            <span>{outcome}</span>
          </span>
        );
      case 'CORRECTED':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <RefreshCw className="w-3 h-3 text-amber-400" />
            <span>{outcome}</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
            <AlertTriangle className="w-3 h-3 text-orange-400" />
            <span>{outcome}</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getAgentIcon = (agent: AgentActionItem['agent']) => {
    if (agent.includes('Generator')) return <Bot className="w-4 h-4 text-violet-400" />;
    if (agent.includes('Critic')) return <ShieldCheck className="w-4 h-4 text-amber-400" />;
    if (agent.includes('AST') || agent.includes('Sandbox')) return <Terminal className="w-4 h-4 text-cyan-400" />;
    return <Sparkles className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Visualizer Top Header */}
      <div className="depth-card rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <History className="w-4 h-4" />
            <span>MULTI-AGENT TELEMETRY & DECISION LOG</span>
            <span>·</span>
            <span>PROMPT 6 COGNITIVE TRACE</span>
          </div>
          <h2 className="text-base font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Agent Action History Visualizer</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
              {filteredActions.length} recorded events
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Chronological, multi-parameter filterable timeline capturing every autonomous generation, 
            adversarial critic peer review, dynamic sandbox check, and model handoff decision.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
            className="btn-tactile btn-tactile-secondary px-3 py-1.5 rounded-lg text-xs font-semibold gap-1.5"
            title="Toggle chronological sort order"
          >
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
          </button>

          <button
            onClick={handleExportTimeline}
            className="btn-tactile btn-tactile-secondary px-3 py-1.5 rounded-lg text-xs font-semibold gap-1.5"
            title="Export filtered history as JSON"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Export Log</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="depth-card rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search actions by goal, code, critic reason, viewId, or coordinates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full depth-field pl-9 pr-3 py-2 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Clear All Filters */}
          {(selectedAgent !== 'ALL' || selectedOutcome !== 'ALL' || selectedTag !== 'ALL' || searchQuery !== '') && (
            <button
              onClick={() => {
                setSelectedAgent('ALL');
                setSelectedOutcome('ALL');
                setSelectedTag('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-amber-400 hover:text-amber-300 font-mono underline shrink-0 px-2"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Multi-Select Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-800/80">
          {/* Filter by Agent Role */}
          <div>
            <label className="text-[11px] font-mono text-zinc-400 mb-1 block">Agent Role:</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full depth-field px-2.5 py-1.5 rounded-lg text-xs text-zinc-200 focus:outline-none"
            >
              <option value="ALL">All Agents & Evaluators</option>
              <option value="Generator">Model A (Generator)</option>
              <option value="Critic">Model B (Critic)</option>
              <option value="AST">AST Sandbox Evaluator</option>
              <option value="Watchdog">Watchdog Dynamic Runner</option>
              <option value="Orchestrator">Orchestrator Core</option>
            </select>
          </div>

          {/* Filter by Outcome */}
          <div>
            <label className="text-[11px] font-mono text-zinc-400 mb-1 block">Decision Outcome:</label>
            <select
              value={selectedOutcome}
              onChange={(e) => setSelectedOutcome(e.target.value)}
              className="w-full depth-field px-2.5 py-1.5 rounded-lg text-xs text-zinc-200 focus:outline-none"
            >
              <option value="ALL">All Decision Types</option>
              <option value="APPROVED">APPROVED (Peer Approved)</option>
              <option value="REJECTED">REJECTED (Critic Audit Failed)</option>
              <option value="CORRECTED">CORRECTED (Traceback Loop)</option>
              <option value="SUCCESS">SUCCESS (Execution Nominal)</option>
              <option value="WARNING">WARNING (Heuristic Flag)</option>
            </select>
          </div>

          {/* Filter by Tag */}
          <div>
            <label className="text-[11px] font-mono text-zinc-400 mb-1 block">Tag Category:</label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full depth-field px-2.5 py-1.5 rounded-lg text-xs text-zinc-200 focus:outline-none"
            >
              <option value="ALL">All Tags</option>
              {availableTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Clickable Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 scrollbar-none text-[11px] font-mono">
          <span className="text-zinc-500 shrink-0">Popular:</span>
          {['#UI_AUTOMATION', '#PEER_REVIEW', '#REJECTED', '#APPROVED', '#AST_PARSE', '#STATE_HANDOFF'].map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? 'ALL' : tag)}
              className={`px-2 py-0.5 rounded border transition-colors shrink-0 ${
                selectedTag === tag 
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-700' 
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Chronological Timeline Container */}
      <div className="depth-well rounded-xl p-4 sm:p-6 space-y-4">
        {filteredActions.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <History className="w-8 h-8 text-zinc-600 mx-auto" />
            <h4 className="text-sm font-semibold text-zinc-300">No matching multi-agent actions found</h4>
            <p className="text-xs text-zinc-500">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="relative border-l border-zinc-800 ml-3 sm:ml-4 pl-4 sm:pl-6 space-y-6">
            {filteredActions.map((item, idx) => {
              const isExpanded = expandedId === item.id;
              return (
                <div key={item.id} className="relative group">
                  {/* Timeline Node Dot */}
                  <div className={`absolute -left-[25px] sm:-left-[33px] top-1.5 w-6 h-6 rounded-full border flex items-center justify-center text-xs shadow-md ${
                    item.outcome === 'APPROVED' ? 'bg-emerald-950 border-emerald-500 text-emerald-400' :
                    item.outcome === 'REJECTED' ? 'bg-red-950 border-red-500 text-red-400' :
                    item.outcome === 'CORRECTED' ? 'bg-amber-950 border-amber-500 text-amber-400' :
                    'bg-zinc-900 border-zinc-700 text-cyan-400'
                  }`}>
                    {getAgentIcon(item.agent)}
                  </div>

                  {/* Event Card */}
                  <div className={`depth-card rounded-xl p-4 border transition-all ${
                    isExpanded ? 'border-zinc-700 shadow-lg' : 'border-zinc-800/90 hover:border-zinc-700'
                  }`}>
                    {/* Top line: Agent + Provider + Timestamp + Outcome badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-zinc-800/80">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-zinc-200">
                          {item.agent}
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                          {item.provider}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {getOutcomeBadge(item.outcome)}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="btn-tactile btn-tactile-secondary p-1 rounded text-zinc-400 hover:text-zinc-200"
                          title={isExpanded ? 'Collapse event' : 'Expand full details'}
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Title and Summary */}
                    <div className="mt-2.5">
                      <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                        <span>{item.title}</span>
                      </h4>
                      <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                        {item.summary}
                      </p>
                    </div>

                    {/* Metrics Bar */}
                    {item.metrics && (
                      <div className="mt-3 flex items-center gap-3 text-[11px] font-mono text-zinc-400 flex-wrap">
                        {item.metrics.latencyMs !== undefined && (
                          <div className="flex items-center gap-1 bg-zinc-900/60 px-2 py-0.5 rounded border border-zinc-800">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            <span>{item.metrics.latencyMs}ms latency</span>
                          </div>
                        )}
                        {item.metrics.tokensUsed !== undefined && (
                          <div className="flex items-center gap-1 bg-zinc-900/60 px-2 py-0.5 rounded border border-zinc-800">
                            <Sparkles className="w-3 h-3 text-violet-400" />
                            <span>{item.metrics.tokensUsed} tokens</span>
                          </div>
                        )}
                        {item.metrics.targetCoords && (
                          <div className="flex items-center gap-1 bg-zinc-900/60 px-2 py-0.5 rounded border border-zinc-800 text-emerald-400">
                            <span>Coords: ({item.metrics.targetCoords.x}, {item.metrics.targetCoords.y})</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tag Pills */}
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                      {item.tags.map(tag => (
                        <span 
                          key={tag}
                          onClick={() => setSelectedTag(tag)}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900/90 text-zinc-400 border border-zinc-800 hover:border-zinc-700 cursor-pointer"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Expanded Detail Drawer */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-zinc-800 space-y-3">
                        {/* Critique Text */}
                        {item.critiqueText && (
                          <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-mono text-amber-400 font-bold flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Model B (Critic) Peer Evaluation Note:</span>
                              </span>
                            </div>
                            <p className="text-xs font-mono text-amber-200/90 leading-relaxed">
                              {item.critiqueText}
                            </p>
                          </div>
                        )}

                        {/* Payload Code */}
                        {item.payloadCode && (
                          <div className="depth-well rounded-lg p-3 relative font-mono text-xs">
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/80 text-[11px] text-zinc-400">
                              <div className="flex items-center gap-1.5">
                                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Code / Payload Inspection:</span>
                              </div>
                              <button
                                onClick={() => handleCopyPayload(item.id, item.payloadCode!)}
                                className="btn-tactile btn-tactile-secondary px-2 py-0.5 rounded text-[10px] gap-1 text-zinc-300"
                              >
                                {copiedId === item.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy Code</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="text-zinc-200 overflow-x-auto text-[11px] leading-relaxed">
                              {item.payloadCode}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
