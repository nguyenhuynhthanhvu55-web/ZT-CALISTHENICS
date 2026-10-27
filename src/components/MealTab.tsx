import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VIETNAMESE_FOODS } from '../data/mockData';
import { FoodCategory, FoodItem, MealType } from '../types';
import { matchesVietnameseSearch } from '../utils/vietnamese';

export const MealTab: React.FC = () => {
  const {
    todayLog,
    profile,
    openFoodDetail,
    removeMeal,
    selectedDate,
    setSelectedDate,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<FoodCategory | 'tat_ca'>('mon_viet');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'calories_asc' | 'protein_desc'>('default');
  const [selectedMealSlot, setSelectedMealSlot] = useState<MealType>('trua');

  // Calorie calculations
  const totalCaloriesEaten = todayLog.meals.reduce((sum, m) => sum + m.calculatedCalories, 0);
  const targetCalories = profile.dailyCalorieTarget || 1850;
  const remainingCalories = targetCalories - totalCaloriesEaten;

  // Filter food items
  const filteredFoods = VIETNAMESE_FOODS.filter(item => {
    // Category match
    if (activeCategory !== 'tat_ca' && item.category !== activeCategory) {
      return false;
    }
    // Search query match (accent insensitive)
    if (!matchesVietnameseSearch(item.name, searchQuery)) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'calories_asc') return a.calories - b.calories;
    if (sortBy === 'protein_desc') return b.protein - a.protein;
    return 0;
  });

  const categories: { id: FoodCategory | 'tat_ca'; label: string }[] = [
    { id: 'mon_viet', label: 'Món Việt' },
    { id: 'nguyen_lieu', label: 'Nguyên liệu' },
    { id: 'dong_goi', label: 'Sản phẩm đóng gói' },
    { id: 'mon_cua_toi', label: 'Món của tôi' },
    { id: 'cong_thuc', label: 'Công thức' },
  ];

  // Meal slot tabs
  const mealSlots: { id: MealType; label: string }[] = [
    { id: 'sang', label: 'Sáng' },
    { id: 'trua', label: 'Trưa' },
    { id: 'toi', label: 'Tối' },
    { id: 'phu', label: 'Phụ' },
  ];

  const loggedItemsForSlot = todayLog.meals.filter(m => m.mealType === selectedMealSlot);

  return (
    <div className="space-y-4 px-4 pt-4 pb-8 select-none">
      {/* 1. Date Selector (Dải ngày cuộn ngang) */}
      <header className="flex items-center justify-between pb-1">
        <h1 className="text-xl font-black text-white">Bữa ăn & Nhật ký</h1>
        <div className="flex items-center gap-2 bg-[#1E1F22] border border-[#383A3F] rounded-full px-3 py-1 text-xs font-semibold text-white">
          <ChevronLeft size={16} className="text-[#9A9CA3] cursor-pointer" />
          <span>Hôm nay ({selectedDate})</span>
          <ChevronRight size={16} className="text-[#9A9CA3] cursor-pointer" />
        </div>
      </header>

      {/* 2. Tổng đã ăn / mục tiêu / còn lại */}
      <section
        aria-label="Thống kê calo bữa ăn"
        className="rounded-[24px] bg-[#2A2B2E] p-4 border border-[#383A3F]/60 space-y-3"
      >
        <div className="grid grid-cols-3 text-center divide-x divide-[#383A3F]/40">
          <div>
            <span className="text-[11px] text-[#9A9CA3] font-semibold block">ĐÃ ĂN</span>
            <span className="text-lg font-black text-white font-tabular">{totalCaloriesEaten}</span>
            <span className="text-[10px] text-[#9A9CA3] block">kcal</span>
          </div>

          <div>
            <span className="text-[11px] text-[#9A9CA3] font-semibold block">MỤC TIÊU</span>
            <span className="text-lg font-black text-white font-tabular">{targetCalories}</span>
            <span className="text-[10px] text-[#9A9CA3] block">kcal</span>
          </div>

          <div>
            <span className="text-[11px] text-[#9A9CA3] font-semibold block">CÒN LẠI</span>
            <span
              className={`text-lg font-black font-tabular ${
                remainingCalories >= 0 ? 'text-[#D4FF4F]' : 'text-[#FF6B6B]'
              }`}
            >
              {remainingCalories >= 0 ? remainingCalories : `+${Math.abs(remainingCalories)}`}
            </span>
            <span className="text-[10px] text-[#9A9CA3] block">
              {remainingCalories >= 0 ? 'kcal' : 'vượt mức'}
            </span>
          </div>
        </div>

        {/* Progress Bar with Status Colors */}
        <div className="w-full h-2 bg-[#1E1F22] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              remainingCalories >= 0 ? 'bg-[#D4FF4F]' : 'bg-[#FF6B6B]'
            }`}
            style={{ width: `${Math.min(100, (totalCaloriesEaten / targetCalories) * 100)}%` }}
          />
        </div>
      </section>

      {/* 3. Slot Selector (Sáng, Trưa, Tối, Phụ) & Logged Items */}
      <section className="space-y-2">
        <div className="flex bg-[#1E1F22] p-1 rounded-2xl border border-[#2A2B2E]">
          {mealSlots.map(slot => (
            <button
              key={slot.id}
              onClick={() => setSelectedMealSlot(slot.id)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                selectedMealSlot === slot.id
                  ? 'bg-[#2A2B2E] text-[#D4FF4F] shadow-sm'
                  : 'text-[#9A9CA3] hover:text-white'
              }`}
            >
              {slot.label}
            </button>
          ))}
        </div>

        {/* Logged foods in this slot */}
        <div className="rounded-[22px] bg-[#1E1F22] p-3 border border-[#2A2B2E] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#9A9CA3] px-1 font-semibold">
            <span>Đã ghi trong Bữa {mealSlots.find(s => s.id === selectedMealSlot)?.label}:</span>
            <span className="text-white font-tabular">
              {loggedItemsForSlot.reduce((s, i) => s + i.calculatedCalories, 0)} kcal
            </span>
          </div>

          {loggedItemsForSlot.length === 0 ? (
            <p className="text-center text-xs text-[#6B6D75] py-2">Chưa có món nào được thêm vào bữa này.</p>
          ) : (
            loggedItemsForSlot.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#2A2B2E] text-xs"
              >
                <div>
                  <span className="font-bold text-white block">{item.name}</span>
                  <span className="text-[11px] text-[#9A9CA3]">
                    {item.calculatedCalories} kcal • Đạm: {item.calculatedProtein}g • {item.timestamp}
                  </span>
                </div>
                <button
                  onClick={() => removeMeal(item.id)}
                  aria-label={`Xóa món ${item.name}`}
                  className="text-[#9A9CA3] hover:text-[#FF6B6B] p-1.5 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 4. Horizontal Category Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-[#D4FF4F] text-[#121316] shadow-sm'
                : 'bg-[#1E1F22] text-[#9A9CA3] hover:text-white border border-[#2A2B2E]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 5. Search Bar & Filter / Sort Row */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9CA3]" />
          <input
            type="text"
            placeholder="Tìm món (vd: pho bo, uc ga, com tam...)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1E1F22] border border-[#2A2B2E] rounded-full text-sm text-white placeholder-[#6B6D75] focus:outline-none focus:border-[#D4FF4F] transition-all"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-[#9A9CA3] px-1">
          <div className="flex items-center gap-1">
            <Filter size={13} />
            <span>Tìm không dấu: Có hỗ trợ</span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowUpDown size={13} />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-[#D4FF4F] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="default" className="bg-[#1E1F22] text-white">Mặc định</option>
              <option value="calories_asc" className="bg-[#1E1F22] text-white">Ít calo nhất</option>
              <option value="protein_desc" className="bg-[#1E1F22] text-white">Nhiều đạm nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6. Food Cards List */}
      <div className="space-y-2.5">
        {filteredFoods.map(food => (
          <div
            key={food.id}
            onClick={() => openFoodDetail(food, selectedMealSlot)}
            className="p-3.5 rounded-[22px] bg-[#2A2B2E] hover:bg-[#323438] border border-transparent hover:border-[#383A3F] transition-all flex items-center justify-between cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1E1F22] flex items-center justify-center text-2xl shrink-0">
                {food.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{food.name}</h4>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                      food.sourceTag === 'Dữ liệu VN'
                        ? 'bg-[#D4FF4F]/15 text-[#D4FF4F]'
                        : 'bg-[#54A0FF]/15 text-[#54A0FF]'
                    }`}
                  >
                    {food.sourceTag}
                  </span>
                </div>
                <p className="text-xs text-[#9A9CA3] mt-0.5">
                  {food.servingSize} • <strong className="text-white font-tabular">{food.calories} kcal</strong>
                </p>
                <div className="flex items-center gap-2 text-[10px] text-[#9A9CA3] mt-0.5 font-tabular">
                  <span>Đạm: <strong className="text-[#D4FF4F]">{food.protein}g</strong></span>
                  <span>Carb: {food.carbs}g</span>
                  <span>Béo: {food.fat}g</span>
                </div>
              </div>
            </div>

            <button
              onClick={e => {
                e.stopPropagation();
                openFoodDetail(food, selectedMealSlot);
              }}
              aria-label={`Thêm món ${food.name}`}
              className="w-9 h-9 rounded-full bg-[#1E1F22] text-[#D4FF4F] hover:bg-[#D4FF4F] hover:text-[#121316] flex items-center justify-center transition-colors shrink-0 cursor-pointer shadow-sm"
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
