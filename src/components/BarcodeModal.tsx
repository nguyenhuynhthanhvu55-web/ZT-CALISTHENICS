import React, { useState } from 'react';
import { X, Barcode, Check, Scan, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VIETNAMESE_FOODS } from '../data/mockData';
import { FoodItem, MealType } from '../types';

export const BarcodeModal: React.FC = () => {
  const { barcodeScannerOpen, setBarcodeScannerOpen, addMeal } = useApp();
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('phu');

  if (!barcodeScannerOpen) return null;

  const packagedFoods = VIETNAMESE_FOODS.filter(f => f.category === 'dong_goi');

  const handleSelectProduct = (food: FoodItem) => {
    setSelectedFood(food);
  };

  const handleConfirmAdd = () => {
    if (!selectedFood) return;
    addMeal({
      foodId: selectedFood.id,
      name: selectedFood.name,
      mealType: selectedMealType,
      servingMultiplier: 1.0,
      calculatedCalories: selectedFood.calories,
      calculatedProtein: selectedFood.protein,
      calculatedCarbs: selectedFood.carbs,
      calculatedFat: selectedFood.fat,
    });
    setBarcodeScannerOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quét mã vạch thực phẩm"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
      onClick={() => setBarcodeScannerOpen(false)}
    >
      <div
        className="w-full max-w-[420px] bg-[#1E1F22] border-t sm:border border-[#383A3F] rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl space-y-4 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Barcode className="text-[#D4FF4F]" size={20} />
            <h3 className="text-base font-bold text-white">Quét mã vạch sản phẩm</h3>
          </div>
          <button
            onClick={() => setBarcodeScannerOpen(false)}
            className="w-8 h-8 rounded-full bg-[#2A2B2E] text-[#9A9CA3] hover:text-white flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Mock Camera Viewport with scanning beam */}
        <div className="relative w-full h-40 bg-black rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-[#383A3F]">
          <div className="absolute inset-4 border-2 border-dashed border-[#D4FF4F]/60 rounded-xl pointer-events-none" />
          {/* Animated red/lime scanner line */}
          <div className="absolute left-6 right-6 h-0.5 bg-[#D4FF4F] shadow-[0_0_10px_#D4FF4F] animate-pulse top-1/2 -translate-y-1/2" />
          <Scan size={36} className="text-[#9A9CA3]/60 mb-2" />
          <span className="text-[11px] text-[#9A9CA3] font-medium z-10">
            Căn chỉnh mã vạch vào khung hình
          </span>
        </div>

        {/* Quick Demo Selector */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-[#9A9CA3] uppercase block">
            Chọn sản phẩm mẫu trong kho dữ liệu VN:
          </span>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {packagedFoods.map(food => (
              <div
                key={food.id}
                onClick={() => handleSelectProduct(food)}
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedFood?.id === food.id
                    ? 'bg-[#2A2B2E] border-[#D4FF4F]'
                    : 'bg-[#18191C] border-[#2A2B2E] hover:border-[#383A3F]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{food.icon}</span>
                  <div>
                    <h5 className="text-xs font-bold text-white">{food.name}</h5>
                    <span className="text-[10px] text-[#9A9CA3]">
                      Mã: {food.barcode} • {food.servingSize}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#D4FF4F] font-tabular">
                  {food.calories} kcal
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Confirm Add Button */}
        {selectedFood && (
          <button
            onClick={handleConfirmAdd}
            className="w-full py-3.5 rounded-full bg-[#D4FF4F] text-[#121316] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-[#C5F23E] cursor-pointer"
          >
            <Check size={16} strokeWidth={3} />
            <span>Thêm {selectedFood.name} (+{selectedFood.calories} kcal)</span>
          </button>
        )}
      </div>
    </div>
  );
};
