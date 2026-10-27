import React, { useState } from 'react';
import {
  Flame,
  Moon,
  Sun,
  Footprints,
  Play,
  Plus,
  ChevronRight,
  Sparkles,
  Coffee,
  SunMedium,
  Sunset,
  Apple,
  TrendingUp,
  Settings,
  HelpCircle,
  Dumbbell,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MealType } from '../types';
import { WORKOUTS_DATABASE } from '../data/mockData';

export const HomeTab: React.FC = () => {
  const {
    profile,
    todayLog,
    theme,
    toggleTheme,
    setActiveTab,
    openFoodDetail,
    startWorkoutPlayer,
    addSteps,
    setOnboardingOpen,
    setSelectedWorkoutForDetail,
    streakDays,
  } = useApp();

  const [isRestDay, setIsRestDay] = useState(false);

  // Calorie & Macro calculations
  const totalCaloriesEaten = todayLog.meals.reduce((sum, m) => sum + m.calculatedCalories, 0);
  const totalProteinEaten = Math.round(todayLog.meals.reduce((sum, m) => sum + m.calculatedProtein, 0));
  const totalCarbsEaten = Math.round(todayLog.meals.reduce((sum, m) => sum + m.calculatedCarbs, 0));
  const totalFatEaten = Math.round(todayLog.meals.reduce((sum, m) => sum + m.calculatedFat, 0));

  const totalCaloriesBurnedFromWorkouts = todayLog.completedWorkouts.reduce(
    (sum, w) => sum + w.caloriesBurned,
    0
  );
  // Estimate step calories: ~0.04 kcal per step
  const caloriesBurnedFromSteps = Math.round(todayLog.steps * 0.04);
  const totalBurned = totalCaloriesBurnedFromWorkouts + caloriesBurnedFromSteps;

  // Percentage rings
  const calPercent = Math.min(100, Math.round((totalCaloriesEaten / (profile.dailyCalorieTarget || 1850)) * 100));
  const stepsPercent = Math.min(100, Math.round((todayLog.steps / (profile.dailyStepsTarget || 8000)) * 100));
  const waterPercent = Math.min(100, Math.round((todayLog.waterLiters / (profile.dailyWaterTargetLiters || 2.5)) * 100));

  // Meals grouped by type
  const getMealsByType = (type: MealType) => todayLog.meals.filter(m => m.mealType === type);
  const getCaloriesByType = (type: MealType) =>
    getMealsByType(type).reduce((sum, m) => sum + m.calculatedCalories, 0);

  const mealSlots: { type: MealType; label: string; icon: React.ReactNode; defaultTime: string }[] = [
    { type: 'sang', label: 'Bữa Sáng', icon: <Coffee size={18} className="text-[#FF9F43]" />, defaultTime: '07:00 - 08:30' },
    { type: 'trua', label: 'Bữa Trưa', icon: <SunMedium size={18} className="text-[#D4FF4F]" />, defaultTime: '11:30 - 13:00' },
    { type: 'toi', label: 'Bữa Tối', icon: <Sunset size={18} className="text-[#54A0FF]" />, defaultTime: '18:00 - 19:30' },
    { type: 'phu', label: 'Bữa Phụ / Ăn Vặt', icon: <Apple size={18} className="text-[#FF6B6B]" />, defaultTime: 'Xế chiều / Sau tập' },
  ];

  // Dynamic recommendations
  const proteinGap = Math.max(0, profile.targetProtein - totalProteinEaten);

  const todayWorkout = WORKOUTS_DATABASE[0];
  const restStretchWorkout = WORKOUTS_DATABASE[3]; // Office relief / stretch

  return (
    <div className="space-y-4 px-4 pt-4 pb-6 select-none">
      {/* 1. Header: Avatar + Chào Tên + Bắt đầu ngày mới nào + Biểu tượng thành tích + Theme toggle */}
      <header className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#2A2B2E] to-[#383A3F] border-2 border-[#D4FF4F] p-0.5 overflow-hidden flex items-center justify-center shrink-0">
            <span className="text-xl">🏃‍♂️</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-black tracking-wider text-[#D4FF4F] uppercase bg-[#D4FF4F]/10 px-1.5 py-0.5 rounded border border-[#D4FF4F]/20">ZT CALISTHENICS</span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white">Chào {profile.name}!</h1>
              <button
                onClick={() => setOnboardingOpen(true)}
                aria-label="Cài đặt hồ sơ & mục tiêu"
                className="text-[#9A9CA3] hover:text-[#D4FF4F] transition-colors"
              >
                <Settings size={15} />
              </button>
            </div>
            <p className="text-xs text-[#9A9CA3] font-medium">Bắt đầu ngày mới nào ✨</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Streak indicator */}
          <button
            onClick={() => setActiveTab('rewards')}
            aria-label="Xem chuỗi ngày"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1E1F22] border border-[#383A3F] hover:border-[#D4FF4F]/50 transition-all cursor-pointer"
          >
            <Flame size={16} className="text-[#FF9F43] fill-[#FF9F43] animate-pulse" />
            <span className="text-xs font-bold text-white font-tabular">{streakDays} ngày</span>
          </button>

          {/* Theme switch */}
          <button
            onClick={toggleTheme}
            aria-label="Chuyển chế độ sáng tối"
            className="w-9 h-9 rounded-full bg-[#1E1F22] border border-[#383A3F] flex items-center justify-center text-[#9A9CA3] hover:text-white transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun size={17} className="text-[#D4FF4F]" /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      {/* 2. Thẻ Hoạt động hôm nay (3 vòng tròn đồng tâm + 3 số liệu lớn) */}
      <section
        aria-label="Thẻ Hoạt động hôm nay"
        className="rounded-[28px] bg-[#2A2B2E] p-5 border border-[#383A3F]/60 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs uppercase font-extrabold tracking-wider text-[#9A9CA3]">
            Hoạt động hôm nay
          </span>
          <button
            onClick={() => setActiveTab('stats')}
            className="text-xs text-[#D4FF4F] font-semibold hover:underline flex items-center gap-0.5"
          >
            Xem tất cả <ChevronRight size={14} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Concentric Progress Rings (SVG) */}
          <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Outer Ring: Calo nạp (Lime) */}
              <circle cx="50" cy="50" r="42" fill="none" stroke="#1E1F22" strokeWidth="7" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#D4FF4F"
                strokeWidth="7"
                strokeDasharray={`${(calPercent * 263.8) / 100} 263.8`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />

              {/* Middle Ring: Bước chân / Calo đốt (Cyan/Sky) */}
              <circle cx="50" cy="50" r="32" fill="none" stroke="#1E1F22" strokeWidth="6" />
              <circle
                cx="50"
                cy="50"
                r="32"
                fill="none"
                stroke="#54A0FF"
                strokeWidth="6"
                strokeDasharray={`${(stepsPercent * 201) / 100} 201`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />

              {/* Inner Ring: Nước uống (Amber/Orange) */}
              <circle cx="50" cy="50" r="22" fill="none" stroke="#1E1F22" strokeWidth="5" />
              <circle
                cx="50"
                cy="50"
                r="22"
                fill="none"
                stroke="#FF9F43"
                strokeWidth="5"
                strokeDasharray={`${(waterPercent * 138.2) / 100} 138.2`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-[#9A9CA3] font-bold">NẠP</span>
              <span className="text-base font-black text-white font-tabular">{calPercent}%</span>
            </div>
          </div>

          {/* 3 Đại lượng số lớn bên cạnh */}
          <div className="flex-1 space-y-2.5">
            {/* Calo */}
            <div className="flex items-center justify-between border-b border-[#383A3F]/40 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4FF4F]"></span>
                <span className="text-xs text-[#9A9CA3]">Calo đã ăn</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-white font-tabular">{totalCaloriesEaten}</span>
                <span className="text-xs text-[#9A9CA3]"> / {profile.dailyCalorieTarget}</span>
              </div>
            </div>

            {/* Bước chân */}
            <div className="flex items-center justify-between border-b border-[#383A3F]/40 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#54A0FF]"></span>
                <span className="text-xs text-[#9A9CA3]">Bước chân</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-white font-tabular">{todayLog.steps.toLocaleString('vi-VN')}</span>
                <span className="text-xs text-[#9A9CA3]"> bước</span>
              </div>
            </div>

            {/* Nước */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF9F43]"></span>
                <span className="text-xs text-[#9A9CA3]">Nước uống</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-white font-tabular">{todayLog.waterLiters}</span>
                <span className="text-xs text-[#9A9CA3]"> / {profile.dailyWaterTargetLiters} L</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Thẻ Bước chân (Tiến độ + % + Quick Add) */}
      <section
        aria-label="Thẻ Bước chân"
        className="rounded-[24px] bg-[#1E1F22] p-4 border border-[#2A2B2E] flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#D4FF4F]/15 flex items-center justify-center text-[#D4FF4F] shrink-0">
            <Footprints size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white font-tabular">
                {todayLog.steps.toLocaleString('vi-VN')} / {profile.dailyStepsTarget.toLocaleString('vi-VN')}{' '}bước
              </span>
              <span className="text-xs font-bold text-[#D4FF4F] font-tabular">({stepsPercent}%)</span>
            </div>
            {/* Progress bar */}
            <div className="w-44 sm:w-56 h-2 bg-[#2A2B2E] rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-[#D4FF4F] rounded-full transition-all duration-500"
                style={{ width: `${stepsPercent}%` }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => addSteps(500)}
          aria-label="Thêm 500 bước chân"
          className="px-2.5 py-1.5 rounded-full bg-[#2A2B2E] hover:bg-[#383A3F] text-xs font-bold text-white border border-[#383A3F] transition-all active:scale-95 cursor-pointer whitespace-nowrap"
        >
          +500
        </button>
      </section>

      {/* 4. Thẻ Bữa ăn hôm nay (4 dòng sáng, trưa, tối, phụ + thanh macro) */}
      <section
        aria-label="Thẻ Bữa ăn hôm nay"
        className="rounded-[28px] bg-[#2A2B2E] p-5 border border-[#383A3F]/60 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-[#9A9CA3] block">
              Bữa ăn hôm nay
            </span>
            <span className="text-sm font-black text-white font-tabular mt-0.5 block">
              {totalCaloriesEaten} / {profile.dailyCalorieTarget} kcal
            </span>
          </div>
          <button
            onClick={() => setActiveTab('meal')}
            className="text-xs text-[#D4FF4F] font-semibold hover:underline flex items-center gap-0.5"
          >
            Nhật ký chi tiết <ChevronRight size={14} />
          </button>
        </div>

        {/* 4 Rows */}
        <div className="space-y-2">
          {mealSlots.map(slot => {
            const items = getMealsByType(slot.type);
            const cal = getCaloriesByType(slot.type);

            return (
              <div
                key={slot.type}
                className="p-3 rounded-2xl bg-[#1E1F22] flex items-center justify-between border border-[#2A2B2E] hover:border-[#383A3F] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#2A2B2E] flex items-center justify-center">
                    {slot.icon}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{slot.label}</span>
                    <span className="text-[11px] text-[#9A9CA3] line-clamp-1">
                      {items.length > 0
                        ? items.map(i => i.name).join(', ')
                        : slot.defaultTime}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white font-tabular">
                    {cal} <span className="text-[10px] text-[#9A9CA3] font-normal">kcal</span>
                  </span>
                  <button
                    onClick={() => setActiveTab('meal')}
                    aria-label={`Thêm món vào ${slot.label}`}
                    className="w-7 h-7 rounded-full bg-[#2A2B2E] hover:bg-[#D4FF4F] hover:text-[#121316] text-[#D4FF4F] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Thanh Macro Đạm / Carb / Béo */}
        <div className="pt-2 border-t border-[#383A3F]/40 space-y-2">
          <div className="flex justify-between text-xs text-[#9A9CA3] font-medium">
            <span>
              Đạm: <strong className="text-white font-tabular">{totalProteinEaten}/{profile.targetProtein}g</strong>
            </span>
            <span>
              Carb: <strong className="text-white font-tabular">{totalCarbsEaten}/{profile.targetCarbs}g</strong>
            </span>
            <span>
              Béo: <strong className="text-white font-tabular">{totalFatEaten}/{profile.targetFat}g</strong>
            </span>
          </div>

          <div className="w-full h-2.5 bg-[#1E1F22] rounded-full overflow-hidden flex gap-1 p-0.5">
            <div
              className="h-full bg-[#D4FF4F] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalProteinEaten / profile.targetProtein) * 33)}%` }}
              title="Đạm"
            />
            <div
              className="h-full bg-[#54A0FF] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalCarbsEaten / profile.targetCarbs) * 40)}%` }}
              title="Carb"
            />
            <div
              className="h-full bg-[#FF9F43] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalFatEaten / profile.targetFat) * 27)}%` }}
              title="Chất béo"
            />
          </div>
        </div>
      </section>

      {/* 5. Thẻ Buổi tập hôm nay */}
      <section
        aria-label="Thẻ Buổi tập hôm nay"
        className="rounded-[28px] bg-[#2A2B2E] p-5 border border-[#383A3F]/60 space-y-3"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-extrabold tracking-wider text-[#9A9CA3]">
            Buổi tập hôm nay
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('workout')}
              className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#D4FF4F]/20 border border-[#D4FF4F]/50 text-[#D4FF4F] font-bold hover:bg-[#D4FF4F] hover:text-[#121316] transition-colors cursor-pointer flex items-center gap-1"
            >
              <Dumbbell size={12} />
              <span>Calisthenics</span>
            </button>
            <button
              onClick={() => setIsRestDay(!isRestDay)}
              className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#1E1F22] border border-[#383A3F] text-[#9A9CA3] hover:text-white transition-colors cursor-pointer"
            >
              {isRestDay ? 'Quay lại' : 'Nghỉ ngơi?'}
            </button>
          </div>
        </div>

        {isRestDay ? (
          <div className="p-4 rounded-2xl bg-[#1E1F22] border border-[#383A3F] space-y-2">
            <div className="flex items-center gap-2 text-[#54A0FF]">
              <Sparkles size={18} />
              <h3 className="text-sm font-bold text-white">Ngày nghỉ phục hồi cơ bắp</h3>
            </div>
            <p className="text-xs text-[#9A9CA3] leading-relaxed">
              Hãy cho các bó cơ thời gian tổng hợp protein và phục hồi. Gợi ý: 10 phút giãn cơ cổ vai gáy hoặc đi bộ nhẹ nhàng.
            </p>
            <button
              onClick={() => startWorkoutPlayer(restStretchWorkout)}
              className="w-full py-2.5 rounded-full bg-[#1E1F22] border border-[#54A0FF] text-[#54A0FF] font-bold text-xs hover:bg-[#54A0FF] hover:text-[#121316] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <Play size={14} /> Giãn cơ nhẹ 10 phút
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-black text-white">{todayWorkout.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-[#9A9CA3]">
                  <span>⏱ {todayWorkout.durationMinutes} phút</span>
                  <span>•</span>
                  <span>🔥 ~{todayWorkout.estimatedCalories} kcal</span>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#D4FF4F]/15 text-[#D4FF4F] font-bold text-[10px]">
                    {todayWorkout.level}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#9A9CA3] line-clamp-2 leading-relaxed">
              {todayWorkout.description}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => startWorkoutPlayer(todayWorkout)}
                className="flex-1 py-3.5 rounded-full bg-[#D4FF4F] text-[#121316] font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#C5F23E] active:scale-95 transition-all cursor-pointer"
              >
                <Play size={16} fill="#121316" />
                <span>Bắt đầu ngay</span>
              </button>

              <button
                onClick={() => setSelectedWorkoutForDetail(todayWorkout)}
                className="px-4 py-3.5 rounded-full bg-[#1E1F22] hover:bg-[#383A3F] text-xs font-semibold text-white border border-[#383A3F] transition-all"
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 6. Thẻ Gợi ý hôm nay (1-2 lời nhắc thực tế) */}
      <section
        aria-label="Thẻ Gợi ý hôm nay"
        className="rounded-[28px] bg-gradient-to-br from-[#1E1F22] to-[#2A2B2E] p-4 border border-[#383A3F]/50 space-y-2.5"
      >
        <div className="flex items-center gap-2 text-[#D4FF4F]">
          <Sparkles size={16} />
          <span className="text-xs uppercase font-extrabold tracking-wider">Gợi ý thông minh cho bạn</span>
        </div>

        <div className="space-y-2 text-xs">
          {proteinGap > 0 ? (
            <div className="p-3 rounded-2xl bg-[#121316]/60 border border-[#2A2B2E] flex items-start gap-2.5">
              <span className="text-lg">🍗</span>
              <div>
                <p className="text-white font-medium">
                  Bạn còn thiếu <strong className="text-[#D4FF4F]">{proteinGap}g đạm</strong> để đạt mục tiêu hôm nay!
                </p>
                <p className="text-[#9A9CA3] text-[11px] mt-0.5">
                  Gợi ý món Việt: 100g ức gà luộc xé phay (+26g đạm) hoặc 2 quả trứng gà lòng đào (+13g đạm).
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-[#121316]/60 border border-[#2A2B2E] flex items-start gap-2.5">
              <span className="text-lg">🎉</span>
              <div>
                <p className="text-[#D4FF4F] font-bold">Xuất sắc! Bạn đã đạt đủ lượng đạm cần thiết hôm nay.</p>
                <p className="text-[#9A9CA3] text-[11px] mt-0.5">
                  Cơ bắp của bạn đang được cung cấp đầy đủ axit amin để hồi phục và phát triển.
                </p>
              </div>
            </div>
          )}

          <div className="p-3 rounded-2xl bg-[#121316]/60 border border-[#2A2B2E] flex items-start gap-2.5">
            <span className="text-lg">💡</span>
            <div>
              <p className="text-white font-medium">Mẹo chế biến giảm calo:</p>
              <p className="text-[#9A9CA3] text-[11px] mt-0.5">
                Chuyển từ xào nhiều dầu sang luộc hoặc hấp giúp bạn tiết kiệm ngay ~120-180 kcal mà hương vị vẫn thanh ngọt.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
