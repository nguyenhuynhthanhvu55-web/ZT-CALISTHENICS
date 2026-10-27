import React, { useState } from 'react';
import { X, Scale, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WeightLogModal: React.FC = () => {
  const { weightLogModalOpen, setWeightLogModalOpen, recordWeight, profile } = useApp();
  const [weight, setWeight] = useState<number>(profile.weightKg || 68.2);

  if (!weightLogModalOpen) return null;

  const handleSave = () => {
    recordWeight(Number(weight.toFixed(1)));
    setWeightLogModalOpen(false);
  };

  const diffFromTarget = Number((weight - profile.targetWeightKg).toFixed(1));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ghi cân nặng"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
      onClick={() => setWeightLogModalOpen(false)}
    >
      <div
        className="w-full max-w-[380px] bg-[#1E1F22] border-t sm:border border-[#383A3F] rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl space-y-5 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#FF9F43]">
            <Scale size={20} />
            <h3 className="text-base font-bold text-white">Ghi cân nặng hôm nay</h3>
          </div>
          <button
            onClick={() => setWeightLogModalOpen(false)}
            className="w-8 h-8 rounded-full bg-[#2A2B2E] text-[#9A9CA3] hover:text-white flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Big Weight Display */}
        <div className="rounded-[24px] bg-[#2A2B2E] p-5 text-center border border-[#383A3F]/50 space-y-1">
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-5xl font-black text-[#D4FF4F] font-tabular">{weight.toFixed(1)}</span>
            <span className="text-lg font-bold text-[#9A9CA3]">kg</span>
          </div>
          <p className="text-xs text-[#9A9CA3]">
            Mục tiêu: <strong className="text-white">{profile.targetWeightKg} kg</strong> (còn {diffFromTarget > 0 ? `${diffFromTarget} kg` : 'đã đạt'})
          </p>
        </div>

        {/* Stepper buttons and slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setWeight(w => Math.max(30, Number((w - 0.1).toFixed(1))))}
              className="w-12 h-12 rounded-2xl bg-[#2A2B2E] hover:bg-[#383A3F] text-white font-bold text-lg flex items-center justify-center border border-[#383A3F] active:scale-95 transition-all cursor-pointer"
            >
              -0.1
            </button>
            <input
              type="range"
              min="40"
              max="120"
              step="0.1"
              value={weight}
              onChange={e => setWeight(Number(e.target.value))}
              className="flex-1 accent-[#D4FF4F] cursor-pointer"
            />
            <button
              onClick={() => setWeight(w => Math.min(150, Number((w + 0.1).toFixed(1))))}
              className="w-12 h-12 rounded-2xl bg-[#2A2B2E] hover:bg-[#383A3F] text-white font-bold text-lg flex items-center justify-center border border-[#383A3F] active:scale-95 transition-all cursor-pointer"
            >
              +0.1
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-full bg-[#D4FF4F] text-[#121316] font-bold text-sm flex items-center justify-center gap-1.5 shadow-md hover:bg-[#C5F23E] cursor-pointer"
        >
          <Check size={18} strokeWidth={3} />
          <span>Lưu số đo cân nặng</span>
        </button>
      </div>
    </div>
  );
};
