import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChapterRow } from './ChapterRow';
import {
  BookOpen,
  RotateCw,
  Target,
  Plus,
  Filter,
  Search,
  CheckCheck,
  Sparkles,
  Info,
} from 'lucide-react';

export const SyllabusTrackerView: React.FC = () => {
  const {
    overallSyllabusStat,
    subjectSyllabusStats,
    addChapter,
    deleteChapter,
  } = useApp();

  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string>('all');
  const [completionFilter, setCompletionFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newChapterInput, setNewChapterInput] = useState<{ [subjectId: string]: string }>({});

  const { revision } = overallSyllabusStat;

  const handleAddChapter = (subjectId: string) => {
    const text = newChapterInput[subjectId]?.trim();
    if (!text) return;
    addChapter(subjectId, text);
    setNewChapterInput((prev) => ({ ...prev, [subjectId]: '' }));
  };

  const filteredSubjects = subjectSyllabusStats.filter((stat) => {
    if (activeSubjectFilter === 'all') return true;
    return stat.subject.id === activeSubjectFilter;
  });

  return (
    <div id="syllabus-tracker-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-6 h-6" />
            </span>
            <span>Syllabus Completion Tracker</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Separated tracking for <strong>Syllabus Completion</strong> (Chapter Finished) and <strong>Revision Progress</strong> (Rev 1, 2, Final, Practice).
          </p>
        </div>

        {/* Overall Completion Badge */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm self-start md:self-auto">
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Syllabus Completion</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {overallSyllabusStat.completedChapters} / {overallSyllabusStat.totalChapters} Finished
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 flex items-center justify-center font-extrabold text-xs text-emerald-700 dark:text-emerald-300">
            {overallSyllabusStat.formattedPercentage}
          </div>
        </div>
      </div>

      {/* DASHBOARD 4-CARD OVERVIEW SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. 📚 Syllabus */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/90 dark:border-emerald-900/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>📚 Syllabus</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Primary
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {overallSyllabusStat.formattedPercentage}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Completed</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              <strong>{overallSyllabusStat.completedChapters}</strong> / {overallSyllabusStat.totalChapters} chapters finished
            </p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400">
              {overallSyllabusStat.remainingChapters} chapters remaining
            </p>
          </div>
        </div>

        {/* 2. 🔄 Revision 1 */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-sky-200/90 dark:border-sky-900/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5" />
              <span>🔄 Revision 1</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
              Pass 1
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {revision.rev1Formatted}
              </span>
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400">Done</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              <strong>{revision.rev1Count}</strong> / {revision.totalFinishedChapters} Finished Chapters
            </p>
            <p className="text-[11px] text-slate-400">Finished chapters only</p>
          </div>
        </div>

        {/* 3. 🔄 Revision 2 */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200/90 dark:border-indigo-900/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5" />
              <span>🔄 Revision 2</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              Pass 2
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {revision.rev2Formatted}
              </span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Done</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              <strong>{revision.rev2Count}</strong> / {revision.totalFinishedChapters} Finished Chapters
            </p>
            <p className="text-[11px] text-slate-400">Deep retention check</p>
          </div>
        </div>

        {/* 4. 🎯 Final Revision */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-purple-200/90 dark:border-purple-900/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              <span>🎯 Final Revision</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              Exam Polish
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {revision.finalRevFormatted}
              </span>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Done</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              <strong>{revision.finalRevCount}</strong> / {revision.totalFinishedChapters} Finished Chapters
            </p>
            <p className="text-[11px] text-slate-400">Final prep checkpoints</p>
          </div>
        </div>
      </div>

      {/* SEPARATE OVERALL PROGRESS PANELS: SYLLABUS vs REVISION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Prominent Overall Syllabus Banner */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-emerald-950 dark:to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm mb-3">
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Syllabus Completion Engine</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Syllabus: {overallSyllabusStat.formattedPercentage}
            </h2>
            <p className="text-emerald-100 dark:text-slate-300 text-xs sm:text-sm mt-1">
              <strong>{overallSyllabusStat.completedChapters}</strong> of{' '}
              <strong>{overallSyllabusStat.totalChapters}</strong> chapters finished •{' '}
              <strong>{overallSyllabusStat.remainingChapters}</strong> chapters remaining to study
            </p>
          </div>

          <div className="mt-5 bg-white/10 rounded-xl p-3.5 backdrop-blur-sm border border-white/20">
            <div className="flex justify-between text-xs font-medium mb-1.5 text-emerald-100">
              <span>Formula: Finished chapters ÷ Total chapters × 100</span>
              <span className="font-bold text-white">{overallSyllabusStat.formattedPercentage}</span>
            </div>
            <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-white rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${Math.min(100, Math.max(0, overallSyllabusStat.percentage))}%` }}
              />
            </div>
            <p className="text-[11px] text-emerald-100/80 mt-1.5">
              Strictly calculated from Chapter Finished. Revisions do not delay syllabus completion.
            </p>
          </div>
        </div>

        {/* Prominent Overall Revision Progress Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-bold">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Revision & Practice Engine</span>
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Denominator: {revision.totalFinishedChapters} Finished
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              🔄 Revision Progress
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Only chapters marked "Chapter Finished" are included in the denominator for revision progress.
            </p>
          </div>

          <div className="mt-4 space-y-2.5">
            {/* Revision 1 */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span className="text-sky-600 dark:text-sky-400">Revision 1</span>
                <span>{revision.rev1Count} / {revision.totalFinishedChapters} Finished Chapters ({revision.rev1Formatted})</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, revision.rev1Percentage))}%` }}
                />
              </div>
            </div>

            {/* Revision 2 */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span className="text-indigo-600 dark:text-indigo-400">Revision 2</span>
                <span>{revision.rev2Count} / {revision.totalFinishedChapters} Finished Chapters ({revision.rev2Formatted})</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, revision.rev2Percentage))}%` }}
                />
              </div>
            </div>

            {/* Final Revision */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span className="text-purple-600 dark:text-purple-400">Final Revision</span>
                <span>{revision.finalRevCount} / {revision.totalFinishedChapters} Finished Chapters ({revision.finalRevFormatted})</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, revision.finalRevPercentage))}%` }}
                />
              </div>
            </div>

            {/* Practice badges */}
            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800 font-medium">
              <span className="text-amber-600 dark:text-amber-400">
                CQ Practice: <strong>{revision.cqCount}</strong> / {revision.totalFinishedChapters}
              </span>
              <span className="text-teal-600 dark:text-teal-400">
                MCQ Done: <strong>{revision.mcqCount}</strong> / {revision.totalFinishedChapters}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SUBJECT SELECTOR AND FILTERS */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        {/* Subject Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            type="button"
            id="filter-subject-all"
            onClick={() => setActiveSubjectFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeSubjectFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Subjects ({subjectSyllabusStats.length})
          </button>
          {subjectSyllabusStats.map((stat) => {
            const isActive = activeSubjectFilter === stat.subject.id;
            return (
              <button
                type="button"
                key={stat.subject.id}
                id={`filter-subject-${stat.subject.id}`}
                onClick={() => setActiveSubjectFilter(stat.subject.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{stat.subject.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {stat.formattedPercentage}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search and Status Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search chapter title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400 font-medium">Show:</span>
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setCompletionFilter('all')}
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                  completionFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All ({overallSyllabusStat.totalChapters})
              </button>
              <button
                type="button"
                onClick={() => setCompletionFilter('pending')}
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                  completionFilter === 'pending'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Not Finished ({overallSyllabusStat.remainingChapters})
              </button>
              <button
                type="button"
                onClick={() => setCompletionFilter('completed')}
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                  completionFilter === 'completed'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Finished ({overallSyllabusStat.completedChapters})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: SUBJECT-WISE CHAPTER CARDS WITH TWO SEPARATE PROGRESS INDICATORS */}
      <div className="space-y-6">
        {filteredSubjects.map((stat) => {
          const chapters = stat.subject.chapters || [];
          const filteredChapters = chapters.filter((chap) => {
            if (completionFilter === 'completed' && !chap.completed) return false;
            if (completionFilter === 'pending' && chap.completed) return false;
            if (searchQuery.trim()) {
              return chap.name.toLowerCase().includes(searchQuery.toLowerCase());
            }
            return true;
          });

          const subRev = stat.revision;

          return (
            <div
              key={stat.subject.id}
              id={`syllabus-subject-card-${stat.subject.id}`}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5"
            >
              {/* SECTION 3: Subject Header with TWO SEPARATE PROGRESS INDICATORS */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                {/* Subject Title */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-extrabold text-sm">
                    {stat.subject.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{stat.subject.name}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                        {stat.formattedPercentage} Completed
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {stat.completedChapters} of {stat.totalChapters} chapters finished
                      {stat.remainingChapters > 0 ? ` • ${stat.remainingChapters} remaining` : ' • Syllabus finished!'}
                    </p>
                  </div>
                </div>

                {/* Two Separate Indicators */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Indicator 1: Syllabus */}
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 w-full sm:w-52">
                    <div className="flex justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                      <span>Syllabus</span>
                      <span>{stat.completedChapters} / {stat.totalChapters} ({stat.formattedPercentage})</span>
                    </div>
                    <div className="h-2 w-full bg-emerald-100 dark:bg-emerald-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, stat.percentage))}%` }}
                      />
                    </div>
                  </div>

                  {/* Indicator 2: Revision (Do NOT combine!) */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-60 text-[11px] space-y-0.5">
                    <div className="flex justify-between font-bold text-sky-700 dark:text-sky-400">
                      <span>Revision Checkpoints</span>
                      <span className="text-slate-400 font-medium">/{subRev.finishedChapters} finished</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-semibold pt-0.5">
                      <span>Rev 1: {subRev.rev1Count}/{subRev.finishedChapters}</span>
                      <span>Rev 2: {subRev.rev2Count}/{subRev.finishedChapters}</span>
                      <span>Final: {subRev.finalRevCount}/{subRev.finishedChapters}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Chapters Checklist with Prominent Chapter Finished & Separate Revision */}
              <div>
                {filteredChapters.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">
                    No chapters match the selected filter.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {filteredChapters.map((chapter) => (
                      <ChapterRow
                        key={chapter.id}
                        subjectId={stat.subject.id}
                        chapter={chapter}
                        showDelete={true}
                        onDelete={() => deleteChapter(stat.subject.id, chapter.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Add Chapter Input */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Add chapter to ${stat.subject.name}...`}
                    value={newChapterInput[stat.subject.id] || ''}
                    onChange={(e) =>
                      setNewChapterInput((prev) => ({
                        ...prev,
                        [stat.subject.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddChapter(stat.subject.id);
                    }}
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    id={`btn-add-chapter-${stat.subject.id}`}
                    onClick={() => handleAddChapter(stat.subject.id)}
                    className="px-3 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Chapter</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
