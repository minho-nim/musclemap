import {
  WorkoutSession,
  WorkoutSet,
  PaceEvent,
  PaceScore,
  GeneralScoreBreakdown,
  ChallengeScoreBreakdown,
  PaceModeSettings,
} from '../types';

/**
 * Calculates General Workout Score (100 pts max)
 * Independent of Pace Mode - evaluates adherence and execution quality
 */
export function calculateGeneralScore(
  session: WorkoutSession,
  sets: WorkoutSet[]
): { score: number | null; breakdown: GeneralScoreBreakdown } {
  const completedSets = sets.filter((s) => s.isCompleted);

  // If no sets completed, insufficient data
  if (completedSets.length === 0) {
    return {
      score: null,
      breakdown: {
        targetSetsScore: 0,
        recordCompletenessScore: 0,
        plannedExercisesScore: 0,
        sessionFinishScore: 0,
        details: ['평가 데이터 부족 (완료된 세트 없음)'],
      },
    };
  }

  const details: string[] = [];
  const isFreeWorkout = !session.routineId;

  // 1. Target Sets Achievement (max 50 pts)
  let targetSetsScore = 0;
  const plannedTotalSets = session.exercises.reduce((sum, e) => sum + (e.targetSets || 0), 0);

  if (plannedTotalSets > 0) {
    // Non-offsetting: calculate target achievement per exercise
    let achievedPlannedSets = 0;
    session.exercises.forEach((ex) => {
      const exCompletedCount = completedSets.filter((s) => s.exerciseId === ex.exerciseId).length;
      achievedPlannedSets += Math.min(ex.targetSets || 0, exCompletedCount);
    });

    const ratio = Math.min(1, achievedPlannedSets / plannedTotalSets);
    targetSetsScore = Math.round(ratio * 50);
    details.push(`목표 세트 달성: ${achievedPlannedSets}/${plannedTotalSets}세트 (${targetSetsScore}/50점)`);
  } else {
    // Free workout with no planned targets: renormalize by granting full portion proportionally
    targetSetsScore = 50;
    details.push('자유 운동: 실적 기반 전체 세트 점수 적용 (50/50점)');
  }

  // 2. Workout Record Completeness (max 25 pts)
  let validRecordsCount = 0;
  for (const s of completedSets) {
    const hasWeightOrReps = (s.weight !== undefined && s.weight >= 0) || (s.reps !== undefined && s.reps > 0);
    const hasTimeOrDistance = (s.durationSeconds !== undefined && s.durationSeconds > 0) || (s.distanceMeters !== undefined && s.distanceMeters > 0);
    if (hasWeightOrReps || hasTimeOrDistance) {
      validRecordsCount++;
    }
  }
  const completenessRatio = completedSets.length > 0 ? validRecordsCount / completedSets.length : 0;
  const recordCompletenessScore = Math.round(completenessRatio * 25);
  details.push(`기록 완성도: ${validRecordsCount}/${completedSets.length}건 유효 (${recordCompletenessScore}/25점)`);

  // 3. Planned Exercises Completion (max 15 pts)
  let plannedExercisesScore = 0;
  if (session.exercises.length > 0) {
    const uniqueExercisesDone = new Set(completedSets.map((s) => s.exerciseId));
    let performedPlannedCount = 0;
    session.exercises.forEach((ex) => {
      if (uniqueExercisesDone.has(ex.exerciseId)) {
        performedPlannedCount++;
      }
    });

    const exRatio = performedPlannedCount / session.exercises.length;
    plannedExercisesScore = Math.round(exRatio * 15);
    details.push(`종목 수행률: ${performedPlannedCount}/${session.exercises.length}개 종목 (${plannedExercisesScore}/15점)`);
  } else {
    plannedExercisesScore = 15;
    details.push('자유 운동: 종목 달성 점수 전액 반영 (15/15점)');
  }

  // 4. Session Finish (max 10 pts)
  const sessionFinishScore = session.isCompleted ? 10 : 5;
  details.push(session.isCompleted ? '세션 정상 마무리: 10/10점' : '세션 중단: 5/10점');

  const totalScore = Math.min(100, targetSetsScore + recordCompletenessScore + plannedExercisesScore + sessionFinishScore);

  return {
    score: totalScore,
    breakdown: {
      targetSetsScore,
      recordCompletenessScore,
      plannedExercisesScore,
      sessionFinishScore,
      details,
    },
  };
}

/**
 * Calculates Pace Challenge Score (100 pts max)
 * Applicable ONLY when Pace Mode was enabled for the session
 */
