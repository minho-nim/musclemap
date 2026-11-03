import React, { useEffect, useState } from 'react';
import { Plus, ClipboardList } from 'lucide-react';
import { db } from '../db';
import { Exercise, Routine } from '../types';
import { RoutineList } from '../components/routine/RoutineList';
import { useNavigationStore } from '../stores/useNavigationStore';

export function RoutinesPage({ exercises }: { exercises: Exercise[] }) {
  const { openRoutineEditor } = useNavigationStore();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = async () => {
    try { setRoutines(await db.routines.orderBy('orderIndex').toArray()); setError(''); }
    catch { setError('루틴을 불러오지 못했습니다. 다시 시도해주세요.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [exercises]);
  return <div className="mx-auto max-w-4xl px-4 py-6 pb-28 md:px-8 md:py-10">
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div><p className="text-xs text-[#A9B2AC] mb-1">나에게 맞는 운동 계획</p><h1 className="text-2xl font-extrabold">루틴 관리</h1><p className="text-xs text-[#A9B2AC] mt-2">요일과 종목별 목표를 미리 등록하고 운동할 때 불러오세요.</p></div>
      <button type="button" onClick={() => openRoutineEditor()} className="min-h-12 px-5 rounded-2xl bg-[#B4F34C] text-[#101510] flex items-center justify-center gap-2 font-bold text-sm"><Plus size={18} />새 루틴 등록</button>
    </div>
    {loading ? <p role="status" className="py-10 text-center text-[#A9B2AC]">루틴을 불러오는 중…</p> : error ? <div role="alert" className="text-[#FF806B] p-5">{error}<button type="button" onClick={() => void load()} className="block mt-3 text-[#B4F34C]">다시 시도</button></div> : routines.length ? <RoutineList routines={routines} exercises={exercises} onRefresh={() => void load()} /> : <div className="p-10 text-center bg-[#303137] rounded-3xl"><ClipboardList className="mx-auto text-[#A9B2AC] mb-4" size={32} /><h2 className="font-bold mb-2">첫 루틴을 등록해보세요</h2><p className="text-sm text-[#A9B2AC] mb-5">운동 종목과 목표 세트를 한곳에서 설정할 수 있어요.</p><button type="button" onClick={() => openRoutineEditor()} className="text-sm min-h-11 text-[#B4F34C]">루틴 등록하기 →</button></div>}
  </div>;
}
