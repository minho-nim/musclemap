import React from 'react';
import { useTimerStore } from '../../stores/useTimerStore';
import { Play, Pause, FastForward, Plus, Minus, X, Info } from 'lucide-react';

export const RestTimerModal: React.FC = () => {
  const {
    isExpanded,
    isRunning,
    remainingSeconds,
    targetSeconds,
    exerciseName,
    toggleExpanded,
    pauseTimer,
    resumeTimer,
    adjustSeconds,
    skipTimer,
  } = useTimerStore();

  if (!isExpanded) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressFraction = targetSeconds > 0 ? (targetSeconds - remainingSeconds) / targetSeconds : 0;
  const strokeDashoffset = 565.48 * (1 - progressFraction);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-[#1B1C20] border border-[#3E4048] rounded-3xl p-6 shadow-2xl flex flex-col items-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={toggleExpanded}
          className="absolute top-4 right-4 p-2 text-[#A9B2AC] hover:text-[#F5F6F5] hover:bg-[#292E29] rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="text-xs font-semibold text-[#A9B2AC] uppercase tracking-wider mb-1">
          휴식 타이머 (Rest Timer)
        </span>
        <h3 className="text-lg font-bold text-[#F5F6F5] text-center mb-6">
          {exerciseName || '다음 세트 준비'}
        </h3>

        {/* Circular Progress Display */}
        <div className="relative w-52 h-52 flex items-center justify-center mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            {/* Background Track */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="transparent"
              stroke="#292E29"
              strokeWidth="10"
            />
            {/* Animated Progress Circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="transparent"
              stroke="#B4F34C"
              strokeWidth="10"
              strokeDasharray="565.48"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>

          {/* Time In Center */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="font-mono text-5xl font-extrabold text-[#F5F6F5] tracking-tight">
              {formatTime(remainingSeconds)}
            </span>
            <span className="text-xs text-[#A9B2AC] mt-1">
              목표 {Math.round(targetSeconds)}초
            </span>
          </div>
        </div>

        {/* Quick Time Adjustment Buttons */}
        <div className="grid grid-cols-4 gap-2 w-full mb-6">
          <button
            type="button"
            onClick={() => adjustSeconds(-15)}
            className="py-2 px-1 text-xs font-semibold bg-[#292E29] hover:bg-[#363D36] text-[#A9B2AC] hover:text-[#F5F6F5] rounded-xl transition-all text-center"
          >
            -15초
          </button>
          <button
            type="button"
            onClick={() => adjustSeconds(15)}
            className="py-2 px-1 text-xs font-semibold bg-[#292E29] hover:bg-[#363D36] text-[#A9B2AC] hover:text-[#F5F6F5] rounded-xl transition-all text-center"
          >
            +15초
          </button>
          <button
            type="button"
            onClick={() => adjustSeconds(30)}
            className="py-2 px-1 text-xs font-semibold bg-[#292E29] hover:bg-[#363D36] text-[#A9B2AC] hover:text-[#F5F6F5] rounded-xl transition-all text-center"
          >
            +30초
          </button>
          <button
            type="button"
            onClick={() => adjustSeconds(60)}
            className="py-2 px-1 text-xs font-semibold bg-[#292E29] hover:bg-[#363D36] text-[#A9B2AC] hover:text-[#F5F6F5] rounded-xl transition-all text-center"
          >
            +60초
          </button>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center gap-3 w-full">
          {isRunning ? (
            <button
              type="button"
              onClick={pauseTimer}
              className="flex-1 min-h-[48px] flex items-center justify-center gap-2 bg-[#292E29] hover:bg-[#363D36] text-[#F5F6F5] font-bold rounded-2xl transition-all"
            >
              <Pause className="w-5 h-5 fill-current text-[#B4F34C]" />
              일시정지
            </button>
          ) : (
            <button
              type="button"
              onClick={resumeTimer}
              className="flex-1 min-h-[48px] flex items-center justify-center gap-2 bg-[#B4F34C] hover:bg-[#A0DE3C] text-[#101510] font-bold rounded-2xl transition-all shadow-lg shadow-[#B4F34C]/20"
            >
              <Play className="w-5 h-5 fill-current" />
              타이머 재개
            </button>
          )}

          <button
            type="button"
            onClick={skipTimer}
            className="min-h-[48px] px-4 flex items-center justify-center gap-2 bg-[#292E29] hover:bg-[#363D36] text-[#A9B2AC] hover:text-[#F5F6F5] font-semibold rounded-2xl transition-all"
          >
            <FastForward className="w-5 h-5" />
            건너뛰기
          </button>
        </div>

        {/* Background sync note */}
        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-[#A9B2AC]">
          <Info className="w-3.5 h-3.5 text-[#B4F34C] shrink-0" />
          <span>화면 이동이나 브라우저 재접속 시에도 종료 시각이 유지됩니다.</span>
        </div>
      </div>
    </div>
  );
};
