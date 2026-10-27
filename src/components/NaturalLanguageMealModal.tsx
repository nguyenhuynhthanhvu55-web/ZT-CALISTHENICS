import React, { useState } from 'react';
import { X, Sparkles, Plus, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VIETNAMESE_FOODS } from '../data/mockData';
import { MealType } from '../types';
import { removeVietnameseAccents } from '../utils/vietnamese';

export const NaturalLanguageMealModal: React.FC = () => {
  const { naturalLanguageModalOpen, setNaturalLanguageModalOpen, addMeal } = useApp();
  const [inputText, setInputText] = useState('1 tô phở bò tái và 1 quả trứng gà luộc');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('trua');

  if (!naturalLanguageModalOpen) return null;

  // Simple heuristic parser for Vietnamese meal text
  const parseMeal = (text: string) => {
    const clean = removeVietnameseAccents(text);
    const matchedItems: { name: string; calories: number; protein: number; carbs: number; fat: number }[] = [];

    VIETNAMESE_FOODS.forEach(food => {
      const foodClean = removeVietnameseAccents(food.name);
      // check keywords
      if (clean.includes(foodClean) || foodClean.split(' ').slice(0, 2).every(w => clean.includes(w))) {
        matchedItems.push({
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
        });
      }
    });

    if (matchedItems.length === 0) {
      // Fallback estimate
      matchedItems.push({
        name: text.trim() || 'Bữa ăn tùy chỉnh',
        calories: 450,
        protein: 22,
        carbs: 55,
        fat: 12,
      });
    }

    return matchedItems;
  };

  const parsedItems = parseMeal(inputText);
  const totalCal = parsedItems.reduce((s, i) => s + i.calories, 0);
  const totalProtein = parsedItems.reduce((s, i) => s + i.protein, 0);

  const handleConfirmAdd = () => {
    parsedItems.forEach(item => {
      addMeal({
        foodId: `custom_${Date.now()}`,
        name: item.name,
        mealType: selectedMealType,
        servingMultiplier: 1.0,
        calculatedCalories: item.calories,
        calculatedProtein: item.protein,
        calculatedCarbs: item.carbs,
        calculatedFat: item.fat,
      });
    });
    setNaturalLanguageModalOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Nhập bữa ăn bằng mô tả"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
      onClick={() => setNaturalLanguageModalOpen(false)}
    >
      <div
        className="w-full max-w-[420px] bg-[#1E1F22] border-t sm:border border-[#383A3F] rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl space-y-4 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#D4FF4F]" size={18} />
            <h3 className="text-base font-bold text-white">Nhập cả bữa bằng mô tả</h3>
          </div>
          <button
            onClick={() => setNaturalLanguageModalOpen(false)}
            className="w-8 h-8 rounded-full bg-[#2A2B2E] text-[#9A9CA3] hover:text-white flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-[#9A9CA3]">
          Mô tả những gì bạn vừa ăn bằng ngôn ngữ tự nhiên. Hệ thống sẽ tự động tách món và ước tính calo.
        </p>

        {/* Input */}
        <textarea
          rows={3}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Ví dụ: 1 tô bún chả thịt nướng, 1 ly cà phê đen không đường..."
          className="w-full p-3.5 bg-[#121316] border border-[#383A3F] rounded-2xl text-xs text-white focus:outline-none focus:border-[#D4FF4F] leading-relaxed resize-none"
        />

        {/* Meal Type Pills */}
        <div className="flex gap-2 text-xs">
          {[
            { id: 'sang', label: 'Sáng' },
            { id: 'trua', label: 'Trưa' },
            { id: 'toi', label: 'Tối' },
            { id: 'phu', label: 'Phụ' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMealType(m.id as any)}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                selectedMealType === m.id
                  ? 'bg-[#D4FF4F] text-[#121316]'
                  : 'bg-[#2A2B2E] text-[#9A9CA3] hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Parsed Preview */}
        <div className="p-3.5 rounded-2xl bg-[#2A2B2E] space-y-2 border border-[#383A3F]/50">
          <span className="text-[10px] uppercase font-bold text-[#9A9CA3] block">
            Kết quả nhận diện:
          </span>
          <div className="space-y-1.5">
            {parsedItems.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="text-white font-medium">{item.name}</span>
                <span className="font-bold text-[#D4FF4F] font-tabular">
                  {item.calories} kcal ({item.protein}g đạm)
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#383A3F]/40 pt-2 flex justify-between items-center text-xs font-bold">
            <span className="text-white">Tổng cộng:</span>
            <span className="text-[#D4FF4F] font-tabular font-black">{totalCal} kcal</span>
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={handleConfirmAdd}
          className="w-full py-3.5 rounded-full bg-[#D4FF4F] text-[#121316] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-[#C5F23E] cursor-pointer"
        >
          <Check size={16} strokeWidth={3} />
          <span>Ghi vào bữa {selectedMealType.toUpperCase()} ngay</span>
        </button>
      </div>
    </div>
  );
};
