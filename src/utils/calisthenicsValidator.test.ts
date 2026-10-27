import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateWorkoutDuration,
  calculateWorkoutCalories,
  validateCustomWorkout,
  getSuggestedSetsRepsForGoal,
} from './calisthenicsValidator';
import { CustomWorkoutExerciseItem } from '../types/calisthenics';

test('calculateWorkoutDuration calculates realistic total minutes', () => {
  const items: CustomWorkoutExerciseItem[] = [
    {
      id: '1',
      exerciseId: 'pushup_standard',
      sets: 3,
      targetReps: 10,
      restSecondsAfterSet: 60,
    },
    {
      id: '2',
      exerciseId: 'squat_bodyweight',
      sets: 3,
      targetReps: 15,
      restSecondsAfterSet: 45,
    },
  ];

  const durationMin = calculateWorkoutDuration(items);
  // Total sets = 6. 3*(10*2.5 + 60) + 3*(15*2.5 + 45) ~ 255 + 247.5 = 502s ~ 8.3 min
  assert.ok(durationMin >= 6 && durationMin <= 12);
});

test('calculateWorkoutCalories multiplies MET, weight and duration correctly', () => {
  const items: CustomWorkoutExerciseItem[] = [
    { id: '1', exerciseId: 'pushup_standard', sets: 3, targetReps: 10, restSecondsAfterSet: 60 },
  ];
  // 60kg, 30 minutes, standard pushup MET is 6.0
  // Calories = 6.0 * 60 * 0.5 = 180 kcal
  const calories = calculateWorkoutCalories(items, 60, 30);
  assert.equal(calories, 180);
});

test('validateCustomWorkout flags muscle imbalance when pushing without pulling', () => {
  const pushOnlyItems: CustomWorkoutExerciseItem[] = [
    { id: '1', exerciseId: 'pushup_standard', sets: 4, targetReps: 12, restSecondsAfterSet: 60 },
    { id: '2', exerciseId: 'pushup_diamond', sets: 3, targetReps: 10, restSecondsAfterSet: 60 },
  ];

  const warnings = validateCustomWorkout(pushOnlyItems, { fitnessLevel: 'trung_binh' });
  const imbalanceWarning = warnings.find(w => w.category === 'imbalance');
  assert.ok(imbalanceWarning !== undefined);
  assert.ok(imbalanceWarning.message.includes('kéo'));
});

test('validateCustomWorkout flags excessive volume overload', () => {
  const overloadChestItems: CustomWorkoutExerciseItem[] = [
    { id: '1', exerciseId: 'pushup_standard', sets: 6, targetReps: 12, restSecondsAfterSet: 60 },
    { id: '2', exerciseId: 'pushup_standard', sets: 6, targetReps: 12, restSecondsAfterSet: 60 },
    { id: '3', exerciseId: 'pushup_standard', sets: 6, targetReps: 12, restSecondsAfterSet: 60 },
  ];

  const warnings = validateCustomWorkout(overloadChestItems);
  const overload = warnings.find(w => w.category === 'overload');
  assert.ok(overload !== undefined);
});

test('validateCustomWorkout warns beginners about advanced level 4/5 skills', () => {
  const advancedItems: CustomWorkoutExerciseItem[] = [
    { id: '1', exerciseId: 'pushup_one_arm', sets: 3, targetReps: 5, restSecondsAfterSet: 90 },
  ];

  const warnings = validateCustomWorkout(advancedItems, { fitnessLevel: 'moi_bat_dau' });
  const diffWarning = warnings.find(w => w.category === 'difficulty');
  assert.ok(diffWarning !== undefined);
});

test('getSuggestedSetsRepsForGoal provides specific goal-oriented parameters', () => {
  const strength = getSuggestedSetsRepsForGoal('suc_manh', false);
  assert.equal(strength.sets, 4);
  assert.equal(strength.reps, 5);
  assert.equal(strength.restSec, 120);

  const hypertrophy = getSuggestedSetsRepsForGoal('tang_co', false);
  assert.equal(hypertrophy.sets, 3);
  assert.equal(hypertrophy.reps, 10);
  assert.equal(hypertrophy.restSec, 60);

  const isometric = getSuggestedSetsRepsForGoal('suc_ben', true);
  assert.equal(isometric.seconds, 45);
});
