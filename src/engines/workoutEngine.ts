import { WorkoutSet, Exercise } from '../types';

/**
 * Calculates estimated 1 Rep Max using the Epley formula
 */
export function calculateEstimated1RM(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

/**
 * Calculates total volume in kilograms for a list of sets,
 * including drop set stages and rest-pause additional reps accurately
 */
export function calculateSetsVolume(sets: WorkoutSet[]): number {
  return sets.reduce((total, set) => {
    if (!set.isCompleted) return total;

    const baseWeight = set.weight || 0;
    const baseReps = set.reps || 0;
    let setTotal = baseWeight * baseReps;

    // If set has completed segments (e.g. drop sets or rest-pause)
    if (set.segments && set.segments.length > 0) {
      for (const seg of set.segments) {
        if (!seg.isCompleted) continue;
        if (seg.type === 'drop') {
          // Drop sets have their own reduced weight and reps
          const dropWeight = seg.weight ?? baseWeight;
          const dropReps = seg.reps ?? 0;
          setTotal += dropWeight * dropReps;
        } else if (seg.type === 'rest_pause') {
          // Rest-pause uses the same base weight with additional reps
          const extraReps = seg.reps ?? 0;
          const pauseWeight = seg.weight ?? baseWeight;
          setTotal += pauseWeight * extraReps;
        }
      }
    }

    return total + setTotal;
  }, 0);
}

/**
 * Calculates total completed sets count (distinguishing parent sets from drop stages)
 */
export function countCompletedSets(sets: WorkoutSet[]): number {
  return sets.filter((s) => s.isCompleted).length;
}

/**
 * Validates a set's input values before completing
 */
export function validateSetInput(
  exercise: Exercise,
  set: Partial<WorkoutSet>
): { isValid: boolean; errorMessage?: string } {
  if (exercise.logType === 'weight_reps') {
    if ((set.weight ?? 0) < 0) {
      return { isValid: false, errorMessage: '중량은 0kg 이상이어야 합니다.' };
    }
    if ((set.reps ?? 0) <= 0) {
      return { isValid: false, errorMessage: '반복 횟수는 1회 이상이어야 합니다.' };
    }
  } else if (exercise.logType === 'reps_only') {
    if ((set.reps ?? 0) <= 0) {
      return { isValid: false, errorMessage: '반복 횟수는 1회 이상이어야 합니다.' };
    }
  } else if (exercise.logType === 'time') {
    if ((set.durationSeconds ?? 0) <= 0) {
      return { isValid: false, errorMessage: '운동 시간을 1초 이상 입력하세요.' };
    }
  } else if (exercise.logType === 'distance' || exercise.logType === 'distance_time') {
    if ((set.distanceMeters ?? 0) <= 0 && (set.durationSeconds ?? 0) <= 0) {
      return { isValid: false, errorMessage: '거리 또는 시간을 입력하세요.' };
    }
  }
  return { isValid: true };
}
