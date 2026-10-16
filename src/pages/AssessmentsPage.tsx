import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Plus,
  Save,
  CheckCircle,
  FileCheck,
  TrendingDown,
  TrendingUp,
  BarChart,
  Edit3,
} from 'lucide-react';
import { api } from '../lib/api';
import { Assessment, Batch, AssessmentType } from '../types';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

export const AssessmentsPage: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [activeExam, setActiveExam] = useState<Assessment | null>(null);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingMarks, setIsSavingMarks] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Exam Modal
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [newExam, setNewExam] = useState({
    title: '',
    batchId: '',
    subjectId: 'sub-phy',
    type: 'UNIT_TEST' as AssessmentType,
    examDate: new Date().toISOString().slice(0, 10),
    maxMarks: '100',
    passMarks: '40',
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [examsRes, batchesRes] = await Promise.all([
        api.getAssessments(selectedBatchId || undefined),
        api.getBatches(),
      ]);
      setAssessments(examsRes);
      setBatches(batchesRes);
      if (examsRes.length > 0 && !activeExam) {
        loadExamResults(examsRes[0]);
      }
    } catch (err) {
      console.error('Failed to load assessments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBatchId]);

  const loadExamResults = async (exam: Assessment) => {
    try {
      setActiveExam(exam);
      const data = await api.getAssessmentResults(exam.id);
      setExamResults(data.results);
    } catch (err) {
      console.error('Failed to load results for exam:', err);
    }
  };

  const handleMarkChange = (studentId: string, value: string, isAbsent: boolean) => {
    setExamResults(prev =>
      prev.map(r => {
        if (r.studentId !== studentId) return r;
        if (isAbsent) {
          return { ...r, isAbsent: true, marksObtained: null, percentage: null, grade: 'ABSENT' };
        }
        const numeric = value === '' ? null : parseFloat(value);
        const max = activeExam?.maxMarks || 100;
        const pct = numeric !== null ? Math.round((numeric / max) * 100 * 10) / 10 : null;
        return {
          ...r,
          isAbsent: false,
          marksObtained: numeric,
          percentage: pct,
          grade: pct && pct >= 80 ? 'A+' : pct && pct >= 65 ? 'B+' : pct && pct >= 40 ? 'C' : 'F',
        };
      })
    );
  };

  const handleSaveMarks = async () => {
    if (!activeExam) return;
    setIsSavingMarks(true);
    setSaveSuccess(false);
    try {
      await api.saveAssessmentResults(activeExam.id, examResults);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      fetchData();
    } catch (err) {
      console.error('Failed to save marks:', err);
    } finally {
      setIsSavingMarks(false);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAssessment({
        title: newExam.title,
        batchId: newExam.batchId || batches[0]?.id,
        type: newExam.type,
        examDate: newExam.examDate,
        maxMarks: parseFloat(newExam.maxMarks),
        passMarks: parseFloat(newExam.passMarks),
      });
      setIsAddExamOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to create assessment:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
            Tests & Examination Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Conduct assessments, record marks, and inspect score distributions with absent-policy compliance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="gradient"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddExamOpen(true)}
          >
            Schedule Assessment
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Marks recorded and student performance progression updated successfully.</span>
        </div>
      )}

      {/* Grid: Left Exams List (1 Col), Right Marks Entry Sheet (2 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exams List Sidebar */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-brand-400" />
              Assessments Roster
            </h3>
            <span className="text-xs text-slate-400">{assessments.length} Tests</span>
          </div>

          <div className="space-y-2.5 max-h-[550px] overflow-y-auto">
            {assessments.map(exam => {
              const isSelected = activeExam?.id === exam.id;
              return (
                <div
                  key={exam.id}
                  onClick={() => loadExamResults(exam)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all space-y-1.5 ${
                    isSelected
                      ? 'bg-brand-600/20 border-brand-500 text-white shadow-md'
                      : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800/60 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs line-clamp-1">{exam.title}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-slate-300 shrink-0">
                      {exam.type.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">{exam.batchName}</p>

                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400 border-t border-white/5">
                    <span>Date: {exam.examDate}</span>
                    <span>Max: {exam.maxMarks}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Marks Entry & Grade Ledger */}
        <div className="lg:col-span-2 glass-card p-5 space-y-4">
          {activeExam ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{activeExam.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeExam.batchName} | Max Marks:{' '}
                    <strong className="text-white">{activeExam.maxMarks}</strong> | Passing:{' '}
                    <strong className="text-white">{activeExam.passMarks}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="gradient"
                    size="sm"
                    leftIcon={<Save className="w-4 h-4" />}
                    isLoading={isSavingMarks}
                    onClick={handleSaveMarks}
                  >
                    Save All Scores
                  </Button>
                </div>
              </div>

              {/* Assessment Stats Vitals */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase block">Class Average</span>
                  <span className="text-lg font-bold text-white mt-0.5 block">
                    {activeExam.averageScore ? `${activeExam.averageScore}%` : 'Pending'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase block">Highest Score</span>
                  <span className="text-lg font-bold text-emerald-400 mt-0.5 block">
                    {activeExam.highestScore ? `${activeExam.highestScore}` : '—'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase block">Lowest Score</span>
                  <span className="text-lg font-bold text-rose-400 mt-0.5 block">
                    {activeExam.lowestScore ? `${activeExam.lowestScore}` : '—'}
                  </span>
                </div>
              </div>

              {/* Marks Table */}
              <div className="overflow-x-auto max-h-[420px]">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 uppercase text-[10px] text-slate-400 border-b border-white/10 sticky top-0">
                    <tr>
                      <th className="p-3">Scholar</th>
                      <th className="p-3">Roll Code</th>
                      <th className="p-3">Marks Obtained</th>
                      <th className="p-3">Percentage</th>
                      <th className="p-3">Grade</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {examResults.map(res => (
                      <tr key={res.studentId} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-white">{res.studentName}</td>
                        <td className="p-3 font-mono text-slate-400">{res.studentCode}</td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            max={activeExam.maxMarks}
                            disabled={res.isAbsent}
                            value={res.marksObtained !== null ? res.marksObtained : ''}
                            onChange={e => handleMarkChange(res.studentId, e.target.value, false)}
                            placeholder={res.isAbsent ? 'Absent' : '0'}
                            className="w-20 bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-40"
                          />
                        </td>
                        <td className="p-3 font-semibold text-white">
                          {res.percentage !== null ? `${res.percentage}%` : '—'}
                        </td>
                        <td className="p-3 font-bold">
                          <span
                            className={
                              res.grade === 'A+' || res.grade === 'A'
                                ? 'text-emerald-400'
                                : res.grade === 'F'
                                ? 'text-rose-400'
                                : 'text-slate-300'
                            }
                          >
                            {res.grade || '—'}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleMarkChange(
                                res.studentId,
                                res.isAbsent ? '0' : '',
                                !res.isAbsent
                              )
                            }
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                              res.isAbsent
                                ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {res.isAbsent ? 'Marked Absent' : 'Mark Absent'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400">
              Select an assessment from the left panel to inspect or record marks.
            </div>
          )}
        </div>
      </div>

      {/* Schedule Assessment Modal */}
      <Modal
        isOpen={isAddExamOpen}
        onClose={() => setIsAddExamOpen(false)}
        title="Schedule Assessment"
        subtitle="Create an examination event and publish to batch timetable"
      >
        <form onSubmit={handleCreateExam} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Assessment Title</label>
            <input
              type="text"
              required
              value={newExam.title}
              onChange={e => setNewExam({ ...newExam, title: e.target.value })}
              placeholder="e.g. Unit Test 05 — Rotational Dynamics & Gravitation"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Batch</label>
              <select
                value={newExam.batchId}
                onChange={e => setNewExam({ ...newExam, batchId: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {batches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Assessment Type</label>
              <select
                value={newExam.type}
                onChange={e => setNewExam({ ...newExam, type: e.target.value as AssessmentType })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="UNIT_TEST">Unit Test</option>
                <option value="WEEKLY_QUIZ">Weekly Quiz</option>
                <option value="MIDTERM_EXAM">Midterm Exam</option>
                <option value="MOCK_TEST">Grand Mock Test</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Exam Date</label>
              <input
                type="date"
                required
                value={newExam.examDate}
                onChange={e => setNewExam({ ...newExam, examDate: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Max Marks</label>
              <input
                type="number"
                required
                value={newExam.maxMarks}
                onChange={e => setNewExam({ ...newExam, maxMarks: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Pass Marks</label>
              <input
                type="number"
                required
                value={newExam.passMarks}
                onChange={e => setNewExam({ ...newExam, passMarks: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="outline" type="button" onClick={() => setIsAddExamOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" type="submit">
              Schedule & Publish
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
