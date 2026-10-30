import { WorkoutSession, WorkoutSet, WorkoutStyleId } from '../types';

/**
 * Workout Style Gamification XP System
 *
 * Rules:
 * - Separated from performance scores (not added to 100-point general or challenge scores)
 * - Daily cap: Max 15 XP per calendar day (to avoid encouraging reckless overtraining)
 * - Awarded only upon normal completion of the respective workout style block or completed sets
 * - Deduplication: prevents redundant XP triggers for the same group/set
 */

export const WORKOUT_STYLE_XP_TABLE: Record<WorkoutStyleId, { xp: number; nameKo: string }> = {
  standard: { xp: 0, nameKo: '미지정 (일반 세트)' },
  superset: { xp: 4, nameKo: '슈퍼세트' },
  drop_set: { xp: 3, nameKo: '드롭세트' },
  pyramid: { xp: 2, nameKo: '피라미드세트' },
  compound_set: { xp: 4, nameKo: '컴파운드세트' },
  rest_pause: { xp: 3, nameKo: '레스트-포즈' },
  circuit: { xp: 5, nameKo: '서킷 트레이닝' },
  giant_set: { xp: 5, nameKo: '자이언트세트' },
};

export const DAILY_XP_CAP = 15;

export interface StyleXpSummary {
  earnedSessionXp: number; // Raw XP earned in this workout session
  awardedXp: number; // XP actually credited after checking daily cap
  todayTotalXp: number; // Total XP accumulated today (max 15)
  remainingDailyXp: number; // How much XP can still be earned today
  breakdown: {
    styleId: WorkoutStyleId;
    nameKo: string;
    xpPerUnit: number;
    count: number;
    totalXp: number;
  }[];
}

const STORAGE_KEY_XP = 'musclemap_daily_xp_data';

interface DailyXpStorage {
  date: string; // YYYY-MM-DD
  totalXp: number;
  awardedSessionIds: string[];
}

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDailyXpRecord(): DailyXpStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_XP);
    const today = getTodayString();
    if (!raw) {
      return { date: today, totalXp: 0, awardedSessionIds: [] };
    }
    const parsed = JSON.parse(raw) as DailyXpStorage;
    if (parsed.date !== today) {
      return { date: today, totalXp: 0, awardedSessionIds: [] };
    }
    return parsed;
  } catch {
    return { date: getTodayString(), totalXp: 0, awardedSessionIds: [] };
  }
}

export function saveDailyXpRecord(record: DailyXpStorage): void {
  try {
    localStorage.setItem(STORAGE_KEY_XP, JSON.stringify(record));
  } catch (e) {
    // Ignore storage quota
  }
}

/**
 * Calculates Style XP earned in a workout session without redundant triggers
 */
export function calculateSessionStyleXp(
  session: WorkoutSession,
  sets: WorkoutSet[],
  commitRecord = false
): StyleXpSummary {
  const completedSets = sets.filter((s) => s.isCompleted);
  const countsByStyle: Partial<Record<WorkoutStyleId, number>> = {};
  const processedKeys = new Set<string>();

  // 1. Process group blocks (superset, compound, circuit, giant_set)
  if (session.blocks && session.blocks.length > 0) {
    for (const block of session.blocks) {
      const blockSets = completedSets.filter((s) => s.blockId === block.id);
      // Validated if at least one round was performed with completed sets
      if (blockSets.length >= block.exerciseIds.length) {
        const key = `block_${block.id}`;
        if (!processedKeys.has(key)) {
          processedKeys.add(key);
          countsByStyle[block.styleId] = (countsByStyle[block.styleId] || 0) + 1;
        }
      }
    }
  }

  // 2. Process exercise-level styles (drop_set, rest_pause, pyramid)
  for (const se of session.exercises) {
    const styleId = se.styleId;
    if (styleId && styleId !== 'standard' && !['superset', 'compound_set', 'circuit', 'giant_set'].includes(styleId)) {
      const exSets = completedSets.filter((s) => s.exerciseId === se.exerciseId);
      if (exSets.length > 0) {
        const key = `exercise_${se.exerciseId}_${styleId}`;
        if (!processedKeys.has(key)) {
          processedKeys.add(key);
          countsByStyle[styleId] = (countsByStyle[styleId] || 0) + 1;
        }
      }
    }
  }

  // Also check individual sets that have specialized styleId
  for (const set of completedSets) {
    if (set.styleId && set.styleId !== 'standard') {
      const key = `set_${set.id}_${set.styleId}`;
      if (!processedKeys.has(`exercise_${set.exerciseId}_${set.styleId}`) && !processedKeys.has(key)) {
        processedKeys.add(key);
        countsByStyle[set.styleId] = (countsByStyle[set.styleId] || 0) + 1;
      }
    }
  }

  const breakdown: StyleXpSummary['breakdown'] = [];
  let totalRawXp = 0;

  for (const [styleIdKey, count] of Object.entries(countsByStyle)) {
    const sId = styleIdKey as WorkoutStyleId;
    const tableItem = WORKOUT_STYLE_XP_TABLE[sId];
    if (tableItem && tableItem.xp > 0 && count && count > 0) {
      const xpVal = tableItem.xp * count;
      totalRawXp += xpVal;
      breakdown.push({
        styleId: sId,
        nameKo: tableItem.nameKo,
        xpPerUnit: tableItem.xp,
        count,
        totalXp: xpVal,
      });
    }
  }

  // Daily Cap Check
  const currentDaily = getDailyXpRecord();
  const alreadyAwardedForThisSession = currentDaily.awardedSessionIds.includes(session.id);

  let awardedXp = 0;
  if (!alreadyAwardedForThisSession) {
    const availableCap = Math.max(0, DAILY_XP_CAP - currentDaily.totalXp);
    awardedXp = Math.min(totalRawXp, availableCap);

    if (commitRecord && awardedXp > 0) {
      currentDaily.totalXp += awardedXp;
      currentDaily.awardedSessionIds.push(session.id);
      saveDailyXpRecord(currentDaily);
    }
  }

  return {
    earnedSessionXp: totalRawXp,
    awardedXp,
    todayTotalXp: Math.min(DAILY_XP_CAP, currentDaily.totalXp + (commitRecord ? 0 : awardedXp)),
    remainingDailyXp: Math.max(0, DAILY_XP_CAP - (currentDaily.totalXp + (commitRecord ? 0 : awardedXp))),
    breakdown,
  };
}
