import React, { useState, useMemo } from 'react';
import { WorkoutSession, WorkoutSet, Exercise, MuscleId } from '../../types';
import { calculateMuscleStimulation, StimulationFilterOptions } from '../../engines/muscleEngine';
import { MuscleMap } from '../anatomy/MuscleMap';
import { MUSCLE_DEFINITIONS, ALL_MUSCLE_IDS } from '../../data/muscles';
import {
  Flame,
  Calendar,
  ChevronDown,
  ChevronUp,
  Trophy,
  Activity,
  AlertCircle,
  Dumbbell,
  CheckCircle2,
} from 'lucide-react';

interface MuscleStimulationLeaderboardProps {
  sessions: WorkoutSession[];
  sets: WorkoutSet[];
  exercises: Exercise[];
  initialPeriod?: 'week' | 'month' | 'custom';
}

export const MuscleStimulationLeaderboard: React.FC<MuscleStimulationLeaderboardProps> = ({
  sessions,
  sets,
  exercises,
  initialPeriod = 'week',
}) => {
  const [periodType, setPeriodType] = useState<'week' | 'month' | 'custom'>(initialPeriod);

  // Custom date range defaults: 7 days ago until today
  const todayStr = new Date().toISOString().split('T')[0];
  const weekAgoStr = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(weekAgoStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [expandedMuscleId, setExpandedMuscleId] = useState<MuscleId | null>(null);
  const [selectedMuscleId, setSelectedMuscleId] = useState<MuscleId | null>(null);

  const exercisesMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);

  // Compute filter options based on periodType
  const filterOptions = useMemo<StimulationFilterOptions>(() => {
    if (periodType === 'week') {
      return { dateFilterDays: 7 };
    }
    if (periodType === 'month') {
      return { dateFilterDays: 30 };
    }
    return { startDate, endDate };
  }, [periodType, startDate, endDate]);

  // Calculate stimulation mapping for the period
  const stimulationMap = useMemo(
    () => calculateMuscleStimulation(sessions, sets, exercisesMap, filterOptions),
    [sessions, sets, exercisesMap, filterOptions]
  );

  // Ranked muscle list sorted by totalSets descending
  const rankedMuscles = useMemo(() => {
    return Object.entries(stimulationMap)
      .map(([muscleId, stim]) => {
        const def = MUSCLE_DEFINITIONS[muscleId as MuscleId];
        return {
          id: muscleId as MuscleId,
          nameKo: def?.nameKo || muscleId,
          group: def?.group || 'other',
          directSets: stim.directSets,
          indirectSets: stim.indirectSets,
          totalSets: stim.totalSets,
          volumeKg: stim.volumeKg,
          frequencyDays: stim.frequencyDays,
          exercises: stim.exercises,
        };
      })
      .sort((a, b) => b.totalSets - a.totalSets);
  }, [stimulationMap]);

  // Total sets aggregated across all muscles
  const totalStimulatedSets = useMemo(() => {
    return rankedMuscles.reduce((sum, m) => sum + m.totalSets, 0);
  }, [rankedMuscles]);

  // Top #1 stimulated muscle
  const topMuscle = rankedMuscles[0]?.totalSets > 0 ? rankedMuscles[0] : null;

  // Max sets for bar scaling
  const maxSets = rankedMuscles[0]?.totalSets || 1;

  // Compute heatmap colors for the 2D anatomical SVG
  const muscleColors = useMemo(() => {
    const colors: Record<string, { fill: string; stroke: string; opacity: number }> = {};
    for (const m of rankedMuscles) {
      if (m.totalSets > 0) {
        const ratio = m.totalSets / maxSets;
        if (ratio >= 0.7) {
          // Strongest stimulation -> vivid coral
          colors[m.id] = {
            fill: '#FF806B',
            stroke: '#FFA191',
            opacity: 1.0,
          };
        } else if (ratio >= 0.35) {
          // Moderate stimulation -> warm peach
          colors[m.id] = {
            fill: '#E9AB87',
            stroke: '#F4C8AF',
            opacity: 0.85,
          };
        } else {
          // Mild stimulation -> lime tinted
          colors[m.id] = {
            fill: '#B4F34C',
            stroke: '#C5F86C',
            opacity: 0.65,
          };
        }
      } else {
        // Zero stimulation
        colors[m.id] = {
          fill: '#24252A',
          stroke: '#32333B',
          opacity: 0.4,
        };
      }
    }
    return colors;
  }, [rankedMuscles, maxSets]);

  // Category breakdown (상체 vs 하체 vs 코어)
  const categorySummary = useMemo(() => {
    let upper = 0;
    let lower = 0;
    let core = 0;

    rankedMuscles.forEach((m) => {
      if (m.group === 'legs') lower += m.totalSets;
      else if (m.group === 'core' || m.group === 'cardio') core += m.totalSets;
      else upper += m.totalSets;
    });

    const total = upper + lower + core;
    if (total === 0) return null;

    return {
      upperPct: Math.round((upper / total) * 100),
      lowerPct: Math.round((lower / total) * 100),
      corePct: Math.round((core / total) * 100),
      upperSets: upper,
      lowerSets: lower,
      coreSets: core,
    };
  }, [rankedMuscles]);

  const periodLabel =
    periodType === 'week'
      ? '최근 7일 (이번 주)'
      : periodType === 'month'
      ? '최근 30일 (이번 달)'
      : `${startDate} ~ ${endDate}`;

  return (
    <div className="space-y-4">
      {/* 1. Header with Period Switcher & Custom Date Range */}
      <div className="bg-[#24252A] border border-[#303137] rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF806B] animate-pulse" />
              <h2 className="text-base sm:text-lg font-black text-[#F4F4F5] tracking-tight">
                기간별 근육 자극도 분석
              </h2>
            </div>
            <p className="text-xs text-[#A9AAB3] mt-0.5">
              선택한 기간 동안 가장 많이 자극된 부위와 훈련 편중도를 분석합니다.
            </p>
          </div>

          {/* Period Segmented Control (주간 / 월간 / 기간 직접 선택) */}
          <div className="flex items-center bg-[#1B1C20] p-1 rounded-2xl border border-[#303137] self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setPeriodType('week')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                periodType === 'week'
                  ? 'bg-[#B4F34C] text-[#101510] shadow-sm'
                  : 'text-[#A9AAB3] hover:text-[#F4F4F5]'
              }`}
            >
              주간 (7일)
            </button>
            <button
              type="button"
              onClick={() => setPeriodType('month')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                periodType === 'month'
                  ? 'bg-[#B4F34C] text-[#101510] shadow-sm'
                  : 'text-[#A9AAB3] hover:text-[#F4F4F5]'
              }`}
            >
              월간 (30일)
            </button>
            <button
              type="button"
              onClick={() => setPeriodType('custom')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1 ${
                periodType === 'custom'
                  ? 'bg-[#B4F34C] text-[#101510] shadow-sm'
                  : 'text-[#A9AAB3] hover:text-[#F4F4F5]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>직접 선택</span>
            </button>
          </div>
        </div>

        {/* Custom Date Range Selector Inputs (when periodType === 'custom') */}
        {periodType === 'custom' && (
          <div className="mt-3 p-3 bg-[#1B1C20] rounded-2xl border border-[#303137] flex flex-wrap items-center gap-3 text-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-[#A9AAB3] font-semibold">시작일:</span>
              <input
                type="date"
                value={startDate}
                max={endDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-[#2B2D35] text-[#F4F4F5] border border-[#3E4048] px-2.5 py-1.5 rounded-xl font-mono text-xs focus:outline-none focus:border-[#B4F34C]"
              />
            </div>
            <span className="text-[#A9AAB3]">~</span>
            <div className="flex items-center gap-2">
              <span className="text-[#A9AAB3] font-semibold">종료일:</span>
              <input
                type="date"
                value={endDate}
                min={startDate}
                max={todayStr}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[#2B2D35] text-[#F4F4F5] border border-[#3E4048] px-2.5 py-1.5 rounded-xl font-mono text-xs focus:outline-none focus:border-[#B4F34C]"
              />
            </div>
            <span className="text-[11px] text-[#B4F34C] font-bold ml-auto">
              {startDate}부터 {endDate}까지의 기록
            </span>
          </div>
        )}

        {/* 2. TOP #1 STIMULATED MUSCLE HIGHLIGHT BANNER */}
        {topMuscle ? (
          <div className="mt-3 p-4 bg-gradient-to-r from-[#FF806B]/20 via-[#2E2829] to-[#24252A] border border-[#FF806B]/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FF806B] flex items-center justify-center text-[#101510] shadow-md shrink-0">
                <Trophy className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold text-[#FF806B] uppercase tracking-wider block">
                  {periodLabel} 가장 많이 자극된 부위 1위
                </span>
                <h3 className="text-xl font-black text-[#F4F4F5]">
                  {topMuscle.nameKo} ({topMuscle.totalSets}세트)
                </h3>
                <span className="text-xs text-[#A9AAB3] mt-0.5 block">
                  전체 자극 볼륨의{' '}
                  <strong className="text-[#FF806B] font-bold">
                    {totalStimulatedSets > 0
                      ? Math.round((topMuscle.totalSets / totalStimulatedSets) * 100)
                      : 0}
                    %
                  </strong>
                  를 차지하며 가장 집중적인 자극을 받았습니다.
                </span>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-[#3E4048] sm:pl-4 shrink-0">
              <span className="text-xs text-[#A9AAB3] block">누적 훈련 볼륨</span>
              <span className="text-lg font-black text-[#B4F34C] font-mono">
                {Math.round(topMuscle.volumeKg).toLocaleString()}kg
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-3 p-4 bg-[#1B1C20] rounded-2xl border border-[#303137] text-center text-xs text-[#A9AAB3]">
            해당 기간에 완료된 운동 기록이 없습니다. 운동을 시작하여 자극도를 확인해보세요!
          </div>
        )}
      </div>

      {/* 3. DUAL VIEW ANATOMICAL HEATMAP (Front & Back) */}
      <div className="bg-[#24252A] border border-[#303137] rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#FF806B]" />
            <h3 className="text-sm font-black text-[#F4F4F5]">전신 근육 자극도 히트맵 (Dual View)</h3>
          </div>
          <span className="text-[11px] text-[#A9AAB3]">전면(Front) & 후면(Back) 동시 표시</span>
        </div>

        <div className="bg-[#1B1C20] rounded-2xl p-4 border border-[#303137] flex flex-col items-center">
          <MuscleMap
            selectedMuscle={selectedMuscleId}
            onSelectMuscle={(id) => setSelectedMuscleId(selectedMuscleId === id ? null : id)}
            mode="analysis"
            muscleColors={muscleColors}
            isCompact={false}
            showSelectorList={false}
            dualView={true}
          />

          {/* Color Legend */}
          <div className="w-full max-w-md mt-4 pt-3 border-t border-[#303137] flex items-center justify-between text-[11px] font-semibold text-[#A9AAB3]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#24252A] border border-[#32333B]" />
              <span>미자극 (0세트)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#B4F34C]" />
              <span>적정 자극</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#E9AB87]" />
              <span>중간 자극</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FF806B]" />
              <span className="font-bold text-[#FF806B]">최대 자극 (집중)</span>
            </div>
          </div>
        </div>

        {/* Category Balance Summary */}
        {categorySummary && (
          <div className="mt-4 p-3.5 bg-[#1B1C20] rounded-2xl border border-[#303137] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#F4F4F5]">
              <Activity className="w-4 h-4 text-[#B4F34C]" />
              <span>상체 / 하체 / 코어 비율:</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-[#FF806B] font-bold">
                상체 {categorySummary.upperPct}% ({categorySummary.upperSets}세트)
              </span>
              <span className="text-[#B4F34C] font-bold">
                하체 {categorySummary.lowerPct}% ({categorySummary.lowerSets}세트)
              </span>
              <span className="text-[#A9AAB3]">
                코어 {categorySummary.corePct}% ({categorySummary.coreSets}세트)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 4. RANKED MUSCLE STIMULATION LEADERBOARD */}
      <div className="bg-[#24252A] border border-[#303137] rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-[#F4F4F5] flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#B4F34C]" />
            부위별 자극도 순위 & 수행 운동 내역
          </h3>
          <span className="text-[11px] text-[#A9AAB3]">터치하여 기여한 운동 확인</span>
        </div>

        <div className="divide-y divide-[#303137]/70 bg-[#1B1C20] rounded-2xl border border-[#303137] overflow-hidden">
          {rankedMuscles.map((muscle, idx) => {
            const isTop3 = idx < 3 && muscle.totalSets > 0;
            const isZero = muscle.totalSets === 0;
            const pct =
              totalStimulatedSets > 0
                ? Math.round((muscle.totalSets / totalStimulatedSets) * 100)
                : 0;
            const isExpanded = expandedMuscleId === muscle.id;

            return (
              <div key={muscle.id} className="transition-colors hover:bg-[#202227]">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedMuscleId(isExpanded ? null : muscle.id)
                  }
                  className="w-full p-3.5 flex items-center justify-between text-left transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Rank Badge */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        idx === 0 && !isZero
                          ? 'bg-[#FF806B] text-[#101510]'
                          : idx === 1 && !isZero
                          ? 'bg-[#E9AB87] text-[#101510]'
                          : idx === 2 && !isZero
                          ? 'bg-[#B4F34C] text-[#101510]'
                          : 'bg-[#2B2D35] text-[#A9AAB3]'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    {/* Muscle Name & Progress Bar */}
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-sm font-black truncate ${
                            isTop3 ? 'text-[#F4F4F5]' : isZero ? 'text-[#A9AAB3]' : 'text-[#F4F4F5]'
                          }`}
                        >
                          {muscle.nameKo}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#A9AAB3]">
                          {muscle.totalSets}세트 ({pct}%)
                        </span>
                      </div>

                      {/* Visual Bar */}
                      <div className="w-full bg-[#2B2D35] h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            idx === 0 && !isZero
                              ? 'bg-[#FF806B]'
                              : idx === 1 && !isZero
                              ? 'bg-[#E9AB87]'
                              : idx === 2 && !isZero
                              ? 'bg-[#B4F34C]'
                              : 'bg-[#B4F34C]/60'
                          }`}
                          style={{
                            width: `${maxSets > 0 ? (muscle.totalSets / maxSets) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Expand Arrow */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-[#A9AAB3] hidden sm:block">
                      {Math.round(muscle.volumeKg).toLocaleString()}kg
                    </span>
                    {muscle.exercises.length > 0 && (
                      <div className="p-1 rounded-lg text-[#A9AAB3]">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </div>
                </button>

                {/* Expanded Details: Contributed Exercises List */}
                {isExpanded && muscle.exercises.length > 0 && (
                  <div className="px-4 pb-3.5 pt-1 bg-[#16171B] border-t border-[#2B2D35] text-xs space-y-1.5 animate-fade-in">
                    <span className="text-[11px] font-bold text-[#A9AAB3] block mb-1">
                      기여한 운동 종목 ({muscle.exercises.length}개):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {muscle.exercises.map((ex) => (
                        <div
                          key={ex.exerciseId}
                          className="p-2 rounded-xl bg-[#24252A] border border-[#303137] flex items-center justify-between"
                        >
                          <span className="font-bold text-[#F4F4F5] truncate">{ex.nameKo}</span>
                          <span className="font-mono text-[#B4F34C] font-bold shrink-0">
                            {ex.sets}세트 기여
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
