import React from 'react';
import { Exercise, WorkoutSet } from '../../types';
import { ExerciseIllustration } from '../exercise/ExerciseIllustration';
import { ChevronLeft, X, Plus, Trash2, RefreshCw, Check } from 'lucide-react';

interface ExerciseEditBottomSheetProps {
  exercise: Exercise;
  sets: WorkoutSet[];
  onAddSet: () => void;
  onUpdateSet: (setId: string, updates: Partial<WorkoutSet>) => void;
  onDeleteSet: (setId: string) => void;
  onDeleteExercise: () => void;
  onReplaceExercise: () => void;
  onClose: () => void;
}

export const ExerciseEditBottomSheet: React.FC<ExerciseEditBottomSheetProps> = ({
  exercise,
  sets,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onDeleteExercise,
  onReplaceExercise,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#1B1C20] border-t sm:border border-[#3E4048] rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 text-xs text-[#A9AAB3] hover:text-[#F4F4F5]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>운동 수정</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#303137] text-[#A9AAB3] hover:text-[#F4F4F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title */}
        <div className="px-6 pb-3">
          <h2 className="text-xl font-black text-[#F4F4F5]">{exercise.nameKo}</h2>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4">
          {/* Centered Illustration inside dark container */}
          <div className="flex justify-center">
            <ExerciseIllustration
              exercise={exercise}
              size="large"
              className="w-full h-44 rounded-2xl bg-[#303137]/60"
            />
          </div>

          {/* Sets Table */}
          <div className="space-y-2.5">
            {sets.map((set, idx) => (
              <div
                key={set.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#303137] border border-[#3E4048]/60 gap-3"
              >
                {/* Set Number Label */}
                <span className="w-12 text-xs font-bold text-[#F4F4F5] shrink-0">
                  {idx + 1}세트
                </span>

                {/* Weight Box */}
                <div className="flex items-center gap-1 bg-[#42434A] px-3 py-1.5 rounded-xl flex-1 justify-center">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={set.weight ?? ''}
                    onChange={(e) =>
                      onUpdateSet(set.id, { weight: parseFloat(e.target.value) || 0 })
                    }
                    className="w-14 bg-transparent text-center font-black text-sm text-[#F4F4F5] focus:outline-none"
                  />
                  <span className="text-xs text-[#A9AAB3] font-semibold">kg</span>
                </div>

                {/* Reps Box */}
                <div className="flex items-center gap-1 bg-[#42434A] px-3 py-1.5 rounded-xl flex-1 justify-center">
                  <input
                    type="number"
                    min="1"
                    value={set.reps ?? ''}
                    onChange={(e) =>
                      onUpdateSet(set.id, { reps: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-12 bg-transparent text-center font-black text-sm text-[#F4F4F5] focus:outline-none"
                  />
                  <span className="text-xs text-[#A9AAB3] font-semibold">회</span>
                </div>

                {/* Delete Set Trash Icon */}
                {sets.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => onDeleteSet(set.id)}
                    className="p-1.5 text-[#A9AAB3] hover:text-[#FF806B] transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="w-7 shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* Add Set Button */}
          <button
            type="button"
            onClick={onAddSet}
            className="w-full min-h-[46px] rounded-2xl bg-[#303137]/80 hover:bg-[#303137] text-xs font-bold text-[#F4F4F5] border border-[#3E4048] flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4 text-[#B4F34C]" />
            <span>세트 추가</span>
          </button>
        </div>

        {/* Bottom Actions: 🗑 삭제 | 🔄 대체 */}
        <div className="p-4 border-t border-[#3E4048]/80 bg-[#1B1C20] grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              if (confirm(`${exercise.nameKo} 종목을 운동에서 삭제하시겠습니까?`)) {
                onDeleteExercise();
                onClose();
              }
            }}
            className="min-h-[48px] rounded-2xl bg-[#4A2626] hover:bg-[#5E2B2B] text-[#FF806B] font-extrabold text-xs flex items-center justify-center gap-2 transition-all border border-[#FF806B]/30"
          >
            <Trash2 className="w-4 h-4" />
            <span>삭제</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onReplaceExercise();
            }}
            className="min-h-[48px] rounded-2xl bg-[#303137] hover:bg-[#3A3B43] text-[#F4F4F5] font-extrabold text-xs flex items-center justify-center gap-2 transition-all border border-[#3E4048]"
          >
            <RefreshCw className="w-4 h-4 text-[#B4F34C]" />
            <span>대체</span>
          </button>
        </div>
      </div>
    </div>
  );
};
