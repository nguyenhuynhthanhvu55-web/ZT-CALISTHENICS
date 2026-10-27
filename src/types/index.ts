export type Gender = 'nam' | 'nu' | 'khac';
export type FitnessGoal = 'giam_mo' | 'tang_co' | 'giu_dang' | 'tang_suc_ben';
export type FitnessLevel = 'moi_bat_dau' | 'trung_binh' | 'nang_cao';
export type CookingMethod = 'luoc' | 'hap' | 'nuong' | 'ap_chao' | 'xao' | 'kho' | 'chien';

export interface CookingMethodInfo {
  id: CookingMethod;
  name: string;
  calDeltaPercent: number; // e.g. luoc: 0, xao: +35%, chien: +85%
  oilGrams: number;
  description: string;
}

export interface UserProfile {
  name: string;
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  goal: FitnessGoal;
  targetWeeks: number;
  fitnessLevel: FitnessLevel;
  parQPassed: boolean;
  workoutLocation: string;
  onboardingCompleted: boolean;
  dailyCalorieTarget: number;
  targetProtein: number; // grams
  targetCarbs: number;   // grams
  targetFat: number;     // grams
  dailyWaterTargetLiters: number;
  dailyStepsTarget: number;
}

export type FoodCategory = 'mon_viet' | 'nguyen_lieu' | 'dong_goi' | 'mon_cua_toi' | 'cong_thuc';

export interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  servingSize: string;
  servingGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sourceTag: 'Dữ liệu VN' | 'Ước tính' | 'Bao bì';
  icon: string;
  isRawIngredient?: boolean;
  cookingVariations?: Partial<Record<CookingMethod, MacroNutrients>>;
  barcode?: string;
  description?: string;
}

export type MealType = 'sang' | 'trua' | 'toi' | 'phu';

export interface MealLogItem {
  id: string;
  foodId: string;
  name: string;
  mealType: MealType;
  servingMultiplier: number;
  selectedCookingMethod?: CookingMethod;
  oilLevel?: 'none' | 'light' | 'normal' | 'extra';
  sugarLevel?: 'none' | 'light' | 'normal';
  calculatedCalories: number;
  calculatedProtein: number;
  calculatedCarbs: number;
  calculatedFat: number;
  timestamp: string;
}

export interface Exercise {
  id: string;
  name: string;
  vietnameseName: string;
  targetMuscle: string;
  type: 'time' | 'reps';
  defaultDurationSec: number;
  defaultReps?: number;
  burnedKcalPerMin: number;
  animationKey: string;
  tips: string[];
  easierAlternative?: { name: string; reason: string };
  harderAlternative?: { name: string; reason: string };
}

export interface WorkoutExerciseItem {
  exerciseId: string;
  seconds?: number;
  reps?: number;
  restSecAfter: number;
  useAlternative?: 'easier' | 'harder';
}

export interface Workout {
  id: string;
  title: string;
  durationMinutes: number;
  estimatedCalories: number;
  level: 'Dễ' | 'Vừa' | 'Khó';
  category: 'full_body' | 'core' | 'lower' | 'upper' | 'office' | 'low_impact';
  noEquipment: boolean;
  lowImpact: boolean;
  description: string;
  musicVibe: string;
  targetMuscles: string[];
  exercises: WorkoutExerciseItem[];
  bookmarked?: boolean;
}

export interface CompletedWorkoutRecord {
  id: string;
  workoutId: string;
  workoutTitle: string;
  completedAt: string;
  durationMinutes: number;
  caloriesBurned: number;
  fatigueRating: number; // 1 to 5
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  steps: number;
  waterLiters: number;
  weightKg?: number;
  meals: MealLogItem[];
  completedWorkouts: CompletedWorkoutRecord[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  achieved: boolean;
  unlockedAt?: string;
  progressPercent: number;
}
