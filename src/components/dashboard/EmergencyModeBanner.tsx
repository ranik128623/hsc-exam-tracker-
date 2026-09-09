import React from 'react';
import { useApp } from '../../context/AppContext';
import { getExamTargetMs, calculateCountdown } from '../../utils/timeUtils';
import { AlertTriangle, Flame, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';

export function EmergencyModeBanner() {
  const {
    examConfig,
    settings,
    updateSettings,
    subjects,
    mockTests,
    setActiveTab,
    setFocusTimerModalOpen,
  } = useApp();

  const targetMs = getExamTargetMs(examConfig);
  const countdown = calculateCountdown(targetMs);

  const isEmergencyTime = countdown.days <= 7;
  const isEmergencyActive = settings.emergencyModeActive || isEmergencyTime;

  if (!isEmergencyActive) return null;

  // Urgent unfinished chapters
  const urgentUnfinishedChapters: { name: string; subjectName: string }[] = [];
  subjects.forEach((s) => {
    (s.chapters || []).forEach((c) => {
      if (!c.completed && urgentUnfinishedChapters.length < 4) {
        urgentUnfinishedChapters.push({ name: c.name, subjectName: s.name });
      }
    });
  });

  // Chapters due for revision (completed but rev1 or rev2 not completed)
  const chaptersDueForRevision: { name: string; subjectName: string; stage: string }[] = [];
  subjects.forEach((s) => {
    (s.chapters || []).forEach((c) => {
      if (c.completed && (!c.rev1 || !c.rev2) && chaptersDueForRevision.length < 4) {
        chaptersDueForRevision.push({
          name: c.name,
          subjectName: s.name,
          stage: !c.rev1 ? 'Rev 1' : 'Rev 2',
        });
      }
    });
  });

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950 via-slate-900 to-rose-950 text-white p-6 sm:p-7 shadow-xl border-2 border-rose-600/80 animate-fade-in">
      {/* Glow pulse */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black shadow-md animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg sm:text-xl text-rose-200">
                  EXAM EMERGENCY MODE ACTIVE
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black uppercase bg-rose-600 text-white">
                  {countdown.days} Days Left
                </span>
              </div>
              <p className="text-xs text-rose-300/80">
                Final preparation protocol — Halt new topics, focus strictly on high-yield recall!
              </p>
            </div>
          </div>

          <button
            onClick={() => updateSettings({ emergencyModeActive: !settings.emergencyModeActive })}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-rose-200 transition-colors self-start sm:self-auto"
          >
            {settings.emergencyModeActive && !isEmergencyTime ? 'Exit Emergency Mode' : 'Emergency Options'}
          </button>
        </div>

        {/* 3 Critical Triage Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Urgent Unfinished Chapters */}
          <div className="p-4 rounded-2xl bg-white/5 border border-rose-700/40 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              High-Priority Chapters Left
            </span>
            {urgentUnfinishedChapters.length === 0 ? (
              <p className="text-xs text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All chapters finished!
              </p>
            ) : (
              <ul className="space-y-1.5 text-xs">
                {urgentUnfinishedChapters.map((chap, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-slate-200">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>
                      <strong className="text-white">{chap.subjectName}:</strong> {chap.name}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Revision Due Immediately */}
          <div className="p-4 rounded-2xl bg-white/5 border border-amber-700/40 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Revision Due Immediately ({chaptersDueForRevision.length})
            </span>
            {chaptersDueForRevision.length === 0 ? (
              <p className="text-xs text-emerald-300">All revisions up to date!</p>
            ) : (
              <ul className="space-y-1.5 text-xs">
                {chaptersDueForRevision.slice(0, 3).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-slate-200">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>
                      <strong className="text-white">{item.subjectName}:</strong> {item.name} ({item.stage})
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recommended Emergency Protocol */}
          <div className="p-4 rounded-2xl bg-white/5 border border-purple-700/40 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
              Daily Emergency Protocol
            </span>
            <div className="space-y-1 text-xs text-slate-200">
              <p><strong className="text-purple-300">1. Morning:</strong> 2h high-yield formula & sheet drill</p>
              <p><strong className="text-purple-300">2. Afternoon:</strong> Timed CQ & Board paper questions</p>
              <p><strong className="text-purple-300">3. Evening:</strong> Active recall on past mistakes</p>
            </div>
          </div>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="text-xs text-rose-300/80">
            {mockTests.length} Mock Tests Logged • Target at least 2 full mock exams before D-Day!
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFocusTimerModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Launch Emergency Sprint</span>
            </button>
            <button
              onClick={() => setActiveTab('syllabus')}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              <span>Open Syllabus Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
