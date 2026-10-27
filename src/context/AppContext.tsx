import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  INITIAL_BADGES,
  INITIAL_PROFILE,
  INITIAL_TODAY_LOG,
  WORKOUTS_DATABASE,
} from '../data/mockData';
import { PREBUILT_WORKOUT_TEMPLATES } from '../data/workoutTemplates';
import {
  Badge,
  CompletedWorkoutRecord,
  DayLog,
  FoodItem,
  MealLogItem,
  MealType,
  UserProfile,
  Workout,
} from '../types';
import { CustomWorkout, PersonalRecord } from '../types/calisthenics';
import { sounds } from '../utils/sound';

interface AppContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  activeTab: 'home' | 'meal' | 'workout' | 'stats' | 'rewards';
  setActiveTab: (tab: 'home' | 'meal' | 'workout' | 'stats' | 'rewards') => void;
  todayLog: DayLog;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  addMeal: (meal: Omit<MealLogItem, 'id' | 'timestamp'>) => void;
  removeMeal: (id: string) => void;
  addWater: (amountLiters: number) => void;
  addSteps: (steps: number) => void;
  recordWeight: (weightKg: number) => void;
  completeWorkout: (workout: Workout, fatigueRating: number) => void;
  completeCustomWorkout: (workout: CustomWorkout, fatigueRating: number, totalReps: number) => void;
  savedWorkoutIds: string[];
  toggleBookmark: (workoutId: string) => void;
  badges: Badge[];
  streakDays: number;

  // Custom Workouts & Calisthenics Library
  customWorkouts: CustomWorkout[];
  saveCustomWorkout: (workout: CustomWorkout) => void;
  deleteCustomWorkout: (id: string) => void;
  activeCustomWorkoutToPlay: CustomWorkout | null;
  startCustomWorkoutPlayer: (workout: CustomWorkout) => void;
  closeCustomWorkoutPlayer: () => void;
  isLibraryModalOpen: boolean;
  setIsLibraryModalOpen: (open: boolean) => void;
  isWorkoutBuilderOpen: boolean;
  setIsWorkoutBuilderOpen: (open: boolean) => void;
  editingWorkoutForBuilder: CustomWorkout | null;
  setEditingWorkoutForBuilder: (w: CustomWorkout | null) => void;
  personalRecords: PersonalRecord[];
  recordPersonalBest: (record: PersonalRecord) => void;

  // Modals & Sheets
  quickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
  activeWorkoutToPlay: Workout | null;
  startWorkoutPlayer: (workout: Workout) => void;
  closeWorkoutPlayer: () => void;
  selectedFoodForDetail: FoodItem | null;
  targetMealTypeForAdd: MealType;
  openFoodDetail: (food: FoodItem, mealType?: MealType) => void;
  closeFoodDetail: () => void;
  naturalLanguageModalOpen: boolean;
  setNaturalLanguageModalOpen: (open: boolean) => void;
  barcodeScannerOpen: boolean;
  setBarcodeScannerOpen: (open: boolean) => void;
  weightLogModalOpen: boolean;
  setWeightLogModalOpen: (open: boolean) => void;
  onboardingOpen: boolean;
  setOnboardingOpen: (open: boolean) => void;
  selectedWorkoutForDetail: Workout | null;
  setSelectedWorkoutForDetail: (workout: Workout | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('ztcalisthenics_profile') || localStorage.getItem('zkhealth_profile') || localStorage.getItem('fitviet_profile');
      return saved ? JSON.parse(saved) : INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  });

  const [activeTab, setActiveTab] = useState<'home' | 'meal' | 'workout' | 'stats' | 'rewards'>('home');
  const [todayDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedDate, setSelectedDate] = useState(todayDate);

  const [todayLog, setTodayLog] = useState<DayLog>(() => {
    try {
      const saved = localStorage.getItem(`ztcalisthenics_log_${todayDate}`) || localStorage.getItem(`zkhealth_log_${todayDate}`) || localStorage.getItem(`fitviet_log_${todayDate}`);
      return saved ? JSON.parse(saved) : INITIAL_TODAY_LOG;
    } catch {
      return INITIAL_TODAY_LOG;
    }
  });

  const [savedWorkoutIds, setSavedWorkoutIds] = useState<string[]>(['workout_hiit_fatburn']);
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [streakDays, setStreakDays] = useState(4);

  // Custom Workouts & Templates
  const [customWorkouts, setCustomWorkouts] = useState<CustomWorkout[]>(() => {
    try {
      const saved = localStorage.getItem('ztcalisthenics_custom_workouts') || localStorage.getItem('zkhealth_custom_workouts') || localStorage.getItem('fitviet_custom_workouts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return PREBUILT_WORKOUT_TEMPLATES;
    } catch {
      return PREBUILT_WORKOUT_TEMPLATES;
    }
  });

  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>(() => {
    try {
      const saved = localStorage.getItem('ztcalisthenics_prs') || localStorage.getItem('zkhealth_prs') || localStorage.getItem('fitviet_prs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Builder & Library Modals
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isWorkoutBuilderOpen, setIsWorkoutBuilderOpen] = useState(false);
  const [editingWorkoutForBuilder, setEditingWorkoutForBuilder] = useState<CustomWorkout | null>(null);
  const [activeCustomWorkoutToPlay, setActiveCustomWorkoutToPlay] = useState<CustomWorkout | null>(null);

  // General Modals
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [activeWorkoutToPlay, setActiveWorkoutToPlay] = useState<Workout | null>(null);
  const [selectedWorkoutForDetail, setSelectedWorkoutForDetail] = useState<Workout | null>(null);
  const [selectedFoodForDetail, setSelectedFoodForDetail] = useState<FoodItem | null>(null);
  const [targetMealTypeForAdd, setTargetMealTypeForAdd] = useState<MealType>('trua');
  const [naturalLanguageModalOpen, setNaturalLanguageModalOpen] = useState(false);
  const [barcodeScannerOpen, setBarcodeScannerOpen] = useState(false);
  const [weightLogModalOpen, setWeightLogModalOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // Sync theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  // Persist Profile
  useEffect(() => {
    try {
      const data = JSON.stringify(profile);
      localStorage.setItem('ztcalisthenics_profile', data);
      localStorage.setItem('zkhealth_profile', data);
    } catch {}
  }, [profile]);

  // Persist Today's Log
  useEffect(() => {
    try {
      const data = JSON.stringify(todayLog);
      localStorage.setItem(`ztcalisthenics_log_${todayDate}`, data);
      localStorage.setItem(`zkhealth_log_${todayDate}`, data);
    } catch {}
  }, [todayLog, todayDate]);

  // Persist Custom Workouts
  useEffect(() => {
    try {
      const data = JSON.stringify(customWorkouts);
      localStorage.setItem('ztcalisthenics_custom_workouts', data);
      localStorage.setItem('zkhealth_custom_workouts', data);
    } catch {}
  }, [customWorkouts]);

  // Persist Personal Records
  useEffect(() => {
    try {
      const data = JSON.stringify(personalRecords);
      localStorage.setItem('ztcalisthenics_prs', data);
      localStorage.setItem('zkhealth_prs', data);
    } catch {}
  }, [personalRecords]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const addMeal = (meal: Omit<MealLogItem, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newMealItem: MealLogItem = {
      ...meal,
      id: `meal_${Date.now()}`,
      timestamp: timeStr,
    };
    setTodayLog(prev => ({
      ...prev,
      meals: [...prev.meals, newMealItem],
    }));
    sounds.playShortBeep(700, 0.1);
  };

  const removeMeal = (id: string) => {
    setTodayLog(prev => ({
      ...prev,
      meals: prev.meals.filter(m => m.id !== id),
    }));
  };

  const addWater = (amountLiters: number) => {
    setTodayLog(prev => ({
      ...prev,
      waterLiters: Number(Math.max(0, prev.waterLiters + amountLiters).toFixed(2)),
    }));
    sounds.playShortBeep(900, 0.12);
  };

  const addSteps = (steps: number) => {
    setTodayLog(prev => ({
      ...prev,
      steps: Math.max(0, prev.steps + steps),
    }));
  };

  const recordWeight = (weightKg: number) => {
    setTodayLog(prev => ({
      ...prev,
      weightKg,
    }));
    setProfile(prev => ({
      ...prev,
      weightKg,
    }));
    sounds.playShortBeep(850, 0.15);
  };

  const completeWorkout = (workout: Workout, fatigueRating: number) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const record: CompletedWorkoutRecord = {
      id: `cw_${Date.now()}`,
      workoutId: workout.id,
      workoutTitle: workout.title,
      completedAt: timeStr,
      durationMinutes: workout.durationMinutes,
      caloriesBurned: workout.estimatedCalories,
      fatigueRating,
    };

    setTodayLog(prev => ({
      ...prev,
      completedWorkouts: [record, ...prev.completedWorkouts],
    }));

    setBadges(prev =>
      prev.map(b => (b.id === 'first_workout' ? { ...b, achieved: true, progressPercent: 100 } : b))
    );
  };

  const completeCustomWorkout = (workout: CustomWorkout, fatigueRating: number, totalReps: number) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const record: CompletedWorkoutRecord = {
      id: `cw_${Date.now()}`,
      workoutId: workout.id,
      workoutTitle: workout.title,
      completedAt: timeStr,
      durationMinutes: workout.estimatedDurationMinutes,
      caloriesBurned: workout.estimatedCaloriesBurned,
      fatigueRating,
    };

    setTodayLog(prev => ({
      ...prev,
      completedWorkouts: [record, ...prev.completedWorkouts],
    }));

    setBadges(prev =>
      prev.map(b => (b.id === 'first_workout' ? { ...b, achieved: true, progressPercent: 100 } : b))
    );
  };

  const saveCustomWorkout = (workout: CustomWorkout) => {
    setCustomWorkouts(prev => {
      const exists = prev.some(w => w.id === workout.id);
      if (exists) {
        return prev.map(w => (w.id === workout.id ? workout : w));
      }
      return [workout, ...prev];
    });
    sounds.playShortBeep(900, 0.15);
  };

  const deleteCustomWorkout = (id: string) => {
    setCustomWorkouts(prev => prev.filter(w => w.id !== id));
  };

  const recordPersonalBest = (record: PersonalRecord) => {
    setPersonalRecords(prev => {
      const filtered = prev.filter(p => p.exerciseId !== record.exerciseId);
      return [record, ...filtered];
    });
  };

  const toggleBookmark = (workoutId: string) => {
    setSavedWorkoutIds(prev =>
      prev.includes(workoutId) ? prev.filter(id => id !== workoutId) : [...prev, workoutId]
    );
  };

  const startWorkoutPlayer = (workout: Workout) => {
    setSelectedWorkoutForDetail(null);
    setActiveWorkoutToPlay(workout);
  };

  const closeWorkoutPlayer = () => {
    setActiveWorkoutToPlay(null);
  };

  const startCustomWorkoutPlayer = (workout: CustomWorkout) => {
    setActiveCustomWorkoutToPlay(workout);
  };

  const closeCustomWorkoutPlayer = () => {
    setActiveCustomWorkoutToPlay(null);
  };

  const openFoodDetail = (food: FoodItem, mealType: MealType = 'trua') => {
    setTargetMealTypeForAdd(mealType);
    setSelectedFoodForDetail(food);
  };

  const closeFoodDetail = () => {
    setSelectedFoodForDetail(null);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        profile,
        updateProfile,
        activeTab,
        setActiveTab,
        todayLog,
        selectedDate,
        setSelectedDate,
        addMeal,
        removeMeal,
        addWater,
        addSteps,
        recordWeight,
        completeWorkout,
        completeCustomWorkout,
        savedWorkoutIds,
        toggleBookmark,
        badges,
        streakDays,
        customWorkouts,
        saveCustomWorkout,
        deleteCustomWorkout,
        activeCustomWorkoutToPlay,
        startCustomWorkoutPlayer,
        closeCustomWorkoutPlayer,
        isLibraryModalOpen,
        setIsLibraryModalOpen,
        isWorkoutBuilderOpen,
        setIsWorkoutBuilderOpen,
        editingWorkoutForBuilder,
        setEditingWorkoutForBuilder,
        personalRecords,
        recordPersonalBest,
        quickAddOpen,
        setQuickAddOpen,
        activeWorkoutToPlay,
        startWorkoutPlayer,
        closeWorkoutPlayer,
        selectedFoodForDetail,
        targetMealTypeForAdd,
        openFoodDetail,
        closeFoodDetail,
        naturalLanguageModalOpen,
        setNaturalLanguageModalOpen,
        barcodeScannerOpen,
        setBarcodeScannerOpen,
        weightLogModalOpen,
        setWeightLogModalOpen,
        onboardingOpen,
        setOnboardingOpen,
        selectedWorkoutForDetail,
        setSelectedWorkoutForDetail,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
