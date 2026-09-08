import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChapterRow } from './ChapterRow';
import {
  BookOpen,
  RotateCw,
  Target,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
} from 'lucide-react';

export const SyllabusProgressCard: React.FC = () => {
  const {
    overallSyllabusStat,
    subjectSyllabusStats,
    setActiveTab,
  } = useApp();

  // Active expanded subject for chapter checklist on dashboard
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    subjectSyllabusStats[0]?.subject.id || null
  );

  const selectedSubjectStat =
    subjectSyllabusStats.find((s) => s.subject.id === selectedSubjectId) ||
    subjectSyllabusStats[0];

  const { revision } = overallSyllabusStat;

  return (
    <div
      id="syllabus-progress-dashboard-card"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>My Subjects & Chapter Syllabus Tracker</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                Separated System
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Syllabus Completion & Revision Progress are tracked independently
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-open-full-syllabus-tracker"
          onClick={() => setActiveTab('syllabus')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <span>Open Full Syllabus Tracker</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SECTION 9: MAIN DASHBOARD SUMMARY CARDS (4 SEPARATE CARDS) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Dashboard Summary</span>
          </h3>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Never combined into a single percentage
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: 📚 Syllabus */}
          <div
            id="dash-card-syllabus"
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-emerald-200/80 dark:border-emerald-900/50 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>📚 Syllabus</span>
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Primary Metric
              </span>
            </div>
            <div className="mt-2.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {overallSyllabusStat.formattedPercentage}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Completed
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1">
                <strong>{overallSyllabusStat.completedChapters}</strong> / {overallSyllabusStat.totalChapters} chapters finished
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                {overallSyllabusStat.remainingChapters} chapters remaining
              </p>
            </div>
            <div className="mt-3 h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, overallSyllabusStat.percentage))}%` }}
              />
            </div>
          </div>

          {/* Card 2: 🔄 Revision 1 */}
          <div
            id="dash-card-rev1"
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-sky-200/80 dark:border-sky-900/50 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" />
                <span>🔄 Revision 1</span>
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                1st Pass
              </span>
            </div>
            <div className="mt-2.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {revision.rev1Formatted}
                </span>
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                  Done
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1">
                <strong>{revision.rev1Count}</strong> / {revision.totalFinishedChapters} Finished Chapters
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Applicable to finished chapters
              </p>
            </div>
            <div className="mt-3 h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, revision.rev1Percentage))}%` }}
              />
            </div>
          </div>

          {/* Card 3: 🔄 Revision 2 */}
          <div
            id="dash-card-rev2"
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-indigo-200/80 dark:border-indigo-900/50 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" />
                <span>🔄 Revision 2</span>
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                2nd Pass
              </span>
            </div>
            <div className="mt-2.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {revision.rev2Formatted}
                </span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  Done
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1">
                <strong>{revision.rev2Count}</strong> / {revision.totalFinishedChapters} Finished Chapters
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Deep revision check
              </p>
            </div>
            <div className="mt-3 h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, revision.rev2Percentage))}%` }}
              />
            </div>
          </div>

          {/* Card 4: 🎯 Final Revision */}
          <div
            id="dash-card-finalRev"
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-purple-200/80 dark:border-purple-900/50 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                <span>🎯 Final Revision</span>
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                Exam Ready
              </span>
            </div>
            <div className="mt-2.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {revision.finalRevFormatted}
                </span>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                  Done
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1">
                <strong>{revision.finalRevCount}</strong> / {revision.totalFinishedChapters} Finished Chapters
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Final exam polish
              </p>
            </div>
            <div className="mt-3 h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, revision.finalRevPercentage))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED SECTION 5 & 6: SEPARATED SYLLABUS vs REVISION BREAKDOWNS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Section 5: Overall Syllabus Progress */}
        <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>📚 Syllabus Completed</span>
              <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                {overallSyllabusStat.formattedPercentage}
              </span>
            </h4>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              {overallSyllabusStat.completedChapters} / {overallSyllabusStat.totalChapters} Chapters Finished
            </span>
          </div>

          <div className="h-3 w-full bg-emerald-100 dark:bg-emerald-950 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, overallSyllabusStat.percentage))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              {overallSyllabusStat.completedChapters} Finished
            </span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {overallSyllabusStat.remainingChapters} Chapters Remaining
            </span>
          </div>

          <div className="flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
            <Info className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Formula:</strong> Finished Chapters ({overallSyllabusStat.completedChapters}) ÷ Total Chapters ({overallSyllabusStat.totalChapters}) × 100.
              A chapter is considered 100% completed for syllabus as soon as you finish studying it once.
            </span>
          </div>
        </div>

        {/* Section 6: Overall Revision Progress */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>🔄 Revision Progress</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                (Based on {revision.totalFinishedChapters} Finished Chapters)
              </span>
            </h4>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span>CQ: {revision.cqCount}/{revision.totalFinishedChapters}</span>
              <span>•</span>
              <span>MCQ: {revision.mcqCount}/{revision.totalFinishedChapters}</span>
            </div>
          </div>

          {/* Mini 3 Progress Bars */}
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Revision 1</span>
                <span>{revision.rev1Count}/{revision.totalFinishedChapters} ({revision.rev1Formatted})</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, revision.rev1Percentage))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Revision 2</span>
                <span>{revision.rev2Count}/{revision.totalFinishedChapters} ({revision.rev2Formatted})</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, revision.rev2Percentage))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Final Revision</span>
                <span>{revision.finalRevCount}/{revision.totalFinishedChapters} ({revision.finalRevFormatted})</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, revision.finalRevPercentage))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <Info className="w-3.5 h-3.5 text-sky-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Only chapters marked "Chapter Finished" are included in the denominator for revision progress.
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3: SUBJECT CARDS WITH TWO SEPARATE PROGRESS INDICATORS */}
      <div className="pt-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Subject-Wise Progress (Two Separate Indicators)
          </h3>
          <span className="text-xs text-slate-400">
            Select a subject to view & toggle chapter checkpoints
          </span>
        </div>

        {/* Quick Subject Tabs with Separate Syllabus & Revision stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {subjectSyllabusStats.map((stat) => {
            const isSelected = selectedSubjectStat?.subject.id === stat.subject.id;
            const subRev = stat.revision;
            return (
              <button
                type="button"
                key={stat.subject.id}
                id={`btn-subject-tab-${stat.subject.id}`}
                onClick={() => setSelectedSubjectId(stat.subject.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 ring-2 ring-emerald-500/50 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                {/* Subject Name & Header */}
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {stat.subject.name}
                  </span>
                  {isSelected ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                      Selected
                    </span>
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>

                {/* 1. SYLLABUS INDICATOR */}
                <div className="w-full space-y-1 bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">Syllabus</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {stat.completedChapters}/{stat.totalChapters} ({stat.formattedPercentage})
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, stat.percentage))}%` }}
                    />
                  </div>
                </div>

                {/* 2. REVISION INDICATOR (SEPARATE!) */}
                <div className="w-full bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-[10px] space-y-1">
                  <div className="flex items-center justify-between font-semibold text-sky-700 dark:text-sky-400">
                    <span>Revision</span>
                    <span className="text-slate-500 dark:text-slate-400">Denom: {subRev.finishedChapters} finished</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-medium">
                    <span>Rev 1: <strong>{subRev.rev1Count}/{subRev.finishedChapters}</strong></span>
                    <span>Rev 2: <strong>{subRev.rev2Count}/{subRev.finishedChapters}</strong></span>
                    <span>Final: <strong>{subRev.finalRevCount}/{subRev.finishedChapters}</strong></span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ACTIVE SUBJECT CHAPTER CHECKLIST (SECTION 4: CHAPTER ROW DESIGN) */}
        {selectedSubjectStat && (
          <div
            id="active-subject-chapter-checklist"
            className="mt-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-700/80">
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{selectedSubjectStat.subject.name} Chapters</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                    {selectedSubjectStat.completedChapters} / {selectedSubjectStat.totalChapters} Finished ({selectedSubjectStat.formattedPercentage})
                  </span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Click <strong>☑ Chapter Finished</strong> to count towards syllabus completion. Revisions are tracked independently.
                </p>
              </div>

              {/* Subject Revision Quick Badges */}
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="px-2 py-1 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold border border-sky-200 dark:border-sky-800">
                  Rev 1: {selectedSubjectStat.revision.rev1Count}/{selectedSubjectStat.revision.finishedChapters} ({selectedSubjectStat.revision.rev1Formatted})
                </span>
                <span className="px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
                  Rev 2: {selectedSubjectStat.revision.rev2Count}/{selectedSubjectStat.revision.finishedChapters} ({selectedSubjectStat.revision.rev2Formatted})
                </span>
                <span className="px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800">
                  Final: {selectedSubjectStat.revision.finalRevCount}/{selectedSubjectStat.revision.finishedChapters} ({selectedSubjectStat.revision.finalRevFormatted})
                </span>
              </div>
            </div>

            {/* Chapter Rows */}
            {(!selectedSubjectStat.subject.chapters || selectedSubjectStat.subject.chapters.length === 0) ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
                No chapters added for {selectedSubjectStat.subject.name} yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {selectedSubjectStat.subject.chapters.map((chapter) => (
                  <ChapterRow
                    key={chapter.id}
                    subjectId={selectedSubjectStat.subject.id}
                    chapter={chapter}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
