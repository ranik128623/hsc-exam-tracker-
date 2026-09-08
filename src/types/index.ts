export type Priority = 'high' | 'medium' | 'low';

export interface Chapter {
  id: string;
  name: string;
  completed: boolean; // Main checkbox: "Chapter Finished" (studied/finished at least once)
  rev1?: boolean; // Revision 1
  rev2?: boolean; // Revision 2
  finalRev?: boolean; // Final Revision
  cqPractice?: boolean; // CQ Practice Done
  mcqDone?: boolean; // MCQ Practice Done
}

export interface Subject {
  id: string;
  name: string;
  color: string; // Tailwind color key, e.g. emerald, sky, indigo, amber, rose, teal, cyan, slate
  targetHours?: number;
  chapters?: Chapter[];
}

export interface SubjectRevisionStat {
  finishedChapters: number;
  rev1Count: number;
  rev1Percentage: number;
  rev1Formatted: string;
  rev2Count: number;
  rev2Percentage: number;
  rev2Formatted: string;
  finalRevCount: number;
  finalRevPercentage: number;
  finalRevFormatted: string;
  cqCount: number;
  mcqCount: number;
}

export interface SubjectSyllabusStat {
  subject: Subject;
  totalChapters: number;
  completedChapters: number; // Finished chapters count
  remainingChapters: number;
  percentage: number; // e.g. 80.0
  formattedPercentage: string; // e.g. "80%"
  revision: SubjectRevisionStat;
}

export interface OverallRevisionStat {
  totalFinishedChapters: number;
  rev1Count: number;
  rev1Percentage: number;
  rev1Formatted: string;
  rev2Count: number;
  rev2Percentage: number;
  rev2Formatted: string;
  finalRevCount: number;
  finalRevPercentage: number;
  finalRevFormatted: string;
  cqCount: number;
  mcqCount: number;
}

export interface OverallSyllabusStat {
  totalChapters: number;
  completedChapters: number; // Finished chapters count
  remainingChapters: number;
  percentage: number; // e.g. 58.3
  formattedPercentage: string; // e.g. "58.3%"
  revision: OverallRevisionStat;
}

export interface FocusSession {
  id: string;
  subjectId: string;
  subjectName: string;
  durationMinutes: number; // minutes spent
  dateKey: string; // YYYY-MM-DD (e.g. 2026-09-08)
  timeStr: string; // e.g. 10:30 AM
  timestamp: number;
  notes?: string;
  presetUsed?: string; // 25/5, 50/10, 60/10, custom, manual
}

export interface StudyTask {
  id: string;
  name: string;
  subjectId?: string;
  subjectName?: string;
  date: string; // YYYY-MM-DD
  estimatedMinutes: number;
  priority: Priority;
  completed: boolean;
  completedAt?: string;
}

export interface DailyStudyLog {
  [dateKey: string]: {
    hours: number;
    minutes?: number;
    status?: 'not_studied' | 'partially_studied' | 'completed';
    notes?: string;
  };
}

export interface DailyChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ExamConfig {
  title: string;
  examDate: string; // YYYY-MM-DD
  examTime: string; // HH:mm (24h)
  timezone: string; // "Asia/Dhaka" UTC+6
  prepStartDate: string; // YYYY-MM-DD
}

export interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
}

export interface UserSettings {
  dailyTargetHours: number; // e.g. 6
  streakThresholdHours: number; // e.g. 1.0 hour minimum to count as a study day
  manualPreparationPercentage: number; // 0 - 100, manual entered progress
  pomodoro: PomodoroSettings;
  soundEnabled: boolean;
  emergencyModeActive: boolean;
  theme: 'light' | 'dark';
}

export type ActiveTab = 
  | 'dashboard'
  | 'focus'
  | 'syllabus'
  | 'subjects'
  | 'planner'
  | 'history'
  | 'analytics'
  | 'settings';
