import { create } from 'zustand';
import {
  playTimerCompletionSound,
  triggerTimerVibration,
  getRemainingSecondsFromTimestamp,
} from '../engines/timerEngine';

interface TimerState {
  isRunning: boolean;
  remainingSeconds: number;
  targetSeconds: number;
  endTimestamp: number | null;
  exerciseName: string;
  isCompletedAlert: boolean;
  isExpanded: boolean;

  startTimer: (seconds: number, exerciseName?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  adjustSeconds: (delta: number) => void;
  skipTimer: () => void;
  dismissAlert: () => void;
  toggleExpanded: () => void;
  openModal: () => void;
  closeModal: () => void;
  tick: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  remainingSeconds: 0,
  targetSeconds: 90,
  endTimestamp: null,
  exerciseName: '',
  isCompletedAlert: false,
  isExpanded: false,

  openModal: () => set({ isExpanded: true }),
  closeModal: () => set({ isExpanded: false }),

  startTimer: (seconds: number, exerciseName: string = '휴식') => {
    const end = Date.now() + seconds * 1000;
    set({
      isRunning: true,
      remainingSeconds: seconds,
      targetSeconds: seconds,
      endTimestamp: end,
      exerciseName,
      isCompletedAlert: false,
    });
  },

  pauseTimer: () => {
    const { endTimestamp } = get();
    if (!endTimestamp) return;
    const remaining = getRemainingSecondsFromTimestamp(endTimestamp);
    set({
      isRunning: false,
      remainingSeconds: remaining,
      endTimestamp: null,
    });
  },

  resumeTimer: () => {
    const { remainingSeconds } = get();
    if (remainingSeconds <= 0) return;
    const end = Date.now() + remainingSeconds * 1000;
    set({
      isRunning: true,
      endTimestamp: end,
    });
  },

  adjustSeconds: (delta: number) => {
    const { remainingSeconds, endTimestamp, isRunning } = get();
    const newRemaining = Math.max(5, remainingSeconds + delta);
    const newEnd = isRunning ? Date.now() + newRemaining * 1000 : null;
    set({
      remainingSeconds: newRemaining,
      endTimestamp: newEnd,
      targetSeconds: Math.max(get().targetSeconds, newRemaining),
    });
  },

  skipTimer: () => {
    set({
      isRunning: false,
      remainingSeconds: 0,
      endTimestamp: null,
      isCompletedAlert: false,
    });
  },

  dismissAlert: () => {
    set({ isCompletedAlert: false });
  },

  toggleExpanded: () => {
    set((state) => ({ isExpanded: !state.isExpanded }));
  },

  tick: () => {
    const { isRunning, endTimestamp } = get();
    if (!isRunning || !endTimestamp) return;

    const remaining = getRemainingSecondsFromTimestamp(endTimestamp);
    if (remaining <= 0) {
      // Timer finished!
      playTimerCompletionSound();
      triggerTimerVibration();
      set({
        isRunning: false,
        remainingSeconds: 0,
        endTimestamp: null,
        isCompletedAlert: true,
      });
    } else {
      set({ remainingSeconds: remaining });
    }
  },
}));
