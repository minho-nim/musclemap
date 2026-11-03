import React, { useEffect, useState } from 'react';
import { db } from '../db';
import { Exercise, WorkoutSession } from '../types';
import { useWorkoutStore } from '../stores/useWorkoutStore';
import { useNavigationStore } from '../stores/useNavigationStore';
import { ActiveWorkout } from '../components/workout/ActiveWorkout';
import { Play, ClipboardList, History, CheckCircle2 } from 'lucide-react';

export const WorkoutPage: React.FC<{ exercises: Exercise[] }> = ({ exercises }) => {
  const { activeSession, startFreeWorkout } = useWorkoutStore();
  const { setActiveTab } = useNavigationStore();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);
  useEffect(() => {
    db.sessions.orderBy('startTime').reverse().toArray()
      .then(items => setSessions(items.filter(item => item.isCompleted)))
      .catch(() => setError('운동 기록을 불러오지 못했습니다.'));
  }, [activeSession]);
  const start = async () => {
    if (starting) return;
    setStarting(true); setError('');
    try { await startFreeWorkout(); }
    catch { setError('운동을 시작하지 못했습니다. 다시 시도해주세요.'); }
    finally { setStarting(false); }
  };
  if (activeSession) return <ActiveWorkout exercises={exercises} />;
  return <div className="max-w-4xl mx-auto px-4 py-6 pb-28 md:px-8 md:py-10 space-y-6">
    <div><h1 className="text-2xl font-extrabold">운동 기록</h1><p className="text-xs text-[#A9B2AC] mt-2">운동을 시작하고 완료한 기록을 확인하세요.</p></div>
    <div className="grid sm:grid-cols-2 gap-3">
      <button type="button" disabled={starting} onClick={() => void start()} className="min-h-14 px-5 rounded-2xl bg-[#B4F34C] text-[#101510] flex items-center justify-center gap-2 font-bold text-sm disabled:opacity-50"><Play size={18} fill="currentColor" />{starting ? '운동 준비 중…' : '자유 운동 시작'}</button>
      <button type="button" onClick={() => setActiveTab('routines')} className="min-h-14 px-5 rounded-2xl bg-[#303137] flex items-center justify-center gap-2 font-semibold text-sm"><ClipboardList size={18} className="text-[#B4F34C]" />등록한 루틴 선택</button>
    </div>
    {error && <p role="alert" className="text-sm text-[#FF806B]">{error}</p>}
    <section><h2 className="flex items-center gap-2 text-base font-bold mb-4"><History size={18} className="text-[#A9B2AC]" />완료한 운동 <span className="text-[#A9B2AC] text-sm">{sessions.length}</span></h2>
      {sessions.length === 0 ? <div className="bg-[#303137] rounded-2xl p-8 text-center text-sm text-[#A9B2AC]">아직 완료한 운동이 없습니다.</div> : <div className="space-y-3">{sessions.map(session => <div key={session.id} className="bg-[#303137] rounded-2xl p-4 flex items-center gap-3"><div className="min-w-0 flex-1"><h3 className="text-sm font-bold">{session.name}</h3><p className="text-xs text-[#A9B2AC] mt-1">{new Date(session.startTime).toLocaleString('ko-KR')} · {session.exercises.length}개 종목</p></div><CheckCircle2 size={18} className="text-[#B4F34C] shrink-0" /></div>)}</div>}
    </section>
  </div>;
};
