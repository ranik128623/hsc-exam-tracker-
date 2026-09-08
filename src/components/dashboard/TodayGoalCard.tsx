import React from 'react';
import { useApp } from '../../context/AppContext';
import { Target, CheckCircle2, Sparkles, Trophy, ArrowUpRight } from 'lucide-react';

export function TodayGoalCard() {
  const {
    dailyGoalStatus,
    todayFocusHoursFormatted,
    settings,
    setFocusTimerModalOpen,
    setActiveTab,
  } = useApp();

  const isCompleted = dailyGoalStatus.isCompleted;

  return (
    <div
      id="today-goal-section"
      className={`p-6 rounded-3xl border shadow-sm transition-all ${
        isCompleted
          ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border-emerald-300 dark:border-emerald-800'
          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base ${
              isCompleted
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
            }`}
          >
            {isCompleted ? <Trophy className="w-5 h-5" /> : <Target className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Daily Study Target
            </span>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Daily Goal: {settings.dailyTargetHours} Hours
            </h3>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-600 text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              🎉 Daily Goal Completed!
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              In Progress ({dailyGoalStatus.percentage}%)
            </span>
          )}
        </div>
      </div>

      {/* Progress Numbers (e.g. 4h 20m / 6h) */}
      <div className="space-y-2 mb-4">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {todayFocusHoursFormatted}
            </span>
            <span className="text-sm font-bold text-slate-400">/ {settings.dailyTargetHours}h</span>
          </div>

          <span className="font-mono text-sm font-extrabold text-slate-600 dark:text-slate-300">
            {dailyGoalStatus.percentage}% Completed
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="h-3.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isCompleted
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm'
                : 'bg-gradient-to-r from-sky-500 to-indigo-500'
            }`}
            style={{ width: `${dailyGoalStatus.percentage}%` }}
          />
        </div>
      </div>

      {/* Footer Motivation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-500">
        <p>
          {isCompleted ? (
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
              Great discipline! Every extra minute builds exam confidence.
            </span>
          ) : (
            <span>
              Remaining today:{' '}
              <strong className="text-slate-700 dark:text-slate-300 font-mono">
                {Math.max(
                  0,
                  Math.round(((dailyGoalStatus.targetMinutes - dailyGoalStatus.completedMinutes) / 60) * 10) / 10
                )}
                h
              </strong>{' '}
              to reach your goal.
            </span>
          )}
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFocusTimerModalOpen(true)}
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Start Session</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
