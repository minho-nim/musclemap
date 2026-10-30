import React, { useState } from 'react';
import { MuscleId, MuscleMapMode } from '../../types';
import { AnatomicalSvgFront } from './AnatomicalSvgFront';
import { AnatomicalSvgBack } from './AnatomicalSvgBack';
import { MUSCLE_DEFINITIONS, ALL_MUSCLE_IDS } from '../../data/muscles';
import { RotateCw, CheckCircle2 } from 'lucide-react';

interface MuscleMapProps {
  selectedMuscle: MuscleId | null;
  onSelectMuscle?: (muscleId: MuscleId) => void;
  mode?: MuscleMapMode;
  primaryMuscles?: MuscleId[];
  secondaryMuscles?: MuscleId[];
  muscleColors?: Record<string, { fill: string; stroke: string; opacity: number }>;
  isCompact?: boolean;
  showSelectorList?: boolean;
  dualView?: boolean;
}

export const MuscleMap: React.FC<MuscleMapProps> = ({
  selectedMuscle,
  onSelectMuscle,
  mode = 'explore',
  primaryMuscles = [],
  secondaryMuscles = [],
  muscleColors = {},
  isCompact = false,
  showSelectorList = true,
  dualView = false,
}) => {
  // If target exercise has primarily back muscles in guide mode, default to back
  const shouldDefaultToBack =
    mode === 'guide' &&
    primaryMuscles.some((m) => MUSCLE_DEFINITIONS[m]?.view === 'back') &&
    !primaryMuscles.some((m) => MUSCLE_DEFINITIONS[m]?.view === 'front');

  const [currentView, setCurrentView] = useState<'front' | 'back'>(
    shouldDefaultToBack ? 'back' : 'front'
  );

  const toggleView = () => {
    setCurrentView((prev) => (prev === 'front' ? 'back' : 'front'));
  };

  const selectedDef = selectedMuscle ? MUSCLE_DEFINITIONS[selectedMuscle] : null;

  return (
    <div className={`relative flex flex-col items-center w-full ${isCompact ? '' : 'p-2'}`}>
      {/* Front / Back Toggle Controls (Hidden if dualView is active) */}
      {!dualView && (
        <div className="flex items-center justify-between w-full max-w-[320px] mb-2 px-1">
          <div className="flex items-center bg-[#1D211E] border border-[#363D36] rounded-xl p-1 shadow-inner">
            <button
              type="button"
              onClick={() => setCurrentView('front')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currentView === 'front'
                  ? 'bg-[#B4F34C] text-[#101510] shadow-sm font-bold'
                  : 'text-[#A9B2AC] hover:text-[#F5F6F5]'
              }`}
            >
              전면 (Front)
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('back')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currentView === 'back'
                  ? 'bg-[#B4F34C] text-[#101510] shadow-sm font-bold'
                  : 'text-[#A9B2AC] hover:text-[#F5F6F5]'
              }`}
            >
              후면 (Back)
            </button>
          </div>

          <button
            type="button"
            onClick={toggleView}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#A9B2AC] bg-[#1D211E] hover:bg-[#252B27] border border-[#363D36] rounded-xl transition-all"
            title="앞뒤 전환"
          >
            <RotateCw className="w-3.5 h-3.5 text-[#B4F34C]" />
            <span>반전</span>
          </button>
        </div>
      )}

      {/* SVG Canvas Container */}
      {dualView ? (
        <div className="w-full max-w-lg flex items-center justify-center gap-2">
          <div className="flex-1 min-w-0 flex flex-col items-center rounded-2xl bg-[#24252A] border border-[#3E4048] pt-3 pb-2">
            <span className="text-[11px] font-semibold text-[#A9AAB3] mb-2">앞면</span>
            <div className="w-full max-w-[190px]">
              <AnatomicalSvgFront
                selectedMuscle={selectedMuscle}
                onSelectMuscle={onSelectMuscle}
                mode={mode}
                primaryMuscles={primaryMuscles}
                secondaryMuscles={secondaryMuscles}
                muscleColors={muscleColors}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col items-center rounded-2xl bg-[#24252A] border border-[#3E4048] pt-3 pb-2">
            <span className="text-[11px] font-semibold text-[#A9AAB3] mb-2">뒷면</span>
            <div className="w-full max-w-[190px]">
              <AnatomicalSvgBack
                selectedMuscle={selectedMuscle}
                onSelectMuscle={onSelectMuscle}
                mode={mode}
                primaryMuscles={primaryMuscles}
                secondaryMuscles={secondaryMuscles}
                muscleColors={muscleColors}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Single View */
        <div
          className={`relative w-full flex items-center justify-center bg-[#101213] rounded-2xl border border-[#252B27] overflow-hidden ${
            isCompact ? 'max-w-[220px] py-1' : 'max-w-[340px] py-3'
          }`}
        >
          {currentView === 'front' ? (
            <AnatomicalSvgFront
              selectedMuscle={selectedMuscle}
              onSelectMuscle={onSelectMuscle}
              mode={mode}
              primaryMuscles={primaryMuscles}
              secondaryMuscles={secondaryMuscles}
              muscleColors={muscleColors}
            />
          ) : (
            <AnatomicalSvgBack
              selectedMuscle={selectedMuscle}
              onSelectMuscle={onSelectMuscle}
              mode={mode}
              primaryMuscles={primaryMuscles}
              secondaryMuscles={secondaryMuscles}
              muscleColors={muscleColors}
            />
          )}

          {/* Legend indicator overlay */}
          {mode === 'guide' && (
            <div className="absolute bottom-2 left-2 flex flex-col gap-1 bg-[#101213]/90 backdrop-blur-sm p-1.5 rounded-lg border border-[#363D36] text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF806B]"></span>
                <span className="text-[#F5F6F5]">주동근 (Primary)</span>
              </div>
              {secondaryMuscles.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E9AB87]"></span>
                  <span className="text-[#A9B2AC]">보조근 (Secondary)</span>
                </div>
              )}
            </div>
          )}

          {mode === 'explore' && selectedDef && (
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between bg-[#1D211E]/95 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-[#363D36] text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF806B] shadow-sm"></span>
                <span className="font-bold text-[#F5F6F5]">{selectedDef.nameKo}</span>
              </div>
              <span className="text-[10px] text-[#A9B2AC]">{selectedDef.nameEn}</span>
            </div>
          )}
        </div>
      )}

      {mode === 'guide' && (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-3 text-[10px] text-[#A9AAB3]" aria-label="근육 색상 안내">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#FF806B]" />주요 근육</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#E9AB87]" />보조 근육</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#727781]" />다른 부위</span>
        </div>
      )}

      {/* Accessible Quick List Dropdown/Chips for Touch Fallback */}
      {!isCompact && showSelectorList && onSelectMuscle && (
        <div className="w-full max-w-[340px] mt-2.5">
          <p className="text-[11px] text-[#A9B2AC] mb-1.5 px-0.5">
            터치하기 어려운 부위는 아래 목록에서 직접 선택하세요:
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-[88px] overflow-y-auto p-1 bg-[#151917] rounded-xl border border-[#252B27]">
            {ALL_MUSCLE_IDS.map((id) => {
              const def = MUSCLE_DEFINITIONS[id];
              const isSelected = selectedMuscle === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectMuscle(id)}
                  className={`text-[11px] px-2 py-1 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-[#FF806B] text-[#101510] font-bold shadow-sm'
                      : 'bg-[#1D211E] text-[#A9B2AC] hover:text-[#F5F6F5] border border-[#363D36]'
                  }`}
                >
                  {def.nameKo.split(' (')[0]}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
