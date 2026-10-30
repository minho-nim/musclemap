import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Routine, WorkoutSession, Exercise } from '../types';
import { useWorkoutStore } from '../stores/useWorkoutStore';
import { useNavigationStore } from '../stores/useNavigationStore';
import { ActiveWorkout } from '../components/workout/ActiveWorkout';
import { RoutineList } from '../components/routine/RoutineList';
import { Dumbbell, Plus, History, Play, CheckCircle2 } from 'lucide-react';

interface WorkoutPageProps {
  exercises: Exercise[];
}

export const WorkoutPage: React.FC<WorkoutPageProps> = ({ exercises }) => {
  const { activeSession, startFreeWorkout } = useWorkoutStore();
  const { openRoutineEditor } = useNavigationStore();

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [pastSessions, setPastSessions] = useState<WorkoutSession[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'routines' | 'history'>('routines');

  const loadData = async () => {
    const [allRoutines, allSessions] = await Promise.all([
      db.routines.toArray(),
      db.sessions.orderBy('startTime').reverse().toArray(),
    ]);
    setRoutines(allRoutines);
    setPastSessions(allSessions.filter((s) => s.isCompleted));
  };

  useEffect(() => {
    loadData();
  }, [activeSession]);

  // If there is an active session, show the focused workout interface
  if (activeSession) {
    return <ActiveWorkout exercises={exercises} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 pb-28 md:pb-12 space-y-5 animate-fade-in">
      {/* Top Action Header */}
      <div className="bg-[#303137] border border-[#3E4048] rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#F5F6F5]">운동 시작 & 루틴 관리</h2>
          <p className="text-xs text-[#A9B2AC] mt-0.5">
            루틴을 선택하거나 자유 운동으로 바로 세트를 기록하세요.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => startFreeWorkout()}
            className="flex-1 sm:flex-none min-h-[46px] px-4 bg-[#B4F34C] hover:bg-[#A0DE3C] text-[#101510] font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>자유 운동 시작</span>
          </button>

          <button
            type="button"
            onClick={() => openRoutineEditor()}
            className="flex-1 sm:flex-none min-h-[46px] px-4 bg-[#252B27] hover:bg-[#2C332F] text-[#F5F6F5] font-bold text-xs rounded-xl border border-[#363D36] flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4 text-[#B4F34C]" />
            <span>새 루틴</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs: Routines vs History */}
      <div className="flex items-center gap-2 border-b border-[#363D36] pb-1">
        <button
          type="button"
          onClick={() => setActiveSubTab('routines')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-xl transition-all ${
            activeSubTab === 'routines'
              ? 'text-[#B4F34C] border-b-2 border-[#B4F34C]'
              : 'text-[#A9B2AC] hover:text-[#F5F6F5]'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>등록된 루틴 ({routines.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-xl transition-all ${
            activeSubTab === 'history'
              ? 'text-[#B4F34C] border-b-2 border-[#B4F34C]'
              : 'text-[#A9B2AC] hover:text-[#F5F6F5]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>과거 운동 기록 ({pastSessions.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeSubTab === 'routines' ? (
        <RoutineList
          routines={routines}
          exercises={exercises}
          onRefresh={loadData}
        />
      ) : (
        <div className="space-y-3">
          {pastSessions.length === 0 ? (
            <div className="p-8 bg-[#303137] border border-[#3E4048] rounded-3xl text-center text-xs text-[#A9B2AC]">
              아직 완료된 과거 운동 기록이 없습니다.
            </div>
          ) : (
            pastSessions.map((session) => (
              <div
                key={session.id}
                className="bg-[#303137] border border-[#3E4048] rounded-2xl p-4 flex items-center justify-between shadow-sm"
              >
                <div>
                  <h4 className="text-sm font-bold text-[#F5F6F5]">{session.name}</h4>
                  <span className="text-[11px] text-[#A9B2AC]">
                    {new Date(session.startTime).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 bg-[#252B27] rounded-xl text-[#F5F6F5] font-mono border border-[#363D36]">
                    {session.exercises.length}개 종목
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-[#B4F34C]" />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
