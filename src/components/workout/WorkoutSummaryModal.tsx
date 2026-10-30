import React, { useState, useEffect } from 'react';
import { WorkoutSummaryResult, useWorkoutStore } from '../../stores/useWorkoutStore';
import { useNavigationStore } from '../../stores/useNavigationStore';
import { PaceScoreSummary } from '../pace/PaceScoreSummary';
import { calculateSessionStyleXp, StyleXpSummary } from '../../engines/styleXpEngine';
import { WorkoutShareModal } from './WorkoutShareModal';
import { Exercise } from '../../types';
import { db } from '../../db';
import {
  Trophy,
  Clock,
  Dumbbell,
  Layers,
  Check,
  ArrowRight,
  BookmarkPlus,
  Zap,
  Sparkles,
  Share2,
} from 'lucide-react';

interface WorkoutSummaryModalProps {
  summary: WorkoutSummaryResult;
  exercises?: Exercise[];
  onClose: () => void;
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({
  summary,
  exercises = [],
  onClose,
}) => {
  const { setActiveTab } = useNavigationStore();
  const { saveSessionAsRoutine } = useWorkoutStore();

  const [routineName, setRoutineName] = useState('');
  const [isSavedAsRoutine, setIsSavedAsRoutine] = useState(false);
  const [showRoutineNameInput, setShowRoutineNameInput] = useState(false);
  const [styleXp, setStyleXp] = useState<StyleXpSummary | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [loadedExercises, setLoadedExercises] = useState<Exercise[]>(exercises);

  useEffect(() => {
    if (loadedExercises.length === 0) {
      db.exercises.toArray().then((all) => setLoadedExercises(all));
    }
  }, [loadedExercises.length]);

  // Compute Style XP without any confetti fanfare
  useEffect(() => {
    const xpSummary = calculateSessionStyleXp(summary.session, summary.sets, true);
    setStyleXp(xpSummary);
  }, [summary]);

  const handleGoToMuscleMap = () => {
    onClose();
    setActiveTab('muscle');
  };

  const handleGoToAnalytics = () => {
    onClose();
    setActiveTab('analytics');
  };

  const handleSaveAsRoutine = async () => {
    const finalName = routineName.trim() || `${new Date().toLocaleDateString('ko-KR')} 자유 운동 루틴`;
    await saveSessionAsRoutine(finalName);
    setIsSavedAsRoutine(true);
    setShowRoutineNameInput(false);
  };

  const isFreeWorkout = !summary.session.routineId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#1B1C20] border border-[#3E4048] rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center my-6 max-h-[90vh] overflow-y-auto">
        {/* Clean Trophy Icon without fanfare */}
        <div className="w-14 h-14 rounded-2xl bg-[#B4F34C]/15 border border-[#B4F34C]/40 flex items-center justify-center mb-3 text-[#B4F34C] shrink-0">
          <Trophy className="w-7 h-7 stroke-[2.5]" />
        </div>

        <span className="text-[11px] font-black text-[#B4F34C] uppercase tracking-wider mb-0.5">
          Workout Complete
        </span>
        <h2 className="text-2xl font-black text-[#F4F4F5] mb-1">
          오늘 운동 완료
        </h2>
        <p className="text-xs text-[#A9AAB3] mb-5">
          모든 세트 기록이 안전하게 저장되고 근육 지도와 통계에 반영되었습니다.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 w-full mb-4">
          <div className="bg-[#303137] border border-[#3E4048] rounded-2xl p-3 flex flex-col items-center">
            <Clock className="w-4 h-4 text-[#B4F34C] mb-1" />
            <span className="text-[11px] text-[#A9AAB3]">운동 시간</span>
            <span className="text-base font-black text-[#F4F4F5]">
              {summary.durationMinutes}분
            </span>
          </div>

          <div className="bg-[#303137] border border-[#3E4048] rounded-2xl p-3 flex flex-col items-center">
            <Layers className="w-4 h-4 text-[#B4F34C] mb-1" />
            <span className="text-[11px] text-[#A9AAB3]">완료 세트</span>
            <span className="text-base font-black text-[#F4F4F5]">
              {summary.completedSetsCount}세트
            </span>
          </div>

          <div className="bg-[#303137] border border-[#3E4048] rounded-2xl p-3 flex flex-col items-center">
            <Dumbbell className="w-4 h-4 text-[#B4F34C] mb-1" />
            <span className="text-[11px] text-[#A9AAB3]">총 볼륨</span>
            <span className="text-base font-black text-[#F4F4F5]">
              {Math.round(summary.totalVolumeKg).toLocaleString()}kg
            </span>
          </div>
        </div>

        {/* Style Gamification XP Card (Section 8) */}
        {styleXp && styleXp.earnedSessionXp > 0 && (
          <div className="w-full mb-4 p-3.5 bg-[#26282E] border border-[#3E4048] rounded-2xl text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-[#F4F4F5] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#B4F34C]" />
                운동 방식 보너스 XP
              </span>
              <span className="text-xs font-black text-[#B4F34C]">
                +{styleXp.awardedXp} XP 획득
              </span>
            </div>

            <div className="space-y-1 mb-2">
              {styleXp.breakdown.map((item) => (
                <div key={item.styleId} className="flex items-center justify-between text-[11px] text-[#A9AAB3]">
                  <span>{item.nameKo} × {item.count}</span>
                  <span className="font-bold text-[#F4F4F5]">+{item.totalXp} XP</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#3E4048]/60 flex items-center justify-between text-[10px] text-[#A9AAB3]">
              <span>오늘 누적: {styleXp.todayTotalXp} / 15 XP (일일 상한 15)</span>
              <span>※ 성과 점수와 분리된 게이미피케이션 요소입니다.</span>
            </div>
          </div>
        )}

        {/* Pace Mode & General Scoring Summary */}
        {summary.score && (
          <div className="w-full mb-4">
            <PaceScoreSummary score={summary.score} />
          </div>
        )}

        {/* Save as Routine Option (for Free Workouts) */}
        {isFreeWorkout && (
          <div className="w-full p-3.5 bg-[#303137] border border-[#3E4048] rounded-2xl mb-4 text-left">
            {!isSavedAsRoutine ? (
              <div>
                {!showRoutineNameInput ? (
                  <button
                    type="button"
                    onClick={() => setShowRoutineNameInput(true)}
                    className="w-full py-2 bg-[#42434A] hover:bg-[#4E5058] text-xs font-bold text-[#F4F4F5] rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <BookmarkPlus className="w-4 h-4 text-[#B4F34C]" />
                    <span>이 운동을 새 루틴으로 저장하기</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#F4F4F5]">새 루틴 이름:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={routineName}
                        onChange={(e) => setRoutineName(e.target.value)}
                        placeholder="예: 나만의 가슴·삼두 루틴"
                        className="flex-1 h-10 px-3 bg-[#1B1C20] border border-[#3E4048] rounded-xl text-xs text-[#F4F4F5]"
                      />
                      <button
                        type="button"
                        onClick={handleSaveAsRoutine}
                        className="px-3.5 h-10 bg-[#B4F34C] text-[#101510] font-bold text-xs rounded-xl shrink-0"
                      >
                        저장
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-[#B4F34C]">
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>새 루틴으로 저장되었습니다! (루틴 목록에서 확인 가능)</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          {/* Share Workout Record CTA (Planfit image_ba2beac0.png) */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="w-full min-h-[50px] bg-[#4DE3A3] hover:bg-[#3CD494] text-[#101510] font-black rounded-2xl transition-all shadow-lg shadow-[#4DE3A3]/25 flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5 stroke-[2.5]" />
            <span>운동 기록 공유 카드 만들기 (SNS)</span>
          </button>

          <button
            type="button"
            onClick={handleGoToMuscleMap}
            className="w-full min-h-[46px] bg-[#B4F34C] hover:bg-[#A0DE3C] text-[#101510] font-black rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>근육 지도에서 변화 확인</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={handleGoToAnalytics}
            className="w-full min-h-[44px] bg-[#303137] hover:bg-[#3A3B43] text-[#F4F4F5] font-bold text-xs rounded-2xl border border-[#3E4048] transition-all flex items-center justify-center gap-2"
          >
            <span>분석 및 균형도 확인</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#A9AAB3] hover:text-[#F4F4F5] py-2 transition-colors"
          >
            홈으로 닫기
          </button>
        </div>
      </div>

      {/* Workout Share Modal */}
      {isShareModalOpen && (
        <WorkoutShareModal
          session={summary.session}
          sets={summary.sets}
          exercises={loadedExercises}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  );
};
