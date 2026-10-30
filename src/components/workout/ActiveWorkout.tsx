import React, { useState, useEffect } from 'react';
import { db } from '../../db';
import { Exercise, WorkoutSet, SetType, WorkoutStyleId, PyramidPattern } from '../../types';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { useNavigationStore } from '../../stores/useNavigationStore';
import { usePaceStore } from '../../stores/usePaceStore';
import { useTimerStore } from '../../stores/useTimerStore';
import { MuscleMap } from '../anatomy/MuscleMap';
import { MUSCLE_DEFINITIONS } from '../../data/muscles';
import { WORKOUT_STYLES_MAP } from '../../data/workoutStyles';
import { PaceControlPanel } from '../pace/PaceControlPanel';
import { WorkoutStyleSelector } from './WorkoutStyleSelector';
import { ExerciseIllustration } from '../exercise/ExerciseIllustration';
import { ExerciseListBottomSheet } from './ExerciseListBottomSheet';
import { ExerciseEditBottomSheet } from './ExerciseEditBottomSheet';
import { DropSetEditor } from './styles/DropSetEditor';
import { RestPauseEditor } from './styles/RestPauseEditor';
import { PyramidEditor } from './styles/PyramidEditor';
import { resolveEffectiveRestSeconds, getPhysiologicalRestRecommendation } from '../../engines/timerPhysiologyEngine';
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Clock,
  List,
  Timer,
  Check,
  Plus,
  Trash2,
  Sliders,
  Zap,
  Flag,
  RotateCcw,
  PlusCircle,
  HelpCircle,
  Play,
  Pause,
  FastForward,
  Dumbbell,
} from 'lucide-react';

