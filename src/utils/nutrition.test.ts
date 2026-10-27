import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBMR,
  calculateTargets,
  calculateCookedNutrients,
  adjustDishNutrients,
  COOKING_METHODS,
} from './nutrition';
import { removeVietnameseAccents, matchesVietnameseSearch } from './vietnamese';

test('BMR calculations for male and female using Mifflin-St Jeor', () => {
  // Male, 70kg, 175cm, 25 years old
  // 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75 -> 1674
  const maleBmr = calculateBMR('nam', 70, 175, 25);
  assert.equal(maleBmr, 1674);

  // Female, 55kg, 160cm, 25 years old
  // 10*55 + 6.25*160 - 5*25 - 161 = 550 + 1000 - 125 - 161 = 1264
  const femaleBmr = calculateBMR('nu', 55, 160, 25);
  assert.equal(femaleBmr, 1264);
});

test('calculateTargets produces realistic healthy calorie and macro goals for weight loss', () => {
  const result = calculateTargets('nam', 75, 172, 28, 'giam_mo');
  // Daily calories should be positive and less than or equal to TDEE
  assert.ok(result.dailyCalories < result.tdee);
  assert.ok(result.dailyCalories >= result.bmr);
  assert.ok(result.proteinGrams > 100); // good protein preservation
  assert.ok(result.waterLiters >= 2.0);
});

test('calculateCookedNutrients properly scales calories based on cooking method', () => {
  const rawChickenBreast = {
    calories: 120,
    protein: 26,
    carbs: 0,
    fat: 1.5,
  };

  const boiled = calculateCookedNutrients(rawChickenBreast, 'luoc', 100);
  assert.equal(boiled.calories, 120);
  assert.equal(boiled.protein, 26);

  const fried = calculateCookedNutrients(rawChickenBreast, 'chien', 100);
  // Fried adds significant calories (~80% more)
  assert.ok(fried.calories >= 200);
  assert.ok(fried.fat > boiled.fat);

  const sauteed = calculateCookedNutrients(rawChickenBreast, 'xao', 100);
  assert.ok(sauteed.calories > boiled.calories);
  assert.ok(sauteed.calories < fried.calories);
});

test('adjustDishNutrients handles serving size and oil/sugar reduction', () => {
  const basePho = {
    calories: 450,
    protein: 25,
    carbs: 65,
    fat: 10,
  };

  const lightPho = adjustDishNutrients(basePho, 1.0, 'light', 'none');
  assert.ok(lightPho.calories < basePho.calories);

  const doublePortion = adjustDishNutrients(basePho, 2.0, 'normal', 'normal');
  assert.equal(doublePortion.protein, 50);
});

test('Vietnamese accent-insensitive matching works accurately', () => {
  assert.equal(removeVietnameseAccents('Phở Bò Tái Nạm'), 'pho bo tai nam');
  assert.equal(removeVietnameseAccents('Cơm Tấm Sườn Bì'), 'com tam suon bi');
  assert.equal(matchesVietnameseSearch('Bún chả Hà Nội', 'bun cha'), true);
  assert.equal(matchesVietnameseSearch('Ức gà luộc', 'uc ga'), true);
  assert.equal(matchesVietnameseSearch('Ức gà luộc', 'bo kho'), false);
});
