import React, { useEffect, useState } from 'react';
import { Briefcase, Plus, Star, Mail, Phone, BookOpen, Award } from 'lucide-react';
import { api } from '../lib/api';
import { Faculty } from '../types';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

export const FacultyPage: React.FC = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Faculty Modal
  const [isAddFacultyOpen, setIsAddFacultyOpen] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialization: '',
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await api.getFaculty();
      setFaculty(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createFaculty(newFaculty);
      setIsAddFacultyOpen(false);
      setNewFaculty({ fullName: '', email: '', phone: '', specialization: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
            Faculty & Pedagogical Mentors
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Senior educators, subject matter chairs, student satisfaction ratings, and workload distribution
          </p>
        </div>

        <Button
          variant="gradient"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddFacultyOpen(true)}
        >
          Add Faculty Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {faculty.map(f => (
          <div key={f.id} className="glass-card p-5 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-brand-600/30 text-white font-bold text-sm border border-brand-500/30 flex items-center justify-center">
                  {f.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{f.studentRating || 4.9}</span>
                </div>
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-white text-base">{f.fullName}</h3>
                <span className="text-[11px] font-mono text-slate-400">{f.employeeCode}</span>
                <p className="text-xs text-electric-cyan font-medium mt-1">{f.specialization}</p>
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-white/5 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{f.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{f.phone || '+91 98860 00000'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Faculty Modal */}
      <Modal
        isOpen={isAddFacultyOpen}
        onClose={() => setIsAddFacultyOpen(false)}
        title="Add Faculty Mentor"
        subtitle="Register educator credentials and discipline specialization"
      >
        <form onSubmit={handleCreateFaculty} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Name & Title</label>
            <input
              type="text"
              required
              value={newFaculty.fullName}
              onChange={e => setNewFaculty({ ...newFaculty, fullName: e.target.value })}
              placeholder="e.g. Dr. Rajeshwari Subramaniam"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Official Email</label>
              <input
                type="email"
                required
                value={newFaculty.email}
                onChange={e => setNewFaculty({ ...newFaculty, email: e.target.value })}
                placeholder="faculty@apexacademy.edu.in"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                value={newFaculty.phone}
                onChange={e => setNewFaculty({ ...newFaculty, phone: e.target.value })}
                placeholder="+91 98860 00000"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Discipline Specialization</label>
            <input
              type="text"
              required
              value={newFaculty.specialization}
              onChange={e => setNewFaculty({ ...newFaculty, specialization: e.target.value })}
              placeholder="e.g. Quantum Physics, Optics & Waves"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="outline" type="button" onClick={() => setIsAddFacultyOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" type="submit">
              Register Faculty
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
