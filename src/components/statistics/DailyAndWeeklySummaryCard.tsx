import React from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, TrendingUp, Award, BarChart2, CheckCircle } from 'lucide-react';

export function DailyAndWeeklySummaryCard() {
  const {
    todayFocusHoursFormatted,
    yesterdayFocusHoursFormatted,
    thisWeekFocusHoursFormatted,
    thisMonthFocusHoursFormatted,
    totalFocusHoursFormatted,
    weeklySummary,
    settings,
  } = useApp();

  // Find highest minutes in the week to scale bar heights
  const maxMins = Math.max(...weeklySummary.days.map((d) => d.minutes), 60);

  return (
    <div
      id="daily-weekly-summary-section"
      className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6"
    >
      {/* 1. Daily Study Time (Requirement 5) */}
      <div>
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-sm">
              📅
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Daily & Period Study Records
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Auto-recorded from Focus Timer
          </span>
        </div>

        {/* 5 Prominent Numbers: Today, Yesterday, This Week, This Month, Total */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Today
            </span>
            <div className="font-mono text-xl font-black text-sky-600 dark:text-sky-400 mt-1">
              {todayFocusHoursFormatted}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Yesterday
            </span>
            <div className="font-mono text-xl font-black text-slate-800 dark:text-slate-200 mt-1">
              {yesterdayFocusHoursFormatted}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              This Week
            </span>
            <div className="font-mono text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {thisWeekFocusHoursFormatted}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              This Month
            </span>
            <div className="font-mono text-xl font-black text-teal-600 dark:text-teal-400 mt-1">
              {thisMonthFocusHoursFormatted}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              Total Logged
            </span>
            <div className="font-mono text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
              {totalFocusHoursFormatted}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Weekly Study Summary (Requirement 6) */}
      <div className="pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
              📊
            </div>
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
              Weekly Overview (Saturday – Friday)
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Weekly Total: </span>
              <strong className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                {weeklySummary.formattedTotal}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Daily Avg: </span>
              <strong className="font-mono font-black text-slate-800 dark:text-slate-200">
                {weeklySummary.formattedDailyAverage}
              </strong>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>Best: {weeklySummary.bestDay.dayName} ({weeklySummary.bestDay.formattedTime})</span>
            </div>
          </div>
        </div>

        {/* 7-Day Visual Bar Grid (Saturday through Friday) */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end pt-4 pb-2">
          {weeklySummary.days.map((day) => {
            const heightPercent = Math.max(10, Math.round((day.minutes / maxMins) * 100));
            const isBest = day.dayName === weeklySummary.bestDay.dayName && day.minutes > 0;
            return (
              <div key={day.dateKey} className="flex flex-col items-center gap-2 group">
                <span className="font-mono text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 transition-colors">
                  {day.formattedTime}
                </span>

                <div className="w-full h-28 sm:h-32 bg-slate-100 dark:bg-slate-800/80 rounded-xl flex flex-col justify-end p-1 overflow-hidden">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-lg transition-all duration-500 ${
                      day.isToday
                        ? 'bg-gradient-to-t from-sky-600 to-sky-400 shadow-sm'
                        : isBest
                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-sm'
                        : 'bg-gradient-to-t from-indigo-500 to-indigo-400'
                    }`}
                  />
                </div>

                <div className="text-center">
                  <span
                    className={`text-[11px] sm:text-xs font-bold block ${
                      day.isToday
                        ? 'text-sky-600 dark:text-sky-400 font-black'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {day.shortName}
                  </span>
                  {day.isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mx-auto mt-0.5 block" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
