import React, { useState, useEffect } from 'react';
import { WorkoutStyleId, WorkoutStyleDefinition } from '../../types';
import { WORKOUT_STYLES, WORKOUT_STYLES_MAP } from '../../data/workoutStyles';
import { db } from '../../db';
import {
  X,
  Star,
  ChevronDown,
  ChevronUp,
  Check,
  Zap,
  Info,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

interface WorkoutStyleSelectorProps {
  currentStyleId: WorkoutStyleId;
  onSelectStyle: (styleId: WorkoutStyleId) => void;
  onClose: () => void;
}

export const WorkoutStyleSelector: React.FC<WorkoutStyleSelectorProps> = ({
  currentStyleId,
  onSelectStyle,
  onClose,
}) => {
  const [favorites, setFavorites] = useState<WorkoutStyleId[]>([]);
  const [recentStyles, setRecentStyles] = useState<WorkoutStyleId[]>([]);
  const [expandedId, setExpandedId] = useState<WorkoutStyleId | null>(null);

  useEffect(() => {
    async function loadPreferences() {
      const settings = await db.settings.get('user_default');
      if (settings) {
        setFavorites(settings.favoriteStyles || []);
        setRecentStyles(settings.recentStyles || []);
      }
    }
    loadPreferences();
  }, []);

  const toggleFavorite = async (e: React.MouseEvent, styleId: WorkoutStyleId) => {
    e.stopPropagation();
    const isFav = favorites.includes(styleId);
    const newFavorites = isFav
      ? favorites.filter((id) => id !== styleId)
      : [...favorites, styleId];

    setFavorites(newFavorites);
    const settings = await db.settings.get('user_default');
    if (settings) {
      await db.settings.update('user_default', { favoriteStyles: newFavorites });
    }
  };

  const handleSelect = async (styleId: WorkoutStyleId) => {
    // Record into recent styles (max 3, unique)
    const updatedRecents = [styleId, ...recentStyles.filter((id) => id !== styleId)].slice(0, 3);
    setRecentStyles(updatedRecents);
    const settings = await db.settings.get('user_default');
    if (settings) {
      await db.settings.update('user_default', { recentStyles: updatedRecents });
    }

    onSelectStyle(styleId);
  };

  const toggleExpand = (e: React.MouseEvent, styleId: WorkoutStyleId) => {
    e.stopPropagation();
    setExpandedId((prev) => (prev === styleId ? null : styleId));
  };

  const renderStyleCard = (style: WorkoutStyleDefinition, contextTag?: string) => {
    const isSelected = currentStyleId === style.id;
    const isFav = favorites.includes(style.id);
    const isExpanded = expandedId === style.id;

    return (
      <div
        key={`${contextTag || 'main'}-${style.id}`}
        onClick={() => handleSelect(style.id)}
        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
          isSelected
            ? 'bg-[#B4F34C]/15 border-[#B4F34C] shadow-sm'
            : 'bg-[#252B27] hover:bg-[#2C332F] border-[#363D36]'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#292E29] text-[#A9B2AC] border border-[#363D36]">
                #{style.orderIndex}
              </span>
              {isSelected && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#B4F34C] text-[#101510] flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" /> 현재 선택됨
                </span>
              )}
            </div>

            <h4 className="text-sm font-extrabold text-[#F5F6F5] mt-1 flex items-center gap-1.5">
              <span>{style.nameKo}</span>
            </h4>
            <p className="text-xs text-[#A9B2AC] mt-0.5 leading-relaxed">
              {style.shortSummary}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Favorite toggle */}
            <button
              type="button"
              onClick={(e) => toggleFavorite(e, style.id)}
              className={`p-2 rounded-xl transition-all ${
                isFav
                  ? 'text-amber-400 bg-amber-400/10'
                  : 'text-[#A9B2AC] hover:text-[#F5F6F5] hover:bg-[#292E29]'
              }`}
              title={isFav ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            >
              <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>

            {/* Expand / Details toggle */}
            <button
              type="button"
              onClick={(e) => toggleExpand(e, style.id)}
              className="p-2 text-[#A9B2AC] hover:text-[#B4F34C] hover:bg-[#292E29] rounded-xl transition-all text-xs font-semibold flex items-center gap-0.5"
              title="상세 설명 보기"
            >
              <span>{isExpanded ? '접기' : '설명'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expandable Accordion: Full Description, Example, Pros & Cons */}
        {isExpanded && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="pt-3 mt-1 border-t border-[#363D36] space-y-3 text-xs animate-fade-in"
          >
            <div>
              <span className="text-[11px] font-bold text-[#A9B2AC] block mb-1">
                📖 상세 설명
              </span>
              <p className="text-[#F5F6F5]/90 leading-relaxed bg-[#1D211E] p-2.5 rounded-xl border border-[#363D36]">
                {style.description}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#B4F34C] block mb-1">
                💡 수행 예시
              </span>
              <p className="text-[#B4F34C] font-mono text-[11px] bg-[#1D211E] p-2 rounded-xl border border-[#363D36]">
                {style.example}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-[#1D211E] p-2.5 rounded-xl border border-[#363D36]">
                <span className="text-[11px] font-bold text-emerald-400 block mb-1">
                  👍 주요 장점
                </span>
                <ul className="space-y-1 text-[#A9B2AC] text-[11px]">
                  {style.pros.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#1D211E] p-2.5 rounded-xl border border-[#363D36]">
                <span className="text-[11px] font-bold text-[#FF806B] block mb-1">
                  ⚠️ 주의점 & 단점
                </span>
                <ul className="space-y-1 text-[#A9B2AC] text-[11px]">
                  {style.cons.map((c, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#FF806B]">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] text-[#A9B2AC] bg-[#292E29]/80 p-2.5 rounded-xl">
              <span>
                <strong>기록 방식:</strong> {style.logFormat}
              </span>
              <span className="text-[#B4F34C]">
                <strong>타이머 규칙:</strong> {style.timerRule}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full sm:max-w-xl bg-[#1D211E] border-t sm:border border-[#363D36] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Mobile drag handle */}
        <div className="w-10 h-1 bg-[#363D36] rounded-full mx-auto mb-3 sm:hidden" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#363D36]">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#B4F34C]" />
            <div>
              <h3 className="text-base font-extrabold text-[#F5F6F5]">
                운동 수행 방식 선택
              </h3>
              <p className="text-[11px] text-[#A9B2AC]">
                8가지 고강도 트레이닝 기법을 선택하고 맞춤 입력 UI로 기록하세요.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#A9B2AC] hover:text-[#F5F6F5] hover:bg-[#292E29] rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 pt-3">
          {/* 1. Favorites Section (if any) */}
          {favorites.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-2 px-1">
                <Star className="w-3.5 h-3.5 fill-current" />
                즐겨찾는 운동 방식 ({favorites.length})
              </span>
              <div className="space-y-2">
                {favorites.map((fId) => {
                  const style = WORKOUT_STYLES_MAP.get(fId);
                  return style ? renderStyleCard(style, 'fav') : null;
                })}
              </div>
            </div>
          )}

          {/* 2. Recent Used Section (max 3, if any) */}
          {recentStyles.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-[#A9B2AC] uppercase tracking-wider flex items-center gap-1.5 mb-2 px-1">
                <Clock className="w-3.5 h-3.5 text-[#B4F34C]" />
                최근 사용 ({recentStyles.length})
              </span>
              <div className="space-y-2">
                {recentStyles.map((rId) => {
                  const style = WORKOUT_STYLES_MAP.get(rId);
                  return style ? renderStyleCard(style, 'recent') : null;
                })}
              </div>
            </div>
          )}

          {/* 3. All 8 Workout Styles (Fixed strict order 1-8) */}
          <div>
            <span className="text-[11px] font-bold text-[#A9B2AC] uppercase tracking-wider flex items-center gap-1.5 mb-2 px-1">
              <Layers className="w-3.5 h-3.5 text-[#B4F34C]" />
              모든 운동 방식 (고정 순서 1~8)
            </span>
            <div className="space-y-2">
              {WORKOUT_STYLES.map((style) => renderStyleCard(style, 'all'))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-[#363D36] flex items-center justify-between text-xs text-[#A9B2AC]">
          <span>기본값: 미지정 (일반 세트)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#B4F34C] text-[#101510] font-bold rounded-xl"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
