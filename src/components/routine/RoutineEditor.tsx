import React, { useState, useEffect } from 'react';
import { db } from '../../db';
import { Routine, RoutineExercise, SplitType, DayOfWeek, Exercise } from '../../types';
import { ExercisePickerModal } from '../workout/ExercisePickerModal';
import {
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  Dumbbell,
} from 'lucide-react';

interface RoutineEditorProps {
  routineId: string | null;
  exercises: Exercise[];
  onClose: () => void;
  onSaved: () => void;
}

const SPLIT_OPTIONS: { id: SplitType; label: string }[] = [
  { id: 'three_split', label: '3분할 (Push / Pull / Legs 등)' },
  { id: 'two_split', label: '2분할 (상체 / 하체 등)' },
  { id: 'full_body', label: '무분할 (전신 루틴)' },
  { id: 'four_split', label: '4분할' },
  { id: 'five_split', label: '5분할' },
  { id: 'custom', label: '사용자 정의' },
];

const DAYS: { id: DayOfWeek; label: string }[] = [
  { id: 1, label: '월' },
  { id: 2, label: '화' },
  { id: 3, label: '수' },
  { id: 4, label: '목' },
  { id: 5, label: '금' },
  { id: 6, label: '토' },
  { id: 0, label: '일' },
];

