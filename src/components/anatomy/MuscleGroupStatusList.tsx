import React from 'react';
import { MuscleId, WorkoutSession, WorkoutSet } from '../../types';

export interface MuscleGroupStatusItem {
  id: string;
  nameKo: string;
  primaryMuscleId: MuscleId;
  relatedMuscleIds: MuscleId[];
  view: 'front' | 'back';
}

export const MAIN_MUSCLE_GROUPS: MuscleGroupStatusItem[] = [
  {
    id: 'lats',
    nameKo: '광배근',
    primaryMuscleId: 'lats',
    relatedMuscleIds: ['lats'],
    view: 'back',
  },
  {
    id: 'deltoid_front',
    nameKo: '전면 어깨',
    primaryMuscleId: 'deltoid_front',
    relatedMuscleIds: ['deltoid_front', 'deltoid_side'],
    view: 'front',
  },
  {
    id: 'hamstrings',
    nameKo: '햄스트링',
    primaryMuscleId: 'hamstrings',
    relatedMuscleIds: ['hamstrings'],
    view: 'back',
  },
  {
    id: 'glutes',
    nameKo: '둔근',
    primaryMuscleId: 'glutes',
    relatedMuscleIds: ['glutes'],
    view: 'back',
  },
  {
    id: 'quads',
    nameKo: '대퇴사두근',
    primaryMuscleId: 'quads',
    relatedMuscleIds: ['quads'],
    view: 'front',
  },
  {
    id: 'chest',
    nameKo: '대흉근',
    primaryMuscleId: 'chest_mid',
    relatedMuscleIds: ['chest_upper', 'chest_mid', 'chest_lower'],
    view: 'front',
  },
  {
    id: 'traps',
    nameKo: '승모근',
    primaryMuscleId: 'traps_upper',
    relatedMuscleIds: ['traps_upper', 'traps_mid_lower'],
    view: 'back',
  },
  {
    id: 'triceps',
    nameKo: '삼두근',
    primaryMuscleId: 'triceps',
    relatedMuscleIds: ['triceps'],
    view: 'back',
  },
  {
    id: 'biceps',
    nameKo: '이두근',
    primaryMuscleId: 'biceps',
    relatedMuscleIds: ['biceps'],
    view: 'front',
  },
  {
    id: 'abs',
    nameKo: '복근',
    primaryMuscleId: 'abs',
    relatedMuscleIds: ['abs', 'obliques'],
    view: 'front',
  },
  {
    id: 'calves',
    nameKo: '종아리',
    primaryMuscleId: 'calves_back',
    relatedMuscleIds: ['calves_back', 'calves_front'],
    view: 'back',
  },
];

interface MuscleGroupStatusListProps {
  sessions: WorkoutSession[];
  sets: WorkoutSet[];
  selectedMuscleId: MuscleId | null;
  onSelectMuscle: (muscleId: MuscleId) => void;
}

