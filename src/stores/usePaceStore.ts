import { create } from 'zustand';
import { db, DEFAULT_PACE_MODE_SETTINGS } from '../db';
import {
  PaceState,
  PaceEvent,
  PaceEventType,
  PaceModeSettings,
  PaceScore,
} from '../types';
import { playTimerCompletionSound, triggerTimerVibration } from '../engines/timerEngine';

interface PaceStoreState {
  paceState: PaceState;
  paceModeEnabled: boolean;
  settings: PaceModeSettings;

  // Timers & Timestamps
  currentExerciseId: string | null;
  currentSetId: string | null;
  prepRemainingSeconds: number;
  activeStartedAt: number | null;
  activeElapsedSeconds: number;
  restEndTimestamp: number | null;
  restRemainingSeconds: number;
  restTargetSeconds: number;
  waitingStartedAt: number | null;
  waitingElapsedSeconds: number;

  // Actions
  setPaceModeEnabled: (enabled: boolean) => void;
  updateSettings: (updates: Partial<PaceModeSettings>) => Promise<void>;
  loadSettings: () => Promise<void>;

  // State Machine Transitions
  startPreparation: (sessionId: string, exerciseId: string, setId?: string) => Promise<void>;
  completePreparation: (sessionId: string) => Promise<void>;
  skipPreparation: (sessionId: string) => Promise<void>;
  cancelPreparation: () => void;
  finishActiveSet: (
    sessionId: string,
    exerciseId: string,
    setId: string,
    isLastSetOfSession: boolean,
    customRestSeconds?: number
  ) => Promise<void>;
  extendRest: (sessionId: string, additionalSeconds: number, reason?: string) => Promise<void>;
  skipRest: (sessionId: string) => void;
  startNextSet: (sessionId: string, exerciseId: string, setId?: string, isExcused?: boolean) => Promise<void>;
  recordManualSetEvent: (sessionId: string, exerciseId: string, setId: string) => Promise<void>;
  pauseTimer: (sessionId: string) => Promise<void>;
  resumeTimer: (sessionId: string) => Promise<void>;
  resetPaceState: () => void;
  heartbeatTick: () => void;
}

