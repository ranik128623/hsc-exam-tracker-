import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateCountdown, getExamTargetMs, getWarningMode, getDhakaTimeString } from '../../utils/timeUtils';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import {
  Timer,
  Sun,
  Moon,
  Bell,
  BellOff,
  Flame,
  AlertTriangle,
  Clock,
  Menu,
  X,
  Calendar,
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  mobileMenuOpen: boolean;
}

export function Navbar({ onToggleMobileMenu, mobileMenuOpen }: NavbarProps) {
  const {
    examConfig,
    settings,
    updateSettings,
    setFocusTimerModalOpen,
    setQuickEditExamModalOpen,
    notificationPermission,
    requestNotificationPermission,
    currentStreak,
  } = useApp();

  const [dhakaTime, setDhakaTime] = useState(getDhakaTimeString());
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  // Update clock and days remaining
  useEffect(() => {
    const updateTime = () => {
      setDhakaTime(getDhakaTimeString());
      const targetMs = getExamTargetMs(examConfig);
      const res = calculateCountdown(targetMs);
      setDaysRemaining(res.days);
      setIsExpired(res.isExpired);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [examConfig]);

  const warning = getWarningMode(daysRemaining, isExpired);

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const toggleEmergencyMode = () => {
    updateSettings({ emergencyModeActive: !settings.emergencyModeActive });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors pt-safe shrink-0">
      <div className="w-full px-4 sm:px-6 lg:px-8 min-h-16 py-2 flex items-center justify-between gap-2 overflow-x-hidden">
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            id="btn-mobile-menu"
            onClick={onToggleMobileMenu}
            className="p-2 min-w-[40px] min-h-[40px] rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden flex items-center justify-center cursor-pointer active:scale-95 shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm font-bold text-base sm:text-lg shrink-0">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-sm sm:text-base lg:text-lg tracking-tight text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-none">
                  Pre-Test Command Center
                </span>
                <span className="hidden xl:inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                  UTC+6 BST
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden xl:block">
                Bangladesh Standard Time • Live Exam Countdown
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Dhaka Clock & Warning Mode Pill */}
        <div className="hidden xl:flex items-center gap-2 shrink-0">
          {/* Dhaka Clock Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60">
            <Clock className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span className="font-mono font-semibold">{dhakaTime.time}</span>
            <span className="text-slate-400">({dhakaTime.date})</span>
          </div>

          {/* Mode Pill */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${warning.badgeClass}`}
            title={warning.phaseDesc}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            <span>{warning.name}</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* PWA Install Button */}
          <PWAInstallButton variant="navbar" />

          {/* Quick Edit Exam Date Trigger */}
          <button
            id="btn-quick-edit-exam"
            onClick={() => setQuickEditExamModalOpen(true)}
            className="p-2 min-w-[38px] min-h-[38px] rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 transition-colors flex items-center justify-center cursor-pointer active:scale-95 shrink-0"
            title="Edit Exam Date & Time"
            aria-label="Edit Exam Date and Time"
          >
            <Calendar className="w-4 h-4" />
          </button>

          {/* Emergency Mode Toggle */}
          <button
            id="btn-toggle-emergency-mode"
            onClick={toggleEmergencyMode}
            className={`px-2 py-1.5 min-h-[38px] rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer active:scale-95 shrink-0 ${
              settings.emergencyModeActive
                ? 'bg-rose-500 text-white border-rose-600 shadow-sm animate-pulse'
                : 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Toggle Exam Emergency Mode (<7 days focus mode)"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-current" />
            <span className="hidden lg:inline">Emergency Mode</span>
          </button>

          {/* Streak indicator */}
          {currentStreak > 0 && (
            <div className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 min-h-[38px] rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{currentStreak}d Streak</span>
            </div>
          )}

          {/* Focus Timer Launch Button */}
          <button
            id="btn-launch-focus-timer"
            onClick={() => setFocusTimerModalOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 min-h-[38px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer shrink-0"
          >
            <Timer className="w-4 h-4" />
            <span className="hidden sm:inline">Focus Timer</span>
            <span className="sm:hidden">Timer</span>
          </button>

          {/* Notifications Permission */}
          <button
            id="btn-toggle-notifications"
            onClick={requestNotificationPermission}
            className="p-2 min-w-[38px] min-h-[38px] rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer active:scale-95 shrink-0"
            title={
              notificationPermission === 'granted'
                ? 'Notifications are active'
                : 'Enable Study Reminders'
            }
            aria-label="Toggle notifications"
          >
            {notificationPermission === 'granted' ? (
              <Bell className="w-4 h-4 text-emerald-500" />
            ) : (
              <BellOff className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Dark / Light Toggle */}
          <button
            id="btn-toggle-theme"
            onClick={toggleTheme}
            className="p-2 min-w-[38px] min-h-[38px] rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer active:scale-95 shrink-0"
            title={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle Dark or Light theme"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
