import React from 'react';
import { Routine, Exercise } from '../../types';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { useNavigationStore } from '../../stores/useNavigationStore';
import { Play, Edit2, Copy, Trash2, Plus, Calendar, Dumbbell } from 'lucide-react';
import { db } from '../../db';

interface RoutineListProps {
  routines: Routine[];
  exercises: Exercise[];
  onRefresh: () => void;
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const SPLIT_LABELS: Record<string, string> = {
  full_body: '무분할 (전신)',
  two_split: '2분할',
  three_split: '3분할',
  four_split: '4분할',
  five_split: '5분할',
  custom: '사용자 정의',
};

export const RoutineList: React.FC<RoutineListProps> = ({ routines, exercises, onRefresh }) => {
  const { startRoutineWorkout } = useWorkoutStore();
  const { setActiveTab, openRoutineEditor } = useNavigationStore();

  const handleStartWorkout = async (routine: Routine) => {
    await startRoutineWorkout(routine, exercises);
    setActiveTab('workout');
  };

  const handleDuplicate = async (routine: Routine) => {
    const duplicated: Routine = {
      ...routine,
      id: `routine_${Date.now()}`,
      name: `${routine.name} (복사본)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      orderIndex: routines.length,
    };
    await db.routines.add(duplicated);
    onRefresh();
  };

  const handleDelete = async (routineId: string) => {
    if (confirm('이 루틴을 삭제하시겠습니까? (과거 완료된 운동 기록은 안전하게 보존됩니다.)')) {
      await db.routines.delete(routineId);
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      {/* Create Routine Button Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-[#F5F6F5]">내 운동 루틴</h3>
          <p className="text-xs text-[#A9B2AC]">요일별 목표와 계획된 운동을 관리합니다.</p>
        </div>

        <button
          type="button"
          onClick={() => openRoutineEditor()}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#B4F34C] hover:bg-[#A0DE3C] text-[#101510] font-bold text-xs rounded-xl shadow-md transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>루틴 추가</span>
        </button>
      </div>

      {/* Routine Cards */}
      {routines.length === 0 ? (
        <div className="bg-[#1D211E] border border-[#363D36] rounded-3xl p-8 text-center flex flex-col items-center">
          <Dumbbell className="w-12 h-12 text-[#363D36] mb-3" />
          <h4 className="text-base font-bold text-[#F5F6F5]">등록된 루틴이 없습니다</h4>
          <p className="text-xs text-[#A9B2AC] mt-1 max-w-xs">
            3분할, 2분할 또는 나만의 맞춤 루틴을 생성하여 계획적으로 운동을 시작해보세요.
          </p>
          <button
            type="button"
            onClick={() => openRoutineEditor()}
            className="mt-4 px-4 py-2.5 bg-[#B4F34C] text-[#101510] font-bold text-xs rounded-xl"
          >
            첫 루틴 만들기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routines.map((routine) => {
            const totalSets = routine.exercises.reduce((sum, e) => sum + e.targetSets, 0);

            return (
              <div
                key={routine.id}
                className="bg-[#1D211E] border border-[#363D36] hover:border-[#B4F34C]/40 rounded-3xl p-5 shadow-lg flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#292E29] text-[#A9B2AC] font-semibold border border-[#363D36]">
                      {SPLIT_LABELS[routine.splitType] || routine.splitType}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openRoutineEditor(routine.id)}
                        className="p-1.5 text-[#A9B2AC] hover:text-[#F5F6F5] hover:bg-[#292E29] rounded-lg transition-all"
                        title="루틴 수정"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(routine)}
                        className="p-1.5 text-[#A9B2AC] hover:text-[#F5F6F5] hover:bg-[#292E29] rounded-lg transition-all"
                        title="루틴 복제"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(routine.id)}
                        className="p-1.5 text-[#A9B2AC] hover:text-[#FF806B] hover:bg-[#292E29] rounded-lg transition-all"
                        title="루틴 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-lg font-extrabold text-[#F5F6F5] mb-2">{routine.name}</h4>

                  {/* Scheduled Days */}
                  <div className="flex items-center gap-1 mb-3">
                    <Calendar className="w-3.5 h-3.5 text-[#A9B2AC] mr-1" />
                    {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                      const isScheduled = routine.scheduledDays.includes(d as any);
                      return (
                        <span
                          key={d}
                          className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center ${
                            isScheduled
                              ? 'bg-[#B4F34C] text-[#101510]'
                              : 'bg-[#252B27] text-[#A9B2AC] opacity-50'
                          }`}
                        >
                          {DAY_LABELS[d]}
                        </span>
                      );
                    })}
                  </div>

                  {/* Exercises Summary List */}
                  <div className="space-y-1.5 mb-4">
                    {routine.exercises.slice(0, 4).map((re, idx) => {
                      const ex = exercises.find((e) => e.id === re.exerciseId);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-1 px-2.5 rounded-xl bg-[#252B27] text-[#A9B2AC]"
                        >
                          <span className="font-semibold text-[#F5F6F5] truncate max-w-[180px]">
                            {ex?.nameKo || re.exerciseId}
                          </span>
                          <span className="font-mono text-[11px]">
                            {re.targetSets}세트 × {re.targetReps}회
                          </span>
                        </div>
                      );
                    })}
                    {routine.exercises.length > 4 && (
                      <span className="text-[11px] text-[#A9B2AC] block text-center">
                        +외 {routine.exercises.length - 4}개 종목
                      </span>
                    )}
                  </div>
                </div>

                {/* Start Workout Button */}
                <button
                  type="button"
                  onClick={() => handleStartWorkout(routine)}
                  className="w-full min-h-[48px] bg-[#B4F34C] hover:bg-[#A0DE3C] text-[#101510] font-extrabold text-sm rounded-2xl transition-all shadow-md shadow-[#B4F34C]/20 flex items-center justify-center gap-2 mt-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>이 루틴으로 운동 시작 ({totalSets}세트)</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
