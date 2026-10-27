import { CookingMethod, FitnessGoal, Gender, MacroNutrients } from '../types';

export const COOKING_METHODS: Record<
  CookingMethod,
  { name: string; calDeltaPercent: number; addedFatGrams: number; description: string; icon: string }
> = {
  luoc: {
    name: 'Luộc',
    calDeltaPercent: 0,
    addedFatGrams: 0,
    description: 'Giữ trọn đạm, không thêm calo từ dầu mỡ',
    icon: '💧',
  },
  hap: {
    name: 'Hấp',
    calDeltaPercent: 0,
    addedFatGrams: 0,
    description: 'Bảo toàn vi chất và độ ngọt tự nhiên, 0 calo dầu',
    icon: '♨️',
  },
  nuong: {
    name: 'Nướng / Nồi chiên K.Dầu',
    calDeltaPercent: 8,
    addedFatGrams: 1,
    description: 'Thơm ngon, rút bớt mỡ xấu tự nhiên',
    icon: '🔥',
  },
  ap_chao: {
    name: 'Áp chảo (chút dầu)',
    calDeltaPercent: 18,
    addedFatGrams: 3,
    description: 'Dùng xịt dầu hoặc 1/2 muỗng cà phê dầu',
    icon: '🍳',
  },
  xao: {
    name: 'Xào tỏi/rau củ',
    calDeltaPercent: 35,
    addedFatGrams: 6,
    description: 'Ngấm dầu ăn khoảng 1 muỗng canh (~54 kcal)',
    icon: '🥘',
  },
  kho: {
    name: 'Kho / Rim nước dừa',
    calDeltaPercent: 25,
    addedFatGrams: 2,
    description: 'Thêm calo từ nước màu, đường thắng hoặc nước dừa',
    icon: '🍲',
  },
  chien: {
    name: 'Chiên giòn ngập dầu',
    calDeltaPercent: 80,
    addedFatGrams: 14,
    description: 'Hút nhiều dầu, calo tăng vọt ~80-90%',
    icon: '🍟',
  },
};

/**
 * Calculates BMR using Mifflin-St Jeor formula
 */
export function calculateBMR(gender: Gender, weightKg: number, heightCm: number, age: number): number {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) return 1500;
  // Men: 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) + 5
  // Women: 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) - 161
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'nam') {
    return Math.round(base + 5);
  } else if (gender === 'nu') {
    return Math.round(base - 161);
  }
  return Math.round(base - 78);
}

/**
 * Calculates TDEE and target calories tailored for Vietnamese fitness seekers
 */
export function calculateTargets(
  gender: Gender,
  weightKg: number,
  heightCm: number,
  age: number,
  goal: FitnessGoal
): {
  bmr: number;
  tdee: number;
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterLiters: number;
} {
  const bmr = calculateBMR(gender, weightKg, heightCm, age);
  // Default moderate home workout activity factor 1.375
  const tdee = Math.round(bmr * 1.375);

  let dailyCalories = tdee;
  let proteinRatio = 0.25;
  let carbsRatio = 0.5;
  let fatRatio = 0.25;

  switch (goal) {
    case 'giam_mo':
      // Moderate healthy deficit ~400 kcal, not below BMR
      dailyCalories = Math.max(bmr, tdee - 400);
      proteinRatio = 0.30; // High protein to preserve muscle
      carbsRatio = 0.40;
      fatRatio = 0.30;
      break;
    case 'tang_co':
      // Lean surplus ~250 kcal
      dailyCalories = tdee + 250;
      proteinRatio = 0.25;
      carbsRatio = 0.50;
      fatRatio = 0.25;
      break;
    case 'tang_suc_ben':
      dailyCalories = tdee + 100;
      proteinRatio = 0.20;
      carbsRatio = 0.55;
      fatRatio = 0.25;
      break;
    case 'giu_dang':
    default:
      dailyCalories = tdee;
      proteinRatio = 0.25;
      carbsRatio = 0.45;
      fatRatio = 0.30;
      break;
  }

  // Calculate grams: Protein = 4 kcal/g, Carbs = 4 kcal/g, Fat = 9 kcal/g
  const proteinGrams = Math.round((dailyCalories * proteinRatio) / 4);
  const carbsGrams = Math.round((dailyCalories * carbsRatio) / 4);
  const fatGrams = Math.round((dailyCalories * fatRatio) / 9);

  // Daily water recommendation: ~35ml per kg of body weight, rounded to 0.1L
  const waterLiters = Number((Math.max(1.8, Math.min(3.5, (weightKg * 35) / 1000))).toFixed(1));

  return {
    bmr,
    tdee,
    dailyCalories,
    proteinGrams,
    carbsGrams,
    fatGrams,
    waterLiters,
  };
}

/**
 * Calculates adjusted nutrients when cooking raw ingredients
 */
export function calculateCookedNutrients(
  rawNutrients: MacroNutrients,
  method: CookingMethod,
  grams: number = 100
): MacroNutrients {
  const methodInfo = COOKING_METHODS[method] || COOKING_METHODS.luoc;
  const ratio = grams / 100;

  const baseCal = rawNutrients.calories * ratio;
  const deltaFactor = 1 + methodInfo.calDeltaPercent / 100;
  const calories = Math.round(baseCal * deltaFactor);

  const protein = Number((rawNutrients.protein * ratio).toFixed(1));
  const carbs = Number((rawNutrients.carbs * ratio).toFixed(1));
  const addedFat = methodInfo.addedFatGrams * ratio;
  const fat = Number(((rawNutrients.fat * ratio) + addedFat).toFixed(1));

  return {
    calories,
    protein,
    carbs,
    fat,
    fiber: rawNutrients.fiber ? Number((rawNutrients.fiber * ratio).toFixed(1)) : 0,
  };
}

/**
 * Custom adjustments for dishes (oil level, sugar level)
 */
export function adjustDishNutrients(
  base: MacroNutrients,
  servingMultiplier: number,
  oilLevel: 'none' | 'light' | 'normal' | 'extra' = 'normal',
  sugarLevel: 'none' | 'light' | 'normal' = 'normal'
): MacroNutrients {
  let calModifier = 0;
  let fatModifier = 0;
  let carbsModifier = 0;

  // Oil modifier (~1 tsp oil = 5g = 45 kcal)
  if (oilLevel === 'none') {
    calModifier -= 60;
    fatModifier -= 6.5;
  } else if (oilLevel === 'light') {
    calModifier -= 30;
    fatModifier -= 3.3;
  } else if (oilLevel === 'extra') {
    calModifier += 50;
    fatModifier += 5.5;
  }

  // Sugar modifier (~1 tsp sugar = 4g = 16 kcal)
  if (sugarLevel === 'none') {
    calModifier -= 35;
    carbsModifier -= 8;
  } else if (sugarLevel === 'light') {
    calModifier -= 18;
    carbsModifier -= 4;
  }

  const mult = Math.max(0.2, servingMultiplier);
  const adjustedCalories = Math.max(30, Math.round((base.calories + calModifier) * mult));
  const adjustedProtein = Number((base.protein * mult).toFixed(1));
  const adjustedCarbs = Math.max(0, Number(((base.carbs + carbsModifier) * mult).toFixed(1)));
  const adjustedFat = Math.max(0, Number(((base.fat + fatModifier) * mult).toFixed(1)));

  return {
    calories: adjustedCalories,
    protein: adjustedProtein,
    carbs: adjustedCarbs,
    fat: adjustedFat,
    fiber: base.fiber ? Number((base.fiber * mult).toFixed(1)) : 0,
  };
}
