import React, { useState } from 'react';
import { getRandomMotivationalQuote } from '../../utils/audioAndQuotes';
import { Quote, RefreshCw } from 'lucide-react';

export function MotivationCard() {
  const [quote, setQuote] = useState(getRandomMotivationalQuote);
  const [isRotating, setIsRotating] = useState(false);

  const handleNextQuote = () => {
    setIsRotating(true);
    setQuote(getRandomMotivationalQuote());
    setTimeout(() => setIsRotating(false), 400);
  };

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/30 rounded-3xl p-6 border border-amber-200/80 dark:border-amber-800/60 shadow-xs flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
          <Quote className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-0.5">
            Daily Motivation
          </span>
          <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 italic">
            "{quote}"
          </p>
        </div>
      </div>

      <button
        onClick={handleNextQuote}
        className="p-2.5 rounded-xl text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-all shrink-0"
        title="Get another motivational message"
        aria-label="Next quote"
      >
        <RefreshCw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}
