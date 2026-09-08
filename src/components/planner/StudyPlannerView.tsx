import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StudyTask, Priority } from '../../types';
import { getDhakaTodayDateString } from '../../utils/timeUtils';
import { DailyChecklistCard } from '../dashboard/DailyChecklistCard';
import {
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
  Calendar,
  BookOpen,
  Filter,
} from 'lucide-react';

export function StudyPlannerView() {
  const { tasks, addTask, toggleTask, deleteTask, subjects } = useApp();

  const [activeFilter, setActiveFilter] = useState<'today' | 'upcoming' | 'completed'>('today');
  const [showAddModal, setShowAddModal] = useState(false);

  // New task form fields
  const [taskName, setTaskName] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [taskDate, setTaskDate] = useState(getDhakaTodayDateString());
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [priority, setPriority] = useState<Priority>('high');

  const todayStr = getDhakaTodayDateString();

  // Filter tasks
  const todayTasks = tasks.filter((t) => !t.completed && t.date <= todayStr);
  const upcomingTasks = tasks.filter((t) => !t.completed && t.date > todayStr);
  const completedTasks = tasks.filter((t) => t.completed);

  const displayedTasks =
    activeFilter === 'today'
      ? todayTasks
      : activeFilter === 'upcoming'
      ? upcomingTasks
      : completedTasks;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    const sub = subjects.find((s) => s.id === subjectId) || subjects[0];

    addTask({
      name: taskName.trim(),
      subjectId: sub?.id,
      subjectName: sub?.name,
      date: taskDate || todayStr,
      estimatedMinutes,
      priority,
      completed: false,
    });

    setTaskName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
              🎯
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Daily Study Tasks & Habits
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Answer "What should I focus on today?" and prioritize key subjects
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Study Task</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Tasks List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveFilter('today')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeFilter === 'today'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Today ({todayTasks.length})
            </button>
            <button
              onClick={() => setActiveFilter('upcoming')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeFilter === 'upcoming'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Upcoming ({upcomingTasks.length})
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeFilter === 'completed'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Completed ({completedTasks.length})
            </button>
          </div>

          {/* List */}
          {displayedTasks.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-slate-400 text-sm">
              No tasks found in this section. Add one above!
            </div>
          ) : (
            <div className="space-y-2.5">
              {displayedTasks.map((t) => (
                <div
                  key={t.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    t.completed
                      ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800 text-slate-400'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white'
                  }`}
                >
                  <label className="flex items-center gap-3 text-xs sm:text-sm font-semibold cursor-pointer flex-1 select-none">
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => toggleTask(t.id)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 accent-emerald-600"
                    />
                    <span className={t.completed ? 'line-through text-slate-400' : ''}>
                      {t.name}
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    {t.subjectName && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {t.subjectName}
                      </span>
                    )}

                    <button
                      onClick={() => deleteTask(t.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Checklist & Habits (5 cols) */}
        <div className="lg:col-span-5">
          <DailyChecklistCard />
        </div>
      </div>

      {/* Modal to add task */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-black text-base text-slate-900 dark:text-white">
                New Study Task
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Task Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics: solve 5 circuit questions"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Subject
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
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
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
