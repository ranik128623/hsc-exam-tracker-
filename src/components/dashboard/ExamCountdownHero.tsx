import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  calculateCountdown,
  getExamTargetMs,
  formatDisplayDate,
  getWarningMode,
  getMilestoneAlert,
} from '../../utils/timeUtils';
import { Calendar, Edit3, Sparkles } from 'lucide-react';

export function ExamCountdownHero() {
  const { examConfig, setQuickEditExamModalOpen } = useApp();

  const [targetMs, setTargetMs] = useState(() => getExamTargetMs(examConfig));
  const [countdown, setCountdown] = useState(() => calculateCountdown(targetMs));

  useEffect(() => {
    const ms = getExamTargetMs(examConfig);
    setTargetMs(ms);
    setCountdown(calculateCountdown(ms));

    const interval = setInterval(() => {
      setCountdown(calculateCountdown(ms));
    }, 1000);

    return () => clearInterval(interval);
  }, [examConfig]);

  const warning = getWarningMode(countdown.days, countdown.isExpired);
  const milestone = getMilestoneAlert(countdown.days);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white shadow-xl border border-slate-800 p-6 sm:p-8 md:p-10">
      {/* Subtle radial glow decoration */}
      <div
        className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: warning.accentColor }}
      />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full blur-3xl bg-emerald-500/10 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
        {/* Top Badges: Phase & Warning Mode */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-white/10 text-emerald-300 border border-white/10 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            {warning.phaseName}
          </span>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border backdrop-blur-xs ${
              warning.isUrgent
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-ping"></span>
            {warning.name}
          </span>
        </div>

        {/* Large Motivational Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            "Your Pre-Test Is Coming.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">
              Make Every Second Count."
            </span>
          </h1>

          {/* Under it show: November 1, 2026 */}
          <div className="flex items-center justify-center gap-2 pt-1 text-slate-300">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-sm sm:text-base text-slate-200">
              {formatDisplayDate(examConfig.examDate)}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs sm:text-sm text-slate-400 font-mono">
              {examConfig.examTime || '08:00 AM'} BST (Asia/Dhaka UTC+6)
            </span>
            <button
              id="btn-edit-exam-hero"
              onClick={() => setQuickEditExamModalOpen(true)}
              className="ml-1 p-1 text-slate-400 hover:text-emerald-300 rounded-md transition-colors"
              title="Edit Exam Date or Time"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Countdown Display: Days : Hours : Minutes : Seconds */}
        <div className="w-full max-w-3xl pt-2">
          {countdown.isExpired ? (
            <div className="p-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xl">
              🎉 Examination In Progress / Exam Day! Stay calm and excel!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {/* Days */}
              <div className="flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-inner">
                <span className="font-mono text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white">
                  {String(countdown.days).padStart(2, '0')}
                </span>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 mt-1">
                  Days Remaining
                </span>
              </div>

              {/* Hours */}
              <div className="flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-inner">
                <span className="font-mono text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white">
                  {String(countdown.hours).padStart(2, '0')}
                </span>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 mt-1">
                  Hours Remaining
                </span>
              </div>

              {/* Minutes */}
              <div className="flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-inner">
                <span className="font-mono text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white">
                  {String(countdown.minutes).padStart(2, '0')}
                </span>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 mt-1">
                  Minutes Remaining
                </span>
              </div>

              {/* Seconds */}
              <div className="flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 backdrop-blur-md shadow-inner">
                <span className="font-mono text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-emerald-400">
                  {String(countdown.seconds).padStart(2, '0')}
                </span>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-300 mt-1">
                  Seconds Remaining
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Milestone Alert Banner */}
        {milestone && !countdown.isExpired && (
          <div className="w-full max-w-2xl p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-center justify-center gap-2.5 text-center shadow-xs">
            <span className="text-lg shrink-0">{milestone.icon}</span>
            <div>
              <strong className="font-bold text-amber-300">{milestone.title}</strong> —{' '}
              <span>{milestone.message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
