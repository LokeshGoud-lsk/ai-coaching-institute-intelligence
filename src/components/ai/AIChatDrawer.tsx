import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Send,
  X,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Button } from '../common/Button';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source?: string;
  evidence?: any[];
  suggestions?: string[];
  timestamp: string;
}

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Hello! I am your **EduTrack AI Intelligence Assistant**.\n\nAll my responses are **strictly grounded in your active institutional database records**. Ask me about student risk factors, attendance rates, batch performance comparisons, or outstanding fee balances.`,
      source: 'EduTrack AI Grounding Engine',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "Summarize this month's academic performance.",
    'Which students have declining exam scores?',
    'Which students have attendance below 75%?',
    'Show students who have both low attendance and declining marks.',
    'Summarize pending fees and overdue balances.',
    'Compare academic performance across batches.',
    'Which students need immediate academic attention?',
    'Explain why Rahul Sharma received an early-warning alert.',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Pass previous conversation turns for multi-turn conversational reasoning
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await api.askAIChat(query, historyPayload);

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        source: response.source,
        evidence: response.evidence,
        suggestions: response.suggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Unable to complete AI query: ${err.message || 'Network error'}. Please try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: `Chat cleared. Ask me any question about your enrolled students, batches, fee records, or risk indicators.`,
        source: 'EduTrack AI Grounding Engine',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] z-50 flex flex-col bg-slate-950/95 border-l border-white/10 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right duration-250">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-electric-cyan flex items-center justify-center text-white shadow-glow">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
              EduTrack AI Intelligence
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                Grounded
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Powered by Google Gemini & Database Facts</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            title="Reset Chat"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Suggested Chips Carousel */}
      <div className="px-4 py-2 border-b border-white/5 bg-slate-900/40 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-white/5 hover:border-brand-500/40 hover:text-white transition-all shrink-0 flex items-center gap-1"
          >
            <Sparkles className="w-2.5 h-2.5 text-electric-cyan" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white rounded-br-none shadow-lg shadow-brand-600/20'
                  : 'bg-slate-900/90 text-slate-200 border border-white/10 rounded-bl-none shadow-md'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

              {/* Evidence Section */}
              {msg.evidence && msg.evidence.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified Evidence ({msg.evidence.length} Records)
                  </div>
                  <div className="space-y-1.5">
                    {msg.evidence.slice(0, 3).map((ev: any, evIdx: number) => (
                      <div
                        key={evIdx}
                        className="p-2 rounded-lg bg-slate-950/80 border border-white/5 flex items-center justify-between text-[11px]"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-white block truncate">{ev.title}</span>
                          <span className="text-[10px] text-slate-400">
                            {ev.metricKey}: <strong className="text-electric-cyan">{ev.metricValue}</strong>
                          </span>
                        </div>
                        {ev.actionUrl && (
                          <Link
                            to={ev.actionUrl}
                            onClick={onClose}
                            className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white shrink-0"
                            title="Inspect in Dashboard"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {msg.source && (
                <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px] text-slate-400 flex items-center justify-between">
                  <span className="font-mono text-[9px] truncate max-w-[200px]">Source: {msg.source}</span>
                  <button
                    onClick={() => copyToClipboard(msg.id, msg.content)}
                    className="hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-slate-900/60 rounded-xl border border-white/5 text-xs text-slate-400 max-w-xs animate-pulse">
            <Sparkles className="w-4 h-4 text-electric-cyan animate-spin" />
            <span>Retrieving records & synthesizing with Gemini...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-white/10 bg-slate-900/90">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything about students, marks, or fees..."
            disabled={isLoading}
            className="flex-1 bg-slate-800/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
          />
          <Button
            type="submit"
            variant="gradient"
            size="md"
            disabled={!input.trim() || isLoading}
            isLoading={isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
