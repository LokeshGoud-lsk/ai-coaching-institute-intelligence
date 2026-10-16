import React, { useEffect, useState } from 'react';
import {
  CalendarCheck,
  Calendar,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  HelpCircle,
  AlertTriangle,
  History,
} from 'lucide-react';
import { api } from '../lib/api';
import { Batch, Student, AttendanceStatus } from '../types';
import { Button } from '../components/common/Button';
import { AttendanceBadge } from '../components/common/Badge';

export const AttendancePage: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [stats, setStats] = useState<{ todayAttendanceRate: number; batches: any[] } | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [batchesRes, statsRes] = await Promise.all([
          api.getBatches(),
          api.getAttendanceStats(),
        ]);
        setBatches(batchesRes);
        setStats(statsRes);
        if (batchesRes.length > 0 && !selectedBatchId) {
          setSelectedBatchId(batchesRes[0].id);
        }
      } catch (err) {
        console.error('Failed to load attendance initial data:', err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedBatchId) return;

    const loadBatchStudents = async () => {
      try {
        const [studentsRes, attendanceRes] = await Promise.all([
          api.getStudents({ batchId: selectedBatchId, limit: 100 }),
          api.getAttendance({ batchId: selectedBatchId, date: selectedDate }),
        ]);

        setStudents(studentsRes.data);

        const newMap: Record<string, AttendanceStatus> = {};
        const newRemarks: Record<string, string> = {};

        studentsRes.data.forEach(s => {
          const rec = attendanceRes.find(a => a.studentId === s.id);
          newMap[s.id] = rec ? rec.status : 'PRESENT';
          if (rec?.remarks) newRemarks[s.id] = rec.remarks;
        });

        setAttendanceMap(newMap);
        setRemarksMap(newRemarks);
      } catch (err) {
        console.error('Failed to load batch students/attendance:', err);
      }
    };

    loadBatchStudents();
  }, [selectedBatchId, selectedDate]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach(s => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const records = students.map(s => ({
        studentId: s.id,
        status: attendanceMap[s.id] || 'PRESENT',
        remarks: remarksMap[s.id],
      }));

      await api.markAttendance(selectedBatchId, selectedDate, records);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Refresh stats
      const statsRes = await api.getAttendanceStats();
      setStats(statsRes);
    } catch (err) {
      console.error('Failed to save attendance:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculations for current sheet
  const presentCount = Object.values(attendanceMap).filter(s => s === 'PRESENT').length;
  const absentCount = Object.values(attendanceMap).filter(s => s === 'ABSENT').length;
  const currentBatchRate = students.length > 0 ? ((presentCount / students.length) * 100).toFixed(1) : '100';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
            Daily Attendance Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Batch-wise attendance logging, audit history, and low-attendance tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="gradient"
            size="sm"
            leftIcon={<Save className="w-4 h-4" />}
            isLoading={isSaving}
            onClick={handleSaveAttendance}
          >
            Save Batch Attendance
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Attendance recorded successfully. Audit logs and student profiles updated.</span>
        </div>
      )}

      {/* Control Bar: Batch, Date, Quick Bulk Actions */}
      <div className="glass-card p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Academic Batch</label>
            <select
              value={selectedBatchId}
              onChange={e => setSelectedBatchId(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {batches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Session Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
            </input>
          </div>

          <div className="sm:col-span-2 flex flex-col justify-end">
            <span className="text-xs font-semibold text-slate-300 mb-1.5">Bulk Marking Shortcuts</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleMarkAll('PRESENT')}
              >
                Mark All Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleMarkAll('ABSENT')}
              >
                Mark All Absent
              </Button>
            </div>
          </div>
        </div>

        {/* Attendance Vitals Bar */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-slate-400">Total Enrolled:</span>{' '}
              <strong className="text-white font-bold">{students.length}</strong>
            </div>
            <div>
              <span className="text-slate-400">Present:</span>{' '}
              <strong className="text-emerald-400 font-bold">{presentCount}</strong>
            </div>
            <div>
              <span className="text-slate-400">Absent:</span>{' '}
              <strong className="text-rose-400 font-bold">{absentCount}</strong>
            </div>
            <div>
              <span className="text-slate-400">Session Attendance Rate:</span>{' '}
              <strong className="text-electric-cyan font-bold">{currentBatchRate}%</strong>
            </div>
          </div>

          {Number(currentBatchRate) < 75 && (
            <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Below Institute 75% Threshold</span>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Sheet Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 uppercase text-[11px] text-slate-400 border-b border-white/10">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Student ID</th>
                <th className="p-4">Overall Attendance %</th>
                <th className="p-4">Session Status</th>
                <th className="p-4">Educator Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No scholars enrolled in this batch.
                  </td>
                </tr>
              ) : (
                students.map(student => {
                  const currentStatus = attendanceMap[student.id] || 'PRESENT';
                  return (
                    <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-white">{student.fullName}</td>
                      <td className="p-4 font-mono text-slate-400">{student.studentCode}</td>
                      <td className="p-4">
                        <span
                          className={`font-semibold ${
                            (student.attendancePercentage || 0) < 75
                              ? 'text-rose-400 font-bold'
                              : 'text-slate-200'
                          }`}
                        >
                          {student.attendancePercentage}%
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'PRESENT')}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                              currentStatus === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'ABSENT')}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                              currentStatus === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'LATE')}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                              currentStatus === 'LATE'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'EXCUSED')}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                              currentStatus === 'EXCUSED'
                                ? 'bg-cyan-600 text-white shadow-sm'
                                : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                          >
                            Excused
                          </button>
                        </div>
                      </td>

                      <td className="p-4">
                        <input
                          type="text"
                          placeholder="Optional remark..."
                          value={remarksMap[student.id] || ''}
                          onChange={e =>
                            setRemarksMap({ ...remarksMap, [student.id]: e.target.value })
                          }
                          className="bg-slate-900 border border-white/5 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 w-48"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
