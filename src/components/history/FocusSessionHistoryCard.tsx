import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  History,
  Filter,
  Trash2,
  PlusCircle,
  Clock,
  Calendar,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import {
  getDhakaTodayDateString,
  getDhakaWeekDays,
  formatMinutesToHoursMinutes,
  getDhakaTimeString,
} from '../../utils/timeUtils';

export function FocusSessionHistoryCard() {
  const {
    focusSessions,
    subjects,
    deleteFocusSession,
    addFocusSession,
    totalFocusHoursFormatted,
  } = useApp();

  type TimeFilter = 'all' | 'today' | 'week' | 'month';

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Manual session entry form state
  const [manualSubjectId, setManualSubjectId] = useState(() => subjects[0]?.id || '');
  const [manualDurationMins, setManualDurationMins] = useState('45');
  const [manualDate, setManualDate] = useState(() => getDhakaTodayDateString());
  const [manualNotes, setManualNotes] = useState('');

  const todayStr = useMemo(() => getDhakaTodayDateString(), []);
  const currentMonthPrefix = useMemo(() => todayStr.substring(0, 7), [todayStr]);
  const weekDaySet = useMemo(() => {
    const days = getDhakaWeekDays(todayStr);
    return new Set(days.map((d) => d.dateKey));
  }, [todayStr]);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return focusSessions.filter((s) => {
      // Time filter
      if (timeFilter === 'today' && s.dateKey !== todayStr) return false;
      if (timeFilter === 'week' && !weekDaySet.has(s.dateKey)) return false;
      if (timeFilter === 'month' && !s.dateKey.startsWith(currentMonthPrefix)) return false;

      // Subject filter
      if (subjectFilter !== 'all' && s.subjectId !== subjectFilter) return false;

      return true;
    });
  }, [focusSessions, timeFilter, subjectFilter, todayStr, weekDaySet, currentMonthPrefix]);

  const filteredTotalMinutes = useMemo(() => {
    return filteredSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [filteredSessions]);

  const handleCreateManualSession = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = parseInt(manualDurationMins, 10);
    if (!duration || duration <= 0) return;

    const sub = subjects.find((s) => s.id === manualSubjectId) || subjects[0];
    const timeInfo = getDhakaTimeString();

    addFocusSession({
      subjectId: sub.id,
      subjectName: sub.name,
      durationMinutes: duration,
      dateKey: manualDate || todayStr,
      timeStr: timeInfo.time,
      notes: manualNotes.trim() || 'Offline textbook study log',
      presetUsed: 'custom',
    });

    setIsManualModalOpen(false);
    setManualNotes('');
  };

  const getSubjectColorBadge = (subjectName: string) => {
    const sub = subjects.find((s) => s.name === subjectName);
    const color = sub?.color || 'slate';
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'sky':
        return 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'amber':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'rose':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'teal':
        return 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      case 'cyan':
        return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div
      id="session-history-section"
      className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6"
    >
      {/* Header with Title & Log Study Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base">
            📋
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Focus Session History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Completed focus sessions with dates, times, subjects, and durations
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsManualModalOpen(true)}
          className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log Offline Session</span>
        </button>
      </div>

      {/* Filter Bar (Requirement 8: Today, This week, This month, All, and Subject) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800">
        {/* Time Period Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Time:</span>
          </span>
          {(['all', 'today', 'week', 'month'] as TimeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                timeFilter === f
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 border border-slate-200/70 dark:border-slate-700'
              }`}
            >
              {f === 'all'
                ? 'All Time'
                : f === 'today'
                ? 'Today'
                : f === 'week'
                ? 'This Week'
                : 'This Month'}
            </button>
          ))}
        </div>

        {/* Subject Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400">Subject:</span>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <span className="text-xs font-bold text-slate-500 ml-2">
            Total: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{formatMinutesToHoursMinutes(filteredTotalMinutes)}</strong>
          </span>
        </div>
      </div>

      {/* Session List Table / Cards (Requirement 8 Example: Today — 4:15 PM — Physics — 50 min) */}
      {filteredSessions.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          No focus sessions recorded matching your filter criteria.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSessions.slice(0, 50).map((sess) => {
            const isToday = sess.dateKey === todayStr;
            const displayDateLabel = isToday ? 'Today' : sess.dateKey;

            return (
              <div
                key={sess.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Left: Date, Time, Subject */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-mono text-xs shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {displayDateLabel}
                      </span>
                      <span className="text-slate-400 text-xs">•</span>
                      <span className="text-xs text-slate-500 font-mono">{sess.timeStr}</span>
                      <span className="text-slate-400 text-xs">•</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getSubjectColorBadge(
                          sess.subjectName
                        )}`}
                      >
                        {sess.subjectName}
                      </span>
                    </div>

                    {sess.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-md">
                        {sess.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Duration & Delete */}
                <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                  <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    {formatMinutesToHoursMinutes(sess.durationMinutes)}
                  </span>

                  <button
                    onClick={() => deleteFocusSession(sess.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete session record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Entry Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-black text-base text-slate-900 dark:text-white">
                Log Offline Study Session
              </h4>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualSession} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Subject
                </label>
                <select
                  value={manualSubjectId}
                  onChange={(e) => setManualSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="600"
                    required
                    value={manualDurationMins}
                    onChange={(e) => setManualDurationMins(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Notes / Chapters Studied (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Solved 10 questions from textbook..."
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Save Study Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
