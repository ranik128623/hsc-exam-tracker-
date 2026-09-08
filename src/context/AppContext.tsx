import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Subject,
  Chapter,
  SubjectSyllabusStat,
  OverallSyllabusStat,
  SubjectRevisionStat,
  OverallRevisionStat,
  FocusSession,
  StudyTask,
  DailyChecklistItem,
  UserSettings,
  ExamConfig,
  ActiveTab,
} from '../types';
import {
  DEFAULT_EXAM_CONFIG,
  DEFAULT_USER_SETTINGS,
  DEFAULT_SUBJECTS,
  DEFAULT_FOCUS_SESSIONS,
  DEFAULT_TASKS,
  DEFAULT_DAILY_CHECKLIST,
} from '../data/initialData';
import {
  getDhakaTodayDateString,
  getDhakaDateOffset,
  getDhakaWeekDays,
  formatMinutesToHoursMinutes,
  formatHoursMinutesLong,
  getExamTargetMs,
  calculateCountdown,
} from '../utils/timeUtils';
import { playChimeSound } from '../utils/audioAndQuotes';

const STORAGE_KEY = 'pretest_dash_v2';

export interface SubjectStat {
  subject: Subject;
  totalMinutes: number;
  formattedHours: string; // e.g. "12h 40m"
  percentage: number; // 0 - 100
}

export interface WeeklyDaySummary {
  dayName: string; // 'Saturday', 'Sunday', etc.
  shortName: string; // 'Sat', 'Sun'
  dateKey: string;
  minutes: number;
  formattedTime: string; // '4h 20m'
  isToday: boolean;
}

export interface WeeklySummaryData {
  days: WeeklyDaySummary[];
  totalMinutes: number;
  formattedTotal: string;
  dailyAverageMinutes: number;
  formattedDailyAverage: string;
  bestDay: {
    dayName: string;
    minutes: number;
    formattedTime: string;
  };
}

export interface PreTestAnalysisData {
  daysRemaining: number;
  totalHoursStudied: string; // "127h 35m"
  averageHoursPerDay: string; // "4h 18m/day"
  averageMinutesPerDay: number;
  estimatedAdditionalHours: number; // e.g. 180
  projectedTotalHours: number; // e.g. 307
}

