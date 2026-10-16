import React, { useEffect, useState } from 'react';
import { Layers, Plus, Users, Calendar, MapPin, Briefcase } from 'lucide-react';
import { api } from '../lib/api';
import { Batch, Faculty, Course } from '../types';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

export const BatchesPage: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Batch Modal
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [newBatch, setNewBatch] = useState({
    name: '',
    code: '',
    courseId: 'course-jee-adv',
    leadFacultyId: '',
    startDate: new Date().toISOString().slice(0, 10),
    capacity: '40',
    scheduleInfo: 'Mon-Wed-Fri: 08:30 - 13:00 IST',
    room: 'Lecture Hall 103',
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [batchesRes, facultyRes] = await Promise.all([
        api.getBatches(),
        api.getFaculty(),
      ]);
      setBatches(batchesRes);
      setFaculty(facultyRes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBatch({
        name: newBatch.name,
        code: newBatch.code,
        courseId: newBatch.courseId,
        leadFacultyId: newBatch.leadFacultyId || faculty[0]?.id,
        startDate: newBatch.startDate,
        capacity: parseInt(newBatch.capacity),
        scheduleInfo: newBatch.scheduleInfo,
        room: newBatch.room,
      });
      setIsAddBatchOpen(false);
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
            Batches & Timetable Schedules
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Academic cohorts, room allocations, faculty leads, and enrollment capacities
          </p>
        </div>

        <Button
          variant="gradient"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddBatchOpen(true)}
        >
          Create Academic Batch
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {batches.map(batch => (
          <div key={batch.id} className="glass-card p-5 space-y-4">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">{batch.name}</h3>
                <span className="text-xs font-mono text-electric-cyan">{batch.code}</span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-semibold">
                {batch.enrolledCount || 0} / {batch.capacity} Enrolled
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Briefcase className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Course: {batch.courseName}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Users className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Lead Mentor: {batch.leadFacultyName || 'Assigned Dean'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Timings: {batch.scheduleInfo || 'Daily Sessions'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Venue: {batch.room || 'Main Complex'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Batch Modal */}
      <Modal
        isOpen={isAddBatchOpen}
        onClose={() => setIsAddBatchOpen(false)}
        title="Create Academic Batch"
        subtitle="Establish a new scholar cohort, assign lead faculty, and define lecture hall"
      >
        <form onSubmit={handleCreateBatch} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Batch Title</label>
            <input
              type="text"
              required
              value={newBatch.name}
              onChange={e => setNewBatch({ ...newBatch, name: e.target.value })}
              placeholder="e.g. JEE Adv 2027 Super-30 Batch B"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Batch Code</label>
              <input
                type="text"
                required
                value={newBatch.code}
                onChange={e => setNewBatch({ ...newBatch, code: e.target.value })}
                placeholder="JEE-27-B"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Capacity</label>
              <input
                type="number"
                required
                value={newBatch.capacity}
                onChange={e => setNewBatch({ ...newBatch, capacity: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Lead Faculty Mentor</label>
              <select
                value={newBatch.leadFacultyId}
                onChange={e => setNewBatch({ ...newBatch, leadFacultyId: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {faculty.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Room / Amphitheater</label>
              <input
                type="text"
                value={newBatch.room}
                onChange={e => setNewBatch({ ...newBatch, room: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="outline" type="button" onClick={() => setIsAddBatchOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" type="submit">
              Provision Batch
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
