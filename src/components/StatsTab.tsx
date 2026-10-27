import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  Sparkles,
  Calendar,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StatsTab: React.FC = () => {
  const { profile, todayLog } = useApp();

  const [activeMetric, setActiveMetric] = useState<'calo' | 'can_nang' | 'so_do' | 'nang_luc' | 'thoi_quen'>('calo');
  const [activeTimeRange, setActiveTimeRange] = useState<'tuan' | 'thang' | '3_thang'>('tuan');

  // Sample weekly data points
  const weeklyCalorieData = [
    { day: 'T2', actual: 1780, target: 1850 },
    { day: 'T3', actual: 1820, target: 1850 },
    { day: 'T4', actual: 1690, target: 1850 },
    { day: 'T5', actual: 1910, target: 1850 },
    { day: 'T6', actual: 1840, target: 1850 },
    { day: 'T7', actual: 1750, target: 1850 },
    { day: 'CN', actual: 1810, target: 1850 },
  ];

  const weeklyWeightData = [
    { day: 'T2', actual: 68.9, target: 68.0 },
    { day: 'T3', actual: 68.7, target: 67.9 },
    { day: 'T4', actual: 68.6, target: 67.8 },
    { day: 'T5', actual: 68.5, target: 67.7 },
    { day: 'T6', actual: 68.4, target: 67.6 },
    { day: 'T7', actual: 68.3, target: 67.5 },
    { day: 'CN', actual: 68.2, target: 67.4 },
  ];

  const metricTabs: { id: 'calo' | 'can_nang' | 'so_do' | 'nang_luc' | 'thoi_quen'; label: string }[] = [
    { id: 'calo', label: 'Calo' },
    { id: 'can_nang', label: 'Cân nặng' },
    { id: 'so_do', label: 'Số đo' },
    { id: 'nang_luc', label: 'Năng lực' },
    { id: 'thoi_quen', label: 'Thói quen' },
  ];

  // SVG Chart Dimensions
  const chartHeight = 160;
  const chartWidth = 320;
  const paddingX = 25;
  const paddingY = 25;

  // Compute SVG Points for Calorie Chart
  const minCal = 1500;
  const maxCal = 2100;
  const calY = (val: number) =>
    chartHeight - paddingY - ((val - minCal) / (maxCal - minCal)) * (chartHeight - paddingY * 2);

  const calPoints = weeklyCalorieData.map((d, i) => {
    const x = paddingX + (i / (weeklyCalorieData.length - 1)) * (chartWidth - paddingX * 2);
    const y = calY(d.actual);
    return { x, y, ...d };
  });

  const calPolyline = calPoints.map(p => `${p.x},${p.y}`).join(' ');
  const targetY = calY(profile.dailyCalorieTarget || 1850);

  // Weight Chart Points
  const minW = 67.0;
  const maxW = 69.5;
  const weightY = (val: number) =>
    chartHeight - paddingY - ((val - minW) / (maxW - minW)) * (chartHeight - paddingY * 2);

  const weightPoints = weeklyWeightData.map((d, i) => {
    const x = paddingX + (i / (weeklyWeightData.length - 1)) * (chartWidth - paddingX * 2);
    const y = weightY(d.actual);
    return { x, y, ...d };
  });

  const weightPolyline = weightPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="space-y-4 px-4 pt-4 pb-8 select-none">
      {/* 1. Header */}
      <header className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-xl font-black text-white">Thống Kê Tiến Độ</h1>
          <p className="text-xs text-[#9A9CA3]">Dữ liệu minh bạch, động lực bền vững</p>
        </div>
      </header>

      {/* 2. Metric Chips Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {metricTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveMetric(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeMetric === tab.id
                ? 'bg-[#D4FF4F] text-[#121316] shadow-sm'
                : 'bg-[#1E1F22] text-[#9A9CA3] hover:text-white border border-[#2A2B2E]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Range Selector (Tuần / Tháng / 3 tháng) */}
      <div className="flex bg-[#1E1F22] p-1 rounded-2xl border border-[#2A2B2E]">
        {[
          { id: 'tuan', label: 'Tuần này' },
          { id: 'thang', label: 'Tháng này' },
          { id: '3_thang', label: '3 Tháng qua' },
        ].map(r => (
          <button
            key={r.id}
            onClick={() => setActiveTimeRange(r.id as any)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTimeRange === r.id
                ? 'bg-[#2A2B2E] text-[#D4FF4F] shadow-sm'
                : 'text-[#9A9CA3] hover:text-white'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* 4. Chart Card */}
      <section
        aria-label="Biểu đồ tiến độ"
        className="rounded-[28px] bg-[#2A2B2E] p-5 border border-[#383A3F]/60 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-[#9A9CA3] block">
              {activeMetric === 'calo' ? 'Calo nạp trung bình' : 'Cân nặng ghi nhận'}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-white font-tabular">
                {activeMetric === 'calo' ? '1.800' : '68.2'}
              </span>
              <span className="text-xs text-[#9A9CA3]">
                {activeMetric === 'calo' ? 'kcal/ngày' : 'kg'}
              </span>
              <span className="text-xs font-bold text-[#D4FF4F] flex items-center gap-0.5">
                <TrendingDown size={14} /> -0.7 kg tuần này
              </span>
            </div>
          </div>

          <div className="text-right text-[11px] text-[#9A9CA3]">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="w-2.5 h-0.5 bg-[#D4FF4F]"></span>
              <span>Thực tế</span>
            </div>
            <div className="flex items-center gap-1.5 justify-end mt-1">
              <span className="w-2.5 h-0.5 bg-[#9A9CA3] border-t border-dashed"></span>
              <span>Mục tiêu</span>
            </div>
          </div>
        </div>

        {/* Interactive SVG Chart */}
        <div className="w-full flex justify-center py-2">
          {activeMetric === 'calo' ? (
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 overflow-visible">
              {/* Target Line (Dashed) */}
              <line
                x1={paddingX}
                y1={targetY}
                x2={chartWidth - paddingX}
                y2={targetY}
                stroke="#6B6D75"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text x={chartWidth - paddingX + 5} y={targetY + 4} fill="#9A9CA3" fontSize="9" fontWeight="bold">
                {profile.dailyCalorieTarget}
              </text>

              {/* Area under curve */}
              <polygon
                points={`${paddingX},${chartHeight - paddingY} ${calPolyline} ${chartWidth - paddingX},${chartHeight - paddingY}`}
                fill="url(#calGradient)"
                opacity="0.25"
              />
              <defs>
                <linearGradient id="calGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4FF4F" />
                  <stop offset="100%" stopColor="#D4FF4F" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Actual Line (Glowing Lime) */}
              <polyline
                points={calPolyline}
                fill="none"
                stroke="#D4FF4F"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {calPoints.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="4.5" fill="#121316" stroke="#D4FF4F" strokeWidth="2.5" />
                  <text
                    x={p.x}
                    y={chartHeight - 8}
                    fill="#9A9CA3"
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {p.day}
                  </text>
                </g>
              ))}
            </svg>
          ) : (
            /* Weight Chart */
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 overflow-visible">
              <line
                x1={paddingX}
                y1={weightY(67.5)}
                x2={chartWidth - paddingX}
                y2={weightY(67.5)}
                stroke="#6B6D75"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text x={chartWidth - paddingX + 5} y={weightY(67.5) + 4} fill="#9A9CA3" fontSize="9" fontWeight="bold">
                67.5kg
              </text>

              <polyline
                points={weightPolyline}
                fill="none"
                stroke="#D4FF4F"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {weightPoints.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="4.5" fill="#121316" stroke="#D4FF4F" strokeWidth="2.5" />
                  <text
                    x={p.x}
                    y={chartHeight - 8}
                    fill="#9A9CA3"
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {p.day}
                  </text>
                </g>
              ))}
            </svg>
          )}
        </div>
      </section>

      {/* 5. Thẻ Tóm tắt tuần với nhận xét thân thiện & đề xuất */}
      <section
        aria-label="Đánh giá tuần"
        className="rounded-[28px] bg-gradient-to-br from-[#1E1F22] to-[#2A2B2E] p-5 border border-[#383A3F]/50 space-y-3"
      >
        <div className="flex items-center gap-2 text-[#D4FF4F]">
          <Sparkles size={18} />
          <h3 className="text-sm font-bold text-white">Nhận xét & Đề xuất tuần này</h3>
        </div>

        <p className="text-xs text-[#9A9CA3] leading-relaxed">
          Tuần qua bạn đã tuân thủ mức thâm hụt calo rất tốt (trung bình <strong>1.800 kcal/ngày</strong>, thấp hơn 50 kcal so với mục tiêu). Cân nặng giảm <strong>0.7 kg</strong> đúng quỹ đạo an toàn.
        </p>

        <div className="p-3.5 rounded-2xl bg-[#121316]/70 border border-[#2A2B2E] space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-[#D4FF4F] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block text-xs">Đề xuất điều chỉnh tuần tới:</strong>
              <span className="text-[#9A9CA3] text-[11px] leading-relaxed">
                Tăng thêm 1 buổi tập Tabata bụng 15 phút vào Thứ 5 để đẩy mạnh tốc độ đốt mỡ bụng dưới.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Số đo & Năng lực tóm tắt */}
      <section className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-[22px] bg-[#1E1F22] border border-[#2A2B2E] space-y-1">
          <span className="text-[10px] text-[#9A9CA3] font-bold uppercase">Vòng bụng</span>
          <span className="text-lg font-black text-white font-tabular block">78.5 cm</span>
          <span className="text-[10px] text-[#D4FF4F] font-bold">-1.5 cm so với đầu tháng</span>
        </div>

        <div className="p-4 rounded-[22px] bg-[#1E1F22] border border-[#2A2B2E] space-y-1">
          <span className="text-[10px] text-[#9A9CA3] font-bold uppercase">Hít đất liên tục</span>
          <span className="text-lg font-black text-white font-tabular block">16 cái</span>
          <span className="text-[10px] text-[#D4FF4F] font-bold">+4 cái so với bài test đầu vào</span>
        </div>
      </section>
    </div>
  );
};
