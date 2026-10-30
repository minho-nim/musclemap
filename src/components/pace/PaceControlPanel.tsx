import React, { useState } from 'react';
import { usePaceStore } from '../../stores/usePaceStore';
import { Exercise, WorkoutSet } from '../../types';
import {
  Play,
  Pause,
  FastForward,
  Plus,
  RotateCcw,
  Check,
  Clock,
  Zap,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';

interface PaceControlPanelProps {
  exercise: Exercise;
  currentSet: WorkoutSet;
  sessionId: string;
  isLastSet: boolean;
  onSetCompleted: () => void;
  onManualRecord: () => void;
}

export const PaceControlPanel: React.FC<PaceControlPanelProps> = ({
  exercise,
  currentSet,
  sessionId,
  isLastSet,
  onSetCompleted,
  onManualRecord,
}) => {
  const {
    paceState,
    settings,
    prepRemainingSeconds,
    activeElapsedSeconds,
    restRemainingSeconds,
    restTargetSeconds,
    waitingElapsedSeconds,
    startPreparation,
    completePreparation,
    skipPreparation,
    cancelPreparation,
    finishActiveSet,
    extendRest,
    skipRest,
    startNextSet,
  } = usePaceStore();

  const [extendReason, setExtendReason] = useState<string>('추가 회복');
  const [showReasonSelector, setShowReasonSelector] = useState(false);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleStartSet = () => {
    startPreparation(sessionId, exercise.id, currentSet.id);
  };

  const handleFinishSet = () => {
    finishActiveSet(
      sessionId,
      exercise.id,
      currentSet.id,
      isLastSet,
      exercise.defaultRestSeconds || 90
    );
    onSetCompleted();
  };

  const handleExtendRestWithReason = (seconds: number, reason: string) => {
    extendRest(sessionId, seconds, reason);
    setShowReasonSelector(false);
  };

  const handleStartNext = (isExcused: boolean = false) => {
    startNextSet(sessionId, exercise.id, currentSet.id, isExcused);
  };

  return (
    <div className="bg-[#1D211E] border-2 border-[#B4F34C]/40 rounded-3xl p-5 mb-4 shadow-xl">
      {/* Top Pace Mode Indicator */}
      <div className="flex items-center justify-between pb-3 border-b border-[#363D36]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#B4F34C] animate-pulse" />
          <span className="text-xs font-black text-[#B4F34C] uppercase tracking-wider">
            Pace Mode Active
          </span>
        </div>

        <span className="text-[11px] font-mono text-[#A9B2AC]">
          상태: <strong className="text-[#F5F6F5]">{paceState}</strong>
        </span>
      </div>

      {/* 1. READY STATE */}
      {paceState === 'READY' && (
        <div className="py-4 flex flex-col items-center text-center space-y-3 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-[#B4F34C]/15 border border-[#B4F34C]/40 flex items-center justify-center text-[#B4F34C]">
            <Play className="w-6 h-6 fill-current" />
          </div>

          <div>
            <h3 className="text-base font-extrabold text-[#F5F6F5]">
              {exercise.nameKo} — {currentSet.setNumber}세트 준비 완료
            </h3>
            <p className="text-xs text-[#A9B2AC] mt-0.5">
              시작 버튼을 누르면 {settings.preparationSeconds}초 준비 카운트다운 후 세트 스톱워치가 시작됩니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-2">
            <button
              type="button"
              onClick={handleStartSet}
              className="flex-1 min-h-[52px] bg-[#B4F34C] hover:bg-[#A0DE3C] text-[#101510] font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#B4F34C]/20 transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>세트 준비 시작 ({settings.preparationSeconds}초)</span>
            </button>

            <button
              type="button"
              onClick={() => skipPreparation(sessionId)}
              className="px-4 min-h-[52px] bg-[#292E29] hover:bg-[#363D36] text-[#A9B2AC] hover:text-[#F5F6F5] font-semibold text-xs rounded-2xl border border-[#363D36] transition-all"
            >
              준비 생략 즉시 시작
            </button>
          </div>
        </div>
      )}

      {/* 2. PREPARING STATE */}
      {paceState === 'PREPARING' && (
        <div className="py-5 flex flex-col items-center text-center space-y-4 animate-fade-in">
          <span className="text-xs font-bold text-[#A9B2AC] uppercase tracking-wider">
            운동 준비 카운트다운
          </span>

          {/* Big Countdown Number */}
          <div className="w-24 h-24 rounded-full bg-[#101213] border-4 border-[#B4F34C] flex items-center justify-center shadow-xl shadow-[#B4F34C]/20">
            <span className="font-mono text-5xl font-black text-[#B4F34C] animate-pulse">
              {prepRemainingSeconds}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-[#F5F6F5]">
              {exercise.nameKo} {currentSet.setNumber}세트
            </h3>
            <p className="text-xs text-[#A9B2AC] mt-0.5">자세를 잡고 호흡을 정돈하세요.</p>
          </div>

          <div className="flex items-center gap-2 w-full pt-1">
            <button
              type="button"
              onClick={() => skipPreparation(sessionId)}
              className="flex-1 min-h-[46px] bg-[#B4F34C] hover:bg-[#A0DE3C] text-[#101510] font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
            >
              <FastForward className="w-4 h-4" />
              <span>준비 건너뛰기</span>
            </button>

            <button
              type="button"
              onClick={cancelPreparation}
              className="px-4 min-h-[46px] bg-[#292E29] hover:bg-[#363D36] text-[#A9B2AC] font-semibold text-xs rounded-xl border border-[#363D36] transition-all"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 3. ACTIVE STATE */}
      {paceState === 'ACTIVE' && (
        <div className="py-4 flex flex-col items-center text-center space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
              세트 수행 중 (Active Set)
            </span>
          </div>

          {/* Stopwatch Dial */}
          <div className="px-6 py-2.5 bg-[#101213] border border-[#363D36] rounded-2xl flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#B4F34C] animate-spin" style={{ animationDuration: '4s' }} />
            <span className="font-mono text-4xl font-black text-[#F5F6F5] tracking-tight">
              {formatSeconds(activeElapsedSeconds)}
            </span>
          </div>

          <p className="text-xs text-[#A9B2AC]">
            반복을 완벽한 자세로 수행하고 마지막 반복 후 세트 완료를 누르세요.
          </p>

          {/* Complete Set Button (56px) */}
          <button
            type="button"
            onClick={handleFinishSet}
            className="w-full min-h-[56px] bg-[#B4F34C] hover:bg-[#A0DE3C] text-[#101510] font-black text-base rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-[#B4F34C]/30 transition-all"
          >
            <Check className="w-6 h-6 stroke-[3]" />
            <span>세트 완료 (휴식 시작)</span>
          </button>
        </div>
      )}

      {/* 4. RESTING STATE */}
      {paceState === 'RESTING' && (
        <div className="py-4 flex flex-col items-center text-center space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#B4F34C]" />
            <span className="text-xs font-bold text-[#A9B2AC] uppercase tracking-wider">
              휴식 카운트다운
            </span>
          </div>

          {/* Remaining Rest Countdown */}
          <div className="font-mono text-4xl font-black text-[#F5F6F5]">
            {formatSeconds(restRemainingSeconds)}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#292E29] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#B4F34C] h-full transition-all duration-300"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(0, ((restTargetSeconds - restRemainingSeconds) / restTargetSeconds) * 100)
                )}%`,
              }}
            />
          </div>

          {/* Rest Extension Controls & Reasons */}
          <div className="space-y-2 w-full pt-1">
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleExtendRestWithReason(15, extendReason)}
                className="px-3.5 py-2 bg-[#292E29] hover:bg-[#363D36] text-xs font-bold text-[#F5F6F5] rounded-xl border border-[#363D36]"
              >
                +15초 연장
              </button>
              <button
                type="button"
                onClick={() => handleExtendRestWithReason(30, extendReason)}
                className="px-3.5 py-2 bg-[#292E29] hover:bg-[#363D36] text-xs font-bold text-[#F5F6F5] rounded-xl border border-[#363D36]"
              >
                +30초 연장
              </button>
              <button
                type="button"
                onClick={() => skipRest(sessionId)}
                className="px-3.5 py-2 bg-[#292E29] hover:bg-[#363D36] text-xs font-bold text-[#A9B2AC] hover:text-[#F5F6F5] rounded-xl border border-[#363D36]"
              >
                휴식 건너뛰기
              </button>
            </div>

            {/* Optional extension reason badge */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#A9B2AC]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B4F34C]" />
              <span>안전 및 기구 대기로 인한 연장은 감점되지 않습니다.</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. WAITING_NEXT STATE */}
      {paceState === 'WAITING_NEXT' && (
        <div className="py-4 flex flex-col items-center text-center space-y-4 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>

          <div>
            <h3 className="text-base font-extrabold text-[#F5F6F5]">
              휴식 완료! 다음 세트를 시작하세요
            </h3>
            <p className="text-xs text-[#A9B2AC] mt-0.5">
              허용 구간({settings.restartGraceSeconds}초) 내에 시작하면 페이스 보너스가 적용됩니다. (경과: {waitingElapsedSeconds}초)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <button
              type="button"
              onClick={() => handleStartNext(false)}
              className="flex-1 min-h-[52px] bg-[#B4F34C] hover:bg-[#A0DE3C] text-[#101510] font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#B4F34C]/20 transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>다음 세트 준비 시작</span>
            </button>

            <button
              type="button"
              onClick={() => handleStartNext(true)}
              className="px-3.5 min-h-[52px] bg-[#292E29] hover:bg-[#363D36] text-[#A9B2AC] hover:text-[#F5F6F5] text-xs font-bold rounded-2xl border border-[#363D36] transition-all"
              title="기구 대기나 물 마시기 등으로 지연된 경우 감점 없이 시작"
            >
              기구 대기 (감점 제외)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
