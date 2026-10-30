import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../db';
import { MuscleId, Exercise, Routine, WorkoutSession, WorkoutSet } from '../types';
import { MuscleMap } from '../components/anatomy/MuscleMap';
import { MuscleExerciseList } from '../components/anatomy/MuscleExerciseList';
import { useNavigationStore } from '../stores/useNavigationStore';
import { calculateMuscleStimulation, getMuscleVisualProperties } from '../engines/muscleEngine';
import { MUSCLE_DEFINITIONS } from '../data/muscles';
import { Activity, Flame, Compass, HelpCircle, Layers } from 'lucide-react';

interface MusclePageProps {
  exercises: Exercise[];
}

export const MusclePage: React.FC<MusclePageProps> = ({ exercises }) => {
  const { selectedMuscle, setSelectedMuscle } = useNavigationStore();

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [sets, setSets] = useState<WorkoutSet[]>([]);

  // Page view mode: explore (운동 탐색) vs analysis (근육 자극 히트맵)
  const [pageMode, setPageMode] = useState<'explore' | 'analysis'>('explore');
  const [analysisType, setAnalysisType] = useState<'direct_sets' | 'frequency' | 'goal_achievement'>(
    'direct_sets'
  );

  useEffect(() => {
    async function load() {
      const [allRoutines, allSessions, allSets] = await Promise.all([
        db.routines.toArray(),
        db.sessions.toArray(),
        db.sets.toArray(),
      ]);
      setRoutines(allRoutines);
      setSessions(allSessions);
      setSets(allSets);
    }
    load();
  }, []);

  // Compute muscle stimulation map
  const exercisesMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  const muscleStimulation = useMemo(
    () => calculateMuscleStimulation(sessions, sets, exercisesMap, 14),
    [sessions, sets, exercisesMap]
  );

  // Compute visual colors for analysis mode
  const muscleColors = useMemo(() => {
    const map: Record<string, { fill: string; stroke: string; opacity: number }> = {};
    if (pageMode === 'analysis') {
      Object.entries(muscleStimulation).forEach(([mId, data]) => {
        const props = getMuscleVisualProperties(
          mId as MuscleId,
          data,
          analysisType,
          selectedMuscle === mId
        );
        map[mId] = {
          fill: props.fillColor,
          stroke: props.strokeColor,
          opacity: props.opacity,
        };
      });
    }
    return map;
  }, [pageMode, analysisType, muscleStimulation, selectedMuscle]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 pb-28 md:pb-12 animate-fade-in space-y-4">
      {/* Top Header & Mode Switcher */}
      <div className="bg-[#1D211E] border border-[#363D36] rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF806B]" />
            <h1 className="text-xl font-extrabold text-[#F5F6F5]">2D 근육 지도 & 운동 탐색</h1>
          </div>
          <p className="text-xs text-[#A9B2AC] mt-1">
            인체 모델의 근육을 터치하면 해당 부위의 대표 운동과 개인화 추천 종목을 탐색할 수 있습니다.
          </p>
        </div>

        {/* Explore vs Heatmap Analysis Toggle */}
        <div className="flex items-center bg-[#292E29] p-1 rounded-2xl border border-[#363D36] self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setPageMode('explore')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
              pageMode === 'explore'
                ? 'bg-[#B4F34C] text-[#101510] shadow-sm'
                : 'text-[#A9B2AC] hover:text-[#F5F6F5]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>운동 탐색 모드</span>
          </button>

          <button
            type="button"
            onClick={() => setPageMode('analysis')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
              pageMode === 'analysis'
                ? 'bg-[#B4F34C] text-[#101510] shadow-sm'
                : 'text-[#A9B2AC] hover:text-[#F5F6F5]'
            }`}
          >
            <Flame className="w-4 h-4 text-[#FF806B]" />
            <span>자극 히트맵</span>
          </button>
        </div>
      </div>

      {/* Analysis Sub-filters if in analysis mode */}
      {pageMode === 'analysis' && (
        <div className="p-3 bg-[#1D211E] border border-[#363D36] rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[#A9B2AC] font-semibold">히트맵 기준 선택:</span>
          <div className="flex items-center gap-1.5">
            {[
              { id: 'direct_sets', label: '직접 운동 세트 수' },
              { id: 'frequency', label: '운동 빈도 (일수)' },
              { id: 'goal_achievement', label: '목표 달성 현황' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setAnalysisType(item.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  analysisType === item.id
                    ? 'bg-[#FF806B] text-[#101510]'
                    : 'bg-[#292E29] text-[#A9B2AC] hover:text-[#F5F6F5] border border-[#363D36]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Left Anatomy, Right Exercises List */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left Column: Anatomical SVG */}
        <div className="md:col-span-5 bg-[#1D211E] border border-[#363D36] rounded-3xl p-4 shadow-xl flex flex-col items-center">
          <div className="flex items-center justify-between w-full px-2 mb-2">
            <span className="text-xs font-bold text-[#A9B2AC] uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#B4F34C]" />
              {pageMode === 'explore' ? '근육 부위 터치' : '최근 14일 자극 분포'}
            </span>
            {selectedMuscle && (
              <button
                type="button"
                onClick={() => setSelectedMuscle(null)}
                className="text-[11px] text-[#B4F34C] hover:underline"
              >
                선택 해제 (전체보기)
              </button>
            )}
          </div>

          <MuscleMap
            selectedMuscle={selectedMuscle}
            onSelectMuscle={(id) => setSelectedMuscle(id)}
            mode={pageMode === 'explore' ? 'explore' : 'analysis'}
            muscleColors={muscleColors}
            isCompact={false}
            showSelectorList={true}
          />
        </div>

        {/* Right Column: Muscle Exercises & Recommendations */}
        <div className="md:col-span-7">
          <MuscleExerciseList
            selectedMuscle={selectedMuscle}
            exercises={exercises}
            routines={routines}
            sessions={sessions}
            sets={sets}
          />
        </div>
      </div>
    </div>
  );
};
