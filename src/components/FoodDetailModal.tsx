import React, { useState, useMemo } from 'react';
import { X, Flame, ChefHat, Check, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CookingMethod } from '../types';
import {
  COOKING_METHODS,
  adjustDishNutrients,
  calculateCookedNutrients,
} from '../utils/nutrition';

export const FoodDetailModal: React.FC = () => {
  const {
    selectedFoodForDetail,
    closeFoodDetail,
    targetMealTypeForAdd,
    addMeal,
  } = useApp();

  const [servingMultiplier, setServingMultiplier] = useState<number>(1.0);
  const [grams, setGrams] = useState<number>(100);
  const [selectedCookingMethod, setSelectedCookingMethod] = useState<CookingMethod>('luoc');
  const [oilLevel, setOilLevel] = useState<'none' | 'light' | 'normal' | 'extra'>('normal');
  const [sugarLevel, setSugarLevel] = useState<'none' | 'light' | 'normal'>('normal');

  const food = selectedFoodForDetail;

  // Calculate final nutrients
  const calculatedNutrients = useMemo(() => {
    if (!food) return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

    if (food.isRawIngredient) {
      return calculateCookedNutrients(
        {
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: food.fiber,
        },
        selectedCookingMethod,
        grams
      );
    } else {
      return adjustDishNutrients(
        {
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: food.fiber,
        },
        servingMultiplier,
        oilLevel,
        sugarLevel
      );
    }
  }, [food, servingMultiplier, grams, selectedCookingMethod, oilLevel, sugarLevel]);

  if (!food) return null;

  // For raw ingredients: calculate comparison data across all cooking methods for 100g
  const comparisonData = (Object.keys(COOKING_METHODS) as CookingMethod[]).map(method => {
    const info = COOKING_METHODS[method];
    const res = calculateCookedNutrients(
      {
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
      },
      method,
      100
    );
    return {
      method,
      name: info.name,
      calories: res.calories,
      delta: res.calories - food.calories,
      icon: info.icon,
      isCurrent: selectedCookingMethod === method,
    };
  });

  const handleAdd = () => {
    addMeal({
      foodId: food.id,
      name: food.isRawIngredient
        ? `${food.name} (${COOKING_METHODS[selectedCookingMethod].name} ${grams}g)`
        : food.name,
      mealType: targetMealTypeForAdd,
      servingMultiplier,
      selectedCookingMethod: food.isRawIngredient ? selectedCookingMethod : undefined,
      oilLevel: food.isRawIngredient ? undefined : oilLevel,
      sugarLevel: food.isRawIngredient ? undefined : sugarLevel,
      calculatedCalories: calculatedNutrients.calories,
      calculatedProtein: calculatedNutrients.protein,
      calculatedCarbs: calculatedNutrients.carbs,
      calculatedFat: calculatedNutrients.fat,
    });
    closeFoodDetail();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Chi tiết món ${food.name}`}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
      onClick={closeFoodDetail}
    >
      <div
        className="w-full max-w-[420px] max-h-[90vh] bg-[#1E1F22] border-t sm:border border-[#383A3F] rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col shadow-2xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header & Close */}
        <div className="p-5 pb-3 border-b border-[#2A2B2E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2A2B2E] flex items-center justify-center text-3xl">
              {food.icon}
            </div>
            <div>
              <h2 className="text-lg font-black text-white line-clamp-1">{food.name}</h2>
              <span className="text-xs text-[#9A9CA3]">{food.servingSize} • {food.sourceTag}</span>
            </div>
          </div>
          <button
            onClick={closeFoodDetail}
            aria-label="Đóng chi tiết món"
            className="w-8 h-8 rounded-full bg-[#2A2B2E] text-[#9A9CA3] hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Calorie & Macro Highlights */}
          <div className="rounded-[24px] bg-[#2A2B2E] p-4 text-center border border-[#383A3F]/50">
            <span className="text-[11px] text-[#9A9CA3] uppercase font-bold tracking-wider">
              Năng lượng tính toán
            </span>
            <div className="my-1 flex items-center justify-center gap-1.5">
              <span className="text-4xl font-black text-[#D4FF4F] font-tabular">
                {calculatedNutrients.calories}
              </span>
              <span className="text-sm font-bold text-[#9A9CA3]">kcal</span>
            </div>

            {/* 4 Macro Blocks */}
            <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-[#383A3F]/40 text-center">
              <div className="bg-[#1E1F22] p-2 rounded-xl">
                <span className="text-[10px] text-[#9A9CA3] block">Đạm</span>
                <span className="text-xs font-bold text-white font-tabular">{calculatedNutrients.protein}g</span>
              </div>
              <div className="bg-[#1E1F22] p-2 rounded-xl">
                <span className="text-[10px] text-[#9A9CA3] block">Carb</span>
                <span className="text-xs font-bold text-white font-tabular">{calculatedNutrients.carbs}g</span>
              </div>
              <div className="bg-[#1E1F22] p-2 rounded-xl">
                <span className="text-[10px] text-[#9A9CA3] block">Chất béo</span>
                <span className="text-xs font-bold text-white font-tabular">{calculatedNutrients.fat}g</span>
              </div>
              <div className="bg-[#1E1F22] p-2 rounded-xl">
                <span className="text-[10px] text-[#9A9CA3] block">Chất xơ</span>
                <span className="text-xs font-bold text-white font-tabular">{calculatedNutrients.fiber || 0}g</span>
              </div>
            </div>
          </div>

          {/* Special Section: Công cụ nguyên liệu sống + Cách chế biến */}
          {food.isRawIngredient ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#D4FF4F]">
                <ChefHat size={18} />
                <h3 className="text-sm font-bold text-white">Cách chế biến (Ảnh hưởng calo)</h3>
              </div>

              {/* Cooking Method Chips */}
              <div className="flex flex-wrap gap-2">
                {(Object.keys(COOKING_METHODS) as CookingMethod[]).map(method => {
                  const m = COOKING_METHODS[method];
                  const isSelected = selectedCookingMethod === method;
                  return (
                    <button
                      key={method}
                      onClick={() => setSelectedCookingMethod(method)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#D4FF4F] text-[#121316] shadow-sm'
                          : 'bg-[#2A2B2E] text-[#9A9CA3] hover:text-white border border-[#383A3F]'
                      }`}
                    >
                      <span>{m.icon}</span>
                      <span>{m.name}</span>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-[#9A9CA3] bg-[#2A2B2E]/60 p-3 rounded-2xl border border-[#383A3F]/40">
                ℹ️ {COOKING_METHODS[selectedCookingMethod].description}
              </p>

              {/* Grams Selector */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#9A9CA3]">Trọng lượng nguyên liệu sống:</span>
                  <strong className="text-white font-tabular">{grams}g</strong>
                </div>
                <input
                  type="range"
                  min="50"
                  max="400"
                  step="10"
                  value={grams}
                  onChange={e => setGrams(Number(e.target.value))}
                  className="w-full accent-[#D4FF4F] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#9A9CA3] mt-1">
                  <span>50g (ít)</span>
                  <span>100g (chuẩn)</span>
                  <span>200g (nhiều đạm)</span>
                  <span>400g</span>
                </div>
              </div>

              {/* Biểu đồ so sánh calo giữa các cách chế biến (100g) */}
              <div className="space-y-2 pt-2 border-t border-[#2A2B2E]">
                <span className="text-xs font-bold text-white block">
                  So sánh calo theo cách nấu (trên 100g):
                </span>
                <div className="space-y-1.5 text-xs">
                  {comparisonData.map(item => {
                    const maxCal = 250;
                    const barWidth = Math.min(100, Math.round((item.calories / maxCal) * 100));
                    return (
                      <div
                        key={item.method}
                        onClick={() => setSelectedCookingMethod(item.method)}
                        className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          item.isCurrent
                            ? 'bg-[#2A2B2E] border border-[#D4FF4F]'
                            : 'bg-[#18191C] hover:bg-[#2A2B2E]'
                        }`}
                      >
                        <div className="w-28 flex items-center gap-1.5 text-xs text-white">
                          <span>{item.icon}</span>
                          <span className="truncate">{item.name}</span>
                        </div>
                        {/* Bar */}
                        <div className="flex-1 h-2 bg-[#2A2B2E] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              item.calories > 180
                                ? 'bg-[#FF6B6B]'
                                : item.calories > 140
                                ? 'bg-[#FF9F43]'
                                : 'bg-[#D4FF4F]'
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-white w-14 text-right font-tabular">
                          {item.calories} kcal
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Regular Dish Customization (Khẩu phần, mức dầu, mức đường) */
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Tùy chỉnh khẩu phần & gia vị</h3>

              {/* Multiplier */}
              <div>
                <label className="text-xs text-[#9A9CA3] block mb-2">Khẩu phần ăn:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { mult: 0.5, label: '0.5 tô (Ít)' },
                    { mult: 1.0, label: '1 tô (Chuẩn)' },
                    { mult: 1.5, label: '1.5 tô' },
                    { mult: 2.0, label: '2 tô (Đầy)' },
                  ].map(p => (
                    <button
                      key={p.mult}
                      onClick={() => setServingMultiplier(p.mult)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        servingMultiplier === p.mult
                          ? 'bg-[#D4FF4F] text-[#121316]'
                          : 'bg-[#2A2B2E] text-[#9A9CA3] hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Oil Level */}
              <div>
                <label className="text-xs text-[#9A9CA3] block mb-2">Lượng dầu mỡ (Nước béo):</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'none', label: 'Không mỡ (-60 kcal)' },
                    { id: 'light', label: 'Ít dầu (-30 kcal)' },
                    { id: 'normal', label: 'Chuẩn' },
                    { id: 'extra', label: 'Thêm béo (+50 kcal)' },
                  ].map(o => (
                    <button
                      key={o.id}
                      onClick={() => setOilLevel(o.id as any)}
                      className={`p-2 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer leading-tight ${
                        oilLevel === o.id
                          ? 'bg-[#D4FF4F] text-[#121316]'
                          : 'bg-[#2A2B2E] text-[#9A9CA3] hover:text-white'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sugar Level */}
              <div>
                <label className="text-xs text-[#9A9CA3] block mb-2">Mức độ ngọt / đường:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'Không đường' },
                    { id: 'light', label: 'Ít ngọt' },
                    { id: 'normal', label: 'Bình thường' },
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSugarLevel(s.id as any)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        sugarLevel === s.id
                          ? 'bg-[#D4FF4F] text-[#121316]'
                          : 'bg-[#2A2B2E] text-[#9A9CA3] hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Bottom Button (Lime Pill) */}
        <div className="p-4 bg-[#18191C] border-t border-[#2A2B2E]">
          <button
            onClick={handleAdd}
            className="w-full py-4 rounded-full bg-[#D4FF4F] text-[#121316] font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-[#C5F23E] active:scale-[0.99] transition-all cursor-pointer"
          >
            <Check size={18} strokeWidth={3} />
            <span>Thêm vào nhật ký ({targetMealTypeForAdd.toUpperCase()})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
