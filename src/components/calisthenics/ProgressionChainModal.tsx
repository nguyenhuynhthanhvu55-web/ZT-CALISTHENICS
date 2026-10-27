import React, { useState } from 'react';
import { X, Check, Lock, ChevronRight, Sparkles, ArrowUpRight } from 'lucide-react';
import { CALISTHENICS_EXERCISES } from '../../data/calisthenicsExercises';
import { CalisthenicsExercise } from '../../types/calisthenics';
import { useApp } from '../../context/AppContext';

interface ProgressionChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: CalisthenicsExercise) => void;
}

export const ProgressionChainModal: React.FC<ProgressionChainModalProps> = ({
  isOpen,
  onClose,
  onSelectExercise,
}) => {
  const { profile } = useApp();

  const chains: { id: string; title: string; icon: string; desc: string }[] = [
    {
      id: 'pushup_chain',
      title: 'Chuỗi Hít Đất (Push-up)',
      icon: '💪',
      desc: 'Từ hít đất tường đến hít đất 1 tay đỉnh cao',
    },
    {
      id: 'squat_chain',
      title: 'Chuỗi Squat Chân Mông',
      icon: '🦵',
      desc: 'Từ squat chạm ghế đến Pistol Squat 1 chân',
    },
    {
      id: 'pullup_chain',
      title: 'Chuỗi Kéo Xà & Lưng Xô',
      icon: '🏋️‍♂️',
      desc: 'Từ chèo bàn & kéo khăn đến Pull-up và Muscle-up',
    },
    {
      id: 'plank_chain',
      title: 'Chuỗi Core & Plank Thể Dục',
      icon: '🧘‍♂️',
      desc: 'Từ knee plank đến Hollow Body thể dục dụng cụ',
    },
  ];

  const [activeChainId, setActiveChainId] = useState<string>('pushup_chain');

  if (!isOpen) return null;

  // Filter exercises belonging to this progression chain ordered by step
  const chainExercises = CALISTHENICS_EXERCISES.filter(
    e => e.progressionChainId === activeChainId
  ).sort((a, b) => (a.progressionStep || 0) - (b.progressionStep || 0));

  // Determine user's current recommended step based on fitnessLevel
  const userLevel = profile.fitnessLevel || 'trung_binh';
  const unlockedLevel = userLevel === 'moi_bat_dau' ? 2 : userLevel === 'trung_binh' ? 4 : 5;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chuỗi tiến triển Calisthenics"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] max-h-[92vh] bg-[#1E1F22] border-t sm:border border-[#383A3F] rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col shadow-2xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#2A2B2E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#D4FF4F]" size={20} />
            <div>
              <h2 className="text-base font-black text-white">Bậc Thang Tiến Triển</h2>
              <p className="text-xs text-[#9A9CA3]">Chinh phục từng cấp độ chuyển động</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng bậc thang tiến triển"
            className="w-8 h-8 rounded-full bg-[#2A2B2E] text-[#9A9CA3] hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Chain Selector Tabs */}
        <div className="flex gap-1.5 p-3 overflow-x-auto no-scrollbar border-b border-[#2A2B2E]">
          {chains.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveChainId(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeChainId === c.id
                  ? 'bg-[#D4FF4F] text-[#121316] shadow-sm'
                  : 'bg-[#2A2B2E] text-[#9A9CA3] hover:text-white'
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.title.split(' ')[1]}</span>
            </button>
          ))}
        </div>

        {/* Progression Ladder List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          <div className="text-xs text-[#9A9CA3] mb-2 px-1">
            {chains.find(c => c.id === activeChainId)?.desc}. Bạn có thể chọn bất kỳ bài nào để tập luyện.
          </div>

          {chainExercises.map((ex, idx) => {
            const isUnlocked = ex.level <= unlockedLevel;
            const isCurrentRecommended = ex.level === unlockedLevel;

            return (
              <div
                key={ex.id}
                onClick={() => {
                  onSelectExercise(ex);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  isCurrentRecommended
                    ? 'bg-[#2A2B2E] border-[#D4FF4F] shadow-[0_0_15px_rgba(212,255,79,0.15)]'
                    : isUnlocked
                    ? 'bg-[#1E1F22] border-[#2A2B2E] hover:border-[#383A3F]'
                    : 'bg-[#18191C] border-[#25262A] opacity-75'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Step Badge */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold font-tabular shrink-0 ${
                      isCurrentRecommended
                        ? 'bg-[#D4FF4F] text-[#121316]'
                        : isUnlocked
                        ? 'bg-[#2A2B2E] text-white border border-[#383A3F]'
                        : 'bg-[#121316] text-[#9A9CA3]'
                    }`}
                  >
                    Bậc {idx + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{ex.nameVi}</h4>
                      {isCurrentRecommended && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#D4FF4F]/20 text-[#D4FF4F] font-bold">
                          Đề xuất cho bạn
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#9A9CA3] block mt-0.5">
                      Cấp {ex.level} • {ex.equipment === 'none' ? 'Không dụng cụ' : 'Đồ nhà'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ArrowUpRight size={16} className="text-[#9A9CA3]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
