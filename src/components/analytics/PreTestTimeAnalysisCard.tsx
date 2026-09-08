import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Hourglass,
  Clock,
  TrendingUp,
  Sliders,
  Sparkles,
  Info,
  Flame,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export function PreTestTimeAnalysisCard() {
  const {
    preTestAnalysis,
    totalFocusHoursLongFormatted,
    totalFocusHoursFormatted,
    manualPreparationPercentage,
    setManualPreparationPercentage,
    currentStreak,
    dailyGoalStatus,
    examConfig,
  } = useApp();

  const [isEditingSlider, setIsEditingSlider] = useState(false);
  const [sliderValue, setSliderValue] = useState(manualPreparationPercentage);

  const handleSliderChange = (newVal: number) => {
    setSliderValue(newVal);
    setManualPreparationPercentage(newVal);
  };

  return (
    <div
      id="pre-test-analysis-section"
      className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6"
    >
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-base">
            📈
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Pre-Test Preparation Overview & Time Analysis
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clear answers on remaining time, study pace, and realistic projections
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Dynamically calculated</span>
        </div>
      </div>

      {/* 2. Manual Preparation Progress (Requirement 10: "Do NOT calculate this from chapters. Keep it as a simple manual slider or percentage input so I can adjust it based on my printed sheet.") */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 border border-emerald-200/70 dark:border-emerald-800/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Self-Assessed Preparation Progress
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                (Tracked via your printed sheet)
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Adjust this percentage anytime to match your printed syllabus checklist
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-3xl font-black text-emerald-700 dark:text-emerald-400">
              {manualPreparationPercentage}%
            </span>
            <span className="text-xs font-bold text-slate-400">Prepared</span>
          </div>
        </div>

        {/* Interactive Slider */}
        <div className="space-y-2">
          <input
            id="prep-progress-slider"
            type="range"
            min="0"
            max="100"
            step="1"
            value={manualPreparationPercentage}
            onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
            className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[11px] font-bold text-slate-400">
            <span>0% (Just Starting)</span>
            <span>25%</span>
            <span>50% (Halfway)</span>
            <span>75%</span>
            <span>100% (Exam Ready!)</span>
          </div>
        </div>
      </div>

      {/* 3. The 4 Analytical Questions (Requirements 4 & 11) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Q1: How much time do I have left? */}
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-2">
          <div className="flex items-center gap-2">
            <Hourglass className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              1. How much time do I have left?
            </h4>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-amber-600 dark:text-amber-400">
              {preTestAnalysis.daysRemaining} Days
            </span>
            <span className="text-xs text-slate-500">remaining</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pre-Test starts on <strong>{examConfig.examDate}</strong> at {examConfig.examTime} BST
            (UTC+6).
          </p>
        </div>

        {/* Q2: How much time have I already studied? */}
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              2. How much time have I already studied?
            </h4>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {totalFocusHoursLongFormatted}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Across all completed focus sessions and recorded subject hours.
          </p>
        </div>

        {/* Q3: How many study hours per day am I averaging? */}
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-500" />
            <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              3. How many study hours per day am I averaging?
            </h4>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-sky-600 dark:text-sky-400">
              {preTestAnalysis.averageHoursPerDay}
            </span>
            <span className="text-xs text-slate-500">daily average</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculated across your active preparation period with active streak of{' '}
            <strong className="text-rose-500">{currentStreak} days</strong>.
          </p>
        </div>

        {/* Q4: If I maintain my current average, approximately how many hours will I study before the exam? */}
        <div className="p-4 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h4 className="text-xs font-extrabold uppercase tracking-wide text-indigo-900 dark:text-indigo-300">
              4. Projected Study Time Before Pre-Test
            </h4>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-indigo-600 dark:text-indigo-400">
              ~{preTestAnalysis.estimatedAdditionalHours} Additional Hours
            </span>
          </div>
          <p className="text-xs text-indigo-950/80 dark:text-indigo-200/80">
            Total projected by exam day: <strong>~{preTestAnalysis.projectedTotalHours} Hours</strong>.
          </p>
        </div>
      </div>

      {/* Clear Estimate Disclaimer */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center gap-2.5 text-xs text-slate-500">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          <strong>Estimate Note:</strong> These projections are realistic estimations based on your
          past daily study consistency and remaining days. Adjust your daily targets in Settings to
          boost your final total!
        </span>
      </div>
    </div>
  );
}
