import { create } from 'zustand';
import { MuscleId } from '../types';

export type NavigationTab = 'home' | 'workout' | 'routines' | 'muscle' | 'analytics';

interface NavigationState {
  activeTab: NavigationTab;
  selectedMuscle: MuscleId | null;
  activeExerciseDetailId: string | null;
  isSettingsOpen: boolean;
  isRoutineEditorOpen: boolean;
  editingRoutineId: string | null;
  isExercisePickerOpen: boolean;
  exercisePickerTarget: 'active_workout' | 'routine' | null;
  addToRoutineExerciseId: string | null;

  // Actions
  setActiveTab: (tab: NavigationTab) => void;
  setSelectedMuscle: (muscle: MuscleId | null) => void;
  openExerciseDetail: (exerciseId: string) => void;
  closeExerciseDetail: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  openRoutineEditor: (routineId?: string) => void;
  closeRoutineEditor: () => void;
  openExercisePicker: (target: 'active_workout' | 'routine') => void;
  closeExercisePicker: () => void;
  openAddToRoutineModal: (exerciseId: string) => void;
  closeAddToRoutineModal: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeTab: 'home',
  selectedMuscle: null,
  activeExerciseDetailId: null,
  isSettingsOpen: false,
  isRoutineEditorOpen: false,
  editingRoutineId: null,
  isExercisePickerOpen: false,
  exercisePickerTarget: null,
  addToRoutineExerciseId: null,

  setActiveTab: (tab) => set({ activeTab: tab, isRoutineEditorOpen: false, editingRoutineId: null, activeExerciseDetailId: null }),
  setSelectedMuscle: (muscle) => set({ selectedMuscle: muscle }),
  openExerciseDetail: (exerciseId) => set({ activeExerciseDetailId: exerciseId }),
  closeExerciseDetail: () => set({ activeExerciseDetailId: null }),
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  openRoutineEditor: (routineId) => set({ activeTab: 'routines', activeExerciseDetailId: null, isRoutineEditorOpen: true, editingRoutineId: routineId || null }),
  closeRoutineEditor: () => set({ isRoutineEditorOpen: false, editingRoutineId: null }),
  openExercisePicker: (target) => set({ isExercisePickerOpen: true, exercisePickerTarget: target }),
  closeExercisePicker: () => set({ isExercisePickerOpen: false, exercisePickerTarget: null }),
  openAddToRoutineModal: (exerciseId) => set({ addToRoutineExerciseId: exerciseId }),
  closeAddToRoutineModal: () => set({ addToRoutineExerciseId: null }),
}));
