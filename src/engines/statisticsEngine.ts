import { WorkoutSession, WorkoutSet, Exercise } from '../types';
import { calculateEstimated1RM, calculateSetsVolume } from './workoutEngine';

export interface ExercisePR {
  exerciseId: string;
  maxWeightKg: number;
  maxRepsAtMaxWeight: number;
  estimated1RM: number;
  maxVolumeSessionKg: number;
  lastDate: string;
}

export interface VolumeByDay {
  date: string;
  dayLabel: string;
  volumeKg: number;
  setsCount: number;
}

export interface MuscleGroupVolume {
  group: string;
  groupLabel: string;
  sets: number;
  volumeKg: number;
}

export interface AnalyticsSummary {
  totalWorkouts: number;
  totalSets: number;
  totalVolumeKg: number;
  totalDurationMinutes: number;
  volumeTrend: VolumeByDay[];
  muscleGroupDistribution: MuscleGroupVolume[];
  personalRecords: ExercisePR[];
}

const GROUP_LABELS: Record<string, string> = {
  chest: '가슴',
  back: '등',
  shoulders: '어깨',
  arms: '팔',
  legs: '하체',
  core: '코어',
  cardio: '유산소',
};

/**
 * Calculates comprehensive statistics from actual workout records
 */
export function calculateAnalytics(
  sessions: WorkoutSession[],
  sets: WorkoutSet[],
  exercisesMap: Map<string, Exercise>,
  period: 'week' | 'month' = 'week'
): AnalyticsSummary {
  const now = Date.now();
  const daysLimit = period === 'week' ? 7 : 30;
  const cutoff = now - daysLimit * 24 * 60 * 60 * 1000;

  const validSessions = sessions.filter((s) => {
    if (!s.isCompleted) return false;
    return new Date(s.startTime).getTime() >= cutoff;
  });

  const validSessionIds = new Set(validSessions.map((s) => s.id));
  const validSets = sets.filter((s) => s.isCompleted && validSessionIds.has(s.sessionId));

  // 1. Basic totals
  const totalWorkouts = validSessions.length;
  const totalSets = validSets.length;

  const totalVolumeKg = calculateSetsVolume(validSets);

  let totalDurationMinutes = 0;
  for (const s of validSessions) {
    if (s.endTime) {
      const durationMs = new Date(s.endTime).getTime() - new Date(s.startTime).getTime();
      totalDurationMinutes += Math.max(0, Math.round(durationMs / (60 * 1000)));
    } else {
      totalDurationMinutes += 45; // Default estimation if end time not tracked
    }
  }

  // 2. Volume trend by day
  const dateMap = new Map<string, { volumeKg: number; setsCount: number }>();
  // Prepopulate days
  for (let i = daysLimit - 1; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    dateMap.set(dateStr, { volumeKg: 0, setsCount: 0 });
  }

  for (const s of validSets) {
    const session = validSessions.find((sess) => sess.id === s.sessionId);
    if (!session) continue;
    const dateStr = session.startTime.split('T')[0];
    const existing = dateMap.get(dateStr);
    const setVol = calculateSetsVolume([s]);
    if (existing) {
      existing.volumeKg += setVol;
      existing.setsCount += 1;
    } else {
      dateMap.set(dateStr, { volumeKg: setVol, setsCount: 1 });
    }
  }

  const volumeTrend: VolumeByDay[] = Array.from(dateMap.entries()).map(([date, val]) => {
    const parts = date.split('-');
    const label = `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}`;
    return {
      date,
      dayLabel: label,
      volumeKg: val.volumeKg,
      setsCount: val.setsCount,
    };
  });

  // 3. Muscle Group Distribution
  const groupStats = new Map<string, { sets: number; volumeKg: number }>();
  Object.keys(GROUP_LABELS).forEach((g) => groupStats.set(g, { sets: 0, volumeKg: 0 }));

  for (const s of validSets) {
    const ex = exercisesMap.get(s.exerciseId);
    if (!ex) continue;
    const g = ex.category;
    const current = groupStats.get(g) || { sets: 0, volumeKg: 0 };
    const vol = calculateSetsVolume([s]);
    current.sets += 1;
    current.volumeKg += vol;
    groupStats.set(g, current);
  }

  const muscleGroupDistribution: MuscleGroupVolume[] = Array.from(groupStats.entries()).map(
    ([group, val]) => ({
      group,
      groupLabel: GROUP_LABELS[group] || group,
      sets: val.sets,
      volumeKg: val.volumeKg,
    })
  );

  // 4. Personal Records across ALL completed sets
  const prMap = new Map<string, ExercisePR>();
  for (const s of sets.filter((st) => st.isCompleted)) {
    const w = s.weight || 0;
    const r = s.reps || 0;
    const e1RM = calculateEstimated1RM(w, r);
    const current = prMap.get(s.exerciseId);

    if (!current) {
      prMap.set(s.exerciseId, {
        exerciseId: s.exerciseId,
        maxWeightKg: w,
        maxRepsAtMaxWeight: r,
        estimated1RM: e1RM,
        maxVolumeSessionKg: w * r,
        lastDate: s.completedAt || new Date().toISOString(),
      });
    } else {
      if (w > current.maxWeightKg || (w === current.maxWeightKg && r > current.maxRepsAtMaxWeight)) {
        current.maxWeightKg = w;
        current.maxRepsAtMaxWeight = r;
      }
      if (e1RM > current.estimated1RM) {
        current.estimated1RM = e1RM;
      }
      if (s.completedAt && s.completedAt > current.lastDate) {
        current.lastDate = s.completedAt;
      }
    }
  }

  return {
    totalWorkouts,
    totalSets,
    totalVolumeKg,
    totalDurationMinutes,
    volumeTrend,
    muscleGroupDistribution,
    personalRecords: Array.from(prMap.values()),
  };
}
