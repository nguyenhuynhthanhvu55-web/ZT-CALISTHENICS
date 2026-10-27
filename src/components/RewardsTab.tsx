import React from 'react';
import { Flame, Award, Trophy, Target, Sparkles, Check, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RewardsTab: React.FC = () => {
  const { badges, streakDays, setActiveTab } = useApp();

  return (
    <div className="space-y-4 px-4 pt-4 pb-8 select-none">
      {/* 1. Header */}
      <header className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-xl font-black text-white">Thành Tích & Huy Hiệu</h1>
          <p className="text-xs text-[#9A9CA3]">Ghi nhận nỗ lực của chính bạn, từng ngày một</p>
        </div>
      </header>

      {/* 2. Banner Chuỗi ngày liên tiếp */}
      <section
        aria-label="Chuỗi ngày liên tiếp"
        className="rounded-[28px] bg-gradient-to-r from-[#2A2B2E] via-[#2A2B2E] to-[#1E1F22] p-5 border border-[#383A3F]/70 flex items-center justify-between relative overflow-hidden"
      >
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-[#FF9F43] fill-[#FF9F43] animate-pulse" />
            <span className="text-xs uppercase font-extrabold tracking-wider text-[#FF9F43]">
              Ngọn lửa kiên trì
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white font-tabular">{streakDays}</span>
            <span className="text-sm font-bold text-[#D4FF4F]">ngày liên tiếp!</span>
          </div>
          <p className="text-xs text-[#9A9CA3]">
            Bạn đã ghi nhật ký và vận động đều đặn. Cố gắng thêm 3 ngày nữa để mở khóa huy hiệu tuần!
          </p>
        </div>

        <div className="text-6xl z-10 shrink-0">🔥</div>

        {/* Ambient glow */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-[#FF9F43]/15 rounded-full blur-2xl pointer-events-none" />
      </section>

      {/* 3. Thẻ Thử thách tuần */}
      <section
        aria-label="Thử thách tuần"
        className="rounded-[28px] bg-[#1E1F22] p-5 border border-[#2A2B2E] space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#D4FF4F]">
            <Target size={18} />
            <h3 className="text-sm font-bold text-white">Thử thách tuần này</h3>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#D4FF4F]/20 text-[#D4FF4F] font-bold">
            Còn 3 ngày
          </span>
        </div>

        <p className="text-xs text-white font-semibold leading-relaxed">
          Hoàn thành 4 buổi tập không dụng cụ & uống đủ 2L nước mỗi ngày.
        </p>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-[#9A9CA3] font-medium">
            <span>Tiến độ thử thách:</span>
            <span className="text-[#D4FF4F] font-bold font-tabular">3 / 4 buổi</span>
          </div>
          <div className="w-full h-2 bg-[#2A2B2E] rounded-full overflow-hidden">
            <div className="h-full bg-[#D4FF4F] rounded-full" style={{ width: '75%' }} />
          </div>
        </div>

        <button
          onClick={() => setActiveTab('workout')}
          className="w-full py-2.5 rounded-full bg-[#2A2B2E] hover:bg-[#383A3F] text-xs font-bold text-white border border-[#383A3F] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Tập ngay để hoàn tất thử thách</span>
          <ArrowRight size={13} />
        </button>
      </section>

      {/* 4. Huy hiệu cột mốc (Grid) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Huy hiệu cột mốc ({badges.filter(b => b.achieved).length}/{badges.length})</h3>
          <span className="text-xs text-[#9A9CA3]">Không so sánh, chỉ tập trung vào bản thân</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {badges.map(badge => (
            <div
              key={badge.id}
              className={`p-4 rounded-[24px] border transition-all flex flex-col justify-between ${
                badge.achieved
                  ? 'bg-[#2A2B2E] border-[#D4FF4F]/50 shadow-[0_0_15px_rgba(212,255,79,0.08)]'
                  : 'bg-[#18191C] border-[#2A2B2E] opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{badge.icon}</span>
                  {badge.achieved ? (
                    <span className="w-6 h-6 rounded-full bg-[#D4FF4F] text-[#121316] flex items-center justify-center">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#9A9CA3] font-bold font-tabular">
                      {badge.progressPercent}%
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-white line-clamp-1">{badge.title}</h4>
                <p className="text-[11px] text-[#9A9CA3] mt-1 leading-snug line-clamp-2">
                  {badge.description}
                </p>
              </div>

              {!badge.achieved && (
                <div className="w-full h-1.5 bg-[#2A2B2E] rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-[#D4FF4F] rounded-full"
                    style={{ width: `${badge.progressPercent}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
