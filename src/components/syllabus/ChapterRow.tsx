import React from 'react';
import { Chapter } from '../../types';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Circle, CheckSquare, Square, Trash2 } from 'lucide-react';

interface ChapterRowProps {
  subjectId: string;
  chapter: Chapter;
  onDelete?: () => void;
  showDelete?: boolean;
}

export const ChapterRow: React.FC<ChapterRowProps> = ({
  subjectId,
  chapter,
  onDelete,
  showDelete = false,
}) => {
  const { toggleChapterField } = useApp();

  return (
    <div
      id={`chapter-row-${chapter.id}`}
      className={`group p-3.5 rounded-xl border transition-all ${
        chapter.completed
          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/60 shadow-xs'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Top row: Chapter Title & Most Important "Chapter Finished" Checkbox */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="min-w-0">
            <h4
              className={`text-sm font-bold tracking-tight leading-snug ${
                chapter.completed
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              {chapter.name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  chapter.completed
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {chapter.completed ? 'Syllabus: Finished' : 'Syllabus: Not Finished'}
              </span>
            </div>
          </div>
        </div>

        {/* PRIMARY PROMINENT CHECKBOX: "Chapter Finished" */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            id={`btn-toggle-finished-${chapter.id}`}
            onClick={() => toggleChapterField(subjectId, chapter.id, 'completed')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs select-none ${
              chapter.completed
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500/40'
                : 'bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500'
            }`}
          >
            {chapter.completed ? (
              <CheckCircle2 className="w-4 h-4 text-white fill-white/20" />
            ) : (
              <Circle className="w-4 h-4 text-slate-400" />
            )}
            <span>{chapter.completed ? '☑ Chapter Finished' : '☐ Chapter Finished'}</span>
          </button>

          {showDelete && onDelete && (
            <button
              type="button"
              id={`btn-delete-chapter-${chapter.id}`}
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 transition-opacity cursor-pointer"
              title="Delete chapter"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Sub-row: SEPARATE REVISION & PRACTICE CHECKBOXES */}
      <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs">
        {/* Revision Checkpoints */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-0.5">
            Revision:
          </span>

          {/* Rev 1 */}
          <button
            type="button"
            id={`chk-rev1-${chapter.id}`}
            onClick={() => toggleChapterField(subjectId, chapter.id, 'rev1')}
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer select-none ${
              chapter.rev1
                ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {chapter.rev1 ? (
              <CheckSquare className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>Rev 1</span>
          </button>

          {/* Rev 2 */}
          <button
            type="button"
            id={`chk-rev2-${chapter.id}`}
            onClick={() => toggleChapterField(subjectId, chapter.id, 'rev2')}
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer select-none ${
              chapter.rev2
                ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {chapter.rev2 ? (
              <CheckSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>Rev 2</span>
          </button>

          {/* Final Rev */}
          <button
            type="button"
            id={`chk-finalRev-${chapter.id}`}
            onClick={() => toggleChapterField(subjectId, chapter.id, 'finalRev')}
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer select-none ${
              chapter.finalRev
                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {chapter.finalRev ? (
              <CheckSquare className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>Final Rev</span>
          </button>
        </div>

        {/* Practice Checkpoints */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-0.5">
            Practice:
          </span>

          {/* CQ Practice */}
          <button
            type="button"
            id={`chk-cq-${chapter.id}`}
            onClick={() => toggleChapterField(subjectId, chapter.id, 'cqPractice')}
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer select-none ${
              chapter.cqPractice
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {chapter.cqPractice ? (
              <CheckSquare className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>CQ Practice</span>
          </button>

          {/* MCQ Done */}
          <button
            type="button"
            id={`chk-mcq-${chapter.id}`}
            onClick={() => toggleChapterField(subjectId, chapter.id, 'mcqDone')}
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer select-none ${
              chapter.mcqDone
                ? 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-800'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {chapter.mcqDone ? (
              <CheckSquare className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>MCQ Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
