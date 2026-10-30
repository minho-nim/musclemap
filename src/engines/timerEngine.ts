import { Exercise } from '../types';

let audioCtx: AudioContext | null = null;

/**
 * Plays a pleasant synthesizer chime when the rest timer finishes
 */
export function playTimerCompletionSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // First tone (523.25 Hz - C5)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second tone (659.25 Hz - E5)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.15);
    gain2.gain.setValueAtTime(0.3, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.55);

    // Third high tone (783.99 Hz - G5)
    const osc3 = audioCtx.createOscillator();
    const gain3 = audioCtx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(783.99, now + 0.3);
    gain3.gain.setValueAtTime(0.35, now + 0.3);
    gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    osc3.connect(gain3);
    gain3.connect(audioCtx.destination);
    osc3.start(now + 0.3);
    osc3.stop(now + 0.8);
  } catch (e) {
    console.warn('Audio playback not permitted or unavailable:', e);
  }
}

/**
 * Triggers hardware vibration if supported
 */
export function triggerTimerVibration(): void {
  try {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 300]);
    }
  } catch (e) {
    // Ignore vibration failure
  }
}

/**
 * Calculates adaptive rest time based on exercise characteristics and performance
 */
export function calculateAdaptiveRestTime(
  exercise: Exercise,
  options?: {
    rpe?: number;
    targetReps?: number;
    actualReps?: number;
    setType?: string;
  }
): number {
  let baseSeconds = exercise.defaultRestSeconds || 90;

  // Heavy compound exercises require more ATP-PC recovery
  if (exercise.exerciseType === 'compound') {
    if (['bk_bb_deadlift', 'lg_bb_back_squat', 'ch_bb_flat_bench'].includes(exercise.id)) {
      baseSeconds = Math.max(baseSeconds, 150);
    } else {
      baseSeconds = Math.max(baseSeconds, 90);
    }
  } else if (exercise.exerciseType === 'isolation') {
    baseSeconds = Math.min(baseSeconds, 75);
  }

  // Adjust for RPE (Rate of Perceived Exertion)
  if (options?.rpe) {
    if (options.rpe >= 9.5) {
      baseSeconds += 30; // Near failure
    } else if (options.rpe >= 8.5) {
      baseSeconds += 15;
    } else if (options.rpe <= 6.5) {
      baseSeconds = Math.max(45, baseSeconds - 15);
    }
  }

  // Adjust if user failed to reach target reps
  if (options?.targetReps && options?.actualReps) {
    if (options.actualReps < options.targetReps) {
      baseSeconds += 20; // Needs extra recovery after hitting a wall
    }
  }

  // Adjust for set types
  if (options?.setType === 'drop') {
    baseSeconds = 30; // Drop sets minimal rest
  } else if (options?.setType === 'warmup') {
    baseSeconds = 45; // Warmup sets quick rest
  }

  return baseSeconds;
}

/**
 * Calculates remaining seconds from end timestamp
 */
export function getRemainingSecondsFromTimestamp(endTimestamp: number): number {
  const diff = Math.ceil((endTimestamp - Date.now()) / 1000);
  return Math.max(0, diff);
}