export const usePaceStore = create<PaceStoreState>((set, get) => ({
  paceState: 'READY',
  paceModeEnabled: false,
  settings: DEFAULT_PACE_MODE_SETTINGS,

  currentExerciseId: null,
  currentSetId: null,
  prepRemainingSeconds: 5,
  activeStartedAt: null,
  activeElapsedSeconds: 0,
  restEndTimestamp: null,
  restRemainingSeconds: 0,
  restTargetSeconds: 90,
  waitingStartedAt: null,
  waitingElapsedSeconds: 0,

  setPaceModeEnabled: (enabled: boolean) => {
    set({ paceModeEnabled: enabled });
  },

  updateSettings: async (updates: Partial<PaceModeSettings>) => {
    const newSettings = { ...get().settings, ...updates };
    set({ settings: newSettings, paceModeEnabled: newSettings.enabled });

    const userSettings = await db.settings.get('user_default');
    if (userSettings) {
      await db.settings.update('user_default', { paceMode: newSettings });
    }
  },

  loadSettings: async () => {
    const userSettings = await db.settings.get('user_default');
    if (userSettings?.paceMode) {
      set({
        settings: userSettings.paceMode,
        paceModeEnabled: userSettings.paceMode.enabled,
        prepRemainingSeconds: userSettings.paceMode.preparationSeconds || 5,
      });
    }
  },

  startPreparation: async (sessionId: string, exerciseId: string, setId?: string) => {
    const { settings } = get();
    const prepSeconds = settings.preparationSeconds || 5;

    // Log event in IndexedDB
    const event: PaceEvent = {
      id: `pe_${Date.now()}_prep_start`,
      sessionId,
      exerciseId,
      setId,
      type: 'preparation_started',
      occurredAt: new Date().toISOString(),
      metadata: { prepSeconds },
    };
    await db.paceEvents.add(event);

    set({
      paceState: 'PREPARING',
      currentExerciseId: exerciseId,
      currentSetId: setId || null,
      prepRemainingSeconds: prepSeconds,
      activeStartedAt: null,
      activeElapsedSeconds: 0,
      waitingStartedAt: null,
    });
  },

  completePreparation: async (sessionId: string) => {
    const { currentExerciseId, currentSetId } = get();
    const now = Date.now();

    // Log preparation completed
    await db.paceEvents.add({
      id: `pe_${now}_prep_done`,
      sessionId,
      exerciseId: currentExerciseId || undefined,
      setId: currentSetId || undefined,
      type: 'preparation_completed',
      occurredAt: new Date(now).toISOString(),
    });

    // Log set started
    await db.paceEvents.add({
      id: `pe_${now}_set_start`,
      sessionId,
      exerciseId: currentExerciseId || undefined,
      setId: currentSetId || undefined,
      type: 'set_started',
      occurredAt: new Date(now).toISOString(),
    });

    playTimerCompletionSound();

    set({
      paceState: 'ACTIVE',
      activeStartedAt: now,
      activeElapsedSeconds: 0,
    });
  },

  skipPreparation: async (sessionId: string) => {
    const { currentExerciseId, currentSetId } = get();
    const now = Date.now();

    await db.paceEvents.add({
      id: `pe_${now}_prep_skip`,
      sessionId,
      exerciseId: currentExerciseId || undefined,
      setId: currentSetId || undefined,
      type: 'preparation_skipped',
      occurredAt: new Date(now).toISOString(),
    });

    await db.paceEvents.add({
      id: `pe_${now}_set_start`,
      sessionId,
      exerciseId: currentExerciseId || undefined,
      setId: currentSetId || undefined,
      type: 'set_started',
      occurredAt: new Date(now).toISOString(),
    });

    set({
      paceState: 'ACTIVE',
      activeStartedAt: now,
      activeElapsedSeconds: 0,
    });
  },

  cancelPreparation: () => {
    set({
      paceState: 'READY',
      prepRemainingSeconds: get().settings.preparationSeconds || 5,
    });
  },

  finishActiveSet: async (
    sessionId: string,
    exerciseId: string,
    setId: string,
    isLastSetOfSession: boolean,
    customRestSeconds: number = 90
  ) => {
    const { activeStartedAt } = get();
    const now = Date.now();
    const elapsedSeconds = activeStartedAt ? Math.max(1, Math.round((now - activeStartedAt) / 1000)) : 0;

    await db.paceEvents.add({
      id: `pe_${now}_set_done`,
      sessionId,
      exerciseId,
      setId,
      type: 'set_completed',
      occurredAt: new Date(now).toISOString(),
      metadata: { elapsedSeconds },
    });

    // If it's the last set of the entire session, no unnecessary rest needed
    if (isLastSetOfSession) {
      set({
        paceState: 'READY',
        activeStartedAt: null,
        activeElapsedSeconds: 0,
      });
      return;
    }

    // Otherwise, transition to RESTING
    const restEnd = now + customRestSeconds * 1000;

    await db.paceEvents.add({
      id: `pe_${now}_rest_start`,
      sessionId,
      exerciseId,
      setId,
      type: 'rest_started',
      occurredAt: new Date(now).toISOString(),
      metadata: { targetSeconds: customRestSeconds },
    });

    set({
      paceState: 'RESTING',
      restEndTimestamp: restEnd,
      restRemainingSeconds: customRestSeconds,
      restTargetSeconds: customRestSeconds,
      activeStartedAt: null,
      activeElapsedSeconds: 0,
    });
  },

  extendRest: async (sessionId: string, additionalSeconds: number, reason: string = '추가 회복') => {
    const { restEndTimestamp, restRemainingSeconds, restTargetSeconds } = get();
    const now = Date.now();
    const currentEnd = restEndTimestamp || now;
    const newEnd = currentEnd + additionalSeconds * 1000;
    const newRemaining = Math.max(0, Math.ceil((newEnd - now) / 1000));

    await db.paceEvents.add({
      id: `pe_${now}_rest_extend`,
      sessionId,
      type: 'rest_extended',
      occurredAt: new Date(now).toISOString(),
      metadata: { additionalSeconds, reason, isExcused: true },
    });

    set({
      restEndTimestamp: newEnd,
      restRemainingSeconds: newRemaining,
      restTargetSeconds: restTargetSeconds + additionalSeconds,
    });
  },

  skipRest: (sessionId: string) => {
    const now = Date.now();
    db.paceEvents.add({
      id: `pe_${now}_rest_skip`,
      sessionId,
      type: 'rest_completed',
      occurredAt: new Date(now).toISOString(),
      metadata: { skipped: true },
    });

    set({
      paceState: 'WAITING_NEXT',
      restEndTimestamp: null,
      restRemainingSeconds: 0,
      waitingStartedAt: now,
      waitingElapsedSeconds: 0,
    });
  },

  startNextSet: async (
    sessionId: string,
    exerciseId: string,
    setId?: string,
    isExcused: boolean = false
  ) => {
    const { waitingStartedAt } = get();
    const now = Date.now();
    const restartDelaySeconds = waitingStartedAt ? Math.max(0, Math.round((now - waitingStartedAt) / 1000)) : 0;

    await db.paceEvents.add({
      id: `pe_${now}_next_set`,
      sessionId,
      exerciseId,
      setId,
      type: 'next_set_started',
      occurredAt: new Date(now).toISOString(),
      metadata: { restartDelaySeconds, isExcused },
    });

    const prepSeconds = get().settings.preparationSeconds || 5;

    await db.paceEvents.add({
      id: `pe_${now}_prep_start`,
      sessionId,
      exerciseId,
      setId,
      type: 'preparation_started',
      occurredAt: new Date(now).toISOString(),
      metadata: { prepSeconds },
    });

    set({
      paceState: 'PREPARING',
      currentExerciseId: exerciseId,
      currentSetId: setId || null,
      prepRemainingSeconds: prepSeconds,
      activeStartedAt: null,
      activeElapsedSeconds: 0,
      waitingStartedAt: null,
      waitingElapsedSeconds: 0,
    });
  },

  recordManualSetEvent: async (sessionId: string, exerciseId: string, setId: string) => {
    const now = Date.now();
    await db.paceEvents.add({
      id: `pe_${now}_manual_set`,
      sessionId,
      exerciseId,
      setId,
      type: 'set_recorded_manually',
      occurredAt: new Date(now).toISOString(),
    });
  },

  pauseTimer: async (sessionId: string) => {
    const now = Date.now();
    await db.paceEvents.add({
      id: `pe_${now}_paused`,
      sessionId,
      type: 'timer_paused',
      occurredAt: new Date(now).toISOString(),
    });
    set({ paceState: 'PAUSED' });
  },

  resumeTimer: async (sessionId: string) => {
    const now = Date.now();
    await db.paceEvents.add({
      id: `pe_${now}_resumed`,
      sessionId,
      type: 'timer_resumed',
      occurredAt: new Date(now).toISOString(),
    });
    set({ paceState: 'ACTIVE' });
  },

  resetPaceState: () => {
    set({
      paceState: 'READY',
      currentExerciseId: null,
      currentSetId: null,
      prepRemainingSeconds: get().settings.preparationSeconds || 5,
      activeStartedAt: null,
      activeElapsedSeconds: 0,
      restEndTimestamp: null,
      restRemainingSeconds: 0,
      waitingStartedAt: null,
      waitingElapsedSeconds: 0,
    });
  },

  heartbeatTick: () => {
    const {
      paceState,
      prepRemainingSeconds,
      activeStartedAt,
      restEndTimestamp,
      waitingStartedAt,
    } = get();

    // 1. PREPARING Countdown
    if (paceState === 'PREPARING') {
      if (prepRemainingSeconds <= 1) {
        // Countdown finished -> switch to ACTIVE
        const now = Date.now();
        playTimerCompletionSound();
        triggerTimerVibration();
        set({
          paceState: 'ACTIVE',
          prepRemainingSeconds: 0,
          activeStartedAt: now,
          activeElapsedSeconds: 0,
        });
      } else {
        set({ prepRemainingSeconds: prepRemainingSeconds - 1 });
      }
    }

    // 2. ACTIVE Stopwatch
    if (paceState === 'ACTIVE' && activeStartedAt) {
      const elapsed = Math.max(0, Math.floor((Date.now() - activeStartedAt) / 1000));
      set({ activeElapsedSeconds: elapsed });
    }

    // 3. RESTING Countdown
    if (paceState === 'RESTING' && restEndTimestamp) {
      const remaining = Math.ceil((restEndTimestamp - Date.now()) / 1000);
      if (remaining <= 0) {
        // Rest completed -> switch to WAITING_NEXT (NO auto-start!)
        playTimerCompletionSound();
        triggerTimerVibration();
        set({
          paceState: 'WAITING_NEXT',
          restRemainingSeconds: 0,
          restEndTimestamp: null,
          waitingStartedAt: Date.now(),
          waitingElapsedSeconds: 0,
        });
      } else {
        set({ restRemainingSeconds: remaining });
      }
    }

    // 4. WAITING_NEXT Timer (tracks restart promptness)
    if (paceState === 'WAITING_NEXT' && waitingStartedAt) {
      const waitingElapsed = Math.max(0, Math.floor((Date.now() - waitingStartedAt) / 1000));
      set({ waitingElapsedSeconds: waitingElapsed });
    }
  },
}));
