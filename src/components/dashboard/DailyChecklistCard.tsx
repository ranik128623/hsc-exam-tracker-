import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckSquare, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export function DailyChecklistCard() {
  const { checklist, toggleChecklistItem, addChecklistItem, deleteChecklistItem } = useApp();
  const [newText, setNewText] = useState('');

  const completedCount = checklist.filter((i) => i.completed).length;
  const totalCount = checklist.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newText.trim()) {
      addChecklistItem(newText.trim());
      setNewText('');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Daily Study Checklist
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {completedCount} of {totalCount} completed ({percent}%)
            </p>
          </div>
        </div>

        {percent === 100 && totalCount > 0 && (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> All Done!
          </span>
        )}
      </div>

      {/* Progress mini-bar */}
      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-teal-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {checklist.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
              item.completed
                ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-400'
                : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
            }`}
          >
            <label className="flex items-center gap-2.5 text-xs sm:text-sm font-medium cursor-pointer flex-1 select-none">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleChecklistItem(item.id)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 accent-emerald-600"
              />
              <span className={item.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                {item.text}
              </span>
            </label>

            <button
              onClick={() => deleteChecklistItem(item.id)}
              className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
              title="Remove item"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add new item */}
      <form onSubmit={handleAdd} className="flex items-center gap-2 pt-1">
        <input
          type="text"
          placeholder="Add customized daily habit..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          disabled={!newText.trim()}
          className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 disabled:opacity-40 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </form>
    </div>
  );
}
