import React from 'react';
import { WorkoutSet, SetSegment } from '../../../types';
import { Plus, Trash2, Check, ArrowDown } from 'lucide-react';

interface DropSetEditorProps {
  set: WorkoutSet;
  onUpdateSet: (updates: Partial<WorkoutSet>) => void;
  onCompleteSet: () => void;
  onUndoComplete: () => void;
}

export const DropSetEditor: React.FC<DropSetEditorProps> = ({
  set,
  onUpdateSet,
  onCompleteSet,
  onUndoComplete,
}) => {
  const segments = set.segments || [];

  const handleAddDropStage = () => {
    const lastWeight =
      segments.length > 0
        ? segments[segments.length - 1].weight || 20
        : set.weight || 20;

    const newWeight = Math.max(2.5, Math.round((lastWeight * 0.75) / 2.5) * 2.5); // ~20-25% drop
    const newStage: SetSegment = {
      id: `seg_${Date.now()}_${segments.length + 1}`,
      segmentNumber: segments.length + 1,
      type: 'drop',
      weight: newWeight,
      reps: 8,
      isCompleted: false,
    };

    onUpdateSet({ segments: [...segments, newStage] });
  };

  const handleUpdateSegment = (segId: string, updates: Partial<SetSegment>) => {
    const updated = segments.map((s) => (s.id === segId ? { ...s, ...updates } : s));
    onUpdateSet({ segments: updated });
  };

  const handleRemoveSegment = (segId: string) => {
    const filtered = segments
      .filter((s) => s.id !== segId)
      .map((s, idx) => ({ ...s, segmentNumber: idx + 1 }));
    onUpdateSet({ segments: filtered });
  };

  const handleToggleSegmentComplete = (segId: string) => {
    const updated = segments.map((s) =>
      s.id === segId
        ? {
            ...s,
            isCompleted: !s.isCompleted,
            completedAt: !s.isCompleted ? new Date().toISOString() : undefined,
          }
        : s
    );

    // If all drop segments are completed and base set is done, complete parent set!
    const allDone = set.isCompleted && updated.every((s) => s.isCompleted);
    onUpdateSet({ segments: updated });

    if (allDone) {
      onCompleteSet();
    }
  };

  return (
    <div className="bg-[#1D211E] border border-[#363D36] rounded-2xl p-3.5 space-y-3">
      {/* Base Stage */}
      <div className="flex items-center justify-between pb-2 border-b border-[#363D36]/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-extrabold text-[11px]">
            드롭세트
          </span>
          <span className="font-bold text-[#F5F6F5]">초기 본세트</span>
        </div>
        <span className="text-[11px] text-[#A9B2AC]">휴식 없이 즉시 감량</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="w-16 text-xs font-bold text-[#A9B2AC]">시작 중량</span>
        <input
          type="number"
          min="0"
          step="2.5"
          value={set.weight ?? ''}
          onChange={(e) => onUpdateSet({ weight: parseFloat(e.target.value) || 0 })}
          className="flex-1 h-10 bg-[#292E29] border border-[#363D36] rounded-xl text-center font-bold text-sm text-[#F5F6F5]"
        />
        <span className="text-xs text-[#A9B2AC]">kg</span>

        <input
          type="number"
          min="1"
          value={set.reps ?? ''}
          onChange={(e) => onUpdateSet({ reps: parseInt(e.target.value, 10) || 1 })}
          className="w-16 h-10 bg-[#292E29] border border-[#363D36] rounded-xl text-center font-bold text-sm text-[#F5F6F5]"
        />
        <span className="text-xs text-[#A9B2AC]">회</span>
      </div>

      {/* Drop Stages */}
      {segments.map((seg, idx) => (
        <div
          key={seg.id}
          className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
            seg.isCompleted ? 'bg-[#B4F34C]/10 border-[#B4F34C]/40' : 'bg-[#252B27] border-[#363D36]'
          }`}
        >
          <div className="flex items-center gap-1 w-16 text-xs font-bold text-blue-400">
            <ArrowDown className="w-3.5 h-3.5" />
            <span>드롭 {idx + 1}</span>
          </div>

          <input
            type="number"
            min="0"
            step="2.5"
            value={seg.weight ?? ''}
            onChange={(e) =>
              handleUpdateSegment(seg.id, { weight: parseFloat(e.target.value) || 0 })
            }
            placeholder="감량 kg"
            className="flex-1 h-9 bg-[#292E29] border border-[#363D36] rounded-lg text-center font-bold text-xs text-[#F5F6F5]"
          />
          <span className="text-xs text-[#A9B2AC]">kg</span>

          <input
            type="number"
            min="1"
            value={seg.reps ?? ''}
            onChange={(e) =>
              handleUpdateSegment(seg.id, { reps: parseInt(e.target.value, 10) || 1 })
            }
            placeholder="회"
            className="w-16 h-9 bg-[#292E29] border border-[#363D36] rounded-lg text-center font-bold text-xs text-[#F5F6F5]"
          />
          <span className="text-xs text-[#A9B2AC]">회</span>

          <button
            type="button"
            onClick={() => handleToggleSegmentComplete(seg.id)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold transition-all ${
              seg.isCompleted
                ? 'bg-[#B4F34C] text-[#101510]'
                : 'bg-[#292E29] text-[#A9B2AC] border border-[#363D36]'
            }`}
          >
            <Check className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleRemoveSegment(seg.id)}
            className="p-1 text-[#A9B2AC] hover:text-[#FF806B]"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      {/* Add Drop Stage Button */}
      <button
        type="button"
        onClick={handleAddDropStage}
        className="w-full py-2 bg-[#252B27] hover:bg-[#2C332F] text-xs font-bold text-blue-400 border border-dashed border-[#363D36] rounded-xl flex items-center justify-center gap-1.5 transition-all"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>+ 드롭 단계 추가 (20~30% 감량)</span>
      </button>

      {/* Overall Set Complete Button */}
      <button
        type="button"
        onClick={() => (set.isCompleted ? onUndoComplete() : onCompleteSet())}
        className={`w-full min-h-[46px] rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
          set.isCompleted
            ? 'bg-[#B4F34C] text-[#101510] shadow-md shadow-[#B4F34C]/20'
            : 'bg-[#292E29] hover:bg-[#363D36] text-[#F5F6F5] border border-[#363D36]'
        }`}
      >
        <Check className="w-4 h-4 stroke-[3]" />
        <span>{set.isCompleted ? '드롭세트 완료됨 (타이머 작동)' : '드롭세트 전체 완료 및 휴식 시작'}</span>
      </button>
    </div>
  );
};