export function calculateChallengeScore(
  session: WorkoutSession,
  sets: WorkoutSet[],
  events: PaceEvent[],
  settings?: PaceModeSettings
): { score: number | null; breakdown: ChallengeScoreBreakdown } {
  // If Pace Mode was not enabled or no sets
  if (!session.paceModeEnabled) {
    return {
      score: null,
      breakdown: {
        startButtonScore: 0,
        prepCountdownScore: 0,
        restartTimingScore: 0,
        flowScore: 0,
        details: ['Pace Mode 미사용 세션'],
      },
    };
  }

  const completedSets = sets.filter((s) => s.isCompleted);
  if (completedSets.length === 0) {
    return {
      score: null,
      breakdown: {
        startButtonScore: 0,
        prepCountdownScore: 0,
        restartTimingScore: 0,
        flowScore: 0,
        details: ['평가 데이터 부족 (완료 세트 없음)'],
      },
    };
  }

  const details: string[] = [];
  const graceSeconds = settings?.restartGraceSeconds || 15;

  // 1. Start Button Usage (max 35 pts)
  // Evaluates how many sets were initiated via Pace Mode start button vs manual record
  const setStartedEvents = events.filter((e) => e.type === 'set_started');
  const manualSetEvents = events.filter((e) => e.type === 'set_recorded_manually');
  const totalSetStarts = setStartedEvents.length + manualSetEvents.length || completedSets.length;

  const startRatio = totalSetStarts > 0 ? Math.min(1, setStartedEvents.length / totalSetStarts) : 1;
  const startButtonScore = Math.round(startRatio * 35);
  details.push(`시작 버튼 실행: ${setStartedEvents.length}/${totalSetStarts}세트 (${startButtonScore}/35점)`);

  // 2. Preparation Countdown Completion (max 15 pts)
  // Evaluates prep countdown completed without skip
  const prepStarted = events.filter((e) => e.type === 'preparation_started');
  const prepCompleted = events.filter((e) => e.type === 'preparation_completed');
  let prepCountdownScore = 15;

  if (prepStarted.length > 0) {
    const prepRatio = prepCompleted.length / prepStarted.length;
    prepCountdownScore = Math.round(prepRatio * 15);
    details.push(`준비 카운트다운 완료: ${prepCompleted.length}/${prepStarted.length}회 (${prepCountdownScore}/15점)`);
  } else {
    details.push('준비 카운트다운 평가 생략: 15/15점');
  }

  // 3. Restart Promptness after Rest (max 30 pts)
  // Evaluates WAITING_NEXT restart delay against grace period
  const nextSetStartedEvents = events.filter((e) => e.type === 'next_set_started');
  let restartScoreSum = 0;
  let evaluatedRestarts = 0;

  nextSetStartedEvents.forEach((ev) => {
    // If metadata has restartDelaySeconds and not excused
    if (ev.metadata?.isExcused) {
      restartScoreSum += 1.0; // 100% granted for excused extension (recovery, machine wait)
      evaluatedRestarts++;
      return;
    }

    const delay = ev.metadata?.restartDelaySeconds ?? 0;
    let factor = 1.0;
    if (delay <= graceSeconds) {
      factor = 1.0;
    } else if (delay <= graceSeconds * 2) {
      factor = 0.8;
    } else if (delay <= graceSeconds * 4) {
      factor = 0.5;
    } else if (delay <= graceSeconds * 8) {
      factor = 0.2;
    } else {
      factor = 0.0;
    }
    restartScoreSum += factor;
    evaluatedRestarts++;
  });

  let restartTimingScore = 30;
  if (evaluatedRestarts > 0) {
    const restartRatio = restartScoreSum / evaluatedRestarts;
    restartTimingScore = Math.round(restartRatio * 30);
    details.push(`휴식 후 재시작 타이밍: 평균 ${Math.round(restartRatio * 100)}% 달성 (${restartTimingScore}/30점)`);
  } else {
    details.push('재시작 타이밍 평가 생략 (단일 세트 등): 30/30점');
  }

  // 4. Timer Flow Normal Execution (max 20 pts)
  // Checked for unhandled interruptions
  const interruptions = events.filter((e) => e.type === 'timer_interrupted');
  const flowScore = Math.max(0, 20 - interruptions.length * 5);
  details.push(
    interruptions.length === 0
      ? '타이머 상태 흐름 완벽: 20/20점'
      : `비정상 중단 ${interruptions.length}회 발생: ${flowScore}/20점`
  );

  const totalScore = Math.min(100, Math.max(0, startButtonScore + prepCountdownScore + restartTimingScore + flowScore));

  return {
    score: totalScore,
    breakdown: {
      startButtonScore,
      prepCountdownScore,
      restartTimingScore,
      flowScore,
      details,
    },
  };
}

/**
 * Computes complete PaceScore for session and persists
 */
export function evaluateSessionScores(
  session: WorkoutSession,
  sets: WorkoutSet[],
  events: PaceEvent[],
  settings?: PaceModeSettings
): PaceScore {
  const general = calculateGeneralScore(session, sets);
  const challenge = calculateChallengeScore(session, sets, events, settings);

  return {
    sessionId: session.id,
    generalScore: general.score,
    challengeScore: challenge.score,
    generalBreakdown: general.breakdown,
    challengeBreakdown: challenge.breakdown,
    calculatedAt: new Date().toISOString(),
    scorePolicyVersion: '1.0.0',
  };
}
