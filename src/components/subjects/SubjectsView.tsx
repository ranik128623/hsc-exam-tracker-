import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubjectHoursCard } from './SubjectHoursCard';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Target,
  Sparkles,
  Info,
  ArrowRight,
  Check,
} from 'lucide-react';

export function SubjectsView() {
  const {
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    subjectWiseStats,
    totalFocusHoursFormatted,
    setFocusTimerModalOpen,
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

  // New subject form
  const [name, setName] = useState('');
  const [color, setColor] = useState('emerald');
  const [targetHours, setTargetHours] = useState('30');

  // Edit form
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('emerald');
  const [editTargetHours, setEditTargetHours] = useState('30');

  const colorOptions = [
    { label: 'Emerald', value: 'emerald', bg: 'bg-emerald-500' },
    { label: 'Sky', value: 'sky', bg: 'bg-sky-500' },
    { label: 'Indigo', value: 'indigo', bg: 'bg-indigo-500' },
    { label: 'Amber', value: 'amber', bg: 'bg-amber-500' },
    { label: 'Rose', value: 'rose', bg: 'bg-rose-500' },
    { label: 'Teal', value: 'teal', bg: 'bg-teal-500' },
    { label: 'Cyan', value: 'cyan', bg: 'bg-cyan-500' },
    { label: 'Slate', value: 'slate', bg: 'bg-slate-500' },
  ];

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addSubject(name.trim(), color, parseInt(targetHours, 10) || 20);
    setName('');
    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubjectId || !editName.trim()) return;
    updateSubject(editingSubjectId, {
      name: editName.trim(),
      color: editColor,
      targetHours: parseInt(editTargetHours, 10) || 20,
    });
    setEditingSubjectId(null);
  };

  const startEdit = (subj: { id: string; name: string; color: string; targetHours?: number }) => {
    setEditingSubjectId(subj.id);
    setEditName(subj.name);
    setEditColor(subj.color || 'emerald');
    setEditTargetHours(String(subj.targetHours || 30));
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
              📚
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Subject Study Hours & Allocation
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Manage your examination subjects and monitor focused hours per subject
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Subject</span>
        </button>
      </div>

      {/* Printed Sheet Reminder Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-base shrink-0">
          📝
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          <strong>Syllabus Note:</strong> As planned, chapter-wise checklists and detailed syllabus
          progress are maintained separately on your printed sheet. This section monitors your total
          study hours, subject balance, and target hours.
        </p>
      </div>

      {/* Central Visual Hours Card */}
      <SubjectHoursCard />

      {/* Detailed Subject Cards Grid with Target Hours & Edit Controls */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
          Manage Examination Subjects ({subjects.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subj) => {
            const stat = subjectWiseStats.find((s) => s.subject.id === subj.id);
            const target = subj.targetHours || 30;
            const completedMinutes = stat?.totalMinutes || 0;
            const completedHours = (completedMinutes / 60).toFixed(1);
            const percentOfTarget = Math.min(100, Math.round((completedMinutes / (target * 60)) * 100));

            return (
              <div
                key={subj.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-base text-slate-900 dark:text-white">
                      {subj.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => startEdit(subj)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteSubject(subj.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Time stats */}
                  <div className="flex items-baseline justify-between mt-3">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Studied
                      </span>
                      <span className="font-mono text-xl font-black text-emerald-600 dark:text-emerald-400">
                        {stat?.formattedHours || '0m'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Target
                      </span>
                      <span className="font-mono text-sm font-bold text-slate-600 dark:text-slate-400">
                        {target} Hours
                      </span>
                    </div>
                  </div>

                  {/* Target Progress Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span>Target Fulfillment</span>
                      <span>{percentOfTarget}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${percentOfTarget}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Launch timer for this subject */}
                <button
                  onClick={() => setFocusTimerModalOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-300 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-200/60 dark:border-slate-700/60"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Start Studying {subj.name}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-black text-base text-slate-900 dark:text-white">
                Add New Subject
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Higher Math 2nd Paper"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Preparation Target Hours
                </label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  required
                  value={targetHours}
                  onChange={(e) => setTargetHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Color Tag
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setColor(opt.value)}
                      className={`w-7 h-7 rounded-full ${opt.bg} flex items-center justify-center text-white text-xs ${
                        color === opt.value ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white' : ''
                      }`}
                    >
                      {color === opt.value && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {editingSubjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-black text-base text-slate-900 dark:text-white">
                Edit Subject
              </h4>
              <button
                onClick={() => setEditingSubjectId(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Preparation Target Hours
                </label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  required
                  value={editTargetHours}
                  onChange={(e) => setEditTargetHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Color Tag
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setEditColor(opt.value)}
                      className={`w-7 h-7 rounded-full ${opt.bg} flex items-center justify-center text-white text-xs ${
                        editColor === opt.value ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white' : ''
                      }`}
                    >
                      {editColor === opt.value && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSubjectId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
