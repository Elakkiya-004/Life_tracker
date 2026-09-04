// Standard Health, Diet, Hair & Skin Care Protocol Data
export const DEFAULT_HEALTH_PROTOCOL = {
  // Metadata for plan tracking
  meta: {
    isCustom: false,
    planName: 'Standard Ayurvedic & Fitness Protocol',
    uploadedAt: null,
    source: 'system_default',
  },

  // 1. Daily Calorie & Macro Requirements
  calories: {
    maintenance: 1850,
    fatLossTarget: '1350–1450 kcal/day',
    expectedLoss: '0.5–0.7 kg/week (healthy & sustainable)',
    cheatDay: {
      target: '1800–1900 kcal',
      frequency: '1 day / week only',
      rules: 'No binge eating • Protein + Fiber first • Stop at 80% fullness'
    },
    macros: [
      {
        id: 'protein',
        name: 'Protein',
        amount: '75–85 g',
        percentage: '30%',
        color: '#ef4444',
        purpose: 'Hair strength, hormone synthesis, muscle & skin renewal',
        foods: 'Paneer, curd, dal, legumes, sprouts, eggs/tofu'
      },
      {
        id: 'carbs',
        name: 'Carbohydrates',
        amount: '140–160 g',
        percentage: '40–45%',
        color: '#f59e0b',
        purpose: 'Sustained energy, brain power & mood stability',
        foods: 'Rice (1 cup), vegetable oats, dosa, fruits, vegetables'
      },
      {
        id: 'fats',
        name: 'Healthy Fats',
        amount: '40–45 g',
        percentage: '25–30%',
        color: '#10b981',
        purpose: 'Hormone balance, skin glow & nutrient absorption',
        foods: 'Almonds, pumpkin seeds, peanuts, coconut oil, curd'
      },
    ]
  },

  // 2. Daily Meal Schedule & Food Timetable
  mealSchedule: [
    {
      id: 'meal-1',
      time: '08:00 AM',
      name: '🌅 Morning Detox & Hydration',
      dishes: 'Warm water + 1/2 lemon + soaked chia seeds (1 tbsp)',
      calories: 45,
      protein: '1 g',
      hairSkinBenefits: 'Flushes metabolic toxins, stimulates gut motility & digestive enzymes'
    },
    {
      id: 'meal-2',
      time: '10:30 AM',
      name: '🍵 Pre-Meal Brain & Energy Boost',
      dishes: '1 cup green tea + 10 soaked almonds + 2 walnuts + 1 medjool date',
      calories: 140,
      protein: '4 g',
      hairSkinBenefits: 'Vitamin E & healthy omega-3 fatty acids for skin glow & scalp moisture'
    },
    {
      id: 'meal-3',
      time: '01:00 PM',
      name: '🥗 Main Lunch / High-Protein Nutrition',
      dishes: '1 cup brown rice or 2 multigrain rotis + grilled paneer/tofu (150g) or boiled eggs + 1 bowl mixed dal + cucumber salad + fresh curd',
      calories: 520,
      protein: '30 g',
      hairSkinBenefits: 'Keratin synthesis, amino acids for hair growth & sustained afternoon energy'
    },
    {
      id: 'meal-4',
      time: '04:30 PM',
      name: '🥜 Evening Snack & Hydration',
      dishes: 'Roasted pumpkin seeds (15g) + tender coconut water or buttermilk',
      calories: 130,
      protein: '5 g',
      hairSkinBenefits: 'Zinc for acne prevention & magnesium for craving reduction'
    },
    {
      id: 'meal-5',
      time: '07:30 PM',
      name: '🍲 Light Dinner / Cell Repair',
      dishes: 'Warm vegetable soup + stir-fried broccoli, mushrooms, paneer/tofu or 3 egg whites + 1 bowl lentil broth',
      calories: 380,
      protein: '25 g',
      hairSkinBenefits: 'Collagen synthesis, overnight muscle recovery & sound deep sleep'
    }
  ],

  // 3. Fasting & Hydration Targets
  fastingAndWater: {
    fastingProtocol: '16:8 Intermittent Fasting',
    fastingWindow: 'Fasting 8:00 PM to 12:00 PM next day',
    fastingStart: '20:00',
    fastingEnd: '12:00',
    waterTargetLiters: 3.5,
    waterTargetGlasses: 14,
    electrolyteHack: 'Morning warm water + pinch of pink Himalayan salt + lemon',
    fastingNotes: 'Zero-calorie beverages permitted: Water, plain green tea, black coffee without sugar'
  },

  // 4. Micronutrients Focus
  micronutrients: [
    {
      id: 'iron',
      name: 'Iron',
      color: '#f43f5e',
      target: 'Bloating, fatigue, hair fall',
      sources: 'Dates, spinach, beetroot, jaggery'
    },
    {
      id: 'b12',
      name: 'Vitamin B12',
      color: '#8b5cf6',
      target: 'Mood swings, low energy',
      sources: 'Curd, paneer, fortified foods'
    },
    {
      id: 'vit_d',
      name: 'Vitamin D',
      color: '#f59e0b',
      target: 'Joint pain, low mood',
      sources: 'Sunlight + supplementation if deficient'
    },
    {
      id: 'magnesium',
      name: 'Magnesium',
      color: '#6366f1',
      target: 'Sleep, stress, cravings',
      sources: 'Pumpkin seeds, peanuts'
    },
    {
      id: 'zinc',
      name: 'Zinc',
      color: '#0ea5e9',
      target: 'Hair strength & skin healing',
      sources: 'Nuts, seeds, legumes'
    },
  ],

  // 5. Exercise Routine
  exerciseRoutine: {
    morning: {
      title: '🌅 Morning Cardio (30–40 Mins)',
      activities: 'Cycling or brisk outdoor walking',
      benefits: 'Fat burning zone, insulin sensitivity & stimulates natural gut motility'
    },
    evening: {
      title: '💪 Evening Bodyweight Routine (20 Mins)',
      activities: 'Squats (3x15), Glute bridges (3x15), Wall push-ups (3x12), Planks (3x30s)',
      benefits: 'Tones glutes/core, improves posture, activates metabolism. Consistency > Intensity.'
    }
  },

  // 6. Sugar Cutting Strategy
  sugarCutting: {
    phases: [
      { week: 'Week 1', action: 'Remove added sugar from tea & coffee', status: 'Phase 1' },
      { week: 'Week 2', action: 'Replace sweets & bakery snacks with fresh fruits / dates', status: 'Phase 2' },
      { week: 'Week 3', action: 'Sugar strictly limited to festival / weekly cheat day', status: 'Phase 3' }
    ],
    cravingHack: '🧠 Craving Hack: Drink 1 glass warm water + take 5 slow deep breaths. Cravings fade in 90 seconds.'
  },

  // 7. Skin Care Regime
  skinCare: {
    daily: 'AM and PM (Cleanse, hydrate, sunscreen AM, barrier repair PM)',
    weeklySunday: 'Sunday: Face shaving and scrub',
    weeklyTueFri: 'Tuesday & Friday: Face pack',
    notes: 'Gentle circular motion for scrub; use soothing gel after face shaving.'
  },

  // 8. Body Care Regime
  bodyCare: {
    sunday: 'Sunday: Oiling, scrub, shaving',
    tueFri: 'Tuesday & Friday: Exfoliating body wash',
    notes: 'Warm oil before bath on Sundays; gentle loofah with exfoliating wash on Tue/Fri.'
  },

  // 9. Hair Care Regime
  hairCare: {
    daily: 'Serum and hair growth water',
    weekly: '3x Oiling, hair pack, hair wash',
    biWeekly: 'Two weeks once: Saturday henna and Sunday avari podi (In the next alternate: Hair growth serum)',
    notes: 'Air dry naturally, wide-tooth detangling comb, warm oil massage.'
  }
};
