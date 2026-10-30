import React, { useState, useMemo } from 'react';
import { MuscleId, Exercise, Routine, WorkoutSession, WorkoutSet } from '../../types';
import { MUSCLE_DEFINITIONS } from '../../data/muscles';
import {
  getStandardRecommendations,
  getPersonalizedRecommendations,
} from '../../engines/exerciseRecommendationEngine';
import { useNavigationStore } from '../../stores/useNavigationStore';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import {
  Search,
  Filter,
  Sparkles,
  Award,
  Plus,
  BookmarkCheck,
  ChevronRight,
  Dumbbell,
  CheckCircle,
} from 'lucide-react';

interface MuscleExerciseListProps {
  selectedMuscle: MuscleId | null;
  exercises: Exercise[];
  routines: Routine[];
  sessions: WorkoutSession[];
  sets: WorkoutSet[];
}

export const MuscleExerciseList: React.FC<MuscleExerciseListProps> = ({
  selectedMuscle,
  exercises,
  routines,
  sessions,
  sets,
}) => {
  const [recommendationMode, setRecommendationMode] = useState<'standard' | 'personalized'>(
    'standard'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { openExerciseDetail, setActiveTab } = useNavigationStore();
  const { activeSession, addExerciseToSession, startFreeWorkout } = useWorkoutStore();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedDef = selectedMuscle ? MUSCLE_DEFINITIONS[selectedMuscle] : null;

  // Compute recommendations
  const recommendationResults = useMemo(() => {
    const filter = {
      searchQuery,
      equipment: equipmentFilter as any,
      exerciseType: typeFilter as any,
    };

    if (recommendationMode === 'standard') {
      return getStandardRecommendations(exercises, selectedMuscle || undefined, filter);
    } else {
      return getPersonalizedRecommendations(
        exercises,
        routines,
        sessions,
        sets,
        selectedMuscle || undefined,
        filter
      );
    }
  }, [
    exercises,
    routines,
    sessions,
    sets,
    selectedMuscle,
    recommendationMode,
    searchQuery,
    equipmentFilter,
    typeFilter,
  ]);

  const handleQuickAdd = async (e: React.MouseEvent, exercise: Exercise) => {
    e.stopPropagation();
    if (activeSession) {
      await addExerciseToSession(exercise.id);
      setToastMessage(`'${exercise.nameKo}'이(가) 운동에 추가되었습니다!`);
      setTimeout(() => setToastMessage(null), 1500);
    } else {
      await startFreeWorkout(exercise.id);
      setActiveTab('workout');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1D211E] rounded-3xl border border-[#363D36] p-4 shadow-xl">
      {/* Toast */}
      {toastMessage && (
        <div className="p-2.5 mb-3 bg-[#B4F34C] text-[#101510] text-xs font-bold rounded-xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#363D36] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-[#F5F6F5]">
              {selectedDef ? selectedDef.nameKo : '전체 운동 탐색'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#B4F34C]/15 text-[#B4F34C] font-bold">
              {recommendationResults.length}개 종목
            </span>
          </div>
          {selectedDef && (
            <p className="text-xs text-[#A9B2AC] mt-0.5">{selectedDef.description}</p>
          )}
        </div>

        {/* Toggle Mode: Standard vs Personalized */}
        <div className="flex items-center bg-[#292E29] p-1 rounded-xl border border-[#363D36] shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setRecommendationMode('standard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              recommendationMode === 'standard'
                ? 'bg-[#B4F34C] text-[#101510] font-bold shadow-sm'
                : 'text-[#A9B2AC] hover:text-[#F5F6F5]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>대표 운동</span>
          </button>
          <button
            type="button"
            onClick={() => setRecommendationMode('personalized')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              recommendationMode === 'personalized'
                ? 'bg-[#B4F34C] text-[#101510] font-bold shadow-sm'
                : 'text-[#A9B2AC] hover:text-[#F5F6F5]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>나에게 추천</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="pt-3 pb-2 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A9B2AC]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="운동명 또는 별칭 검색 (예: 벤치, 스쿼트)..."
            className="w-full h-10 pl-9 pr-4 bg-[#292E29] border border-[#363D36] rounded-xl text-xs text-[#F5F6F5] placeholder-[#A9B2AC] focus:outline-none focus:border-[#B4F34C]"
          />
        </div>

        {/* Quick Equipment Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: '모든 기구' },
            { id: 'barbell', label: '바벨' },
            { id: 'dumbbell', label: '덤벨' },
            { id: 'machine', label: '머신' },
            { id: 'cable', label: '케이블' },
            { id: 'bodyweight', label: '맨몸' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setEquipmentFilter(item.id)}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-all font-medium ${
                equipmentFilter === item.id
                  ? 'bg-[#B4F34C] text-[#101510] font-bold'
                  : 'bg-[#252B27] text-[#A9B2AC] hover:text-[#F5F6F5] border border-[#363D36]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Card List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-[300px] max-h-[520px]">
        {recommendationResults.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Dumbbell className="w-10 h-10 text-[#363D36] mb-2" />
            <p className="text-sm font-bold text-[#F5F6F5]">검색된 운동이 없습니다.</p>
            <p className="text-xs text-[#A9B2AC] mt-1">다른 검색어나 필터를 선택해보세요.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setEquipmentFilter('all');
                setTypeFilter('all');
              }}
              className="mt-3 px-3 py-1.5 text-xs text-[#B4F34C] bg-[#292E29] rounded-xl font-semibold"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          recommendationResults.map(({ exercise, reason, isInUserRoutine }) => {
            const isPrimary = selectedMuscle
              ? exercise.primaryMuscles.includes(selectedMuscle)
              : true;

            return (
              <div
                key={exercise.id}
                onClick={() => openExerciseDetail(exercise.id)}
                className="group p-3.5 bg-[#252B27] hover:bg-[#2C332F] border border-[#363D36] hover:border-[#B4F34C]/40 rounded-2xl cursor-pointer transition-all flex flex-col gap-2 relative shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#292E29] text-[#A9B2AC] border border-[#363D36]">
                        {exercise.equipment}
                      </span>
                      {isInUserRoutine && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#B4F34C]/15 text-[#B4F34C] border border-[#B4F34C]/30 flex items-center gap-1">
                          <BookmarkCheck className="w-3 h-3" /> 내 루틴
                        </span>
                      )}
                      {isPrimary ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FF806B]/15 text-[#FF806B] border border-[#FF806B]/30">
                          주동근
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#E9AB87]/15 text-[#E9AB87] border border-[#E9AB87]/30">
                          보조근
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-[#F5F6F5] mt-1 group-hover:text-[#B4F34C] transition-colors">
                      {exercise.nameKo}
                    </h3>
                    <p className="text-xs text-[#A9B2AC] line-clamp-1">{exercise.nameEn}</p>
                  </div>

                  {/* Quick Add Button */}
                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(e, exercise)}
                    className="p-2.5 rounded-xl bg-[#292E29] hover:bg-[#B4F34C] text-[#A9B2AC] hover:text-[#101510] border border-[#363D36] hover:border-[#B4F34C] transition-all shrink-0"
                    title={activeSession ? '현재 운동에 추가' : '운동 시작'}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Recommendation Reason Banner */}
                <div className="pt-2 border-t border-[#363D36]/60 flex items-center justify-between text-[11px] text-[#A9B2AC]">
                  <span className="line-clamp-1 text-[#F5F6F5]/80 font-medium">
                    💡 {reason}
                  </span>
                  <span className="text-[#B4F34C] font-semibold shrink-0 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    상세보기 <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
