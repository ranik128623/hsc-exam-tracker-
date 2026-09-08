import React from 'react';
import { useApp } from '../../context/AppContext';
import { DailyAndWeeklySummaryCard } from './DailyAndWeeklySummaryCard';
import { PreTestTimeAnalysisCard } from '../analytics/PreTestTimeAnalysisCard';
import { SubjectHoursCard } from '../subjects/SubjectHoursCard';
import { TopDashboardStatCards } from '../dashboard/TopDashboardStatCards';
import { BarChart3, TrendingUp, Flame, Clock, Award } from 'lucide-react';

export function StatisticsView() {
  const {
    totalFocusHoursLongFormatted,
    preTestAnalysis,
    currentStreak,
    longestStreak,
    dailyGoalStatus,
  } = useApp();

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
            📊
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Study Analytics & Productivity
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive analytics, subject distributions, daily records, and time forecasts
            </p>
          </div>
        </div>
      </div>

      {/* Top Cards */}
      <TopDashboardStatCards />

      {/* 1. Pre-Test Time Analysis & Projection (Requirements 4, 10, 11) */}
      <PreTestTimeAnalysisCard />

      {/* 2. Daily & Weekly Study Summaries (Requirements 5, 6) */}
      <DailyAndWeeklySummaryCard />

      {/* 3. Subject-wise Hours Breakdown (Requirement 3) */}
      <SubjectHoursCard />
    </div>
  );
}
