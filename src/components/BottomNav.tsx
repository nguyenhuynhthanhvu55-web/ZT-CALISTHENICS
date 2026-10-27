import React from 'react';
import { Home, UtensilsCrossed, Plus, BarChart2, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setQuickAddOpen } = useApp();

  return (
    <nav
      aria-label="Thanh điều hướng chính"
      className="absolute bottom-0 left-0 right-0 z-30 px-3 py-2 bg-[#18191C]/95 dark:bg-[#18191C]/95 backdrop-blur-md border-t border-[#2A2B2E] flex items-center justify-between"
    >
      {/* 1. Trang chủ */}
      <button
        onClick={() => setActiveTab('home')}
        aria-label="Trang chủ"
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
          activeTab === 'home' ? 'text-[#D4FF4F]' : 'text-[#9A9CA3] hover:text-white'
        }`}
      >
        <Home size={22} strokeWidth={activeTab === 'home' ? 2.5 : 1.8} />
        <span className="text-[11px] font-medium mt-1">Trang chủ</span>
      </button>

      {/* 2. Bữa ăn */}
      <button
        onClick={() => setActiveTab('meal')}
        aria-label="Bữa ăn"
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
          activeTab === 'meal' ? 'text-[#D4FF4F]' : 'text-[#9A9CA3] hover:text-white'
        }`}
      >
        <UtensilsCrossed size={22} strokeWidth={activeTab === 'meal' ? 2.5 : 1.8} />
        <span className="text-[11px] font-medium mt-1">Bữa ăn</span>
      </button>

      {/* 3. Nút + Nổi bật ở giữa */}
      <div className="flex-1 flex justify-center -mt-6">
        <button
          onClick={() => setQuickAddOpen(true)}
          aria-label="Thêm nhanh"
          className="w-14 h-14 rounded-full bg-[#D4FF4F] text-[#121316] flex items-center justify-center shadow-[0_8px_20px_rgba(212,255,79,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer border-4 border-[#121316]"
        >
          <Plus size={28} strokeWidth={3} />
        </button>
      </div>

      {/* 4. Thống kê */}
      <button
        onClick={() => setActiveTab('stats')}
        aria-label="Thống kê"
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
          activeTab === 'stats' ? 'text-[#D4FF4F]' : 'text-[#9A9CA3] hover:text-white'
        }`}
      >
        <BarChart2 size={22} strokeWidth={activeTab === 'stats' ? 2.5 : 1.8} />
        <span className="text-[11px] font-medium mt-1">Thống kê</span>
      </button>

      {/* 5. Thành tích */}
      <button
        onClick={() => setActiveTab('rewards')}
        aria-label="Thành tích"
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
          activeTab === 'rewards' ? 'text-[#D4FF4F]' : 'text-[#9A9CA3] hover:text-white'
        }`}
      >
        <Award size={22} strokeWidth={activeTab === 'rewards' ? 2.5 : 1.8} />
        <span className="text-[11px] font-medium mt-1">Thành tích</span>
      </button>
    </nav>
  );
};
