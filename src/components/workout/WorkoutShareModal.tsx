import React, { useState, useRef } from 'react';
import { WorkoutSession, WorkoutSet, Exercise } from '../../types';
import {
  ChevronLeft,
  Calendar,
  Flame,
  Clock,
  Share2,
  Download,
  Check,
  Sparkles,
  Layers,
  Dumbbell,
  X,
} from 'lucide-react';

interface WorkoutShareModalProps {
  session: WorkoutSession;
  sets: WorkoutSet[];
  exercises: Exercise[];
  onClose: () => void;
}

export const WorkoutShareModal: React.FC<WorkoutShareModalProps> = ({
  session,
  sets,
  exercises,
  onClose,
}) => {
  const [ratio, setRatio] = useState<'4:5' | '9:16'>('4:5');
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const exercisesMap = new Map(exercises.map((e) => [e.id, e]));

  // Completed sets grouped by exercise
  const exerciseSummary = session.exercises.map((se) => {
    const ex = exercisesMap.get(se.exerciseId);
    const completedSets = sets.filter(
      (s) => s.sessionId === session.id && s.exerciseId === se.exerciseId && s.isCompleted
    );
    return {
      exerciseId: se.exerciseId,
      nameKo: ex?.nameKo || '운동 종목',
      setCount: completedSets.length > 0 ? completedSets.length : se.targetSets || 1,
    };
  });

  // Calculate duration
  const startTime = new Date(session.startTime).getTime();
  const endTime = session.endTime ? new Date(session.endTime).getTime() : Date.now();
  const totalSeconds = Math.max(60, Math.floor((endTime - startTime) / 1000));

  const formatHHMMSS = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Date formatting YYYY.MM.DD
  const dateStr = new Date(session.startTime).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\. /g, '.').replace(/\.$/, '');

  // Estimated calories: roughly 6.5 kcal per workout minute + volume factor
  const totalVolumeKg = sets
    .filter((s) => s.sessionId === session.id && s.isCompleted)
    .reduce((acc, s) => acc + (s.weight || 0) * (s.reps || 0), 0);
  const estimatedCalories = Math.max(80, Math.round((totalSeconds / 60) * 6.5 + totalVolumeKg * 0.015));

  /**
   * High-Resolution Canvas Rendering Engine for PNG Export
   */
  const generateCanvasImage = async (): Promise<Blob | null> => {
    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = ratio === '4:5' ? 1350 : 1920;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background: Dark gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#1B1C20');
    bgGrad.addColorStop(1, '#141518');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Padding & Layout coordinates
    const padX = 72;
    const padTop = ratio === '4:5' ? 140 : 260;

    // Brand Logo: MuscleMap (Planfit athletic style)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 68px system-ui, -apple-system, sans-serif';
    ctx.fillText('MuscleMap', padX, padTop);

    // Inner rounded card
    const cardTop = padTop + 48;
    const cardWidth = width - padX * 2;
    const cardHeight = ratio === '4:5' ? 760 : 920;
    const cardRadius = 36;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(padX, cardTop, cardWidth, cardHeight, cardRadius);
    ctx.fillStyle = '#2C2E35';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#3C3F48';
    ctx.stroke();
    ctx.restore();

    // Inside card: Exercise list
    let itemY = cardTop + 80;
    ctx.textBaseline = 'middle';

    const maxItems = ratio === '4:5' ? 6 : 8;
    const displayedExercises = exerciseSummary.slice(0, maxItems);

    for (const item of displayedExercises) {
      // Exercise Name
      ctx.fillStyle = '#F4F4F5';
      ctx.font = '700 42px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      const cleanName = item.nameKo.length > 16 ? item.nameKo.slice(0, 15) + '...' : item.nameKo;
      ctx.fillText(cleanName, padX + 54, itemY);

      // Set count (e.g. "2 sets")
      ctx.fillStyle = '#A9AAB3';
      ctx.font = '600 36px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${item.setCount} sets`, padX + cardWidth - 54, itemY);

      itemY += 76;
    }

    if (exerciseSummary.length > maxItems) {
      ctx.fillStyle = '#A9AAB3';
      ctx.font = '500 32px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`외 ${exerciseSummary.length - maxItems}개 종목 완료`, padX + 54, itemY);
    }

    // Inside card bottom: Separator & Metrics (Date, Calories, Duration)
    const metricsY = cardTop + cardHeight - 70;
    ctx.strokeStyle = '#3E414A';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padX + 54, metricsY - 54);
    ctx.lineTo(padX + cardWidth - 54, metricsY - 54);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = '600 34px system-ui, -apple-system, sans-serif';

    // Date
    ctx.fillStyle = '#4DE3A3';
    ctx.fillText('📅', padX + 54, metricsY);
    ctx.fillStyle = '#F4F4F5';
    ctx.fillText(dateStr, padX + 110, metricsY);

    // Calories
    ctx.fillStyle = '#FF806B';
    ctx.fillText('🔥', padX + 410, metricsY);
    ctx.fillStyle = '#F4F4F5';
    ctx.fillText(`${estimatedCalories}kcal`, padX + 465, metricsY);

    // Duration
    ctx.fillStyle = '#4DE3A3';
    ctx.fillText('⏱', padX + 680, metricsY);
    ctx.fillStyle = '#F4F4F5';
    ctx.fillText(formatHHMMSS(totalSeconds), padX + 735, metricsY);

    // Bottom Watermark / Badge
    const bottomY = height - (ratio === '4:5' ? 120 : 180);
    ctx.textAlign = 'center';
    ctx.font = '700 28px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#A9AAB3';
    ctx.fillText('Smart Workout Tracking with MuscleMap', width / 2, bottomY);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95);
    });
  };

  /**
   * Share / Download Action Handler
   */
  const handleShareOrDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateCanvasImage();
      if (!blob) throw new Error('Canvas render failed');

      const fileName = `MuscleMap_${dateStr.replace(/\./g, '')}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // Try Native Web Share API if supported
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'MuscleMap 운동 기록',
          text: `오늘의 운동: ${exerciseSummary.length}개 종목 완료!`,
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        // Fallback: Trigger instant PNG download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error sharing image:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#1B1C20] border border-[#3E4048] rounded-3xl p-5 shadow-2xl flex flex-col my-auto max-h-[94vh] overflow-y-auto">
        {/* Top Bar matching image_ba2beac0.png: [<] 기록 공유 [저장] */}
        <div className="flex items-center justify-between pb-3 border-b border-[#303137]">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -ml-1 text-[#A9AAB3] hover:text-[#F4F4F5] rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <h2 className="text-base font-black text-[#F4F4F5] tracking-tight">기록 공유</h2>

          <button
            type="button"
            onClick={handleShareOrDownload}
            disabled={isGenerating}
            className="px-4 py-1.5 rounded-full bg-[#303137] hover:bg-[#3E4048] text-xs font-black text-[#F4F4F5] border border-[#4B4D56] transition-all disabled:opacity-50"
          >
            {saveSuccess ? '저장됨 ✓' : '저장'}
          </button>
        </div>

        {/* Ratio Selector Pill */}
        <div className="flex justify-center items-center gap-2 my-3">
          <button
            type="button"
            onClick={() => setRatio('4:5')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              ratio === '4:5'
                ? 'bg-[#B4F34C] text-[#101510]'
                : 'bg-[#26282E] text-[#A9AAB3] hover:text-[#F4F4F5]'
            }`}
          >
            피드 4:5
          </button>
          <button
            type="button"
            onClick={() => setRatio('9:16')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              ratio === '9:16'
                ? 'bg-[#B4F34C] text-[#101510]'
                : 'bg-[#26282E] text-[#A9AAB3] hover:text-[#F4F4F5]'
            }`}
          >
            스토리 9:16
          </button>
        </div>

        {/* Live Visual Card Preview (Planfit Style) */}
        <div
          ref={cardRef}
          className={`w-full bg-[#1B1C20] rounded-3xl p-5 border border-[#3E4048]/80 shadow-2xl flex flex-col justify-between transition-all my-2 ${
            ratio === '4:5' ? 'aspect-[4/5]' : 'aspect-[9/16]'
          }`}
        >
          {/* Logo */}
          <div className="pt-2">
            <span className="text-2xl font-black text-[#F4F4F5] tracking-tight">MuscleMap</span>
          </div>

          {/* Dark Inner Card matching image_ba2beac0.png */}
          <div className="bg-[#2B2D33] rounded-3xl p-5 border border-[#3E414A] shadow-inner my-auto flex flex-col justify-between">
            {/* Exercises List */}
            <div className="space-y-3.5 divide-y divide-[#3E414A]/40">
              {exerciseSummary.slice(0, ratio === '4:5' ? 5 : 7).map((item, idx) => (
                <div
                  key={item.exerciseId}
                  className={`flex items-center justify-between text-sm ${idx > 0 ? 'pt-3.5' : ''}`}
                >
                  <span className="font-bold text-[#F4F4F5] truncate max-w-[200px]">
                    {item.nameKo}
                  </span>
                  <span className="font-bold text-[#A9AAB3] shrink-0 font-mono">
                    {item.setCount} sets
                  </span>
                </div>
              ))}

              {exerciseSummary.length > (ratio === '4:5' ? 5 : 7) && (
                <div className="pt-2 text-xs text-[#A9AAB3] text-center">
                  외 {exerciseSummary.length - (ratio === '4:5' ? 5 : 7)}개 종목 완료
                </div>
              )}
            </div>

            {/* Bottom Meta Row: Calendar, Calories, Time */}
            <div className="pt-5 mt-5 border-t border-[#3E414A] flex items-center justify-between text-xs text-[#F4F4F5] font-bold">
              <div className="flex items-center gap-1.5 text-[#A9AAB3]">
                <Calendar className="w-4 h-4 text-[#4DE3A3]" />
                <span className="text-[#F4F4F5]">{dateStr}</span>
              </div>

              <div className="flex items-center gap-1.5 text-[#A9AAB3]">
                <Flame className="w-4 h-4 text-[#FF806B]" />
                <span className="text-[#F4F4F5]">{estimatedCalories}kcal</span>
              </div>

              <div className="flex items-center gap-1.5 text-[#A9AAB3]">
                <Clock className="w-4 h-4 text-[#4DE3A3]" />
                <span className="text-[#F4F4F5]">{formatHHMMSS(totalSeconds)}</span>
              </div>
            </div>
          </div>

          {/* Card Footer Brand Note */}
          <div className="pb-1 text-center">
            <span className="text-[10px] text-[#A9AAB3]/70 font-semibold tracking-wider">
              SMART WORKOUT TRACKING
            </span>
          </div>
        </div>

        {/* Big CTA Button matching image_ba2beac0.png: [ 이미지 공유하기 ] */}
        <div className="mt-4 pt-2">
          <button
            type="button"
            onClick={handleShareOrDownload}
            disabled={isGenerating}
            className="w-full min-h-[52px] rounded-2xl bg-[#4DE3A3] hover:bg-[#3CD494] text-[#101510] font-black text-sm tracking-wide shadow-xl shadow-[#4DE3A3]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isGenerating ? (
              <span>이미지 생성 중...</span>
            ) : saveSuccess ? (
              <>
                <Check className="w-5 h-5 stroke-[3]" />
                <span>기록 공유 완료!</span>
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5 stroke-[2.5]" />
                <span>이미지 공유하기</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
