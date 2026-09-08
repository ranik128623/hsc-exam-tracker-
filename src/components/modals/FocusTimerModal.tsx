import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { playChimeSound } from '../../utils/audioAndQuotes';
import { getDhakaTodayDateString } from '../../utils/timeUtils';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  BookOpen,
  Volume2,
} from 'lucide-react';

export function FocusTimerModal() {
  const {
    focusTimerModalOpen,
    setFocusTimerModalOpen,
    subjects,
    logStudyHours,
    todayCompletedHours,
    triggerNotification,
    addFocusSession,
  } = useApp();

  type Mode = 'study' | 'break';

  const [preset, setPreset] = useState<'25-5' | '50-10' | '60-10' | 'custom'>('25-5');
  const [studyMinutes, setStudyMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [mode, setMode] = useState<Mode>('study');
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [sessionCompletedDialog, setSessionCompletedDialog] = useState(false);
  const [lastCompletedMinutes, setLastCompletedMinutes] = useState(0);

  const timerRef = useRef<number | null>(null);

  // Set default subject if available
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  // Sync preset changes
  const applyPreset = (type: '25-5' | '50-10' | '60-10' | 'custom', sMin?: number, bMin?: number) => {
    setIsRunning(false);
    setPreset(type);
    let s = 25;
    let b = 5;
    if (type === '25-5') {
      s = 25;
      b = 5;
    } else if (type === '50-10') {
      s = 50;
      b = 10;
    } else if (type === '60-10') {
      s = 60;
      b = 10;
    } else if (type === 'custom') {
      s = sMin || studyMinutes;
      b = bMin || breakMinutes;
    }
    setStudyMinutes(s);
    setBreakMinutes(b);
    setMode('study');
    setSecondsRemaining(s * 60);
  };

  // Timer countdown loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, studyMinutes, breakMinutes]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (mode === 'study') {
      playChimeSound('study_done');
      triggerNotification('Focus Session Complete! 🎉', `Great work! Take a ${breakMinutes}-minute break to recharge.`);
      setCompletedSessionsCount((c) => c + 1);
      setLastCompletedMinutes(studyMinutes);
      setSessionCompletedDialog(true);
      // Auto switch to break
      setMode('break');
      setSecondsRemaining(breakMinutes * 60);
    } else {
      playChimeSound('break_done');
      triggerNotification('Break Finished! 🔔', 'Ready to begin your next focused study session?');
      setMode('study');
      setSecondsRemaining(studyMinutes * 60);
    }
  };

  const handleTogglePlay = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsRemaining((mode === 'study' ? studyMinutes : breakMinutes) * 60);
  };

  const handleSkipBreak = () => {
    setIsRunning(false);
    setMode('study');
    setSecondsRemaining(studyMinutes * 60);
  };

  const handleLogSessionHours = () => {
    const hoursEarned = Math.round((lastCompletedMinutes / 60) * 10) / 10;
    const today = getDhakaTodayDateString();
    const newTotal = todayCompletedHours + hoursEarned;
    const sub = subjects.find((s) => s.id === selectedSubjectId);
    if (sub) {
      addFocusSession(sub.id, lastCompletedMinutes, `Modal session: ${sub.name}`, preset);
    }
    logStudyHours(today, newTotal, undefined, `Focus timer: ${sub ? sub.name : 'General study'}`);
    setSessionCompletedDialog(false);
  };

  if (!focusTimerModalOpen) return null;

  const totalCurrentSeconds = (mode === 'study' ? studyMinutes : breakMinutes) * 60;
  const progressPercent = totalCurrentSeconds > 0 ? ((totalCurrentSeconds - secondsRemaining) / totalCurrentSeconds) * 100 : 0;
  const displayMinutes = Math.floor(secondsRemaining / 60);
  const displaySeconds = secondsRemaining % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              ⏱️
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Built-in Focus Timer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === 'study' ? 'Deep Study Session' : 'Recharge & Rest Period'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => playChimeSound('study_done')}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Test notification chime sound"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFocusTimerModalOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              id="preset-25-5"
              onClick={() => applyPreset('25-5')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                preset === '25-5'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              25m / 5m (Standard)
            </button>
            <button
              id="preset-50-10"
              onClick={() => applyPreset('50-10')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                preset === '50-10'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              50m / 10m (Deep Study)
            </button>
            <button
              id="preset-60-10"
              onClick={() => applyPreset('60-10')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                preset === '60-10'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              60m / 10m (Sprint)
            </button>
            <button
              id="preset-custom"
              onClick={() => applyPreset('custom')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                preset === 'custom'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Custom
            </button>
          </div>

          {/* Custom Duration Inputs */}
          {preset === 'custom' && (
            <div className="flex items-center justify-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Study (min):</span>
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={studyMinutes}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 25);
                    setStudyMinutes(val);
                    if (mode === 'study' && !isRunning) setSecondsRemaining(val * 60);
                  }}
                  className="w-16 px-2 py-1 text-center font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                />
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Break (min):</span>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={breakMinutes}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 5);
                    setBreakMinutes(val);
                    if (mode === 'break' && !isRunning) setSecondsRemaining(val * 60);
                  }}
                  className="w-16 px-2 py-1 text-center font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          )}

          {/* Circular Progress & Big Digital Timer */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-56 h-56 flex items-center justify-center">
              {/* SVG circular track */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="text-slate-100 dark:text-slate-800 stroke-current"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className={`${
                    mode === 'study'
                      ? 'text-emerald-500 dark:text-emerald-400'
                      : 'text-amber-500 dark:text-amber-400'
                  } stroke-current transition-all duration-300`}
                  strokeWidth="6"
                  strokeDasharray={276.46}
                  strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Digital Time Center Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`px-3 py-0.5 mb-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                    mode === 'study'
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {mode === 'study' ? 'Focusing' : 'Rest Break'}
                </span>
                <div className="font-mono text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {String(displayMinutes).padStart(2, '0')}:{String(displaySeconds).padStart(2, '0')}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {completedSessionsCount} sessions completed today
                </div>
              </div>
            </div>

            {/* Subject Selector for Session */}
            {subjects.length > 0 && (
              <div className="mt-4 flex items-center gap-2 text-xs">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500 dark:text-slate-400 font-medium">Studying:</span>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 text-xs"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Action Buttons: Start / Pause, Reset, Skip Break */}
          <div className="flex items-center justify-center gap-3">
            <button
              id="btn-timer-reset"
              onClick={handleReset}
              className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition-all"
              title="Reset Timer"
              aria-label="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              id="btn-timer-toggle"
              onClick={handleTogglePlay}
              className={`px-8 py-3.5 rounded-2xl font-bold text-white shadow-md flex items-center gap-2 text-base transition-all active:scale-95 ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                  <span>{secondsRemaining < totalCurrentSeconds ? 'Resume' : 'Start Focus'}</span>
                </>
              )}
            </button>

            {mode === 'break' && (
              <button
                id="btn-timer-skip-break"
                onClick={handleSkipBreak}
                className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition-all"
                title="Skip Break & Start Study"
                aria-label="Skip Break"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Dialog for session completion */}
        {sessionCompletedDialog && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/70 border-t border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-xs text-slate-700 dark:text-slate-300">
                <span className="font-bold text-emerald-800 dark:text-emerald-200">
                  {lastCompletedMinutes} minutes logged!
                </span>{' '}
                Add this time to today's study target?
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleLogSessionHours}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                + Add Hours
              </button>
              <button
                onClick={() => setSessionCompletedDialog(false)}
                className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
