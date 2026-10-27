import React from 'react';
import {
  Utensils,
  Sparkles,
  Barcode,
  Dumbbell,
  Droplet,
  Scale,
  X,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WORKOUTS_DATABASE } from '../data/mockData';

export const QuickAddModal: React.FC = () => {
  const {
    quickAddOpen,
    setQuickAddOpen,
    setActiveTab,
    setNaturalLanguageModalOpen,
    setBarcodeScannerOpen,
    setWeightLogModalOpen,
    startWorkoutPlayer,
    addWater,
    setIsWorkoutBuilderOpen,
    setEditingWorkoutForBuilder,
  } = useApp();

  if (!quickAddOpen) return null;

  const actions = [
    {
      id: 'food',
      icon: <Utensils className="text-[#D4FF4F]" size={22} />,
      title: 'Thêm món ăn',
      desc: 'Tra cứu phở, bún, cơm tấm, đồ sống & cách nấu',
      onClick: () => {
        setQuickAddOpen(false);
        setActiveTab('meal');
      },
    },
    {
      id: 'ai_text',
      icon: <Sparkles className="text-[#D4FF4F]" size={22} />,
      title: 'Nhập cả bữa bằng mô tả',
      desc: 'Ví dụ: "1 tô bún chả thịt nướng và 1 ly trà đá"',
      badge: 'Nhanh',
      onClick: () => {
        setQuickAddOpen(false);
        setNaturalLanguageModalOpen(true);
      },
    },
    {
      id: 'barcode',
      icon: <Barcode className="text-[#D4FF4F]" size={22} />,
      title: 'Quét mã vạch',
      desc: 'Sữa chua, sữa hạt, bánh mì gói, whey protein',
      onClick: () => {
        setQuickAddOpen(false);
        setBarcodeScannerOpen(true);
      },
    },
    {
      id: 'create_workout',
      icon: <Dumbbell className="text-[#D4FF4F]" size={22} />,
      title: 'Tạo buổi tập tự chọn',
      desc: 'Tự chọn bài từ thư viện Calisthenics, đặt reps & hiệp',
      badge: 'Mới',
      onClick: () => {
        setQuickAddOpen(false);
        setEditingWorkoutForBuilder(null);
        setIsWorkoutBuilderOpen(true);
      },
    },
    {
      id: 'workout',
      icon: <Dumbbell className="text-[#54A0FF]" size={22} />,
      title: 'Bắt đầu buổi tập nhanh',
      desc: 'HIIT đốt mỡ, Tabata bụng, giãn cơ không dụng cụ',
      onClick: () => {
        setQuickAddOpen(false);
        setActiveTab('workout');
      },
    },
    {
      id: 'water',
      icon: <Droplet className="text-[#54A0FF]" size={22} />,
      title: 'Uống nước',
      desc: 'Ghi nhanh 1 ly (+250ml) hoặc 1 bình (+500ml)',
      isWater: true,
      onClick: () => {
        addWater(0.25);
        setQuickAddOpen(false);
      },
    },
    {
      id: 'weight',
      icon: <Scale className="text-[#FF9F43]" size={22} />,
      title: 'Ghi cân nặng',
      desc: 'Cập nhật tiến độ giảm mỡ / tăng cơ',
      onClick: () => {
        setQuickAddOpen(false);
        setWeightLogModalOpen(true);
      },
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bảng thêm nhanh"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={() => setQuickAddOpen(false)}
    >
      <div
        className="w-full max-w-[420px] bg-[#1E1F22] border-t border-[#383A3F] rounded-t-[32px] p-5 pb-8 shadow-2xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle Bar & Header */}
        <div className="w-12 h-1 bg-[#383A3F] rounded-full mx-auto mb-4" />
        
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h3 className="text-lg font-bold text-white">Thêm nhanh</h3>
            <p className="text-xs text-[#9A9CA3]">Chọn một hành động để ghi nhận dữ liệu hôm nay</p>
          </div>
          <button
            onClick={() => setQuickAddOpen(false)}
            aria-label="Đóng bảng thêm nhanh"
            className="w-8 h-8 rounded-full bg-[#2A2B2E] text-[#9A9CA3] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action List */}
        <div className="space-y-2">
          {actions.map(action => (
            <div
              key={action.id}
              onClick={action.onClick}
              className="flex items-center justify-between p-3.5 rounded-[20px] bg-[#2A2B2E] hover:bg-[#34363B] border border-transparent hover:border-[#383A3F] transition-all cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#18191C] flex items-center justify-center shrink-0">
                  {action.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{action.title}</span>
                    {action.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4FF4F]/20 text-[#D4FF4F] font-bold">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#9A9CA3] line-clamp-1">{action.desc}</span>
                </div>
              </div>

              {action.isWater ? (
                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      addWater(0.25);
                      setQuickAddOpen(false);
                    }}
                    className="px-2.5 py-1 text-xs rounded-full bg-[#18191C] hover:bg-[#54A0FF]/20 text-[#54A0FF] font-semibold transition-colors"
                  >
                    +250ml
                  </button>
                  <button
                    onClick={() => {
                      addWater(0.5);
                      setQuickAddOpen(false);
                    }}
                    className="px-2.5 py-1 text-xs rounded-full bg-[#54A0FF] text-white font-semibold hover:bg-[#408fe3] transition-colors"
                  >
                    +500ml
                  </button>
                </div>
              ) : (
                <ChevronRight size={18} className="text-[#9A9CA3]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
