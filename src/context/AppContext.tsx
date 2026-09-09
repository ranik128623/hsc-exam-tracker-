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
  TimerMode,
  TimerPreset,
  ActiveTimerState,
  MockTest,
  SmartStudyRecommendation,
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
  getDhakaTimeString,
  getDhakaDateOffset,
  getDhakaWeekDays,
  formatMinutesToHoursMinutes,
  formatHoursMinutesLong,
  getExamTargetMs,
  calculateCountdown,
} from '../utils/timeUtils';
import { playChimeSound } from '../utils/audioAndQuotes';

const STORAGE_KEY = 'pretest_dash_v2';

// Safe localStorage getter with backward compatibility across all past keys
const getStoredItem = (subKey: string): string | null => {
  try {
    return (
      localStorage.getItem(`${STORAGE_KEY}_${subKey}`) ||
      localStorage.getItem(`pretest_dash_${subKey}`) ||
      localStorage.getItem(`pretest_dash_v1_${subKey}`)
    );
  } catch {
    return null;
  }
};

const DEFAULT_MOCK_TESTS: MockTest[] = [
  {
    id: 'mock_1',
    name: 'Physics 1st Paper - Full Model Test',
    date: '2026-09-04',
    subjectId: 'sub_physics',
    subjectName: 'Physics',
    totalMarks: 100,
    obtainedMarks: 84,
    percentage: 84.0,
    timeTakenMinutes: 120,
    mistakes: 'Formula recall error in Vector projections and Thermodynamics efficiency.',
    weakAreas: 'Thermodynamics Carnot Cycle CQ',
  },
  {
    id: 'mock_2',
    name: 'Chemistry 1st Paper - CQ & MCQ Model Test',
    date: '2026-09-06',
    subjectId: 'sub_chemistry',
    subjectName: 'Chemistry',
    totalMarks: 75,
    obtainedMarks: 62,
    percentage: 82.7,
    timeTakenMinutes: 90,
    mistakes: 'Buffer solution pH precision in numericals.',
    weakAreas: 'Chemical Equilibrium equilibrium constants',
  },
];

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
  activeTimer: ActiveTimerState;
  startTimer: () => void;
  pauseTimer: () => void;
  toggleTimerPlay: () => void;
  resetTimer: () => void;
  applyTimerPreset: (preset: TimerPreset, sMin?: number, bMin?: number) => void;
  setTimerSubject: (subjectId: string) => void;
  setTimerNotes: (notes: string) => void;
  skipBreak: () => void;
  finishAndLogSession: (customMinutes?: number) => void;
  dismissCompletionAlert: () => void;
  toggleTimerMinimized: () => void;
  setTimerMinimized: (minimized: boolean) => void;
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

  // Mock Tests
  mockTests: MockTest[];
  addMockTest: (test: Omit<MockTest, 'id' | 'percentage'>) => void;
  deleteMockTest: (id: string) => void;
  updateMockTest: (id: string, test: Partial<MockTest>) => void;
  mockTestStats: {
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    totalTests: number;
  };

  // Smart Recommendation & Helper
  smartRecommendation: SmartStudyRecommendation | null;
  updateTopic: (subjectId: string, topicId: string, updates?: any) => void;

  // Data Export & Import (JSON)
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // 1. Exam Configuration
  const [examConfig, setExamConfig] = useState<ExamConfig>(() => {
    try {
      const saved = getStoredItem('exam_config');
      return saved ? JSON.parse(saved) : DEFAULT_EXAM_CONFIG;
    } catch {
      return DEFAULT_EXAM_CONFIG;
    }
  });

  // 2. Subjects (Bangla, English, Physics, Chemistry, Math, Biology, ICT, editable from Settings)
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = getStoredItem('subjects');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((subj: Subject) => {
            const def = DEFAULT_SUBJECTS.find(
              (d) => d.id === subj.id || d.name.toLowerCase() === subj.name.toLowerCase()
            );
            const chapters = subj.chapters !== undefined ? subj.chapters : (def?.chapters || []);
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
      const saved = getStoredItem('sessions');
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
      const saved = getStoredItem('tasks');
      return saved ? JSON.parse(saved) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  });

  // 5. Daily Checklist
  const [checklist, setChecklist] = useState<DailyChecklistItem[]>(() => {
    try {
      const saved = getStoredItem('checklist');
      return saved ? JSON.parse(saved) : DEFAULT_DAILY_CHECKLIST;
    } catch {
      return DEFAULT_DAILY_CHECKLIST;
    }
  });

  // 6. User Settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = getStoredItem('settings');
      return saved ? { ...DEFAULT_USER_SETTINGS, ...JSON.parse(saved) } : DEFAULT_USER_SETTINGS;
    } catch {
      return DEFAULT_USER_SETTINGS;
    }
  });

  // 7. Mock Tests (Requirement 18)
  const [mockTests, setMockTests] = useState<MockTest[]>(() => {
    try {
      const saved = getStoredItem('mock_tests');
      return saved ? JSON.parse(saved) : DEFAULT_MOCK_TESTS;
    } catch {
      return DEFAULT_MOCK_TESTS;
    }
  });

  // 7. Navigation & Modals
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [focusTimerModalOpen, setFocusTimerModalOpen] = useState<boolean>(false);
  const [quickEditExamModalOpen, setQuickEditExamModalOpen] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // 8. Active Floating & Global Focus Timer
  const [activeTimer, setActiveTimer] = useState<ActiveTimerState>(() => {
    const defaultTimer: ActiveTimerState = {
      isRunning: false,
      mode: 'study',
      studyMinutes: 25,
      breakMinutes: 5,
      secondsRemaining: 25 * 60,
      selectedSubjectId: subjects.length > 0 ? subjects[0].id : '',
      preset: '25-5',
      sessionNotes: '',
      targetEndTime: null,
      completedSessionsCount: 0,
      isMinimized: false,
      showCompletionAlert: false,
      lastCompletedMinutes: 25,
    };
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_active_timer`);
      if (saved) {
        const parsed: ActiveTimerState = JSON.parse(saved);
        if (parsed.isRunning && parsed.targetEndTime) {
          const diff = Math.round((parsed.targetEndTime - Date.now()) / 1000);
          if (diff > 0) {
            return { ...parsed, secondsRemaining: diff };
          } else {
            return {
              ...parsed,
              isRunning: false,
              secondsRemaining: 0,
              targetEndTime: null,
              showCompletionAlert: true,
            };
          }
        }
        return parsed;
      }
    } catch {}
    return defaultTimer;
  });

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_active_timer`, JSON.stringify(activeTimer));
    } catch (e) {
      console.error('Failed to save activeTimer', e);
    }
  }, [activeTimer]);

  useEffect(() => {
    if (subjects.length > 0 && !activeTimer.selectedSubjectId) {
      setActiveTimer((prev) => ({ ...prev, selectedSubjectId: subjects[0].id }));
    }
  }, [subjects, activeTimer.selectedSubjectId]);

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

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_mock_tests`, JSON.stringify(mockTests));
    } catch (e) {
      console.error('Failed to save mockTests', e);
    }
  }, [mockTests]);

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

  // ----------------------------------------------------
  // Active Timer Actions & Real-Time Loop
  // ----------------------------------------------------
  const handleGlobalTimerComplete = () => {
    if (activeTimer.mode === 'study') {
      if (settings.soundEnabled) {
        playChimeSound('study_done');
      }
      triggerNotification(
        'Focus Session Complete! 🎉',
        `Great work! Take a ${activeTimer.breakMinutes}-minute break to recharge.`
      );

      const activeSubject = subjects.find((s) => s.id === activeTimer.selectedSubjectId) || subjects[0];
      const completedMins = activeTimer.studyMinutes;
      const today = getDhakaTodayDateString();
      const timeInfo = getDhakaTimeString();

      if (activeSubject) {
        addFocusSession({
          subjectId: activeSubject.id,
          subjectName: activeSubject.name,
          durationMinutes: completedMins,
          dateKey: today,
          timeStr: timeInfo.time,
          notes: activeTimer.sessionNotes.trim() || `${activeTimer.preset} focused session`,
          presetUsed: activeTimer.preset,
        });
      }

      // Auto switch to break mode
      setActiveTimer((prev) => ({
        ...prev,
        isRunning: false,
        mode: 'break',
        secondsRemaining: prev.breakMinutes * 60,
        targetEndTime: null,
        completedSessionsCount: prev.completedSessionsCount + 1,
        showCompletionAlert: true,
        lastCompletedMinutes: completedMins,
      }));
    } else {
      if (settings.soundEnabled) {
        playChimeSound('break_done');
      }
      triggerNotification('Break Finished! 🔔', 'Ready to begin your next focused study session?');

      setActiveTimer((prev) => ({
        ...prev,
        isRunning: false,
        mode: 'study',
        secondsRemaining: prev.studyMinutes * 60,
        targetEndTime: null,
      }));
    }
  };

  useEffect(() => {
    let interval: number | null = null;

    if (activeTimer.isRunning && activeTimer.targetEndTime) {
      const syncCountdown = () => {
        if (!activeTimer.targetEndTime) return;
        const diff = Math.round((activeTimer.targetEndTime - Date.now()) / 1000);
        if (diff <= 0) {
          handleGlobalTimerComplete();
        } else {
          setActiveTimer((prev) => ({ ...prev, secondsRemaining: diff }));
          const m = Math.floor(diff / 60);
          const s = diff % 60;
          const icon = activeTimer.mode === 'study' ? '📚' : '☕';
          document.title = `(${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}) ${icon} Pre-Test Command Center`;
        }
      };

      interval = window.setInterval(syncCountdown, 1000);

      const handleVisibility = () => {
        if (document.visibilityState === 'visible' && activeTimer.isRunning) {
          syncCountdown();
        }
      };
      document.addEventListener('visibilitychange', handleVisibility);

      return () => {
        if (interval) clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibility);
      };
    } else {
      document.title = 'Pre-Test Command Center | Bangladesh Standard Time';
    }
  }, [
    activeTimer.isRunning,
    activeTimer.targetEndTime,
    activeTimer.mode,
    activeTimer.studyMinutes,
    activeTimer.breakMinutes,
    activeTimer.selectedSubjectId,
    subjects,
    settings.soundEnabled,
  ]);

  const startTimer = () => {
    const targetEnd = Date.now() + activeTimer.secondsRemaining * 1000;
    if (settings.soundEnabled) {
      playChimeSound('timer_start');
    }
    setActiveTimer((prev) => ({
      ...prev,
      isRunning: true,
      targetEndTime: targetEnd,
    }));
  };

  const pauseTimer = () => {
    setActiveTimer((prev) => ({
      ...prev,
      isRunning: false,
      targetEndTime: null,
    }));
  };

  const toggleTimerPlay = () => {
    if (activeTimer.isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  const resetTimer = () => {
    setActiveTimer((prev) => ({
      ...prev,
      isRunning: false,
      targetEndTime: null,
      secondsRemaining: (prev.mode === 'study' ? prev.studyMinutes : prev.breakMinutes) * 60,
    }));
    document.title = 'Pre-Test Command Center | Bangladesh Standard Time';
  };

  const applyTimerPreset = (preset: TimerPreset, sMin?: number, bMin?: number) => {
    let s = 25;
    let b = 5;
    if (preset === '25-5') {
      s = 25;
      b = 5;
    } else if (preset === '50-10') {
      s = 50;
      b = 10;
    } else if (preset === '60-10') {
      s = 60;
      b = 10;
    } else if (preset === 'custom') {
      s = sMin || activeTimer.studyMinutes;
      b = bMin || activeTimer.breakMinutes;
    }

    setActiveTimer((prev) => ({
      ...prev,
      isRunning: false,
      targetEndTime: null,
      preset,
      studyMinutes: s,
      breakMinutes: b,
      mode: 'study',
      secondsRemaining: s * 60,
    }));
    document.title = 'Pre-Test Command Center | Bangladesh Standard Time';
  };

  const setTimerSubject = (subjectId: string) => {
    setActiveTimer((prev) => ({ ...prev, selectedSubjectId: subjectId }));
  };

  const setTimerNotes = (notes: string) => {
    setActiveTimer((prev) => ({ ...prev, sessionNotes: notes }));
  };

  const skipBreak = () => {
    setActiveTimer((prev) => ({
      ...prev,
      isRunning: false,
      targetEndTime: null,
      mode: 'study',
      secondsRemaining: prev.studyMinutes * 60,
    }));
    document.title = 'Pre-Test Command Center | Bangladesh Standard Time';
  };

  const finishAndLogSession = (customMinutes?: number) => {
    const totalCurrentSec = activeTimer.studyMinutes * 60;
    const elapsedSec = Math.max(0, totalCurrentSec - activeTimer.secondsRemaining);
    const elapsedMin = customMinutes ?? Math.max(1, Math.round(elapsedSec / 60));

    const activeSubject = subjects.find((s) => s.id === activeTimer.selectedSubjectId) || subjects[0];
    const today = getDhakaTodayDateString();
    const timeInfo = getDhakaTimeString();

    if (activeSubject) {
      addFocusSession({
        subjectId: activeSubject.id,
        subjectName: activeSubject.name,
        durationMinutes: elapsedMin,
        dateKey: today,
        timeStr: timeInfo.time,
        notes: activeTimer.sessionNotes.trim() || `${activeTimer.preset} finished early (${elapsedMin}m)`,
        presetUsed: activeTimer.preset,
      });
    }

    if (settings.soundEnabled) {
      playChimeSound('study_done');
    }

    setActiveTimer((prev) => ({
      ...prev,
      isRunning: false,
      targetEndTime: null,
      mode: 'study',
      secondsRemaining: prev.studyMinutes * 60,
      sessionNotes: '',
      showCompletionAlert: true,
      lastCompletedMinutes: elapsedMin,
    }));
    document.title = 'Pre-Test Command Center | Bangladesh Standard Time';
  };

  const dismissCompletionAlert = () => {
    setActiveTimer((prev) => ({ ...prev, showCompletionAlert: false }));
  };

  const toggleTimerMinimized = () => {
    setActiveTimer((prev) => ({ ...prev, isMinimized: !prev.isMinimized }));
  };

  const setTimerMinimized = (minimized: boolean) => {
    setActiveTimer((prev) => ({ ...prev, isMinimized: minimized }));
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

  // Mock Tests Actions (Requirement 18)
  const addMockTest = (testData: Omit<MockTest, 'id' | 'percentage'>) => {
    const percentage =
      testData.totalMarks > 0
        ? Math.round((testData.obtainedMarks / testData.totalMarks) * 1000) / 10
        : 0;
    const newTest: MockTest = {
      ...testData,
      id: `mock_${Date.now()}`,
      percentage,
    };
    setMockTests((prev) => [newTest, ...prev]);
  };

  const deleteMockTest = (id: string) => {
    setMockTests((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMockTest = (id: string, updates: Partial<MockTest>) => {
    setMockTests((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const merged = { ...m, ...updates };
        if (updates.totalMarks !== undefined || updates.obtainedMarks !== undefined) {
          merged.percentage =
            merged.totalMarks > 0
              ? Math.round((merged.obtainedMarks / merged.totalMarks) * 1000) / 10
              : 0;
        }
        return merged;
      })
    );
  };

  // Helper to complete topic / chapter from recommendation
  const updateTopic = (subjectId: string, topicId: string, updates?: any) => {
    toggleChapterField(subjectId, topicId, 'completed');
    if (updates?.firstRevision) {
      toggleChapterField(subjectId, topicId, 'rev1');
    }
  };

  // Data Backup / Export & Import (Requirement 21)
  const exportDataJSON = (): string => {
    const backupData = {
      app: 'Pre-Test Command Center',
      version: '2.0',
      exportDate: new Date().toISOString(),
      examConfig,
      subjects,
      focusSessions,
      tasks,
      checklist,
      settings,
      mockTests,
    };
    return JSON.stringify(backupData, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== 'object') return false;

      if (data.examConfig && typeof data.examConfig === 'object') {
        setExamConfig(data.examConfig);
      }
      if (Array.isArray(data.subjects) && data.subjects.length > 0) {
        setSubjects(data.subjects);
      }
      if (Array.isArray(data.focusSessions)) {
        setFocusSessions(data.focusSessions);
      }
      if (Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      }
      if (Array.isArray(data.checklist)) {
        setChecklist(data.checklist);
      }
      if (data.settings && typeof data.settings === 'object') {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }
      if (Array.isArray(data.mockTests)) {
        setMockTests(data.mockTests);
      }
      return true;
    } catch (e) {
      console.error('Failed to parse backup JSON', e);
      return false;
    }
  };

  // Reset & Load Defaults (Data Safety Guaranteed: never clears unselected keys)
  const resetAllData = () => {
    setExamConfig(DEFAULT_EXAM_CONFIG);
    setSubjects(DEFAULT_SUBJECTS);
    setFocusSessions([]);
    setTasks([]);
    setChecklist(DEFAULT_DAILY_CHECKLIST);
    setSettings(DEFAULT_USER_SETTINGS);
    setMockTests([]);
  };

  const resetToDefaults = () => {
    setExamConfig(DEFAULT_EXAM_CONFIG);
    setSubjects(DEFAULT_SUBJECTS);
    setFocusSessions(DEFAULT_FOCUS_SESSIONS);
    setTasks(DEFAULT_TASKS);
    setChecklist(DEFAULT_DAILY_CHECKLIST);
    setSettings(DEFAULT_USER_SETTINGS);
    setMockTests(DEFAULT_MOCK_TESTS);
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
      currentStreak: streak,
      longestStreak: Math.max(maxStreak, streak),
    };
  }, [focusSessions, settings.streakThresholdHours, todayKey, yesterdayKey]);

  // Mock Test Stats (Requirement 18)
  const mockTestStats = useMemo(() => {
    if (mockTests.length === 0) {
      return { averageScore: 0, highestScore: 0, lowestScore: 0, totalTests: 0 };
    }
    const scores = mockTests.map((m) => m.percentage);
    const sum = scores.reduce((a, b) => a + b, 0);
    const averageScore = Math.round((sum / scores.length) * 10) / 10;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    return {
      averageScore,
      highestScore,
      lowestScore,
      totalTests: mockTests.length,
    };
  }, [mockTests]);

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

  // 13. Smart Study Recommendation Engine (Requirement 10)
  const smartRecommendation: SmartStudyRecommendation | null = useMemo(() => {
    if (subjects.length === 0) return null;

    // 1. Check for high priority pending task
    const pendingHighTask = tasks.find((t) => !t.completed && t.priority === 'high');
    if (pendingHighTask && pendingHighTask.subjectId) {
      const subj = subjects.find((s) => s.id === pendingHighTask.subjectId) || subjects[0];
      return {
        subjectId: subj.id,
        subjectName: subj.name,
        title: pendingHighTask.name,
        recommendedMinutes: pendingHighTask.estimatedMinutes > 30 ? 50 : 25,
        reason: 'High priority task scheduled for today + pending completion.',
      };
    }

    // 2. Check for chapters with Revision due (finished chapters where rev1 or rev2 not completed)
    for (const subj of subjects) {
      const chaps = subj.chapters || [];
      const revDue = chaps.find((c) => c.completed && (!c.rev1 || !c.rev2));
      if (revDue) {
        const stage = !revDue.rev1 ? 'Revision 1' : 'Revision 2';
        return {
          subjectId: subj.id,
          subjectName: subj.name,
          title: revDue.name,
          chapterId: revDue.id,
          topicId: revDue.id,
          recommendedMinutes: 50,
          reason: `${stage} due • High-yield active recall before exam.`,
        };
      }
    }

    // 3. Subject with unfinished chapters and lowest syllabus progress
    let targetSubj = subjects[0];
    let lowestPct = 101;
    for (const stat of subjectSyllabusStats) {
      if (stat.remainingChapters > 0 && stat.percentage < lowestPct) {
        lowestPct = stat.percentage;
        targetSubj = stat.subject;
      }
    }

    const unfinished = (targetSubj.chapters || []).find((c) => !c.completed);
    if (unfinished) {
      return {
        subjectId: targetSubj.id,
        subjectName: targetSubj.name,
        title: unfinished.name,
        chapterId: unfinished.id,
        topicId: unfinished.id,
        recommendedMinutes: 50,
        reason: 'Lowest syllabus completion in this subject • High-yield chapter.',
      };
    }

    // 4. Default review sprint
    const sub = subjects[0];
    return {
      subjectId: sub.id,
      subjectName: sub.name,
      title: sub.chapters?.[0]?.name || 'Core Concept Drill',
      recommendedMinutes: 25,
      reason: 'Regular daily target booster • Quick focus sprint.',
    };
  }, [subjects, tasks, subjectSyllabusStats]);

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
        mockTests,
        addMockTest,
        deleteMockTest,
        updateMockTest,
        mockTestStats,
        smartRecommendation,
        updateTopic,
        exportDataJSON,
        importDataJSON,
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
        activeTimer,
        startTimer,
        pauseTimer,
        toggleTimerPlay,
        resetTimer,
        applyTimerPreset,
        setTimerSubject,
        setTimerNotes,
        skipBreak,
        finishAndLogSession,
        dismissCompletionAlert,
        toggleTimerMinimized,
        setTimerMinimized,
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
