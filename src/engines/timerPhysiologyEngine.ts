import { Exercise, WorkoutSet, WorkoutSessionExercise, RoutineExercise, WorkoutStyleId } from '../types';

/**
 * Workout Science & Exercise Physiology Rest Interval Recommendation Engine
 *
 * Grounded in:
 * 1. Schoenfeld, B. J., Pope, Z. K., Benik, F. M., et al. (2016/2024). Longer Interset Rest Periods
 *    Enhance Muscle Strength and Hypertrophy in Resistance-Trained Men: Systematic Review.
 * 2. American College of Sports Medicine (ACSM) Position Stand (Progression Models in Resistance Training).
 * 3. Meta-analysis on Agonist-Antagonist Supersets & Rest Densities (2025).
 * 4. Meta-analysis on Drop-Set & Rest-Pause Fatigue Dynamics (2026).
 *
 * Key Principles:
 * - Multi-joint heavy compounds demand higher phosphagen (ATP-PCr) and neuromuscular recovery (150~180s).
 * - Machine compounds allow stable motor recruitment with moderate recovery (120s).
 * - Single-joint isolation movements recover faster with minimal systemic fatigue (90s).
 * - Warmup sets aim to prime motor patterns without accumulating fatigue (60s).
 * - Rest extensions for machine waiting or voluntary recovery are NEVER penalized.
 */

export interface PhysiologyTimerRecommendation {
  recommendedSeconds: number;
  categoryLabel: string;
  scientificReason: string;
}

/**
 * Returns science-based initial recommendation based on exercise properties
 */
export function getPhysiologicalRestRecommendation(exercise: Exercise, isWarmup = false): PhysiologyTimerRecommendation {
  if (isWarmup) {
    return {
      recommendedSeconds: 60,
      categoryLabel: '워밍업 세트',
      scientificReason: '신경계 활성화 및 관절 준비를 위해 가벼운 60초 휴식이 권장됩니다 (ACSM).',
    };
  }

  const id = exercise.id.toLowerCase();
  const category = exercise.category;
  const isCompound = exercise.exerciseType === 'compound';

  // 1. Heavy lower body compound (Squats, Deadlifts, Leg Presses)
  if (
    category === 'legs' && isCompound ||
    id.includes('squat') ||
    id.includes('deadlift') ||
    id.includes('leg_press') ||
    id.includes('hack')
  ) {
    return {
      recommendedSeconds: 180,
      categoryLabel: '고부하 하체 복합운동',
      scientificReason: '대근육군 동원과 ATP-PCr 인원질계 완전 회복을 위해 180초(3분) 휴식이 권장됩니다 (Schoenfeld et al., 2024).',
    };
  }

  // 2. Main upper body compound (Bench Press, Overhead Press, Barbell Row, Pull-ups, Dips)
  if (
    isCompound &&
    (id.includes('bench') ||
      id.includes('ohp') ||
      id.includes('press') ||
      id.includes('row') ||
      id.includes('pull_up') ||
      id.includes('dip')) &&
    (exercise.equipment === 'barbell' || exercise.equipment === 'bodyweight')
  ) {
    return {
      recommendedSeconds: 150,
      categoryLabel: '주요 상체 복합운동',
      scientificReason: '근신경계 피로 회복과 다음 세트 반복 횟수 유지를 위해 150초(2.5분) 휴식이 적합합니다 (ACSM 권고안).',
    };
  }

  // 3. Machine compound (Chest Press, Lat Pulldown, Cable Row, Leg Extension/Curl Machine)
  if (isCompound || exercise.equipment === 'machine' || exercise.equipment === 'cable') {
    return {
      recommendedSeconds: 120,
      categoryLabel: '머신·케이블 복합운동',
      scientificReason: '궤적 제어에 따른 안정성을 고려하여 120초(2분) 휴식으로 높은 대사 스트레스와 볼륨을 유지합니다.',
    };
  }

  // 4. Isolation exercise (Dumbbell Curls, Lateral Raises, Triceps Extensions, Calves, Abs)
  return {
    recommendedSeconds: 90,
    categoryLabel: '단일관절 고립운동',
    scientificReason: '국소 근육의 피로 회복 속도가 상대적으로 빨라 90초 내외의 휴식으로 충분한 근비대 자극을 유도합니다.',
  };
}

/**
 * 5-Tier Priority Cascade for Exercise Rest Timer:
 * 1. Current set temporary setting (세트별 임시 조정)
 * 2. Exercise group setting (슈퍼세트/컴파운드/서킷 라운드 휴식)
 * 3. Routine-saved exercise setting (루틴 설정)
 * 4. Personal per-exercise preference setting (개인 설정)
 * 5. Default exercise data (생리학적 기본 권장값)
 */
export function resolveEffectiveRestSeconds(params: {
  currentSetRestSeconds?: number;
  groupPostRestSeconds?: number;
  routineExerciseRestSeconds?: number;
  personalExerciseRestSeconds?: number;
  exercise: Exercise;
  isWarmup?: boolean;
}): { effectiveSeconds: number; source: 'current_set' | 'group' | 'routine' | 'personal' | 'default' } {
  // 1. Current set temporary override
  if (params.currentSetRestSeconds && params.currentSetRestSeconds > 0) {
    return { effectiveSeconds: params.currentSetRestSeconds, source: 'current_set' };
  }

  // 2. Exercise group setting
  if (params.groupPostRestSeconds && params.groupPostRestSeconds > 0) {
    return { effectiveSeconds: params.groupPostRestSeconds, source: 'group' };
  }

  // 3. Routine-saved exercise setting
  if (params.routineExerciseRestSeconds && params.routineExerciseRestSeconds > 0) {
    return { effectiveSeconds: params.routineExerciseRestSeconds, source: 'routine' };
  }

  // 4. Personal per-exercise preference
  if (params.personalExerciseRestSeconds && params.personalExerciseRestSeconds > 0) {
    return { effectiveSeconds: params.personalExerciseRestSeconds, source: 'personal' };
  }

  // 5. Default exercise data / physiology recommendation
  if (params.exercise.defaultRestSeconds && params.exercise.defaultRestSeconds > 0) {
    return { effectiveSeconds: params.exercise.defaultRestSeconds, source: 'default' };
  }

  const rec = getPhysiologicalRestRecommendation(params.exercise, params.isWarmup);
  return { effectiveSeconds: rec.recommendedSeconds, source: 'default' };
}
