import React, { useEffect, useState } from 'react';
import { Layers3, Filter, RotateCw, Sparkles, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import { api } from '../lib/api';
import { VisualizationPoint3D, Batch, RiskCategory } from '../types';
import { PerformanceLandscape3D } from '../components/3d/PerformanceLandscape3D';
import { Button } from '../components/common/Button';

export const Visualizations3DPage: React.FC = () => {
  const [points, setPoints] = useState<VisualizationPoint3D[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [visRes, batchesRes] = await Promise.all([
        api.get3DVisualizations(),
        api.getBatches(),
      ]);
      setPoints(visRes.data);
      setBatches(batchesRes);
    } catch (err) {
      console.error('Failed to load 3D data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPoints = points.filter(p => {
    if (selectedBatch && p.batchName !== selectedBatch) return false;
    if (selectedCategory && p.riskCategory !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
              3D Performance Landscape & Risk Spectrum
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-electric-cyan/10 text-electric-cyan border border-electric-cyan/20 font-bold">
              WebGL
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explore multi-dimensional scholar clusters across Attendance % (X), Assessment Scores (Y), and Risk Index (Z)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RotateCw className="w-3.5 h-3.5" />}
            onClick={loadData}
          >
            Reload Spatial Coordinates
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <Filter className="w-3.5 h-3.5 text-brand-400" />
            <span>Filter Coordinates:</span>
          </div>

          <select
            value={selectedBatch}
            onChange={e => setSelectedBatch(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Batches</option>
            {batches.map(b => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Risk Tiers</option>
            <option value="HIGH">High Risk Only</option>
            <option value="MEDIUM">Medium Risk Only</option>
            <option value="LOW">Low Risk Only</option>
          </select>

          {(selectedBatch || selectedCategory) && (
            <button
              onClick={() => {
                setSelectedBatch('');
                setSelectedCategory('');
              }}
              className="text-xs text-electric-cyan hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="text-xs text-slate-400">
          Visualizing <strong className="text-white">{filteredPoints.length}</strong> of {points.length} Scholar Coordinates
        </div>
      </div>

      {/* 3D Canvas */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[450px] glass-card">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-electric-cyan/20 border-t-electric-cyan rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Rendering Three.js spatial landscape...</p>
          </div>
        </div>
      ) : (
        <PerformanceLandscape3D data={filteredPoints} height={520} />
      )}

      {/* Spatial Legend & Guidance Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl glass-card space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>High Altitude Nodes (Top Performers)</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Scholars positioned high on the Y-Axis with elevated Attendance (X) and near-zero Risk (Z).
          </p>
        </div>

        <div className="p-4 rounded-xl glass-card space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Mid-Tier Valley (Moderate Variance)</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Scholars exhibiting 70-75% attendance or slight score drops. Candidates for doubt-clearing sessions.
          </p>
        </div>

        <div className="p-4 rounded-xl glass-card space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
            <span>Ground-Level Risk Depression (Critical)</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Scholars with simultaneous attendance deficits & severe assessment decline. Immediate 1-on-1 intervention required.
          </p>
        </div>
      </div>
    </div>
  );
};
