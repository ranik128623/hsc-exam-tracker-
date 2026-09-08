import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { playChimeSound } from '../../utils/audioAndQuotes';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import {
  Settings,
  Calendar,
  Clock,
  BookOpen,
  Volume2,
  Moon,
  Sun,
  RotateCcw,
  Check,
  Plus,
  Trash2,
  Edit2,
  Flame,
  Target,
  Percent,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export function SettingsView() {
  const {
    examConfig,
    setExamConfig,
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    addChapter,
    deleteChapter,
    settings,
    updateSettings,
    resetToDefaults,
    manualPreparationPercentage,
    setManualPreparationPercentage,
  } = useApp();

  // Exam state
  const [examDate, setExamDate] = useState(examConfig.examDate);
  const [examTime, setExamTime] = useState(examConfig.examTime || '08:00');
  const [examTitle, setExamTitle] = useState(examConfig.title || 'HSC Pre-Test Examination');

  // Study goal state
  const [dailyTargetHours, setDailyTargetHours] = useState(settings.dailyTargetHours || 6);
  const [streakThresholdHours, setStreakThresholdHours] = useState(
    settings.streakThresholdHours || 1.0
  );
  const [prepPercent, setPrepPercent] = useState(manualPreparationPercentage);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled ?? true);
  const [theme, setTheme] = useState<'light' | 'dark'>(settings.theme || 'light');

  // Subject management state
  const [newSubName, setNewSubName] = useState('');
  const [newSubColor, setNewSubColor] = useState('emerald');
  const [newSubTarget, setNewSubTarget] = useState('30');
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubName, setEditSubName] = useState('');
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  const [chapterInputs, setChapterInputs] = useState<{ [subId: string]: string }>({});

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    setExamConfig({
      ...examConfig,
      title: examTitle.trim() || 'HSC Pre-Test Examination',
      examDate,
      examTime,
      timezone: 'Asia/Dhaka',
    });

    updateSettings({
      dailyTargetHours: Number(dailyTargetHours) || 6,
      streakThresholdHours: Number(streakThresholdHours) || 1.0,
      soundEnabled,
      theme,
    });

    setManualPreparationPercentage(prepPercent);

    if (soundEnabled) {
      playChimeSound('timer_start');
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    addSubject(newSubName.trim(), newSubColor, parseInt(newSubTarget, 10) || 25);
    setNewSubName('');
  };

  const handleSaveSubjectEdit = (id: string) => {
    if (!editSubName.trim()) return;
    updateSubject(id, { name: editSubName.trim() });
    setEditingSubId(null);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-slate-500/10 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-lg">
            ⚙️
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Settings & Configuration
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Customize exam date, manage subjects, adjust daily targets, and streak parameters
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* 1. Exam Information (Requirement 1 & 2) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Exam Schedule & Bangladesh Standard Time (UTC+6)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Exam Title
              </label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Examination Date
              </label>
              <input
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Exam Start Time (BST)
              </label>
              <input
                type="time"
                required
                value={examTime}
                onChange={(e) => setExamTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* 2. Daily Goal & Streak Settings (Requirements 7, 9, 10) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Target className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Daily Study Targets & Streak Rules
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Daily Study Goal (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="18"
                step="0.5"
                value={dailyTargetHours}
                onChange={(e) => setDailyTargetHours(parseFloat(e.target.value) || 6)}
                className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default: 6 Hours/day</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Streak Minimum (Hours)
              </label>
              <input
                type="number"
                min="0.5"
                max="8"
                step="0.5"
                value={streakThresholdHours}
                onChange={(e) => setStreakThresholdHours(parseFloat(e.target.value) || 1.0)}
                className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Hours needed to keep streak</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Self-Assessed Prep (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={prepPercent}
                onChange={(e) => setPrepPercent(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">From your printed checklist</span>
            </div>
          </div>
        </div>

        {/* 3. Audio & Interface */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Volume2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Audio & Appearance
            </h3>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="soundToggle"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 accent-emerald-600"
              />
              <label htmlFor="soundToggle" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                Play Audio Chimes upon Session & Daily Goal Completion
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                  theme === 'light'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                  theme === 'dark'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Settings updated successfully!
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            Save Configuration
          </button>
        </div>
      </form>

      {/* 4. Subject List Management (Requirement 1: "Make the subject list editable from Settings.") */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Manage Examination Subjects
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {subjects.length} Subjects Configured
          </span>
        </div>

        {/* Existing Subjects List */}
        <div className="space-y-2">
          {subjects.map((subj) => {
            const isExpanded = expandedSubId === subj.id;
            const chapters = subj.chapters || [];
            const completedCount = chapters.filter((c) => c.completed).length;

            return (
              <div
                key={subj.id}
                className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 overflow-hidden"
              >
                <div className="p-3 flex items-center justify-between gap-3">
                  {editingSubId === subj.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editSubName}
                        onChange={(e) => setEditSubName(e.target.value)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex-1"
                      />
                      <button
                        onClick={() => handleSaveSubjectEdit(subj.id)}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingSubId(null)}
                        className="px-2 py-1 text-slate-400 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                          {subj.name}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                          {chapters.length} chapters ({completedCount} completed)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            setExpandedSubId(isExpanded ? null : subj.id)
                          }
                          className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700"
                          title="Manage Chapters"
                        >
                          <span>Chapters</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditingSubId(subj.id);
                            setEditSubName(subj.name);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                          title="Edit Name"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteSubject(subj.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                          title="Remove Subject"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Expanded Chapter Management */}
                {isExpanded && (
                  <div className="p-3 bg-white/70 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Chapters for {subj.name}:
                    </p>
                    {chapters.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No chapters defined.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                        {chapters.map((chap) => (
                          <div
                            key={chap.id}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                          >
                            <span
                              className={`truncate ${
                                chap.completed ? 'text-emerald-600 dark:text-emerald-400 line-through' : 'text-slate-700 dark:text-slate-200'
                              }`}
                            >
                              {chap.name}
                            </span>
                            <button
                              onClick={() => deleteChapter(subj.id, chap.id)}
                              className="text-slate-400 hover:text-rose-500 p-0.5"
                              title="Delete chapter"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Chapter to this Subject */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder={`Add new chapter to ${subj.name}...`}
                        value={chapterInputs[subj.id] || ''}
                        onChange={(e) =>
                          setChapterInputs((prev) => ({
                            ...prev,
                            [subj.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = chapterInputs[subj.id]?.trim();
                            if (val) {
                              addChapter(subj.id, val);
                              setChapterInputs((prev) => ({ ...prev, [subj.id]: '' }));
                            }
                          }
                        }}
                        className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = chapterInputs[subj.id]?.trim();
                          if (val) {
                            addChapter(subj.id, val);
                            setChapterInputs((prev) => ({ ...prev, [subj.id]: '' }));
                          }
                        }}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add new subject form */}
        <form onSubmit={handleAddSubject} className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder="Add subject (e.g. Higher Math, Bangla 2nd)..."
            value={newSubName}
            onChange={(e) => setNewSubName(e.target.value)}
            className="flex-1 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!newSubName.trim()}
            className="px-4 py-2 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* 5. Progressive Web App & iPad/iPhone Integration */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Progressive Web App (PWA) & Standalone Display
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Install on iPadOS, iOS, macOS, or Windows for instant launching, zero browser address bar, and offline persistence.
          </p>
        </div>

        <PWAInstallButton variant="card" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Display Mode
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Standalone / Fullscreen</span>
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Offline Storage
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>localStorage & Cache</span>
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Safe-Area Insets
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>iPad & iPhone Notch Ready</span>
            </p>
          </div>
        </div>
      </div>

      {/* 6. Reset to defaults */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Reset Data & Restore Sample Focus Sessions
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Restores the 127h 35m sample study data, Bangla, Physics, Chemistry, and default checklist.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (confirm('Reset back to sample study data and default subjects?')) {
              resetToDefaults();
            }
          }}
          className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>
    </div>
  );
}
