import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ArrowRight, Timer, CheckCircle2 } from 'lucide-react';

export function StudyNowCard() {
  const {
    smartRecommendation,
    setFocusTimerModalOpen,
    setActiveTab,
    updateTopic,
    applyTimerPreset,
    setTimerSubject,
  } = useApp();

  if (!smartRecommendation) return null;

  const handleStartFocus = () => {
    if (smartRecommendation.subjectId) {
      setTimerSubject(smartRecommendation.subjectId);
    }
    const mins = smartRecommendation.recommendedMinutes || 25;
    if (mins === 50) {
      applyTimerPreset('50-10');
    } else {
      applyTimerPreset('25-5');
    }
    setFocusTimerModalOpen(true);
  };

  const handleGoToSubject = () => {
    setActiveTab('syllabus');
  };

  const handleMarkTopicDone = () => {
    const targetId = smartRecommendation.chapterId || smartRecommendation.topicId;
    if (smartRecommendation.subjectId && targetId) {
      updateTopic(smartRecommendation.subjectId, targetId, {
        status: 'completed',
        firstRevision: true,
      });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-emerald-500/10 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-emerald-950/40 border border-indigo-200/80 dark:border-indigo-800/60 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left Info */}
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              What Should I Study Now?
            </span>
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
              Smart Engine Recommendation
            </span>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {smartRecommendation.subjectName}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {smartRecommendation.title}
            </h3>
          </div>

          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">Why now:</span>{' '}
            {smartRecommendation.reason}
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            id="btn-study-now-focus"
            onClick={handleStartFocus}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-transform active:scale-95"
          >
            <Timer className="w-4 h-4" />
            <span>Study This Now ({smartRecommendation.recommendedMinutes || 25}m)</span>
          </button>

          <button
            id="btn-study-now-view"
            onClick={handleGoToSubject}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs flex items-center gap-1.5"
          >
            <span>View Chapter</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-study-now-mark-done"
            onClick={handleMarkTopicDone}
            className="p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
            title="Mark as Completed"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
