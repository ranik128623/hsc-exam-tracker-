import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Hourglass,
  BookOpen,
  Target,
  Flame,
  BarChart3,
  CalendarDays,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export function TopDashboardStatCards() {
  const {
    preTestAnalysis,
    totalFocusHoursFormatted,
    todayFocusHoursFormatted,
    thisWeekFocusHoursFormatted,
    dailyGoalStatus,
    currentStreak,
    longestStreak,
    settings,
    setActiveTab,
    setFocusTimerModalOpen,
  } = useApp();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
      {/* 1. Days Left */}
      <div
        id="card-days-left"
        className="group relative p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all cursor-pointer flex flex-col justify-between"
        onClick={() => setActiveTab('analytics')}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Days Left</span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-base">
            ⏳
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {preTestAnalysis.daysRemaining}
            </span>
            <span className="text-xs font-semibold text-slate-500">Days</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            Until Pre-Test
          </p>
        </div>
      </div>

      {/* 2. Total Study Hours */}
      <div
        id="card-total-hours"
        className="group relative p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all cursor-pointer flex flex-col justify-between"
        onClick={() => setActiveTab('focus')}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Study Hours</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base">
            📚
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {totalFocusHoursFormatted}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            All focused sessions
          </p>
        </div>
      </div>

      {/* 3. Today's Study */}
      <div
        id="card-today-study"
        className="group relative p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all cursor-pointer flex flex-col justify-between"
        onClick={() => setFocusTimerModalOpen(true)}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Today's Study</span>
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-base">
            🎯
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400 tracking-tight">
              {todayFocusHoursFormatted}
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
            {dailyGoalStatus.isCompleted ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                🎉 Goal Hit!
              </span>
            ) : (
              <span>Target: {settings.dailyTargetHours}h</span>
            )}
          </p>
        </div>
      </div>

      {/* 4. Study Streak */}
      <div
        id="card-study-streak"
        className="group relative p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all cursor-pointer flex flex-col justify-between"
        onClick={() => setActiveTab('analytics')}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Study Streak</span>
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-base">
            🔥
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
              {currentStreak}
            </span>
            <span className="text-xs font-semibold text-slate-500">Days</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            🏆 Best: {longestStreak} Days
          </p>
        </div>
      </div>

      {/* 5. Weekly Study Hours */}
      <div
        id="card-weekly-hours"
        className="group relative p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all cursor-pointer flex flex-col justify-between"
        onClick={() => setActiveTab('analytics')}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Weekly Study Hours</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
            📊
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
              {thisWeekFocusHoursFormatted}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            This week's progress
          </p>
        </div>
      </div>

      {/* 6. Average Daily Hours */}
      <div
        id="card-average-daily"
        className="group relative p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all cursor-pointer flex flex-col justify-between"
        onClick={() => setActiveTab('analytics')}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Average Daily Hours</span>
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-base">
            📅
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400 tracking-tight">
              {preTestAnalysis.averageHoursPerDay}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            Consistent prep pace
          </p>
        </div>
      </div>
    </div>
  );
}
