import React from 'react';
import { useApp } from '../../context/AppContext';
import { calculatePrepProgress } from '../../utils/timeUtils';
import { Calendar, Clock, ArrowRight, Hourglass } from 'lucide-react';

export function PreparationProgressBar() {
  const { examConfig } = useApp();
  const prep = calculatePrepProgress(examConfig);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
              <Hourglass className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Preparation Period Timeline
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tracking time elapsed vs remaining for syllabus completion
          </p>
        </div>

        {/* Start and End dates tag */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{prep.startDateFormatted}</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{prep.examDateFormatted}</span>
        </div>
      </div>

      {/* Stats row & Circular gauge */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total days */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            Total Prep Days
          </span>
          <span className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white mt-0.5 block">
            {prep.totalDays}
          </span>
          <span className="text-[11px] text-slate-400">Total study runway</span>
        </div>

        {/* Days passed */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            Days Already Passed
          </span>
          <span className="text-2xl font-mono font-extrabold text-blue-600 dark:text-blue-400 mt-0.5 block">
            {prep.daysPassed}
          </span>
          <span className="text-[11px] text-slate-400">Time invested so far</span>
        </div>

        {/* Days remaining */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            Days Remaining
          </span>
          <span className="text-2xl font-mono font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 block">
            {prep.daysRemaining}
          </span>
          <span className="text-[11px] text-slate-400">Days to master syllabus</span>
        </div>

        {/* Completion % */}
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 block">
            Time Completed
          </span>
          <span className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            {prep.percentage}%
          </span>
          <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
            Of total prep period
          </span>
        </div>
      </div>

      {/* Big Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            Preparation Progress: {prep.percentage}%
          </span>
          <span className="text-slate-400 font-normal">
            {prep.daysPassed} of {prep.totalDays} days elapsed
          </span>
        </div>

        <div className="w-full h-4 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 transition-all duration-700 shadow-sm"
            style={{ width: `${prep.percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
