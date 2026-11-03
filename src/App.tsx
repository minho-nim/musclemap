import React, { useEffect, useState } from 'react';
import { db, initializeDatabase } from './db';
import { Exercise } from './types';
import { useNavigationStore } from './stores/useNavigationStore';
import { useWorkoutStore } from './stores/useWorkoutStore';
import { useTimerStore } from './stores/useTimerStore';
import { usePaceStore } from './stores/usePaceStore';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { FloatingTimerBar } from './components/timer/FloatingTimerBar';
import { RestTimerModal } from './components/timer/RestTimerModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { RoutineEditor } from './components/routine/RoutineEditor';
import { AddToRoutineModal } from './components/routine/AddToRoutineModal';
import { ExercisePickerModal } from './components/workout/ExercisePickerModal';
import { WorkoutSummaryModal } from './components/workout/WorkoutSummaryModal';
import { ExerciseDetailPage } from './components/exercise/ExerciseDetailPage';
import { HomePage } from './pages/HomePage';
import { WorkoutPage } from './pages/WorkoutPage';
import { RoutinesPage } from './pages/RoutinesPage';
import { MusclePage } from './pages/MusclePage';
import { AnalyticsPage } from './pages/AnalyticsPage';

export default function App() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isDbReady, setIsDbReady] = useState(false);

  const {
    activeTab,
    activeExerciseDetailId,
    closeExerciseDetail,
    isSettingsOpen,
    closeSettings,
    isRoutineEditorOpen,
    editingRoutineId,
    closeRoutineEditor,
    isExercisePickerOpen,
    closeExercisePicker,
    addToRoutineExerciseId,
    closeAddToRoutineModal,
  } = useNavigationStore();

  const {
    summaryResult,
    clearSummary,
    loadActiveSession,
  } = useWorkoutStore();

  const { tick } = useTimerStore();

  // Initialize DB and load exercises and active session on mount
  useEffect(() => {
    async function setup() {
      await initializeDatabase();
      const allExercises = await db.exercises.toArray();
      setExercises(allExercises);
      await loadActiveSession();
      setIsDbReady(true);
    }
    setup();
  }, []);

  // Timer & Pace Tick Heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      tick();
      usePaceStore.getState().heartbeatTick();
    }, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  const refreshData = async () => {
    const allExercises = await db.exercises.toArray();
    setExercises(allExercises);
  };

  if (!isDbReady) {
    return (
      <div className="min-h-screen bg-[#101213] flex flex-col items-center justify-center text-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-[#B4F34C] flex items-center justify-center text-[#101510] font-black text-xl mb-4 animate-bounce">
          M
        </div>
        <h2 className="text-xl font-extrabold text-[#F5F6F5]">MuscleMap</h2>
        <p className="text-xs text-[#A9B2AC] mt-1">로컬 데이터베이스를 로드하고 있습니다...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101213] text-[#F5F6F5] flex flex-col md:flex-row antialiased">
      {/* PC Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <Header />

        {/* Dynamic Page Views */}
        <main className="flex-1">
          {activeExerciseDetailId ? (
            <ExerciseDetailPage
              exerciseId={activeExerciseDetailId}
              onBack={closeExerciseDetail}
            />
          ) : activeTab === 'home' ? (
            <HomePage exercises={exercises} />
          ) : activeTab === 'workout' ? (
            <WorkoutPage exercises={exercises} />
          ) : activeTab === 'routines' ? (
            isRoutineEditorOpen ? <RoutineEditor
              key={editingRoutineId ?? 'new'}
              routineId={editingRoutineId}
              exercises={exercises}
              onClose={closeRoutineEditor}
              onSaved={refreshData}
            /> : <RoutinesPage exercises={exercises} />
          ) : activeTab === 'muscle' ? (
            <MusclePage exercises={exercises} />
          ) : (
            <AnalyticsPage exercises={exercises} />
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <Navbar />
      </div>

      {/* Persistent Floating Rest Timer */}
      <FloatingTimerBar />
      <RestTimerModal />

      {/* Workout Completion Summary Celebration Modal */}
      {summaryResult && (
        <WorkoutSummaryModal
          summary={summaryResult}
          exercises={exercises}
          onClose={clearSummary}
        />
      )}

      {/* App Settings & JSON Backup/Restore Modal */}
      {isSettingsOpen && (
        <SettingsModal
          onClose={closeSettings}
          onDataChanged={refreshData}
        />
      )}

      {/* Add To Routine Modal */}
      {addToRoutineExerciseId && (
        <AddToRoutineModal
          exerciseId={addToRoutineExerciseId}
          onClose={closeAddToRoutineModal}
        />
      )}

      {/* Exercise Picker Modal for Active Workout */}
      {isExercisePickerOpen && (
        <ExercisePickerModal
          exercises={exercises}
          onClose={closeExercisePicker}
        />
      )}
    </div>
  );
}
