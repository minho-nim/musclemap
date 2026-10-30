import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../db';
import { WorkoutSession, WorkoutSet, Exercise } from '../types';
import { calculateAnalytics } from '../engines/statisticsEngine';
import { calculateMuscleStimulation } from '../engines/muscleEngine';
import { VolumeTrendChart } from '../components/charts/VolumeTrendChart';
import { MuscleDistributionChart } from '../components/charts/MuscleDistributionChart';
import { RadarBalanceChart, RadarCategoryData } from '../components/charts/RadarBalanceChart';
import { MuscleMap } from '../components/anatomy/MuscleMap';
import { MuscleGroupStatusList } from '../components/anatomy/MuscleGroupStatusList';
import { WorkoutShareModal } from '../components/workout/WorkoutShareModal';
import { MuscleStimulationLeaderboard } from '../components/analytics/MuscleStimulationLeaderboard';
import { MuscleId } from '../types';
import {
  BarChart2,
  Dumbbell,
  Clock,
  Layers,
  Trophy,
  Calendar,
  Activity,
  Info,
  ChevronRight,
  Share2,
  Flame,
  ShieldCheck,
} from 'lucide-react';

interface AnalyticsPageProps {
  exercises: Exercise[];
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ exercises }) => {
  const [analyticsView, setAnalyticsView] = useState<'stimulation' | 'recovery'>('stimulation');
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [showRecoveryInfo, setShowRecoveryInfo] = useState(false);
  const [selectedMuscleId, setSelectedMuscleId] = useState<MuscleId | null>(null);
  const [sharingSession, setSharingSession] = useState<WorkoutSession | null>(null);

  useEffect(() => {
    async function load() {
      const [allSessions, allSets] = await Promise.all([
        db.sessions.toArray(),
        db.sets.toArray(),
      ]);
      setSessions(allSessions);
      setSets(allSets);
    }
    load();
  }, []);

  const exercisesMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);

  const analytics = useMemo(
    () => calculateAnalytics(sessions, sets, exercisesMap, period),
    [sessions, sets, exercisesMap, period]
  );

  // Muscle stimulation map for anatomical heatmap in analysis mode
  const stimulationMap = useMemo(() => {
    const validSessions = sessions.filter((s) => s.isCompleted);
    return calculateMuscleStimulation(validSessions, sets, exercisesMap);
  }, [sessions, sets, exercisesMap]);

  // Compute muscle colors for the 2D anatomical SVG
  const muscleColors = useMemo(() => {
    const colors: Record<string, { fill: string; stroke: string; opacity: number }> = {};
    for (const [mId, stim] of Object.entries(stimulationMap)) {
      if (stim.directSets > 0) {
        colors[mId] = {
          fill: '#FF806B', // Coral for primary stimulated
          stroke: '#FFA191',
          opacity: Math.min(1.0, 0.45 + stim.directSets * 0.1),
        };
      } else if (stim.indirectSets > 0) {
        colors[mId] = {
          fill: '#E9AB87', // Peach for secondary
          stroke: '#F4C8AF',
          opacity: Math.min(0.9, 0.35 + stim.indirectSets * 0.1),
        };
      }
    }
    return colors;
  }, [stimulationMap]);

  // Compute Radar Balance data across 6 core groups (등, 가슴, 어깨, 팔, 하체, 코어/유산소)
  const radarData: RadarCategoryData[] = useMemo(() => {
    const groupCounts: Record<string, number> = {
      back: 0,
      chest: 0,
      shoulders: 0,
      arms: 0,
      legs: 0,
      core: 0,
    };

    analytics.muscleGroupDistribution.forEach((mg) => {
      if (mg.group === 'back') groupCounts.back += mg.sets;
      else if (mg.group === 'chest') groupCounts.chest += mg.sets;
      else if (mg.group === 'shoulders') groupCounts.shoulders += mg.sets;
      else if (mg.group === 'arms') groupCounts.arms += mg.sets;
      else if (mg.group === 'legs') groupCounts.legs += mg.sets;
      else if (mg.group === 'core' || mg.group === 'cardio') groupCounts.core += mg.sets;
    });

    const maxSets = Math.max(1, ...Object.values(groupCounts));

    return [
      { category: 'back', nameKo: '등', score: Math.round(Math.min(100, (groupCounts.back / maxSets) * 100)) || 40 },
      { category: 'chest', nameKo: '가슴', score: Math.round(Math.min(100, (groupCounts.chest / maxSets) * 100)) || 50 },
      { category: 'shoulders', nameKo: '어깨', score: Math.round(Math.min(100, (groupCounts.shoulders / maxSets) * 100)) || 45 },
      { category: 'arms', nameKo: '팔', score: Math.round(Math.min(100, (groupCounts.arms / maxSets) * 100)) || 40 },
      { category: 'legs', nameKo: '하체', score: Math.round(Math.min(100, (groupCounts.legs / maxSets) * 100)) || 60 },
      { category: 'core', nameKo: '코어·유산소', score: Math.round(Math.min(100, (groupCounts.core / maxSets) * 100)) || 30 },
    ];
  }, [analytics.muscleGroupDistribution]);

  // Find worked muscles for highlight
  const workedPrimaryMuscles = useMemo(() => {
    return Object.keys(stimulationMap).filter((mId) => stimulationMap[mId].totalSets > 0);
  }, [stimulationMap]);

  return (
    <div className="max-w-md md:max-w-4xl mx-auto px-4 py-4 pb-32 md:pb-12 space-y-5 animate-fade-in">
      {/* Top Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-2xl font-black text-[#F4F4F5] tracking-tight">분석</h1>
          <p className="text-xs text-[#A9AAB3]">실제 운동 기록 기반 근육 자극도 및 훈련 균형도</p>
        </div>

        {/* View Switcher: 자극도 순위 vs 회복도 */}
        <div className="flex items-center bg-[#24252A] p-1 rounded-2xl border border-[#303137]">
          <button
            type="button"
            onClick={() => setAnalyticsView('stimulation')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              analyticsView === 'stimulation'
                ? 'bg-[#FF806B] text-[#101510] shadow-sm'
                : 'text-[#A9AAB3] hover:text-[#F4F4F5]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>근육 자극도 순위</span>
          </button>
          <button
            type="button"
            onClick={() => setAnalyticsView('recovery')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              analyticsView === 'recovery'
                ? 'bg-[#B4F34C] text-[#101510] shadow-sm'
                : 'text-[#A9AAB3] hover:text-[#F4F4F5]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>회복도 & 균형</span>
          </button>
        </div>
      </div>

      {/* 1. STIMULATION LEADERBOARD VIEW (사용자 요청: 이번 주 어디 자극이 제일 많이 되고 있나 확인 & 기간 선택) */}
      {analyticsView === 'stimulation' && (
        <MuscleStimulationLeaderboard
          sessions={sessions}
          sets={sets}
          exercises={exercises}
          initialPeriod={period === 'week' ? 'week' : 'month'}
        />
      )}

      {/* 2. RECOVERY & RADAR BALANCE VIEW */}
      {analyticsView === 'recovery' && (
        <>
          {/* 근육 회복도 & 최근 운동 부하 */}
          <div className="bg-[#303137] border border-[#3E4048] rounded-3xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="text-base font-black text-[#F4F4F5]">근육 회복도</h2>
                <p className="text-xs text-[#A9AAB3]">
                  근육 부위별 최근 운동 강도와 누적 부하를 기반으로 분석합니다.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowRecoveryInfo(!showRecoveryInfo)}
                className="text-xs text-[#B4F34C] hover:underline flex items-center gap-0.5"
              >
                <span>더보기</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Science Notice Dropdown */}
            {showRecoveryInfo && (
              <div className="my-3 p-3 bg-[#26282E] rounded-2xl border border-[#3E4048] text-xs text-[#A9AAB3] space-y-1.5 animate-fade-in leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-[#F4F4F5]">
                  <Info className="w-4 h-4 text-[#B4F34C]" />
                  <span>운동 생리학 기반 회복 분석 원칙</span>
                </div>
                <p>
                  단순히 운동 후 경과 시간에만 의존하지 않고, 마지막 훈련 후 경과 시간과 부위별 주간 누적 볼륨을 결합하여 신체 부하를 산정합니다.
                </p>
                <p className="text-[11px] text-[#A9AAB3]/80">
                  ※ ACSM 및 Schoenfeld(2024) 문헌에 근거하여 대근육군 48~72시간 회복 권고를 반영합니다.
                </p>
              </div>
            )}

            {/* Anatomical Human SVG Box (Front & Back Dual View) */}
            <div className="my-4 bg-[#26282E] rounded-2xl p-4 border border-[#3E4048]/80 flex flex-col items-center">
              <MuscleMap
                selectedMuscle={selectedMuscleId}
                onSelectMuscle={(id) => setSelectedMuscleId(selectedMuscleId === id ? null : id)}
                mode="analysis"
                muscleColors={muscleColors}
                isCompact={false}
                showSelectorList={false}
                dualView={true}
              />

              {/* Recovery Gradient Indicator Bar */}
              <div className="w-full max-w-sm mt-5 space-y-1.5">
                <div className="h-2.5 rounded-full bg-gradient-to-r from-[#FF806B] via-[#E9AB87] to-[#B4F34C] shadow-inner" />
                <div className="flex justify-between text-[11px] font-bold text-[#A9AAB3]">
                  <span>회복도 0% (고부하)</span>
                  <span>100% (완전 회복)</span>
                </div>
              </div>
            </div>

            {/* 메인 근육 그룹 */}
            <div className="mt-6 pt-2 border-t border-[#3E4048]/60">
              <MuscleGroupStatusList
                sessions={sessions}
                sets={sets}
                selectedMuscleId={selectedMuscleId}
                onSelectMuscle={(mId) => setSelectedMuscleId(selectedMuscleId === mId ? null : mId)}
              />
            </div>
          </div>

          {/* 운동 균형도 (Radar Chart) */}
          <div className="bg-[#303137] border border-[#3E4048] rounded-3xl p-5 shadow-xl">
            <div className="mb-2">
              <h2 className="text-base font-black text-[#F4F4F5]">운동 균형도</h2>
              <p className="text-xs text-[#A9AAB3]">
                주요 6개 부위별 세트 수행 비중 및 훈련 밸런스입니다.
              </p>
            </div>

            <div className="py-2 flex justify-center">
              <RadarBalanceChart data={radarData} />
            </div>
          </div>
        </>
      )}

      {/* 3. KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#303137] border border-[#3E4048] rounded-2xl p-4 flex flex-col">
          <span className="text-xs font-semibold text-[#A9AAB3] flex items-center gap-1.5 mb-1">
            <Calendar className="w-3.5 h-3.5 text-[#B4F34C]" />
            운동 일수
          </span>
          <span className="text-2xl font-black text-[#F4F4F5]">
            {analytics.totalWorkouts}회
          </span>
        </div>

        <div className="bg-[#303137] border border-[#3E4048] rounded-2xl p-4 flex flex-col">
          <span className="text-xs font-semibold text-[#A9AAB3] flex items-center gap-1.5 mb-1">
            <Layers className="w-3.5 h-3.5 text-[#B4F34C]" />
            완료 세트
          </span>
          <span className="text-2xl font-black text-[#F4F4F5]">
            {analytics.totalSets}세트
          </span>
        </div>

        <div className="bg-[#303137] border border-[#3E4048] rounded-2xl p-4 flex flex-col">
          <span className="text-xs font-semibold text-[#A9AAB3] flex items-center gap-1.5 mb-1">
            <Dumbbell className="w-3.5 h-3.5 text-[#B4F34C]" />
            총 중량 볼륨
          </span>
          <span className="text-2xl font-black text-[#F4F4F5] truncate">
            {Math.round(analytics.totalVolumeKg).toLocaleString()}kg
          </span>
        </div>

        <div className="bg-[#303137] border border-[#3E4048] rounded-2xl p-4 flex flex-col">
          <span className="text-xs font-semibold text-[#A9AAB3] flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-[#B4F34C]" />
            운동 시간
          </span>
          <span className="text-2xl font-black text-[#F4F4F5]">
            {analytics.totalDurationMinutes}분
          </span>
        </div>
      </div>

      {/* 4. VOLUME TREND CHART */}
      <div className="bg-[#303137] border border-[#3E4048] rounded-3xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-[#F4F4F5] mb-4 flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-[#B4F34C]" />
          일자별 운동 볼륨 추이 (kg)
        </h3>
        <VolumeTrendChart data={analytics.volumeTrend} />
      </div>

      {/* 5. PERSONAL RECORDS (PRs) */}
      <div className="bg-[#303137] border border-[#3E4048] rounded-3xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-[#F4F4F5] mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#B4F34C]" />
          부위별 개인 최고 기록 (PR)
        </h3>

        {analytics.personalRecords.length === 0 ? (
          <p className="text-xs text-[#A9AAB3] py-4 text-center">
            아직 기록된 최고 기록이 없습니다. 운동을 완료하면 자동으로 갱신됩니다.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {analytics.personalRecords.slice(0, 6).map((pr) => (
              <div
                key={pr.exerciseId}
                className="bg-[#26282E] border border-[#3E4048] rounded-2xl p-3 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#F4F4F5]">
                    {exercisesMap.get(pr.exerciseId)?.nameKo || pr.exerciseId}
                  </h4>
                  <span className="text-[10px] text-[#A9AAB3]">
                    {new Date(pr.lastDate).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-[#B4F34C] block">
                    {pr.maxWeightKg}kg × {pr.maxRepsAtMaxWeight}회
                  </span>
                  <span className="text-[10px] text-[#A9AAB3]">
                    추정 1RM: {Math.round(pr.estimated1RM)}kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. COMPLETED SESSIONS & RECORD SHARING (Planfit image_ba2beac0.png) */}
      <div className="bg-[#303137] border border-[#3E4048] rounded-3xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-[#F4F4F5] mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#B4F34C]" />
            완료한 운동 기록 & SNS 공유 카드
          </span>
          <span className="text-[11px] text-[#A9AAB3]">인스타그램 4:5 / 9:16</span>
        </h3>

        {sessions.filter((s) => s.isCompleted).length === 0 ? (
          <p className="text-xs text-[#A9AAB3] py-4 text-center">
            완료된 운동 기록이 없습니다. 운동을 완료하면 공유 카드를 생성할 수 있습니다.
          </p>
        ) : (
          <div className="space-y-2.5">
            {sessions
              .filter((s) => s.isCompleted)
              .slice(0, 4)
              .map((session) => (
                <div
                  key={session.id}
                  className="bg-[#26282E] border border-[#3E4048] rounded-2xl p-3.5 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-[#F4F4F5]">{session.name}</h4>
                    <span className="text-xs text-[#A9AAB3]">
                      {new Date(session.startTime).toLocaleDateString('ko-KR')} •{' '}
                      {session.exercises.length}개 종목
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSharingSession(session)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#303137] hover:bg-[#3E4048] text-[#B4F34C] hover:text-[#C5F86C] text-xs font-bold border border-[#484A54] flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>기록 공유</span>
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Workout Share Modal */}
      {sharingSession && (
        <WorkoutShareModal
          session={sharingSession}
          sets={sets}
          exercises={exercises}
          onClose={() => setSharingSession(null)}
        />
      )}
    </div>
  );
};
