/**
 * Web Audio API chime player (no external files required, 100% reliable)
 */
export function playChimeSound(
  type: 'study_done' | 'break_done' | 'milestone' | 'tick' | 'timer_start' = 'study_done'
) {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'timer_start') {
      // Gentle start tone (rising pitch)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.15);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'study_done') {
      // Ascending celebratory dual chime (C5 -> E5 -> G5)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);

        gain.gain.setValueAtTime(0, now + idx * 0.14);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.14 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 0.7);
      });
    } else if (type === 'break_done') {
      // Gentle reminder bell
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.9);
    } else if (type === 'milestone') {
      // Fanfare chime
      const notes = [587.33, 739.99, 880.0, 1174.66];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        gain.gain.setValueAtTime(0, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.2, now + i * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.6);
      });
    }
  } catch (err) {
    console.debug('Audio not allowed or supported:', err);
  }
}

export const playFocusChime = () => playChimeSound('study_done');
export const playBreakChime = () => playChimeSound('break_done');
export const playMilestoneCelebration = () => playChimeSound('milestone');

export const MOTIVATIONAL_QUOTES: string[] = [
  "One focused hour today can change your result tomorrow.",
  "Don't count the days. Make the days count.",
  "Small progress every day becomes a huge result.",
  "Your future self will thank you for the effort you put in right now.",
  "Difficult roads often lead to beautiful destinations.",
  "Success doesn't come from what you do occasionally, it comes from what you do consistently.",
  "The pain of discipline is far less than the pain of regret.",
  "Concentrate all your thoughts upon the work at hand. Focus is your superpower.",
  "Every formula mastered and every practice question solved brings you closer to your goal.",
  "Stay relentless. Exam victory is built one quiet study hour at a time.",
  "Push yourself, because no one else is going to do it for you.",
  "Trust the process. What seems difficult today will become second nature with revision.",
];

export function getRandomMotivationalQuote(): string {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
}
