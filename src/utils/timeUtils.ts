import { ExamConfig } from '../types';

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  isExpired: boolean;
  rawDiffMs: number;
}

export interface PrepProgressResult {
  totalDays: number;
  daysPassed: number;
  daysRemaining: number;
  percentage: number;
  startDateFormatted: string;
  examDateFormatted: string;
}

export interface WarningMode {
  name: string;
  badgeClass: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  accentColor: string;
  phase: number;
  phaseName: string;
  phaseDesc: string;
  isUrgent: boolean;
}

/**
 * Parses exam target date and time in Bangladesh Standard Time (+06:00)
 */
export function getExamTargetMs(config: ExamConfig): number {
  try {
    const timeStr = config.examTime || '08:00';
    // Format: YYYY-MM-DDTHH:mm:00+06:00
    const isoString = `${config.examDate}T${timeStr.length === 5 ? timeStr + ':00' : timeStr}+06:00`;
    const parsed = new Date(isoString).getTime();
    if (isNaN(parsed)) {
      // Fallback
      return new Date('2026-11-01T08:00:00+06:00').getTime();
    }
    return parsed;
  } catch {
    return new Date('2026-11-01T08:00:00+06:00').getTime();
  }
}

/**
 * Calculates live countdown values
 */
export function calculateCountdown(targetMs: number): CountdownResult {
  const now = Date.now();
  const diff = targetMs - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalDays: 0,
      totalHours: 0,
      totalMinutes: 0,
      totalSeconds: 0,
      isExpired: true,
      rawDiffMs: 0,
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
  const totalHours = Math.floor(diff / (1000 * 60 * 60));
  const totalMinutes = Math.floor(diff / (1000 * 60));
  const totalSeconds = Math.floor(diff / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds,
    isExpired: false,
    rawDiffMs: diff,
  };
}

/**
 * Calculates the preparation period statistics
 */
export function calculatePrepProgress(config: ExamConfig): PrepProgressResult {
  const now = Date.now();
  const examTargetMs = getExamTargetMs(config);
  const startMs = new Date(`${config.prepStartDate || '2026-09-08'}T00:00:00+06:00`).getTime();

  const totalMs = Math.max(1, examTargetMs - startMs);
  const elapsedMs = Math.max(0, now - startMs);
  const remainingMs = Math.max(0, examTargetMs - now);

  const totalDays = Math.max(1, Math.round(totalMs / (1000 * 60 * 60 * 24)));
  const daysPassed = Math.min(totalDays, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
  
  const percentage = Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));

  return {
    totalDays,
    daysPassed,
    daysRemaining,
    percentage,
    startDateFormatted: formatDisplayDate(config.prepStartDate || '2026-09-08'),
    examDateFormatted: formatDisplayDate(config.examDate),
  };
}

/**
 * Formats a date string (YYYY-MM-DD) into readable format (e.g. November 1, 2026)
 */
export function formatDisplayDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return dateStr;
    const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Determines exam countdown warning level and preparation phase
 */
export function getWarningMode(daysRemaining: number, isExpired: boolean): WarningMode {
  if (isExpired || daysRemaining === 0) {
    return {
      name: 'Exam Day',
      badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800',
      bgClass: 'from-purple-500/10 to-indigo-500/10',
      borderClass: 'border-purple-500/30',
      textClass: 'text-purple-700 dark:text-purple-400',
      accentColor: '#9333ea',
      phase: 3,
      phaseName: 'Phase 3 — Exam Day',
      phaseDesc: 'Today is your examination day. Keep calm and trust your preparation.',
      isUrgent: true,
    };
  }

  if (daysRemaining <= 6) {
    return {
      name: 'Final Countdown',
      badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse',
      bgClass: 'from-rose-500/10 to-amber-500/10',
      borderClass: 'border-rose-500/40',
      textClass: 'text-rose-600 dark:text-rose-400',
      accentColor: '#e11d48',
      phase: 3,
      phaseName: 'Phase 3 — Final Revision & Mock Tests',
      phaseDesc: 'Final formulas, rapid recall, and time management.',
      isUrgent: true,
    };
  }

  if (daysRemaining <= 14) {
    return {
      name: 'Final Revision Mode',
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      bgClass: 'from-amber-500/10 to-orange-500/10',
      borderClass: 'border-amber-500/30',
      textClass: 'text-amber-600 dark:text-amber-400',
      accentColor: '#f59e0b',
      phase: 3,
      phaseName: 'Phase 3 — Final Revision & Mock Tests',
      phaseDesc: 'Final revision, MCQs, previous board/college questions & mock tests.',
      isUrgent: true,
    };
  }

  if (daysRemaining <= 30) {
    return {
      name: 'Intensive Revision Mode',
      badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800',
      bgClass: 'from-blue-500/10 to-cyan-500/10',
      borderClass: 'border-blue-500/30',
      textClass: 'text-blue-600 dark:text-blue-400',
      accentColor: '#2563eb',
      phase: 2,
      phaseName: 'Phase 2 — Revision',
      phaseDesc: 'Deep revision, first & second topic passes, tackling weak topics.',
      isUrgent: false,
    };
  }

  return {
    name: 'Preparation Mode',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    bgClass: 'from-emerald-500/10 to-teal-500/10',
    borderClass: 'border-emerald-500/30',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    accentColor: '#10b981',
    phase: 1,
    phaseName: 'Phase 1 — Finish Syllabus',
    phaseDesc: 'Focus on completing all remaining chapters and concept building.',
    isUrgent: false,
  };
}

