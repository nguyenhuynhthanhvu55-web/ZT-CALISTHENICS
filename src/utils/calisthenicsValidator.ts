import { CALISTHENICS_EXERCISES } from '../data/calisthenicsExercises';
import {
  CalisthenicsExercise,
  CustomWorkoutExerciseItem,
  WorkoutSmartWarning,
} from '../types/calisthenics';
import { UserProfile } from '../types';

/**
 * Calculates estimated duration (in minutes) of a custom workout
 */
export function calculateWorkoutDuration(
  items: CustomWorkoutExerciseItem[],
  circuitRounds: number = 1,
  restBetweenCircuitSec: number = 60
): number {
  if (items.length === 0) return 0;

  let totalSeconds = 0;
  items.forEach(item => {
    const sets = item.sets || 1;
    // Estimate seconds per set: either targetSeconds, or reps * 2.5s tempo
    const activeSecPerSet = item.targetSeconds
      ? item.targetSeconds * (item.isPerSide ? 2 : 1)
      : (item.targetReps || 10) * 2.5 * (item.isPerSide ? 2 : 1);
    const restSecPerSet = item.restSecondsAfterSet || 45;

    // active time for all sets + rest between sets (except last set)
    totalSeconds += sets * activeSecPerSet + Math.max(0, sets - 1) * restSecPerSet;
    // add rest after the last set of this exercise
    totalSeconds += restSecPerSet;
  });

  if (circuitRounds > 1) {
    totalSeconds = totalSeconds * circuitRounds + (circuitRounds - 1) * restBetweenCircuitSec;
  }

  return Math.max(1, Math.round(totalSeconds / 60));
}

/**
 * Calculates total calories burned using MET values
 */
export function calculateWorkoutCalories(
  items: CustomWorkoutExerciseItem[],
  weightKg: number = 68,
  durationMinutes: number
): number {
  if (items.length === 0 || durationMinutes <= 0) return 0;

  // Average MET of included exercises
  let totalMet = 0;
  let count = 0;

  items.forEach(item => {
    const ex = CALISTHENICS_EXERCISES.find(e => e.id === item.exerciseId);
    if (ex) {
      totalMet += ex.met;
      count++;
    }
  });

  const avgMet = count > 0 ? totalMet / count : 5.0;
  // Calories = MET * weightKg * (durationHours)
  const durationHours = durationMinutes / 60;
  return Math.round(avgMet * weightKg * durationHours);
}

/**
 * Validates a custom workout and produces smart, gentle warnings (not blocking)
 */
