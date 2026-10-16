import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Download,
  Filter,
  Eye,
  Trash2,
  Mail,
  Phone,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../lib/api';
import { Student, Batch, Course } from '../types';
import { Button } from '../components/common/Button';
import { RiskBadge, Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { exportToCSV } from '../lib/utils';
import { formatPaiseToINR } from '../lib/feeCalculations';

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Add Student Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    fullName: '',
    email: '',
    phone: '',
    courseId: '',
    batchId: '',
    guardianName: '',
    guardianPhone: '',
    guardianRelationship: 'Father',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [studentsRes, batchesRes] = await Promise.all([
        api.getStudents({ search, batchId: selectedBatch, status: selectedStatus }),
        api.getBatches(),
      ]);
      setStudents(studentsRes.data);
      setBatches(batchesRes);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedBatch, selectedStatus]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createStudent({
        fullName: newStudent.fullName,
        email: newStudent.email,
        phone: newStudent.phone,
        courseId: newStudent.courseId || (batches[0]?.courseId || 'course-jee-adv'),
        batchId: newStudent.batchId || batches[0]?.id,
        guardian: newStudent.guardianName
          ? {
              id: `guard-${Date.now()}`,
              name: newStudent.guardianName,
              phone: newStudent.guardianPhone || '+91 98765 00000',
              relationship: newStudent.guardianRelationship,
            }
          : undefined,
        notes: newStudent.notes,
      });
      setIsAddModalOpen(false);
      setNewStudent({
        fullName: '',
        email: '',
        phone: '',
        courseId: '',
        batchId: '',
        guardianName: '',
        guardianPhone: '',
        guardianRelationship: 'Father',
        notes: '',
      });
      fetchData();
    } catch (err) {
      console.error('Failed to create student:', err);
    }
  };

  const handleArchive = async (id: string) => {
    if (confirm('Are you sure you want to archive this student record?')) {
      await api.archiveStudent(id);
      fetchData();
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Student Code',
      'Full Name',
      'Email',
      'Phone',
      'Batch',
      'Status',
      'Attendance %',
      'Latest Score %',
      'Risk Category',
      'Fee Balance (INR)',
    ];
    const rows = students.map(s => [
      s.studentCode,
      s.fullName,
      s.email,
      s.phone || '',
      s.batchName || '',
      s.status,
      s.attendancePercentage || 0,
      s.latestScore || 0,
      s.riskCategory || 'LOW',
      ((s.balanceFeePaise || 0) / 100).toFixed(2),
    ]);
    exportToCSV('Apex_Academy_Scholars_Registry', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
            Scholars & Student Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete management of academic profiles, attendance records, and fee allocations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Button
            variant="gradient"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Enroll New Scholar
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by student name, roll number, or email..."
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedBatch}
            onChange={e => setSelectedBatch(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Batches</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive / Archived</option>
            <option value="ALUMNI">Alumni</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 uppercase tracking-wider text-[11px] text-slate-400 border-b border-white/10">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Roll Code</th>
                <th className="p-4">Batch</th>
                <th className="p-4">Attendance</th>
                <th className="p-4">Recent Marks</th>
                <th className="p-4">Risk Profile</th>
                <th className="p-4">Fee Balance</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Loading student records...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No students found matching current filters.
                  </td>
                </tr>
              ) : (
                students.map(student => (
                  <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-600/30 border border-brand-500/30 flex items-center justify-center font-bold text-white text-xs shrink-0">
                          {student.fullName.charAt(0)}
                        </div>
                        <div>
                          <Link
                            to={`/students/${student.id}`}
                            className="font-bold text-white hover:text-electric-cyan transition-colors block"
                          >
                            {student.fullName}
                          </Link>
                          <span className="text-[11px] text-slate-400">{student.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono font-medium text-slate-300">
                      {student.studentCode}
                    </td>

                    <td className="p-4 font-medium text-slate-300">
                      {student.batchName || 'General'}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            (student.attendancePercentage || 0) < 75
                              ? 'text-rose-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {student.attendancePercentage}%
                        </span>
                        {(student.attendancePercentage || 0) < 75 && (
                          <span className="text-[10px] text-rose-400">Below 75%</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 font-bold text-white">
                      {student.latestScore !== undefined ? `${student.latestScore}%` : '—'}
                      {student.scoreChange !== undefined && student.scoreChange !== 0 && (
                        <span
                          className={`text-[10px] ml-1.5 ${
                            student.scoreChange > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          ({student.scoreChange > 0 ? `+${student.scoreChange}` : student.scoreChange}%)
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <RiskBadge
                        category={student.riskCategory || 'LOW'}
                        score={student.riskScore}
                      />
                    </td>

                    <td className="p-4 font-medium">
                      {(student.balanceFeePaise || 0) > 0 ? (
                        <span className="text-amber-400 font-bold">
                          {formatPaiseToINR(student.balanceFeePaise)}
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">Cleared</span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/students/${student.id}`}>
                          <button
                            title="View Full Profile"
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleArchive(student.id)}
                          title="Archive Student"
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Enroll New Scholar"
        subtitle="Provision academic record, assign batch, and initialize fee assignment"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Scholar Full Name</label>
            <input
              type="text"
              required
              value={newStudent.fullName}
              onChange={e => setNewStudent({ ...newStudent, fullName: e.target.value })}
              placeholder="e.g. Siddharth Varma"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={newStudent.email}
                onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                placeholder="siddharth@example.com"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Contact Phone</label>
              <input
                type="text"
                value={newStudent.phone}
                onChange={e => setNewStudent({ ...newStudent, phone: e.target.value })}
                placeholder="+91 98765 00000"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Batch</label>
            <select
              value={newStudent.batchId}
              onChange={e => setNewStudent({ ...newStudent, batchId: e.target.value })}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select Target Batch</option>
              {batches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 border-t border-white/10">
            <h4 className="text-xs font-bold text-slate-300 uppercase mb-2">Guardian Information</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Guardian Name</label>
                <input
                  type="text"
                  value={newStudent.guardianName}
                  onChange={e => setNewStudent({ ...newStudent, guardianName: e.target.value })}
                  placeholder="Parent Name"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Guardian Phone</label>
                <input
                  type="text"
                  value={newStudent.guardianPhone}
                  onChange={e => setNewStudent({ ...newStudent, guardianPhone: e.target.value })}
                  placeholder="+91 98765 00000"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" type="submit">
              Complete Enrollment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
