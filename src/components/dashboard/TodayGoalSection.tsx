import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getDhakaTimeString,
  getDhakaTodayDateString,
  getExamTargetMs,
  calculateCountdown,
} from '../../utils/timeUtils';
import {
  Target,
  Clock,
  Timer,
  Plus,
  Minus,
  Edit2,
  Check,
  Calendar,
  Flame,
} from 'lucide-react';

export function TodayGoalSection() {
  const {
    settings,
    updateSettings,
    todayCompletedHours,
    logStudyHours,
    setFocusTimerModalOpen,
    examConfig,
    currentStreak,
  } = useApp();

  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(settings.dailyTargetHours || 6);
  const [quickAddHours, setQuickAddHours] = useState('');

  const dhakaTime = getDhakaTimeString();
  const todayKey = getDhakaTodayDateString();
  const targetMs = getExamTargetMs(examConfig);
  const countdown = calculateCountdown(targetMs);

  const targetHours = settings.dailyTargetHours || 6;
  const remainingHours = Math.max(0, Math.round((targetHours - todayCompletedHours) * 10) / 10);
  const percentCompleted = Math.min(100, Math.round((todayCompletedHours / targetHours) * 100));

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Math.max(1, Math.min(24, Number(targetInput) || 6));
    updateSettings({ dailyTargetHours: val });
    setIsEditingTarget(false);
  };

  const handleAddHours = (amount: number) => {
    const newTotal = Math.max(0, Math.round((todayCompletedHours + amount) * 10) / 10);
    logStudyHours(todayKey, newTotal);
  };

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const add = parseFloat(quickAddHours);
    if (!isNaN(add) && add > 0) {
      handleAddHours(add);
      setQuickAddHours('');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-6">
      {/* Top row: Date, day, days remaining badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Today's Goal & Study Progress
                {currentStreak > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    <Flame className="w-3 h-3 fill-amber-500" />
                    {currentStreak}d Streak
                  </span>
                )}
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Maintain daily consistency to master your pre-test examination
          </p>
        </div>

        {/* Date tags */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200/60 dark:border-slate-700/60">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{dhakaTime.day}</span>, <span>{dhakaTime.date}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800/60">
            {countdown.days} Days Remaining
          </div>
        </div>
      </div>

      {/* Target Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Today's Target Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 relative">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Today's Target</span>
            {!isEditingTarget ? (
              <button
                onClick={() => {
                  setTargetInput(targetHours);
                  setIsEditingTarget(true);
                }}
                className="p-1 hover:text-emerald-600 transition-colors"
                title="Edit Target Hours"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {!isEditingTarget ? (
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white">
                {targetHours}
              </span>
              <span className="text-xs font-bold text-slate-400">hours</span>
            </div>
          ) : (
            <form onSubmit={handleSaveTarget} className="mt-1 flex items-center gap-1">
              <input
                type="number"
                min={1}
                max={20}
                step={0.5}
                value={targetInput}
                onChange={(e) => setTargetInput(parseFloat(e.target.value) || 1)}
                className="w-16 px-2 py-0.5 text-sm font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                autoFocus
              />
              <button
                type="submit"
                className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
          <span className="text-[11px] text-slate-400">Daily study commitment</span>
        </div>

        {/* Study Hours Completed Today */}
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
          <div className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
            Completed Today
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {todayCompletedHours}
            </span>
            <span className="text-xs font-bold text-emerald-700/80 dark:text-emerald-400/80">
              hours ({percentCompleted}%)
            </span>
          </div>
          <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
            {todayCompletedHours >= targetHours ? 'Goal achieved! 🎉' : 'Keep pushing forward'}
          </span>
        </div>

        {/* Remaining Target */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Remaining Target
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {remainingHours}
            </span>
            <span className="text-xs font-bold text-slate-400">hours to go</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {remainingHours === 0 ? 'Target achieved for today!' : 'Break down into focus intervals'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
          <span>Daily Goal Completion</span>
          <span className="font-mono">{percentCompleted}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
            style={{ width: `${percentCompleted}%` }}
          />
        </div>
      </div>

      {/* Quick Hour Logging & Focus Timer Launch Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Quick Log Hours */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Quick Log:
          </span>
          <button
            onClick={() => handleAddHours(0.5)}
            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            +30m
          </button>
          <button
            onClick={() => handleAddHours(1)}
            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            +1 Hour
          </button>
          <button
            onClick={() => handleAddHours(2)}
            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            +2 Hours
          </button>
          {todayCompletedHours > 0 && (
            <button
              onClick={() => handleAddHours(-0.5)}
              className="px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 text-xs font-semibold text-slate-500 transition-colors"
              title="Deduct 30m"
            >
              <Minus className="w-3 h-3" />
            </button>
          )}

          {/* Custom quick input */}
          <form onSubmit={handleCustomAdd} className="flex items-center gap-1 ml-1">
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="12"
              placeholder="Hrs"
              value={quickAddHours}
              onChange={(e) => setQuickAddHours(e.target.value)}
              className="w-14 px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-mono"
            />
            <button
              type="submit"
              disabled={!quickAddHours}
              className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40"
              title="Add Custom Hours"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Start Focus Timer Button */}
        <button
          id="btn-start-focus-timer-card"
          onClick={() => setFocusTimerModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95"
        >
          <Timer className="w-4 h-4" />
          <span>Launch Pomodoro Timer</span>
        </button>
      </div>
    </div>
  );
}