interface ActiveWorkoutProps {
  exercises: Exercise[];
}

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({ exercises }) => {
  const {
    activeSession,
    activeSets,
    activeExerciseIndex,
    setActiveExerciseIndex,
    setExerciseStyle,
    addSetToExercise,
    updateSet,
    completeSet,
    undoCompleteSet,
    deleteSet,
    finishWorkout,
    cancelWorkout,
  } = useWorkoutStore();

  const { openExercisePicker, openExerciseDetail, setActiveTab } = useNavigationStore();
  const { paceModeEnabled, setPaceModeEnabled } = usePaceStore();
  const {
    isRunning: isRestRunning,
    remainingSeconds: restRemainingSeconds,
    targetSeconds: restTargetSeconds,
    adjustSeconds: adjustRestSeconds,
    skipTimer: skipRestTimer,
    pauseTimer: pauseRestTimer,
    resumeTimer: resumeRestTimer,
    isCompletedAlert: isRestAlert,
    dismissAlert: dismissRestAlert,
    startTimer,
    openModal: openTimerModal,
  } = useTimerStore();

  const [isExerciseListOpen, setIsExerciseListOpen] = useState(false);
  const [isExerciseEditOpen, setIsExerciseEditOpen] = useState(false);
  const [isStyleSelectorOpen, setIsStyleSelectorOpen] = useState(false);
  const [isMuscleMapOpen, setIsMuscleMapOpen] = useState(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Calculate elapsed time from session start
  useEffect(() => {
    if (!activeSession) return;
    const startTime = new Date(activeSession.startTime).getTime();

    const updateTimer = () => {
      const now = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((now - startTime) / 1000)));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const currentSessionExercise = activeSession?.exercises[activeExerciseIndex];
  const currentExercise = exercises.find((e) => e.id === currentSessionExercise?.exerciseId);
  const currentStyleId = (currentSessionExercise?.styleId || 'standard') as WorkoutStyleId;
  const currentStyleDef = WORKOUT_STYLES_MAP.get(currentStyleId);

  if (!activeSession) {
    return null;
  }

  // If session is active but has no exercises yet (e.g. fresh free workout), show exercise picker prompt instead of null!
  if (!currentExercise) {
    return (
      <div className="min-h-screen bg-[#1B1C20] text-[#F4F4F5] p-6 flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-[#303137] border border-[#3E4048] flex items-center justify-center mb-4 text-[#B4F34C]">
          <Dumbbell className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-[#F4F4F5]">진행할 운동 종목을 추가하세요</h2>
        <p className="text-xs text-[#A9AAB3] max-w-xs mt-1 mb-6">
          자유 운동 세션이 시작되었습니다. 오늘 수행할 첫 번째 운동 종목을 선택하세요.
        </p>
        <button
          type="button"
          onClick={() => openExercisePicker('active_workout')}
          className="px-6 py-3.5 bg-[#B4F34C] hover:bg-[#A0DE3C] text-[#101510] font-black text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-[#B4F34C]/20 transition-all cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          <span>운동 종목 선택하기</span>
        </button>
      </div>
    );
  }

  const currentExerciseSets = activeSets.filter(
    (s) => s.exerciseId === currentExercise.id
  );

  // Active uncompleted set index
  const activeUncompletedIndex = currentExerciseSets.findIndex((s) => !s.isCompleted);
  const activeSet =
    activeUncompletedIndex !== -1
      ? currentExerciseSets[activeUncompletedIndex]
      : currentExerciseSets[currentExerciseSets.length - 1];

  const currentSetDisplayNum =
    activeUncompletedIndex !== -1
      ? activeUncompletedIndex + 1
      : currentExerciseSets.length;

  const isCurrentLastSet =
    activeExerciseIndex === activeSession.exercises.length - 1 &&
    currentExerciseSets.filter((s) => !s.isCompleted).length <= 1;

  // Resolve physiology-based rest seconds for current exercise
  const { effectiveSeconds: currentRestSec } = resolveEffectiveRestSeconds({
    currentSetRestSeconds: activeSet?.durationSeconds,
    routineExerciseRestSeconds: currentSessionExercise?.targetSets ? 120 : undefined,
    exercise: currentExercise,
    isWarmup: activeSet?.setType === 'warmup',
  });

  const formatElapsed = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (hrs > 0) {
      return `${hrs}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleNextExercise = () => {
    if (activeExerciseIndex < activeSession.exercises.length - 1) {
      setActiveExerciseIndex(activeExerciseIndex + 1);
    }
  };

  const handlePrevExercise = () => {
    if (activeExerciseIndex > 0) {
      setActiveExerciseIndex(activeExerciseIndex - 1);
    }
  };

  // Primary action button handler: "Log Set N" / "세트 완료"
  const handleLogActiveSet = async () => {
    if (!activeSet) return;
    if (activeSet.isCompleted) {
      // If all sets completed in this exercise, advance to next exercise if available
      if (activeExerciseIndex < activeSession.exercises.length - 1) {
        handleNextExercise();
      } else {
        finishWorkout();
      }
      return;
    }

    await completeSet(activeSet.id, exercises);

    // Trigger rest timer with resolved per-exercise duration
    startTimer(currentRestSec, currentExercise.nameKo);
  };

  const handleApplyPyramidPattern = (pattern: PyramidPattern) => {
    const baseWeight = currentExerciseSets[0]?.weight || 40;
    const count = currentExerciseSets.length;

    currentExerciseSets.forEach((s, idx) => {
      let w = baseWeight;
      let r = 10;
      if (pattern === 'ascending') {
        w = Math.max(0, baseWeight + idx * 5);
        r = Math.max(4, 15 - idx * 3);
      } else if (pattern === 'descending') {
        w = Math.max(0, baseWeight + (count - 1 - idx) * 5);
        r = Math.max(4, 6 + idx * 3);
      } else if (pattern === 'triangle') {
        const mid = Math.floor(count / 2);
        const diff = idx <= mid ? idx : count - 1 - idx;
        w = Math.max(0, baseWeight + diff * 5);
        r = Math.max(4, 12 - diff * 3);
      }
      updateSet(s.id, { weight: w, reps: r, pyramidStep: idx + 1 });
    });
  };

  const allCompleted = currentExerciseSets.every((s) => s.isCompleted);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#1B1C20] text-[#F4F4F5] pb-28">
      {/* 1. TOP HEADER & TIMER (Planfit style: real-time stopwatch & top rest timer) */}
      <div className="sticky top-0 z-30 bg-[#1B1C20]/95 backdrop-blur-md px-4 py-3 border-b border-[#3E4048]/50 shadow-md">
        <div className="flex items-center justify-between">
          {/* Back Button (Minimizes to Home) */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="p-2 rounded-xl text-[#A9AAB3] hover:text-[#F4F4F5] hover:bg-[#303137] transition-colors"
            title="대시보드로 나가기 (운동은 백그라운드에서 유지됩니다)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Center Elapsed Stopwatch with Running Indicator */}
          <div className="flex items-center gap-2 font-mono text-lg font-black tracking-wider text-[#F4F4F5]">
            <span className="w-2 h-2 rounded-full bg-[#B4F34C] animate-pulse" />
            <Clock className="w-4 h-4 text-[#B4F34C]" />
            <span>{formatElapsed(elapsedSeconds)}</span>
          </div>

          {/* Right Action Icons: Pace Mode & More Options */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPaceModeEnabled(!paceModeEnabled)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold flex items-center gap-1 border transition-all ${
                paceModeEnabled
                  ? 'bg-[#B4F34C] text-[#101510] border-[#B4F34C]'
                  : 'bg-[#303137] text-[#A9AAB3] border-[#3E4048]'
              }`}
              title="페이스 모드 켜기/끄기"
            >
              <Zap className={`w-3 h-3 ${paceModeEnabled ? 'fill-current' : ''}`} />
              <span>Pace {paceModeEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)}
                className="p-2 rounded-xl text-[#A9AAB3] hover:text-[#F4F4F5] hover:bg-[#303137] transition-colors"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {/* Options Dropdown */}
              {isOptionsMenuOpen && (
                <div className="absolute right-0 top-11 z-40 w-44 bg-[#303137] border border-[#3E4048] rounded-2xl p-1.5 shadow-2xl text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOptionsMenuOpen(false);
                      finishWorkout();
                    }}
                    className="w-full px-3 py-2 text-left text-[#B4F34C] hover:bg-[#42434A] rounded-xl flex items-center gap-2 font-bold"
                  >
                    <Flag className="w-4 h-4" />
                    <span>운동 종료 및 저장</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOptionsMenuOpen(false);
                      openExercisePicker('active_workout');
                    }}
                    className="w-full px-3 py-2 text-left text-[#F4F4F5] hover:bg-[#42434A] rounded-xl flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4 text-[#B4F34C]" />
                    <span>새 종목 추가</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOptionsMenuOpen(false);
                      if (confirm('진행 중인 운동을 완전히 취소하시겠습니까?')) {
                        cancelWorkout();
                      }
                    }}
                    className="w-full px-3 py-2 text-left text-[#FF806B] hover:bg-[#4A2626] rounded-xl flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>운동 취소</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Integrated Top Rest Timer Panel ("그 상단에 타이머") */}
        {(isRestRunning || restRemainingSeconds > 0) && (
          <div className="mt-2.5 pt-2 border-t border-[#3E4048]/60 flex flex-col gap-1.5 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#B4F34C] animate-spin-slow" />
                <span className="text-xs font-bold text-[#A9AAB3]">세트 간 휴식</span>
                <span className="font-mono text-base font-black text-[#B4F34C]">
                  {Math.floor(restRemainingSeconds / 60)}:
                  {restRemainingSeconds % 60 < 10 ? '0' : ''}
                  {restRemainingSeconds % 60}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => adjustRestSeconds(-15)}
                  className="px-2 py-0.5 text-[11px] font-bold bg-[#303137] hover:bg-[#3E4048] text-[#A9AAB3] hover:text-[#F4F4F5] rounded-lg transition-colors"
                >
                  -15s
                </button>
                <button
                  type="button"
                  onClick={() => adjustRestSeconds(15)}
                  className="px-2 py-0.5 text-[11px] font-bold bg-[#303137] hover:bg-[#3E4048] text-[#A9AAB3] hover:text-[#F4F4F5] rounded-lg transition-colors"
                >
                  +15s
                </button>
                {isRestRunning ? (
                  <button
                    type="button"
                    onClick={pauseRestTimer}
                    className="p-1 text-[#B4F34C] hover:bg-[#303137] rounded-lg transition-colors"
                    title="일시정지"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={resumeRestTimer}
                    className="p-1 text-[#B4F34C] hover:bg-[#303137] rounded-lg transition-colors"
                    title="재개"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={skipRestTimer}
                  className="px-2 py-0.5 text-[11px] font-bold text-[#A9AAB3] hover:text-[#F4F4F5] bg-[#303137] hover:bg-[#3E4048] rounded-lg transition-colors"
                >
                  건너뛰기
                </button>
              </div>
            </div>

            {/* Rest Progress Bar */}
            <div className="w-full bg-[#303137] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#B4F34C] h-full transition-all duration-300"
                style={{
                  width: `${
                    restTargetSeconds > 0
                      ? Math.min(100, Math.max(0, ((restTargetSeconds - restRemainingSeconds) / restTargetSeconds) * 100))
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Rest Completed Alert Banner at Top */}
        {isRestAlert && (
          <div className="mt-2.5 p-2.5 bg-[#B4F34C] text-[#101510] font-black text-xs rounded-xl flex items-center justify-between shadow-lg animate-bounce">
            <span>🔔 휴식 시간 종료! 다음 세트를 시작하세요.</span>
            <button
              type="button"
              onClick={dismissRestAlert}
              className="px-2 py-0.5 bg-[#101510] text-[#B4F34C] rounded-lg text-[11px] font-extrabold"
            >
              확인
            </button>
          </div>
        )}
      </div>

      {/* RESPONSIVE DESKTOP & MOBILE WORKOUT CONTAINER */}
      <div className="w-full max-w-6xl mx-auto px-4 py-3 pb-32 lg:pb-12 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
        {/* LEFT COLUMN: ACTIVE EXERCISE, ILLUSTRATION, SETS */}
        <div className="lg:col-span-7 space-y-4">
          {/* 2. EXERCISE TITLE & STEP INDICATOR */}
          <div className="pt-2 pb-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#A9AAB3]">
                {activeExerciseIndex + 1} / {activeSession.exercises.length}
              </span>

              {/* Quick Style Switch */}
              <button
                type="button"
                onClick={() => setIsStyleSelectorOpen(true)}
                className="text-[11px] font-bold text-[#B4F34C] hover:underline flex items-center gap-1"
              >
                <span>{currentStyleDef?.nameKo.split(' (')[0] || '미지정'}</span>
                <Sliders className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center justify-between mt-0.5">
              <h1
                onClick={() => openExerciseDetail(currentExercise.id)}
                className="text-2xl font-black text-[#F4F4F5] tracking-tight cursor-pointer hover:text-[#B4F34C] transition-colors"
              >
                {currentExercise.nameKo}
              </h1>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevExercise}
                  disabled={activeExerciseIndex === 0}
                  className="p-1 rounded-lg text-[#A9AAB3] hover:text-[#F4F4F5] disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextExercise}
                  disabled={activeExerciseIndex === activeSession.exercises.length - 1}
                  className="p-1 rounded-lg text-[#A9AAB3] hover:text-[#F4F4F5] disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 3. EXERCISE VISUAL & TARGET MUSCLE STIMULATION MAP (목표 근육 자극도 항상 표시) */}
          <div className="my-2 bg-[#24252A] rounded-3xl border border-[#3E4048]/80 p-3 sm:p-4 shadow-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {/* Left: Exercise Athletic Vector Illustration */}
              <div className="relative flex flex-col items-center justify-center bg-[#1B1C20] rounded-2xl border border-[#303137] p-2 min-h-[190px]">
                <ExerciseIllustration
                  exercise={currentExercise}
                  size="large"
                  className="w-full h-44 bg-transparent border-0"
                  highlightColor="#B4F34C"
                />
                <span className="text-[10px] text-[#A9AAB3] font-bold mt-1">
                  운동 동작 & 장비
                </span>
              </div>

              {/* Right: Real-time Target Muscle Stimulation Map (목표 근육 자극도 2D 인체 해부도) */}
              <div className="relative flex flex-col items-center justify-center bg-[#1B1C20] rounded-2xl border border-[#303137] p-2 min-h-[190px]">
                <div className="w-full max-w-[170px] flex items-center justify-center">
                  <MuscleMap
                    selectedMuscle={null}
                    mode="guide"
                    primaryMuscles={currentExercise.primaryMuscles}
                    secondaryMuscles={currentExercise.secondaryMuscles}
                    isCompact={true}
                    showSelectorList={false}
                  />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-[#FF806B]" />
                  <span className="text-[10px] font-black text-[#F4F4F5]">목표 근육 자극도</span>
                </div>
              </div>
            </div>

            {/* Target Muscle Stimulation Info Footer */}
            <div className="mt-3 pt-2.5 border-t border-[#303137] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF806B]" />
                  <span className="text-[#A9AAB3]">주동근:</span>
                  <span className="text-[#F4F4F5] font-black">
                    {currentExercise.primaryMuscles
                      .map((m) => MUSCLE_DEFINITIONS[m]?.nameKo || m)
                      .join(', ')}
                  </span>
                </div>
                {currentExercise.secondaryMuscles.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E9AB87]" />
                    <span className="text-[#A9AAB3]">보조근:</span>
                    <span className="text-[#E9AB87] font-semibold">
                      {currentExercise.secondaryMuscles
                        .map((m) => MUSCLE_DEFINITIONS[m]?.nameKo || m)
                        .join(', ')}
                    </span>
                  </div>
                )}
              </div>

              <span className="text-[11px] text-[#A9AAB3] font-mono">
                권장 휴식: {currentRestSec}초
              </span>
            </div>
          </div>

          {/* 4. PACE MODE CONTROL PANEL (if Pace Mode is active) */}
          {paceModeEnabled && activeSet && (
            <div className="mb-3">
          <PaceControlPanel
            exercise={currentExercise}
            currentSet={activeSet}
            sessionId={activeSession.id}
            isLastSet={isCurrentLastSet}
            onSetCompleted={() => completeSet(activeSet.id, exercises)}
            onManualRecord={() => completeSet(activeSet.id, exercises)}
          />
        </div>
      )}

          {/* 5. SETS LIST CONTAINER (Planfit Compact Rows) */}
          <div className="space-y-2">
        {/* Set Action Header */}
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-bold text-[#A9AAB3]">세트 기록</span>
          <button
            type="button"
            onClick={() => setIsExerciseEditOpen(true)}
            className="text-xs font-bold text-[#A9AAB3] hover:text-[#B4F34C] flex items-center gap-1 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Edit Set</span>
          </button>
        </div>

        {/* Pyramid Pattern Selector if Pyramid Style */}
        {currentStyleId === 'pyramid' && (
          <PyramidEditor
            currentPattern="ascending"
            onApplyPattern={handleApplyPyramidPattern}
          />
        )}

        {/* DropSet / RestPause Dedicated Editors if active */}
        {currentStyleId === 'drop_set' && activeSet ? (
          <DropSetEditor
            set={activeSet}
            onUpdateSet={(updates) => updateSet(activeSet.id, updates)}
            onCompleteSet={() => completeSet(activeSet.id, exercises)}
            onUndoComplete={() => undoCompleteSet(activeSet.id)}
          />
        ) : currentStyleId === 'rest_pause' && activeSet ? (
          <RestPauseEditor
            set={activeSet}
            onUpdateSet={(updates) => updateSet(activeSet.id, updates)}
            onCompleteSet={() => completeSet(activeSet.id, exercises)}
            onUndoComplete={() => undoCompleteSet(activeSet.id)}
          />
        ) : (
          /* Standard / Compact Planfit Rows */
          <div className="space-y-2">
            {currentExerciseSets.map((set, idx) => {
              const isSetCompleted = set.isCompleted;
              const isCurrent = set.id === activeSet?.id;

              return (
                <div
                  key={set.id}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all cursor-pointer ${
                    isSetCompleted
                      ? 'bg-[#22352E] border border-[#B4F34C]/30 text-[#F4F4F5]'
                      : isCurrent
                      ? 'bg-[#303137] border-2 border-[#B4F34C] text-[#F4F4F5] shadow-lg shadow-[#B4F34C]/10'
                      : 'bg-[#303137]/60 border border-[#3E4048]/60 text-[#A9AAB3]'
                  }`}
                  onClick={() => {
                    if (isSetCompleted) {
                      undoCompleteSet(set.id);
                    }
                  }}
                >
                  {/* Set Number */}
                  <span
                    className={`w-12 text-xs font-black ${
                      isSetCompleted
                        ? 'text-[#B4F34C]'
                        : isCurrent
                        ? 'text-[#F4F4F5]'
                        : 'text-[#A9AAB3]'
                    }`}
                  >
                    {idx + 1} set
                  </span>

                  {/* Weight Input Box */}
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={set.weight ?? ''}
                      onChange={(e) =>
                        updateSet(set.id, {
                          weight: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-16 bg-[#42434A] py-1 text-center font-black text-sm text-[#F4F4F5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#B4F34C]"
                    />
                    <span className="text-xs font-semibold text-[#A9AAB3]">kg</span>
                  </div>

                  {/* Reps Input Box */}
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="number"
                      min="1"
                      value={set.reps ?? ''}
                      onChange={(e) =>
                        updateSet(set.id, {
                          reps: parseInt(e.target.value, 10) || 1,
                        })
                      }
                      className="w-14 bg-[#42434A] py-1 text-center font-black text-sm text-[#F4F4F5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#B4F34C]"
                    />
                    <span className="text-xs font-semibold text-[#A9AAB3]">reps</span>
                  </div>

                  {/* Completion Status / Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (set.isCompleted) {
                        undoCompleteSet(set.id);
                      } else {
                        completeSet(set.id, exercises);
                        startTimer(currentRestSec, currentExercise.nameKo);
                      }
                    }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      set.isCompleted
                        ? 'bg-[#B4F34C] text-[#101510] shadow-md'
                        : isCurrent
                        ? 'bg-[#42434A] hover:bg-[#B4F34C]/20 text-[#A9AAB3]'
                        : 'bg-[#42434A]/50 text-[#A9AAB3]'
                    }`}
                  >
                    <Check
                      className={`w-5 h-5 ${
                        set.isCompleted
                          ? 'stroke-[3]'
                          : 'stroke-[2] opacity-30'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        )}

            {/* Quick Add Set Row */}
            <div className="pt-1 flex items-center justify-between text-xs text-[#A9AAB3]">
              <button
                type="button"
                onClick={() => addSetToExercise(currentExercise.id, 'normal')}
                className="py-1.5 px-3 rounded-xl hover:bg-[#303137] text-[#B4F34C] font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>세트 추가</span>
              </button>

              <span className="text-[11px] text-[#A9AAB3]">
                권장 휴식: {currentRestSec}초
              </span>
            </div>
          </div>

          {/* Desktop-only Action Bar (lg:flex) */}
          <div className="hidden lg:flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={openTimerModal}
              className="h-13 px-4 rounded-2xl bg-[#303137] hover:bg-[#3A3B43] text-[#F4F4F5] border border-[#3E4048] flex items-center gap-2 font-bold text-xs shrink-0 shadow-md transition-all"
            >
              <Timer className="w-4 h-4 text-[#B4F34C]" />
              <div className="text-left">
                <span className="block text-[10px] text-[#A9AAB3] leading-none">휴식</span>
                <span className="text-xs font-mono font-bold leading-tight">{currentRestSec}s</span>
              </div>
            </button>

            <button
              type="button"
              onClick={handleLogActiveSet}
              className="flex-1 h-13 rounded-2xl bg-[#B4F34C] hover:bg-[#A0DE3C] text-[#101510] font-black text-sm tracking-wide shadow-lg shadow-[#B4F34C]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {allCompleted ? (
                activeExerciseIndex < activeSession.exercises.length - 1 ? (
                  <>
                    <span>다음 종목으로</span>
                    <ChevronRight className="w-5 h-5 stroke-[3]" />
                  </>
                ) : (
                  <>
                    <Flag className="w-5 h-5 fill-current" />
                    <span>운동 완료</span>
                  </>
                )
              ) : (
                <>
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>Log Set {currentSetDisplayNum}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN (DESKTOP ONLY): PINNED EXERCISE LIST & LIVE TARGET MUSCLE ANATOMY */}
        <div className="hidden lg:flex lg:col-span-5 flex-col space-y-4 sticky top-20">
          {/* Workout Exercises Sequence Panel */}
          <div className="bg-[#24252A] rounded-3xl border border-[#303137] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-[#F4F4F5] flex items-center gap-2">
                <List className="w-4 h-4 text-[#B4F34C]" />
                운동 순서 ({activeSession.exercises.length}개 종목)
              </h3>
              <button
                type="button"
                onClick={() => openExercisePicker('active_workout')}
                className="text-xs text-[#B4F34C] font-bold flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>종목 추가</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {activeSession.exercises.map((se, idx) => {
                const ex = exercises.find((e) => e.id === se.exerciseId);
                const exSets = activeSets.filter((s) => s.exerciseId === se.exerciseId);
                const completedCount = exSets.filter((s) => s.isCompleted).length;
                const totalCount = exSets.length;
                const isCurrent = idx === activeExerciseIndex;
                const isDone = completedCount > 0 && completedCount === totalCount;

                return (
                  <button
                    key={se.exerciseId}
                    type="button"
                    onClick={() => setActiveExerciseIndex(idx)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                      isCurrent
                        ? 'bg-[#303137] border-2 border-[#B4F34C] text-[#F4F4F5] shadow-md'
                        : isDone
                        ? 'bg-[#22352E]/60 border-[#B4F34C]/20 text-[#A9AAB3]'
                        : 'bg-[#1B1C20] border-[#303137] text-[#A9AAB3] hover:text-[#F4F4F5]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#26282E] flex items-center justify-center shrink-0 overflow-hidden">
                        {ex && <ExerciseIllustration exercise={ex} size="thumb" className="w-10 h-10" />}
                      </div>
                      <div className="min-w-0">
                        <span className={`text-xs font-bold block truncate ${isCurrent ? 'text-[#F4F4F5]' : ''}`}>
                          {ex?.nameKo || '운동'}
                        </span>
                        <span className="text-[10px] text-[#A9AAB3]">
                          {completedCount} / {totalCount} 세트 완료
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isCurrent && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#B4F34C] text-[#101510]">
                          진행 중
                        </span>
                      )}
                      {isDone && <Check className="w-4 h-4 text-[#B4F34C]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Target Muscle Anatomy */}
          <div className="bg-[#24252A] rounded-3xl border border-[#303137] p-5 shadow-xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-xs font-black text-[#F4F4F5]">목표 근육 자극도</span>
              <span className="text-[10px] text-[#FF806B] font-bold">주동근 • 보조근</span>
            </div>
            <MuscleMap
              selectedMuscle={null}
              mode="guide"
              primaryMuscles={currentExercise.primaryMuscles}
              secondaryMuscles={currentExercise.secondaryMuscles}
              isCompact={true}
              showSelectorList={false}
            />
          </div>
        </div>
      </div>

      {/* 6. FIXED BOTTOM ACTION BAR FOR MOBILE (lg:hidden) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#1B1C20]/95 backdrop-blur-lg border-t border-[#3E4048] p-3 sm:pb-4 shadow-2xl lg:hidden">
        <div className="max-w-md mx-auto flex items-center gap-3">
          {/* List Icon: Opens Exercise List Bottom Sheet */}
          <button
            type="button"
            onClick={() => setIsExerciseListOpen(true)}
            className="w-13 h-13 rounded-2xl bg-[#303137] hover:bg-[#3A3B43] text-[#F4F4F5] border border-[#3E4048] flex items-center justify-center shrink-0 shadow-md transition-all"
            title="운동 목록 보기"
          >
            <List className="w-6 h-6" />
          </button>

          {/* Timer Button: Opens Rest Timer Modal & Displays Duration */}
          <button
            type="button"
            onClick={openTimerModal}
            className="h-13 px-4 rounded-2xl bg-[#303137] hover:bg-[#3A3B43] text-[#F4F4F5] border border-[#3E4048] flex items-center gap-2 font-bold text-xs shrink-0 shadow-md transition-all"
            title="휴식 타이머 설정"
          >
            <Timer className="w-4 h-4 text-[#B4F34C]" />
            <div className="text-left">
              <span className="block text-[10px] text-[#A9AAB3] leading-none">휴식</span>
              <span className="text-xs font-mono font-bold leading-tight">{currentRestSec}s</span>
            </div>
          </button>

          {/* Large Primary Action: "Log Set N" / "다음 종목" */}
          <button
            type="button"
            onClick={handleLogActiveSet}
            className="flex-1 h-13 rounded-2xl bg-[#B4F34C] hover:bg-[#A0DE3C] text-[#101510] font-black text-sm tracking-wide shadow-lg shadow-[#B4F34C]/25 flex items-center justify-center gap-2 transition-all"
          >
            {allCompleted ? (
              activeExerciseIndex < activeSession.exercises.length - 1 ? (
                <>
                  <span>다음 종목으로</span>
                  <ChevronRight className="w-5 h-5 stroke-[3]" />
                </>
              ) : (
                <>
                  <Flag className="w-5 h-5 fill-current" />
                  <span>운동 완료</span>
                </>
              )
            ) : (
              <>
                <Check className="w-5 h-5 stroke-[3]" />
                <span>Log Set {currentSetDisplayNum}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 7. BOTTOM SHEETS & MODALS */}
      {/* Exercise List Bottom Sheet (image_0c91cf1b.png) */}
      {isExerciseListOpen && (
        <ExerciseListBottomSheet
          session={activeSession}
          exercises={exercises}
          sets={activeSets}
          activeExerciseIndex={activeExerciseIndex}
          onSelectExerciseIndex={(idx) => setActiveExerciseIndex(idx)}
          onOpenAddExercise={() => openExercisePicker('active_workout')}
          onOpenEditExercise={(exId) => {
            const idx = activeSession.exercises.findIndex((se) => se.exerciseId === exId);
            if (idx !== -1) setActiveExerciseIndex(idx);
            setIsExerciseEditOpen(true);
          }}
          onReplaceExercise={() => openExercisePicker('active_workout')}
          onDeleteExercise={(exId) => {
            // Remove exercise from session
            const filtered = activeSession.exercises.filter((se) => se.exerciseId !== exId);
            activeSession.exercises = filtered;
            setActiveExerciseIndex(0);
          }}
          onClose={() => setIsExerciseListOpen(false)}
        />
      )}

      {/* Exercise Edit / Replace Bottom Sheet (image_5aa084b7.png) */}
      {isExerciseEditOpen && (
        <ExerciseEditBottomSheet
          exercise={currentExercise}
          sets={currentExerciseSets}
          onAddSet={() => addSetToExercise(currentExercise.id, 'normal')}
          onUpdateSet={(sId, updates) => updateSet(sId, updates)}
          onDeleteSet={(sId) => deleteSet(sId)}
          onDeleteExercise={() => {
            const filtered = activeSession.exercises.filter(
              (se) => se.exerciseId !== currentExercise.id
            );
            activeSession.exercises = filtered;
            setActiveExerciseIndex(0);
          }}
          onReplaceExercise={() => openExercisePicker('active_workout')}
          onClose={() => setIsExerciseEditOpen(false)}
        />
      )}

      {/* Workout Style Selector Modal */}
      {isStyleSelectorOpen && (
        <WorkoutStyleSelector
          currentStyleId={currentStyleId}
          onSelectStyle={(styleId) => {
            setExerciseStyle(currentExercise.id, styleId);
            setIsStyleSelectorOpen(false);
          }}
          onClose={() => setIsStyleSelectorOpen(false)}
        />
      )}
    </div>
  );
};
