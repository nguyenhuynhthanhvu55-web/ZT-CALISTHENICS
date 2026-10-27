import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Check,
  Star,
  Volume2,
  VolumeX,
  Plus,
  Trophy,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CALISTHENICS_EXERCISES } from '../data/calisthenicsExercises';
import { EXERCISES_DATABASE } from '../data/mockData';
import { sounds } from '../utils/sound';

export const WorkoutPlayerModal: React.FC = () => {
  const {
    activeWorkoutToPlay,
    closeWorkoutPlayer,
    activeCustomWorkoutToPlay,
    closeCustomWorkoutPlayer,
    completeWorkout,
    completeCustomWorkout,
    recordPersonalBest,
    personalRecords,
  } = useApp();

  // Support either standard workout or custom workout
  const customWorkout = activeCustomWorkoutToPlay;
  const standardWorkout = activeWorkoutToPlay;
  const isCustom = Boolean(customWorkout);

  const title = customWorkout ? customWorkout.title : standardWorkout?.title || 'Buổi tập';
  const totalDurationMin = customWorkout
    ? customWorkout.estimatedDurationMinutes
    : standardWorkout?.durationMinutes || 20;
  const estimatedKcal = customWorkout
    ? customWorkout.estimatedCaloriesBurned
    : standardWorkout?.estimatedCalories || 200;

  // Flattened exercises list for execution
  const exerciseItems = React.useMemo(() => {
    if (customWorkout) {
      return customWorkout.exercises.map(item => {
        const found = CALISTHENICS_EXERCISES.find(e => e.id === item.exerciseId);
        return {
          id: item.id,
          exerciseId: item.exerciseId,
          name: found?.nameVi || 'Bài tập Calisthenics',
          targetMuscle: found?.primaryMuscle || 'Toàn thân',
          measurementType: found?.measurementType || 'reps',
          isPerSide: item.isPerSide || found?.measurementType === 'reps_per_side',
          sets: item.sets || 3,
          targetReps: item.targetReps || 10,
          targetSeconds: item.targetSeconds || 30,
          restSeconds: item.restSecondsAfterSet || 45,
          easierId: found?.easierExerciseId,
          harderId: found?.harderExerciseId,
          tips: found?.technicalTips || ['Giữ nhịp thở đều, siết chặt cơ bụng.'],
        };
      });
    }

    if (standardWorkout) {
      return standardWorkout.exercises.map((item, idx) => {
        const found = EXERCISES_DATABASE.find(e => e.id === item.exerciseId);
        return {
          id: `std_${idx}`,
          exerciseId: item.exerciseId,
          name: found?.vietnameseName || found?.name || 'Bài tập',
          targetMuscle: found?.targetMuscle || 'Toàn thân',
          measurementType: 'seconds' as const,
          isPerSide: false,
          sets: 1,
          targetReps: 12,
          targetSeconds: item.seconds || 30,
          restSeconds: item.restSecAfter || 15,
          easierId: undefined,
          harderId: undefined,
          tips: found?.tips || ['Giữ nhịp thở đều, siết chặt cơ bụng.'],
        };
      });
    }

    return [];
  }, [customWorkout, standardWorkout]);

  // Stages: 'get_ready' (3-2-1) | 'exercising' | 'resting' | 'completed'
  const [stage, setStage] = useState<'get_ready' | 'exercising' | 'resting' | 'completed'>('get_ready');
  const [readyCountdown, setReadyCountdown] = useState<number>(3);
  const [exerciseIndex, setExerciseIndex] = useState<number>(0);
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [fatigueRating, setFatigueRating] = useState<number>(4);
  const [actualRepsInput, setActualRepsInput] = useState<number>(10);
  const [totalRepsAccumulated, setTotalRepsAccumulated] = useState<number>(0);
  const [isSideSwitchPrompt, setIsSideSwitchPrompt] = useState<boolean>(false);
  const [newPrUnlocked, setNewPrUnlocked] = useState<string | null>(null);

  const activeItem = exerciseItems[exerciseIndex];
  const nextItem =
    currentSet < (activeItem?.sets || 1)
      ? activeItem
      : exerciseIndex < exerciseItems.length - 1
      ? exerciseItems[exerciseIndex + 1]
      : null;

  // Reset when open
  useEffect(() => {
    if (customWorkout || standardWorkout) {
      setStage('get_ready');
      setReadyCountdown(3);
      setExerciseIndex(0);
      setCurrentSet(1);
      setIsPaused(false);
      setTotalRepsAccumulated(0);
      setNewPrUnlocked(null);
      setIsSideSwitchPrompt(false);
      if (exerciseItems[0]) {
        setSecondsRemaining(exerciseItems[0].targetSeconds || 30);
        setActualRepsInput(exerciseItems[0].targetReps || 10);
      }
    }
  }, [customWorkout, standardWorkout, exerciseItems]);

  // 3-2-1 Countdown Timer
  useEffect(() => {
    if (stage !== 'get_ready') return;

    if (soundEnabled && readyCountdown > 0) {
      sounds.playCountdownTick();
    }

    const timer = setInterval(() => {
      setReadyCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (soundEnabled) sounds.playCountdownGo();
          setStage('exercising');
          const firstEx = exerciseItems[0];
          setSecondsRemaining(firstEx?.targetSeconds || 30);
          setActualRepsInput(firstEx?.targetReps || 10);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, readyCountdown, soundEnabled, exerciseItems]);

  // Exercise Countdown (for timed exercises) or Rest Timer
  useEffect(() => {
    if (isPaused || (stage !== 'exercising' && stage !== 'resting')) return;

    // Only count down if resting OR exercising a timed exercise
    const isTimedExercise = stage === 'exercising' && activeItem?.measurementType === 'seconds';
    if (!isTimedExercise && stage !== 'resting') return;

    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          if (stage === 'exercising') {
            // Timed exercise finished!
            handleFinishSet();
            return 0;
          } else if (stage === 'resting') {
            // Rest ended -> Start next set or next exercise
            if (soundEnabled) sounds.playCountdownGo();
            advanceToNextSetOrExercise();
            return 0;
          }
        }

        // Ticking audio for last 3 seconds
        if (soundEnabled && prev <= 4 && prev > 1) {
          sounds.playCountdownTick();
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stage, isPaused, activeItem, soundEnabled]);

  if (!customWorkout && !standardWorkout) return null;

  // Complete a set
  const handleFinishSet = () => {
    const isReps = activeItem?.measurementType !== 'seconds';
    if (isReps) {
      setTotalRepsAccumulated(prev => prev + actualRepsInput);
      // Check PR
      const currentPr = personalRecords.find(p => p.exerciseId === activeItem?.exerciseId);
      if (!currentPr || actualRepsInput > (currentPr.maxReps || 0)) {
        recordPersonalBest({
          exerciseId: activeItem.exerciseId,
          exerciseName: activeItem.name,
          maxReps: actualRepsInput,
          achievedAt: new Date().toISOString(),
        });
        setNewPrUnlocked(`Kỷ lục mới: ${activeItem.name} đạt ${actualRepsInput} reps!`);
      }
    }

    // Go to Rest screen
    if (soundEnabled) sounds.playRestDone();
    setStage('resting');
    setSecondsRemaining(activeItem?.restSeconds || 30);
  };

  const advanceToNextSetOrExercise = () => {
    if (currentSet < (activeItem?.sets || 1)) {
      // Next set of current exercise
      setCurrentSet(s => s + 1);
      setStage('exercising');
      setSecondsRemaining(activeItem?.targetSeconds || 30);
      setActualRepsInput(activeItem?.targetReps || 10);
    } else if (exerciseIndex < exerciseItems.length - 1) {
      // Next exercise
      setExerciseIndex(idx => idx + 1);
      setCurrentSet(1);
      setStage('exercising');
      const nextEx = exerciseItems[exerciseIndex + 1];
      setSecondsRemaining(nextEx?.targetSeconds || 30);
      setActualRepsInput(nextEx?.targetReps || 10);
      if (soundEnabled) sounds.playTransitionBeep();
    } else {
      // All exercises completed!
      if (soundEnabled) sounds.playCelebration();
      setStage('completed');
    }
  };

  const handleSkipRest = () => {
    if (soundEnabled) sounds.playCountdownGo();
    advanceToNextSetOrExercise();
  };

  const handleAddRestTime = (seconds: number) => {
    setSecondsRemaining(prev => prev + seconds);
    sounds.playShortBeep(700, 0.08);
  };

  const handleClose = () => {
    if (customWorkout) closeCustomWorkoutPlayer();
    if (standardWorkout) closeWorkoutPlayer();
  };

  const handleCompleteAndSave = () => {
    if (customWorkout) {
      completeCustomWorkout(customWorkout, fatigueRating, totalRepsAccumulated);
      closeCustomWorkoutPlayer();
    } else if (standardWorkout) {
      completeWorkout(standardWorkout, fatigueRating);
      closeWorkoutPlayer();
    }
  };

  // Progression: total workout progress
  const totalSetsInWorkout = exerciseItems.reduce((s, item) => s + (item.sets || 1), 0);
  let completedSetsCount = 0;
  for (let i = 0; i < exerciseIndex; i++) {
    completedSetsCount += exerciseItems[i].sets || 1;
  }
  completedSetsCount += currentSet - 1;
  const overallProgressPercent = Math.min(
    100,
    Math.round((completedSetsCount / Math.max(1, totalSetsInWorkout)) * 100)
  );

  // 1. STAGE: 3-2-1 GET READY
  if (stage === 'get_ready') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#121316] p-8 text-center text-white">
        <div className="flex justify-between items-center">
          <span className="text-xs uppercase font-extrabold tracking-wider text-[#9A9CA3] truncate max-w-[240px]">
            {title}
          </span>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-[#1E1F22] text-[#9A9CA3] hover:text-white flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        <div className="my-auto space-y-4">
          <span className="text-lg font-bold text-[#D4FF4F] uppercase tracking-wider block animate-pulse">
            Sẵn sàng chưa?
          </span>
          <div className="text-9xl font-black text-[#D4FF4F] font-tabular tracking-tighter drop-shadow-[0_0_40px_rgba(212,255,79,0.35)] animate-scale-up">
            {readyCountdown}
          </div>
          <p className="text-sm font-semibold text-white">
            Bài đầu tiên: <strong className="text-[#D4FF4F]">{activeItem?.name}</strong>
          </p>
        </div>

        <div className="text-xs text-[#9A9CA3]">
          Khởi động nhẹ cổ tay, khớp vai và hít thở sâu trước khi bắt đầu.
        </div>
      </div>
    );
  }

  // 2. STAGE: WORKOUT COMPLETED CELEBRATION
  if (stage === 'completed') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6">
        <div className="w-full max-w-sm rounded-[32px] bg-[#D4FF4F] p-7 text-[#121316] shadow-2xl text-center space-y-5 animate-scale-up">
          <div className="w-20 h-20 rounded-full bg-[#121316] text-[#D4FF4F] flex items-center justify-center mx-auto shadow-lg">
            <Check size={44} strokeWidth={3.5} />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight">Xuất sắc! Hoàn thành!</h2>
            <p className="text-xs font-semibold text-[#121316]/80">{title}</p>
          </div>

          {newPrUnlocked && (
            <div className="p-3 rounded-2xl bg-[#121316] text-[#D4FF4F] text-xs font-bold flex items-center justify-center gap-1.5 shadow-md">
              <Trophy size={16} />
              <span>{newPrUnlocked}</span>
            </div>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-3 bg-[#121316]/10 rounded-2xl p-3 text-center">
            <div>
              <span className="text-[10px] font-bold text-[#121316]/70 uppercase block">Thời gian</span>
              <span className="text-lg font-black text-[#121316] font-tabular">{totalDurationMin} phút</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#121316]/70 uppercase block">Calo đốt</span>
              <span className="text-lg font-black text-[#121316] font-tabular">~{estimatedKcal} kcal</span>
            </div>
          </div>

          {/* RPE Fatigue Rating 1-5 */}
          <div className="space-y-2 text-left">
            <label className="text-xs font-extrabold text-[#121316] block text-center">
              Cảm nhận mức độ mệt của bạn (1-5):
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => setFatigueRating(rating)}
                  aria-label={`Mức mệt ${rating}`}
                  className={`w-9 h-9 rounded-full font-black text-sm flex items-center justify-center transition-all cursor-pointer ${
                    fatigueRating >= rating
                      ? 'bg-[#121316] text-[#D4FF4F] scale-105 shadow-md'
                      : 'bg-[#121316]/20 text-[#121316]'
                  }`}
                >
                  <Star size={16} fill={fatigueRating >= rating ? '#D4FF4F' : 'none'} />
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-bold text-[#121316]/70 px-1">
              <span>1: Rất nhẹ</span>
              <span>3: Vừa phải</span>
              <span>5: Hết sức</span>
            </div>
          </div>

          <button
            onClick={handleCompleteAndSave}
            className="w-full py-4 rounded-full bg-[#121316] text-[#D4FF4F] font-black text-sm hover:bg-[#2A2B2E] transition-all cursor-pointer shadow-lg"
          >
            Đóng & Lưu kết quả vào nhật ký
          </button>
        </div>
      </div>
    );
  }

  // 3. STAGE: REST SCREEN BETWEEN SETS
  if (stage === 'resting') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#121316] p-6 text-white text-center">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-[#9A9CA3]">Nghỉ ngơi hồi sức</span>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-8 h-8 rounded-full bg-[#1E1F22] text-[#9A9CA3] flex items-center justify-center"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>

        <div className="my-auto space-y-4">
          <span className="text-sm font-bold text-[#54A0FF] uppercase tracking-wider block">
            Hít thở sâu & Uống ngụm nước
          </span>

          {/* GIANT REST COUNTDOWN TIMER */}
          <div className="text-8xl font-black text-[#54A0FF] font-tabular tracking-tighter drop-shadow-[0_0_30px_rgba(84,160,255,0.3)]">
            {secondsRemaining}s
          </div>

          {/* Add 15s / 30s Buttons */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => handleAddRestTime(15)}
              className="px-3 py-1.5 rounded-full bg-[#1E1F22] hover:bg-[#2A2B2E] text-xs font-bold text-[#54A0FF] border border-[#54A0FF]/30 transition-all cursor-pointer"
            >
              +15 giây
            </button>
            <button
              onClick={() => handleAddRestTime(30)}
              className="px-3 py-1.5 rounded-full bg-[#1E1F22] hover:bg-[#2A2B2E] text-xs font-bold text-[#54A0FF] border border-[#54A0FF]/30 transition-all cursor-pointer"
            >
              +30 giây
            </button>
          </div>

          {/* Preview next set or next exercise */}
          {nextItem && (
            <div className="max-w-xs mx-auto p-4 rounded-2xl bg-[#1E1F22] border border-[#2A2B2E] text-left space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#9A9CA3]">
                {currentSet < (activeItem?.sets || 1)
                  ? `Tiếp tục hiệp ${currentSet + 1} / ${activeItem.sets}:`
                  : 'Bài tiếp theo:'}
              </span>
              <strong className="text-sm font-bold text-white block">{nextItem.name}</strong>
              <p className="text-xs text-[#9A9CA3]">
                {nextItem.measurementType === 'seconds'
                  ? `${nextItem.targetSeconds} giây`
                  : `${nextItem.targetReps} reps ${nextItem.isPerSide ? '(mỗi bên)' : ''}`}
              </p>
            </div>
          )}
        </div>

        {/* Skip Rest Button */}
        <div className="pb-4">
          <button
            onClick={handleSkipRest}
            className="w-full py-4 rounded-full bg-[#2A2B2E] text-white font-bold text-sm border border-[#383A3F] hover:bg-[#383A3F] transition-all cursor-pointer"
          >
            Bỏ qua nghỉ ngơi (Bắt đầu hiệp tiếp)
          </button>
        </div>
      </div>
    );
  }

  // 4. STAGE: EXERCISING
  const isTimedExercise = activeItem?.measurementType === 'seconds';

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#121316] p-5 text-white select-none">
      {/* Top Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#9A9CA3]">
          <span className="font-extrabold text-white truncate max-w-[200px]">{title}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              aria-label={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className="w-8 h-8 rounded-full bg-[#1E1F22] text-[#9A9CA3] hover:text-white flex items-center justify-center transition-colors"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              onClick={handleClose}
              aria-label="Dừng buổi tập"
              className="w-8 h-8 rounded-full bg-[#1E1F22] text-[#9A9CA3] hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-[#9A9CA3] font-medium">
            <span>
              Bài {exerciseIndex + 1}/{exerciseItems.length} • Hiệp {currentSet}/{activeItem?.sets || 1}
            </span>
            <span className="text-[#D4FF4F] font-bold font-tabular">{overallProgressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#2A2B2E] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D4FF4F] rounded-full transition-all duration-300"
              style={{ width: `${overallProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Center Body */}
      <div className="my-auto text-center space-y-4">
        {/* Animated Avatar / Icon */}
        <div className="w-36 h-36 mx-auto rounded-3xl bg-gradient-to-tr from-[#1E1F22] to-[#2A2B2E] border border-[#383A3F] flex items-center justify-center shadow-2xl">
          <span className="text-5xl animate-pulse">⚡</span>
        </div>

        {/* Display: GIANT LIME COUNTDOWN NUMBER if timed, or BIG TARGET REPS if reps */}
        {isTimedExercise ? (
          <div className="space-y-1">
            <div className="text-8xl sm:text-9xl font-black text-[#D4FF4F] font-tabular tracking-tighter drop-shadow-[0_0_35px_rgba(212,255,79,0.35)] leading-none">
              {secondsRemaining}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#9A9CA3]">
              Giây còn lại
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-7xl font-black text-[#D4FF4F] font-tabular tracking-tight">
              {actualRepsInput} <span className="text-3xl text-white font-bold">lần</span>
            </div>

            {/* Stepper to adjust actual reps */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={() => setActualRepsInput(r => Math.max(1, r - 1))}
                className="w-10 h-10 rounded-full bg-[#1E1F22] border border-[#383A3F] hover:bg-[#2A2B2E] text-white font-bold text-base flex items-center justify-center cursor-pointer active:scale-95"
              >
                -
              </button>
              <span className="text-xs text-[#9A9CA3]">Số lần thực tế đạt được</span>
              <button
                onClick={() => setActualRepsInput(r => r + 1)}
                className="w-10 h-10 rounded-full bg-[#1E1F22] border border-[#383A3F] hover:bg-[#2A2B2E] text-white font-bold text-base flex items-center justify-center cursor-pointer active:scale-95"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Exercise Name & Target Muscle */}
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">{activeItem?.name}</h2>
          <span className="text-xs text-[#D4FF4F] font-semibold mt-0.5 block">
            {activeItem?.targetMuscle} {activeItem?.isPerSide ? '• (Nhớ đổi bên)' : ''}
          </span>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="space-y-3 pb-4">
        {/* If Reps exercise: Big Finish Set button */}
        {!isTimedExercise ? (
          <button
            onClick={handleFinishSet}
            className="w-full py-4 rounded-full bg-[#D4FF4F] text-[#121316] font-black text-base flex items-center justify-center gap-2 shadow-lg hover:bg-[#C5F23E] active:scale-[0.99] cursor-pointer"
          >
            <Check size={20} strokeWidth={3.5} />
            <span>Xong hiệp {currentSet} (Nghỉ {activeItem?.restSeconds || 45}s)</span>
          </button>
        ) : (
          /* If Timed exercise: Pause / Resume + Skip */
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                if (exerciseIndex > 0) setExerciseIndex(i => i - 1);
              }}
              disabled={exerciseIndex === 0}
              className="flex-1 py-3.5 rounded-full border border-[#383A3F] bg-[#1E1F22] hover:bg-[#2A2B2E] text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-30 cursor-pointer"
            >
              <SkipBack size={16} />
              <span>Bài trước</span>
            </button>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="w-14 h-14 rounded-full bg-[#2A2B2E] border-2 border-[#383A3F] text-white flex items-center justify-center hover:border-[#D4FF4F] shrink-0 cursor-pointer"
            >
              {isPaused ? <Play size={20} fill="white" /> : <Pause size={20} fill="white" />}
            </button>

            <button
              onClick={handleFinishSet}
              className="flex-1 py-3.5 rounded-full bg-[#D4FF4F] text-[#121316] font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-[#C5F23E] cursor-pointer"
            >
              <span>Xong hiệp</span>
              <SkipForward size={16} />
            </button>
          </div>
        )}

        <p className="text-center text-[11px] text-[#9A9CA3]">
          💡 {activeItem?.tips[0] || 'Dừng lại nếu bạn thấy đau nhói ở khớp. Mỏi cơ là bình thường.'}
        </p>
      </div>
    </div>
  );
};
