import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import {
  LayoutDashboard,
  Timer,
  BookOpen,
  BookCheck,
  CalendarCheck,
  History,
  BarChart3,
  Settings,
  Flame,
  Award,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface SidebarProps {
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

export function Sidebar({ mobileMenuOpen, onCloseMobileMenu }: SidebarProps) {
  const {
    activeTab,
    setActiveTab,
    tasks,
    currentStreak,
    totalFocusHoursFormatted,
    overallSyllabusStat,
    manualPreparationPercentage,
    setFocusTimerModalOpen,
  } = useApp();

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'focus',
      label: 'Focus Timer',
      icon: Timer,
      badge: 'Live',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    },
    {
      id: 'syllabus',
      label: 'Syllabus Tracker',
      icon: BookCheck,
      badge: overallSyllabusStat.formattedPercentage,
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold',
    },
    {
      id: 'subjects',
      label: 'Subject Hours',
      icon: BookOpen,
    },
    {
      id: 'history',
      label: 'Session History',
      icon: History,
    },
    {
      id: 'planner',
      label: 'Daily Tasks',
      icon: CalendarCheck,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    },
    {
      id: 'analytics',
      label: 'Time Analysis',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobileMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobileMenu}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between pb-[max(1rem,env(safe-area-inset-bottom,0px))] transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          top: 'calc(4rem + max(0.5rem, env(safe-area-inset-top, 0px)))',
        }}
      >
        {/* Navigation Items */}
        <div className="p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Quick Stats Card (Streak & Manual Prep Progress) */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>{currentStreak} Day Streak</span>
              </div>
              <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">
                {totalFocusHoursFormatted}
              </span>
            </div>

            {/* Preparation Progress */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <span>Self-Assessment</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {manualPreparationPercentage}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${manualPreparationPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => setFocusTimerModalOpen(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Timer className="w-4 h-4 text-emerald-400" />
            <span>Quick Focus Timer</span>
          </button>
        </div>
      </aside>
    </>
  );
}
