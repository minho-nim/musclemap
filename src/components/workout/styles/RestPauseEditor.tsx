import React, { useState } from 'react';
import { WorkoutSet, SetSegment } from '../../../types';
import { useTimerStore } from '../../../stores/useTimerStore';
import { Plus, Trash2, Check, Clock, Play } from 'lucide-react';

interface RestPauseEditorProps {
  set: WorkoutSet;
  onUpdateSet: (updates: Partial<WorkoutSet>) => void;
  onCompleteSet: () => void;
  onUndoComplete: () => void;
}

export const RestPauseEditor: React.FC<RestPauseEditorProps> = ({
  set,
  onUpdateSet,
  onCompleteSet,
  onUndoComplete,
}) => {
  const segments = set.segments || [];
  const { startTimer } = useTimerStore();

  const handleAddPauseStage = () => {
    const newStage: SetSegment = {
      id: `rp_${Date.now()}_${segments.length + 1}`,
      segmentNumber: segments.length + 1,
      type: 'rest_pause',
      weight: set.weight || 20,
      reps: 3,
      pauseSeconds: 20,
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

  const handleStartMicroPauseTimer = (seconds: number = 20) => {
    startTimer(seconds, '레스트-포즈 마이크로 휴식');
  };

  return (
    <div className="bg-[#1D211E] border border-[#363D36] rounded-2xl p-3.5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#363D36]/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-extrabold text-[11px]">
            레스트-포즈
          </span>
          <span className="font-bold text-[#F5F6F5]">초기 한계 세트</span>
        </div>
        <span className="text-[11px] text-[#A9B2AC]">15~20초 초단기 휴식 후 추가 반복</span>
      </div>

      {/* Base Set */}
      <div className="flex items-center gap-2">
        <span className="w-16 text-xs font-bold text-[#A9B2AC]">본 중량</span>
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

      {/* Micro-Pause Stages */}
      {segments.map((seg, idx) => (
        <div
          key={seg.id}
          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
            seg.isCompleted ? 'bg-[#B4F34C]/10 border-[#B4F34C]/40' : 'bg-[#252B27] border-[#363D36]'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-purple-400">포즈 {idx + 1}</span>
            <button
              type="button"
              onClick={() => handleStartMicroPauseTimer(seg.pauseSeconds || 20)}
              className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-[10px] rounded-lg flex items-center gap-1 border border-purple-500/40"
              title="20초 마이크로 타이머 시작"
            >
              <Clock className="w-3 h-3" />
              <span>{seg.pauseSeconds || 20}초 휴식 시작</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#A9B2AC]">추가</span>
            <input
              type="number"
              min="1"
              value={seg.reps ?? ''}
              onChange={(e) =>
                handleUpdateSegment(seg.id, { reps: parseInt(e.target.value, 10) || 1 })
              }
              placeholder="회"
              className="w-14 h-9 bg-[#292E29] border border-[#363D36] rounded-lg text-center font-bold text-xs text-[#F5F6F5]"
            />
            <span className="text-xs text-[#A9B2AC]">회</span>

            <button
              type="button"
              onClick={() =>
                handleUpdateSegment(seg.id, {
                  isCompleted: !seg.isCompleted,
                  completedAt: !seg.isCompleted ? new Date().toISOString() : undefined,
                })
              }
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all ${
                seg.isCompleted
                  ? 'bg-[#B4F34C] text-[#101510]'
                  : 'bg-[#292E29] text-[#A9B2AC] border border-[#363D36]'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleRemoveSegment(seg.id)}
              className="p-1 text-[#A9B2AC] hover:text-[#FF806B]"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}

      {/* Add Pause Stage */}
      <button
        type="button"
        onClick={handleAddPauseStage}
        className="w-full py-2 bg-[#252B27] hover:bg-[#2C332F] text-xs font-bold text-purple-400 border border-dashed border-[#363D36] rounded-xl flex items-center justify-center gap-1.5 transition-all"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>+ 20초 마이크로 포즈 추가 (추가 반복)</span>
      </button>

      {/* Complete Set Button */}
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
        <span>{set.isCompleted ? '레스트-포즈 세트 완료됨' : '레스트-포즈 세트 종료 및 메인 휴식 시작'}</span>
      </button>
    </div>
  );
};
