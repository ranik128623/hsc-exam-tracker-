import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateCountdown, getExamTargetMs } from '../../utils/timeUtils';
import { Flame, Clock } from 'lucide-react';

export function TimeIsRunningCard() {
  const { examConfig } = useApp();
  const [countdown, setCountdown] = useState(() => {
    const ms = getExamTargetMs(examConfig);
    return calculateCountdown(ms);
  });

  useEffect(() => {
    const ms = getExamTargetMs(examConfig);
    const interval = setInterval(() => {
      setCountdown(calculateCountdown(ms));
    }, 1000);
    return () => clearInterval(interval);
  }, [examConfig]);

  if (countdown.isExpired) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 shadow-lg border border-slate-800">
      {/* Background flare */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Headline */}
        <div className="space-y-1.5 max-w-sm">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <Flame className="w-3.5 h-3.5 fill-rose-400 text-rose-400 animate-pulse" />
            Time Is Running
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Remaining Preparation Clock
          </h3>
          <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            "Every second matters."
          </p>
        </div>

        {/* Right 4 Multi-Format Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Days */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {countdown.totalDays.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
              Days
            </div>
          </div>

          {/* Hours */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-tight">
              {countdown.totalHours.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
              Hours
            </div>
          </div>

          {/* Minutes */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-cyan-300 tracking-tight">
              {countdown.totalMinutes.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
              Minutes
            </div>
          </div>

          {/* Seconds */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md text-center">
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
              {countdown.totalSeconds.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 mt-0.5">
              Seconds
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
