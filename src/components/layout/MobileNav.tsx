import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import {
  LayoutDashboard,
  Timer,
  BookCheck,
  BookOpen,
  CalendarCheck,
  Settings,
} from 'lucide-react';

export function MobileNav() {
  const { activeTab, setActiveTab, tasks } = useApp();

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  const items: { id: ActiveTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'focus', label: 'Focus', icon: Timer },
    { id: 'syllabus', label: 'Syllabus', icon: BookCheck },
    { id: 'subjects', label: 'Hours', icon: BookOpen },
    { id: 'planner', label: 'Tasks', icon: CalendarCheck, badge: pendingTasksCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 md:hidden pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom,0px))] px-2 transition-colors">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative flex flex-col items-center justify-center min-h-[44px] min-w-[48px] py-1 px-2 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer select-none ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/60 dark:bg-emerald-950/40'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="mt-0.5 text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
