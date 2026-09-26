/**
 * Calorie, TDEE, BMR & Macro Calculation Utilities
 * Based on gold-standard Mifflin-St Jeor formula and nutritional guidelines.
 */

export const ACTIVITY_LEVELS = {
  sedentary: {
    id: 'sedentary',
    label: 'Sedentary',
    tag: 'Desk Job',
    desc: 'Little to no structured exercise',
    multiplier: 1.20,
  },
  light: {
    id: 'light',
    label: 'Lightly Active',
    tag: '1–3 days/wk',
    desc: 'Light exercise or active walking',
    multiplier: 1.375,
  },
  moderate: {
    id: 'moderate',
    label: 'Moderately Active',
    tag: '3–5 days/wk',
    desc: 'Gym, sports, or aerobic exercise',
    multiplier: 1.55,
  },
  active: {
    id: 'active',
    label: 'Very Active',
    tag: '6–7 days/wk',
    desc: 'Intense workouts or athletic training',
    multiplier: 1.725,
  },
  extreme: {
    id: 'extreme',
    label: 'Extra Active',
    tag: 'Daily Athlete',
    desc: 'Heavy physical work + hard double training',
    multiplier: 1.90,
  },
};

export const FITNESS_GOALS = {
  fat_loss_aggressive: {
    id: 'fat_loss_aggressive',
    label: 'Aggressive Fat Loss',
    shortLabel: 'Fast Cut',
    badge: '🔥 Fast Burn',
    deficitPercent: -0.25,
    expectedWeeklyKg: '0.7–0.9 kg/week',
    proteinPerKg: 2.2,
    fatsPercent: 0.22,
    desc: 'High deficit for fast fat loss. Requires strict discipline & high protein to preserve muscle.',
  },
  fat_loss_steady: {
    id: 'fat_loss_steady',
    label: 'Steady Sustainable Fat Loss',
    shortLabel: 'Healthy Cut',
    badge: '⭐ Recommended',
    deficitPercent: -0.20,
    expectedWeeklyKg: '0.5–0.7 kg/week (healthy & sustainable)',
    proteinPerKg: 2.0,
    fatsPercent: 0.25,
    desc: 'Optimal caloric deficit. Best balance of fat burning, steady energy, and long-term compliance.',
  },
  fat_loss_mild: {
    id: 'fat_loss_mild',
    label: 'Mild Fat Loss',
    shortLabel: 'Mild Deficit',
    badge: '🌱 Gentle',
    deficitPercent: -0.10,
    expectedWeeklyKg: '0.25–0.35 kg/week',
    proteinPerKg: 1.8,
    fatsPercent: 0.27,
    desc: 'Small deficit with virtually zero metabolic slowdown. Ideal for body recomposition.',
  },
  maintain: {
    id: 'maintain',
    label: 'Maintain Current Weight',
    shortLabel: 'Maintenance',
    badge: '⚖️ Equilibrium',
    deficitPercent: 0,
    expectedWeeklyKg: '0 kg/week (stable weight)',
    proteinPerKg: 1.6,
    fatsPercent: 0.28,
    desc: 'Zero deficit or surplus. Eat at your exact daily energy burn to stabilize bodyweight.',
  },
  lean_bulk: {
    id: 'lean_bulk',
    label: 'Lean Muscle Gain',
    shortLabel: 'Lean Bulk',
    badge: '💪 Muscle Growth',
    deficitPercent: 0.10,
    expectedWeeklyKg: '+0.25 kg/week (mostly lean mass)',
    proteinPerKg: 2.0,
    fatsPercent: 0.25,
    desc: 'Slight surplus to fuel hypertrophy and strength while keeping body fat accumulation minimal.',
  },
  bulk: {
    id: 'bulk',
    label: 'Accelerated Bulking',
    shortLabel: 'Full Bulk',
    badge: '🚀 Max Mass',
    deficitPercent: 0.20,
    expectedWeeklyKg: '+0.45–0.55 kg/week',
    proteinPerKg: 2.2,
    fatsPercent: 0.25,
    desc: 'Maximum caloric support for intense powerlifting, bodybuilding, or underweight recovery.',
  },
};

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor formula
 */
export const calculateBMR = (gender = 'female', weightKg = 60, heightCm = 160, ageYears = 25) => {
  const w = parseFloat(weightKg) || 60;
  const h = parseFloat(heightCm) || 160;
  const a = parseFloat(ageYears) || 25;

  if (gender === 'male') {
    return Math.round(10 * w + 6.25 * h - 5 * a + 5);
  }
  // female
  return Math.round(10 * w + 6.25 * h - 5 * a - 161);
};

/**
 * Calculate Total Daily Energy Expenditure (TDEE / Maintenance)
 */
