import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  Mail,
  Copy,
  Check,
  Building2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Clock,
  CreditCard,
  Layers,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { api } from '../lib/api';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source?: string;
  evidence?: any[];
  suggestions?: string[];
  timestamp: string;
}

export const AIAssistantPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'diagnostic' | 'report' | 'drafts'>('chat');

  // AI Model Status
  const [aiStatus, setAiStatus] = useState<{
    configured: boolean;
    model: string;
    provider: string;
    status: string;
  } | null>(null);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Welcome to the **EduTrack AI Intelligence Assistant**.\n\nAll my responses are **strictly grounded in your active institutional database records**. Ask me about student risk factors, attendance rates, batch performance comparisons, or outstanding fee balances.\n\n*Try asking: "Which students have both low attendance and declining marks?" or "Summarize pending fees."*`,
      source: 'EduTrack AI Grounding Engine',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Diagnostic Tab State
  const [selectedDiagStudent, setSelectedDiagStudent] = useState('stu-101');
  const [diagData, setDiagData] = useState<any | null>(null);
  const [isLoadingDiag, setIsLoadingDiag] = useState(false);

  // Executive Report State
  const [selectedMonth, setSelectedMonth] = useState('October 2026');
  const [reportData, setReportData] = useState<any | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  // Communication Drafts State
  const [draftType, setDraftType] = useState<'ATTENDANCE_DROP' | 'FEE_REMINDER' | 'ACADEMIC_SUPPORT'>('ATTENDANCE_DROP');
  const [draftStudentId, setDraftStudentId] = useState('stu-101');
  const [draftResult, setDraftResult] = useState<{ subject: string; body: string } | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);

  // Quick Action Prompts
  const quickQuestions = [
    "Summarize this month's academic performance.",
    'Which students have declining exam scores?',
    'Which students have attendance below 75%?',
    'Show students who have both low attendance and declining marks.',
    'Summarize pending fees and overdue balances.',
    'Compare academic performance across batches.',
    'Which students need immediate academic attention?',
    'Explain why Rahul Sharma is flagged as high risk.',
    'Generate a parent-friendly progress summary for Rahul Sharma.',
    'Recommend academic interventions based on actual performance.',
  ];

  const fetchAIStatus = async () => {
    try {
      const status = await api.getAIStatus();
      setAiStatus(status);
    } catch (e) {
      console.warn('Failed to load AI status:', e);
    }
  };

  useEffect(() => {
    fetchAIStatus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingChat]);

  const handleSendChat = async (prompt?: string) => {
    const query = prompt || input;
    if (!query.trim() || isLoadingChat) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoadingChat(true);

    try {
      // Pass past conversation turns for multi-turn contextual reasoning
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.askAIChat(query, historyPayload, selectedStudentFilter || undefined);

      const assistantMessage: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        source: res.source,
        evidence: res.evidence,
        suggestions: res.suggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Unable to query AI engine: ${err.message || 'Network error'}. Please try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(id);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: `Conversation reset. I am ready to answer any inquiries grounded in your active student marks, attendance biometric logs, or fee ledger records.`,
        source: 'EduTrack AI Grounding Engine',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleFetchDiagnostic = async (id?: string) => {
    const target = id || selectedDiagStudent;
    setIsLoadingDiag(true);
    try {
      const res = await api.getStudentAIInsight(target);
      setDiagData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDiag(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsLoadingReport(true);
    try {
      const data = await api.generateAIReport(selectedMonth);
      setReportData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handleGenerateDraft = async () => {
    setIsLoadingDraft(true);
    try {
      const res = await api.draftAIMessage(draftStudentId, draftType);
      setDraftResult({ subject: res.subject, body: res.body });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDraft(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-electric-cyan flex items-center justify-center text-white shadow-glow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
                EduTrack AI Intelligence Assistant
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Powered by Google Gemini 3.8 Flash & Grounded in Real-Time Database Records
              </p>
            </div>
          </div>
        </div>

        {/* Live Model Status & Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {aiStatus && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  aiStatus.configured
                    ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                    : 'bg-cyan-400'
                }`}
              />
              <span className="text-slate-300 font-semibold text-[11px]">
                {aiStatus.configured ? `Model: ${aiStatus.model}` : 'Deterministic Engine'}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-white/10 rounded-xl">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'chat' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Conversational Chat
            </button>
            <button
              onClick={() => {
                setActiveTab('diagnostic');
                if (!diagData) handleFetchDiagnostic('stu-101');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'diagnostic' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Scholar Diagnosis
            </button>
            <button
              onClick={() => {
                setActiveTab('report');
                if (!reportData) handleGenerateReport();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'report' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Executive Report
            </button>
            <button
              onClick={() => setActiveTab('drafts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'drafts' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Parent Notices
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Conversational Chat */}
      {activeTab === 'chat' && (
        <div className="glass-card overflow-hidden flex flex-col h-[700px] border-white/10 shadow-2xl">
          {/* Top Control Bar: Scholar Focus & Actions */}
          <div className="p-3 bg-slate-900/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Scholar Focus Filter:</span>
              <select
                value={selectedStudentFilter}
                onChange={e => setSelectedStudentFilter(e.target.value)}
                className="bg-slate-800 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">All Institutional Scholars</option>
                <option value="stu-101">Rahul Sharma (JEE Super-30)</option>
                <option value="stu-102">Priya Patel (NEET Achievers)</option>
                <option value="stu-103">Amit Verma (JEE Foundation)</option>
                <option value="stu-104">Neha Gupta (NEET Olympiad)</option>
                <option value="stu-105">Karan Singhania (JEE Advanced)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Reset Chat
              </Button>
            </div>
          </div>

          {/* Quick Suggested Chips */}
          <div className="p-2.5 bg-slate-900/50 border-b border-white/5 overflow-x-auto whitespace-nowrap flex gap-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendChat(q)}
                disabled={isLoadingChat}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 text-slate-300 border border-white/5 hover:border-brand-500/50 hover:bg-slate-800 hover:text-white transition-all shrink-0 flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-electric-cyan" />
                <span>{q}</span>
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {messages.map(m => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-none shadow-lg'
                      : 'bg-slate-900/95 text-slate-200 border border-white/10 rounded-bl-none shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{m.content}</div>

                  {/* Evidence Cards Section */}
                  {m.evidence && m.evidence.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verified Supporting Database Evidence ({m.evidence.length} Records)
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {m.evidence.map((ev: any, evIdx: number) => (
                          <div
                            key={evIdx}
                            className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-between text-xs gap-2"
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-white block truncate">{ev.title}</span>
                              <span className="text-[10px] text-slate-400 block">
                                {ev.metricKey}: <strong className="text-electric-cyan">{ev.metricValue}</strong>
                              </span>
                            </div>

                            {ev.actionUrl && (
                              <Link
                                to={ev.actionUrl}
                                className="shrink-0 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                title="Inspect Record in Dashboard"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer with Source and Copy */}
                  {m.source && (
                    <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1 font-mono">
                        <Bot className="w-3 h-3 text-electric-cyan" />
                        {m.source}
                      </span>
                      <button
                        onClick={() => handleCopy(m.id, m.content)}
                        className="hover:text-white transition-colors flex items-center gap-1"
                      >
                        {copiedIdx === m.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedIdx === m.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoadingChat && (
              <div className="flex items-center gap-3 p-3.5 bg-slate-900/90 rounded-2xl border border-white/10 text-xs text-slate-300 max-w-sm animate-pulse shadow-lg">
                <Sparkles className="w-4 h-4 text-electric-cyan animate-spin shrink-0" />
                <span>Grounding against active database records & querying Gemini...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Bar */}
          <div className="p-4 bg-slate-900/90 border-t border-white/10">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendChat();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask any question grounded in your active academy database..."
                className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
              />
              <Button type="submit" variant="gradient" size="md" isLoading={isLoadingChat}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Scholar Diagnostic AI */}
      {activeTab === 'diagnostic' && (
        <div className="glass-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Deep Scholar Diagnostic & Intervention Planner
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                AI diagnosis combining biometric attendance logs, assessment marksheets, and fee realization
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedDiagStudent}
                onChange={e => {
                  setSelectedDiagStudent(e.target.value);
                  handleFetchDiagnostic(e.target.value);
                }}
                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="stu-101">Rahul Sharma (High Risk - JEE Super-30)</option>
                <option value="stu-105">Karan Singhania (High Risk - Score Decline)</option>
                <option value="stu-103">Amit Verma (Medium Risk - Moderate Drop)</option>
                <option value="stu-102">Priya Patel (Low Risk - Top Performer)</option>
                <option value="stu-104">Neha Gupta (Low Risk - Olympiad)</option>
              </select>

              <Button
                variant="gradient"
                size="sm"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                isLoading={isLoadingDiag}
                onClick={() => handleFetchDiagnostic()}
              >
                Run Diagnosis
              </Button>
            </div>
          </div>

          {diagData ? (
            <div className="space-y-6 animate-in fade-in">
              {/* Metrics Header */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5">
                  <span className="text-xs text-slate-400 block">Attendance Rate</span>
                  <span className="text-lg font-bold text-white mt-1 block">
                    {diagData.metrics.attendance}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5">
                  <span className="text-xs text-slate-400 block">Latest Exam Score</span>
                  <span className="text-lg font-bold text-emerald-400 mt-1 block">
                    {diagData.metrics.latestScore}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5">
                  <span className="text-xs text-slate-400 block">Previous Exam Score</span>
                  <span className="text-lg font-bold text-slate-300 mt-1 block">
                    {diagData.metrics.previousScore}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5">
                  <span className="text-xs text-slate-400 block">Observed Delta</span>
                  <span className="text-lg font-bold text-rose-400 mt-1 block">
                    {diagData.metrics.scoreDrop}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5">
                  <span className="text-xs text-slate-400 block">Tuition Balance</span>
                  <span className="text-lg font-bold text-amber-400 mt-1 block">
                    {diagData.metrics.feeBalance}
                  </span>
                </div>
              </div>

              {/* Diagnosis Callout */}
              <div className="p-5 rounded-2xl bg-brand-950/20 border border-brand-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-300 uppercase tracking-wider">
                    Pedagogical Diagnosis for {diagData.studentName} ({diagData.studentCode})
                  </span>
                  <Link
                    to={`/students/${diagData.studentId}`}
                    className="text-xs text-electric-cyan hover:underline flex items-center gap-1 font-semibold"
                  >
                    View Scholar Profile <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-sans">{diagData.diagnosis}</p>
              </div>

              {/* Recommended Interventions */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Prescribed Academic Interventions
                </span>
                <div className="space-y-2">
                  {diagData.recommendedInterventions.map((item: string, i: number) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-900/70 border border-white/5 text-xs text-slate-200 flex items-start gap-2.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-electric-cyan mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parent Progress Note */}
              <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-white">Parent-Friendly Progress Summary</span>
                  <button
                    onClick={() => handleCopy('parent-note', diagData.parentSummary)}
                    className="text-xs text-electric-cyan hover:underline flex items-center gap-1"
                  >
                    {copiedIdx === 'parent-note' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIdx === 'parent-note' ? 'Copied' : 'Copy Summary'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">{diagData.parentSummary}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">Loading student diagnosis...</div>
          )}
        </div>
      )}

      {/* Tab 3: Executive Report Generator */}
      {activeTab === 'report' && (
        <div className="glass-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Monthly Institutional Performance Briefing
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Executive synthesis comparing verified statistical metrics with AI insights
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="October 2026">October 2026 (Current)</option>
                <option value="September 2026">September 2026</option>
                <option value="August 2026">August 2026</option>
              </select>

              <Button
                variant="gradient"
                size="sm"
                leftIcon={<Sparkles className="w-4 h-4" />}
                isLoading={isLoadingReport}
                onClick={handleGenerateReport}
              >
                Synthesize Report
              </Button>
            </div>
          </div>

          {reportData && (
            <div className="space-y-6 animate-in fade-in">
              {/* Verified Statistics Grid */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Verified Institutional Statistics ({reportData.period})
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                    <span className="text-xs text-slate-400 block">Enrolled Scholars</span>
                    <span className="text-lg font-bold text-white mt-1 block">
                      {reportData.verifiedStatistics.enrolledStudents}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                    <span className="text-xs text-slate-400 block">Active Batches</span>
                    <span className="text-lg font-bold text-white mt-1 block">
                      {reportData.verifiedStatistics.activeBatches}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                    <span className="text-xs text-slate-400 block">Average Attendance</span>
                    <span className="text-lg font-bold text-emerald-400 mt-1 block">
                      {reportData.verifiedStatistics.overallAttendancePct}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                    <span className="text-xs text-slate-400 block">Fees Realized</span>
                    <span className="text-lg font-bold text-electric-cyan mt-1 block">
                      {reportData.verifiedStatistics.feesCollected}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                    <span className="text-xs text-slate-400 block">High Risk Flags</span>
                    <span className="text-lg font-bold text-rose-400 mt-1 block">
                      {reportData.verifiedStatistics.highRiskStudentsCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Executive Interpretation */}
              <div className="p-5 rounded-2xl bg-brand-950/20 border border-brand-500/30 space-y-2">
                <span className="text-xs font-bold text-brand-300 uppercase tracking-wider block">
                  AI Synthesized Management Interpretation
                </span>
                <p className="text-sm text-slate-200 leading-relaxed font-sans">
                  {reportData.executiveSummary}
                </p>
              </div>

              {/* Recommended Next Steps */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Prescribed Follow-Up Action Items
                </span>
                <div className="space-y-2">
                  {reportData.recommendedActions.map((action: string, i: number) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-200 flex items-start gap-2.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-electric-cyan mt-1.5 shrink-0" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: AI Communication Drafts */}
      {activeTab === 'drafts' && (
        <div className="glass-card p-6 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-lg font-bold text-white tracking-tight">
              AI Parent Communication & Support Notice Drafter
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Draft empathetic, fact-based communications for attendance alerts, fee reminders, and doubt-clearing sessions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Scholar Target
                </label>
                <select
                  value={draftStudentId}
                  onChange={e => setDraftStudentId(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="stu-101">Rahul Sharma (High Risk - Attendance & Marks Drop)</option>
                  <option value="stu-105">Karan Singhania (High Risk - Sub-par Marks)</option>
                  <option value="stu-103">Amit Verma (Medium Risk - Moderate Drop)</option>
                  <option value="stu-102">Priya Patel (Low Risk - Top Performer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Communication Objective
                </label>
                <select
                  value={draftType}
                  onChange={e => setDraftType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="ATTENDANCE_DROP">Attendance Slump Consultation Request</option>
                  <option value="FEE_REMINDER">Tuition Installment Payment Notice</option>
                  <option value="ACADEMIC_SUPPORT">Academic Doubt-Clearing & Tutorial Invitation</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-300">
                Notice: All generated drafts require educator review and human authorization prior to transmission.
              </div>

              <Button
                variant="gradient"
                className="w-full"
                leftIcon={<Sparkles className="w-4 h-4" />}
                isLoading={isLoadingDraft}
                onClick={handleGenerateDraft}
              >
                Generate Grounded Draft
              </Button>
            </div>

            {/* Generated Draft Display */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Draft Preview
              </span>

              {draftResult ? (
                <div className="glass-card p-4 space-y-3 bg-slate-950/80 border-brand-500/30">
                  <div className="text-xs font-bold text-white border-b border-white/5 pb-2">
                    Subject: {draftResult.subject}
                  </div>
                  <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-sans max-h-64 overflow-y-auto">
                    {draftResult.body}
                  </div>
                  <div className="flex justify-end pt-2 border-t border-white/5">
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Copy className="w-3.5 h-3.5" />}
                      onClick={() => handleCopy('draft', `${draftResult.subject}\n\n${draftResult.body}`)}
                    >
                      {copiedIdx === 'draft' ? 'Copied to Clipboard' : 'Copy Full Draft'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-64 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-xs text-slate-500">
                  Select parameters and click &quot;Generate Grounded Draft&quot;
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
