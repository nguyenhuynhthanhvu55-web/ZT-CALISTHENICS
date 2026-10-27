import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Sparkles,
  AlertTriangle,
  Info,
  Clock,
  Flame,
  Dumbbell,
  Check,
  Calendar,
  Share2,
  Play,
  RotateCcw,
} from 'lucide-react';
import { CALISTHENICS_EXERCISES } from '../../data/calisthenicsExercises';
import {
  CalisthenicsExercise,
  CustomWorkout,
  CustomWorkoutExerciseItem,
  WorkoutStructureMode,
} from '../../types/calisthenics';
import {
  calculateWorkoutCalories,
  calculateWorkoutDuration,
  getSuggestedSetsRepsForGoal,
  validateCustomWorkout,
} from '../../utils/calisthenicsValidator';
import { ExerciseLibraryModal } from './ExerciseLibraryModal';
import { useApp } from '../../context/AppContext';

interface WorkoutBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveWorkout: (workout: CustomWorkout) => void;
  onStartWorkoutNow?: (workout: CustomWorkout) => void;
  initialWorkout?: CustomWorkout | null;
}

export const WorkoutBuilderModal: React.FC<WorkoutBuilderModalProps> = ({
  isOpen,
  onClose,
  onSaveWorkout,
  onStartWorkoutNow,
  initialWorkout,
}) => {
  const { profile } = useApp();

  const [title, setTitle] = useState(initialWorkout?.title || 'Buổi Tập Calisthenics Của Tôi');
  const [description, setDescription] = useState(
    initialWorkout?.description || 'Tập trung xây dựng sức mạnh cơ thể tại nhà không cần dụng cụ.'
  );
  const [icon, setIcon] = useState(initialWorkout?.icon || '💪');
  const [colorHex, setColorHex] = useState(initialWorkout?.colorHex || '#D4FF4F');
  const [structureMode, setStructureMode] = useState<WorkoutStructureMode>(
    initialWorkout?.structureMode || 'straight'
  );
  const [circuitRounds, setCircuitRounds] = useState(initialWorkout?.circuitRounds || 3);
  const [targetGoal, setTargetGoal] = useState<'suc_manh' | 'tang_co' | 'giam_mo' | 'suc_ben' | 'phuc_hoi'>(
    initialWorkout?.targetGoal || 'tang_co'
  );

  // Exercise items list
  const [items, setItems] = useState<CustomWorkoutExerciseItem[]>(() => {
    if (initialWorkout?.exercises && initialWorkout.exercises.length > 0) {
      return initialWorkout.exercises;
    }
    // Default starter: 1 push, 1 pull, 1 leg, 1 core
    return [
      {
        id: 'init_1',
        exerciseId: 'pushup_standard',
        sets: 3,
        targetReps: 10,
        restSecondsAfterSet: 60,
      },
      {
        id: 'init_2',
        exerciseId: 'pull_table_row',
        sets: 3,
        targetReps: 10,
        restSecondsAfterSet: 60,
      },
      {
        id: 'init_3',
        exerciseId: 'squat_bodyweight',
        sets: 3,
        targetReps: 15,
        restSecondsAfterSet: 45,
      },
      {
        id: 'init_4',
        exerciseId: 'core_forearm_plank',
        sets: 3,
        targetSeconds: 35,
        restSecondsAfterSet: 45,
      },
    ];
  });

  const [isLibraryPickerOpen, setIsLibraryPickerOpen] = useState(false);
  const [scheduledDays, setScheduledDays] = useState<number[]>(
    initialWorkout?.scheduledDaysOfWeek || [1, 3, 5] // T2, T4, T6
  );

  // Calculations
  const durationMinutes = useMemo(() => {
    return calculateWorkoutDuration(items, structureMode === 'circuit' ? circuitRounds : 1);
  }, [items, structureMode, circuitRounds]);

  const caloriesBurned = useMemo(() => {
    return calculateWorkoutCalories(items, profile.weightKg || 68, durationMinutes);
  }, [items, profile.weightKg, durationMinutes]);

  // Smart Validation Warnings (gentle, non-blocking)
  const smartWarnings = useMemo(() => {
    return validateCustomWorkout(items, profile);
  }, [items, profile]);

  if (!isOpen) return null;

  // Reorder items
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setItems(newItems);
  };

  // Duplicate item
  const duplicateItem = (index: number) => {
    const itemToDup = items[index];
    const newItem: CustomWorkoutExerciseItem = {
      ...itemToDup,
      id: `dup_${Date.now()}_${Math.random()}`,
    };
    const newItems = [...items];
    newItems.splice(index + 1, 0, newItem);
    setItems(newItems);
  };

  // Remove item
  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Update item field
  const updateItem = (id: string, updates: Partial<CustomWorkoutExerciseItem>) => {
    setItems(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  // Handle adding batch exercises from library
  const handleAddExercisesFromLibrary = (selectedList: CalisthenicsExercise[]) => {
    const newItems: CustomWorkoutExerciseItem[] = selectedList.map(ex => {
      const isSeconds = ex.measurementType === 'seconds';
      const suggestion = getSuggestedSetsRepsForGoal(targetGoal, isSeconds);
      return {
        id: `ex_item_${Date.now()}_${Math.random()}`,
        exerciseId: ex.id,
        sets: suggestion.sets,
        targetReps: suggestion.reps,
        targetSeconds: suggestion.seconds,
        isPerSide: ex.measurementType === 'reps_per_side',
        restSecondsAfterSet: suggestion.restSec,
      };
    });
    setItems(prev => [...prev, ...newItems]);
  };

  // Auto Warmup & Cooldown Suggester
  const handleAddWarmupAndCooldown = () => {
    const warmupItem: CustomWorkoutExerciseItem = {
      id: `warmup_${Date.now()}`,
      exerciseId: 'warmup_joint_rotations',
      sets: 1,
      targetSeconds: 60,
      restSecondsAfterSet: 15,
    };
    const cooldownItem: CustomWorkoutExerciseItem = {
      id: `cooldown_${Date.now()}`,
      exerciseId: 'stretch_childs_pose',
      sets: 1,
      targetSeconds: 45,
      restSecondsAfterSet: 0,
    };
    setItems(prev => [warmupItem, ...prev, cooldownItem]);
  };

  // Save Workout
  const handleSave = () => {
    const workoutToSave: CustomWorkout = {
      id: initialWorkout?.id || `workout_custom_${Date.now()}`,
      title: title.trim() || 'Buổi tập Calisthenics',
      description,
      icon,
      colorHex,
      structureMode,
      circuitRounds: structureMode === 'circuit' ? circuitRounds : undefined,
      exercises: items,
      estimatedDurationMinutes: durationMinutes,
      estimatedCaloriesBurned: caloriesBurned,
      targetGoal,
      createdAt: initialWorkout?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scheduledDaysOfWeek: scheduledDays,
      isFavorite: initialWorkout?.isFavorite || true,
    };

    onSaveWorkout(workoutToSave);
    onClose();
  };

  // Total Sets
  const totalSets = items.reduce((sum, item) => sum + (item.sets || 1), 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Trình tạo buổi tập tự chọn"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-fade-in"
    >
      <div className="w-full max-w-[440px] h-full sm:h-[92vh] bg-[#121316] border sm:border-[#383A3F] sm:rounded-[36px] overflow-hidden flex flex-col shadow-2xl">
        {/* Top Header */}
        <div className="p-4 border-b border-[#2A2B2E] bg-[#18191C] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{icon}</span>
              <h2 className="text-base font-black text-white">Trình Tạo Buổi Tập</h2>
            </div>
            <p className="text-[11px] text-[#9A9CA3]">Tự ghép bài, đặt reps & hiệp theo ý bạn</p>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng trình tạo buổi tập"
            className="w-8 h-8 rounded-full bg-[#2A2B2E] text-[#9A9CA3] hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Configuration Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Title & Goal Settings */}
          <div className="p-3.5 rounded-[24px] bg-[#1E1F22] border border-[#2A2B2E] space-y-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-[#9A9CA3] block mb-1">
                Tên buổi tập:
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="VD: Full Body 20p, Đẩy ngực tay sau..."
                className="w-full p-2.5 bg-[#121316] border border-[#383A3F] rounded-xl text-white font-bold text-sm focus:border-[#D4FF4F] focus:outline-none"
              />
            </div>

            {/* Target Goal Chips */}
            <div>
              <label className="text-[10px] uppercase font-bold text-[#9A9CA3] block mb-1.5">
                Mục tiêu chính:
              </label>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'tang_co', label: 'Tăng cơ' },
                  { id: 'giam_mo', label: 'Giảm mỡ' },
                  { id: 'suc_manh', label: 'Sức mạnh' },
                  { id: 'suc_ben', label: 'Sức bền' },
                  { id: 'phuc_hoi', label: 'Phục hồi' },
                ].map(g => (
                  <button
                    key={g.id}
                    onClick={() => setTargetGoal(g.id as any)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      targetGoal === g.id
                        ? 'bg-[#D4FF4F] text-[#121316]'
                        : 'bg-[#2A2B2E] text-[#9A9CA3] hover:text-white'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Workout Structure Mode */}
            <div>
              <label className="text-[10px] uppercase font-bold text-[#9A9CA3] block mb-1.5">
                Cách ghép bài:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'straight', label: 'Tuần tự' },
                  { id: 'superset', label: 'Superset (Xen kẽ)' },
                  { id: 'circuit', label: 'Circuit (Vòng tròn)' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setStructureMode(m.id as any)}
                    className={`p-2 rounded-xl text-[11px] font-bold text-center border transition-all cursor-pointer ${
                      structureMode === m.id
                        ? 'bg-[#D4FF4F] text-[#121316] border-[#D4FF4F]'
                        : 'bg-[#121316] text-[#9A9CA3] border-[#2A2B2E] hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {structureMode === 'circuit' && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2A2B2E] text-xs">
                  <span className="text-[#9A9CA3]">Số vòng lặp:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCircuitRounds(r => Math.max(1, r - 1))}
                      className="w-6 h-6 rounded-lg bg-[#2A2B2E] text-white flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <strong className="text-white font-tabular">{circuitRounds} vòng</strong>
                    <button
                      onClick={() => setCircuitRounds(r => Math.min(6, r + 1))}
                      className="w-6 h-6 rounded-lg bg-[#2A2B2E] text-white flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Smart Warnings Banner (Non-blocking advice) */}
          {smartWarnings.length > 0 && (
            <div className="space-y-2">
              {smartWarnings.map((warning, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl border flex items-start gap-2.5 text-xs ${
                    warning.type === 'danger'
                      ? 'bg-[#FF6B6B]/15 border-[#FF6B6B]/40 text-[#FF6B6B]'
                      : warning.type === 'warning'
                      ? 'bg-[#FF9F43]/15 border-[#FF9F43]/40 text-[#FF9F43]'
                      : 'bg-[#54A0FF]/15 border-[#54A0FF]/40 text-[#54A0FF]'
                  }`}
                >
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="block text-white text-xs">{warning.title}</strong>
                    <p className="text-[#9A9CA3] text-[11px] leading-relaxed">{warning.message}</p>
                    {warning.actionText && (
                      <button
                        onClick={() => {
                          if (warning.suggestedExerciseId) {
                            const newEx = CALISTHENICS_EXERCISES.find(
                              e => e.id === warning.suggestedExerciseId
                            );
                            if (newEx) handleAddExercisesFromLibrary([newEx]);
                          }
                        }}
                        className="text-[11px] text-[#D4FF4F] font-bold hover:underline block pt-0.5"
                      >
                        + {warning.actionText}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Exercise Items List Header */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Danh sách bài tập ({items.length})</h3>
            </div>

            <button
              onClick={handleAddWarmupAndCooldown}
              className="text-[10px] px-2.5 py-1 rounded-full bg-[#1E1F22] hover:bg-[#2A2B2E] text-[#D4FF4F] font-bold border border-[#383A3F] flex items-center gap-1 transition-all cursor-pointer"
            >
              <Sparkles size={11} /> + Khởi động & Giãn cơ
            </button>
          </div>

          {/* Exercises in Workout */}
          <div className="space-y-3">
            {items.map((item, index) => {
              const exData = CALISTHENICS_EXERCISES.find(e => e.id === item.exerciseId);
              if (!exData) return null;

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-[24px] bg-[#1E1F22] border border-[#2A2B2E] space-y-3"
                >
                  {/* Top: Name, Order and Delete */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#2A2B2E] text-[#D4FF4F] font-bold text-[10px] flex items-center justify-center font-tabular">
                        {index + 1}
                      </span>
                      <div>
                        <strong className="text-white text-xs block">{exData.nameVi}</strong>
                        <span className="text-[10px] text-[#9A9CA3]">
                          {exData.primaryMuscle} • Cấp {exData.level}
                        </span>
                      </div>
                    </div>

                    {/* Actions: Move Up, Down, Duplicate, Delete */}
                    <div className="flex items-center gap-1 text-[#9A9CA3]">
                      <button
                        onClick={() => moveItem(index, 'up')}
                        disabled={index === 0}
                        aria-label="Di chuyển lên"
                        className="p-1 hover:text-white disabled:opacity-20"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => moveItem(index, 'down')}
                        disabled={index === items.length - 1}
                        aria-label="Di chuyển xuống"
                        className="p-1 hover:text-white disabled:opacity-20"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        onClick={() => duplicateItem(index)}
                        aria-label="Nhân bản bài"
                        className="p-1 hover:text-[#D4FF4F]"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label="Xóa bài"
                        className="p-1 hover:text-[#FF6B6B]"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Sets, Reps/Seconds Controls */}
                  <div className="grid grid-cols-2 gap-2 bg-[#121316] p-2.5 rounded-2xl border border-[#25262A]">
                    {/* Sets */}
                    <div>
                      <span className="text-[10px] text-[#9A9CA3] block mb-1">Số hiệp (Sets)</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateItem(item.id, { sets: Math.max(1, item.sets - 1) })}
                          className="w-7 h-7 rounded-lg bg-[#2A2B2E] text-white flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="text-white font-bold text-xs font-tabular flex-1 text-center">
                          {item.sets}
                        </span>
                        <button
                          onClick={() => updateItem(item.id, { sets: Math.min(10, item.sets + 1) })}
                          className="w-7 h-7 rounded-lg bg-[#2A2B2E] text-white flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Reps or Seconds */}
                    <div>
                      <span className="text-[10px] text-[#9A9CA3] block mb-1">
                        {exData.measurementType === 'seconds' ? 'Giữ (giây)' : 'Số lần (reps)'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            if (exData.measurementType === 'seconds') {
                              updateItem(item.id, {
                                targetSeconds: Math.max(5, (item.targetSeconds || 30) - 5),
                              });
                            } else {
                              updateItem(item.id, {
                                targetReps: Math.max(1, (item.targetReps || 10) - 1),
                              });
                            }
                          }}
                          className="w-7 h-7 rounded-lg bg-[#2A2B2E] text-white flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="text-[#D4FF4F] font-bold text-xs font-tabular flex-1 text-center">
                          {exData.measurementType === 'seconds'
                            ? `${item.targetSeconds || 30}s`
                            : `${item.targetReps || 10} reps`}
                        </span>
                        <button
                          onClick={() => {
                            if (exData.measurementType === 'seconds') {
                              updateItem(item.id, {
                                targetSeconds: (item.targetSeconds || 30) + 5,
                              });
                            } else {
                              updateItem(item.id, {
                                targetReps: (item.targetReps || 10) + 1,
                              });
                            }
                          }}
                          className="w-7 h-7 rounded-lg bg-[#2A2B2E] text-white flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Rest & Per-side & Tempo Options */}
                  <div className="flex items-center justify-between text-[11px] text-[#9A9CA3] pt-1">
                    <div className="flex items-center gap-1.5">
                      <span>Nghỉ:</span>
                      {[30, 45, 60].map(s => (
                        <button
                          key={s}
                          onClick={() => updateItem(item.id, { restSecondsAfterSet: s })}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            item.restSecondsAfterSet === s
                              ? 'bg-[#D4FF4F] text-[#121316]'
                              : 'bg-[#2A2B2E] text-[#9A9CA3]'
                          }`}
                        >
                          {s}s
                        </button>
                      ))}
                    </div>

                    {exData.measurementType === 'reps_per_side' && (
                      <span className="px-2 py-0.5 rounded-full bg-[#54A0FF]/15 text-[#54A0FF] font-bold text-[9px]">
                        Mỗi bên chân/tay
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Exercise from Library Button */}
          <button
            onClick={() => setIsLibraryPickerOpen(true)}
            className="w-full py-4 rounded-[22px] bg-[#1E1F22] hover:bg-[#2A2B2E] border border-dashed border-[#383A3F] hover:border-[#D4FF4F] text-xs font-bold text-[#D4FF4F] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Thêm bài tập từ Thư viện Calisthenics</span>
          </button>
        </div>

        {/* Bottom Sticky Summary Bar */}
        <div className="p-4 bg-[#18191C] border-t border-[#2A2B2E] space-y-3">
          {/* Summary Stats */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="text-[#9A9CA3]">
                <strong className="text-white font-tabular">{items.length}</strong> bài
              </span>
              <span>•</span>
              <span className="text-[#9A9CA3]">
                <strong className="text-white font-tabular">{totalSets}</strong> hiệp
              </span>
              <span>•</span>
              <span className="text-[#D4FF4F] font-bold font-tabular flex items-center gap-1">
                <Clock size={12} /> {durationMinutes}p
              </span>
              <span>•</span>
              <span className="text-[#FF9F43] font-bold font-tabular flex items-center gap-1">
                <Flame size={12} /> ~{caloriesBurned} kcal
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex-1 py-3.5 rounded-full bg-[#D4FF4F] text-[#121316] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-[#C5F23E] cursor-pointer"
            >
              <Check size={16} strokeWidth={3} />
              <span>Lưu buổi tập của tôi</span>
            </button>

            {onStartWorkoutNow && items.length > 0 && (
              <button
                onClick={() => {
                  const customObj: CustomWorkout = {
                    id: `workout_temp_${Date.now()}`,
                    title,
                    description,
                    icon,
                    structureMode,
                    exercises: items,
                    estimatedDurationMinutes: durationMinutes,
                    estimatedCaloriesBurned: caloriesBurned,
                    targetGoal,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                  onStartWorkoutNow(customObj);
                }}
                className="px-4 py-3.5 rounded-full bg-[#2A2B2E] hover:bg-[#383A3F] text-xs font-bold text-white border border-[#383A3F] flex items-center gap-1.5 cursor-pointer"
              >
                <Play size={14} fill="white" />
                <span>Tập ngay</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Library Picker Modal */}
      <ExerciseLibraryModal
        isOpen={isLibraryPickerOpen}
        onClose={() => setIsLibraryPickerOpen(false)}
        mode="picker"
        selectedExerciseIds={items.map(i => i.exerciseId)}
        onSelectExercises={selectedList => {
          handleAddExercisesFromLibrary(selectedList);
        }}
      />
    </div>
  );
};
