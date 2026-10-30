import React, { useState, useMemo } from 'react';
import { Exercise, ExerciseCategory } from '../../types';
import { MUSCLE_DEFINITIONS } from '../../data/muscles';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { useNavigationStore } from '../../stores/useNavigationStore';
import { ExerciseIllustration } from '../exercise/ExerciseIllustration';
import { Search, X, Plus, Dumbbell, Sparkles } from 'lucide-react';

interface ExercisePickerModalProps {
  exercises: Exercise[];
  onClose: () => void;
}

export const ExercisePickerModal: React.FC<ExercisePickerModalProps> = ({ exercises, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all');

  const { addExerciseToSession } = useWorkoutStore();
  const { openExerciseDetail } = useNavigationStore();

  const categories: { id: ExerciseCategory | 'all'; label: string }[] = [
    { id: 'all', label: '전체' },
    { id: 'chest', label: '가슴' },
    { id: 'back', label: '등' },
    { id: 'shoulders', label: '어깨' },
    { id: 'arms', label: '팔' },
    { id: 'legs', label: '하체' },
    { id: 'core', label: '코어' },
    { id: 'cardio', label: '유산소' },
  ];

  const filtered = useMemo(() => {
    let list = exercises;
    if (selectedCategory !== 'all') {
      list = list.filter((e) => e.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.nameKo.toLowerCase().includes(q) ||
          e.nameEn.toLowerCase().includes(q) ||
          e.aliases.some((a) => a.toLowerCase().includes(q))
      );
    }
    return list;
  }, [exercises, selectedCategory, search]);

  const handleSelect = async (exercise: Exercise) => {
    await addExerciseToSession(exercise.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#1B1C20] border border-[#3E4048] rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#A9AAB3] hover:text-[#F4F4F5] hover:bg-[#303137] rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-black text-[#F4F4F5] mb-3">운동 종목 선택 및 추가</h3>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A9AAB3]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="운동명, 별칭 검색 (예: 벤치, 스쿼트)..."
            className="w-full h-11 pl-10 pr-4 bg-[#303137] border border-[#3E4048] rounded-xl text-xs text-[#F4F4F5] placeholder-[#A9AAB3] focus:outline-none focus:border-[#B4F34C]"
          />
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl shrink-0 font-bold transition-all ${
                selectedCategory === c.id
                  ? 'bg-[#B4F34C] text-[#101510]'
                  : 'bg-[#303137] text-[#A9AAB3] hover:text-[#F4F4F5] border border-[#3E4048]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Exercises Scroll List with Thumbnails (Planfit style) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 mt-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#A9AAB3]">
              검색된 운동 종목이 없습니다.
            </div>
          ) : (
            filtered.map((ex) => (
              <div
                key={ex.id}
                onClick={() => handleSelect(ex)}
                className="p-2.5 bg-[#26282E] hover:bg-[#303137] border border-[#3E4048] hover:border-[#B4F34C]/40 rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ExerciseIllustration
                    exercise={ex}
                    size="thumb"
                    className="w-11 h-11 rounded-xl shrink-0"
                    highlightColor="#FF806B"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#303137] text-[#A9AAB3]">
                        {ex.equipment}
                      </span>
                      <span className="text-xs font-bold text-[#FF806B]">
                        {MUSCLE_DEFINITIONS[ex.primaryMuscles[0]]?.nameKo}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#F4F4F5] group-hover:text-[#B4F34C] transition-colors truncate mt-0.5">
                      {ex.nameKo}
                    </h4>
                    <p className="text-[11px] text-[#A9AAB3] truncate">{ex.nameEn}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                      openExerciseDetail(ex.id);
                    }}
                    className="p-1.5 text-xs text-[#A9AAB3] hover:text-[#B4F34C] hover:bg-[#303137] rounded-xl transition-all"
                    title="상세 설명 보기"
                  >
                    상세
                  </button>

                  <button
                    type="button"
                    className="p-2 rounded-xl bg-[#B4F34C] text-[#101510] font-bold group-hover:scale-105 transition-transform"
                    title="추가"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