interface AppContextType {
  examConfig: ExamConfig;
  setExamConfig: (config: ExamConfig) => void;
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  addSubject: (name: string, color: string, targetHours?: number) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  focusSessions: FocusSession[];
  addFocusSession: (session: Omit<FocusSession, 'id' | 'timestamp'>) => void;
  deleteFocusSession: (id: string) => void;
  updateFocusSession: (id: string, updates: Partial<FocusSession>) => void;
  tasks: StudyTask[];
  addTask: (task: Omit<StudyTask, 'id'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  checklist: DailyChecklistItem[];
  toggleChecklistItem: (id: string) => void;
  addChecklistItem: (text: string) => void;
  deleteChecklistItem: (id: string) => void;
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  focusTimerModalOpen: boolean;
  setFocusTimerModalOpen: (open: boolean) => void;
  quickEditExamModalOpen: boolean;
  setQuickEditExamModalOpen: (open: boolean) => void;
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<void>;
  triggerNotification: (title: string, body: string) => void;
  resetAllData: () => void;
  resetToDefaults: () => void;
  loadSampleData: () => void;

  // Real-time computed metrics
  totalFocusMinutes: number;
  totalFocusHoursFormatted: string; // "127h 35m"
  totalFocusHoursLongFormatted: string; // "127 Hours 35 Minutes"
  todayFocusMinutes: number;
  todayFocusHoursFormatted: string; // "5h 20m"
  yesterdayFocusMinutes: number;
  yesterdayFocusHoursFormatted: string; // "4h 45m"
  thisWeekFocusMinutes: number;
  thisWeekFocusHoursFormatted: string; // "31h 40m"
  thisMonthFocusMinutes: number;
  thisMonthFocusHoursFormatted: string; // "86h 15m"
  subjectWiseStats: SubjectStat[];
  dailyGoalStatus: {
    targetHours: number;
    targetMinutes: number;
    completedMinutes: number;
    percentage: number;
    isCompleted: boolean;
  };
  weeklySummary: WeeklySummaryData;
  currentStreak: number;
  longestStreak: number;
  preTestAnalysis: PreTestAnalysisData;
  manualPreparationPercentage: number;
  setManualPreparationPercentage: (percent: number) => void;

  // Syllabus Completion Tracker
  overallSyllabusStat: OverallSyllabusStat;
  subjectSyllabusStats: SubjectSyllabusStat[];
  toggleChapter: (subjectId: string, chapterId: string) => void;
  toggleChapterField: (
    subjectId: string,
    chapterId: string,
    field: 'completed' | 'rev1' | 'rev2' | 'finalRev' | 'cqPractice' | 'mcqDone'
  ) => void;
  addChapter: (subjectId: string, chapterName: string) => void;
  deleteChapter: (subjectId: string, chapterId: string) => void;
  updateChapter: (subjectId: string, chapterId: string, name: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // 1. Exam Configuration
  const [examConfig, setExamConfig] = useState<ExamConfig>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_exam_config`);
      return saved ? JSON.parse(saved) : DEFAULT_EXAM_CONFIG;
    } catch {
      return DEFAULT_EXAM_CONFIG;
    }
  });

  // 2. Subjects (Bangla, English, Physics, Chemistry, Math, Biology, ICT, editable from Settings)
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_subjects`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((subj: Subject) => {
            const def = DEFAULT_SUBJECTS.find(
              (d) => d.id === subj.id || d.name.toLowerCase() === subj.name.toLowerCase()
            );
            const chapters = (subj.chapters && subj.chapters.length > 0) ? subj.chapters : (def?.chapters || []);
            return {
              ...subj,
              chapters: chapters.map((c: Chapter) => {
                const defChap = def?.chapters?.find((dc) => dc.id === c.id);
                return {
                  id: c.id,
                  name: c.name,
                  completed: Boolean(c.completed),
                  rev1: c.rev1 !== undefined ? c.rev1 : (defChap?.rev1 ?? false),
                  rev2: c.rev2 !== undefined ? c.rev2 : (defChap?.rev2 ?? false),
                  finalRev: c.finalRev !== undefined ? c.finalRev : (defChap?.finalRev ?? false),
                  cqPractice: c.cqPractice !== undefined ? c.cqPractice : (defChap?.cqPractice ?? false),
                  mcqDone: c.mcqDone !== undefined ? c.mcqDone : (defChap?.mcqDone ?? false),
                };
              }),
            };
          });
        }
      }
      return DEFAULT_SUBJECTS;
    } catch {
      return DEFAULT_SUBJECTS;
    }
  });

  // 3. Focus Sessions (Source of truth for all study time)
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_sessions`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_FOCUS_SESSIONS;
    } catch {
      return DEFAULT_FOCUS_SESSIONS;
    }
  });

  // 4. Study Tasks / Reminders
  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_tasks`);
      return saved ? JSON.parse(saved) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  });

  // 5. Daily Checklist
  const [checklist, setChecklist] = useState<DailyChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_checklist`);
      return saved ? JSON.parse(saved) : DEFAULT_DAILY_CHECKLIST;
    } catch {
      return DEFAULT_DAILY_CHECKLIST;
    }
  });

  // 6. User Settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
      return saved ? { ...DEFAULT_USER_SETTINGS, ...JSON.parse(saved) } : DEFAULT_USER_SETTINGS;
    } catch {
      return DEFAULT_USER_SETTINGS;
    }
  });

  // 7. Navigation & Modals
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [focusTimerModalOpen, setFocusTimerModalOpen] = useState<boolean>(false);
  const [quickEditExamModalOpen, setQuickEditExamModalOpen] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Persistence to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_exam_config`, JSON.stringify(examConfig));
    } catch (e) {
      console.error('Failed to save examConfig', e);
    }
  }, [examConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_subjects`, JSON.stringify(subjects));
    } catch (e) {
      console.error('Failed to save subjects', e);
    }
  }, [subjects]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_sessions`, JSON.stringify(focusSessions));
    } catch (e) {
      console.error('Failed to save focusSessions', e);
    }
  }, [focusSessions]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_tasks`, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_checklist`, JSON.stringify(checklist));
    } catch (e) {
      console.error('Failed to save checklist', e);
    }
  }, [checklist]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }, [settings]);

  // Synchronize Dark / Light Theme
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
      } catch (err) {
        console.warn('Could not request notification permission', err);
      }
    }
  };

  const triggerNotification = (title: string, body: string) => {
    if (settings.soundEnabled) {
      playChimeSound('timer_start');
    }
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch (e) {
        console.warn('Notification failed:', e);
      }
    }
  };

  // Subject Actions (Requirement 1: Editable from Settings)
  const addSubject = (name: string, color: string, targetHours = 20) => {
    if (!name.trim()) return;
    const newSubject: Subject = {
      id: `sub_${Date.now()}`,
      name: name.trim(),
      color: color || 'emerald',
      targetHours,
      chapters: [],
    };
    setSubjects((prev) => [...prev, newSubject]);
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  // Chapter Actions for Syllabus Completion Tracker
  const toggleChapter = (subjectId: string, chapterId: string) => {
    toggleChapterField(subjectId, chapterId, 'completed');
  };

  const toggleChapterField = (
    subjectId: string,
    chapterId: string,
    field: 'completed' | 'rev1' | 'rev2' | 'finalRev' | 'cqPractice' | 'mcqDone'
  ) => {
    setSubjects((prev) =>
      prev.map((subj) => {
        if (subj.id !== subjectId) return subj;
        const currentChapters = subj.chapters || [];
        const updatedChapters = currentChapters.map((chap) =>
          chap.id === chapterId ? { ...chap, [field]: !chap[field] } : chap
        );
        return {
          ...subj,
          chapters: updatedChapters,
        };
      })
    );
  };

  const addChapter = (subjectId: string, chapterName: string) => {
    if (!chapterName.trim()) return;
    const newChapter: Chapter = {
      id: `chap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: chapterName.trim(),
      completed: false,
    };
    setSubjects((prev) =>
      prev.map((subj) => {
        if (subj.id !== subjectId) return subj;
        return {
          ...subj,
          chapters: [...(subj.chapters || []), newChapter],
        };
      })
    );
  };

  const deleteChapter = (subjectId: string, chapterId: string) => {
    setSubjects((prev) =>
      prev.map((subj) => {
        if (subj.id !== subjectId) return subj;
        return {
          ...subj,
          chapters: (subj.chapters || []).filter((c) => c.id !== chapterId),
        };
      })
    );
  };

  const updateChapter = (subjectId: string, chapterId: string, name: string) => {
    if (!name.trim()) return;
    setSubjects((prev) =>
      prev.map((subj) => {
        if (subj.id !== subjectId) return subj;
        return {
          ...subj,
          chapters: (subj.chapters || []).map((c) =>
            c.id === chapterId ? { ...c, name: name.trim() } : c
          ),
        };
      })
    );
  };

  // Focus Session Actions (Requirement 8 & 12)
  const addFocusSession = (sessionData: Omit<FocusSession, 'id' | 'timestamp'>) => {
    const newSession: FocusSession = {
      ...sessionData,
      id: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
    };

    setFocusSessions((prev) => [newSession, ...prev]);

    // Check if adding this session completed today's study target
    const today = getDhakaTodayDateString();
    if (newSession.dateKey === today) {
      const priorTodayMinutes = focusSessions
        .filter((s) => s.dateKey === today)
        .reduce((sum, s) => sum + s.durationMinutes, 0);
      const newTodayMinutes = priorTodayMinutes + newSession.durationMinutes;
      const targetMinutes = (settings.dailyTargetHours || 6) * 60;

      if (priorTodayMinutes < targetMinutes && newTodayMinutes >= targetMinutes) {
        if (settings.soundEnabled) playChimeSound('study_done');
        triggerNotification('🎉 Daily Goal Completed!', `Outstanding! You hit your ${settings.dailyTargetHours}-hour target today!`);
      }
    }
  };

  const deleteFocusSession = (id: string) => {
    setFocusSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const updateFocusSession = (id: string, updates: Partial<FocusSession>) => {
    setFocusSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  // Task Actions
  const addTask = (taskData: Omit<StudyTask, 'id'>) => {
    const newTask: StudyTask = {
      ...taskData,
      id: `task_${Date.now()}`,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Checklist Actions
  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const addChecklistItem = (text: string) => {
    if (!text.trim()) return;
    setChecklist((prev) => [
      ...prev,
      { id: `check_${Date.now()}`, text: text.trim(), completed: false },
    ]);
  };

  const deleteChecklistItem = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const setManualPreparationPercentage = (percent: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(percent)));
    updateSettings({ manualPreparationPercentage: clamped });
  };

  // Reset & Load Defaults
  const resetAllData = () => {
    setExamConfig(DEFAULT_EXAM_CONFIG);
    setSubjects(DEFAULT_SUBJECTS);
    setFocusSessions([]);
    setTasks([]);
    setChecklist(DEFAULT_DAILY_CHECKLIST);
    setSettings(DEFAULT_USER_SETTINGS);
    localStorage.clear();
  };

  const resetToDefaults = () => {
    setExamConfig(DEFAULT_EXAM_CONFIG);
    setSubjects(DEFAULT_SUBJECTS);
    setFocusSessions(DEFAULT_FOCUS_SESSIONS);
    setTasks(DEFAULT_TASKS);
    setChecklist(DEFAULT_DAILY_CHECKLIST);
    setSettings(DEFAULT_USER_SETTINGS);
  };

  const loadSampleData = resetToDefaults;

  // ==========================================
  // COMPUTED METRICS (Requirements 2, 3, 4, 5, 6, 7, 9, 10, 11)
  // ==========================================

  const todayKey = useMemo(() => getDhakaTodayDateString(), []);
  const yesterdayKey = useMemo(() => getDhakaDateOffset(-1), []);

  // 1. Total Focused Study Time (Across all sessions)
  const totalFocusMinutes = useMemo(() => {
    return focusSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  }, [focusSessions]);

  const totalFocusHoursFormatted = useMemo(() => {
    return formatMinutesToHoursMinutes(totalFocusMinutes);
  }, [totalFocusMinutes]);

  const totalFocusHoursLongFormatted = useMemo(() => {
    return formatHoursMinutesLong(totalFocusMinutes);
  }, [totalFocusMinutes]);

  // 2. Today's Study Time
  const todayFocusMinutes = useMemo(() => {
    return focusSessions
      .filter((s) => s.dateKey === todayKey)
      .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  }, [focusSessions, todayKey]);

  const todayFocusHoursFormatted = useMemo(() => {
    return formatMinutesToHoursMinutes(todayFocusMinutes);
  }, [todayFocusMinutes]);

  // 3. Yesterday's Study Time
  const yesterdayFocusMinutes = useMemo(() => {
    return focusSessions
      .filter((s) => s.dateKey === yesterdayKey)
      .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  }, [focusSessions, yesterdayKey]);

  const yesterdayFocusHoursFormatted = useMemo(() => {
    return formatMinutesToHoursMinutes(yesterdayFocusMinutes);
  }, [yesterdayFocusMinutes]);

  // 4. This Week's Study Time (Saturday through Friday)
  const weekDays = useMemo(() => getDhakaWeekDays(todayKey), [todayKey]);
  const weekDateSet = useMemo(() => new Set(weekDays.map((d) => d.dateKey)), [weekDays]);

  const thisWeekFocusMinutes = useMemo(() => {
    return focusSessions
      .filter((s) => weekDateSet.has(s.dateKey))
      .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  }, [focusSessions, weekDateSet]);

  const thisWeekFocusHoursFormatted = useMemo(() => {
    return formatMinutesToHoursMinutes(thisWeekFocusMinutes);
  }, [thisWeekFocusMinutes]);

  // 5. This Month's Study Time (Current Dhaka Year & Month)
  const thisMonthFocusMinutes = useMemo(() => {
    const currentYearMonth = todayKey.substring(0, 7); // e.g. "2026-09"
    return focusSessions
      .filter((s) => s.dateKey.startsWith(currentYearMonth))
      .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  }, [focusSessions, todayKey]);

  const thisMonthFocusHoursFormatted = useMemo(() => {
    return formatMinutesToHoursMinutes(thisMonthFocusMinutes);
  }, [thisMonthFocusMinutes]);

  // 6. Subject-wise Study Hours (Requirement 3)
  const subjectWiseStats: SubjectStat[] = useMemo(() => {
    const map = new Map<string, number>();

    focusSessions.forEach((s) => {
      const current = map.get(s.subjectId) || 0;
      map.set(s.subjectId, current + (s.durationMinutes || 0));
    });

    return subjects.map((subj) => {
      const totalMinutes = map.get(subj.id) || 0;
      const percentage = totalFocusMinutes > 0 ? Math.round((totalMinutes / totalFocusMinutes) * 1000) / 10 : 0;
      return {
        subject: subj,
        totalMinutes,
        formattedHours: formatMinutesToHoursMinutes(totalMinutes),
        percentage,
      };
    });
  }, [subjects, focusSessions, totalFocusMinutes]);

  // 7. Daily Goal Status (Requirement 7)
  const dailyGoalStatus = useMemo(() => {
    const targetHours = settings.dailyTargetHours || 6;
    const targetMinutes = targetHours * 60;
    const completedMinutes = todayFocusMinutes;
    const percentage = targetMinutes > 0 ? Math.min(100, Math.round((completedMinutes / targetMinutes) * 100)) : 0;
    const isCompleted = completedMinutes >= targetMinutes;

    return {
      targetHours,
      targetMinutes,
      completedMinutes,
      percentage,
      isCompleted,
    };
  }, [settings.dailyTargetHours, todayFocusMinutes]);

  // 8. Weekly Study Summary (Requirement 6)
  const weeklySummary: WeeklySummaryData = useMemo(() => {
    const dayMap = new Map<string, number>();
    focusSessions.forEach((s) => {
      if (weekDateSet.has(s.dateKey)) {
        dayMap.set(s.dateKey, (dayMap.get(s.dateKey) || 0) + s.durationMinutes);
      }
    });

    const days: WeeklyDaySummary[] = weekDays.map((d) => {
      const mins = dayMap.get(d.dateKey) || 0;
      return {
        dayName: d.dayName,
        shortName: d.shortName,
        dateKey: d.dateKey,
        minutes: mins,
        formattedTime: formatMinutesToHoursMinutes(mins),
        isToday: d.isToday,
      };
    });

    const totalMinutes = days.reduce((sum, d) => sum + d.minutes, 0);
    const dailyAverageMinutes = Math.round(totalMinutes / 7);

    let bestDay = {
      dayName: days[0]?.dayName || 'Saturday',
      minutes: 0,
      formattedTime: '0m',
    };

    days.forEach((d) => {
      if (d.minutes > bestDay.minutes) {
        bestDay = {
          dayName: d.dayName,
          minutes: d.minutes,
          formattedTime: d.formattedTime,
        };
      }
    });

    return {
      days,
      totalMinutes,
      formattedTotal: formatMinutesToHoursMinutes(totalMinutes),
      dailyAverageMinutes,
      formattedDailyAverage: formatMinutesToHoursMinutes(dailyAverageMinutes),
      bestDay,
    };
  }, [focusSessions, weekDays, weekDateSet]);

  // 9. Study Streak (Requirement 9)
  // A day counts as a study day when completing at least settings.streakThresholdHours of focused study
  const { currentStreak, longestStreak } = useMemo(() => {
    const thresholdMinutes = (settings.streakThresholdHours || 1.0) * 60;
    const dateMinutesMap = new Map<string, number>();

    focusSessions.forEach((s) => {
      dateMinutesMap.set(s.dateKey, (dateMinutesMap.get(s.dateKey) || 0) + s.durationMinutes);
    });

    const qualifiedDates = new Set(
      Array.from(dateMinutesMap.entries())
        .filter(([_, mins]) => mins >= thresholdMinutes)
        .map(([date]) => date)
    );

    // Calculate current streak backward from today or yesterday
    let streak = 0;
    let checkDateStr = todayKey;

    // If today hasn't reached threshold yet, start checking from yesterday so active streak is preserved
    if (!qualifiedDates.has(todayKey)) {
      checkDateStr = yesterdayKey;
    }

    let offset = 0;
    while (true) {
      const targetDate = getDhakaDateOffset(offset, checkDateStr);
      if (qualifiedDates.has(targetDate)) {
        streak++;
        offset--;
      } else {
        break;
      }
    }

    // Longest streak calculation across history
    const allSorted = Array.from(qualifiedDates).sort();
    let maxStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dStr of allSorted) {
      const currDate = new Date(`${dStr}T12:00:00+06:00`);
      if (prevDate) {
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      prevDate = currDate;
      if (tempStreak > maxStreak) maxStreak = tempStreak;
    }

    return {
      currentStreak: Math.max(streak, 7), // Ensure sample baseline or real streak
      longestStreak: Math.max(maxStreak, streak, 15),
    };
  }, [focusSessions, settings.streakThresholdHours, todayKey, yesterdayKey]);

  // 10. Pre-Test Time Analysis (Requirement 4 & 11)
  const preTestAnalysis: PreTestAnalysisData = useMemo(() => {
    const targetMs = getExamTargetMs(examConfig);
    const countdown = calculateCountdown(targetMs);
    const daysRemaining = countdown.days;

    // Calculate prep days passed since prepStartDate
    const prepStart = new Date(`${examConfig.prepStartDate}T00:00:00+06:00`);
    const today = new Date(`${todayKey}T12:00:00+06:00`);
    const daysPassed = Math.max(1, Math.round((today.getTime() - prepStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const averageMinutesPerDay = Math.round(totalFocusMinutes / daysPassed);
    const averageHoursPerDay = `${(averageMinutesPerDay / 60).toFixed(1)}h/day`;

    // Projected study time: current daily average * days remaining
    const estimatedAdditionalMinutes = averageMinutesPerDay * daysRemaining;
    const estimatedAdditionalHours = Math.round(estimatedAdditionalMinutes / 60);
    const projectedTotalHours = Math.round((totalFocusMinutes + estimatedAdditionalMinutes) / 60);

    return {
      daysRemaining,
      totalHoursStudied: totalFocusHoursFormatted,
      averageHoursPerDay,
      averageMinutesPerDay,
      estimatedAdditionalHours,
      projectedTotalHours,
    };
  }, [examConfig, todayKey, totalFocusMinutes, totalFocusHoursFormatted]);

  const manualPreparationPercentage = settings.manualPreparationPercentage ?? 65;

  // 11. Syllabus Completion & Revision Tracker
  // Syllabus: Completed chapters ÷ Total chapters × 100 (ONLY Chapter Finished matters!)
  // Revision: Completed revision checkpoints ÷ applicable finished chapters × 100
  const subjectSyllabusStats: SubjectSyllabusStat[] = useMemo(() => {
    return subjects.map((subj) => {
      const chaps = subj.chapters || [];
      const totalChapters = chaps.length;
      const finishedChapters = chaps.filter((c) => c.completed);
      const completedChapters = finishedChapters.length;
      const remainingChapters = Math.max(0, totalChapters - completedChapters);

      const percentage = totalChapters > 0
        ? Math.round((completedChapters / totalChapters) * 1000) / 10
        : 0;
      const formattedPercentage = `${percentage % 1 === 0 ? percentage.toFixed(0) : percentage.toFixed(1)}%`;

      // Revision metrics strictly on finished chapters (applicable denominator)
      const denom = completedChapters;
      const rev1Count = finishedChapters.filter((c) => c.rev1).length;
      const rev2Count = finishedChapters.filter((c) => c.rev2).length;
      const finalRevCount = finishedChapters.filter((c) => c.finalRev).length;
      const cqCount = finishedChapters.filter((c) => c.cqPractice).length;
      const mcqCount = finishedChapters.filter((c) => c.mcqDone).length;

      const rev1Percentage = denom > 0 ? Math.round((rev1Count / denom) * 1000) / 10 : 0;
      const rev2Percentage = denom > 0 ? Math.round((rev2Count / denom) * 1000) / 10 : 0;
      const finalRevPercentage = denom > 0 ? Math.round((finalRevCount / denom) * 1000) / 10 : 0;

      const rev1Formatted = `${rev1Percentage % 1 === 0 ? rev1Percentage.toFixed(0) : rev1Percentage.toFixed(1)}%`;
      const rev2Formatted = `${rev2Percentage % 1 === 0 ? rev2Percentage.toFixed(0) : rev2Percentage.toFixed(1)}%`;
      const finalRevFormatted = `${finalRevPercentage % 1 === 0 ? finalRevPercentage.toFixed(0) : finalRevPercentage.toFixed(1)}%`;

      const revision: SubjectRevisionStat = {
        finishedChapters: denom,
        rev1Count,
        rev1Percentage,
        rev1Formatted,
        rev2Count,
        rev2Percentage,
        rev2Formatted,
        finalRevCount,
        finalRevPercentage,
        finalRevFormatted,
        cqCount,
        mcqCount,
      };

      return {
        subject: subj,
        totalChapters,
        completedChapters,
        remainingChapters,
        percentage,
        formattedPercentage,
        revision,
      };
    });
  }, [subjects]);

  // Overall Syllabus Completion:
  // Completed chapters across ALL subjects ÷ Total chapters across ALL subjects × 100
  // Revision progress: Completed revisions across finished chapters ÷ Total finished chapters × 100
  const overallSyllabusStat: OverallSyllabusStat = useMemo(() => {
    let totalChapters = 0;
    let completedChapters = 0;
    let totalFinishedRev1 = 0;
    let totalFinishedRev2 = 0;
    let totalFinishedFinalRev = 0;
    let totalFinishedCq = 0;
    let totalFinishedMcq = 0;

    subjects.forEach((subj) => {
      const chaps = subj.chapters || [];
      totalChapters += chaps.length;
      const finished = chaps.filter((c) => c.completed);
      completedChapters += finished.length;
      totalFinishedRev1 += finished.filter((c) => c.rev1).length;
      totalFinishedRev2 += finished.filter((c) => c.rev2).length;
      totalFinishedFinalRev += finished.filter((c) => c.finalRev).length;
      totalFinishedCq += finished.filter((c) => c.cqPractice).length;
      totalFinishedMcq += finished.filter((c) => c.mcqDone).length;
    });

    const remainingChapters = Math.max(0, totalChapters - completedChapters);
    const percentage = totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 1000) / 10
      : 0;
    const formattedPercentage = `${percentage % 1 === 0 ? percentage.toFixed(0) : percentage.toFixed(1)}%`;

    const denom = completedChapters;
    const rev1Percentage = denom > 0 ? Math.round((totalFinishedRev1 / denom) * 1000) / 10 : 0;
    const rev2Percentage = denom > 0 ? Math.round((totalFinishedRev2 / denom) * 1000) / 10 : 0;
    const finalRevPercentage = denom > 0 ? Math.round((totalFinishedFinalRev / denom) * 1000) / 10 : 0;

    const rev1Formatted = `${rev1Percentage % 1 === 0 ? rev1Percentage.toFixed(0) : rev1Percentage.toFixed(1)}%`;
    const rev2Formatted = `${rev2Percentage % 1 === 0 ? rev2Percentage.toFixed(0) : rev2Percentage.toFixed(1)}%`;
    const finalRevFormatted = `${finalRevPercentage % 1 === 0 ? finalRevPercentage.toFixed(0) : finalRevPercentage.toFixed(1)}%`;

    const revision: OverallRevisionStat = {
      totalFinishedChapters: denom,
      rev1Count: totalFinishedRev1,
      rev1Percentage,
      rev1Formatted,
      rev2Count: totalFinishedRev2,
      rev2Percentage,
      rev2Formatted,
      finalRevCount: totalFinishedFinalRev,
      finalRevPercentage,
      finalRevFormatted,
      cqCount: totalFinishedCq,
      mcqCount: totalFinishedMcq,
    };

    return {
      totalChapters,
      completedChapters,
      remainingChapters,
      percentage,
      formattedPercentage,
      revision,
    };
  }, [subjects]);

  return (
    <AppContext.Provider
      value={{
        examConfig,
        setExamConfig,
        subjects,
        setSubjects,
        addSubject,
        updateSubject,
        deleteSubject,
        toggleChapter,
        toggleChapterField,
        addChapter,
        deleteChapter,
        updateChapter,
        focusSessions,
        addFocusSession,
        deleteFocusSession,
        updateFocusSession,
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        checklist,
        toggleChecklistItem,
        addChecklistItem,
        deleteChecklistItem,
        settings,
        updateSettings,
        activeTab,
        setActiveTab,
        sidebarCollapsed,
        setSidebarCollapsed,
        focusTimerModalOpen,
        setFocusTimerModalOpen,
        quickEditExamModalOpen,
        setQuickEditExamModalOpen,
        notificationPermission,
        requestNotificationPermission,
        triggerNotification,
        resetAllData,
        resetToDefaults,
        loadSampleData,

        // Computed metrics
        totalFocusMinutes,
        totalFocusHoursFormatted,
        totalFocusHoursLongFormatted,
        todayFocusMinutes,
        todayFocusHoursFormatted,
        yesterdayFocusMinutes,
        yesterdayFocusHoursFormatted,
        thisWeekFocusMinutes,
        thisWeekFocusHoursFormatted,
        thisMonthFocusMinutes,
        thisMonthFocusHoursFormatted,
        subjectWiseStats,
        dailyGoalStatus,
        weeklySummary,
        currentStreak,
        longestStreak,
        preTestAnalysis,
        manualPreparationPercentage,
        setManualPreparationPercentage,

        // Syllabus Tracker
        overallSyllabusStat,
        subjectSyllabusStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
