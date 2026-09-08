import React, { useState } from 'react';
import { usePWAInstall } from '../../utils/usePWAInstall';
import { Download, Share2, PlusSquare, CheckCircle2, X, Smartphone, Tablet } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'compact' | 'card' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'navbar',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, isIPad, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running in standalone mode on home screen, hide the install prompts
  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                PWA Installed & Standalone
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                Pre-Test Command Center is running in full screen mode.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[10px] font-extrabold uppercase tracking-wide">
            Active
          </span>
        </div>
      );
    }
    return null;
  }

  const handleClick = () => {
    if (isInstallable) {
      install();
    } else {
      setShowGuide(true);
    }
  };

  const renderButton = () => {
    if (variant === 'card') {
      return (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Install as iPad & iPhone App
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Fullscreen standalone display, instant offline access, and fast launching
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClick}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isInstallable ? 'Install App' : 'Add to Home Screen'}</span>
          </button>
        </div>
      );
    }

    if (variant === 'compact') {
      return (
        <button
          type="button"
          onClick={handleClick}
          className={`px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer ${className}`}
          title="Install app on your device"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>
      );
    }

    // Default 'navbar' variant
    return (
      <button
        type="button"
        id="btn-install-pwa"
        onClick={handleClick}
        className={`px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${className}`}
        title="Install Pre-Test Command Center as a Standalone App"
        aria-label="Install App"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  };

  return (
    <>
      {renderButton()}

      {/* iPad & iPhone Home Screen Installation Guide Modal */}
      {showGuide && (
        <div
          id="pwa-install-guide-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                  {isIPad ? <Tablet className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {isIPad ? 'Install on iPad (iPadOS)' : isIOS ? 'Install on iPhone (iOS)' : 'Install App'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Standalone mode without browser address bar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step-by-step Guide */}
            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Tap the Safari Share button</span>
                    <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Located in the top toolbar on iPad, or at the bottom bar on iPhone.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Select &quot;Add to Home Screen&quot;</span>
                    <PlusSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Scroll down the share sheet actions to find &quot;Add to Home Screen&quot;.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    Tap &quot;Add&quot; in the top-right corner
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <strong>Pre-Test Command Center</strong> icon will appear on your iPad/iPhone screen.
                  </p>
                </div>
              </div>
            </div>

            {/* Benefits Banner */}
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[11px] leading-relaxed border border-emerald-200/60 dark:border-emerald-900/60">
              ✨ <strong>Standalone Experience:</strong> When opened from the Home Screen, Safari will run in full screen without the browser URL address bar or navigation buttons.
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