export const calculateTDEE = (bmr, activityLevel = 'moderate') => {
  const level = ACTIVITY_LEVELS[activityLevel] || ACTIVITY_LEVELS.moderate;
  return Math.round(bmr * level.multiplier);
};

/**
 * Calculate Body Mass Index (BMI) & classification
 */
export const calculateBMI = (weightKg = 60, heightCm = 160) => {
  const w = parseFloat(weightKg) || 0;
  const h = (parseFloat(heightCm) || 0) / 100;
  if (!w || !h) return { bmi: 0, category: 'Unknown', color: '#64748b' };

  const bmi = parseFloat((w / (h * h)).toFixed(1));
  let category = 'Normal Weight';
  let color = '#10b981'; // green

  if (bmi < 18.5) {
    category = 'Underweight';
    color = '#0ea5e9'; // blue
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    category = 'Normal Weight';
    color = '#10b981'; // green
  } else if (bmi >= 25 && bmi <= 29.9) {
    category = 'Overweight';
    color = '#f59e0b'; // amber
  } else {
    category = 'Obese';
    color = '#ef4444'; // red
  }

  return { bmi, category, color };
};

/**
 * Calculate recommended daily water intake (Liters)
 */
export const calculateWaterIntake = (weightKg = 60, activityLevel = 'moderate') => {
  const w = parseFloat(weightKg) || 60;
  let baseLiters = w * 0.033;
  if (activityLevel === 'moderate') baseLiters += 0.5;
  if (activityLevel === 'active' || activityLevel === 'extreme') baseLiters += 0.8;
  return Math.max(2.0, parseFloat(baseLiters.toFixed(1)));
};

/**
 * Comprehensive Calculation Result
 */
export const calculateNutritionPlan = ({
  gender = 'female',
  weightKg = 60,
  heightCm = 160,
  ageYears = 25,
  activityLevel = 'moderate',
  goalId = 'fat_loss_steady',
}) => {
  const bmr = calculateBMR(gender, weightKg, heightCm, ageYears);
  const tdee = calculateTDEE(bmr, activityLevel);
  const goal = FITNESS_GOALS[goalId] || FITNESS_GOALS.fat_loss_steady;

  // Safe lower limit floor
  const minSafeFloor = gender === 'male' ? 1450 : 1200;
  const rawTarget = Math.round(tdee * (1 + goal.deficitPercent));
  const targetCalories = Math.max(minSafeFloor, rawTarget);
  const deficitAmount = targetCalories - tdee; // negative for deficit, positive for surplus

  // Macros Calculation
  const w = parseFloat(weightKg) || 60;
  // Protein: grams based on goal & bodyweight
  const proteinGrams = Math.round(w * goal.proteinPerKg);
  const proteinCalories = proteinGrams * 4;

  // Fats: percentage of target calories
  const fatsCalories = Math.round(targetCalories * goal.fatsPercent);
  const fatsGrams = Math.round(fatsCalories / 9);

  // Carbs: remainder of calories
  const carbsCalories = Math.max(0, targetCalories - (proteinCalories + fatsCalories));
  const carbsGrams = Math.round(carbsCalories / 4);

  // Macro percentages
  const proteinPercent = Math.round((proteinCalories / targetCalories) * 100);
  const fatsPercent = Math.round((fatsCalories / targetCalories) * 100);
  const carbsPercent = Math.max(0, 100 - (proteinPercent + fatsPercent));

  const bmiInfo = calculateBMI(weightKg, heightCm);
  const waterLiters = calculateWaterIntake(weightKg, activityLevel);

  return {
    bmr,
    tdee,
    targetCalories,
    deficitAmount,
    expectedLoss: goal.expectedWeeklyKg,
    bmiInfo,
    waterLiters,
    macros: {
      protein: {
        grams: proteinGrams,
        calories: proteinCalories,
        percentage: proteinPercent,
      },
      carbs: {
        grams: carbsGrams,
        calories: carbsCalories,
        percentage: carbsPercent,
      },
      fats: {
        grams: fatsGrams,
        calories: fatsCalories,
        percentage: fatsPercent,
      },
    },
  };
};

/**
 * Built-in Food & Nutrition Database
 * High-utility common foods with calories and macronutrient values per 100g.
 */
