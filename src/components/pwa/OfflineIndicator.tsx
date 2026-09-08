import React from 'react';
import { useOnlineStatus } from '../../utils/useOnlineStatus';
import { WifiOff, Database } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="pwa-offline-indicator"
      className="fixed bottom-16 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 flex items-center justify-between sm:justify-start gap-2.5 px-4 py-2.5 rounded-xl bg-amber-600 text-white shadow-lg backdrop-blur-md border border-amber-500/80 animate-in fade-in slide-in-from-bottom duration-300"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-amber-200 animate-pulse" />
        <span className="text-xs font-bold">Offline Mode Active</span>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-amber-100 bg-amber-700/60 px-2 py-0.5 rounded-md">
        <Database className="w-3 h-3" />
        <span>Local Data Persisted</span>
      </div>
    </div>
  );
};