export function validateCustomWorkout(
  items: CustomWorkoutExerciseItem[],
  profile: Partial<UserProfile> = {}
): WorkoutSmartWarning[] {
  const warnings: WorkoutSmartWarning[] = [];
  if (items.length === 0) return warnings;

  // Resolve exercises
  const exercisesWithItems = items
    .map(item => ({
      item,
      exercise: CALISTHENICS_EXERCISES.find(e => e.id === item.exerciseId),
    }))
    .filter((x): x is { item: CustomWorkoutExerciseItem; exercise: CalisthenicsExercise } => Boolean(x.exercise));

  // 1. Volume overload per muscle group check (limit 15-20 sets)
  const setsPerMuscle: Record<string, number> = {};
  exercisesWithItems.forEach(({ item, exercise }) => {
    const muscle = exercise.primaryMuscle;
    setsPerMuscle[muscle] = (setsPerMuscle[muscle] || 0) + (item.sets || 1);
  });

  for (const [muscle, sets] of Object.entries(setsPerMuscle)) {
    if (sets > 16) {
      warnings.push({
        type: 'warning',
        category: 'overload',
        title: `Khối lượng cao cho nhóm ${muscle}`,
        message: `Bạn đang xếp ${sets} hiệp cho nhóm cơ ${muscle}. Với người tập tại nhà, 10-14 hiệp/buổi là tối ưu nhất để tránh quá tải khớp.`,
        suggestedFix: 'Cân nhắc giảm 1-2 hiệp cho một số bài để cơ bắp phục hồi tốt hơn.',
      });
    }
  }

  // 2. Muscle balance check (Push vs Pull, Front vs Back)
  const hasPush = exercisesWithItems.some(({ exercise }) =>
    ['day_ngang', 'day_doc', 'day_gia_do'].includes(exercise.group)
  );
  const hasPull = exercisesWithItems.some(({ exercise }) => exercise.group === 'keo');

  if (hasPush && !hasPull) {
    warnings.push({
      type: 'info',
      category: 'imbalance',
      title: 'Thiếu bài tập Kéo (Lưng/Xô)',
      message: 'Buổi tập có nhiều động tác đẩy (ngực/vai) nhưng chưa có bài kéo. Điều này lâu ngày có thể dẫn tới gù lưng hoặc khom vai về trước.',
      suggestedFix: 'Thêm 1 bài chèo bàn (Table row) hoặc Superman để cân bằng cột sống.',
      suggestedExerciseId: 'pull_table_row',
      actionText: 'Thêm chèo bàn chắc',
    });
  }

  const hasCoreOnly =
    exercisesWithItems.every(({ exercise }) => exercise.group === 'core') &&
    exercisesWithItems.length >= 3;
  if (hasCoreOnly) {
    warnings.push({
      type: 'info',
      category: 'imbalance',
      title: 'Mẹo khoa học về cơ bụng',
      message: 'Tập gập bụng nhiều giúp cơ bụng săn chắc, nhưng không trực tiếp làm mất mỡ bụng tại chỗ. Thâm hụt calo dinh dưỡng mới là yếu tố quyết định lộ múi.',
    });
  }

  // 3. Health condition conflict check (PAR-Q / conditions)
  const userFitnessLevel = profile.fitnessLevel || 'trung_binh';
  const userWeight = profile.weightKg || 68;
  const userHeight = profile.heightCm || 170;
  const bmi = userHeight > 0 ? userWeight / ((userHeight / 100) * (userHeight / 100)) : 22;

  exercisesWithItems.forEach(({ exercise }) => {
    // Knee warnings
    if (!profile.parQPassed && exercise.healthWarnings.includes('knee')) {
      warnings.push({
        type: 'warning',
        category: 'health_conflict',
        title: `Lưu ý khớp gối: ${exercise.nameVi}`,
        message: `Bài ${exercise.nameVi} có áp lực gập gối lớn. Nếu thấy đau nhức, hãy chuyển sang biến thể ít tác động hơn.`,
        suggestedFix: exercise.easierExerciseId
          ? `Có thể đổi sang bài ${CALISTHENICS_EXERCISES.find(e => e.id === exercise.easierExerciseId)?.nameVi || 'dễ hơn'}.`
          : undefined,
        suggestedExerciseId: exercise.easierExerciseId,
      });
    }

    // High BMI warning on jumping plyometrics
    if (bmi >= 28 && exercise.jointImpact === 'high') {
      warnings.push({
        type: 'warning',
        category: 'health_conflict',
        title: `Tác động khớp cao: ${exercise.nameVi}`,
        message: `Với chỉ số thể trọng hiện tại, các bài bật nhảy tiếp đất có thể tạo áp lực 3-4 lần trọng lượng lên gối và cổ chân.`,
        suggestedFix: 'Gợi ý: Thử bài Step Jack hoặc Burpee không nhảy để đốt calo êm dịu.',
      });
    }

    // Difficulty mismatch: Beginner with level 4 or 5
    if (userFitnessLevel === 'moi_bat_dau' && exercise.level >= 4) {
      warnings.push({
        type: 'warning',
        category: 'difficulty',
        title: `Bài nâng cao: ${exercise.nameVi}`,
        message: `Bài tập này thuộc cấp độ ${exercise.level} (Nâng cao). Người mới tập nên xây dựng nền tảng từ bài cơ bản trước để tránh chấn thương.`,
        suggestedFix: exercise.easierExerciseId
          ? `Thử bắt đầu với: ${CALISTHENICS_EXERCISES.find(e => e.id === exercise.easierExerciseId)?.nameVi}`
          : undefined,
        suggestedExerciseId: exercise.easierExerciseId,
        actionText: 'Đổi bài dễ hơn',
      });
    }
  });

  return warnings;
}

/**
 * Generates suggested sets & reps based on target training goal
 */
export function getSuggestedSetsRepsForGoal(
  goal: 'suc_manh' | 'tang_co' | 'giam_mo' | 'suc_ben' | 'phuc_hoi',
  isMeasurementSeconds: boolean
): { sets: number; reps?: number; seconds?: number; restSec: number; label: string } {
  if (isMeasurementSeconds) {
    switch (goal) {
      case 'suc_manh':
        return { sets: 4, seconds: 20, restSec: 90, label: 'Giữ 20s (Sức mạnh)' };
      case 'tang_co':
        return { sets: 3, seconds: 35, restSec: 60, label: 'Giữ 35s (Tăng cơ)' };
      case 'suc_ben':
      case 'giam_mo':
        return { sets: 3, seconds: 45, restSec: 30, label: 'Giữ 45s (Đốt mỡ)' };
      case 'phuc_hoi':
      default:
        return { sets: 2, seconds: 30, restSec: 15, label: 'Giữ 30s (Giãn cơ)' };
    }
  }

  switch (goal) {
    case 'suc_manh':
      return { sets: 4, reps: 5, restSec: 120, label: '4 hiệp × 5 lần (Nghỉ 120s)' };
    case 'tang_co':
      return { sets: 3, reps: 10, restSec: 60, label: '3 hiệp × 10 lần (Nghỉ 60s)' };
    case 'giam_mo':
    case 'suc_ben':
      return { sets: 3, reps: 15, restSec: 30, label: '3 hiệp × 15 lần (Nghỉ 30s)' };
    case 'phuc_hoi':
    default:
      return { sets: 2, reps: 12, restSec: 20, label: '2 hiệp × 12 lần (Nghỉ 20s)' };
  }
}
