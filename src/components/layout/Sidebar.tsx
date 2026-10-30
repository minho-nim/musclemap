import React from 'react';
import { useNavigationStore, NavigationTab } from '../../stores/useNavigationStore';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { Home, Dumbbell, Activity, BarChart2, Settings, Zap } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, closeExerciseDetail, openSettings } = useNavigationStore();
  const { activeSession } = useWorkoutStore();

  const handleTabClick = (tab: NavigationTab) => {
    closeExerciseDetail();
    setActiveTab(tab);
  };

  const navItems: { tab: NavigationTab; label: string; icon: React.ElementType }[] = [
    { tab: 'home', label: '나의 운동', icon: Home },
    { tab: 'workout', label: '운동 기록', icon: Dumbbell },
    { tab: 'muscle', label: '근육 지도', icon: Activity },
    { tab: 'analytics', label: '운동 분석', icon: BarChart2 },
  ];

  if (activeTab === 'workout' && activeSession) {
    return null;
  }

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-[#1B1C20] border-r border-[#3E4048] p-5 justify-between select-none shrink-0">
      <div className="space-y-6">
        {/* App Logo */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-2xl bg-[#B4F34C] flex items-center justify-center text-[#101510] shadow-md shadow-[#B4F34C]/20 font-black">
            <Zap className="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#F5F6F5] tracking-tight">
              MuscleMap
            </h1>
            <span className="text-[10px] font-bold text-[#B4F34C] tracking-wider uppercase">
              v1.0.0 Web
            </span>
          </div>
        </div>

        {/* Active Workout Banner if session in progress */}
        {activeSession && (
          <div
            onClick={() => handleTabClick('workout')}
            className="p-3 bg-[#B4F34C]/15 border border-[#B4F34C]/40 rounded-2xl cursor-pointer hover:bg-[#B4F34C]/25 transition-all"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-[#B4F34C]">
              <span className="w-2 h-2 rounded-full bg-[#B4F34C] animate-pulse" />
              <span>운동 진행 중</span>
            </div>
            <p className="text-sm font-extrabold text-[#F5F6F5] truncate mt-0.5">
              {activeSession.name}
            </p>
            <span className="text-[11px] text-[#A9B2AC]">클릭하여 이어하기 →</span>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map(({ tab, label, icon: Icon }) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabClick(tab)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full min-h-[48px] px-4 rounded-2xl flex items-center gap-3.5 text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-[#B4F34C] text-[#101510] shadow-sm font-extrabold'
                    : 'text-[#A9B2AC] hover:text-[#F5F6F5] hover:bg-[#252B27]'
                }`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Settings at Bottom */}
      <div className="pt-4 border-t border-[#363D36]">
        <button
          type="button"
          onClick={openSettings}
          className="w-full min-h-[44px] px-4 rounded-xl flex items-center gap-3 text-xs font-bold text-[#A9B2AC] hover:text-[#F5F6F5] hover:bg-[#252B27] transition-all"
        >
          <Settings className="w-4 h-4" />
          <span>설정 및 백업</span>
        </button>
      </div>
    </aside>
  );
};
