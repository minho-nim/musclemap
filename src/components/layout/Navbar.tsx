import React from 'react';
import { useNavigationStore, NavigationTab } from '../../stores/useNavigationStore';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { Home, Dumbbell, Activity, BarChart2 } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, closeExerciseDetail } = useNavigationStore();
  const { activeSession } = useWorkoutStore();

  const handleTabClick = (tab: NavigationTab) => {
    closeExerciseDetail();
    setActiveTab(tab);
  };

  const navItems: { tab: NavigationTab; label: string; icon: React.ElementType }[] = [
    { tab: 'home', label: '나의 운동', icon: Home },
    { tab: 'workout', label: '운동', icon: Dumbbell },
    { tab: 'muscle', label: '근육', icon: Activity },
    { tab: 'analytics', label: '분석', icon: BarChart2 },
  ];

  if (activeTab === 'workout' && activeSession) {
    return null;
  }

  return (
    <nav aria-label="주 메뉴" className="md:hidden fixed bottom-0 left-0 right-0 h-[calc(4rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-[#1B1C20]/95 backdrop-blur-md border-t border-[#3E4048] z-30 px-2 flex items-center justify-around">
      {navItems.map(({ tab, label, icon: Icon }) => {
        const isActive = activeTab === tab;
        const isWorkoutActive = tab === 'workout' && !!activeSession;

        return (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabClick(tab)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 transition-all relative ${
              isActive ? 'text-[#B4F34C]' : 'text-[#A9B2AC] hover:text-[#F5F6F5]'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5 stroke-[2.2]" />
              {isWorkoutActive && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#B4F34C] animate-pulse" />
              )}
            </div>
            <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'font-bold' : ''}`}>
              {label}
            </span>
            {isActive && (
              <span className="absolute bottom-1 w-6 h-0.5 rounded-full bg-[#B4F34C]" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
