import React, { useState } from 'react';
import { Exercise, WorkoutSession, WorkoutSet } from '../../types';
import { ExerciseIllustration } from '../exercise/ExerciseIllustration';
import {
  X,
  Plus,
  MoreVertical,
  ArrowUpDown,
  Link2,
  Trash2,
  RefreshCw,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface ExerciseListBottomSheetProps {
  session: WorkoutSession;
  exercises: Exercise[];
  sets: WorkoutSet[];
  activeExerciseIndex: number;
  onSelectExerciseIndex: (index: number) => void;
  onOpenAddExercise: () => void;
  onOpenEditExercise: (exerciseId: string) => void;
  onReplaceExercise: (exerciseId: string) => void;
  onDeleteExercise: (exerciseId: string) => void;
  onClose: () => void;
}

export const ExerciseListBottomSheet: React.FC<ExerciseListBottomSheetProps> = ({
  session,
  exercises,
  sets,
  activeExerciseIndex,
  onSelectExerciseIndex,
  onOpenAddExercise,
  onOpenEditExercise,
  onReplaceExercise,
  onDeleteExercise,
  onClose,
}) => {
  const [activeMenuExerciseId, setActiveMenuExerciseId] = useState<string | null>(null);

  // Compute estimated total time or duration
  const totalSetsCount = session.exercises.reduce((acc, se) => acc + (se.targetSets || 3), 0);
  const estimatedMinutes = Math.max(15, Math.round(totalSetsCount * 2.5));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#1B1C20] border-t sm:border border-[#3E4048] rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-lg font-black text-[#F4F4F5]">운동 목록</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#303137] text-[#A9AAB3] hover:text-[#F4F4F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subheader info bar */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-[#3E4048]/60 text-xs text-[#A9AAB3]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#F4F4F5]">총 {session.exercises.length}개</span>
            <span>|</span>
            <span>⏱ 약 {estimatedMinutes}분</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="px-2 py-1 rounded-lg bg-[#303137] text-[11px] font-semibold text-[#A9AAB3] flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" />
              순서
            </span>
          </div>
        </div>

        {/* High-density Exercise List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 divide-y divide-[#303137]/40 space-y-1">
          {session.exercises.map((se, index) => {
            const ex = exercises.find((e) => e.id === se.exerciseId);
            if (!ex) return null;

            const exSets = sets.filter((s) => s.exerciseId === ex.id);
            const completedCount = exSets.filter((s) => s.isCompleted).length;
            const isCurrentActive = index === activeExerciseIndex;
            const isMenuOpen = activeMenuExerciseId === ex.id;

            return (
              <div
                key={ex.id}
                className={`group relative flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer ${
                  isCurrentActive
                    ? 'bg-[#303137] border border-[#B4F34C]/40 shadow-sm'
                    : 'hover:bg-[#26282E]'
                }`}
                onClick={() => {
                  onSelectExerciseIndex(index);
                  onClose();
                }}
              >
                {/* Left: Thumbnail & Name */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <ExerciseIllustration
                    exercise={ex}
                    size="thumb"
                    className="w-12 h-12 rounded-xl shrink-0"
                    highlightColor={isCurrentActive ? '#B4F34C' : '#FF806B'}
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-bold truncate ${
                          isCurrentActive ? 'text-[#B4F34C]' : 'text-[#F4F4F5]'
                        }`}
                      >
                        {ex.nameKo}
                      </h4>
                      {completedCount > 0 && completedCount === exSets.length && (
                        <CheckCircle2 className="w-4 h-4 text-[#B4F34C] shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#A9AAB3] mt-0.5">
                      {completedCount}/{exSets.length} 세트 완료
                      {se.styleId && se.styleId !== 'standard' && (
                        <span className="ml-2 text-[#B4F34C] font-semibold">
                          • {se.styleId}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Right: Three Dots Action Menu */}
                <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveMenuExerciseId(isMenuOpen ? null : ex.id)
                    }
                    className="p-2 rounded-xl text-[#A9AAB3] hover:text-[#F4F4F5] hover:bg-[#42434A] transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute right-0 top-10 z-20 w-36 bg-[#303137] border border-[#3E4048] rounded-2xl p-1.5 shadow-2xl animate-fade-in text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMenuExerciseId(null);
                          onOpenEditExercise(ex.id);
                        }}
                        className="w-full px-3 py-2 text-left text-[#F4F4F5] hover:bg-[#42434A] rounded-xl flex items-center gap-2"
                      >
                        <Sliders className="w-3.5 h-3.5 text-[#B4F34C]" />
                        <span>세트 설정</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveMenuExerciseId(null);
                          onReplaceExercise(ex.id);
                        }}
                        className="w-full px-3 py-2 text-left text-[#F4F4F5] hover:bg-[#42434A] rounded-xl flex items-center gap-2"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-[#A9AAB3]" />
                        <span>종목 대체</span>
                      </button>

                      {session.exercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuExerciseId(null);
                            onDeleteExercise(ex.id);
                          }}
                          className="w-full px-3 py-2 text-left text-[#FF806B] hover:bg-[#4A2626] rounded-xl flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>종목 삭제</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Action: + 운동 추가하기 */}
        <div className="p-4 border-t border-[#3E4048]/80 bg-[#1B1C20]">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAddExercise();
            }}
            className="w-full min-h-[48px] rounded-2xl bg-[#303137] hover:bg-[#3A3B43] text-[#F4F4F5] font-extrabold text-xs border border-[#3E4048] flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4 text-[#B4F34C]" />
            <span>운동 추가하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
