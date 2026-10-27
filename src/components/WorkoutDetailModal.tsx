import React, { useState } from 'react';
import {
  X,
  Clock,
  Flame,
  Music,
  ShieldAlert,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EXERCISES_DATABASE } from '../data/mockData';
import { Workout } from '../types';

export const WorkoutDetailModal: React.FC = () => {
  const {
    selectedWorkoutForDetail,
    setSelectedWorkoutForDetail,
    startWorkoutPlayer,
  } = useApp();

  const workout = selectedWorkoutForDetail;
  // Local state to track which exercises are toggled to easier or harder
  const [exerciseVariations, setExerciseVariations] = useState<Record<string, 'normal' | 'easier' | 'harder'>>({});

  if (!workout) return null;

  const handleToggleVariation = (exerciseId: string, type: 'easier' | 'harder') => {
    setExerciseVariations(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId] === type ? 'normal' : type,
    }));
  };

  const exerciseItems = workout.exercises.map(item => {
    const exerciseData = EXERCISES_DATABASE.find(e => e.id === item.exerciseId);
    const variation = exerciseVariations[item.exerciseId] || 'normal';
    return {
      ...item,
      data: exerciseData,
      currentVariation: variation,
    };
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Chi tiết buổi tập ${workout.title}`}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
      onClick={() => setSelectedWorkoutForDetail(null)}
    >
      <div
        className="w-full max-w-[420px] max-h-[92vh] bg-[#1E1F22] border-t sm:border border-[#383A3F] rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col shadow-2xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Hero Banner & Close */}
        <div className="relative h-44 bg-gradient-to-tr from-[#121316] via-[#1E1F22] to-[#2A2B2E] p-4 flex flex-col justify-between border-b border-[#383A3F]">
          <div className="flex justify-between items-center z-10">
            <span className="text-xs px-3 py-1 rounded-full bg-[#121316]/80 text-[#D4FF4F] font-bold border border-[#383A3F]">
              Không dụng cụ
            </span>
            <button
              onClick={() => setSelectedWorkoutForDetail(null)}
              aria-label="Đóng chi tiết buổi tập"
              className="w-8 h-8 rounded-full bg-[#121316]/80 text-[#9A9CA3] hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="z-10 text-center my-auto">
            <span className="text-5xl block animate-bounce">⚡</span>
          </div>

          <div className="z-10 flex gap-2">
            <span className="px-3 py-1 rounded-full bg-[#121316]/90 text-xs font-bold text-white flex items-center gap-1 font-tabular">
              <Clock size={13} className="text-[#D4FF4F]" /> {workout.durationMinutes} phút
            </span>
            <span className="px-3 py-1 rounded-full bg-[#121316]/90 text-xs font-bold text-white flex items-center gap-1 font-tabular">
              <Flame size={13} className="text-[#FF9F43]" /> ~{workout.estimatedCalories} kcal
            </span>
          </div>

          {/* Decorative ambient background */}
          <div className="absolute inset-0 bg-radial from-[#D4FF4F]/10 to-transparent pointer-events-none" />
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Title & Giới thiệu */}
          <div>
            <h2 className="text-xl font-black text-white">{workout.title}</h2>
            <p className="text-xs text-[#9A9CA3] leading-relaxed mt-1.5">
              {workout.description}
            </p>
          </div>

          {/* 3 Chỉ số: Cấp độ | Tiến độ | Nhóm cơ chính */}
          <div className="grid grid-cols-3 gap-2 rounded-[22px] bg-[#2A2B2E] p-3 text-center border border-[#383A3F]/50">
            <div>
              <span className="text-[10px] text-[#9A9CA3] font-bold block">CẤP ĐỘ</span>
              <span className="text-xs font-extrabold text-[#D4FF4F]">{workout.level}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#9A9CA3] font-bold block">TIẾN ĐỘ</span>
              <span className="text-xs font-extrabold text-white font-tabular">{workout.exercises.length} bài tập</span>
            </div>
            <div>
              <span className="text-[10px] text-[#9A9CA3] font-bold block">NHÓM CƠ</span>
              <span className="text-xs font-extrabold text-white truncate block">
                {workout.targetMuscles[0] || 'Toàn thân'}
              </span>
            </div>
          </div>

          {/* Mục Âm nhạc */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#2A2B2E]/60 border border-[#383A3F]/40 text-xs">
            <div className="w-8 h-8 rounded-full bg-[#1E1F22] flex items-center justify-center text-[#D4FF4F]">
              <Music size={16} />
            </div>
            <div>
              <span className="text-[#9A9CA3] block text-[11px]">Âm nhạc gợi ý:</span>
              <strong className="text-white">{workout.musicVibe}</strong>
            </div>
          </div>

          {/* Mục Hướng dẫn / Lưu ý kỹ thuật */}
          <div className="p-3.5 rounded-2xl bg-[#1E1F22] border border-[#383A3F]/60 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-[#FF9F43] font-bold">
              <ShieldAlert size={15} />
              <span>Lưu ý kỹ thuật an toàn</span>
            </div>
            <ul className="text-[#9A9CA3] space-y-1 text-[11px] list-disc list-inside">
              <li>Khởi động xoay nhẹ cổ chân, cổ tay và khớp gối trước khi bắt đầu.</li>
              <li>Thở ra khi dùng lực (đẩy người lên), hít sâu khi hạ người xuống.</li>
              <li>Nếu thấy đau nhói ở khớp gối hoặc lưng, lập tức bấm nút đổi bài "Dễ hơn".</li>
            </ul>
          </div>

          {/* Danh sách bài tập */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Danh sách bài tập ({workout.exercises.length} bài)</h3>
              <span className="text-[11px] text-[#D4FF4F]">Có thể đổi biến thể</span>
            </div>

            <div className="space-y-2">
              {exerciseItems.map((item, index) => {
                const ex = item.data;
                if (!ex) return null;

                const displayName =
                  item.currentVariation === 'easier' && ex.easierAlternative
                    ? ex.easierAlternative.name
                    : item.currentVariation === 'harder' && ex.harderAlternative
                    ? ex.harderAlternative.name
                    : ex.vietnameseName;

                return (
                  <div
                    key={item.exerciseId}
                    className="p-3 rounded-2xl bg-[#2A2B2E] border border-[#383A3F]/40 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-[#1E1F22] text-[#D4FF4F] font-bold text-[11px] flex items-center justify-center font-tabular">
                          {index + 1}
                        </span>
                        <div>
                          <strong className="text-white block text-xs">{displayName}</strong>
                          <span className="text-[11px] text-[#9A9CA3] font-tabular">
                            ⏱ {item.seconds || ex.defaultDurationSec}s • {ex.targetMuscle}
                          </span>
                        </div>
                      </div>

                      {/* Variation badge */}
                      {item.currentVariation !== 'normal' && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            item.currentVariation === 'easier'
                              ? 'bg-[#54A0FF]/20 text-[#54A0FF]'
                              : 'bg-[#FF9F43]/20 text-[#FF9F43]'
                          }`}
                        >
                          {item.currentVariation === 'easier' ? 'Dễ hơn' : 'Khó hơn'}
                        </span>
                      )}
                    </div>

                    {/* Easier / Harder Toggle Buttons */}
                    <div className="flex items-center gap-2 pt-1 border-t border-[#383A3F]/30 text-[11px]">
                      {ex.easierAlternative && (
                        <button
                          onClick={() => handleToggleVariation(item.exerciseId, 'easier')}
                          className={`flex-1 py-1 rounded-lg border transition-all cursor-pointer ${
                            item.currentVariation === 'easier'
                              ? 'bg-[#54A0FF] text-[#121316] font-bold border-[#54A0FF]'
                              : 'bg-[#1E1F22] text-[#9A9CA3] border-[#383A3F] hover:text-white'
                          }`}
                        >
                          ↓ Đổi Dễ hơn
                        </button>
                      )}
                      {ex.harderAlternative && (
                        <button
                          onClick={() => handleToggleVariation(item.exerciseId, 'harder')}
                          className={`flex-1 py-1 rounded-lg border transition-all cursor-pointer ${
                            item.currentVariation === 'harder'
                              ? 'bg-[#FF9F43] text-[#121316] font-bold border-[#FF9F43]'
                              : 'bg-[#1E1F22] text-[#9A9CA3] border-[#383A3F] hover:text-white'
                          }`}
                        >
                          ↑ Đổi Khó hơn
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Button (Lime Pill) */}
        <div className="p-4 bg-[#18191C] border-t border-[#2A2B2E]">
          <button
            onClick={() => startWorkoutPlayer(workout)}
            className="w-full py-4 rounded-full bg-[#D4FF4F] text-[#121316] font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-[#C5F23E] active:scale-[0.99] transition-all cursor-pointer"
          >
            <Play size={18} fill="#121316" />
            <span>Bắt đầu buổi tập này</span>
          </button>
        </div>
      </div>
    </div>
  );
};
