import { create } from 'zustand';
import { db } from '../db';
import {
  WorkoutSession,
  WorkoutSet,
  Routine,
  Exercise,
  SetType,
  WorkoutSessionExercise,
  WorkoutStyleId,
  PaceScore,
} from '../types';
import { useTimerStore } from './useTimerStore';
import { calculateAdaptiveRestTime } from '../engines/timerEngine';
import { calculateSetsVolume } from '../engines/workoutEngine';
import { evaluateSessionScores } from '../engines/paceScoreEngine';
import { usePaceStore } from './usePaceStore';

export interface WorkoutSummaryResult {
  session: WorkoutSession;
  sets: WorkoutSet[];
  totalVolumeKg: number;
  completedSetsCount: number;
  durationMinutes: number;
  score?: PaceScore;
}

interface WorkoutStoreState {
  activeSession: WorkoutSession | null;
  activeSets: WorkoutSet[];
  activeExerciseIndex: number;
  isLoading: boolean;
  summaryResult: WorkoutSummaryResult | null;

  // Actions
  loadActiveSession: () => Promise<void>;
  startRoutineWorkout: (routine: Routine, allExercises: Exercise[], paceModeEnabled?: boolean) => Promise<void>;
  startFreeWorkout: (initialExerciseId?: string, paceModeEnabled?: boolean) => Promise<void>;
  setActiveExerciseIndex: (index: number) => void;
  setExerciseStyle: (exerciseId: string, styleId: WorkoutStyleId) => Promise<void>;
  addExerciseToSession: (exerciseId: string) => Promise<boolean>;
  removeExerciseFromSession: (exerciseId: string) => Promise<void>;
  addSetToExercise: (exerciseId: string, setType?: SetType) => Promise<void>;
  updateSet: (setId: string, updates: Partial<WorkoutSet>) => Promise<void>;
  completeSet: (setId: string, allExercises: Exercise[]) => Promise<void>;
  undoCompleteSet: (setId: string) => Promise<void>;
  deleteSet: (setId: string) => Promise<void>;
  finishWorkout: () => Promise<WorkoutSummaryResult | null>;
  cancelWorkout: () => Promise<void>;
  clearSummary: () => void;
  saveSessionAsRoutine: (routineName: string) => Promise<void>;
}

