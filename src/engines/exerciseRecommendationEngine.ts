import {
  Exercise,
  MuscleId,
  Routine,
  WorkoutSession,
  WorkoutSet,
  ExerciseRecommendation,
  Difficulty,
  Equipment,
} from '../types';
import { MUSCLE_DEFINITIONS } from '../data/muscles';

export interface RecommendationFilter {
  muscleId?: MuscleId;
  searchQuery?: string;
  equipment?: Equipment | 'all';
  difficulty?: Difficulty | 'all';
  exerciseType?: 'compound' | 'isolation' | 'all';
}

/**
 * Generates Standard Key Recommendations (대표 운동 추천)
 * Deterministic rule-based ranking based on primary muscle match, compound status, and popularity
 */
export function getStandardRecommendations(
  exercises: Exercise[],
  muscleId?: MuscleId,
  filter?: RecommendationFilter
): ExerciseRecommendation[] {
  let list = exercises;

  // Filter by muscle if selected
  if (muscleId) {
    list = list.filter(
      (e) => e.primaryMuscles.includes(muscleId) || e.secondaryMuscles.includes(muscleId)
    );
  }

  // Filter by search query
  if (filter?.searchQuery) {
    const q = filter.searchQuery.toLowerCase().trim();
    list = list.filter(
      (e) =>
        e.nameKo.toLowerCase().includes(q) ||
        e.nameEn.toLowerCase().includes(q) ||
        e.aliases.some((a) => a.toLowerCase().includes(q))
    );
  }

  // Filter by equipment
  if (filter?.equipment && filter.equipment !== 'all') {
    list = list.filter((e) => e.equipment === filter.equipment);
  }

  // Filter by exerciseType
  if (filter?.exerciseType && filter.exerciseType !== 'all') {
    list = list.filter((e) => e.exerciseType === filter.exerciseType);
  }

  // Map to recommendations
  return list
    .map((ex) => {
      const isPrimary = muscleId ? ex.primaryMuscles.includes(muscleId) : true;
      let score = isPrimary ? 100 : 40;

      // Compound exercises get slight priority in standard ranking
      if (ex.exerciseType === 'compound') score += 20;

      const muscleName = muscleId ? MUSCLE_DEFINITIONS[muscleId]?.nameKo : '목표 근육';
      const reason = isPrimary
        ? `${muscleName} 부위를 가장 직접적으로 자극하는 대표 종목입니다.`
        : `${muscleName} 부위가 협력근으로 자극되는 보조 종목입니다.`;

      return {
        exercise: ex,
        isPersonalized: false,
        reason,
        priorityScore: score,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Generates Personalized Recommendations (나에게 추천)
 * Based on user routines, weekly target shortfall, recent exercise logs, and current muscle selection
 */
export function getPersonalizedRecommendations(
  exercises: Exercise[],
  routines: Routine[],
  sessions: WorkoutSession[],
  sets: WorkoutSet[],
  muscleId?: MuscleId,
  filter?: RecommendationFilter
): ExerciseRecommendation[] {
  // Collect all exercise IDs registered in user's active routines
  const routineExerciseMap = new Map<string, string>(); // exerciseId -> routineName
  for (const r of routines) {
    for (const re of r.exercises) {
      if (!routineExerciseMap.has(re.exerciseId)) {
        routineExerciseMap.set(re.exerciseId, r.name);
      }
    }
  }

  // Calculate past 7 days logged sets per exercise and muscle
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentSessions = sessions.filter(
    (s) => s.isCompleted && new Date(s.startTime).getTime() >= sevenDaysAgo
  );
  const recentSessionIds = new Set(recentSessions.map((s) => s.id));
  const recentSets = sets.filter((s) => s.isCompleted && recentSessionIds.has(s.sessionId));

  const exerciseCompletedSets = new Map<string, number>();
  for (const s of recentSets) {
    exerciseCompletedSets.set(s.exerciseId, (exerciseCompletedSets.get(s.exerciseId) || 0) + 1);
  }

  // Filter exercises matching criteria
  let list = exercises;
  if (muscleId) {
    list = list.filter(
      (e) => e.primaryMuscles.includes(muscleId) || e.secondaryMuscles.includes(muscleId)
    );
  }

  if (filter?.searchQuery) {
    const q = filter.searchQuery.toLowerCase().trim();
    list = list.filter(
      (e) =>
        e.nameKo.toLowerCase().includes(q) ||
        e.nameEn.toLowerCase().includes(q) ||
        e.aliases.some((a) => a.toLowerCase().includes(q))
    );
  }

  if (filter?.equipment && filter.equipment !== 'all') {
    list = list.filter((e) => e.equipment === filter.equipment);
  }

  if (filter?.exerciseType && filter.exerciseType !== 'all') {
    list = list.filter((e) => e.exerciseType === filter.exerciseType);
  }

  return list
    .map((ex) => {
      let score = 50;
      const reasons: string[] = [];

      const isInRoutine = routineExerciseMap.has(ex.id);
      const routineName = routineExerciseMap.get(ex.id);

      if (isInRoutine) {
        score += 60;
        reasons.push(`내 루틴 [${routineName}]에 등록된 운동입니다.`);
      }

      const completedCount = exerciseCompletedSets.get(ex.id) || 0;
      if (completedCount === 0 && isInRoutine) {
        score += 30;
        reasons.push('이번 주 아직 수행하지 않은 계획 운동입니다.');
      } else if (completedCount > 0) {
        reasons.push(`최근 7일간 ${completedCount}세트 수행했습니다.`);
      }

      if (muscleId && ex.primaryMuscles.includes(muscleId)) {
        score += 25;
        if (reasons.length === 0) {
          reasons.push(`선택한 ${MUSCLE_DEFINITIONS[muscleId]?.nameKo}의 핵심 주동근 운동입니다.`);
        }
      }

      if (reasons.length === 0) {
        reasons.push('기초 근력 발달에 균형 있게 도움이 되는 추천 운동입니다.');
      }

      return {
        exercise: ex,
        isPersonalized: true,
        reason: reasons[0],
        priorityScore: score,
        isInUserRoutine: isInRoutine,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}