/**
 * Checks milestone alert message
 */
export function getMilestoneAlert(daysRemaining: number): { title: string; message: string; icon: string } | null {
  if (daysRemaining === 1) {
    return {
      icon: '⚡',
      title: '1 Day Remaining — Final Prep Hour',
      message: 'Pack your admit card, pens, and calculator. Sleep at least 7 hours tonight!',
    };
  }
  if (daysRemaining === 3) {
    return {
      icon: '🔥',
      title: 'Only 3 Days Left! Final Countdown',
      message: 'Review high-yield formulas and summary charts. Do not start new unfamiliar chapters.',
    };
  }
  if (daysRemaining === 7) {
    return {
      icon: '🎯',
      title: '7 Days Remaining! 1-Week Alert',
      message: 'Last week before exam! Focus on weak spots and full-length timed mock tests.',
    };
  }
  if (daysRemaining === 10) {
    return {
      icon: '🔥',
      title: 'Only 10 days left! Final preparation mode activated.',
      message: 'Double down on daily revision checklists and practice previous test papers.',
    };
  }
  if (daysRemaining === 15) {
    return {
      icon: '⏱️',
      title: '15 Days Remaining Milestone',
      message: 'Two weeks to go! Make sure all high-priority chapters have finished 1st revision.',
    };
  }
  if (daysRemaining === 20) {
    return {
      icon: '📌',
      title: '20 Days Remaining Milestone',
      message: 'Target finishing 100% of new syllabus within the next 5 days.',
    };
  }
  if (daysRemaining === 30) {
    return {
      icon: '🚀',
      title: '30 Days Milestone — 1 Month Remaining',
      message: 'Intensive Revision Mode active! Strict study schedules and daily targets matter now.',
    };
  }
  if (daysRemaining === 50) {
    return {
      icon: '⏳',
      title: '50 Days Remaining Milestone',
      message: 'Solid runway ahead! Build unbreakable study streaks and master core topics.',
    };
  }
  return {
    icon: '🔥',
    title: `Only ${daysRemaining} days left! Make every study session count.`,
    message: 'Stay focused on today\'s targets and maintain your revision rhythm.',
  };
}

/**
 * Formats current time in Bangladesh Standard Time (UTC+6)
 */
export function getDhakaTimeString(): { time: string; date: string; day: string } {
  const now = new Date();
  
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const dayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    weekday: 'long',
  });

  return {
    time: timeFormatter.format(now),
    date: dateFormatter.format(now),
    day: dayFormatter.format(now),
  };
}

/**
 * Returns today's YYYY-MM-DD in Asia/Dhaka
 */
export function getDhakaTodayDateString(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;

  return `${year}-${month}-${day}`;
}

/**
 * Formats total minutes into clean "127h 35m" or "40m"
 */
export function formatMinutesToHoursMinutes(totalMinutes: number): string {
  const rounded = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

/**
 * Formats total minutes into long prominent format "127 Hours 35 Minutes"
 */
export function formatHoursMinutesLong(totalMinutes: number): string {
  const rounded = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;

  if (hours === 0) {
    return `${minutes} Minutes`;
  }
  if (minutes === 0) {
    return `${hours} ${hours === 1 ? 'Hour' : 'Hours'}`;
  }
  return `${hours} ${hours === 1 ? 'Hour' : 'Hours'} ${minutes} ${minutes === 1 ? 'Minute' : 'Minutes'}`;
}

/**
 * Returns YYYY-MM-DD offset from reference date in Dhaka timezone
 */
export function getDhakaDateOffset(offsetDays: number, baseDateStr?: string): string {
  const base = baseDateStr ? new Date(`${baseDateStr}T12:00:00+06:00`) : new Date();
  base.setDate(base.getDate() + offsetDays);

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(base);

  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;

  return `${year}-${month}-${day}`;
}

export interface WeekDayInfo {
  dayName: string; // 'Saturday', 'Sunday', etc.
  shortName: string; // 'Sat', 'Sun'
  dateKey: string; // '2026-09-08'
  isToday: boolean;
}

/**
 * Returns week days starting Saturday through Friday (standard Bangladesh academic week)
 */
export function getDhakaWeekDays(todayDateKey: string): WeekDayInfo[] {
  // Parse today's date in Dhaka
  const today = new Date(`${todayDateKey}T12:00:00+06:00`);
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // In Bangladesh Saturday is start of academic study week.
  // Map dayOfWeek to offset from Saturday:
  // Saturday (6) -> 0
  // Sunday (0) -> 1
  // Monday (1) -> 2
  // Tuesday (2) -> 3
  // Wednesday (3) -> 4
  // Thursday (4) -> 5
  // Friday (5) -> 6
  const saturdayOffset = (dayOfWeek + 1) % 7;

  const saturdayDate = new Date(today);
  saturdayDate.setDate(today.getDate() - saturdayOffset);

  const days: WeekDayInfo[] = [];
  const dayNames = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const shortNames = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(saturdayDate);
    d.setDate(saturdayDate.getDate() + i);

    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(d);

    const year = parts.find((p) => p.type === 'year')?.value;
    const month = parts.find((p) => p.type === 'month')?.value;
    const day = parts.find((p) => p.type === 'day')?.value;
    const dateKey = `${year}-${month}-${day}`;

    days.push({
      dayName: dayNames[i],
      shortName: shortNames[i],
      dateKey,
      isToday: dateKey === todayDateKey,
    });
  }

  return days;
}

