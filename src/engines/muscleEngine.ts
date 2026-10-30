import { MuscleId, MuscleStimulationMap, WorkoutSession, WorkoutSet, Exercise } from '../types';
import { ALL_MUSCLE_IDS, MUSCLE_DEFINITIONS } from '../data/muscles';
import { calculateSetsVolume } from './workoutEngine';

export interface MuscleIntensityResult {
  fillColor: string;
  strokeColor: string;
  opacity: number;
  labelValue: string;
  intensityScore: number; // 0 to 1
}

export interface StimulationFilterOptions {
  dateFilterDays?: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

/**
 * Aggregates muscle stimulation across given sessions and sets with period or custom date range filter
 */
export function calculateMuscleStimulation(
  sessions: WorkoutSession[],
  sets: WorkoutSet[],
  exercisesMap: Map<string, Exercise>,
  filter?: number | StimulationFilterOptions
): MuscleStimulationMap {
  const result: MuscleStimulationMap = {};

  // Initialize for all muscles
  for (const muscleId of ALL_MUSCLE_IDS) {
    result[muscleId] = {
      directSets: 0,
      indirectSets: 0,
      totalSets: 0,
      volumeKg: 0,
      frequencyDays: 0,
      exercises: [],
    };
  }

  // Determine filter range
  let startMs = 0;
  let endMs = Infinity;

  if (typeof filter === 'number') {
    startMs = Date.now() - filter * 24 * 60 * 60 * 1000;
  } else if (filter) {
    if (filter.startDate) {
      startMs = new Date(`${filter.startDate}T00:00:00`).getTime();
    } else if (filter.dateFilterDays) {
      startMs = Date.now() - filter.dateFilterDays * 24 * 60 * 60 * 1000;
    }
    if (filter.endDate) {
      endMs = new Date(`${filter.endDate}T23:59:59.999`).getTime();
    }
  }

  const validSessions = sessions.filter((s) => {
    if (!s.isCompleted) return false;
    const sessionTime = new Date(s.startTime).getTime();
    return sessionTime >= startMs && sessionTime <= endMs;
  });

  const sessionIds = new Set(validSessions.map((s) => s.id));
  const validSets = sets.filter((s) => s.isCompleted && sessionIds.has(s.sessionId));

  // Map to track dates per muscle for frequency calculation
  const muscleDatesMap: Record<string, Set<string>> = {};
  for (const muscleId of ALL_MUSCLE_IDS) {
    muscleDatesMap[muscleId] = new Set();
  }

  // Group sets by exercise
  for (const set of validSets) {
    const ex = exercisesMap.get(set.exerciseId);
    if (!ex) continue;

    const setVolume = calculateSetsVolume([set]);

    const session = validSessions.find((s) => s.id === set.sessionId);
    const dateStr = session ? session.startTime.split('T')[0] : '';

    // Primary muscles (1.0 direct set)
    for (const pMuscle of ex.primaryMuscles) {
      if (!result[pMuscle]) continue;
      result[pMuscle].directSets += 1;
      result[pMuscle].totalSets += 1;
      result[pMuscle].volumeKg += setVolume;
      if (dateStr) muscleDatesMap[pMuscle].add(dateStr);

      // Track exercise breakdown
      const existingEx = result[pMuscle].exercises.find((e) => e.exerciseId === ex.id);
      if (existingEx) {
        existingEx.sets += 1;
      } else {
        result[pMuscle].exercises.push({
          exerciseId: ex.id,
          nameKo: ex.nameKo,
          sets: 1,
        });
      }
    }

    // Secondary muscles (0.5 indirect set)
    for (const sMuscle of ex.secondaryMuscles) {
      if (!result[sMuscle]) continue;
      result[sMuscle].indirectSets += 1;
      result[sMuscle].totalSets += 0.5;
      result[sMuscle].volumeKg += setVolume * 0.5;
      if (dateStr) muscleDatesMap[sMuscle].add(dateStr);

      const existingEx = result[sMuscle].exercises.find((e) => e.exerciseId === ex.id);
      if (existingEx) {
        existingEx.sets += 1;
      } else {
        result[sMuscle].exercises.push({
          exerciseId: ex.id,
          nameKo: ex.nameKo,
          sets: 1,
        });
      }
    }
  }

  // Populate frequency
  for (const muscleId of ALL_MUSCLE_IDS) {
    result[muscleId].frequencyDays = muscleDatesMap[muscleId]?.size || 0;
  }

  return result;
}

/**
 * Returns color and intensity styling for SVG rendering based on mode
 */
export function getMuscleVisualProperties(
  muscleId: MuscleId,
  data: MuscleStimulationMap[string],
  mode: 'direct_sets' | 'frequency' | 'goal_achievement',
  isSelected: boolean,
  targetWeeklySets: number = 10
): MuscleIntensityResult {
  if (isSelected) {
    return {
      fillColor: '#26E5BA',
      strokeColor: '#FFFFFF',
      opacity: 1,
      labelValue: `${data.directSets}세트`,
      intensityScore: 1,
    };
  }

  if (mode === 'direct_sets') {
    const sets = data.directSets;
    if (sets === 0 && data.indirectSets === 0) {
      return {
        fillColor: '#242B28',
        strokeColor: '#343C39',
        opacity: 0.5,
        labelValue: '0',
        intensityScore: 0,
      };
    }
    if (sets === 0 && data.indirectSets > 0) {
      // Only secondary stimulation
      return {
        fillColor: '#173D34',
        strokeColor: '#205B4E',
        opacity: 0.75,
        labelValue: `(보조 ${data.indirectSets})`,
        intensityScore: 0.25,
      };
    }
    if (sets <= 4) {
      return {
        fillColor: '#1A5344',
        strokeColor: '#237B64',
        opacity: 0.85,
        labelValue: `${sets}세트`,
        intensityScore: 0.4,
      };
    }
    if (sets <= 9) {
      return {
        fillColor: '#1E856C',
        strokeColor: '#26AA8B',
        opacity: 0.92,
        labelValue: `${sets}세트`,
        intensityScore: 0.7,
      };
    }
    if (sets <= 16) {
      return {
        fillColor: '#26E5BA',
        strokeColor: '#6AF8D5',
        opacity: 0.95,
        labelValue: `${sets}세트`,
        intensityScore: 0.9,
      };
    }
    // High volume
    return {
      fillColor: '#63FFD9',
      strokeColor: '#A3FFE8',
      opacity: 1,
      labelValue: `${sets}세트`,
      intensityScore: 1,
    };
  }

  if (mode === 'frequency') {
    const days = data.frequencyDays;
    if (days === 0) {
      return {
        fillColor: '#242B28',
        strokeColor: '#343C39',
        opacity: 0.5,
        labelValue: '0일',
        intensityScore: 0,
      };
    }
    if (days === 1) {
      return {
        fillColor: '#1A5344',
        strokeColor: '#237B64',
        opacity: 0.85,
        labelValue: '1일',
        intensityScore: 0.35,
      };
    }
    if (days === 2) {
      return {
        fillColor: '#1E856C',
        strokeColor: '#26AA8B',
        opacity: 0.92,
        labelValue: '2일',
        intensityScore: 0.7,
      };
    }
    return {
      fillColor: '#26E5BA',
      strokeColor: '#6AF8D5',
      opacity: 1,
      labelValue: `${days}일+`,
      intensityScore: 1,
    };
  }

  // goal_achievement
  const progressRatio = targetWeeklySets > 0 ? Math.min(1.5, data.totalSets / targetWeeklySets) : 0;
  if (progressRatio === 0) {
    return {
      fillColor: '#242B28',
      strokeColor: '#343C39',
      opacity: 0.5,
      labelValue: '0%',
      intensityScore: 0,
    };
  }
  if (progressRatio < 0.5) {
    return {
      fillColor: '#1A5344',
      strokeColor: '#237B64',
      opacity: 0.85,
      labelValue: `${Math.round(progressRatio * 100)}%`,
      intensityScore: 0.4,
    };
  }
  if (progressRatio < 1.0) {
    return {
      fillColor: '#1E856C',
      strokeColor: '#26AA8B',
      opacity: 0.92,
      labelValue: `${Math.round(progressRatio * 100)}%`,
      intensityScore: 0.75,
    };
  }
  // Achieved 100%+
  return {
    fillColor: '#26E5BA',
    strokeColor: '#6AF8D5',
    opacity: 1,
    labelValue: `${Math.round(progressRatio * 100)}% 달성`,
    intensityScore: 1,
  };
}
