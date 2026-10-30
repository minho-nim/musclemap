import React, { useState, useEffect } from 'react';
import { db } from '../../db';
import { Exercise, WorkoutSet } from '../../types';
import { MUSCLE_DEFINITIONS } from '../../data/muscles';
import { getExerciseGuide } from '../../data/exerciseGuides';
import { MuscleMap } from '../anatomy/MuscleMap';
import { useNavigationStore } from '../../stores/useNavigationStore';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import {
  ArrowLeft,
  Plus,
  BookmarkPlus,
  AlertTriangle,
  Wind,
  CheckCircle,
  HelpCircle,
  Dumbbell,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ExerciseDetailPageProps {
  exerciseId: string;
  onBack: () => void;
}

export const ExerciseDetailPage: React.FC<ExerciseDetailPageProps> = ({ exerciseId, onBack }) => {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [recentSets, setRecentSets] = useState<WorkoutSet[]>([]);
  const [alternativeExercises, setAlternativeExercises] = useState<Exercise[]>([]);

  const { activeSession, addExerciseToSession, startFreeWorkout } = useWorkoutStore();
  const { setActiveTab, openAddToRoutineModal, openExerciseDetail } = useNavigationStore();

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const ex = await db.exercises.get(exerciseId);
      if (!ex) return;

      if (isMounted) setExercise(ex);

      // Load recent sets for this exercise
      const sets = await db.sets
        .where('exerciseId')
        .equals(exerciseId)
        .reverse()
        .limit(10)
        .toArray();

      if (isMounted) {
        setRecentSets(sets.filter((s) => s.isCompleted));
      }

      // Load alternatives
      const guide = ex.guide || getExerciseGuide(ex.id, ex.nameKo, MUSCLE_DEFINITIONS[ex.primaryMuscles[0]]?.nameKo || '');
      if (guide.alternativeExerciseIds.length > 0) {
        const alts = await Promise.all(
          guide.alternativeExerciseIds.map((id) => db.exercises.get(id))
        );
        if (isMounted) {
          setAlternativeExercises(alts.filter(Boolean) as Exercise[]);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [exerciseId]);

  if (!exercise) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B4F34C]"></div>
      </div>
    );
  }

  const primaryMuscleName = MUSCLE_DEFINITIONS[exercise.primaryMuscles[0]]?.nameKo || '주동근';
  const guide = exercise.guide || getExerciseGuide(exercise.id, exercise.nameKo, primaryMuscleName);

  const handleAddToTodayWorkout = async () => {
    if (activeSession) {
      await addExerciseToSession(exercise.id);
      setNotification(`'${exercise.nameKo}'이(가) 진행 중인 운동에 추가되었습니다!`);
      setTimeout(() => {
        setNotification(null);
        setActiveTab('workout');
      }, 900);
    } else {
      // Prompt / Start free workout
      await startFreeWorkout(exercise.id);
      setActiveTab('workout');
    }
  };

  const handleAddToRoutine = () => {
    openAddToRoutineModal(exercise.id);
  };

  const difficultyLabels: Record<string, { label: string; color: string }> = {
    beginner: { label: '초급 (Beginner)', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' },
    intermediate: { label: '중급 (Intermediate)', color: 'text-[#B4F34C] bg-[#B4F34C]/10 border-[#B4F34C]/30' },
    advanced: { label: '고급 (Advanced)', color: 'text-[#FF806B] bg-[#FF806B]/10 border-[#FF806B]/30' },
  };

  const diffBadge = difficultyLabels[guide.difficulty || 'intermediate'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 pb-24 md:pb-12 animate-fade-in">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-[#101213]/90 backdrop-blur-md z-20 py-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[#A9B2AC] hover:text-[#F5F6F5] bg-[#1D211E] hover:bg-[#252B27] border border-[#363D36] rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-[#B4F34C]" />
          <span>뒤로 가기</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToRoutine}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#F5F6F5] bg-[#1D211E] hover:bg-[#252B27] border border-[#363D36] rounded-xl transition-all"
          >
            <BookmarkPlus className="w-4 h-4 text-[#B4F34C]" />
            <span className="hidden sm:inline">루틴에 추가</span>
          </button>
        </div>
      </div>

      {/* Temporary Toast Notification */}
      {notification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-[#B4F34C] text-[#101510] font-bold rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Grid: Left Anatomy, Right Details on PC */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Target Muscle Map Preview */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="w-full bg-[#1D211E] border border-[#363D36] rounded-3xl p-4 flex flex-col items-center shadow-lg">
            <div className="flex items-center justify-between w-full mb-3 px-1">
              <span className="text-xs font-bold text-[#A9B2AC] uppercase tracking-wider flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-[#B4F34C]" />
                목표 근육 안내도
              </span>
              <span className="text-[11px] text-[#A9B2AC]">전면 / 후면</span>
            </div>

            {/* Muscle Map in Guide Mode */}
            <MuscleMap
              selectedMuscle={null}
              mode="guide"
              primaryMuscles={exercise.primaryMuscles}
              secondaryMuscles={exercise.secondaryMuscles}
              isCompact={false}
              showSelectorList={false}
            />

            {/* Target Muscles Legend Badges */}
            <div className="w-full mt-4 pt-3 border-t border-[#363D36] space-y-2">
              <div>
                <span className="text-[11px] font-semibold text-[#FF806B] block mb-1">
                  주동근 (Primary)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {exercise.primaryMuscles.map((m) => (
                    <span
                      key={m}
                      className="text-xs px-2.5 py-1 bg-[#FF806B]/15 text-[#FF806B] border border-[#FF806B]/30 rounded-lg font-bold"
                    >
                      {MUSCLE_DEFINITIONS[m]?.nameKo || m}
                    </span>
                  ))}
                </div>
              </div>

              {exercise.secondaryMuscles.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-[#E9AB87] block mb-1">
                    보조근 (Secondary)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {exercise.secondaryMuscles.map((m) => (
                      <span
                        key={m}
                        className="text-xs px-2.5 py-1 bg-[#E9AB87]/15 text-[#E9AB87] border border-[#E9AB87]/30 rounded-lg font-medium"
                      >
                        {MUSCLE_DEFINITIONS[m]?.nameKo || m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Exercise Information and Instructions */}
        <div className="md:col-span-7 flex flex-col gap-5">
          {/* Header Card */}
          <div className="bg-[#1D211E] border border-[#363D36] rounded-3xl p-5 shadow-lg">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#292E29] text-[#A9B2AC] border border-[#363D36] font-medium">
                {exercise.equipment}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#292E29] text-[#A9B2AC] border border-[#363D36] font-medium">
                {exercise.exerciseType === 'compound'
                  ? '복합 다관절'
                  : exercise.exerciseType === 'isolation'
                  ? '단일 관절(고립)'
                  : '유산소'}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${diffBadge.color}`}>
                {diffBadge.label}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-[#F5F6F5] tracking-tight">
              {exercise.nameKo}
            </h1>
            <p className="text-sm font-medium text-[#A9B2AC] mt-0.5">{exercise.nameEn}</p>

            <p className="text-sm text-[#F5F6F5]/90 mt-3 leading-relaxed bg-[#252B27] p-3.5 rounded-2xl border border-[#363D36]/80">
              {guide.summary}
            </p>

            {/* Quick Action Button: Add to Today's Workout */}
            <div className="mt-4 pt-4 border-t border-[#363D36] flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleAddToTodayWorkout}
                className="flex-1 min-h-[50px] flex items-center justify-center gap-2 bg-[#B4F34C] hover:bg-[#A0DE3C] text-[#101510] font-extrabold rounded-2xl transition-all shadow-lg shadow-[#B4F34C]/20"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                {activeSession ? '현재 운동 세션에 추가' : '오늘 운동 시작하기'}
              </button>

              <button
                type="button"
                onClick={handleAddToRoutine}
                className="min-h-[50px] px-5 flex items-center justify-center gap-2 bg-[#292E29] hover:bg-[#363D36] text-[#F5F6F5] font-bold rounded-2xl border border-[#363D36] transition-all"
              >
                <BookmarkPlus className="w-5 h-5 text-[#B4F34C]" />
                루틴에 추가
              </button>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="bg-[#1D211E] border border-[#363D36] rounded-3xl p-5 shadow-lg">
            <h3 className="text-base font-bold text-[#F5F6F5] mb-3.5 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#B4F34C]" />
              운동 수행 순서
            </h3>

            <ol className="space-y-3">
              {guide.instructions.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-[#F5F6F5]">
                  <span className="w-6 h-6 rounded-full bg-[#B4F34C]/15 text-[#B4F34C] border border-[#B4F34C]/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Breathing Tips & Common Mistakes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Breathing */}
            <div className="bg-[#1D211E] border border-[#363D36] rounded-3xl p-4 shadow-lg">
              <h4 className="text-sm font-bold text-[#F5F6F5] mb-2 flex items-center gap-2">
                <Wind className="w-4 h-4 text-[#B4F34C]" />
                호흡 가이드
              </h4>
              <p className="text-xs text-[#A9B2AC] leading-relaxed">{guide.breathingTips}</p>
            </div>

            {/* Mistakes */}
            <div className="bg-[#1D211E] border border-[#363D36] rounded-3xl p-4 shadow-lg">
              <h4 className="text-sm font-bold text-[#FF806B] mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#FF806B]" />
                흔히 하는 실수
              </h4>
              <ul className="space-y-1.5">
                {guide.commonMistakes.map((m, idx) => (
                  <li key={idx} className="text-xs text-[#A9B2AC] leading-relaxed flex items-start gap-1.5">
                    <span className="text-[#FF806B]">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Safety Notes */}
          {guide.safetyNotes.length > 0 && (
            <div className="bg-[#292E29]/60 border border-[#363D36] rounded-2xl p-4">
              <h4 className="text-xs font-bold text-[#A9B2AC] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#B4F34C]" />
                안전 주의사항
              </h4>
              <ul className="space-y-1">
                {guide.safetyNotes.map((note, idx) => (
                  <li key={idx} className="text-xs text-[#A9B2AC] leading-relaxed">
                    - {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recent Workout History for this Exercise */}
          <div className="bg-[#1D211E] border border-[#363D36] rounded-3xl p-5 shadow-lg">
            <h3 className="text-base font-bold text-[#F5F6F5] mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#B4F34C]" />
              내 최근 운동 기록
            </h3>

            {recentSets.length === 0 ? (
              <p className="text-xs text-[#A9B2AC] py-3 text-center">
                아직 이 운동에 대한 완료 기록이 없습니다. 오늘 첫 세트를 기록해보세요!
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {recentSets.slice(0, 8).map((set, idx) => (
                  <div
                    key={set.id}
                    className="bg-[#252B27] p-2.5 rounded-xl border border-[#363D36] text-center"
                  >
                    <span className="text-[10px] text-[#A9B2AC] block">
                      {set.setType === 'warmup' ? '워밍업' : `${idx + 1}세트`}
                    </span>
                    <span className="text-sm font-bold text-[#F5F6F5]">
                      {set.weight ? `${set.weight}kg` : ''} {set.reps ? `× ${set.reps}회` : ''}
                      {set.durationSeconds ? `${set.durationSeconds}초` : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alternative Exercises */}
          {alternativeExercises.length > 0 && (
            <div className="bg-[#1D211E] border border-[#363D36] rounded-3xl p-5 shadow-lg">
              <h3 className="text-base font-bold text-[#F5F6F5] mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#B4F34C]" />
                대체 가능한 운동
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {alternativeExercises.map((alt) => (
                  <div
                    key={alt.id}
                    onClick={() => openExerciseDetail(alt.id)}
                    className="p-3 bg-[#252B27] hover:bg-[#2C332F] border border-[#363D36] rounded-2xl cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#F5F6F5]">{alt.nameKo}</p>
                      <p className="text-xs text-[#A9B2AC]">{alt.equipment}</p>
                    </div>
                    <span className="text-xs text-[#B4F34C] font-semibold">보기 →</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
