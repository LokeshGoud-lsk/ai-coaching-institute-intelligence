import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Award,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  BookOpen,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { api } from '../lib/api';
import { Student } from '../types';
import { RiskBadge } from '../components/common/Badge';

export const PerformancePage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.getStudents({ limit: 100 });
        setStudents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const subjectAverages = [
    { subject: 'Advanced Physics', average: 72.4, fullMark: 100 },
    { subject: 'Integral Calculus', average: 64.8, fullMark: 100 },
    { subject: 'Organic Chemistry', average: 76.5, fullMark: 100 },
    { subject: 'Medical Physiology', average: 84.2, fullMark: 100 },
    { subject: 'Physical Chemistry', average: 69.1, fullMark: 100 },
  ];

  const batchComparison = [
    { batch: 'JEE Adv 27 Batch A', Physics: 74, Maths: 71, Chemistry: 76 },
    { batch: 'JEE Adv 26 Batch B', Physics: 68, Maths: 62, Chemistry: 72 },
    { batch: 'NEET 26 Alpha', Physics: 79, Maths: 0, Chemistry: 82 },
    { batch: 'STEM Olympiad 26', Physics: 86, Maths: 88, Chemistry: 84 },
  ];

  const topGainers = students
    .filter(s => (s.scoreChange || 0) > 0)
    .sort((a, b) => (b.scoreChange || 0) - (a.scoreChange || 0))
    .slice(0, 4);

  const decliningScholars = students
    .filter(s => (s.scoreChange || 0) < 0)
    .sort((a, b) => (a.scoreChange || 0) - (b.scoreChange || 0))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
          Academic Performance Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Comparative subject averages, batch benchmarking, and scholar trajectory gain/decline indices
        </p>
      </div>

      {/* Top Trajectory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Award className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Top Academic Gainers</h3>
              <p className="text-xs text-slate-400">Positive score delta across consecutive tests</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {topGainers.map(s => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs"
              >
                <div>
                  <span className="font-bold text-white block">{s.fullName}</span>
                  <span className="text-slate-400 text-[11px]">{s.batchName}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400 flex items-center gap-1 justify-end">
                    <ArrowUpRight className="w-4 h-4" />
                    +{s.scoreChange}%
                  </span>
                  <span className="text-[10px] text-slate-400">Latest: {s.latestScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Declining Trajectories */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Academic Trajectory Drops
              </h3>
              <p className="text-xs text-slate-400">Flags requiring remedial doubt-clearing</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {decliningScholars.map(s => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs"
              >
                <div>
                  <span className="font-bold text-white block">{s.fullName}</span>
                  <span className="text-slate-400 text-[11px]">{s.batchName}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-rose-400 flex items-center gap-1 justify-end">
                    <ArrowDownRight className="w-4 h-4" />
                    {s.scoreChange}%
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Dropped to {s.latestScore}% (from {s.previousScore}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparative Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject-Wise Mastery Benchmark */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-electric-cyan" />
            Subject-Wise Class Average (%)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={subjectAverages}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} />
                <YAxis dataKey="subject" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                  formatter={(v: any) => [`${v}% Average`, 'Score']}
                />
                <Bar dataKey="average" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Batch Comparative Performance */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-electric-violet" />
            Batch Benchmark Across Disciplines (%)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={batchComparison}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="batch" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Physics" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Maths" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Chemistry" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
