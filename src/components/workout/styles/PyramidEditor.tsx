import React from 'react';
import { PyramidPattern } from '../../../types';
import { TrendingUp, TrendingDown, Triangle, Sliders } from 'lucide-react';

interface PyramidEditorProps {
  currentPattern: PyramidPattern;
  onApplyPattern: (pattern: PyramidPattern) => void;
}

export const PyramidEditor: React.FC<PyramidEditorProps> = ({
  currentPattern,
  onApplyPattern,
}) => {
  const patterns: { id: PyramidPattern; label: string; desc: string; icon: React.ElementType }[] = [
    {
      id: 'ascending',
      label: '상승형 (Ascending)',
      desc: '중량 점진적 증가 ↑, 횟수 감소 ↓ (예: 40kg×15 → 50kg×12 → 60kg×8 → 70kg×5)',
      icon: TrendingUp,
    },
    {
      id: 'descending',
      label: '하강형 (Descending)',
      desc: '고중량부터 시작하여 점진적 감량 ↓ (역피라미드)',
      icon: TrendingDown,
    },
    {
      id: 'triangle',
      label: '왕복형 (Triangle)',
      desc: '상승 후 다시 하강하여 워밍업과 고반복 펌핑 결합',
      icon: Triangle,
    },
    {
      id: 'custom',
      label: '사용자 정의',
      desc: '직접 자유롭게 세트별 중량과 반복을 설정',
      icon: Sliders,
    },
  ];

  return (
    <div className="bg-[#1D211E] border border-[#363D36] rounded-2xl p-3.5 space-y-2 mb-3">
      <div className="flex items-center justify-between pb-1.5 border-b border-[#363D36]/80 text-xs">
        <span className="font-extrabold text-[#B4F34C] flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4" />
          피라미드세트 패턴 설정
        </span>
        <span className="text-[11px] text-[#A9B2AC]">원클릭 자동 중량·반복 배분</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {patterns.map((p) => {
          const Icon = p.icon;
          const isSelected = currentPattern === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onApplyPattern(p.id)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#B4F34C]/15 border-[#B4F34C] text-[#F5F6F5]'
                  : 'bg-[#252B27] hover:bg-[#2C332F] border-[#363D36] text-[#A9B2AC]'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#B4F34C]' : ''}`} />
                <span className="text-xs font-bold text-[#F5F6F5]">{p.label.split(' (')[0]}</span>
              </div>
              <span className="text-[10px] text-[#A9B2AC] line-clamp-1">{p.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
