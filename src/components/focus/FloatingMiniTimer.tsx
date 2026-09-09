import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Play,
  Pause,
  Maximize2,
  Minimize2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ExternalLink,
  HelpCircle,
  X,
  Volume2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { playChimeSound } from '../../utils/audioAndQuotes';

export function FloatingMiniTimer() {
  const {
    activeTimer,
    toggleTimerPlay,
    resetTimer,
    finishAndLogSession,
    dismissCompletionAlert,
    toggleTimerMinimized,
    setFocusTimerModalOpen,
    focusTimerModalOpen,
    subjects,
    settings,
  } = useApp();

  const [pipActive, setPipActive] = useState(false);
  const [showIpadGuide, setShowIpadGuide] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const activeSubject = subjects.find((s) => s.id === activeTimer.selectedSubjectId) || subjects[0];
  const totalSeconds = (activeTimer.mode === 'study' ? activeTimer.studyMinutes : activeTimer.breakMinutes) * 60;
  const progressPercent = totalSeconds > 0
    ? Math.min(100, Math.max(0, ((totalSeconds - activeTimer.secondsRemaining) / totalSeconds) * 100))
    : 0;

  const minutes = Math.floor(activeTimer.secondsRemaining / 60);
  const seconds = activeTimer.secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Only render floating timer if session has started / is active / is paused,
  // or user minimized it, AND the full modal is NOT open.
  const hasActiveSession =
    activeTimer.isRunning ||
    activeTimer.secondsRemaining < totalSeconds ||
    activeTimer.showCompletionAlert ||
    activeTimer.isMinimized;

  // Picture-in-Picture (PiP) Stream Updater
  useEffect(() => {
    if (!pipActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw frame on canvas
    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, w, h);

    // Accent line
    ctx.fillStyle = activeTimer.mode === 'study' ? '#10b981' : '#f59e0b';
    ctx.fillRect(0, 0, w, 6);

    // Mode Tag
    ctx.fillStyle = activeTimer.mode === 'study' ? '#10b981' : '#f59e0b';
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText(
      activeTimer.mode === 'study' ? '● STUDY SESSION' : '● BREAK TIME',
      24,
      38
    );

    // Subject Name
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    const subName = activeSubject ? activeSubject.name : 'Focus Session';
    ctx.fillText(subName.slice(0, 22), 24, 66);

    // Big Monospace Time
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 68px "Courier New", Courier, monospace';
    ctx.fillText(formattedTime, 24, 142);

    // Status text
    ctx.fillStyle = activeTimer.isRunning ? '#34d399' : '#f87171';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText(
      activeTimer.isRunning ? '▶ RUNNING' : '⏸ PAUSED',
      w - 110,
      142
    );
  }, [pipActive, formattedTime, activeTimer.mode, activeTimer.isRunning, activeSubject]);

  const handleTogglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setPipActive(false);
        return;
      }

      if (!canvasRef.current || !videoRef.current) {
        setShowIpadGuide(true);
        return;
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;

      // Ensure canvas has content
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (typeof (canvas as any).captureStream === 'function') {
        const stream = (canvas as any).captureStream(10);
        video.srcObject = stream;
        await video.play();
        if (typeof video.requestPictureInPicture === 'function') {
          await video.requestPictureInPicture();
          setPipActive(true);
          video.addEventListener('leavepictureinpicture', () => {
            setPipActive(false);
          }, { once: true });
        } else {
          setShowIpadGuide(true);
        }
      } else {
        setShowIpadGuide(true);
      }
    } catch (err) {
      console.warn('Picture-in-picture not supported or blocked:', err);
      setShowIpadGuide(true);
    }
  };

  if (focusTimerModalOpen || !hasActiveSession) {
    return null;
  }

  return (
    <>
      {/* Hidden canvas & video elements for Picture-in-Picture window */}
      <canvas
        ref={canvasRef}
        width={340}
        height={180}
        className="hidden"
        aria-hidden="true"
      />
      <video
        ref={videoRef}
        muted
        playsInline
        className="hidden"
        aria-hidden="true"
      />

      {/* Completion Toast Alert (when session finishes with modal closed) */}
      {activeTimer.showCompletionAlert && (
        <div className="fixed top-18 right-4 sm:right-8 z-50 max-w-sm w-full bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0 font-bold">
              🎉
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Session Complete!
                <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                  +{activeTimer.lastCompletedMinutes}m Logged
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeSubject?.name}: Logged to your daily study hours. Take a break!
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => {
                    dismissCompletionAlert();
                    setFocusTimerModalOpen(true);
                  }}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Open Timer
                </button>
                <button
                  onClick={dismissCompletionAlert}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button
              onClick={dismissCompletionAlert}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* iPad Slide Over / Split View Help Modal */}
      {showIpadGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📱</span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  আইপ্যাডে সবসময় ভাসমান রাখার নিয়ম
                </h3>
              </div>
              <button
                onClick={() => setShowIpadGuide(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-2.5 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <p className="font-semibold text-slate-900 dark:text-white">
                💡 আপনি যখন PDF পড়বেন বা অনলাইন ক্লাস করবেন, তখন টাইমারটি স্ক্রিনের ওপর দেখতে:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-xs">
                <li>আইপ্যাডের স্ক্রিনের একেবারে উপরে মাঝখানে থাকা <strong>তিনটি ডট (•••)</strong> বাটনে চাপুন।</li>
                <li><strong>"Slide Over"</strong> অপশনটি বেছে নিন।</li>
                <li>এখন PDF অ্যাপ (যেমন GoodNotes, Books, Safari) খুলুন। এই টাইমার অ্যাপটি স্ক্রিনের একপাশে ছোট উইন্ডো হিসেবে সবসময় ভেসে থাকবে!</li>
                <li>প্রয়োজনে উইন্ডোটিকে স্ক্রিনের বাম বা ডানপাশে সরিয়ে রাখতে পারবেন।</li>
              </ol>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              * নোট: ল্যাপটপ বা ডেসকটপ ব্রাউজারে 'PiP' বাটনে ক্লিক করলে স্বয়ংক্রিয়ভাবে আলাদা ভাসমান উইন্ডো তৈরি হবে।
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setShowIpadGuide(false)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                বুঝেছি (Got It)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Mini Timer UI */}
      <div
        id="floating-mini-timer"
        className={`fixed z-40 transition-all duration-300 ${
          activeTimer.isMinimized
            ? 'bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:bottom-6 right-4 sm:right-6'
            : 'bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:bottom-6 right-3 sm:right-6 left-3 sm:left-auto sm:w-[380px]'
        }`}
      >
        {activeTimer.isMinimized ? (
          /* ULTRA COMPACT MINIMIZED PILL (Small, distraction-free badge) */
          <button
            onClick={toggleTimerMinimized}
            className={`group flex items-center gap-2.5 px-3.5 py-2.5 rounded-full shadow-2xl border transition-all transform hover:scale-105 ${
              activeTimer.isRunning
                ? activeTimer.mode === 'study'
                  ? 'bg-emerald-600 text-white border-emerald-400/40 shadow-emerald-900/30 animate-pulse'
                  : 'bg-amber-600 text-white border-amber-400/40 shadow-amber-900/30'
                : 'bg-slate-900/95 text-white border-slate-700/60 shadow-slate-950/40'
            }`}
            title="Click to expand full floating timer controls"
          >
            <span className="text-sm">
              {activeTimer.mode === 'study' ? '📚' : '☕'}
            </span>
            <span className="font-mono font-black text-sm tracking-wider">
              {formattedTime}
            </span>
            <span className="text-[11px] font-medium opacity-80 max-w-[80px] truncate hidden sm:inline">
              {activeSubject?.name}
            </span>
            <ChevronUp className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100 transition-opacity" />
          </button>
        ) : (
          /* EXPANDED FLOATING MINI BAR */
          <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700/80 p-3.5 space-y-2.5">
            {/* Top Row: Mode Badge + Subject + Minimize & Expand Buttons */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    activeTimer.mode === 'study'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {activeTimer.mode === 'study' ? 'Study' : 'Break'}
                </span>

                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: activeSubject?.color || '#10b981' }}
                  />
                  <span className="text-xs font-semibold text-slate-300 truncate max-w-[140px]">
                    {activeSubject?.name || 'Focused Session'}
                  </span>
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleTogglePiP}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    pipActive
                      ? 'bg-emerald-500/30 text-emerald-300'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Picture-in-Picture floating window (iPad / PC)"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setFocusTimerModalOpen(true)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs transition-colors"
                  title="Open full timer modal"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={toggleTimerMinimized}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs transition-colors"
                  title="Minimize to tiny floating pill"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Middle Row: Big Timer + Play/Pause & Finish Buttons */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                <div className="font-mono font-black text-2xl sm:text-3xl text-white tracking-wider flex items-baseline gap-1">
                  <span>{formattedTime}</span>
                  <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-normal">
                    {activeTimer.isRunning ? 'Active' : 'Paused'}
                  </span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  id="mini-timer-toggle-play"
                  onClick={toggleTimerPlay}
                  className={`p-2.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center ${
                    activeTimer.isRunning
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                  title={activeTimer.isRunning ? 'Pause Timer' : 'Resume Timer'}
                >
                  {activeTimer.isRunning ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                {/* Finish Early & Log */}
                {activeTimer.mode === 'study' && (
                  <button
                    id="mini-timer-finish"
                    onClick={() => finishAndLogSession()}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 font-bold transition-all border border-slate-700"
                    title="Finish session early and log hours"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}

                {/* Reset */}
                <button
                  onClick={resetTimer}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 font-bold transition-all border border-slate-700"
                  title="Reset timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom: Smooth Mini Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    activeTimer.mode === 'study' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
                <span>{Math.round(progressPercent)}% elapsed</span>
                <button
                  onClick={() => setShowIpadGuide(true)}
                  className="hover:text-slate-200 underline decoration-dotted flex items-center gap-1"
                >
                  <HelpCircle className="w-2.5 h-2.5" />
                  <span>আইপ্যাডে PDF এর উপর রাখার নিয়ম</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
