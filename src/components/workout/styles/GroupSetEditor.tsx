import React from 'react';
import { Exercise, WorkoutStyleId, SessionBlock } from '../../../types';
import { MUSCLE_DEFINITIONS } from '../../../data/muscles';
import { Plus, Trash2, ArrowRight, Check, Dumbbell } from 'lucide-react';

interface GroupSetEditorProps {
  styleId: WorkoutStyleId;
  groupExercises: Exercise[];
  currentExerciseIndex: number;
  currentRound: number;
  totalRounds: number;
  onSelectExercise: (index: number) => void;
  onAddExerciseToGroup: () => void;
  onRemoveExerciseFromGroup: (index: number) => void;
  onUpdateRounds: (rounds: number) => void;
  onCompleteRound: () => void;
}

export const GroupSetEditor: React.FC<GroupSetEditorProps> = ({
  styleId,
  groupExercises,
  currentExerciseIndex,
  currentRound,
  totalRounds,
  onSelectExercise,
  onAddExerciseToGroup,
  onRemoveExerciseFromGroup,
  onUpdateRounds,
  onCompleteRound,
}) => {
  const styleBadge: Record<WorkoutStyleId, { label: string; color: string }> = {
    standard: { label: '일반', color: 'bg-emerald-500/20 text-emerald-400' },
    superset: { label: '슈퍼세트 (2개 종목)', color: 'bg-[#B4F34C]/20 text-[#B4F34C]' },
    drop_set: { label: '드롭세트', color: 'bg-blue-500/20 text-blue-400' },
    pyramid: { label: '피라미드세트', color: 'bg-amber-500/20 text-amber-400' },
    compound_set: { label: '컴파운드세트 (동일 부위 2개)', color: 'bg-[#FF806B]/20 text-[#FF806B]' },
    rest_pause: { label: '레스트-포즈', color: 'bg-purple-500/20 text-purple-400' },
    circuit: { label: '서킷 트레이닝', color: 'bg-cyan-500/20 text-cyan-400' },
    giant_set: { label: '자이언트세트 (4개 이상)', color: 'bg-rose-500/20 text-rose-400' },
  };

  const badge = styleBadge[styleId] || styleBadge.standard;

  return (
    <div className="bg-[#1D211E] border border-[#363D36] rounded-2xl p-4 mb-4 space-y-3 shadow-md">
      {/* Group Header & Round Control */}
      <div className="flex items-center justify-between pb-2 border-b border-[#363D36]">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-lg ${badge.color}`}>
            {badge.label}
          </span>
          <span className="text-xs font-bold text-[#F5F6F5]">
            라운드 {currentRound} / {totalRounds}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#A9B2AC]">
          <span>총 라운드:</span>
          <button
            type="button"
            onClick={() => onUpdateRounds(Math.max(1, totalRounds - 1))}
            className="w-6 h-6 rounded bg-[#292E29] hover:bg-[#363D36] text-[#F5F6F5] font-bold"
          >
            -
          </button>
          <span className="font-bold text-[#F5F6F5] px-1">{totalRounds}</span>
          <button
            type="button"
            onClick={() => onUpdateRounds(totalRounds + 1)}
            className="w-6 h-6 rounded bg-[#292E29] hover:bg-[#363D36] text-[#F5F6F5] font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* Linked Exercises Flow Bar */}
      <div>
        <span className="text-[11px] font-semibold text-[#A9B2AC] block mb-1.5">
          연속 수행 종목 순서 (터치하여 해당 종목 전환):
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {groupExercises.map((ex, idx) => {
            const isCurrent = idx === currentExerciseIndex;
            const prefix =
              styleId === 'superset'
                ? `A${idx + 1}`
                : styleId === 'compound_set'
                ? `C${idx + 1}`
                : styleId === 'giant_set'
                ? `G${idx + 1}`
                : `${idx + 1}`;

            return (
              <React.Fragment key={`${ex.id}-${idx}`}>
                <button
                  type="button"
                  onClick={() => onSelectExercise(idx)}
                  className={`p-2.5 rounded-xl border text-left shrink-0 transition-all flex items-center gap-2 ${
                    isCurrent
                      ? 'bg-[#B4F34C]/20 border-[#B4F34C] text-[#F5F6F5]'
                      : 'bg-[#252B27] hover:bg-[#2C332F] border-[#363D36] text-[#A9B2AC]'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-md font-bold text-xs flex items-center justify-center ${
                      isCurrent
                        ? 'bg-[#B4F34C] text-[#101510]'
                        : 'bg-[#292E29] text-[#A9B2AC]'
                    }`}
                  >
                    {prefix}
                  </span>
                  <div>
                    <span className="text-xs font-bold block truncate max-w-[120px]">
                      {ex.nameKo}
                    </span>
                    <span className="text-[10px] text-[#A9B2AC] block">
                      {MUSCLE_DEFINITIONS[ex.primaryMuscles[0]]?.nameKo}
                    </span>
                  </div>

                  {groupExercises.length > 2 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveExerciseFromGroup(idx);
                      }}
                      className="p-1 hover:text-[#FF806B] ml-1"
                      title="그룹에서 제거"
                    >
                      <Trash2 className="w-3 h-3" />
                    </span>
                  )}
                </button>

                {idx < groupExercises.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-[#A9B2AC] shrink-0" />
                )}
              </React.Fragment>
            );
          })}

          {/* Add exercise to group (for circuit or giant set or superset second) */}
          {(styleId === 'circuit' || styleId === 'giant_set' || groupExercises.length < 2) && (
            <button
              type="button"
              onClick={onAddExerciseToGroup}
              className="p-2.5 bg-[#252B27] hover:bg-[#2C332F] border border-dashed border-[#363D36] rounded-xl text-xs font-bold text-[#B4F34C] flex items-center gap-1 shrink-0 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>종목 연결</span>
            </button>
          )}
        </div>
      </div>

      {/* Round Complete Action */}
      <div className="pt-2 border-t border-[#363D36] flex items-center justify-between text-xs">
        <span className="text-[11px] text-[#A9B2AC]">
          그룹 내 모든 종목 수행 후 라운드 완료를 누르면 휴식 타이머가 작동합니다.
        </span>
        <button
          type="button"
          onClick={onCompleteRound}
          className="px-3 py-1.5 bg-[#B4F34C] hover:bg-[#A0DE3C] text-[#101510] font-bold rounded-xl flex items-center gap-1 transition-all"
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>라운드 완료 및 휴식</span>
        </button>
      </div>
    </div>
  );
};
