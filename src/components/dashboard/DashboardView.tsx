import React from 'react';
import { useApp } from '../../context/AppContext';
import { ExamCountdownHero } from './ExamCountdownHero';
import { TopDashboardStatCards } from './TopDashboardStatCards';
import { StudyNowCard } from './StudyNowCard';
import { SyllabusProgressCard } from '../syllabus/SyllabusProgressCard';
import { FocusHubCard } from '../focus/FocusHubCard';
import { TodayGoalCard } from './TodayGoalCard';
import { SubjectHoursCard } from '../subjects/SubjectHoursCard';
import { DailyAndWeeklySummaryCard } from '../statistics/DailyAndWeeklySummaryCard';
import { PreTestTimeAnalysisCard } from '../analytics/PreTestTimeAnalysisCard';
import { DailyTasksCard } from './DailyTasksCard';
import { DailyChecklistCard } from './DailyChecklistCard';
import { EmergencyModeBanner } from './EmergencyModeBanner';
import { MotivationCard } from './MotivationCard';

export function DashboardView() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Emergency Mode Alert Banner (if <= 7 days or activated) */}
      <EmergencyModeBanner />

      {/* 1. COUNTDOWN: Main Live Exam Countdown Hero (BST UTC+6, Real-time seconds) */}
      <section id="section-countdown">
        <ExamCountdownHero />
      </section>

      {/* Top Essential Stat Cards (Days Left, Total Study Hours, Today's Study, Streak, Weekly, Daily Average) */}
      <section id="section-top-cards">
        <TopDashboardStatCards />
      </section>

      {/* Smart "What Should I Study Now?" Rule-based Recommendation */}
      <section id="section-study-now">
        <StudyNowCard />
      </section>

      {/* PROMINENT SYLLABUS PROGRESS CARD: Automatic Completion %, Chapter Checklist, 30 Remaining */}
      <section id="section-syllabus-progress">
        <SyllabusProgressCard />
      </section>

      {/* 2. FOCUS TIME: The Central Focus Engine (Total Study Time: 127h 35m, Bangla & Subject Selector, Presets, Live Timer) */}
      <section id="section-focus-timer">
        <FocusHubCard />
      </section>

      {/* 3. TODAY'S PROGRESS: Daily Study Target (6 Hours goal, progress bar, 🎉 Goal Completed!) */}
      <section id="section-today-goal">
        <TodayGoalCard />
      </section>

      {/* 4. SUBJECT-WISE HOURS: Time spent per subject (Bangla, English, Physics, Chem, Math, Bio, ICT, Other) */}
      <section id="section-subject-hours">
        <SubjectHoursCard />
      </section>

      {/* 5. WEEKLY & MONTHLY STATISTICS: Daily breakdown (Today, Yesterday, Week, Month, Total) + 7-Day Overview */}
      <section id="section-weekly-stats">
        <DailyAndWeeklySummaryCard />
      </section>

      {/* 6. PRE-TEST TIME ANALYSIS & PREPARATION OVERVIEW: Analytical projection & manual preparation % */}
      <section id="section-time-analysis">
        <PreTestTimeAnalysisCard />
      </section>

      {/* 7. TASKS & REMINDERS: What to focus on today + Daily habit checklist */}
      <section id="section-tasks-and-habits">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <DailyTasksCard />
          </div>
          <div className="lg:col-span-5">
            <DailyChecklistCard />
          </div>
        </div>
      </section>

      {/* Motivational Quote */}
      <section id="section-motivation">
        <MotivationCard />
      </section>
    </div>
  );
}
