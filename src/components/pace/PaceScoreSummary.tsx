import React from 'react';
import { PaceScore } from '../../types';
import { Trophy, Zap, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface PaceScoreSummaryProps {
  score: PaceScore;
}

export const PaceScoreSummary: React.FC<PaceScoreSummaryProps> = ({ score }) => {
  const { generalScore, challengeScore, generalBreakdown, challengeBreakdown } = score;

  return (
    <div className="w-full space-y-4 text-left">
      {/* General Workout Score Card */}
      <div className="bg-[#252B27] border border-[#363D36] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-extrabold text-[#F5F6F5]">일반 운동 점수</h4>
          </div>

          {generalScore !== null ? (
            <span className="text-xl font-black font-mono text-[#B4F34C]">
              {generalScore} / 100점
            </span>
          ) : (
            <span className="text-xs font-bold text-[#A9B2AC]">평가 데이터 부족</span>
          )}
        </div>

        {/* Breakdown Progress Bars */}
        <div className="space-y-2 pt-2 border-t border-[#363D36]/80 text-xs">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-[#A9B2AC]">목표 세트 달성</span>
              <span className="font-bold text-[#F5F6F5]">
                {generalBreakdown.targetSetsScore} / 50점
              </span>
            </div>
            <div className="w-full bg-[#1D211E] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#B4F34C] h-full"
                style={{ width: `${(generalBreakdown.targetSetsScore / 50) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-[#A9B2AC]">기록 완성도</span>
              <span className="font-bold text-[#F5F6F5]">
                {generalBreakdown.recordCompletenessScore} / 25점
              </span>
            </div>
            <div className="w-full bg-[#1D211E] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full"
                style={{ width: `${(generalBreakdown.recordCompletenessScore / 25) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-[#A9B2AC]">
            <span>
              종목 달성: <strong className="text-[#F5F6F5]">{generalBreakdown.plannedExercisesScore}/15점</strong>
            </span>
            <span>
              세션 마무리: <strong className="text-[#F5F6F5]">{generalBreakdown.sessionFinishScore}/10점</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Pace Challenge Score Card (if Pace Mode was used) */}
      {challengeScore !== null && (
        <div className="bg-[#252B27] border border-[#363D36] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#B4F34C]" />
              <h4 className="text-sm font-extrabold text-[#F5F6F5]">페이스 챌린지 점수</h4>
            </div>

            <span className="text-xl font-black font-mono text-[#B4F34C]">
              {challengeScore} / 100점
            </span>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#363D36]/80 text-xs">
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-[#A9B2AC]">시작 버튼 정시 실행</span>
                <span className="font-bold text-[#F5F6F5]">
                  {challengeBreakdown.startButtonScore} / 35점
                </span>
              </div>
              <div className="w-full bg-[#1D211E] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#B4F34C] h-full"
                  style={{ width: `${(challengeBreakdown.startButtonScore / 35) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-[#A9B2AC]">휴식 후 재시작 타이밍</span>
                <span className="font-bold text-[#F5F6F5]">
                  {challengeBreakdown.restartTimingScore} / 30점
                </span>
              </div>
              <div className="w-full bg-[#1D211E] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full"
                  style={{ width: `${(challengeBreakdown.restartTimingScore / 30) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-[#A9B2AC]">
              <span>
                준비 카운트다운: <strong className="text-[#F5F6F5]">{challengeBreakdown.prepCountdownScore}/15점</strong>
              </span>
              <span>
                타이머 흐름 유지: <strong className="text-[#F5F6F5]">{challengeBreakdown.flowScore}/20점</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimers */}
      <div className="p-3 bg-[#1D211E] rounded-xl border border-[#363D36] text-[11px] text-[#A9B2AC] flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-[#B4F34C] shrink-0 mt-0.5" />
        <span>
          일반 운동 점수와 챌린지 점수는 운동 수행의 충실도와 타이밍 일관성을 나타내는 재미 요소이며, 개인의 신체 건강 상태나 운동 능력을 진단하는 수치가 아닙니다.
        </span>
      </div>
    </div>
  );
};
