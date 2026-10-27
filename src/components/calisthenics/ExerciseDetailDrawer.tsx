import React from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  Flame,
  Clock,
  Sparkles,
  Bookmark,
  Plus,
  Check,
  Wind,
  AlertTriangle,
} from 'lucide-react';
import { CALISTHENICS_EXERCISES } from '../../data/calisthenicsExercises';
import { CalisthenicsExercise } from '../../types/calisthenics';
import { useApp } from '../../context/AppContext';

interface ExerciseDetailDrawerProps {
  exercise: CalisthenicsExercise | null;
  onClose: () => void;
  onSelectForWorkout?: (exercise: CalisthenicsExercise) => void;
  isSelected?: boolean;
}

export const ExerciseDetailDrawer: React.FC<ExerciseDetailDrawerProps> = ({
  exercise,
  onClose,
  onSelectForWorkout,
  isSelected,
}) => {
  const { profile } = useApp();
  const [currentEx, setCurrentEx] = React.useState<CalisthenicsExercise | null>(exercise);

  React.useEffect(() => {
    setCurrentEx(exercise);
  }, [exercise]);

  if (!currentEx) return null;

  const easierEx = currentEx.easierExerciseId
    ? CALISTHENICS_EXERCISES.find(e => e.id === currentEx.easierExerciseId)
    : null;
  const harderEx = currentEx.harderExerciseId
    ? CALISTHENICS_EXERCISES.find(e => e.id === currentEx.harderExerciseId)
    : null;

  const estimatedCalPer10Min = Math.round(currentEx.met * (profile.weightKg || 68) * (10 / 60));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Chi tiết bài tập ${currentEx.nameVi}`}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] max-h-[92vh] bg-[#1E1F22] border-t sm:border border-[#383A3F] rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col shadow-2xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 pb-3 border-b border-[#2A2B2E] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#D4FF4F]/20 text-[#D4FF4F] font-bold">
                Cấp độ {currentEx.level}/5
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2A2B2E] text-[#9A9CA3] font-medium">
                {currentEx.equipment === 'none'
                  ? 'Không dụng cụ'
                  : currentEx.equipment === 'household'
                  ? 'Đồ trong nhà'
                  : currentEx.equipment === 'pullup_bar'
                  ? 'Thanh xà'
                  : currentEx.equipment === 'dip_bars'
                  ? 'Xà kép'
                  : 'Dụng cụ'}
              </span>
            </div>
            <h2 className="text-base font-black text-white mt-1 line-clamp-1">{currentEx.nameVi}</h2>
            <span className="text-xs text-[#9A9CA3] italic">{currentEx.nameEn}</span>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng chi tiết bài tập"
            className="w-8 h-8 rounded-full bg-[#2A2B2E] text-[#9A9CA3] hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[#2A2B2E] p-3 text-center border border-[#383A3F]/50">
            <div>
              <span className="text-[10px] text-[#9A9CA3] block">CƠ CHÍNH</span>
              <strong className="text-white text-xs block truncate">{currentEx.primaryMuscle}</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#9A9CA3] block">KIỂU ĐO</span>
              <strong className="text-[#D4FF4F] text-xs block">
                {currentEx.measurementType === 'reps'
                  ? 'Số lần (reps)'
                  : currentEx.measurementType === 'seconds'
                  ? 'Thời gian (giây)'
                  : 'Mỗi bên'}
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-[#9A9CA3] block">TÁC ĐỘNG KHỚP</span>
              <strong
                className={`text-xs block ${
                  currentEx.jointImpact === 'low'
                    ? 'text-[#D4FF4F]'
                    : currentEx.jointImpact === 'moderate'
                    ? 'text-[#FF9F43]'
                    : 'text-[#FF6B6B]'
                }`}
              >
                {currentEx.jointImpact === 'low'
                  ? 'Thấp (Êm)'
                  : currentEx.jointImpact === 'moderate'
                  ? 'Vừa phải'
                  : 'Cao'}
              </strong>
            </div>
          </div>

          {/* Chuỗi tiến triển (Progression Ladder Links) */}
          {(easierEx || harderEx) && (
            <div className="p-3.5 rounded-2xl bg-[#121316] border border-[#2A2B2E] space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#9A9CA3] block">
                Chuỗi tiến triển chuyển động:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {easierEx ? (
                  <button
                    onClick={() => setCurrentEx(easierEx)}
                    className="p-2.5 rounded-xl bg-[#1E1F22] hover:bg-[#2A2B2E] border border-[#383A3F] text-left transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <span className="text-[10px] text-[#54A0FF] flex items-center gap-1 font-bold">
                      <ChevronLeft size={12} /> Bài dễ hơn:
                    </span>
                    <strong className="text-white text-xs truncate mt-0.5">{easierEx.nameVi}</strong>
                  </button>
                ) : (
                  <div className="p-2.5 rounded-xl bg-[#18191C] border border-[#25262A] text-left opacity-40">
                    <span className="text-[10px] text-[#9A9CA3] block">Bước khởi đầu</span>
                    <span className="text-xs text-[#9A9CA3]">Dễ nhất trong chuỗi</span>
                  </div>
                )}

                {harderEx ? (
                  <button
                    onClick={() => setCurrentEx(harderEx)}
                    className="p-2.5 rounded-xl bg-[#1E1F22] hover:bg-[#2A2B2E] border border-[#383A3F] text-left transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <span className="text-[10px] text-[#FF9F43] flex items-center gap-1 font-bold">
                      Bài khó hơn <ChevronRight size={12} />
                    </span>
                    <strong className="text-white text-xs truncate mt-0.5">{harderEx.nameVi}</strong>
                  </button>
                ) : (
                  <div className="p-2.5 rounded-xl bg-[#18191C] border border-[#25262A] text-left opacity-40">
                    <span className="text-[10px] text-[#D4FF4F] block">Đỉnh cao chuỗi</span>
                    <span className="text-xs text-[#9A9CA3]">Cấp độ tối đa</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Prerequisites Warning if any */}
          {currentEx.prerequisites && (
            <div className="p-3 rounded-2xl bg-[#FF9F43]/15 border border-[#FF9F43]/40 flex items-start gap-2.5 text-xs">
              <AlertTriangle size={16} className="text-[#FF9F43] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#FF9F43] block text-xs">Điều kiện tiên quyết:</strong>
                <p className="text-white text-[11px] mt-0.5 leading-relaxed">{currentEx.prerequisites}</p>
              </div>
            </div>
          )}

          {/* Steps Instructions */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">Các bước thực hiện</h4>
            <div className="space-y-1.5">
              {currentEx.instructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[#9A9CA3] text-xs">
                  <span className="w-4 h-4 rounded-full bg-[#2A2B2E] text-[#D4FF4F] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-tabular">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed text-white">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Tips & Common Mistakes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-[#2A2B2E]/60 border border-[#383A3F]/40 space-y-1">
              <strong className="text-[#D4FF4F] text-xs block">💡 Lưu ý kỹ thuật</strong>
              <p className="text-[11px] text-[#9A9CA3] leading-relaxed">
                {currentEx.technicalTips[0] || 'Tập trung siết chặt cơ bụng và chuyển động có kiểm soát.'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#2A2B2E]/60 border border-[#383A3F]/40 space-y-1">
              <strong className="text-[#FF6B6B] text-xs block">⚠️ Lỗi thường gặp</strong>
              <p className="text-[11px] text-[#9A9CA3] leading-relaxed">
                {currentEx.commonMistakes[0] || 'Tránh nín thở hoặc dùng đà quá mức.'}
              </p>
            </div>
          </div>

          {/* Breathing Guide */}
          <div className="p-3 rounded-2xl bg-[#121316] border border-[#2A2B2E] flex items-center gap-2.5">
            <Wind size={18} className="text-[#54A0FF] shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-[#54A0FF] block">Hơi thở chuẩn:</span>
              <span className="text-white text-xs">{currentEx.breathingTip}</span>
            </div>
          </div>

          {/* Suggested Reps & Sets by level */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">Gợi ý khối lượng theo cấp độ</h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-[#2A2B2E] border border-[#383A3F]/40">
                <span className="text-[10px] text-[#9A9CA3] block">Mới tập</span>
                <span className="text-white font-bold text-[11px] mt-0.5 block">
                  {currentEx.suggestedSetsReps.beginner}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#2A2B2E] border border-[#383A3F]/40">
                <span className="text-[10px] text-[#9A9CA3] block">Trung bình</span>
                <span className="text-[#D4FF4F] font-bold text-[11px] mt-0.5 block">
                  {currentEx.suggestedSetsReps.intermediate}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#2A2B2E] border border-[#383A3F]/40">
                <span className="text-[10px] text-[#9A9CA3] block">Nâng cao</span>
                <span className="text-white font-bold text-[11px] mt-0.5 block">
                  {currentEx.suggestedSetsReps.advanced}
                </span>
              </div>
            </div>
          </div>

          {/* Calorie burn rate */}
          <div className="flex items-center justify-between text-xs text-[#9A9CA3] p-2.5 rounded-xl bg-[#121316]">
            <span>Tiêu hao calo ước tính:</span>
            <strong className="text-white font-tabular font-bold">
              ~{estimatedCalPer10Min} kcal / 10 phút tập
            </strong>
          </div>
        </div>

        {/* Bottom Action Button */}
        {onSelectForWorkout && (
          <div className="p-4 bg-[#18191C] border-t border-[#2A2B2E]">
            <button
              onClick={() => onSelectForWorkout(currentEx)}
              className={`w-full py-4 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#2A2B2E] text-[#D4FF4F] border border-[#D4FF4F]'
                  : 'bg-[#D4FF4F] text-[#121316] hover:bg-[#C5F23E]'
              }`}
            >
              {isSelected ? (
                <>
                  <Check size={18} strokeWidth={3} />
                  <span>Đã chọn bài này vào buổi tập</span>
                </>
              ) : (
                <>
                  <Plus size={18} strokeWidth={2.5} />
                  <span>Thêm bài này vào buổi tập</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
