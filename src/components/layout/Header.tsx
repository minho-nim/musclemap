import React from 'react';
import { useNavigationStore } from '../../stores/useNavigationStore';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { Settings, Zap, Play } from 'lucide-react';

export const Header: React.FC = () => {
  const { openSettings, setActiveTab, activeTab } = useNavigationStore();
  const { activeSession } = useWorkoutStore();

  if (activeTab === 'workout' && activeSession) {
    return null;
  }

  return (
    <header className="md:hidden sticky top-0 left-0 right-0 h-14 bg-[#1B1C20]/90 backdrop-blur-md border-b border-[#3E4048] z-20 px-4 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-[#B4F34C] flex items-center justify-center text-[#101510] shadow-sm font-black">
          <Zap className="w-5 h-5 stroke-[3]" />
        </div>
        <span className="font-extrabold text-base tracking-tight text-[#F5F6F5]">
          MuscleMap
        </span>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2">
        {activeSession && (
          <button
            type="button"
            onClick={() => setActiveTab('workout')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#B4F34C] text-[#101510] rounded-xl text-xs font-extrabold shadow-sm animate-pulse-subtle"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>운동 이어하기</span>
          </button>
        )}

        <button
          type="button"
          onClick={openSettings}
          className="p-2 text-[#A9B2AC] hover:text-[#F5F6F5] hover:bg-[#1D211E] rounded-xl transition-all"
          aria-label="설정"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
