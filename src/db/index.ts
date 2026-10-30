import Dexie, { Table } from 'dexie';
import {
  Exercise,
  Routine,
  WorkoutSession,
  WorkoutSet,
  WeeklyPlanItem,
  UserSettings,
  BackupData,
  PaceEvent,
  PaceScore,
  PaceModeSettings,
} from '../types';
import { INITIAL_EXERCISES } from '../data/exercises';
import { DEFAULT_ROUTINES } from '../data/defaultRoutines';

export const DEFAULT_PACE_MODE_SETTINGS: PaceModeSettings = {
  enabled: false, // Default is OFF as specified
  preparationSeconds: 5, // Default 5s
  restMode: 'auto',
  defaultRestSeconds: 90,
  restartGraceSeconds: 15, // Default 15s
  soundEnabled: true,
  vibrationEnabled: true,
  scoringEnabled: true,
};

export class MuscleMapDatabase extends Dexie {
  exercises!: Table<Exercise, string>;
  routines!: Table<Routine, string>;
  sessions!: Table<WorkoutSession, string>;
  sets!: Table<WorkoutSet, string>;
  weeklyPlans!: Table<WeeklyPlanItem, string>;
  settings!: Table<UserSettings, string>;
  paceEvents!: Table<PaceEvent, string>;
  paceScores!: Table<PaceScore, string>;

  constructor() {
    super('MuscleMapDB');

    // Schema version 1 (initial)
    this.version(1).stores({
      exercises: 'id, category, equipment, exerciseType, isCustom',
      routines: 'id, splitType, orderIndex',
      sessions: 'id, routineId, startTime, isCompleted',
      sets: 'id, sessionId, exerciseId, setNumber, isCompleted, completedAt',
      weeklyPlans: 'id, weekStartDate, dayOfWeek, status',
      settings: 'id',
    });

    // Schema version 2 (Pace Mode extension)
    this.version(2).stores({
      exercises: 'id, category, equipment, exerciseType, isCustom',
      routines: 'id, splitType, orderIndex',
      sessions: 'id, routineId, startTime, isCompleted, paceModeEnabled',
      sets: 'id, sessionId, exerciseId, setNumber, isCompleted, completedAt',
      weeklyPlans: 'id, weekStartDate, dayOfWeek, status',
      settings: 'id',
      paceEvents: 'id, sessionId, setId, type, occurredAt',
      paceScores: 'sessionId, calculatedAt',
    });
  }
}

export const db = new MuscleMapDatabase();

export const DEFAULT_USER_SETTINGS: UserSettings = {
  id: 'user_default',
  userName: '운동인',
  weightUnit: 'kg',
  timer: {
    mode: 'auto',
    defaultSeconds: 90,
    soundEnabled: true,
    vibrateEnabled: true,
  },
  theme: 'dark',
  currentSplitType: 'three_split',
  favoriteStyles: ['standard'],
  recentStyles: ['standard'],
  paceMode: DEFAULT_PACE_MODE_SETTINGS,
  updatedAt: new Date().toISOString(),
};

/**
 * Initializes database with default exercises, routines, and user settings if first run
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // 1. Seed exercises if empty or sync initial ones
    const exerciseCount = await db.exercises.count();
    if (exerciseCount === 0) {
      await db.exercises.bulkAdd(INITIAL_EXERCISES);
    } else {
      for (const ex of INITIAL_EXERCISES) {
        const exists = await db.exercises.get(ex.id);
        if (!exists) {
          await db.exercises.add(ex);
        }
      }
    }

    // 2. Seed default routines if empty
    const routineCount = await db.routines.count();
    if (routineCount === 0) {
      await db.routines.bulkAdd(DEFAULT_ROUTINES);
    }

    // 3. Seed user settings if empty, or ensure paceMode exists
    const existingSettings = await db.settings.get('user_default');
    if (!existingSettings) {
      await db.settings.add(DEFAULT_USER_SETTINGS);
    } else if (!existingSettings.paceMode) {
      await db.settings.update('user_default', {
        paceMode: DEFAULT_PACE_MODE_SETTINGS,
      });
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

/**
 * Exports all user data into a validated JSON backup object
 */
export async function exportDatabaseBackup(): Promise<BackupData> {
  const [exercises, routines, sessions, sets, settings, paceEvents] = await Promise.all([
    db.exercises.toArray(),
    db.routines.toArray(),
    db.sessions.toArray(),
    db.sets.toArray(),
    db.settings.get('user_default'),
    db.paceEvents.toArray(),
  ]);

  return {
    version: '0.1.0',
    exportedAt: new Date().toISOString(),
    exercises,
    routines,
    sessions,
    sets,
    settings: settings || DEFAULT_USER_SETTINGS,
    paceEvents,
  };
}

/**
 * Validates and imports JSON backup data into Dexie
 */
export async function importDatabaseBackup(data: any): Promise<{ success: boolean; error?: string; summary?: any }> {
  try {
    if (!data || typeof data !== 'object') {
      return { success: false, error: '유효한 JSON 형식이 아닙니다.' };
    }

    if (!Array.isArray(data.exercises) || !Array.isArray(data.routines) || !Array.isArray(data.sessions) || !Array.isArray(data.sets)) {
      return { success: false, error: '필수 데이터 구조(exercises, routines, sessions, sets)가 누락되었습니다.' };
    }

    await db.transaction('rw', [db.exercises, db.routines, db.sessions, db.sets, db.settings, db.paceEvents], async () => {
      await db.exercises.clear();
      await db.exercises.bulkAdd(data.exercises);

      await db.routines.clear();
      await db.routines.bulkAdd(data.routines);

      await db.sessions.clear();
      await db.sessions.bulkAdd(data.sessions);

      await db.sets.clear();
      await db.sets.bulkAdd(data.sets);

      if (data.settings) {
        await db.settings.put(data.settings);
      }

      if (Array.isArray(data.paceEvents)) {
        await db.paceEvents.clear();
        await db.paceEvents.bulkAdd(data.paceEvents);
      }
    });

    return {
      success: true,
      summary: {
        exercisesCount: data.exercises.length,
        routinesCount: data.routines.length,
        sessionsCount: data.sessions.length,
        setsCount: data.sets.length,
      },
    };
  } catch (err: any) {
    console.error('Import failed:', err);
    return { success: false, error: err?.message || '가져오기 중 오류가 발생했습니다.' };
  }
}
