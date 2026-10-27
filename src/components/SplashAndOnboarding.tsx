import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, Activity, ShieldCheck, HeartPulse, Sparkles, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FitnessGoal, FitnessLevel, Gender } from '../types';
import { calculateTargets } from '../utils/nutrition';
import { sounds } from '../utils/sound';

export const SplashAndOnboarding: React.FC = () => {
  const { profile, updateProfile, onboardingOpen, setOnboardingOpen } = useApp();
  
  // Step 0: Splash, 1..8: Questionnaire, 9: Celebration Card
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState({
    name: profile.name || 'Thanh Vũ',
    gender: profile.gender || ('nam' as Gender),
    age: profile.age || 26,
    heightCm: profile.heightCm || 172,
    weightKg: profile.weightKg || 68.5,
    targetWeightKg: profile.targetWeightKg || 64.0,
    goal: profile.goal || ('giam_mo' as FitnessGoal),
    targetWeeks: profile.targetWeeks || 8,
    fitnessLevel: profile.fitnessLevel || ('trung_binh' as FitnessLevel),
    parQPassed: true,
    workoutLocation: 'Tại nhà, không dụng cụ',
  });

  // Check ?autostart=1 or onboardingOpen
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autostart') === '1') {
      setOnboardingOpen(false);
    }
  }, [setOnboardingOpen]);

  if (!onboardingOpen) return null;

  const totalSteps = 8;
  const progressPercent = currentStep === 0 ? 0 : Math.min(100, (currentStep / totalSteps) * 100);

  const calculatedPlan = calculateTargets(
    formData.gender,
    formData.weightKg,
    formData.heightCm,
    formData.age,
    formData.goal
  );

  const handleNext = () => {
    sounds.playShortBeep(650, 0.08);
    if (currentStep < 8) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Completed! Save to profile
      updateProfile({
        name: formData.name,
        gender: formData.gender,
        age: formData.age,
        heightCm: formData.heightCm,
        weightKg: formData.weightKg,
        targetWeightKg: formData.targetWeightKg,
        goal: formData.goal,
        targetWeeks: formData.targetWeeks,
        fitnessLevel: formData.fitnessLevel,
        parQPassed: formData.parQPassed,
        workoutLocation: formData.workoutLocation,
        dailyCalorieTarget: calculatedPlan.dailyCalories,
        targetProtein: calculatedPlan.proteinGrams,
        targetCarbs: calculatedPlan.carbsGrams,
        targetFat: calculatedPlan.fatGrams,
        dailyWaterTargetLiters: calculatedPlan.waterLiters,
        onboardingCompleted: true,
      });
      sounds.playCelebration();
      setCurrentStep(9); // Show celebration card
    }
  };

  const handleFinishCelebration = () => {
    setOnboardingOpen(false);
  };

  // STEP 0: SPLASH SCREEN (Nền lime với chữ lớn "Sẵn sàng chưa?")
  if (currentStep === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#D4FF4F] p-8 text-[#121316] select-none">
        <div className="flex justify-between items-center pt-6">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#121316]"></span>
            <span className="font-extrabold tracking-tight text-xl uppercase">ZT CALISTHENICS</span>
          </div>
          <button
            onClick={() => setOnboardingOpen(false)}
            className="text-xs px-3 py-1 rounded-full bg-[#121316]/10 text-[#121316] font-semibold hover:bg-[#121316]/20 transition-colors"
          >
            Bỏ qua
          </button>
        </div>

        <div className="my-auto space-y-4">
          <div className="inline-block px-3.5 py-1 rounded-full bg-[#121316] text-[#D4FF4F] text-xs font-bold uppercase tracking-wider">
            Dinh dưỡng & Tập không dụng cụ
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-[1.08] text-[#121316]">
            Sẵn sàng<br />chưa?
          </h1>
          <p className="text-base font-medium text-[#121316]/80 max-w-xs leading-relaxed">
            Thiết lập kế hoạch dinh dưỡng món Việt và lộ trình tập luyện tại nhà trong 1 phút.
          </p>
        </div>

        <div className="pb-8 space-y-3">
          <button
            onClick={() => setCurrentStep(1)}
            className="w-full py-4 rounded-full bg-[#121316] text-[#D4FF4F] text-base font-bold flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Bắt đầu khảo sát</span>
            <ArrowRight size={20} />
          </button>
          <p className="text-center text-[12px] text-[#121316]/60">
            Dữ liệu cá nhân được lưu hoàn toàn trên thiết bị của bạn.
          </p>
        </div>
      </div>
    );
  }

  // STEP 9: CELEBRATION CARD (Nền lime, dấu tích lớn, nút Đóng tối)
  if (currentStep === 9) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
        <div className="w-full max-w-sm rounded-[32px] bg-[#D4FF4F] p-7 text-[#121316] shadow-2xl text-center space-y-6 animate-scale-up">
          <div className="w-20 h-20 rounded-full bg-[#121316] text-[#D4FF4F] flex items-center justify-center mx-auto shadow-lg">
            <Check size={44} strokeWidth={3.5} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight">Kế hoạch đã sẵn sàng!</h2>
            <p className="text-sm font-medium text-[#121316]/80 leading-relaxed">
              Mục tiêu calo đề xuất: <strong>{calculatedPlan.dailyCalories} kcal/ngày</strong>, tập luyện không dụng cụ 4 buổi/tuần.
            </p>
          </div>

          <div className="bg-[#121316]/10 rounded-2xl p-4 text-left text-xs space-y-1.5 font-medium">
            <div className="flex justify-between">
              <span>Đạm (Protein):</span>
              <strong className="text-[#121316] font-bold">{calculatedPlan.proteinGrams}g</strong>
            </div>
            <div className="flex justify-between">
              <span>Carb:</span>
              <strong className="text-[#121316] font-bold">{calculatedPlan.carbsGrams}g</strong>
            </div>
            <div className="flex justify-between">
              <span>Chất béo:</span>
              <strong className="text-[#121316] font-bold">{calculatedPlan.fatGrams}g</strong>
            </div>
            <div className="flex justify-between">
              <span>Nước uống:</span>
              <strong className="text-[#121316] font-bold">{calculatedPlan.waterLiters}L/ngày</strong>
            </div>
          </div>

          <button
            onClick={handleFinishCelebration}
            className="w-full py-3.5 rounded-full bg-[#121316] text-[#D4FF4F] font-bold hover:bg-[#2A2B2E] transition-all cursor-pointer shadow-lg"
          >
            Đóng & Bắt đầu ngay
          </button>
        </div>
      </div>
    );
  }

  // STEPS 1..8: QUESTIONNAIRE
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#121316] text-white p-6 max-w-md mx-auto">
      {/* Top Progress & Back */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#9A9CA3]">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            className="hover:text-white transition-colors"
          >
            Quay lại
          </button>
          <span className="font-semibold text-white">Bước {currentStep} / {totalSteps}</span>
          <button
            onClick={() => setOnboardingOpen(false)}
            className="hover:text-white transition-colors"
          >
            Bỏ qua
          </button>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#2A2B2E] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#D4FF4F] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Body */}
      <div className="my-auto py-6 space-y-6">
        {/* Step 1: Giới tính */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white">Giới tính sinh học của bạn?</h2>
            <p className="text-xs text-[#9A9CA3]">Dùng để tính chỉ số trao đổi chất BMR chính xác.</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { id: 'nam', label: 'Nam giới', icon: '👨' },
                { id: 'nu', label: 'Nữ giới', icon: '👩' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setFormData({ ...formData, gender: item.id as Gender })}
                  className={`p-5 rounded-[24px] border text-center transition-all cursor-pointer ${
                    formData.gender === item.id
                      ? 'border-[#D4FF4F] bg-[#2A2B2E] text-white shadow-[0_0_15px_rgba(212,255,79,0.2)]'
                      : 'border-[#2A2B2E] bg-[#1E1F22] text-[#9A9CA3] hover:border-[#383A3F]'
                  }`}
                >
                  <span className="text-3xl block mb-2">{item.icon}</span>
                  <span className="text-base font-bold text-white">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Tuổi, Chiều cao, Cân nặng */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white">Chỉ số cơ thể hiện tại</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#9A9CA3] block mb-1">Tuổi</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-[#1E1F22] border border-[#383A3F] rounded-2xl text-white font-bold text-lg focus:border-[#D4FF4F] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#9A9CA3] block mb-1">Chiều cao (cm)</label>
                  <input
                    type="number"
                    value={formData.heightCm}
                    onChange={e => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-[#1E1F22] border border-[#383A3F] rounded-2xl text-white font-bold text-lg focus:border-[#D4FF4F] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#9A9CA3] block mb-1">Cân nặng (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.weightKg}
                    onChange={e => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-[#1E1F22] border border-[#383A3F] rounded-2xl text-white font-bold text-lg focus:border-[#D4FF4F] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Thân hình mong muốn */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white">Thân hình mong muốn của bạn?</h2>
            <div className="space-y-2.5">
              {[
                { id: 'giam_mo', label: 'Giảm mỡ thon gọn', desc: 'Thâm hụt calo lành mạnh, siết cơ bụng', icon: '🔥' },
                { id: 'tang_co', label: 'Tăng cơ săn chắc', desc: 'Tăng cơ nạc, phát triển khuôn vai ngực', icon: '💪' },
                { id: 'giu_dang', label: 'Giữ dáng & Khỏe mạnh', desc: 'Duy trì vóc dáng, ăn ngon cân bằng', icon: '🥗' },
                { id: 'tang_suc_ben', label: 'Tăng thể lực & Sức bền', desc: 'Cải thiện tim mạch, dẻo dai cả ngày', icon: '⚡' },
              ].map(goal => (
                <div
                  key={goal.id}
                  onClick={() => setFormData({ ...formData, goal: goal.id as FitnessGoal })}
                  className={`p-3.5 rounded-[20px] border flex items-center gap-3.5 cursor-pointer transition-all ${
                    formData.goal === goal.id
                      ? 'border-[#D4FF4F] bg-[#2A2B2E] shadow-[0_0_12px_rgba(212,255,79,0.15)]'
                      : 'border-[#2A2B2E] bg-[#1E1F22] hover:border-[#383A3F]'
                  }`}
                >
                  <span className="text-2xl">{goal.icon}</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{goal.label}</h4>
                    <p className="text-xs text-[#9A9CA3]">{goal.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Mục tiêu và thời hạn */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white">Mục tiêu cân nặng & Thời hạn</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#9A9CA3] block mb-1">Cân nặng mục tiêu (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.targetWeightKg}
                  onChange={e => setFormData({ ...formData, targetWeightKg: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-[#1E1F22] border border-[#383A3F] rounded-2xl text-white font-bold text-lg focus:border-[#D4FF4F] focus:outline-none"
                />
                <span className="text-[11px] text-[#D4FF4F] mt-1 block">
                  Chênh lệch: {Math.abs(Number((formData.weightKg - formData.targetWeightKg).toFixed(1)))} kg
                </span>
              </div>
              <div>
                <label className="text-xs text-[#9A9CA3] block mb-1">Thời gian dự kiến ({formData.targetWeeks} tuần)</label>
                <input
                  type="range"
                  min="4"
                  max="24"
                  step="2"
                  value={formData.targetWeeks}
                  onChange={e => setFormData({ ...formData, targetWeeks: Number(e.target.value) })}
                  className="w-full accent-[#D4FF4F] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#9A9CA3] mt-1">
                  <span>4 tuần (Nhanh)</span>
                  <span className="text-white font-bold">{formData.targetWeeks} tuần (~{(formData.targetWeeks / 4).toFixed(1)} tháng)</span>
                  <span>24 tuần (Bền vững)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Trình độ & Test đầu vào */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white">Trình độ & Thể lực hiện tại</h2>
            <div className="space-y-2.5">
              {[
                { id: 'moi_bat_dau', title: 'Mới bắt đầu', test: 'Dưới 5 cái hít đất, ít vận động' },
                { id: 'trung_binh', title: 'Trung bình', test: '5-15 cái hít đất, có thể plank 45s' },
                { id: 'nang_cao', title: 'Nâng cao', test: 'Trên 20 cái hít đất, có nền tảng thể lực tốt' },
              ].map(lvl => (
                <div
                  key={lvl.id}
                  onClick={() => setFormData({ ...formData, fitnessLevel: lvl.id as FitnessLevel })}
                  className={`p-3.5 rounded-[20px] border cursor-pointer transition-all ${
                    formData.fitnessLevel === lvl.id
                      ? 'border-[#D4FF4F] bg-[#2A2B2E]'
                      : 'border-[#2A2B2E] bg-[#1E1F22] hover:border-[#383A3F]'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white">{lvl.title}</span>
                    <span className="text-xs text-[#D4FF4F]">{lvl.test}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Tình trạng sức khỏe (PAR-Q) */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#D4FF4F]">
              <HeartPulse size={22} />
              <h2 className="text-2xl font-black text-white">Khảo sát sức khỏe PAR-Q</h2>
            </div>
            <p className="text-xs text-[#9A9CA3]">
              Bạn có từng gặp vấn đề tim mạch, đau nhức khớp gối/cột sống hay chóng mặt khi vận động mạnh không?
            </p>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setFormData({ ...formData, parQPassed: true })}
                className={`w-full p-4 rounded-[20px] border text-left flex items-center justify-between cursor-pointer ${
                  formData.parQPassed
                    ? 'border-[#D4FF4F] bg-[#2A2B2E] text-white'
                    : 'border-[#2A2B2E] bg-[#1E1F22] text-[#9A9CA3]'
                }`}
              >
                <div>
                  <span className="text-sm font-bold block text-white">Hoàn toàn bình thường</span>
                  <span className="text-xs text-[#9A9CA3]">Sẵn sàng cho các bài tập tự do tại nhà</span>
                </div>
                <Check size={18} className={formData.parQPassed ? 'text-[#D4FF4F]' : 'text-transparent'} />
              </button>
              <button
                onClick={() => setFormData({ ...formData, parQPassed: false })}
                className={`w-full p-4 rounded-[20px] border text-left flex items-center justify-between cursor-pointer ${
                  !formData.parQPassed
                    ? 'border-[#FF9F43] bg-[#2A2B2E] text-white'
                    : 'border-[#2A2B2E] bg-[#1E1F22] text-[#9A9CA3]'
                }`}
              >
                <div>
                  <span className="text-sm font-bold block text-white">Cần lưu ý khớp hoặc huyết áp</span>
                  <span className="text-xs text-[#FF9F43]">Hệ thống sẽ tự động bật chế độ ít tác động (Low Impact)</span>
                </div>
                <Check size={18} className={!formData.parQPassed ? 'text-[#FF9F43]' : 'text-transparent'} />
              </button>
            </div>
          </div>
        )}

        {/* Step 7: Nơi tập */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white">Nơi tập luyện ưu tiên</h2>
            <div className="p-4 rounded-[24px] border border-[#D4FF4F] bg-[#2A2B2E] space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏠</span>
                <span className="font-bold text-white">Tại nhà, không dụng cụ (Mặc định)</span>
              </div>
              <p className="text-xs text-[#9A9CA3]">
                100% bài tập sử dụng trọng lượng cơ thể (bodyweight), thảm hoặc sàn nhà. Không cần tạ, không cần máy móc đắt tiền.
              </p>
            </div>
          </div>
        )}

        {/* Step 8: Tóm tắt & Tính khả thi */}
        {currentStep === 8 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="text-[#D4FF4F]" size={20} />
              <h2 className="text-2xl font-black text-white">Đánh giá tính khả thi</h2>
            </div>
            <div className="p-4 rounded-[24px] bg-[#1E1F22] border border-[#383A3F] space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#9A9CA3]">Tốc độ giảm đề xuất:</span>
                <span className="font-bold text-[#D4FF4F]">
                  ~{((Math.abs(formData.weightKg - formData.targetWeightKg) / formData.targetWeeks)).toFixed(2)} kg/tuần (Lành mạnh)
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#9A9CA3]">Năng lượng BMR:</span>
                <span className="font-bold text-white">{calculatedPlan.bmr} kcal</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#9A9CA3]">Tiêu hao dự kiến (TDEE):</span>
                <span className="font-bold text-white">{calculatedPlan.tdee} kcal</span>
              </div>
              <div className="border-t border-[#2A2B2E] pt-2 flex justify-between items-center text-base">
                <span className="text-white font-bold">Mục tiêu nạp hàng ngày:</span>
                <span className="text-xl font-black text-[#D4FF4F] font-tabular">{calculatedPlan.dailyCalories} kcal</span>
              </div>
            </div>
            <p className="text-xs text-[#9A9CA3] leading-relaxed">
              Mức thâm hụt này an toàn tuyệt đối, không gây hạ đường huyết và giúp duy trì khối lượng cơ bắp tối đa.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="pt-4 border-t border-[#2A2B2E]">
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-full bg-[#D4FF4F] text-[#121316] text-base font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>{currentStep === 8 ? 'Hoàn tất & Xem kết quả' : 'Tiếp tục'}</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
