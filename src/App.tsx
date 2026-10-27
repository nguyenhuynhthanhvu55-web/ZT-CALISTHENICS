/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { PhoneFrame } from './components/PhoneFrame';
import { BottomNav } from './components/BottomNav';
import { HomeTab } from './components/HomeTab';
import { MealTab } from './components/MealTab';
import { WorkoutTab } from './components/WorkoutTab';
import { StatsTab } from './components/StatsTab';
import { RewardsTab } from './components/RewardsTab';
import { QuickAddModal } from './components/QuickAddModal';
import { SplashAndOnboarding } from './components/SplashAndOnboarding';
import { FoodDetailModal } from './components/FoodDetailModal';
import { WorkoutDetailModal } from './components/WorkoutDetailModal';
import { WorkoutPlayerModal } from './components/WorkoutPlayerModal';
import { NaturalLanguageMealModal } from './components/NaturalLanguageMealModal';
import { BarcodeModal } from './components/BarcodeModal';
import { WeightLogModal } from './components/WeightLogModal';
import { ExerciseLibraryModal } from './components/calisthenics/ExerciseLibraryModal';
import { WorkoutBuilderModal } from './components/calisthenics/WorkoutBuilderModal';

const AppContent: React.FC = () => {
  const {
    activeTab,
    isLibraryModalOpen,
    setIsLibraryModalOpen,
    isWorkoutBuilderOpen,
    setIsWorkoutBuilderOpen,
    saveCustomWorkout,
    editingWorkoutForBuilder,
    startCustomWorkoutPlayer,
  } = useApp();

  return (
    <PhoneFrame>
      {/* Tab Switcher */}
      {activeTab === 'home' && <HomeTab />}
      {activeTab === 'meal' && <MealTab />}
      {activeTab === 'workout' && <WorkoutTab />}
      {activeTab === 'stats' && <StatsTab />}
      {activeTab === 'rewards' && <RewardsTab />}

      {/* Persistent Bottom Bar */}
      <BottomNav />

      {/* Global Modals & Overlay Sheets */}
      <QuickAddModal />
      <SplashAndOnboarding />
      <FoodDetailModal />
      <WorkoutDetailModal />
      <WorkoutPlayerModal />
      <NaturalLanguageMealModal />
      <BarcodeModal />
      <WeightLogModal />

      {/* Calisthenics Library & Custom Workout Builder Modals */}
      <ExerciseLibraryModal
        isOpen={isLibraryModalOpen}
        onClose={() => setIsLibraryModalOpen(false)}
      />
      <WorkoutBuilderModal
        isOpen={isWorkoutBuilderOpen}
        onClose={() => setIsWorkoutBuilderOpen(false)}
        initialWorkout={editingWorkoutForBuilder}
        onSaveWorkout={w => {
          saveCustomWorkout(w);
          setIsWorkoutBuilderOpen(false);
        }}
        onStartWorkoutNow={w => {
          saveCustomWorkout(w);
          setIsWorkoutBuilderOpen(false);
          startCustomWorkoutPlayer(w);
        }}
      />
    </PhoneFrame>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
