import React from 'react';
import { useTimerStore } from '../../stores/useTimerStore';
import { useNavigationStore } from '../../stores/useNavigationStore';
import { Play, Pause, FastForward, Plus, Minus, Bell, X } from 'lucide-react';

export const FloatingTimerBar: React.FC = () => {
  const { activeTab } = useNavigationStore();
  const {
    isRunning,
    remainingSeconds,
    targetSeconds,
    exerciseName,
    isCompletedAlert,
    pauseTimer,
    resumeTimer,
    adjustSeconds,
    skipTimer,
    dismissAlert,
    toggleExpanded,
  } = useTimerStore();

  // If in active workout screen, the timer is rendered at the top of the workout screen
  if (activeTab === 'workout') {
    return null;
  }

  if (!isRunning && remainingSeconds === 0 && !isCompletedAlert) {
    return null;
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent =
    targetSeconds > 0 ? Math.min(100, Math.max(0, ((targetSeconds - remainingSeconds) / targetSeconds) * 100)) : 0;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-96 z-40">
      {/* Rest complete notification banner */}
      {isCompletedAlert && (
        <div className="mb-2 p-3 bg-[#B4F34C] text-[#101510] rounded-2xl shadow-xl flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 fill-current animate-pulse" />
            <span className="font-bold text-sm">휴식 시간 종료! 다음 세트를 시작하세요.</span>
          </div>
          <button
            type="button"
            onClick={dismissAlert}
            className="p-1 hover:bg-black/10 rounded-lg transition-all"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Persistent Timer Floating Capsule */}
      {(isRunning || remainingSeconds > 0) && (
        <div className="bg-[#303137]/95 backdrop-blur-md border border-[#3E4048] rounded-2xl p-3 shadow-2xl flex flex-col gap-2">
          {/* Progress Bar Line */}
          <div className="w-full bg-[#42434A] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#B4F34C] h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            {/* Info and Time */}
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={toggleExpanded}
            >
              <div className="w-8 h-8 rounded-xl bg-[#292E29] border border-[#363D36] flex items-center justify-center font-mono font-bold text-sm text-[#B4F34C]">
                {formatTime(remainingSeconds)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#F5F6F5] truncate max-w-[120px]">
                  {exerciseName || '휴식 중'}
                </span>
                <span className="text-[10px] text-[#A9B2AC]">터치하여 세부 조절</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => adjustSeconds(-15)}
                className="p-2 text-xs font-medium bg-[#292E29] hover:bg-[#363D36] text-[#A9B2AC] hover:text-[#F5F6F5] rounded-xl transition-all"
                title="15초 감소"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => adjustSeconds(15)}
                className="p-2 text-xs font-medium bg-[#292E29] hover:bg-[#363D36] text-[#A9B2AC] hover:text-[#F5F6F5] rounded-xl transition-all"
                title="15초 증가"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              {isRunning ? (
                <button
                  type="button"
                  onClick={pauseTimer}
                  className="p-2 bg-[#292E29] hover:bg-[#363D36] text-[#B4F34C] rounded-xl transition-all"
                  title="일시정지"
                >
                  <Pause className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resumeTimer}
                  className="p-2 bg-[#B4F34C] hover:bg-[#A0DE3C] text-[#101510] rounded-xl transition-all font-bold"
                  title="재개"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
              )}

              <button
                type="button"
                onClick={skipTimer}
                className="p-2 text-[#A9B2AC] hover:text-[#F5F6F5] bg-[#292E29] hover:bg-[#363D36] rounded-xl transition-all"
                title="건너뛰기"
              >
                <FastForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
