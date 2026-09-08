import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckSquare, Plus, Trash2, Clock, AlertCircle } from 'lucide-react';

export function DailyTasksCard() {
  const { tasks, toggleTask, addTask, deleteTask, subjects } = useApp();
  const [taskName, setTaskName] = useState('');
  const [subjectId, setSubjectId] = useState(() => subjects[0]?.id || '');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('high');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    const sub = subjects.find((s) => s.id === subjectId) || subjects[0];
    addTask({
      name: taskName.trim(),
      subjectId: sub?.id || 'sub_bangla',
      subjectName: sub?.name || 'Bangla',
      date: new Date().toISOString().split('T')[0],
      estimatedMinutes: 45,
      priority,
      completed: false,
    });

    setTaskName('');
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div
      id="daily-tasks-card"
      className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-sm">
            🎯
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Priority Tasks & Reminders
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {completedCount} of {tasks.length} tasks completed
            </p>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {tasks.map((t) => (
          <div
            key={t.id}
            className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
              t.completed
                ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-400'
                : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
            }`}
          >
            <label className="flex items-center gap-2.5 text-xs sm:text-sm font-medium cursor-pointer flex-1 select-none">
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => toggleTask(t.id)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 accent-emerald-600"
              />
              <span className={t.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                {t.name}
              </span>
            </label>

            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                  t.priority === 'high'
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {t.priority}
              </span>

              <button
                onClick={() => deleteTask(t.id)}
                className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Form */}
      <form onSubmit={handleAdd} className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add priority task (e.g. Physics: galvanometer formulas)..."
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!taskName.trim()}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 disabled:opacity-40 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </form>
    </div>
  );
}
