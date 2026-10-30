export type MuscleId =
  // Front
  | 'chest_upper'
  | 'chest_mid'
  | 'chest_lower'
  | 'deltoid_front'
  | 'deltoid_side'
  | 'biceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'quads'
  | 'adductors'
  | 'calves_front'
  // Back
  | 'traps_upper'
  | 'traps_mid_lower'
  | 'deltoid_rear'
  | 'lats'
  | 'triceps'
  | 'lower_back'
  | 'glutes'
  | 'hamstrings'
  | 'calves_back';

export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'cardio';

export interface MuscleDefinition {
  id: MuscleId;
  nameKo: string;
  nameEn: string;
  group: MuscleGroup;
  view: 'front' | 'back' | 'both';
  description?: string;
}

export type ExerciseCategory = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'cardio';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'smith'
  | 'kettlebell'
  | 'cardio_machine'
  | 'other';

export type ExerciseType = 'compound' | 'isolation' | 'cardio';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type LogType =
  | 'weight_reps'
  | 'reps_only'
  | 'time'
  | 'distance'
  | 'distance_time';

export interface ExerciseGuide {
  exerciseId: string;
  summary: string;
  difficulty: Difficulty;
  instructions: string[];
  breathingTips: string;
  commonMistakes: string[];
  safetyNotes: string[];
  alternativeExerciseIds: string[];
}

export interface Exercise {
  id: string;
  nameKo: string;
  nameEn: string;
  aliases: string[];
  category: ExerciseCategory;
  equipment: Equipment;
  exerciseType: ExerciseType;
  difficulty?: Difficulty;
  logType: LogType;
  primaryMuscles: MuscleId[];
  secondaryMuscles: MuscleId[];
  isUnilateral?: boolean;
  defaultRestSeconds?: number;
  isCustom?: boolean;
  guide?: ExerciseGuide;
}

export type SetType = 'warmup' | 'normal' | 'drop' | 'failure';

// 8 Workout Execution Styles (Strictly Ordered)
export type WorkoutStyleId =
  | 'standard' // 1. 미지정
  | 'superset' // 2. 슈퍼세트
  | 'drop_set' // 3. 드롭세트
  | 'pyramid' // 4. 피라미드세트
  | 'compound_set' // 5. 컴파운드세트
  | 'rest_pause' // 6. 레스트-포즈
  | 'circuit' // 7. 서킷 트레이닝
  | 'giant_set'; // 8. 자이언트세트

export interface WorkoutStyleDefinition {
  id: WorkoutStyleId;
  orderIndex: number;
  nameKo: string;
  nameEn: string;
  shortSummary: string;
  description: string;
  example: string;
  pros: string[];
  cons: string[];
  logFormat: string;
  timerRule: string;
}

export type PyramidPattern = 'ascending' | 'descending' | 'triangle' | 'custom';

export interface SetSegment {
  id: string;
  segmentNumber: number;
  type: 'drop' | 'rest_pause' | 'standard';
  weight?: number;
  reps?: number;
  pauseSeconds?: number; // micro-pause for rest-pause
  isCompleted: boolean;
  completedAt?: string;
}

export interface WorkoutSet {
  id: string;
  sessionId: string;
  exerciseId: string;
  blockId?: string; // Group/Block ID if part of superset/circuit/etc.
  styleId?: WorkoutStyleId;
  setNumber: number;
  setType: SetType;
  weight?: number; // kg
  reps?: number;
  durationSeconds?: number;
  distanceMeters?: number;
  rpe?: number; // 6-10 scale
  isCompleted: boolean;
  completedAt?: string; // ISO string

  // Specialized extensions for drop sets and rest-pause
  segments?: SetSegment[];
  pyramidStep?: number; // e.g. step index in pyramid pattern

  // Pace Mode extensions
  startedAt?: string;
  activeDurationSeconds?: number;
  wasRecordedManually?: boolean;
}

export interface SessionBlock {
  id: string;
  styleId: WorkoutStyleId;
  exerciseIds: string[];
  rounds?: number;
  currentRound?: number;
  interExerciseRestSeconds?: number;
  postGroupRestSeconds?: number;
  pyramidPattern?: PyramidPattern;
}

export interface WorkoutSessionExercise {
  exerciseId: string;
  order: number;
  targetSets?: number;
  targetReps?: string; // e.g. "8-12"
  targetWeight?: number;
  notes?: string;
  blockId?: string;
  styleId?: WorkoutStyleId;
}

// ================= Pace Mode Types =================
export type PaceState =
  | 'READY'
  | 'PREPARING'
  | 'ACTIVE'
  | 'RESTING'
  | 'WAITING_NEXT'
  | 'PAUSED'
  | 'INTERRUPTED'
  | 'COMPLETED';

