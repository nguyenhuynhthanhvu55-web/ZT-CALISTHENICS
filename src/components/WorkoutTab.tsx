import React, { useState } from 'react';
import {
  Search,
  Filter,
  Bookmark,
  Clock,
  Flame,
  Plus,
  Play,
  Layers,
  BookOpen,
  Sparkles,
  Edit3,
  Trash2,
  Copy,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CustomWorkout } from '../types/calisthenics';
import { PREBUILT_WORKOUT_TEMPLATES } from '../data/workoutTemplates';
import { WORKOUTS_DATABASE } from '../data/mockData';
import { matchesVietnameseSearch } from '../utils/vietnamese';

export const WorkoutTab: React.FC = () => {
  const {
    customWorkouts,
    saveCustomWorkout,
    deleteCustomWorkout,
    startCustomWorkoutPlayer,
    setIsLibraryModalOpen,
    setIsWorkoutBuilderOpen,
    setEditingWorkoutForBuilder,
    savedWorkoutIds,
    toggleBookmark,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'my_workouts' | 'templates' | 'library'>('my_workouts');
  const [searchQuery, setSearchQuery] = useState('');
  const [goalFilter, setGoalFilter] = useState<'all' | 'giam_mo' | 'tang_co' | 'suc_manh' | 'phuc_hoi'>('all');

  const filteredWorkouts = customWorkouts.filter(w => {
    if (activeTab === 'templates' && !w.isPrebuiltTemplate) return false;
    if (activeTab === 'my_workouts' && w.isPrebuiltTemplate) return false;
    if (goalFilter !== 'all' && w.targetGoal !== goalFilter) return false;
    if (searchQuery.trim()) {
      const matchTitle = matchesVietnameseSearch(w.title, searchQuery);
      const matchDesc = matchesVietnameseSearch(w.description, searchQuery);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const handleDuplicate = (w: CustomWorkout) => {
    const copy: CustomWorkout = {
      ...w,
      id: `workout_dup_${Date.now()}`,
      title: `${w.title} (Bản sao)`,
      isPrebuiltTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveCustomWorkout(copy);
  };

  const handleEdit = (w: CustomWorkout) => {
    setEditingWorkoutForBuilder(w);
    setIsWorkoutBuilderOpen(true);
  };

  return (
    <div className="space-y-4 px-4 pt-4 pb-8 select-none">
      {/* 1. Header with Library & Builder Quick Actions */}
      <header className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-xl font-black text-white">Tập Luyện Calisthenics</h1>
          <p className="text-xs text-[#9A9CA3]">Tự ghép buổi tập hoặc chọn giáo án khoa học</p>
        </div>
      </header>

      {/* Hero Action Cards: Create Workout & Browse Library */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => {
            setEditingWorkoutForBuilder(null);
            setIsWorkoutBuilderOpen(true);
          }}
          className="p-4 rounded-[26px] bg-gradient-to-br from-[#2A2B2E] to-[#1E1F22] border border-[#D4FF4F]/50 hover:border-[#D4FF4F] text-left transition-all cursor-pointer shadow-lg active:scale-[0.98] group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#D4FF4F] text-[#121316] flex items-center justify-center font-bold mb-3 shadow-md group-hover:scale-105 transition-transform">
            <Plus size={22} strokeWidth={3} />
          </div>
          <div>
            <strong className="text-white text-xs block font-extrabold group-hover:text-[#D4FF4F] transition-colors">
              Tạo buổi tập mới
            </strong>
            <span className="text-[10px] text-[#9A9CA3] block mt-0.5">
              Ghép bài, đặt reps & hiệp tự chọn
            </span>
          </div>
        </button>

        <button
          onClick={() => setIsLibraryModalOpen(true)}
          className="p-4 rounded-[26px] bg-[#1E1F22] border border-[#2A2B2E] hover:border-[#383A3F] text-left transition-all cursor-pointer shadow-lg active:scale-[0.98] group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#2A2B2E] text-[#54A0FF] flex items-center justify-center font-bold mb-3 border border-[#383A3F] group-hover:scale-105 transition-transform">
            <BookOpen size={20} />
          </div>
          <div>
            <strong className="text-white text-xs block font-extrabold group-hover:text-[#54A0FF] transition-colors">
              Thư viện Calisthenics
            </strong>
            <span className="text-[10px] text-[#9A9CA3] block mt-0.5">
              Chuỗi tiến triển Đẩy, Kéo, Chân, Core
            </span>
          </div>
        </button>
      </div>

      {/* 2. Horizontal Tab Switcher */}
      <div className="flex bg-[#1E1F22] p-1 rounded-2xl border border-[#2A2B2E]">
        {[
          { id: 'my_workouts', label: 'Buổi tập của tôi' },
          { id: 'templates', label: 'Giáo án mẫu (8)' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#2A2B2E] text-[#D4FF4F] shadow-sm'
                : 'text-[#9A9CA3] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Search & Goal Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9CA3]" />
          <input
            type="text"
            placeholder="Tìm buổi tập (vd: Toàn thân, PPL, bụng, cardio...)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#1E1F22] border border-[#2A2B2E] rounded-full text-xs text-white placeholder-[#6B6D75] focus:outline-none focus:border-[#D4FF4F]"
          />
        </div>

        {/* Goal Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Tất cả mục tiêu' },
            { id: 'giam_mo', label: 'Giảm mỡ' },
            { id: 'tang_co', label: 'Tăng cơ' },
            { id: 'suc_manh', label: 'Sức mạnh' },
            { id: 'phuc_hoi', label: 'Phục hồi' },
          ].map(g => (
            <button
              key={g.id}
              onClick={() => setGoalFilter(g.id as any)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                goalFilter === g.id
                  ? 'bg-[#D4FF4F] text-[#121316]'
                  : 'bg-[#1E1F22] text-[#9A9CA3] hover:text-white border border-[#2A2B2E]'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Workout Cards List */}
      <div className="space-y-3">
        {filteredWorkouts.map(workout => (
          <div
            key={workout.id}
            className="p-4 rounded-[26px] bg-[#2A2B2E] border border-[#383A3F]/50 hover:border-[#D4FF4F]/50 transition-all space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#1E1F22] border border-[#383A3F] flex items-center justify-center text-2xl shrink-0">
                  {workout.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white">{workout.title}</h3>
                    {workout.isPrebuiltTemplate && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#54A0FF]/15 text-[#54A0FF] font-bold">
                        Mẫu
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#9A9CA3] line-clamp-2 mt-1 leading-relaxed">
                    {workout.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Metrics Row: Time, Calories, Exercises count */}
            <div className="flex items-center justify-between text-xs text-[#9A9CA3] bg-[#1E1F22] p-2.5 rounded-xl border border-[#2A2B2E]">
              <span className="flex items-center gap-1 font-tabular">
                <Clock size={12} className="text-[#D4FF4F]" /> {workout.estimatedDurationMinutes} phút
              </span>
              <span className="flex items-center gap-1 font-tabular font-bold text-white">
                <Flame size={12} className="text-[#FF9F43]" /> ~{workout.estimatedCaloriesBurned} kcal
              </span>
              <span className="font-tabular font-bold text-[#D4FF4F]">
                {workout.exercises.length} bài tập
              </span>
            </div>

            {/* Action Buttons: Start Now, Edit, Duplicate, Delete */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={() => startCustomWorkoutPlayer(workout)}
                className="flex-1 py-3 rounded-full bg-[#D4FF4F] text-[#121316] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-[#C5F23E] cursor-pointer active:scale-95 transition-all"
              >
                <Play size={14} fill="#121316" />
                <span>Bắt đầu tập ngay</span>
              </button>

              <button
                onClick={() => handleEdit(workout)}
                aria-label={`Chỉnh sửa ${workout.title}`}
                className="w-9 h-9 rounded-full bg-[#1E1F22] text-[#9A9CA3] hover:text-white border border-[#383A3F] flex items-center justify-center transition-colors"
                title="Chỉnh sửa buổi tập"
              >
                <Edit3 size={14} />
              </button>

              <button
                onClick={() => handleDuplicate(workout)}
                aria-label={`Nhân bản ${workout.title}`}
                className="w-9 h-9 rounded-full bg-[#1E1F22] text-[#9A9CA3] hover:text-[#D4FF4F] border border-[#383A3F] flex items-center justify-center transition-colors"
                title="Tạo bản sao"
              >
                <Copy size={14} />
              </button>

              {!workout.isPrebuiltTemplate && (
                <button
                  onClick={() => deleteCustomWorkout(workout.id)}
                  aria-label={`Xóa ${workout.title}`}
                  className="w-9 h-9 rounded-full bg-[#1E1F22] text-[#9A9CA3] hover:text-[#FF6B6B] border border-[#383A3F] flex items-center justify-center transition-colors"
                  title="Xóa buổi tập"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredWorkouts.length === 0 && (
          <div className="text-center py-10 space-y-2">
            <p className="text-xs font-bold text-white">Chưa có buổi tập nào trong mục này</p>
            <p className="text-[11px] text-[#9A9CA3]">
              Bấm nút "Tạo buổi tập mới" ở trên để ghép bài tập theo ý thích của bạn.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
