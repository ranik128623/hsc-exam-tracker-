import React from 'react';
import { useApp } from '../../context/AppContext';
import { BookOpen, TrendingUp, Clock, PlusCircle } from 'lucide-react';

export function SubjectHoursCard() {
  const { subjectWiseStats, totalFocusHoursFormatted, totalFocusMinutes, setActiveTab } = useApp();

  // Find most & least studied subjects
  const sortedStats = [...subjectWiseStats].sort((a, b) => b.totalMinutes - a.totalMinutes);
  const mostStudied = sortedStats.find((s) => s.totalMinutes > 0);
  const leastStudied = [...sortedStats].reverse().find((s) => s.totalMinutes >= 0);

  const getSubjectColorStyles = (color: string) => {
    switch (color) {
      case 'emerald':
        return {
          bar: 'bg-emerald-500',
          badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        };
      case 'sky':
        return {
          bar: 'bg-sky-500',
          badge: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200 dark:border-sky-800',
        };
      case 'indigo':
        return {
          bar: 'bg-indigo-500',
          badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        };
      case 'amber':
        return {
          bar: 'bg-amber-500',
          badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        };
      case 'rose':
        return {
          bar: 'bg-rose-500',
          badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        };
      case 'teal':
        return {
          bar: 'bg-teal-500',
          badge: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border-teal-200 dark:border-teal-800',
        };
      case 'cyan':
        return {
          bar: 'bg-cyan-500',
          badge: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
        };
      default:
        return {
          bar: 'bg-slate-500',
          badge: 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        };
    }
  };

  return (
    <div
      id="subject-hours-section"
      className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              📚
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Subject-wise Study Hours
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automatically aggregated from your completed focus sessions
          </p>
        </div>

        {/* Total Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total Logged:
          </span>
          <span className="font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
            {totalFocusHoursFormatted}
          </span>
        </div>
      </div>

      {/* Answer to Question 3: Most & Least studied callout */}
      {mostStudied && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Most Studied Subject
              </span>
              <div className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                {mostStudied.subject.name}
              </div>
            </div>
            <span className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400">
              {mostStudied.formattedHours}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Needs More Focus
              </span>
              <div className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                {leastStudied?.subject.name || 'None'}
              </div>
            </div>
            <span className="font-mono font-black text-base text-amber-600 dark:text-amber-400">
              {leastStudied?.formattedHours || '0m'}
            </span>
          </div>
        </div>
      )}

      {/* Overall Distribution Bar */}
      {totalFocusMinutes > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>Overall Study Time Distribution</span>
            <span>100%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
            {subjectWiseStats.map((item) => {
              const styles = getSubjectColorStyles(item.subject.color);
              if (item.percentage <= 0) return null;
              return (
                <div
                  key={item.subject.id}
                  style={{ width: `${item.percentage}%` }}
                  title={`${item.subject.name}: ${item.formattedHours} (${item.percentage}%)`}
                  className={`h-full ${styles.bar} hover:opacity-80 transition-all`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Clean Subject Grid Cards (Requirement 3: Bangla — 12h 40m, etc.) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {subjectWiseStats.map((item) => {
          const styles = getSubjectColorStyles(item.subject.color);
          return (
            <div
              key={item.subject.id}
              className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {item.subject.name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${styles.badge}`}
                >
                  {item.percentage}%
                </span>
              </div>

              <div>
                <div className="font-mono text-xl font-black text-slate-800 dark:text-slate-100">
                  {item.formattedHours}
                </div>

                {/* Progress bar towards target hours if configured */}
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${styles.bar}`}
                    style={{
                      width: `${Math.min(
                        100,
                        item.subject.targetHours
                          ? Math.round((item.totalMinutes / (item.subject.targetHours * 60)) * 100)
                          : item.percentage * 2
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