export const useWorkoutStore = create<WorkoutStoreState>((set, get) => ({
  activeSession: null,
  activeSets: [],
  activeExerciseIndex: 0,
  isLoading: false,
  summaryResult: null,

  loadActiveSession: async () => {
    set({ isLoading: true });
    try {
      // Find uncompleted session
      const uncompletedSession = await db.sessions
        .filter((s) => !s.isCompleted)
        .first();

      if (uncompletedSession) {
        const sets = await db.sets
          .where('sessionId')
          .equals(uncompletedSession.id)
          .sortBy('setNumber');

        set({
          activeSession: uncompletedSession,
          activeSets: sets,
          activeExerciseIndex: 0,
        });

        // Sync Pace Mode enabled state
        if (uncompletedSession.paceModeEnabled) {
          usePaceStore.getState().setPaceModeEnabled(true);
        }
      } else {
        set({ activeSession: null, activeSets: [] });
      }
    } catch (e) {
      console.error('Failed to load active session:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  startRoutineWorkout: async (routine: Routine, allExercises: Exercise[], paceModeEnabled?: boolean) => {
    const sessionId = `sess_${Date.now()}`;
    const startTime = new Date().toISOString();

    const exercises: WorkoutSessionExercise[] = routine.exercises.map((re, idx) => ({
      exerciseId: re.exerciseId,
      order: idx + 1,
      targetSets: re.targetSets,
      targetReps: re.targetReps,
      targetWeight: re.targetWeight,
      notes: re.notes,
      styleId: re.styleId || 'standard',
    }));

    const isPace = paceModeEnabled ?? usePaceStore.getState().paceModeEnabled;

    const session: WorkoutSession = {
      id: sessionId,
      routineId: routine.id,
      routineName: routine.name,
      name: routine.name,
      startTime,
      isCompleted: false,
      exercises,
      paceModeEnabled: isPace,
    };

    // Pre-create initial sets based on routine configuration
    const initialSets: WorkoutSet[] = [];
    const exerciseMap = new Map(allExercises.map((e) => [e.id, e]));

    exercises.forEach((re) => {
      const targetCount = re.targetSets || 3;
      const ex = exerciseMap.get(re.exerciseId);
      const isCardio = ex?.category === 'cardio' || ex?.exerciseType === 'cardio';

      for (let s = 1; s <= targetCount; s++) {
        initialSets.push({
          id: `set_${sessionId}_${re.exerciseId}_${s}`,
          sessionId,
          exerciseId: re.exerciseId,
          styleId: re.styleId || 'standard',
          setNumber: s,
          setType: 'normal',
          weight: isCardio ? undefined : re.targetWeight || 40,
          reps: isCardio ? undefined : 10,
          durationSeconds: isCardio ? 300 : undefined,
          isCompleted: false,
        });
      }
    });

    await db.sessions.add(session);
    await db.sets.bulkAdd(initialSets);

    usePaceStore.getState().setPaceModeEnabled(isPace);
    usePaceStore.getState().resetPaceState();

    set({
      activeSession: session,
      activeSets: initialSets,
      activeExerciseIndex: 0,
    });
  },

  startFreeWorkout: async (initialExerciseId?: string, paceModeEnabled?: boolean) => {
    const sessionId = `sess_${Date.now()}`;
    const startTime = new Date().toISOString();

    let targetExerciseId: string = initialExerciseId || 'ch_bb_flat_bench';
    if (!initialExerciseId) {
      const firstEx = await db.exercises.toCollection().first();
      if (firstEx) {
        targetExerciseId = firstEx.id;
      }
    }

    const sessionExercises: WorkoutSessionExercise[] = [
      {
        exerciseId: targetExerciseId,
        order: 1,
        targetSets: 3,
        targetReps: '10',
        styleId: 'standard',
      },
    ];

    const initialSets: WorkoutSet[] = [1, 2, 3].map((s) => ({
      id: `set_${sessionId}_${targetExerciseId}_${s}`,
      sessionId,
      exerciseId: targetExerciseId!,
      styleId: 'standard',
      setNumber: s,
      setType: 'normal' as SetType,
      weight: 20,
      reps: 10,
      isCompleted: false,
    }));

    const isPace = paceModeEnabled ?? usePaceStore.getState().paceModeEnabled;

    const session: WorkoutSession = {
      id: sessionId,
      name: '자유 운동',
      startTime,
      isCompleted: false,
      exercises: sessionExercises,
      paceModeEnabled: isPace,
    };

    await db.sessions.add(session);
    await db.sets.bulkAdd(initialSets);

    usePaceStore.getState().setPaceModeEnabled(isPace);
    usePaceStore.getState().resetPaceState();

    set({
      activeSession: session,
      activeSets: initialSets,
      activeExerciseIndex: 0,
    });
  },

  setActiveExerciseIndex: (index: number) => {
    set({ activeExerciseIndex: index });
  },

  setExerciseStyle: async (exerciseId: string, styleId: WorkoutStyleId) => {
    const { activeSession, activeSets } = get();
    if (!activeSession) return;

    const updatedExercises = activeSession.exercises.map((e) =>
      e.exerciseId === exerciseId ? { ...e, styleId } : e
    );

    const updatedSets = activeSets.map((s) =>
      s.exerciseId === exerciseId ? { ...s, styleId } : s
    );

    await db.sessions.update(activeSession.id, { exercises: updatedExercises });
    for (const s of updatedSets) {
      if (s.exerciseId === exerciseId) {
        await db.sets.update(s.id, { styleId });
      }
    }

    set({
      activeSession: { ...activeSession, exercises: updatedExercises },
      activeSets: updatedSets,
    });
  },

  addExerciseToSession: async (exerciseId: string): Promise<boolean> => {
    const { activeSession, activeSets } = get();
    if (!activeSession) return false;

    // Check if exercise already in session
    const existingIndex = activeSession.exercises.findIndex((e) => e.exerciseId === exerciseId);
    if (existingIndex >= 0) {
      set({ activeExerciseIndex: existingIndex });
      return true;
    }

    const newOrder = activeSession.exercises.length + 1;
    const newSessionExercise: WorkoutSessionExercise = {
      exerciseId,
      order: newOrder,
      targetSets: 3,
      targetReps: '10',
      styleId: 'standard',
    };

    const updatedExercises = [...activeSession.exercises, newSessionExercise];
    const updatedSession = { ...activeSession, exercises: updatedExercises };

    const newSets: WorkoutSet[] = [1, 2, 3].map((num) => ({
      id: `set_${activeSession.id}_${exerciseId}_${num}`,
      sessionId: activeSession.id,
      exerciseId,
      styleId: 'standard',
      setNumber: num,
      setType: 'normal',
      weight: 20,
      reps: 10,
      isCompleted: false,
    }));

    await db.sessions.update(activeSession.id, { exercises: updatedExercises });
    await db.sets.bulkAdd(newSets);

    set({
      activeSession: updatedSession,
      activeSets: [...activeSets, ...newSets],
      activeExerciseIndex: updatedExercises.length - 1,
    });

    return true;
  },

  removeExerciseFromSession: async (exerciseId: string) => {
    const { activeSession, activeSets, activeExerciseIndex } = get();
    if (!activeSession) return;

    const updatedExercises = activeSession.exercises
      .filter((e) => e.exerciseId !== exerciseId)
      .map((e, idx) => ({ ...e, order: idx + 1 }));

    const setToDelete = activeSets.filter((s) => s.exerciseId === exerciseId);
    await Promise.all(setToDelete.map((s) => db.sets.delete(s.id)));
    await db.sessions.update(activeSession.id, { exercises: updatedExercises });

    const remainingSets = activeSets.filter((s) => s.exerciseId !== exerciseId);
    const newIndex = Math.min(activeExerciseIndex, Math.max(0, updatedExercises.length - 1));

    set({
      activeSession: { ...activeSession, exercises: updatedExercises },
      activeSets: remainingSets,
      activeExerciseIndex: newIndex,
    });
  },

  addSetToExercise: async (exerciseId: string, setType: SetType = 'normal') => {
    const { activeSession, activeSets } = get();
    if (!activeSession) return;

    const exerciseSets = activeSets.filter((s) => s.exerciseId === exerciseId);
    const newSetNumber = exerciseSets.length + 1;

    const curExercise = activeSession.exercises.find((e) => e.exerciseId === exerciseId);
    const lastSet = exerciseSets[exerciseSets.length - 1];

    const newSet: WorkoutSet = {
      id: `set_${activeSession.id}_${exerciseId}_${Date.now()}`,
      sessionId: activeSession.id,
      exerciseId,
      styleId: curExercise?.styleId || 'standard',
      setNumber: newSetNumber,
      setType,
      weight: lastSet?.weight ?? 20,
      reps: lastSet?.reps ?? 10,
      durationSeconds: lastSet?.durationSeconds,
      distanceMeters: lastSet?.distanceMeters,
      isCompleted: false,
    };

    await db.sets.add(newSet);
    set({ activeSets: [...activeSets, newSet] });
  },

  updateSet: async (setId: string, updates: Partial<WorkoutSet>) => {
    const { activeSets } = get();
    const updatedSets = activeSets.map((s) => (s.id === setId ? { ...s, ...updates } : s));
    await db.sets.update(setId, updates);
    set({ activeSets: updatedSets });
  },

  completeSet: async (setId: string, allExercises: Exercise[]) => {
    const { activeSets, activeSession } = get();
    const targetSet = activeSets.find((s) => s.id === setId);
    if (!targetSet) return;

    const completedAt = new Date().toISOString();
    const updates = { isCompleted: true, completedAt };

    await db.sets.update(setId, updates);
    const updatedSets = activeSets.map((s) => (s.id === setId ? { ...s, ...updates } : s));
    set({ activeSets: updatedSets });

    // If Pace Mode is enabled, log manual event if not triggered by PaceControlPanel
    if (activeSession?.paceModeEnabled) {
      usePaceStore.getState().recordManualSetEvent(activeSession.id, targetSet.exerciseId, targetSet.id);
    }

    // Trigger Rest Timer automatically (only if not handled by Pace Mode or if Pace Mode OFF)
    if (!activeSession?.paceModeEnabled) {
      const ex = allExercises.find((e) => e.id === targetSet.exerciseId);
      if (ex) {
        const restSeconds = calculateAdaptiveRestTime(ex, {
          rpe: targetSet.rpe,
          setType: targetSet.setType,
        });
        useTimerStore.getState().startTimer(restSeconds, ex.nameKo);
      }
    }
  },

  undoCompleteSet: async (setId: string) => {
    const { activeSets } = get();
    const updates = { isCompleted: false, completedAt: undefined };
    await db.sets.update(setId, updates);
    const updatedSets = activeSets.map((s) => (s.id === setId ? { ...s, ...updates } : s));
    set({ activeSets: updatedSets });
  },

  deleteSet: async (setId: string) => {
    const { activeSets } = get();
    const target = activeSets.find((s) => s.id === setId);
    if (!target) return;

    await db.sets.delete(setId);
    const filtered = activeSets.filter((s) => s.id !== setId);

    const reindexed = filtered.map((s) => {
      if (s.exerciseId === target.exerciseId && s.setNumber > target.setNumber) {
        const newNum = s.setNumber - 1;
        db.sets.update(s.id, { setNumber: newNum });
        return { ...s, setNumber: newNum };
      }
      return s;
    });

    set({ activeSets: reindexed });
  },

  finishWorkout: async (): Promise<WorkoutSummaryResult | null> => {
    const { activeSession, activeSets } = get();
    if (!activeSession) return null;

    const endTime = new Date().toISOString();
    const completedSets = activeSets.filter((s) => s.isCompleted);

    // Load Pace Events for this session to compute exact scores
    const paceEvents = await db.paceEvents.where('sessionId').equals(activeSession.id).toArray();
    const paceSettings = usePaceStore.getState().settings;

    // Evaluate General Score and Challenge Score
    const score = evaluateSessionScores(
      activeSession,
      completedSets,
      paceEvents,
      paceSettings
    );

    // Save score in DB
    await db.paceScores.put(score);

    const updatedSession: WorkoutSession = {
      ...activeSession,
      endTime,
      isCompleted: true,
      paceScore: score,
    };

    await db.sessions.update(activeSession.id, {
      endTime,
      isCompleted: true,
      paceScore: score,
    });

    const totalVolume = calculateSetsVolume(completedSets);

    const startMs = new Date(activeSession.startTime).getTime();
    const endMs = new Date(endTime).getTime();
    const durationMinutes = Math.max(1, Math.round((endMs - startMs) / 60000));

    const result: WorkoutSummaryResult = {
      session: updatedSession,
      sets: completedSets,
      totalVolumeKg: totalVolume,
      completedSetsCount: completedSets.length,
      durationMinutes,
      score,
    };

    // Stop timer and reset pace state
    useTimerStore.getState().skipTimer();
    usePaceStore.getState().resetPaceState();

    set({
      activeSession: null,
      activeSets: [],
      activeExerciseIndex: 0,
      summaryResult: result,
    });

    return result;
  },

  cancelWorkout: async () => {
    const { activeSession, activeSets } = get();
    if (!activeSession) return;

    await Promise.all(activeSets.map((s) => db.sets.delete(s.id)));
    await db.sessions.delete(activeSession.id);
    useTimerStore.getState().skipTimer();
    usePaceStore.getState().resetPaceState();

    set({
      activeSession: null,
      activeSets: [],
      activeExerciseIndex: 0,
    });
  },

  clearSummary: () => {
    set({ summaryResult: null });
  },

  saveSessionAsRoutine: async (routineName: string) => {
    const { summaryResult } = get();
    if (!summaryResult) return;

    const routineId = `routine_${Date.now()}`;
    const exercises = summaryResult.session.exercises.map((e, idx) => {
      const exerciseSets = summaryResult.sets.filter((s) => s.exerciseId === e.exerciseId);
      const avgWeight =
        exerciseSets.length > 0
          ? Math.round((exerciseSets.reduce((sum, s) => sum + (s.weight || 0), 0) / exerciseSets.length) * 10) / 10
          : 30;

      return {
        exerciseId: e.exerciseId,
        order: idx + 1,
        targetSets: Math.max(1, exerciseSets.length || e.targetSets || 3),
        targetReps: e.targetReps || '10',
        targetWeight: avgWeight || 40,
        defaultRestSeconds: 90,
        styleId: e.styleId || 'standard',
      };
    });

    const now = new Date().toISOString();
    const newRoutine: Routine = {
      id: routineId,
      name: routineName.trim() || '내 저장 루틴',
      splitType: 'custom',
      scheduledDays: [new Date().getDay() as any],
      isRotating: false,
      exercises,
      createdAt: now,
      updatedAt: now,
      orderIndex: 0,
    };

    await db.routines.add(newRoutine);
  },
}));