export type PaceEventType =
  | 'preparation_started'
  | 'preparation_completed'
  | 'preparation_skipped'
  | 'set_started'
  | 'set_completed'
  | 'set_recorded_manually'
  | 'rest_started'
  | 'rest_extended'
  | 'rest_completed'
  | 'next_set_started'
  | 'timer_paused'
  | 'timer_resumed'
  | 'timer_interrupted'
  | 'session_completed';

export interface PaceEvent {
  id: string;
  sessionId: string;
  setId?: string;
  exerciseId?: string;
  groupId?: string;
  roundIndex?: number;
  type: PaceEventType;
  occurredAt: string;
  metadata?: Record<string, any>;
}

export interface PaceModeSettings {
  enabled: boolean;
  preparationSeconds: number; // 3, 5, 10, 15 (default 5)
  restMode: 'auto' | 'manual';
  defaultRestSeconds: number;
  restartGraceSeconds: number; // 15, 30, 60 (default 15)
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  scoringEnabled: boolean;
}

export interface GeneralScoreBreakdown {
  targetSetsScore: number; // max 50
  recordCompletenessScore: number; // max 25
  plannedExercisesScore: number; // max 15
  sessionFinishScore: number; // max 10
  details: string[];
}

export interface ChallengeScoreBreakdown {
  startButtonScore: number; // max 35
  prepCountdownScore: number; // max 15
  restartTimingScore: number; // max 30
  flowScore: number; // max 20
  details: string[];
}

export interface PaceScore {
  sessionId: string;
  generalScore: number | null; // null if insufficient data
  challengeScore: number | null; // null if Pace Mode not used
  generalBreakdown: GeneralScoreBreakdown;
  challengeBreakdown: ChallengeScoreBreakdown;
  calculatedAt: string;
  scorePolicyVersion: string;
}

export interface WorkoutSession {
  id: string;
  routineId?: string; // Optional (undefined/null for Free Workout)
  routineName?: string;
  name: string;
  startTime: string; // ISO string
  endTime?: string; // ISO string
  isCompleted: boolean;
  exercises: WorkoutSessionExercise[];
  blocks?: SessionBlock[];
  notes?: string;
  rating?: number; // 1-5
  paceModeEnabled?: boolean;
  paceScore?: PaceScore;
}

export type SplitType =
  | 'full_body' // 무분할
  | 'two_split' // 2분할
  | 'three_split' // 3분할
  | 'four_split' // 4분할
  | 'five_split' // 5분할
  | 'custom'; // 사용자 정의

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, ...

export interface RoutineExercise {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: string; // e.g. "8-12" or "10"
  targetWeight?: number;
  defaultRestSeconds: number;
  notes?: string;
  styleId?: WorkoutStyleId;
}

export interface Routine {
  id: string;
  name: string;
  splitType: SplitType;
  scheduledDays: DayOfWeek[];
  isRotating: boolean; // 요일 고정형(false) / 순환형(true)
  exercises: RoutineExercise[];
  createdAt: string;
  updatedAt: string;
  orderIndex: number;
}

export type TimerMode = 'manual' | 'auto' | 'adaptive';

export interface TimerSettings {
  mode: TimerMode;
  defaultSeconds: number;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
}

export interface UserSettings {
  id: string;
  userName: string;
  weightUnit: 'kg' | 'lbs';
  timer: TimerSettings;
  theme: 'dark';
  currentSplitType: SplitType;
  favoriteStyles?: WorkoutStyleId[];
  recentStyles?: WorkoutStyleId[];
  paceMode: PaceModeSettings;
  updatedAt: string;
}

export type PlanStatus =
  | 'scheduled' // 예정
  | 'completed' // 완료
  | 'partially_completed' // 부분 완료
  | 'delayed' // 지연
  | 'substituted' // 대체 완료
  | 'skipped' // 건너뜀
  | 'unplanned'; // 미계획 운동

export interface WeeklyPlanItem {
  id: string;
  weekStartDate: string; // YYYY-MM-DD (Monday)
  dayOfWeek: DayOfWeek;
  routineId?: string;
  routineName: string;
  status: PlanStatus;
  targetExerciseIds: string[];
  actualSessionId?: string;
}

export interface MuscleStimulationMap {
  [muscleId: string]: {
    directSets: number;
    indirectSets: number;
    totalSets: number;
    volumeKg: number;
    frequencyDays: number;
    exercises: { exerciseId: string; nameKo: string; sets: number }[];
  };
}

export interface BackupData {
  version: string;
  exportedAt: string;
  exercises: Exercise[];
  routines: Routine[];
  sessions: WorkoutSession[];
  sets: WorkoutSet[];
  settings: UserSettings;
  paceEvents?: PaceEvent[];
}

export interface ExerciseRecommendation {
  exercise: Exercise;
  isPersonalized: boolean;
  reason: string;
  priorityScore: number;
  isInUserRoutine?: boolean;
}

export type MuscleMapMode = 'explore' | 'guide' | 'analysis';
