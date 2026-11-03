import React, { useEffect, useState } from "react";
import { db } from "../db";
import {
  Routine,
  WorkoutSession,
  WorkoutSet,
  Exercise,
  DayOfWeek,
} from "../types";
import { useWorkoutStore } from "../stores/useWorkoutStore";
import { useNavigationStore } from "../stores/useNavigationStore";
import {
  calculateWeeklyGoalStatus,
  WeeklyGoalSummary,
} from "../engines/goalEngine";
import { MuscleMap } from "../components/anatomy/MuscleMap";
import { ExerciseIllustration } from "../components/exercise/ExerciseIllustration";
import { WorkoutShareModal } from "../components/workout/WorkoutShareModal";
import {
  Play,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Share2,
  Check,
  Dumbbell,
} from "lucide-react";

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

export const HomePage: React.FC<{ exercises: Exercise[] }> = ({
  exercises,
}) => {
  const { activeSession, startRoutineWorkout, startFreeWorkout } =
    useWorkoutStore();
  const {
    setActiveTab,
    setSelectedMuscle,
    openRoutineEditor,
    openExerciseDetail,
  } = useNavigationStore();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [allSets, setAllSets] = useState<WorkoutSet[]>([]);
  const [goal, setGoal] = useState<WeeklyGoalSummary | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [routineId, setRoutineId] = useState<string | null>(null);
  const [sharingSession, setSharingSession] = useState<WorkoutSession | null>(
    null,
  );
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [rs, ss, sets] = await Promise.all([
          db.routines.orderBy("orderIndex").toArray(),
          db.sessions.orderBy("startTime").reverse().toArray(),
          db.sets.toArray(),
        ]);
        if (cancelled) return;
        setRoutines(rs);
        setSessions(ss.filter((s) => s.isCompleted));
        setAllSets(sets);
        setGoal(calculateWeeklyGoalStatus(rs, ss, sets));
      } catch {
        if (!cancelled)
          setError("운동 정보를 불러오지 못했습니다. 다시 열어주세요.");
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [activeSession, exercises]);

  const today = new Date();
  const weekStart = new Date(selectedDate);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + index);
    return day;
  });
  const scheduled = routines.filter((r) =>
    r.scheduledDays.includes(selectedDate.getDay() as DayOfWeek),
  );
  const routine = scheduled.find((r) => r.id === routineId) ?? scheduled[0];
  const targetSets =
    routine?.exercises.reduce((sum, item) => sum + item.targetSets, 0) ?? 0;
  const primaryMuscles = [
    ...new Set(
      routine?.exercises.flatMap(
        (item) =>
          exercises.find((e) => e.id === item.exerciseId)?.primaryMuscles ?? [],
      ) ?? [],
    ),
  ];
  const changeWeek = (direction: number) => {
    const day = new Date(selectedDate);
    day.setDate(day.getDate() + direction * 7);
    setSelectedDate(day);
    setRoutineId(null);
  };
  const start = async (free = false) => {
    if (starting) return;
    if (activeSession) {
      setActiveTab("workout");
      return;
    }
    setStarting(true);
    setError("");
    try {
      if (routine && !free) await startRoutineWorkout(routine, exercises);
      else await startFreeWorkout();
      setActiveTab("workout");
    } catch {
      setError("운동을 시작하지 못했습니다. 다시 시도해주세요.");
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-28 md:px-8 md:pt-10 md:pb-10">
      <div className="flex items-end justify-between gap-3 mb-6">
        <div>
          <p className="text-xs text-[#A9B2AC] mb-1">매일 조금씩, 더 강하게</p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            나의 운동
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('routines')}
          className="min-h-11 px-3 flex items-center gap-1.5 text-sm font-semibold text-[#B4F34C]"
        >
          <Plus size={18} />
          루틴 관리
        </button>
      </div>
      <section aria-label="주간 운동 일정" className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold mr-2">
              {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월
            </span>
            <button
              type="button"
              aria-label="이전 주"
              onClick={() => changeWeek(-1)}
              className="p-2"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              aria-label="다음 주"
              onClick={() => changeWeek(1)}
              className="p-2"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedDate(new Date());
              setRoutineId(null);
            }}
            className="min-h-11 px-3 text-xs text-[#A9B2AC]"
          >
            오늘
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((day) => {
            const selected = sameDay(day, selectedDate);
            const done = sessions.some((s) =>
              sameDay(new Date(s.startTime), day),
            );
            const planned = routines.some((r) =>
              r.scheduledDays.includes(day.getDay() as DayOfWeek),
            );
            return (
              <button
                key={day.toDateString()}
                type="button"
                aria-pressed={selected}
                aria-label={`${day.toLocaleDateString("ko-KR")} ${done ? "운동 완료" : planned ? "운동 예정" : "휴식"}`}
                onClick={() => {
                  setSelectedDate(day);
                  setRoutineId(null);
                }}
                className={`flex flex-col items-center gap-2 py-3 rounded-2xl transition-colors ${selected ? "bg-[#B4F34C] text-[#101510]" : "bg-[#303137] text-[#A9B2AC]"}`}
              >
                <span className="text-[11px]">
                  {day.toLocaleDateString("ko-KR", { weekday: "short" })}
                </span>
                <span
                  className={`text-lg font-bold ${!selected && sameDay(day, today) ? "text-[#B4F34C]" : ""}`}
                >
                  {day.getDate()}
                </span>
                {done ? (
                  <Check size={12} />
                ) : (
                  <span
                    className={`w-1 h-1 my-1 rounded-full ${planned ? (selected ? "bg-[#101510]" : "bg-[#B4F34C]") : "bg-transparent"}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </section>
      {error && (
        <p role="alert" className="text-sm text-[#FF806B] mb-4">
          {error}
        </p>
      )}
      {activeSession && (
        <button
          type="button"
          onClick={() => setActiveTab("workout")}
          className="w-full mb-5 p-4 rounded-2xl bg-[#303137] border border-[#B4F34C]/40 flex items-center justify-between gap-3 text-left"
        >
          <span>
            <span className="text-xs text-[#B4F34C] block mb-1">
              진행 중인 운동
            </span>
            <strong className="text-sm">{activeSession.name}</strong>
          </span>
          <span className="text-[#B4F34C] text-sm shrink-0">이어하기 →</span>
        </button>
      )}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-6 items-start">
        <div className="min-w-0 space-y-6">
          <section
            className="rounded-3xl bg-[#303137] overflow-hidden"
            aria-label="선택한 날의 운동"
          >
            <div className="p-5 border-b border-[#3E4048]">
              <p className="text-xs text-[#A9B2AC] mb-2">
                {sameDay(selectedDate, today)
                  ? "오늘의 운동"
                  : selectedDate.toLocaleDateString("ko-KR", {
                      month: "long",
                      day: "numeric",
                      weekday: "short",
                    })}
              </p>
              <h2 className="text-xl font-bold leading-snug">
                {routine?.name ?? "잠깐 쉬어가도 괜찮아요"}
              </h2>
              <p className="text-xs text-[#A9B2AC] mt-2">
                {routine
                  ? `${routine.exercises.length}개 종목 · ${targetSets}세트`
                  : "예정된 루틴이 없습니다. 자유 운동으로 시작해보세요."}
              </p>
              {scheduled.length > 1 && (
                <div className="flex gap-2 flex-wrap mt-4">
                  {scheduled.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      aria-pressed={r.id === routine?.id}
                      onClick={() => setRoutineId(r.id)}
                      className={`px-3 py-2 text-xs rounded-lg ${r.id === routine?.id ? "bg-[#B4F34C] text-[#101510]" : "bg-[#24252A] text-[#A9B2AC]"}`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="divide-y divide-[#3E4048]">
              {routine?.exercises.map((item, index) => {
                const exercise = exercises.find(
                  (e) => e.id === item.exerciseId,
                );
                if (!exercise) return null;
                return (
                  <button
                    key={`${item.exerciseId}-${index}`}
                    type="button"
                    onClick={() => openExerciseDetail(exercise.id)}
                    className="w-full flex items-center gap-3 p-4 sm:p-5 text-left hover:bg-[#3A3B43] transition-colors"
                  >
                    <ExerciseIllustration exercise={exercise} size="thumb" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold leading-snug">
                        {exercise.nameKo}
                      </span>
                      <span className="block mt-1.5 text-xs text-[#A9B2AC]">
                        {item.targetSets}세트 · {item.targetReps}회
                        {(item.targetWeight ?? 0) > 0
                          ? ` · ${item.targetWeight}kg`
                          : ""}
                      </span>
                    </span>
                    <ChevronRight
                      size={18}
                      className="text-[#A9B2AC] shrink-0"
                    />
                  </button>
                );
              })}
              {!routine && (
                <div className="py-10 px-5 text-center">
                  <Dumbbell className="mx-auto mb-3 text-[#A9B2AC]" size={32} />
                  <p className="text-sm font-semibold">
                    내 페이스에 맞춰 운동하세요
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('routines')}
                    className="min-h-11 mt-2 text-xs text-[#B4F34C]"
                  >
                    루틴 등록하러 가기 →
                  </button>
                </div>
              )}
            </div>
            <div className="p-4 sm:p-5">
              {routine && (
                <button
                  type="button"
                  onClick={() => openRoutineEditor(routine.id)}
                  className="w-full min-h-11 mb-3 text-sm text-[#A9B2AC] rounded-xl border border-[#3E4048]"
                >
                  루틴 편집
                </button>
              )}
              <button
                type="button"
                disabled={starting}
                onClick={() => void start()}
                className="w-full min-h-14 rounded-2xl bg-[#B4F34C] text-[#101510] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Play size={18} fill="currentColor" />
                {starting
                  ? "운동 준비 중…"
                  : activeSession
                    ? "진행 중인 운동 이어하기"
                    : routine
                      ? "이 루틴으로 운동 시작"
                      : "자유 운동 시작"}
              </button>
              {routine && !activeSession && (
                <button
                  type="button"
                  disabled={starting}
                  onClick={() => void start(true)}
                  className="w-full min-h-11 mt-2 text-xs text-[#A9B2AC] disabled:opacity-50"
                >
                  루틴 없이 자유 운동
                </button>
              )}
            </div>
          </section>
          <section aria-label="최근 운동 기록">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold">최근 운동</h2>
              <button
                type="button"
                onClick={() => setActiveTab("analytics")}
                className="min-h-11 text-xs text-[#A9B2AC]"
              >
                분석 보기 →
              </button>
            </div>
            {sessions.length === 0 ? (
              <div className="rounded-2xl bg-[#303137] p-6 text-center">
                <Clock size={22} className="mx-auto mb-2 text-[#A9B2AC]" />
                <p className="text-sm text-[#A9B2AC]">
                  첫 운동을 마치면 여기에 기록돼요.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-[#303137] divide-y divide-[#3E4048]">
                {sessions.slice(0, 3).map((s) => (
                  <div key={s.id} className="p-4 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{s.name}</p>
                      <p className="mt-1 text-xs text-[#A9B2AC]">
                        {new Date(s.startTime).toLocaleDateString("ko-KR")} ·{" "}
                        {s.exercises.length}개 종목
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`${s.name} 기록 공유`}
                      onClick={() => setSharingSession(s)}
                      className="p-3 text-[#A9B2AC]"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
        <aside className="space-y-5">
          <section className="rounded-3xl bg-[#303137] p-5">
            <h2 className="text-base font-bold mb-1">운동 부위</h2>
            <p className="text-xs text-[#A9B2AC] mb-4">
              {routine
                ? "선택한 루틴의 주요 근육"
                : "부위를 눌러 운동을 찾아보세요"}
            </p>
            <MuscleMap
              selectedMuscle={null}
              mode={routine ? "guide" : "explore"}
              primaryMuscles={primaryMuscles}
              dualView
              isCompact
              showSelectorList={false}
              onSelectMuscle={(id) => {
                setSelectedMuscle(id);
                setActiveTab("muscle");
              }}
            />
            <button
              type="button"
              onClick={() => setActiveTab("muscle")}
              className="min-h-11 mt-3 text-sm text-[#B4F34C] w-full flex items-center justify-between"
            >
              근육 지도에서 운동 찾기
              <ChevronRight size={16} />
            </button>
          </section>
          {goal && (
            <section className="rounded-3xl bg-[#303137] p-5">
              <h2 className="text-base font-bold mb-4">이번 주 목표</h2>
              <div className="flex items-end gap-1 mb-3">
                <strong className="text-3xl font-extrabold text-[#B4F34C]">
                  {goal.completionRatePercent}
                </strong>
                <span className="text-sm text-[#A9B2AC] mb-1">%</span>
              </div>
              <div
                role="progressbar"
                aria-label="이번 주 세트 달성률"
                aria-valuenow={Math.min(100, goal.completionRatePercent)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-1.5 rounded-full bg-[#24252A] overflow-hidden"
              >
                <div
                  className="h-full rounded-full bg-[#B4F34C]"
                  style={{
                    width: `${Math.min(100, goal.completionRatePercent)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-[#A9B2AC] mt-3">
                계획 {goal.totalPlannedSets}세트 중{" "}
                {goal.totalCompletedPlannedSets}세트 완료
              </p>
              {goal.unplannedSets > 0 && (
                <p className="text-xs text-[#A9B2AC] mt-2">
                  자유·추가 운동 {goal.unplannedSets}세트
                </p>
              )}
              {goal.uncompletedExercises.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#3E4048]">
                  <p className="text-xs text-[#A9B2AC] mb-2">
                    이번 주 남은 운동
                  </p>
                  {goal.uncompletedExercises.slice(0, 3).map((item) => (
                    <div
                      key={item.exerciseId}
                      className="flex justify-between gap-2 py-1.5 text-xs"
                    >
                      <span>
                        {exercises.find((e) => e.id === item.exerciseId)
                          ?.nameKo ?? item.exerciseId}
                      </span>
                      <span className="text-[#FF806B] shrink-0">
                        {item.missingSets}세트
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </aside>
      </div>
      {sharingSession && (
        <WorkoutShareModal
          session={sharingSession}
          sets={allSets}
          exercises={exercises}
          onClose={() => setSharingSession(null)}
        />
      )}
    </div>
  );
};