export const FOOD_DATABASE = [
  // --- High Protein ---
  {
    id: 'boiled_egg',
    name: 'Boiled Egg (Large)',
    category: 'Protein',
    unit: '1 egg (~50g)',
    servingGrams: 50,
    calories: 78,
    protein: 6.3,
    carbs: 0.6,
    fats: 5.3,
    icon: '🥚',
  },
  {
    id: 'egg_white',
    name: 'Egg White',
    category: 'Protein',
    unit: '1 white (~33g)',
    servingGrams: 33,
    calories: 17,
    protein: 3.6,
    carbs: 0.2,
    fats: 0.1,
    icon: '🍳',
  },
  {
    id: 'chicken_breast',
    name: 'Chicken Breast (Cooked / Grilled)',
    category: 'Protein',
    unit: '100g',
    servingGrams: 100,
    calories: 165,
    protein: 31.0,
    carbs: 0.0,
    fats: 3.6,
    icon: '🍗',
  },
  {
    id: 'paneer_low_fat',
    name: 'Paneer (Cottage Cheese)',
    category: 'Protein',
    unit: '100g',
    servingGrams: 100,
    calories: 265,
    protein: 18.3,
    carbs: 3.4,
    fats: 20.8,
    icon: '🧀',
  },
  {
    id: 'curd_yogurt',
    name: 'Curd / Plain Greek Yogurt',
    category: 'Protein',
    unit: '1 cup (~150g)',
    servingGrams: 150,
    calories: 98,
    protein: 11.0,
    carbs: 6.0,
    fats: 3.5,
    icon: '🥣',
  },
  {
    id: 'soya_chunks',
    name: 'Soya Chunks (Raw)',
    category: 'Protein',
    unit: '50g',
    servingGrams: 50,
    calories: 172,
    protein: 26.0,
    carbs: 16.5,
    fats: 0.2,
    icon: '🌱',
  },
  {
    id: 'tofu_firm',
    name: 'Firm Tofu',
    category: 'Protein',
    unit: '100g',
    servingGrams: 100,
    calories: 144,
    protein: 15.5,
    carbs: 2.8,
    fats: 8.5,
    icon: '🧊',
  },
  {
    id: 'moong_dal_cooked',
    name: 'Moong Dal (Cooked)',
    category: 'Protein',
    unit: '1 medium bowl (~150g)',
    servingGrams: 150,
    calories: 157,
    protein: 10.5,
    carbs: 26.0,
    fats: 1.2,
    icon: '🍲',
  },
  {
    id: 'chana_boiled',
    name: 'Boiled Chickpeas (Chana)',
    category: 'Protein',
    unit: '1 cup (~160g)',
    servingGrams: 160,
    calories: 269,
    protein: 14.5,
    carbs: 45.0,
    fats: 4.2,
    icon: '🧆',
  },
  {
    id: 'whey_protein',
    name: 'Whey Protein Powder',
    category: 'Protein',
    unit: '1 scoop (~32g)',
    servingGrams: 32,
    calories: 120,
    protein: 24.0,
    carbs: 2.0,
    fats: 1.5,
    icon: '🥤',
  },
  {
    id: 'fish_grilled',
    name: 'Fish (Salmon or White Fish)',
    category: 'Protein',
    unit: '100g',
    servingGrams: 100,
    calories: 142,
    protein: 22.0,
    carbs: 0.0,
    fats: 5.5,
    icon: '🐟',
  },

  // --- Staples & Carbohydrates ---
  {
    id: 'cooked_white_rice',
    name: 'Cooked White Rice',
    category: 'Carbs',
    unit: '1 cup (~150g)',
    servingGrams: 150,
    calories: 195,
    protein: 4.0,
    carbs: 42.0,
    fats: 0.4,
    icon: '🍚',
  },
  {
    id: 'cooked_brown_rice',
    name: 'Cooked Brown Rice',
    category: 'Carbs',
    unit: '1 cup (~150g)',
    servingGrams: 150,
    calories: 168,
    protein: 3.8,
    carbs: 35.0,
    fats: 1.4,
    icon: '🌾',
  },
  {
    id: 'roti_chapati',
    name: 'Whole Wheat Roti / Chapati',
    category: 'Carbs',
    unit: '1 medium roti (~40g)',
    servingGrams: 40,
    calories: 104,
    protein: 3.2,
    carbs: 21.0,
    fats: 1.1,
    icon: '🫓',
  },
  {
    id: 'rolled_oats',
    name: 'Rolled Oats (Dry)',
    category: 'Carbs',
    unit: '1/2 cup (~40g)',
    servingGrams: 40,
    calories: 152,
    protein: 5.3,
    carbs: 27.0,
    fats: 2.7,
    icon: '🥣',
  },
  {
    id: 'dosa_plain',
    name: 'Plain Dosa',
    category: 'Carbs',
    unit: '1 piece (~60g)',
    servingGrams: 60,
    calories: 133,
    protein: 2.8,
    carbs: 21.0,
    fats: 4.2,
    icon: '🥞',
  },
  {
    id: 'idli',
    name: 'Steamed Idli',
    category: 'Carbs',
    unit: '1 idli (~45g)',
    servingGrams: 45,
    calories: 58,
    protein: 1.9,
    carbs: 12.0,
    fats: 0.2,
    icon: '⚪',
  },
  {
    id: 'sweet_potato_boiled',
    name: 'Boiled Sweet Potato',
    category: 'Carbs',
    unit: '1 medium (~130g)',
    servingGrams: 130,
    calories: 112,
    protein: 2.0,
    carbs: 26.0,
    fats: 0.1,
    icon: '🍠',
  },
  {
    id: 'brown_bread',
    name: 'Whole Wheat Bread Slice',
    category: 'Carbs',
    unit: '1 slice (~35g)',
    servingGrams: 35,
    calories: 78,
    protein: 3.5,
    carbs: 13.5,
    fats: 1.0,
    icon: '🍞',
  },

  // --- Healthy Fats & Nuts ---
  {
    id: 'almonds',
    name: 'Almonds (Raw)',
    category: 'Fats',
    unit: '10 almonds (~12g)',
    servingGrams: 12,
    calories: 70,
    protein: 2.5,
    carbs: 2.6,
    fats: 6.0,
    icon: '🥜',
  },
  {
    id: 'walnuts',
    name: 'Walnut Halves',
    category: 'Fats',
    unit: '4 halves (~12g)',
    servingGrams: 12,
    calories: 78,
    protein: 1.8,
    carbs: 1.6,
    fats: 7.8,
    icon: '🌰',
  },
  {
    id: 'peanut_butter',
    name: 'Natural Peanut Butter',
    category: 'Fats',
    unit: '1 tbsp (~16g)',
    servingGrams: 16,
    calories: 94,
    protein: 4.0,
    carbs: 3.1,
    fats: 8.0,
    icon: '🥜',
  },
  {
    id: 'chia_seeds',
    name: 'Chia Seeds',
    category: 'Fats',
    unit: '1 tbsp (~12g)',
    servingGrams: 12,
    calories: 58,
    protein: 2.0,
    carbs: 5.0,
    fats: 3.7,
    icon: '✨',
  },
  {
    id: 'olive_oil_ghee',
    name: 'Olive Oil / Pure Ghee',
    category: 'Fats',
    unit: '1 tsp (~5g)',
    servingGrams: 5,
    calories: 45,
    protein: 0.0,
    carbs: 0.0,
    fats: 5.0,
    icon: '🫒',
  },

  // --- Fruits & Vegetables ---
  {
    id: 'banana_medium',
    name: 'Banana (Medium)',
    category: 'Produce',
    unit: '1 banana (~118g)',
    servingGrams: 118,
    calories: 105,
    protein: 1.3,
    carbs: 27.0,
    fats: 0.4,
    icon: '🍌',
  },
  {
    id: 'apple_medium',
    name: 'Apple (Medium)',
    category: 'Produce',
    unit: '1 apple (~180g)',
    servingGrams: 180,
    calories: 95,
    protein: 0.5,
    carbs: 25.0,
    fats: 0.3,
    icon: '🍎',
  },
  {
    id: 'spinach_cooked',
    name: 'Cooked Spinach (Palak)',
    category: 'Produce',
    unit: '1 cup (~180g)',
    servingGrams: 180,
    calories: 41,
    protein: 5.3,
    carbs: 6.7,
    fats: 0.8,
    icon: '🥬',
  },
  {
    id: 'cucumber_fresh',
    name: 'Cucumber Slices',
    category: 'Produce',
    unit: '1 cup (~100g)',
    servingGrams: 100,
    calories: 15,
    protein: 0.7,
    carbs: 3.6,
    fats: 0.1,
    icon: '🥒',
  },
  {
    id: 'mixed_salad',
    name: 'Green Garden Salad',
    category: 'Produce',
    unit: '1 big bowl (~150g)',
    servingGrams: 150,
    calories: 33,
    protein: 2.1,
    carbs: 6.0,
    fats: 0.4,
    icon: '🥗',
  },
  {
    id: 'papaya_fresh',
    name: 'Fresh Papaya Cubes',
    category: 'Produce',
    unit: '1 cup (~140g)',
    servingGrams: 140,
    calories: 60,
    protein: 0.7,
    carbs: 15.0,
    fats: 0.4,
    icon: '🍈',
  }
];

export const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', icon: 'Sun', color: '#f59e0b' },
  { id: 'lunch', label: 'Lunch', icon: 'Utensils', color: '#10b981' },
  { id: 'snacks', label: 'Snacks / Tea', icon: 'Coffee', color: '#ec4899' },
  { id: 'dinner', label: 'Dinner', icon: 'Moon', color: '#6366f1' },
];
