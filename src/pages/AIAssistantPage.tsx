import React, { useState } from 'react';
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
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { api } from '../lib/api';
import { Button } from '../components/common/Button';

export const AIAssistantPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'report' | 'drafts'>('chat');

  // Chat State
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content: string; source?: string }[]
  >([
    {
      role: 'assistant',
      content: `Welcome to the **Institute Intelligence AI Assistant**.\n\nAll my responses are **strictly grounded in your active institutional database records**. Ask me about student risk factors, attendance rates, batch performance comparisons, or outstanding fee balances.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Executive Report State
  const [selectedMonth, setSelectedMonth] = useState('October 2026');
  const [reportData, setReportData] = useState<any | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  // Communication Drafts State
  const [draftType, setDraftType] = useState<'ATTENDANCE_DROP' | 'FEE_REMINDER' | 'ACADEMIC_SUPPORT'>('ATTENDANCE_DROP');
  const [draftStudentId, setDraftStudentId] = useState('stu-101');
  const [draftResult, setDraftResult] = useState<{ subject: string; body: string } | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);

  const sampleQuestions = [
    "Summarize this month's academic performance.",
    'Which students have declining scores?',
    'Which students have low attendance?',
    'Summarize pending fees and overdue balances.',
    'Explain why Rahul Sharma received an early-warning alert.',
    'Compare the performance of two batches.',
  ];

  const handleSendChat = async (prompt?: string) => {
    const query = prompt || input;
    if (!query.trim() || isLoadingChat) return;

    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setInput('');
    setIsLoadingChat(true);

    try {
      const res = await api.askAIChat(query);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: res.reply, source: res.source },
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message || 'Unable to connect to AI engine'}` },
      ]);
    } finally {
      setIsLoadingChat(false);
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

  const handleCopy = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-electric-cyan flex items-center justify-center text-white shadow-glow">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
              Grounded AI Intelligence Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Official Google Gemini API integration with strict institutional database grounding
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-white/10 rounded-xl">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'chat' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Conversational AI
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'report' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Executive Summaries
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'drafts' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Communication Drafts
          </button>
        </div>
      </div>

      {/* Tab 1: Conversational Chat */}
      {activeTab === 'chat' && (
        <div className="glass-card overflow-hidden flex flex-col h-[650px]">
          {/* Suggested Chips Carousel */}
          <div className="p-3 bg-slate-900/60 border-b border-white/5 overflow-x-auto whitespace-nowrap flex gap-2">
            {sampleQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendChat(q)}
                disabled={isLoadingChat}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 text-slate-300 border border-white/5 hover:border-brand-500/40 hover:text-white transition-all shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-none shadow-lg'
                      : 'bg-slate-900/90 text-slate-200 border border-white/10 rounded-bl-none shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>

                  {m.source && (
                    <div className="mt-3 pt-2 border-t border-white/10 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Engine: {m.source}</span>
                      <button
                        onClick={() => handleCopy(idx, m.content)}
                        className="hover:text-white transition-colors flex items-center gap-1"
                      >
                        {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedIdx === idx ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoadingChat && (
              <div className="flex items-center gap-2 p-3 bg-slate-900/80 rounded-xl border border-white/5 text-xs text-slate-400 max-w-xs animate-pulse">
                <Sparkles className="w-4 h-4 text-electric-cyan animate-spin" />
                <span>Grounding against database records & generating...</span>
              </div>
            )}
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
                className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Button type="submit" variant="gradient" size="md" isLoading={isLoadingChat}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Executive Report Generator */}
      {activeTab === 'report' && (
        <div className="glass-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Monthly Institutional Performance Briefing
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-faceted executive synthesis comparing verified statistical metrics with AI insights
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

          {reportData ? (
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
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">
                Click &quot;Synthesize Report&quot; to generate an executive performance audit for the selected cycle.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: AI Communication Drafts */}
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
                      onClick={() => handleCopy(999, `${draftResult.subject}\n\n${draftResult.body}`)}
                    >
                      {copiedIdx === 999 ? 'Copied to Clipboard' : 'Copy Full Draft'}
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
