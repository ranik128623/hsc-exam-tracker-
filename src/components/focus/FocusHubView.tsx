import React from 'react';
import { FocusHubCard } from './FocusHubCard';
import { FocusSessionHistoryCard } from '../history/FocusSessionHistoryCard';
import { SubjectHoursCard } from '../subjects/SubjectHoursCard';

export function FocusHubView() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Focus Timer & Study Room
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Deep work sessions with automated study time recording across all subjects
        </p>
      </div>

      {/* Central Interactive Focus Card */}
      <FocusHubCard isFullScreenView={true} />

      {/* Subject Hours Summary */}
      <SubjectHoursCard />

      {/* Recent Focus Session Logs */}
      <FocusSessionHistoryCard />
    </div>
  );
}
