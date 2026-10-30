import React, { useState, useEffect } from 'react';
import { db } from '../../db';
import { Routine, Exercise } from '../../types';
import { useNavigationStore } from '../../stores/useNavigationStore';
import { X, Check, BookmarkPlus, Plus, ChevronRight } from 'lucide-react';

interface AddToRoutineModalProps {
  exerciseId: string;
  onClose: () => void;
}

export const AddToRoutineModal: React.FC<AddToRoutineModalProps> = ({ exerciseId, onClose }) => {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);

  // Form values
  const [targetSets, setTargetSets] = useState(3);
  const [targetReps, setTargetReps] = useState('10');
  const [targetWeight, setTargetWeight] = useState(40);
  const [restSeconds, setRestSeconds] = useState(90);

  const [isSuccess, setIsSuccess] = useState(false);
  const { openRoutineEditor } = useNavigationStore();

  useEffect(() => {
    async function load() {
      const [ex, allRoutines] = await Promise.all([
        db.exercises.get(exerciseId),
        db.routines.toArray(),
      ]);
      if (ex) {
        setExercise(ex);
        setRestSeconds(ex.defaultRestSeconds || 90);
      }
      setRoutines(allRoutines);
      if (allRoutines.length > 0) {
        setSelectedRoutine(allRoutines[0]);
      }
    }
    load();
  }, [exerciseId]);

  if (!exercise) return null;

  const handleSaveToRoutine = async () => {
    if (!selectedRoutine) return;

    // Check if exercise already in this routine
    const exists = selectedRoutine.exercises.some((e) => e.exerciseId === exercise.id);
    let updatedExercises = [...selectedRoutine.exercises];

    if (exists) {
      // Update target values
      updatedExercises = updatedExercises.map((e) =>
        e.exerciseId === exercise.id
          ? {
              ...e,
              targetSets,
              targetReps,
              targetWeight,
              defaultRestSeconds: restSeconds,
            }
          : e
      );
    } else {
      updatedExercises.push({
        exerciseId: exercise.id,
        order: updatedExercises.length + 1,
        targetSets,
        targetReps,
        targetWeight,
        defaultRestSeconds: restSeconds,
      });
    }

    await db.routines.update(selectedRoutine.id, {
      exercises: updatedExercises,
      updatedAt: new Date().toISOString(),
    });

    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleCreateNewRoutine = () => {
    onClose();
    openRoutineEditor();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#1D211E] border border-[#363D36] rounded-3xl p-6 shadow-2xl flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#A9B2AC] hover:text-[#F5F6F5] hover:bg-[#292E29] rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <BookmarkPlus className="w-5 h-5 text-[#B4F34C]" />
          <h3 className="text-lg font-bold text-[#F5F6F5]">루틴에 운동 추가</h3>
        </div>
        <p className="text-xs text-[#A9B2AC] mb-4">
          <span className="text-[#F5F6F5] font-semibold">{exercise.nameKo}</span> 종목의 목표치를 설정하고 루틴에 저장합니다.
        </p>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-[#B4F34C]/20 border border-[#B4F34C] flex items-center justify-center">
              <Check className="w-8 h-8 text-[#B4F34C]" />
            </div>
            <p className="text-base font-bold text-[#F5F6F5]">루틴에 성공적으로 저장되었습니다!</p>
          </div>
        ) : routines.length === 0 ? (
          <div className="py-6 flex flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-[#A9B2AC]">아직 생성된 루틴이 없습니다.</p>
            <button
              type="button"
              onClick={handleCreateNewRoutine}
              className="px-4 py-2.5 bg-[#B4F34C] text-[#101510] font-bold text-sm rounded-xl"
            >
              새 루틴 만들기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Select Routine */}
            <div>
              <label className="text-xs font-semibold text-[#A9B2AC] block mb-1.5">
                저장할 루틴 선택
              </label>
              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                {routines.map((r) => {
                  const isSelected = selectedRoutine?.id === r.id;
                  const alreadyHas = r.exercises.some((e) => e.exerciseId === exercise.id);
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRoutine(r)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#B4F34C]/15 border-[#B4F34C] text-[#F5F6F5]'
                          : 'bg-[#292E29] border-[#363D36] text-[#A9B2AC] hover:text-[#F5F6F5]'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#F5F6F5]">{r.name}</span>
                        <span className="text-[11px] text-[#A9B2AC]">
                          {r.exercises.length}개 종목 {alreadyHas && '• (이미 포함됨)'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#A9B2AC]" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Target Settings */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#363D36]">
              <div>
                <label className="text-xs font-semibold text-[#A9B2AC] block mb-1">
                  목표 세트
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={targetSets}
                    onChange={(e) => setTargetSets(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full h-11 bg-[#292E29] border border-[#363D36] rounded-xl px-3 text-sm font-bold text-[#F5F6F5] text-center"
                  />
                  <span className="text-xs text-[#A9B2AC] shrink-0">세트</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A9B2AC] block mb-1">
                  목표 횟수
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={targetReps}
                    onChange={(e) => setTargetReps(e.target.value)}
                    placeholder="8-12"
                    className="w-full h-11 bg-[#292E29] border border-[#363D36] rounded-xl px-3 text-sm font-bold text-[#F5F6F5] text-center"
                  />
                  <span className="text-xs text-[#A9B2AC] shrink-0">회</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A9B2AC] block mb-1">
                  목표 중량
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="2.5"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full h-11 bg-[#292E29] border border-[#363D36] rounded-xl px-3 text-sm font-bold text-[#F5F6F5] text-center"
                  />
                  <span className="text-xs text-[#A9B2AC] shrink-0">kg</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A9B2AC] block mb-1">
                  권장 휴식
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={restSeconds}
                    onChange={(e) => setRestSeconds(Math.max(15, parseInt(e.target.value, 10) || 15))}
                    className="w-full h-11 bg-[#292E29] border border-[#363D36] rounded-xl px-3 text-sm font-bold text-[#F5F6F5] text-center"
                  />
                  <span className="text-xs text-[#A9B2AC] shrink-0">초</span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveToRoutine}
              className="w-full min-h-[50px] bg-[#B4F34C] hover:bg-[#A0DE3C] text-[#101510] font-extrabold rounded-2xl transition-all shadow-lg shadow-[#B4F34C]/20 flex items-center justify-center gap-2 mt-2"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              루틴에 저장하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
