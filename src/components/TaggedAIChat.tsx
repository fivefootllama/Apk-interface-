import React, { useState } from 'react';
import { TaggedMessage, ProviderType } from '../types/blueprint';
import { 
  Send, 
  Tag, 
  Filter, 
  Bot, 
  User, 
  RotateCw, 
  Search, 
  Trash2, 
  Code2, 
  Sparkles, 
  Clock, 
  Zap, 
  Layers,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Plus
} from 'lucide-react';

export const TaggedAIChat: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>('GEMINI');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [activeTags, setActiveTags] = useState<string[]>(['#accessibility', '#automation']);
  const [customTagInput, setCustomTagInput] = useState<string>('');
  const [filterTag, setFilterTag] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  // Available tag library
  const availableTags = [
    '#accessibility',
    '#automation',
    '#codegen',
    '#critic_audit',
    '#security',
    '#otp_extraction',
    '#system_repair',
    '#youtube_flow'
  ];

  // Initial tagged communications
  const [messages, setMessages] = useState<TaggedMessage[]>([
    {
      id: 'msg_1',
      timestamp: Date.now() - 3600000,
      sender: 'user',
      provider: 'GEMINI',
      model: 'gemini-2.5-flash',
      content: 'Analyze YouTube player active window hierarchy and detect the Skip Ad clickable bounds.',
      tags: ['#accessibility', '#automation', '#youtube_flow'],
      status: 'success'
    },
    {
      id: 'msg_2',
      timestamp: Date.now() - 3598500,
      sender: 'assistant',
      provider: 'GEMINI',
      model: 'gemini-2.5-flash',
      content: 'Parsed active node tree from SystemBridgeService.dumpHierarchyJson(). Found clickable Button element with viewId "com.google.android.youtube:id/skip_ad_button" at coordinates [centerX: 287.5, centerY: 205.0]. Ready to dispatch gesture click.',
      tags: ['#accessibility', '#automation', '#youtube_flow'],
      latencyMs: 380,
      tokensUsed: 194,
      status: 'success',
      structuredData: {
        action: "CLICK",
        target_id: "com.google.android.youtube:id/skip_ad_button",
        coordinates: { x: 287.5, y: 205.0 },
        visibleToUser: true
      }
    },
    {
      id: 'msg_3',
      timestamp: Date.now() - 1800000,
      sender: 'user',
      provider: 'ANTHROPIC',
      model: 'claude-3-7-sonnet-20250219',
      content: 'Generate a Python module to parse and extract the 6-digit numeric OTP code from the latest SMS notification.',
      tags: ['#codegen', '#otp_extraction', '#security'],
      status: 'success'
    },
    {
      id: 'msg_4',
      timestamp: Date.now() - 1797200,
      sender: 'assistant',
      provider: 'ANTHROPIC',
      model: 'claude-3-7-sonnet-20250219',
      content: `\`\`\`python
import re
from com.selfevolving.container import SystemBridgeService

def extract_otp():
    hierarchy = SystemBridgeService.getScreenHierarchyJson()
    # Search for standard 6-digit numeric OTP tokens
    match = re.search(r'\\b(\\d{6})\\b', hierarchy)
    if match:
        return {"status": "found", "otp": match.group(1)}
    return {"status": "not_found"}
\`\`\``,
      tags: ['#codegen', '#otp_extraction', '#security'],
      latencyMs: 720,
      tokensUsed: 312,
      status: 'success'
    }
  ]);

  const toggleTag = (tag: string) => {
    setActiveTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTagInput.trim()) return;
    let tag = customTagInput.trim();
    if (!tag.startsWith('#')) tag = `#${tag}`;
    if (!activeTags.includes(tag)) {
      setActiveTags(prev => [...prev, tag]);
    }
    setCustomTagInput('');
  };

  const handleSendMessage = () => {
    if (!inputPrompt.trim() || isSending) return;

    const userMsgId = `msg_${Date.now()}`;
    const userMsg: TaggedMessage = {
      id: userMsgId,
      timestamp: Date.now(),
      sender: 'user',
      provider: selectedProvider,
      model: selectedModel,
      content: inputPrompt.trim(),
      tags: [...activeTags],
      status: 'sent'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsSending(true);

    // Simulate multi-provider model response with tags
    setTimeout(() => {
      let simulatedReply = '';
      let structured = null;

      if (activeTags.includes('#codegen')) {
        simulatedReply = `Generated verified Python module for "${userMsg.content.slice(0, 40)}...":\n\`\`\`python\ndef main():\n    # Safe container action\n    return {"status": "executed", "tags": ${JSON.stringify(activeTags)}}\n\`\`\``;
        structured = { status: "code_generated", tags: activeTags };
      } else if (activeTags.includes('#critic_audit')) {
        simulatedReply = `[CRITIC AUDIT]: Verified code structure and accessibility compliance. No infinite loops detected. Tagged for deployment.`;
        structured = { verdict: "APPROVED", audit_score: 98 };
      } else {
        simulatedReply = `[${selectedProvider} / ${selectedModel}] Processed query with tags [${activeTags.join(', ')}]. Dispatched via hardware-encrypted API bridge cleanly.`;
        structured = { processed: true, provider: selectedProvider };
      }

      const botMsg: TaggedMessage = {
        id: `msg_${Date.now() + 1}`,
        timestamp: Date.now(),
        sender: 'assistant',
        provider: selectedProvider,
        model: selectedModel,
        content: simulatedReply,
        tags: [...activeTags],
        latencyMs: Math.floor(Math.random() * 300) + 250,
        tokensUsed: Math.floor(Math.random() * 150) + 90,
        status: 'success',
        structuredData: structured
      };

      setMessages(prev => [...prev, botMsg]);
      setIsSending(false);
    }, 650);
  };

  // Filter messages by tag and search query
  const filteredMessages = messages.filter(m => {
    const matchesTag = filterTag === 'ALL' || m.tags.includes(filterTag);
    const matchesSearch = !searchQuery || 
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>TAGGED AI COMMUNICATION PROTOCOL</span>
            <span>·</span>
            <span>STRUCTURED DISPATCH</span>
          </div>
          <h2 className="text-base font-semibold text-white tracking-tight mt-1">
            Organized Tagged AI Messenger
          </h2>
          <p className="text-xs text-zinc-300 mt-1 max-w-2xl">
            Communicates with the integrated models (<strong>Anthropic</strong>, <strong>Gemini</strong>, <strong>Grok</strong>, <strong>Hugging Face</strong>) using topic and intention tags. 
            Queries and tracebacks are automatically organized, searchable, and filtered by tag.
          </p>
        </div>

        {/* Clear & Stats */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessages([])}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg border border-zinc-700 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Clear Log</span>
          </button>
        </div>
      </div>

      {/* Provider & Model Selection Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-zinc-400 mr-1">Target Model:</span>
          {(['GEMINI', 'ANTHROPIC', 'GROK', 'HUGGINGFACE'] as ProviderType[]).map((prov) => {
            const isSelected = selectedProvider === prov;
            return (
              <button
                key={prov}
                onClick={() => {
                  setSelectedProvider(prov);
                  if (prov === 'GEMINI') setSelectedModel('gemini-2.5-flash');
                  if (prov === 'ANTHROPIC') setSelectedModel('claude-3-7-sonnet-20250219');
                  if (prov === 'GROK') setSelectedModel('grok-2-latest');
                  if (prov === 'HUGGINGFACE') setSelectedModel('deepseek-ai/DeepSeek-R1');
                }}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors border ${
                  isSelected
                    ? 'bg-zinc-800 border-cyan-500 text-cyan-300 shadow-sm'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {prov}
              </button>
            );
          })}
        </div>

        <div className="text-xs font-mono text-zinc-500">
          Model: <span className="text-zinc-200">{selectedModel}</span>
        </div>
      </div>

      {/* Main Grid: Tag Filter Sidebar + Chat Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tag Filter Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                <span>Filter by Tag</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500">{filteredMessages.length} msgs</span>
            </div>

            {/* Tag Filter Buttons */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilterTag('ALL')}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  filterTag === 'ALL'
                    ? 'bg-cyan-600 text-white font-medium'
                    : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                ALL
              </button>
              {availableTags.map((t) => {
                const count = messages.filter(m => m.tags.includes(t)).length;
                return (
                  <button
                    key={t}
                    onClick={() => setFilterTag(t)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
                      filterTag === t
                        ? 'bg-cyan-600 text-white font-medium'
                        : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-800 border border-zinc-800/80'
                    }`}
                  >
                    <span>{t}</span>
                    <span className="text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="pt-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search message text..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Action Templates */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2.5">
            <span className="text-xs font-semibold text-white">Suggested Automation Prompts:</span>
            <div className="space-y-1.5">
              {[
                { prompt: 'Detect and dismiss YouTube video sponsored ad surface', tags: ['#accessibility', '#youtube_flow'] },
                { prompt: 'Extract 6-digit OTP from incoming SMS notification', tags: ['#otp_extraction', '#codegen'] },
                { prompt: 'Audit screen hierarchy for security compliance', tags: ['#critic_audit', '#security'] }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputPrompt(item.prompt);
                    setActiveTags(item.tags);
                  }}
                  className="w-full text-left p-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/60 text-xs text-zinc-300 transition-colors"
                >
                  <div className="truncate">{item.prompt}</div>
                  <div className="flex gap-1 mt-1">
                    {item.tags.map(t => (
                      <span key={t} className="text-[10px] font-mono text-cyan-400">{t}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Chat Feed & Dispatch Area */}
        <div className="lg:col-span-8 flex flex-col h-[650px] border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {filteredMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 space-y-2">
                <Tag className="w-8 h-8 text-zinc-600" />
                <p className="text-xs">No communications found for the selected tag filter.</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-[10px] font-mono text-zinc-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400">
                        {isUser ? 'YOU' : `${msg.provider} (${msg.model})`}
                      </span>
                      {msg.latencyMs && (
                        <span className="text-[10px] font-mono text-zinc-600">
                          {msg.latencyMs}ms
                        </span>
                      )}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                        isUser
                          ? 'bg-zinc-800 text-white rounded-tr-none'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none shadow-md'
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans">
                        {msg.content}
                      </div>

                      {/* Structured JSON display if present */}
                      {msg.structuredData && (
                        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                          <pre>{JSON.stringify(msg.structuredData, null, 2)}</pre>
                        </div>
                      )}

                      {/* Tag badges on the message */}
                      <div className="flex flex-wrap gap-1 pt-1 border-t border-zinc-800/60">
                        {msg.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono text-cyan-400/90"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Active Tags Selector Bar */}
          <div className="px-4 py-2 bg-zinc-900/90 border-t border-zinc-800 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
              <Tag className="w-3 h-3 text-cyan-400" />
              <span>Attach Tags:</span>
            </span>
            {availableTags.map((t) => {
              const isAttached = activeTags.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    isAttached
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-600'
                      : 'bg-zinc-950 text-zinc-500 border border-zinc-800 hover:text-zinc-300'
                  }`}
                >
                  {t}
                </button>
              );
            })}

            {/* Custom Tag Input */}
            <form onSubmit={handleAddCustomTag} className="flex items-center gap-1">
              <input
                type="text"
                placeholder="+ tag"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                className="w-16 px-1.5 py-0.5 text-[10px] font-mono bg-zinc-950 border border-zinc-800 rounded text-zinc-200 focus:outline-none"
              />
            </form>
          </div>

          {/* Input Box & Send Bar */}
          <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2">
            <textarea
              rows={2}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Send message to ${selectedProvider} with tags [${activeTags.join(', ')}]...`}
              className="flex-1 p-2.5 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
            />

            <button
              onClick={handleSendMessage}
              disabled={isSending || !inputPrompt.trim()}
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 h-full"
            >
              {isSending ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