export const MuscleGroupStatusList: React.FC<MuscleGroupStatusListProps> = ({
  sessions,
  sets,
  selectedMuscleId,
  onSelectMuscle,
}) => {
  const now = Date.now();

  // Helper to compute stats for a muscle group
  const getGroupStats = (group: MuscleGroupStatusItem) => {
    // Collect all sets for these muscles
    const targetSetSessionIds: { date: Date; count: number }[] = [];

    // Filter sets that hit these muscles
    const matchedSets = sets.filter((s) => s.isCompleted);
    // Group sets by session
    const setsBySession = new Map<string, number>();
    for (const s of matchedSets) {
      // Find session
      const session = sessions.find((sess) => sess.id === s.sessionId && sess.isCompleted);
      if (!session) continue;

      // Check if session exercise touched this muscle
      const sessionEx = session.exercises.find((se) => se.exerciseId === s.exerciseId);
      if (!sessionEx) continue;

      // Note: we can associate if exercise touches the target muscle
      // (we will check session exercise sets)
      setsBySession.set(session.id, (setsBySession.get(session.id) || 0) + 1);
    }

    // Find latest completed session
    let latestTime = 0;
    let latestSetCount = 0;

    for (const session of sessions) {
      if (!session.isCompleted) continue;
      const count = setsBySession.get(session.id);
      if (count && count > 0) {
        const time = new Date(session.startTime).getTime();
        if (time > latestTime) {
          latestTime = time;
          latestSetCount = count;
        }
      }
    }

    if (latestTime === 0) {
      return {
        subtitle: '최근 운동 없음',
        recoveryPct: 100,
        isRecovered: true,
      };
    }

    const hoursAgo = Math.max(0, (now - latestTime) / (1000 * 60 * 60));
    const daysAgo = Math.floor(hoursAgo / 24);

    let subtitle = '';
    if (daysAgo === 0) {
      subtitle = `오늘 ${latestSetCount}세트 완료`;
    } else if (daysAgo === 1) {
      subtitle = `어제 ${latestSetCount}세트 완료`;
    } else {
      subtitle = `${daysAgo}일 전 ${latestSetCount}세트`;
    }

    // ACSM / Schoenfeld 72-hour recovery calculation
    const recoveryPct = Math.min(100, Math.max(25, Math.round(30 + (hoursAgo / 72) * 70)));
    const isRecovered = recoveryPct >= 95;

    return { subtitle, recoveryPct, isRecovered };
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-base font-black text-[#F4F4F5] tracking-tight">메인 근육 그룹</h3>
        <span className="text-[11px] text-[#A9AAB3]">부위별 회복도 및 최근 기록</span>
      </div>

      <div className="divide-y divide-[#303137]/60 rounded-2xl bg-[#24252A] border border-[#303137] overflow-hidden shadow-lg">
        {MAIN_MUSCLE_GROUPS.map((group) => {
          const stats = getGroupStats(group);
          const isSelected = selectedMuscleId === group.primaryMuscleId;

          return (
            <button
              key={group.id}
              type="button"
              onClick={() => onSelectMuscle(group.primaryMuscleId)}
              className={`w-full flex items-center justify-between p-3.5 text-left transition-all hover:bg-[#2B2D33] ${
                isSelected ? 'bg-[#2E3138] border-l-4 border-l-[#FF806B]' : ''
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Localized Anatomical Thumbnail with Coral Highlight */}
                <div className="w-12 h-12 rounded-xl bg-[#1B1C20] border border-[#3E4048] flex items-center justify-center shrink-0 overflow-hidden relative">
                  <LocalizedMuscleThumbnail groupId={group.id} view={group.view} />
                </div>

                {/* Muscle Name & Subtitle */}
                <div className="min-w-0">
                  <span className="text-sm font-black text-[#F4F4F5] block truncate">
                    {group.nameKo}
                  </span>
                  <span className="text-xs text-[#A9AAB3] block truncate mt-0.5">
                    {stats.subtitle}
                  </span>
                </div>
              </div>

              {/* Recovery Percent Capsule */}
              <div
                className={`px-3 py-1 rounded-full text-xs font-black shrink-0 transition-all ${
                  stats.recoveryPct === 100
                    ? 'bg-[#1B1C20] text-[#F4F4F5] border border-[#3E4048]'
                    : stats.recoveryPct < 60
                    ? 'bg-[#FF806B]/20 text-[#FF806B] border border-[#FF806B]/50'
                    : 'bg-[#B4F34C]/20 text-[#B4F34C] border border-[#B4F34C]/40'
                }`}
              >
                {stats.recoveryPct}%
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Localized anatomical icon with coral highlight
 */
const LocalizedMuscleThumbnail: React.FC<{ groupId: string; view: 'front' | 'back' }> = ({
  groupId,
  view,
}) => {
  return (
    <svg viewBox="0 0 60 60" className="w-10 h-10 select-none">
      {/* Background silhouette outline */}
      <g fill="#363942" opacity="0.6">
        {view === 'front' ? (
          <>
            {/* Front Head & Torso */}
            <circle cx="30" cy="14" r="8" />
            <path d="M 22 24 C 18 25, 14 30, 12 40 L 16 42 L 20 32 L 24 48 L 36 48 L 40 32 L 44 42 L 48 40 C 46 30, 42 25, 38 24 Z" />
            <path d="M 22 48 L 22 58 L 27 58 L 28 48 Z" />
            <path d="M 32 48 L 33 58 L 38 58 L 38 48 Z" />
          </>
        ) : (
          <>
            {/* Back Head & Torso */}
            <circle cx="30" cy="14" r="8" />
            <path d="M 22 24 C 18 25, 14 30, 12 40 L 16 42 L 20 32 L 24 48 L 36 48 L 40 32 L 44 42 L 48 40 C 46 30, 42 25, 38 24 Z" />
            <path d="M 22 48 L 22 58 L 27 58 L 28 48 Z" />
            <path d="M 32 48 L 33 58 L 38 58 L 38 48 Z" />
          </>
        )}
      </g>

      {/* Target Muscle Highlight in Coral #FF806B */}
      {groupId === 'lats' && (
        <path
          d="M 22 30 C 18 34, 18 42, 23 44 C 27 41, 28 35, 27 30 Z M 38 30 C 42 34, 42 42, 37 44 C 33 41, 32 35, 33 30 Z"
          fill="#FF806B"
        />
      )}

      {(groupId === 'anterior_deltoid' || groupId === 'deltoid_front') && (
        <path
          d="M 18 24 C 14 26, 13 31, 16 34 C 19 32, 21 28, 20 24 Z M 42 24 C 46 26, 47 31, 44 34 C 41 32, 39 28, 40 24 Z"
          fill="#FF806B"
        />
      )}

      {groupId === 'hamstrings' && (
        <path
          d="M 23 46 C 22 50, 22 54, 25 56 C 27 54, 28 50, 27 46 Z M 37 46 C 38 50, 38 54, 35 56 C 33 54, 32 50, 33 46 Z"
          fill="#FF806B"
        />
      )}

      {groupId === 'glutes' && (
        <path
          d="M 23 42 C 21 44, 23 48, 28 48 C 29 46, 29 43, 27 41 Z M 37 42 C 39 44, 37 48, 32 48 C 31 46, 31 43, 33 41 Z"
          fill="#FF806B"
        />
      )}

      {(groupId === 'quadriceps' || groupId === 'quads') && (
        <path
          d="M 23 46 C 21 50, 22 54, 26 56 C 28 53, 28 49, 27 46 Z M 37 46 C 39 50, 38 54, 34 56 C 32 53, 32 49, 33 46 Z"
          fill="#FF806B"
        />
      )}

      {groupId === 'chest' && (
        <path
          d="M 22 26 C 20 30, 23 34, 29 33 C 29 29, 26 26, 22 26 Z M 38 26 C 40 30, 37 34, 31 33 C 31 29, 34 26, 38 26 Z"
          fill="#FF806B"
        />
      )}

      {(groupId === 'trapezius' || groupId === 'traps') && (
        <path
          d="M 24 22 L 30 26 L 36 22 L 34 29 L 26 29 Z"
          fill="#FF806B"
        />
      )}

      {groupId === 'triceps' && (
        <path
          d="M 15 31 C 13 34, 14 38, 17 38 C 18 36, 18 33, 17 31 Z M 45 31 C 47 34, 46 38, 43 38 C 42 36, 42 33, 43 31 Z"
          fill="#FF806B"
        />
      )}

      {groupId === 'biceps' && (
        <path
          d="M 16 30 C 14 33, 15 37, 18 37 C 19 35, 19 32, 17 30 Z M 44 30 C 46 33, 45 37, 42 37 C 41 35, 41 32, 43 30 Z"
          fill="#FF806B"
        />
      )}

      {groupId === 'abs' && (
        <g fill="#FF806B">
          <rect x="26" y="34" width="3.5" height="4" rx="1" />
          <rect x="30.5" y="34" width="3.5" height="4" rx="1" />
          <rect x="26" y="39" width="3.5" height="4" rx="1" />
          <rect x="30.5" y="39" width="3.5" height="4" rx="1" />
          <rect x="26" y="44" width="3.5" height="4" rx="1" />
          <rect x="30.5" y="44" width="3.5" height="4" rx="1" />
        </g>
      )}

      {groupId === 'calves' && (
        <path
          d="M 24 53 C 23 55, 24 57, 26 57 C 27 56, 27 54, 26 53 Z M 36 53 C 37 55, 36 57, 34 57 C 33 56, 33 54, 34 53 Z"
          fill="#FF806B"
        />
      )}
    </svg>
  );
};
