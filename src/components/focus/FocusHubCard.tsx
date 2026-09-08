import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { playChimeSound } from '../../utils/audioAndQuotes';
import { getDhakaTimeString, getDhakaTodayDateString } from '../../utils/timeUtils';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  Clock,
  BookOpen,
  ArrowRight,
  Flame,
  Check,
} from 'lucide-react';

interface FocusHubCardProps {
  isFullScreenView?: boolean;
}

export function FocusHubCard({ isFullScreenView = false }: FocusHubCardProps) {
  const {
    subjects,
    totalFocusHoursLongFormatted,
    totalFocusHoursFormatted,
    addFocusSession,
    settings,
    updateSettings,
    triggerNotification,
    setActiveTab,
  } = useApp();

  type Mode = 'study' | 'break';

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    return subjects.length > 0 ? subjects[0].id : '';
  });
  const [preset, setPreset] = useState<'25-5' | '50-10' | '60-10' | 'custom'>('25-5');
  const [studyMinutes, setStudyMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [customInputMinutes, setCustomInputMinutes] = useState('45');
  const [mode, setMode] = useState<Mode>('study');
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [completionAlert, setCompletionAlert] = useState<{
    open: boolean;
    subjectName: string;
    minutes: number;
  }>({ open: false, subjectName: '', minutes: 0 });

  const timerRef = useRef<number | null>(null);

  // If subjects list changes, ensure a valid selection
  useEffect(() => {
    if (subjects.length > 0 && !subjects.some((s) => s.id === selectedSubjectId)) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0] || {
    id: 'sub_bangla',
    name: 'Bangla',
    color: 'emerald',
  };

  // Switch preset
  const handlePresetSelect = (type: '25-5' | '50-10' | '60-10' | 'custom', customVal?: number) => {
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
      s = customVal || parseInt(customInputMinutes, 10) || 30;
      b = 5;
    }

    setStudyMinutes(s);
    setBreakMinutes(b);
    setMode('study');
    setSecondsRemaining(s * 60);
  };

  // Timer interval countdown loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleCompleteSession(studyMinutes);
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
  }, [isRunning, mode, studyMinutes, breakMinutes, selectedSubjectId, activeSubject]);

  const handleCompleteSession = (completedMins: number) => {
    setIsRunning(false);

    if (mode === 'study') {
      if (settings.soundEnabled) {
        playChimeSound('study_done');
      }

      const today = getDhakaTodayDateString();
      const timeInfo = getDhakaTimeString();

      // Automatically add the completed session
      addFocusSession({
        subjectId: activeSubject.id,
        subjectName: activeSubject.name,
        durationMinutes: completedMins,
        dateKey: today,
        timeStr: timeInfo.time,
        notes: sessionNotes.trim() || `${preset} focused session`,
        presetUsed: preset,
      });

      triggerNotification(
        'Focus Session Completed! 🎉',
        `Logged ${completedMins}m for ${activeSubject.name}. Time for a well-deserved break!`
      );

      setCompletionAlert({
        open: true,
        subjectName: activeSubject.name,
        minutes: completedMins,
      });

      setSessionNotes('');
      // Switch to break mode
      setMode('break');
      setSecondsRemaining(breakMinutes * 60);
    } else {
      if (settings.soundEnabled) {
        playChimeSound('break_done');
      }
      triggerNotification('Break Finished! 🔔', 'Ready to begin your next focused study session?');
      setMode('study');
      setSecondsRemaining(studyMinutes * 60);
    }
  };

  const handleTogglePlay = () => {
    if (!isRunning && settings.soundEnabled) {
      playChimeSound('timer_start');
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsRemaining((mode === 'study' ? studyMinutes : breakMinutes) * 60);
  };

  // Allow user to finish session early and save time studied so far
  const handleSavePartialSession = () => {
    const totalCurrentSec = (mode === 'study' ? studyMinutes : breakMinutes) * 60;
    const elapsedSeconds = totalCurrentSec - secondsRemaining;
    const elapsedMinutes = Math.round(elapsedSeconds / 60);

    if (elapsedMinutes >= 1 && mode === 'study') {
      handleCompleteSession(elapsedMinutes);
    } else {
      handleReset();
    }
  };

  const currentTotalSeconds = (mode === 'study' ? studyMinutes : breakMinutes) * 60;
  const progressPercent =
    currentTotalSeconds > 0
      ? Math.min(100, Math.max(0, ((currentTotalSeconds - secondsRemaining) / currentTotalSeconds) * 100))
      : 0;

  const minutesDisplay = Math.floor(secondsRemaining / 60);
  const secondsDisplay = secondsRemaining % 60;
  const formattedTime = `${String(minutesDisplay).padStart(2, '0')}:${String(secondsDisplay).padStart(2, '0')}`;

  // Subject color mapping
  const getSubjectColorClasses = (color: string, isSelected: boolean) => {
    switch (color) {
      case 'emerald':
        return isSelected
          ? 'bg-emerald-600 text-white shadow-xs border-emerald-600'
          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100';
      case 'sky':
        return isSelected
          ? 'bg-sky-600 text-white shadow-xs border-sky-600'
          : 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800 hover:bg-sky-100';
      case 'indigo':
        return isSelected
          ? 'bg-indigo-600 text-white shadow-xs border-indigo-600'
          : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100';
      case 'amber':
        return isSelected
          ? 'bg-amber-600 text-white shadow-xs border-amber-600'
          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100';
      case 'rose':
        return isSelected
          ? 'bg-rose-600 text-white shadow-xs border-rose-600'
          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100';
      case 'teal':
        return isSelected
          ? 'bg-teal-600 text-white shadow-xs border-teal-600'
          : 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 hover:bg-teal-100';
      case 'cyan':
        return isSelected
          ? 'bg-cyan-600 text-white shadow-xs border-cyan-600'
          : 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100';
      default:
        return isSelected
          ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-xs border-slate-700'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200';
    }
  };

  return (
    <div
      id="focus-section"
      className={`relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden transition-all ${
        isFullScreenView ? 'p-6 sm:p-10' : 'p-5 sm:p-8'
      }`}
    >
      {/* Top Prominent Banner: Total Focused Study Time (Requirement 2) */}
      <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/50 dark:via-slate-900 dark:to-teal-950/40 border border-emerald-200/70 dark:border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
            ⏱️
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Total Focused Study Time
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                All Subjects
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {totalFocusHoursLongFormatted}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('history')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-white/80 dark:bg-slate-800/80 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100/70 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <span>View Session Logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`p-2 rounded-xl border transition-colors ${
              settings.soundEnabled
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
            title={settings.soundEnabled ? 'Chimes are enabled' : 'Chimes are muted'}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Subject Selection (Requirement 1) */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Select What You Are Studying:</span>
          </label>
          <button
            onClick={() => setActiveTab('settings')}
            className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Edit Subjects in Settings
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {subjects.map((subj) => {
            const isSelected = subj.id === selectedSubjectId;
            return (
              <button
                key={subj.id}
                id={`focus-subject-${subj.id}`}
                onClick={() => {
                  if (!isRunning) setSelectedSubjectId(subj.id);
                }}
                disabled={isRunning}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  isRunning ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer active:scale-95'
                } ${getSubjectColorClasses(subj.color, isSelected)}`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                <span>{subj.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset Selector & Mode Badge (Requirement 12) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handlePresetSelect('25-5')}
            disabled={isRunning}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              preset === '25-5'
                ? 'bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            25/5 Pomodoro
          </button>
          <button
            onClick={() => handlePresetSelect('50-10')}
            disabled={isRunning}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              preset === '50-10'
                ? 'bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            50/10 Deep Work
          </button>
          <button
            onClick={() => handlePresetSelect('60-10')}
            disabled={isRunning}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              preset === '60-10'
                ? 'bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            60/10 Hour Sprint
          </button>

          {/* Custom Duration */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500">Custom:</span>
            <input
              type="number"
              min="5"
              max="180"
              disabled={isRunning}
              value={customInputMinutes}
              onChange={(e) => {
                setCustomInputMinutes(e.target.value);
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val > 0) {
                  handlePresetSelect('custom', val);
                }
              }}
              className="w-12 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-center text-slate-800 dark:text-slate-200"
            />
            <span className="text-[11px] text-slate-400">min</span>
          </div>
        </div>

        {/* Current Timer Phase */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 ${
              mode === 'study'
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-current animate-ping' : 'bg-current'}`} />
            {mode === 'study' ? 'Focused Study Session' : 'Rest & Break Period'}
          </span>
        </div>
      </div>

      {/* Big Digital Display & Radial Progress */}
      <div className="py-8 flex flex-col items-center justify-center text-center">
        <div className="relative flex items-center justify-center mb-6">
          {/* Circular SVG Ring */}
          <svg className="w-64 h-64 sm:w-72 sm:h-72 transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              className={`transition-all duration-700 ease-out ${
                mode === 'study' ? 'stroke-emerald-500' : 'stroke-sky-500'
              }`}
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 115}
              strokeDashoffset={(2 * Math.PI * 115 * (100 - progressPercent)) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Time text inside ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-1">
              {activeSubject.name}
            </span>
            <div className="font-mono text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
              {formattedTime}
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              {isRunning ? '⏱️ Running' : '⏸️ Ready'}
            </span>
          </div>
        </div>

        {/* Optional Topic/Session Notes */}
        <div className="w-full max-w-sm mb-6">
          <input
            type="text"
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Focus goal / Chapter topic (optional)..."
            disabled={isRunning}
            className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center"
          />
        </div>

        {/* Timer Control Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            id="focus-btn-toggle"
            onClick={handleTogglePlay}
            className={`px-8 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center gap-2 active:scale-95 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Studying</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="px-4 py-3.5 rounded-2xl font-semibold text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            title="Reset to beginning"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          {/* Finish & Save Minutes Studied so far */}
          {isRunning && mode === 'study' && (
            <button
              onClick={handleSavePartialSession}
              className="px-4 py-3.5 rounded-2xl font-semibold text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
              title="Stop timer early and save the completed minutes"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finish & Save Time</span>
            </button>
          )}
        </div>
      </div>

      {/* Completion Dialog / Alert */}
      {completionAlert.open && (
        <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🎉</span>
            <div className="text-xs">
              <span className="font-bold block">
                Session Completed! +{completionAlert.minutes} Minutes Logged
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                Added to {completionAlert.subjectName}, total study time, and daily goal.
              </span>
            </div>
          </div>
          <button
            onClick={() => setCompletionAlert({ open: false, subjectName: '', minutes: 0 })}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
