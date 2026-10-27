export type ExerciseGroup =
  | 'day_ngang'    // A. Đẩy ngang
  | 'day_doc'      // B. Đẩy dọc
  | 'day_gia_do'   // C. Đẩy có giá đỡ (Dips)
  | 'keo'          // D. Kéo ngang & kéo dọc
  | 'chan'         // E. Chân
  | 'mong_dui_sau' // F. Mông & đùi sau
  | 'core'         // G. Core bụng
  | 'cardio'       // H. Toàn thân & Cardio không dụng cụ
  | 'plyometric'   // I. Plyometric & Sức bật
  | 'ky_nang'      // J. Kỹ năng & Giữ tĩnh
  | 'khoi_dong'    // K. Khởi động
  | 'gian_co';     // L. Giãn cơ & Di động

export type EquipmentType =
  | 'none'             // Không dụng cụ
  | 'household'        // Đồ trong nhà (ghế, bàn chắc, khăn, balo, chai nước, tường)
  | 'pullup_bar'       // Thanh xà đơn
  | 'dip_bars'         // Xà kép (parallettes)
  | 'rings'            // Vòng treo (gymnastic rings)
  | 'resistance_band'; // Dây kháng lực

export type JointImpact = 'low' | 'moderate' | 'high';

export type HealthRisk =
  | 'knee'
  | 'lower_back'
  | 'wrist'
  | 'shoulder'
  | 'blood_pressure'
  | 'high_bmi';

export type MeasurementType =
  | 'reps'
  | 'seconds'
  | 'reps_per_side'
  | 'distance';

export interface CalisthenicsExercise {
  id: string;
  nameVi: string;
  nameEn: string;
  aliases: string[]; // for accent-insensitive search
  group: ExerciseGroup;
  primaryMuscle: string;
  secondaryMuscles: string[];
  level: 1 | 2 | 3 | 4 | 5; // 1: Mới tập, 2: Cơ bản, 3: Trung bình, 4: Khá, 5: Cao cấp
  progressionChainId?: string; // e.g. 'pushup_chain', 'squat_chain', 'pullup_chain', 'plank_chain'
  progressionStep?: number;
  easierExerciseId?: string;
  harderExerciseId?: string;
  equipment: EquipmentType;
  measurementType: MeasurementType;
  jointImpact: JointImpact;
  healthWarnings: HealthRisk[];
  prerequisites?: string; // Tiên quyết cho bài cao cấp
  instructions: string[];
  technicalTips: string[];
  commonMistakes: string[];
  breathingTip: string;
  suggestedSetsReps: {
    beginner: string;
    intermediate: string;
    advanced: string;
  };
  met: number; // MET factor for calorie math
  illustrationKey: string;
  isCustom?: boolean;
}

export type WorkoutStructureMode =
  | 'straight' // Tuần tự từng bài
  | 'superset' // 2 bài xen kẽ
  | 'circuit'  // Vòng tròn nhiều bài
  | 'tabata'   // Tabata 20s tập / 10s nghỉ
  | 'emom';    // Every minute on the minute

export interface CustomWorkoutExerciseItem {
  id: string; // unique item id in workout
  exerciseId: string;
  exerciseData?: CalisthenicsExercise;
  sets: number;
  targetReps?: number;
  targetSeconds?: number;
  isPerSide?: boolean;
  isAmrap?: boolean;
  repRange?: string; // e.g. "8-12"
  restSecondsAfterSet: number;
  tempo?: string; // e.g. "3-0-1" (hạ 3 giây)
  additionalLoad?: {
    type: string; // e.g. "Balo sách", "Chai nước"
    weightKg?: number;
  };
  personalNotes?: string;
}

export interface CustomWorkout {
  id: string;
  title: string;
  description: string;
  icon: string;
  colorHex?: string;
  structureMode: WorkoutStructureMode;
  circuitRounds?: number;
  restBetweenCircuitSeconds?: number;
  exercises: CustomWorkoutExerciseItem[];
  estimatedDurationMinutes: number;
  estimatedCaloriesBurned: number;
  targetGoal: 'suc_manh' | 'tang_co' | 'giam_mo' | 'suc_ben' | 'phuc_hoi';
  createdAt: string;
  updatedAt: string;
  scheduledDaysOfWeek?: number[]; // 0=CN, 1=T2, ..., 6=T7
  isFavorite?: boolean;
  isPrebuiltTemplate?: boolean;
}

export interface WorkoutSmartWarning {
  type: 'danger' | 'warning' | 'info';
  category: 'overload' | 'imbalance' | 'difficulty' | 'health_conflict' | 'rest_day' | 'age';
  title: string;
  message: string;
  suggestedFix?: string;
  actionText?: string;
  suggestedExerciseId?: string;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  maxReps?: number;
  maxSeconds?: number;
  achievedAt: string;
}