export const RoutineEditor: React.FC<RoutineEditorProps> = ({
  routineId,
  exercises,
  onClose,
  onSaved,
}) => {
  const [name, setName] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('three_split');
  const [scheduledDays, setScheduledDays] = useState<DayOfWeek[]>([1, 4]);
  const [isRotating, setIsRotating] = useState(false);
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([]);

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    async function load() {
      if (routineId) {
        const existing = await db.routines.get(routineId);
        if (existing) {
          setName(existing.name);
          setSplitType(existing.splitType);
          setScheduledDays(existing.scheduledDays);
          setIsRotating(existing.isRotating);
          setRoutineExercises(existing.exercises);
        }
      } else {
        setName('새로운 루틴');
      }
    }
    load();
  }, [routineId]);

  const toggleDay = (day: DayOfWeek) => {
    if (scheduledDays.includes(day)) {
      setScheduledDays(scheduledDays.filter((d) => d !== day));
    } else {
      setScheduledDays([...scheduledDays, day]);
    }
  };

  const handleAddExerciseFromPicker = (exerciseId: string) => {
    const ex = exercises.find((e) => e.id === exerciseId);
    const newOrder = routineExercises.length + 1;
    const newEx: RoutineExercise = {
      exerciseId,
      order: newOrder,
      targetSets: 3,
      targetReps: '10',
      targetWeight: 40,
      defaultRestSeconds: ex?.defaultRestSeconds || 90,
    };
    setRoutineExercises([...routineExercises, newEx]);
    setIsPickerOpen(false);
  };

  const handleUpdateExercise = (index: number, updates: Partial<RoutineExercise>) => {
    const updated = routineExercises.map((e, idx) => (idx === index ? { ...e, ...updates } : e));
    setRoutineExercises(updated);
  };

  const handleRemoveExercise = (index: number) => {
    const updated = routineExercises
      .filter((_, idx) => idx !== index)
      .map((e, idx) => ({ ...e, order: idx + 1 }));
    setRoutineExercises(updated);
  };

  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= routineExercises.length) return;

    const list = [...routineExercises];
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    const reordered = list.map((e, idx) => ({ ...e, order: idx + 1 }));
    setRoutineExercises(reordered);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('루틴 이름을 입력해주세요.');
      return;
    }
    if (routineExercises.length === 0) {
      alert('최소 1개 이상의 운동 종목을 추가해주세요.');
      return;
    }

    const now = new Date().toISOString();
    const id = routineId || `routine_${Date.now()}`;

    const routineData: Routine = {
      id,
      name: name.trim(),
      splitType,
      scheduledDays,
      isRotating,
      exercises: routineExercises,
      createdAt: now,
      updatedAt: now,
      orderIndex: 0,
    };

    await db.routines.put(routineData);

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#1B1C20] border border-[#3E4048] rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#A9B2AC] hover:text-[#F5F6F5] hover:bg-[#292E29] rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-extrabold text-[#F5F6F5] mb-4">
          {routineId ? '루틴 수정' : '새 루틴 만들기'}
        </h3>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* Routine Name */}
          <div>
            <label className="text-xs font-semibold text-[#A9B2AC] block mb-1">루틴 이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 3분할 - Day 1: 푸시 (가슴·어깨·삼두)"
              className="w-full h-11 px-3.5 bg-[#292E29] border border-[#363D36] rounded-xl text-sm font-bold text-[#F5F6F5] focus:outline-none focus:border-[#B4F34C]"
            />
          </div>

          {/* Split Type */}
          <div>
            <label className="text-xs font-semibold text-[#A9B2AC] block mb-1">분할 방식</label>
            <select
              value={splitType}
              onChange={(e) => setSplitType(e.target.value as SplitType)}
              className="w-full h-11 px-3 bg-[#292E29] border border-[#363D36] rounded-xl text-xs font-bold text-[#F5F6F5] focus:outline-none focus:border-[#B4F34C]"
            >
              {SPLIT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Scheduled Days */}
          <div>
            <label className="text-xs font-semibold text-[#A9B2AC] block mb-1.5">
              운동 예정 요일
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {DAYS.map((d) => {
                const isSelected = scheduledDays.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDay(d.id)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#B4F34C] text-[#101510] shadow-sm'
                        : 'bg-[#292E29] text-[#A9B2AC] hover:text-[#F5F6F5] border border-[#363D36]'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exercise Items in Routine */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#A9B2AC]">
                운동 종목 및 목표 설정 ({routineExercises.length}개)
              </label>

              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#292E29] hover:bg-[#363D36] text-[#B4F34C] text-xs font-bold rounded-xl border border-[#363D36] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>종목 추가</span>
              </button>
            </div>

            {routineExercises.length === 0 ? (
              <div className="p-8 border border-dashed border-[#363D36] rounded-2xl text-center text-xs text-[#A9B2AC]">
                아직 추가된 운동이 없습니다. '종목 추가' 버튼을 눌러 추가하세요.
              </div>
            ) : (
              <div className="space-y-2.5">
                {routineExercises.map((re, idx) => {
                  const ex = exercises.find((e) => e.id === re.exerciseId);
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-[#252B27] border border-[#363D36] rounded-2xl flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#292E29] text-[#B4F34C] font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-bold text-[#F5F6F5]">
                            {ex?.nameKo || re.exerciseId}
                          </span>
                        </div>

                        {/* Order & Delete Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveExercise(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-[#A9B2AC] hover:text-[#F5F6F5] disabled:opacity-30"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveExercise(idx, 'down')}
                            disabled={idx === routineExercises.length - 1}
                            className="p-1 text-[#A9B2AC] hover:text-[#F5F6F5] disabled:opacity-30"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(idx)}
                            className="p-1 text-[#A9B2AC] hover:text-[#FF806B] ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Row Inputs: Sets, Reps, Weight, Rest */}
                      <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
                        <div>
                          <span className="text-[10px] text-[#A9B2AC] block">목표 세트</span>
                          <input
                            type="number"
                            min="1"
                            value={re.targetSets}
                            onChange={(e) =>
                              handleUpdateExercise(idx, {
                                targetSets: parseInt(e.target.value, 10) || 1,
                              })
                            }
                            className="w-full h-8 bg-[#292E29] border border-[#363D36] rounded-lg text-center font-bold text-[#F5F6F5]"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] text-[#A9B2AC] block">목표 횟수</span>
                          <input
                            type="text"
                            value={re.targetReps}
                            onChange={(e) =>
                              handleUpdateExercise(idx, { targetReps: e.target.value })
                            }
                            className="w-full h-8 bg-[#292E29] border border-[#363D36] rounded-lg text-center font-bold text-[#F5F6F5]"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] text-[#A9B2AC] block">중량 (kg)</span>
                          <input
                            type="number"
                            min="0"
                            step="2.5"
                            value={re.targetWeight ?? ''}
                            onChange={(e) =>
                              handleUpdateExercise(idx, {
                                targetWeight: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full h-8 bg-[#292E29] border border-[#363D36] rounded-lg text-center font-bold text-[#F5F6F5]"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] text-[#A9B2AC] block">휴식 (초)</span>
                          <input
                            type="number"
                            min="15"
                            step="15"
                            value={re.defaultRestSeconds}
                            onChange={(e) =>
                              handleUpdateExercise(idx, {
                                defaultRestSeconds: parseInt(e.target.value, 10) || 60,
                              })
                            }
                            className="w-full h-8 bg-[#292E29] border border-[#363D36] rounded-lg text-center font-bold text-[#F5F6F5]"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-[#363D36] mt-2">
          <button
            type="button"
            onClick={handleSave}
            className="w-full min-h-[50px] bg-[#B4F34C] hover:bg-[#A0DE3C] text-[#101510] font-extrabold rounded-2xl transition-all shadow-lg shadow-[#B4F34C]/20 flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>루틴 저장 완료</span>
          </button>
        </div>

        {/* Exercise Picker Modal for Routine */}
        {isPickerOpen && (
          <ExercisePickerModal
            exercises={exercises}
            onClose={() => setIsPickerOpen(false)}
          />
        )}
      </div>
    </div>
  );
};
