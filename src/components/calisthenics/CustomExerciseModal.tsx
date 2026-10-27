import React, { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { CalisthenicsExercise, ExerciseGroup, MeasurementType } from '../../types/calisthenics';

interface CustomExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExercise: (exercise: CalisthenicsExercise) => void;
}

export const CustomExerciseModal: React.FC<CustomExerciseModalProps> = ({
  isOpen,
  onClose,
  onSaveExercise,
}) => {
  const [nameVi, setNameVi] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [group, setGroup] = useState<ExerciseGroup>('day_ngang');
  const [primaryMuscle, setPrimaryMuscle] = useState('Ngực');
  const [measurementType, setMeasurementType] = useState<MeasurementType>('reps');
  const [met, setMet] = useState(6.0);
  const [personalNotes, setPersonalNotes] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!nameVi.trim()) return;

    const newExercise: CalisthenicsExercise = {
      id: `custom_ex_${Date.now()}`,
      nameVi: nameVi.trim(),
      nameEn: nameEn.trim() || nameVi.trim(),
      aliases: [nameVi.toLowerCase(), nameEn.toLowerCase()],
      group,
      primaryMuscle,
      secondaryMuscles: [],
      level: 2,
      equipment: 'none',
      measurementType,
      jointImpact: 'low',
      healthWarnings: [],
      instructions: [personalNotes || 'Thực hiện động tác có kiểm soát, giữ nhịp thở đều.'],
      technicalTips: ['Lắng nghe cơ thể, dừng lại nếu thấy đau nhói ở khớp.'],
      commonMistakes: ['Nín thở khi dùng lực.'],
      breathingTip: 'Thở ra khi dùng lực, hít vào khi hạ người.',
      suggestedSetsReps: {
        beginner: '3 hiệp × 8-10 lần',
        intermediate: '3 hiệp × 12-15 lần',
        advanced: '4 hiệp × 18 lần',
      },
      met: Number(met) || 6.0,
      illustrationKey: 'custom',
      isCustom: true,
    };

    onSaveExercise(newExercise);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Thêm bài tập tự tạo"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] bg-[#1E1F22] border-t sm:border border-[#383A3F] rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl space-y-4 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Thêm bài tập riêng của bạn</h3>
          <button
            onClick={onClose}
            aria-label="Đóng thêm bài tập"
            className="w-8 h-8 rounded-full bg-[#2A2B2E] text-[#9A9CA3] hover:text-white flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-[#9A9CA3] block mb-1">Tên bài tập (Tiếng Việt) *</label>
            <input
              type="text"
              placeholder="VD: Hít đất nâng chân, Giãn cơ lưng..."
              value={nameVi}
              onChange={e => setNameVi(e.target.value)}
              className="w-full p-3 bg-[#121316] border border-[#383A3F] rounded-xl text-white text-xs focus:border-[#D4FF4F] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[#9A9CA3] block mb-1">Nhóm bài tập</label>
              <select
                value={group}
                onChange={e => setGroup(e.target.value as ExerciseGroup)}
                className="w-full p-2.5 bg-[#121316] border border-[#383A3F] rounded-xl text-white text-xs focus:outline-none cursor-pointer"
              >
                <option value="day_ngang">Đẩy ngang</option>
                <option value="day_doc">Đẩy dọc</option>
                <option value="day_gia_do">Đẩy giá đỡ (Dips)</option>
                <option value="keo">Kéo (Lưng/Xô)</option>
                <option value="chan">Chân đùi</option>
                <option value="mong_dui_sau">Mông & Đùi sau</option>
                <option value="core">Core bụng</option>
                <option value="cardio">Cardio toàn thân</option>
                <option value="plyometric">Plyometric</option>
                <option value="khoi_dong">Khởi động</option>
                <option value="gian_co">Giãn cơ</option>
              </select>
            </div>

            <div>
              <label className="text-[#9A9CA3] block mb-1">Kiểu đo</label>
              <select
                value={measurementType}
                onChange={e => setMeasurementType(e.target.value as MeasurementType)}
                className="w-full p-2.5 bg-[#121316] border border-[#383A3F] rounded-xl text-white text-xs focus:outline-none cursor-pointer"
              >
                <option value="reps">Số lần (Reps)</option>
                <option value="seconds">Thời gian giữ (Giây)</option>
                <option value="reps_per_side">Mỗi bên (Reps/bên)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[#9A9CA3] block mb-1">Nhóm cơ chính</label>
            <input
              type="text"
              placeholder="VD: Ngực, Vai, Đùi trước, Bụng..."
              value={primaryMuscle}
              onChange={e => setPrimaryMuscle(e.target.value)}
              className="w-full p-2.5 bg-[#121316] border border-[#383A3F] rounded-xl text-white text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[#9A9CA3] block mb-1">Ghi chú kỹ thuật riêng</label>
            <textarea
              rows={2}
              placeholder="Ghi chú về cảm nhận cơ hoặc lưu ý cá nhân..."
              value={personalNotes}
              onChange={e => setPersonalNotes(e.target.value)}
              className="w-full p-2.5 bg-[#121316] border border-[#383A3F] rounded-xl text-white text-xs focus:outline-none resize-none"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!nameVi.trim()}
          className="w-full py-3.5 rounded-full bg-[#D4FF4F] text-[#121316] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-[#C5F23E] disabled:opacity-40 transition-all cursor-pointer"
        >
          <Check size={16} strokeWidth={3} />
          <span>Lưu vào Thư viện của tôi</span>
        </button>
      </div>
    </div>
  );
};
