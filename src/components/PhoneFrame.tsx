import React, { useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  const [isDesktopMode, setIsDesktopMode] = useState(false);
  const { theme } = useApp();

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#0e0f12]' : 'bg-[#e4e6eb]'
    }`}>
      {/* Top Bar for Desktop Preview Toggle */}
      <header className="w-full max-w-md px-4 py-2 flex items-center justify-between text-xs text-[#9A9CA3] select-none">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#D4FF4F] animate-pulse"></span>
          <span>ZT CALISTHENICS Mobile App</span>
        </div>
        <button
          onClick={() => setIsDesktopMode(!isDesktopMode)}
          aria-label={isDesktopMode ? 'Chuyển sang khung điện thoại' : 'Chuyển sang khung rộng'}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1E1F22] hover:bg-[#2A2B2E] text-white border border-[#383A3F] transition-all cursor-pointer text-[11px]"
        >
          {isDesktopMode ? (
            <>
              <Smartphone size={13} className="text-[#D4FF4F]" />
              <span>Khung 390px</span>
            </>
          ) : (
            <>
              <Monitor size={13} className="text-[#D4FF4F]" />
              <span>Khung rộng</span>
            </>
          )}
        </button>
      </header>

      {/* Main Container */}
      <main
        className={`w-full relative overflow-hidden transition-all duration-300 flex flex-col shadow-2xl ${
          isDesktopMode
            ? 'max-w-2xl min-h-[92vh] sm:rounded-[32px] sm:border sm:border-[#2A2B2E]'
            : 'max-w-[420px] min-h-[92vh] sm:h-[880px] sm:rounded-[40px] sm:border-[8px] sm:border-[#1E1F22]'
        } ${theme === 'dark' ? 'bg-[#121316]' : 'bg-[#F4F5F7]'}`}
      >
        {/* Top Speaker / Notch for Phone Frame */}
        {!isDesktopMode && (
          <div className="hidden sm:flex justify-center pt-2 pb-1 bg-transparent z-40">
            <div className="w-24 h-4 bg-[#1E1F22] rounded-full flex items-center justify-center">
              <div className="w-10 h-1 bg-[#2A2B2E] rounded-full"></div>
            </div>
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col pb-24">
          {children}
        </div>
      </main>
    </div>
  );
};
