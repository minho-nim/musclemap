import {
  Routine,
  WorkoutSession,
  WorkoutSet,
  WeeklyPlanItem,
  PlanStatus,
  DayOfWeek,
} from '../types';

export interface WeeklyGoalSummary {
  weekStartDate: string;
  totalPlannedSets: number;
  totalCompletedPlannedSets: number;
  unplannedSets: number;
  completionRatePercent: number;
  planItems: {
    dayOfWeek: DayOfWeek;
    dayName: string;
    routineName: string;
    routineId?: string;
    status: PlanStatus;
    statusText: string;
    plannedSets: number;
    completedSets: number;
  }[];
  uncompletedExercises: {
    exerciseId: string;
    targetSets: number;
    completedSets: number;
    missingSets: number;
  }[];
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * Returns the Monday date string (YYYY-MM-DD) for a given date
 */
export function getMondayOfWeek(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

/**
 * Evaluates weekly planned routines against actual completed workout sessions and sets
 */
export function calculateWeeklyGoalStatus(
  routines: Routine[],
  sessions: WorkoutSession[],
  sets: WorkoutSet[],
  referenceDate: Date = new Date()
): WeeklyGoalSummary {
  const weekStartStr = getMondayOfWeek(referenceDate);
  const weekStartTime = new Date(weekStartStr).getTime();
  const weekEndTime = weekStartTime + 7 * 24 * 60 * 60 * 1000;

  // Filter sessions that took place during this week
  const thisWeekSessions = sessions.filter((s) => {
    const sTime = new Date(s.startTime).getTime();
    return sTime >= weekStartTime && sTime < weekEndTime;
  });

  const thisWeekSessionIds = new Set(thisWeekSessions.map((s) => s.id));
  const thisWeekSets = sets.filter(
    (st) => st.isCompleted && thisWeekSessionIds.has(st.sessionId)
  );

  // Group sets by exerciseId
  const completedSetsByExercise = new Map<string, number>();
  for (const st of thisWeekSets) {
    completedSetsByExercise.set(
      st.exerciseId,
      (completedSetsByExercise.get(st.exerciseId) || 0) + 1
    );
  }

  // Build daily scheduled routines from user's routines
  const planItems: WeeklyGoalSummary['planItems'] = [];
  let totalPlannedSets = 0;
  let totalCompletedPlannedSets = 0;

  const currentDayOfWeek = referenceDate.getDay() as DayOfWeek;

  // Exercises planned and their targets
  const exerciseTargetSets = new Map<string, number>();

  for (let day = 1; day <= 7; day++) {
    const dayOfWeek = (day === 7 ? 0 : day) as DayOfWeek;
    const scheduledRoutines = routines.filter((r) => r.scheduledDays.includes(dayOfWeek));

    if (scheduledRoutines.length === 0) {
      planItems.push({
        dayOfWeek,
        dayName: `${DAY_NAMES[dayOfWeek]}요일`,
        routineName: '휴식일',
        status: 'scheduled',
        statusText: '휴식 예정',
        plannedSets: 0,
        completedSets: 0,
      });
      continue;
    }

    for (const r of scheduledRoutines) {
      const routineTargetSets = r.exercises.reduce((sum, e) => sum + e.targetSets, 0);
      totalPlannedSets += routineTargetSets;

      for (const re of r.exercises) {
        exerciseTargetSets.set(
          re.exerciseId,
          (exerciseTargetSets.get(re.exerciseId) || 0) + re.targetSets
        );
      }

      // Find matching session on this day
      const sessionOnDay = thisWeekSessions.find((s) => {
        const sDate = new Date(s.startTime);
        return sDate.getDay() === dayOfWeek && (s.routineId === r.id || s.routineName === r.name);
      });

      let status: PlanStatus = 'scheduled';
      let statusText = '예정';
      let completedDaySets = 0;

      if (sessionOnDay) {
        const daySets = thisWeekSets.filter((s) => s.sessionId === sessionOnDay.id);
        completedDaySets = daySets.length;

        if (completedDaySets >= routineTargetSets) {
          status = 'completed';
          statusText = '완료';
        } else if (completedDaySets > 0) {
          status = 'partially_completed';
          statusText = `부분 완료 (${completedDaySets}/${routineTargetSets})`;
        }
      } else {
        // Check if day has passed
        const dayIdx = dayOfWeek === 0 ? 7 : dayOfWeek;
        const currentIdx = currentDayOfWeek === 0 ? 7 : currentDayOfWeek;

        if (dayIdx < currentIdx) {
          status = 'delayed';
          statusText = '지연 (미완료)';
        } else if (dayIdx === currentIdx) {
          status = 'scheduled';
          statusText = '오늘 예정';
        } else {
          status = 'scheduled';
          statusText = '예정';
        }
      }

      planItems.push({
        dayOfWeek,
        dayName: `${DAY_NAMES[dayOfWeek]}요일`,
        routineName: r.name,
        routineId: r.id,
        status,
        statusText,
        plannedSets: routineTargetSets,
        completedSets: completedDaySets,
      });
    }
  }

  // Compute strictly non-offsetting completed sets per exercise
  const uncompletedExercises: WeeklyGoalSummary['uncompletedExercises'] = [];
  exerciseTargetSets.forEach((targetSets, exerciseId) => {
    const actualSets = completedSetsByExercise.get(exerciseId) || 0;
    // Cap at targetSets so excess does NOT cancel out deficiencies in other exercises
    const validCount = Math.min(targetSets, actualSets);
    totalCompletedPlannedSets += validCount;

    if (actualSets < targetSets) {
      uncompletedExercises.push({
        exerciseId,
        targetSets,
        completedSets: actualSets,
        missingSets: targetSets - actualSets,
      });
    }
  });

  const completionRatePercent =
    totalPlannedSets > 0
      ? Math.round((totalCompletedPlannedSets / totalPlannedSets) * 100)
      : 100;

  return {
    weekStartDate: weekStartStr,
    totalPlannedSets,
    totalCompletedPlannedSets,
    unplannedSets: Math.max(0, thisWeekSets.length - totalCompletedPlannedSets),
    completionRatePercent,
    planItems,
    uncompletedExercises,
  };
}
