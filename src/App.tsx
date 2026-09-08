/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { FocusTimerModal } from './components/modals/FocusTimerModal';
import { QuickEditExamModal } from './components/modals/QuickEditExamModal';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { FocusHubView } from './components/focus/FocusHubView';
import { SyllabusTrackerView } from './components/syllabus/SyllabusTrackerView';
import { SubjectsView } from './components/subjects/SubjectsView';
import { FocusSessionHistoryCard } from './components/history/FocusSessionHistoryCard';
import { StudyPlannerView } from './components/planner/StudyPlannerView';
import { StatisticsView } from './components/statistics/StatisticsView';
import { SettingsView } from './components/settings/SettingsView';

function MainContent() {
  const { activeTab, sidebarCollapsed } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'focus':
        return <FocusHubView />;
      case 'syllabus':
        return <SyllabusTrackerView />;
      case 'subjects':
        return <SubjectsView />;
      case 'history':
        return (
          <div className="max-w-6xl mx-auto space-y-6 pb-12">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Focus Session History & Logs
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Complete timeline of all recorded study sessions with subject filtering and manual entry
              </p>
            </div>
            <FocusSessionHistoryCard />
          </div>
        );
      case 'planner':
        return <StudyPlannerView />;
      case 'analytics':
        return <StatisticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 pl-safe pr-safe">
      {/* Top Navbar with Safe Area Support */}
      <Navbar
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar & Mobile Drawer */}
        <Sidebar
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
        />

        {/* Main View Area with iPad & iPhone Safe Padding */}
        <main
          className={`flex-1 overflow-y-auto px-4 py-5 sm:px-6 md:px-8 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-12 transition-all duration-300 ${
            sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
          }`}
        >
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile & iPad Bottom Navigation */}
      <MobileNav />

      {/* Offline Status Pill for PWA */}
      <OfflineIndicator />

      {/* Global Modals */}
      <FocusTimerModal />
      <QuickEditExamModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
