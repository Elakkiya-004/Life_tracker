/**
 * AI-Powered Meal & Food Calorie Analyzer Service
 * Uses OpenAI GPT-4o-mini (Vision & Chat) with an intelligent local fallback parser.
 */

import { FOOD_DATABASE } from './calorieCalculatorUtils';

const DEFAULT_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const STORAGE_KEY = 'life_tracker_openai_api_key';

/**
 * Retrieve active OpenAI API key
 */
export const getOpenAiApiKey = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch {}
  return DEFAULT_API_KEY;
};

/**
 * Update custom OpenAI API key
 */
export const saveOpenAiApiKey = (key) => {
  try {
    if (key && key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
};

/**
 * Recommended calorie distribution percentages per meal
 */
export const MEAL_CALORIE_DISTRIBUTION = {
  breakfast: { label: 'Breakfast', percent: 0.25, defaultKcal: 350 },
  lunch: { label: 'Lunch', percent: 0.35, defaultKcal: 500 },
  snacks: { label: 'Snacks / Tea', percent: 0.15, defaultKcal: 200 },
  dinner: { label: 'Dinner', percent: 0.25, defaultKcal: 350 },
};

/**
 * Calculate per-meal target based on daily total target
 */
export const getMealTargetCalories = (dailyTargetKcal = 1450, mealType = 'lunch') => {
  const dist = MEAL_CALORIE_DISTRIBUTION[mealType] || MEAL_CALORIE_DISTRIBUTION.lunch;
  return Math.round(dailyTargetKcal * dist.percent);
};

/**
 * Local Intelligent Fallback Analyzer
 * Parses ingredient text and matches against food database when API quota is exhausted.
 */
export const analyzeMealLocally = ({ textDescription = '', mealType = 'lunch', dailyTargetCalories = 1450, mealTargetCalories = null }) => {
  const targetKcal = mealTargetCalories || getMealTargetCalories(dailyTargetCalories, mealType);
  const text = textDescription.toLowerCase();

  // Search words and portions
  const matchedItems = [];
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;

  FOOD_DATABASE.forEach(food => {
    // Check if food name or keywords appear in text
    const keywords = [food.name.toLowerCase(), food.id.replace(/_/g, ' ')];
    if (food.id.includes('egg')) keywords.push('egg', 'eggs');
    if (food.id.includes('rice')) keywords.push('rice');
    if (food.id.includes('roti')) keywords.push('roti', 'chapati', 'phulka');
    if (food.id.includes('paneer')) keywords.push('paneer');
    if (food.id.includes('chicken')) keywords.push('chicken');
    if (food.id.includes('dal')) keywords.push('dal', 'daal');
    if (food.id.includes('curd')) keywords.push('curd', 'yogurt');
    if (food.id.includes('oats')) keywords.push('oats', 'oatmeal');
    if (food.id.includes('banana')) keywords.push('banana');
    if (food.id.includes('apple')) keywords.push('apple');
    if (food.id.includes('bread')) keywords.push('bread', 'toast');
    if (food.id.includes('salad')) keywords.push('salad', 'cucumber');
    if (food.id.includes('dosa')) keywords.push('dosa');
    if (food.id.includes('idli')) keywords.push('idli');
    if (food.id.includes('peanut_butter')) keywords.push('peanut butter');
    if (food.id.includes('whey')) keywords.push('whey', 'protein powder');

    const matchedKeyword = keywords.find(k => text.includes(k));
    if (matchedKeyword) {
      // Look for multiplier or quantity in text near the keyword
      let multiplier = 1;
      const regexNumber = new RegExp(`(\\d+)\\s*(?:pieces?|slices?|cups?|scoops?|bowls?|g|grams?)?\\s*(?:of\\s*)?${matchedKeyword}`, 'i');
      const match = text.match(regexNumber);
      if (match && match[1]) {
        multiplier = Math.min(10, Math.max(1, parseInt(match[1], 10)));
      }

      const itemKcal = Math.round(food.calories * multiplier);
      const itemP = parseFloat((food.protein * multiplier).toFixed(1));
      const itemC = parseFloat((food.carbs * multiplier).toFixed(1));
      const itemF = parseFloat((food.fats * multiplier).toFixed(1));

      matchedItems.push({
        name: food.name,
        icon: food.icon,
        portion: `${multiplier}x ${food.unit}`,
        calories: itemKcal,
        protein: itemP,
        carbs: itemC,
        fats: itemF,
      });

      totalCalories += itemKcal;
      totalProtein += itemP;
      totalCarbs += itemC;
      totalFats += itemF;
    }
  });

  // If nothing matched, provide sensible generic estimate based on input text
  if (matchedItems.length === 0) {
    const fallbackKcal = Math.round(targetKcal * 0.85);
    matchedItems.push({
      name: textDescription || 'Custom Mixed Meal',
      icon: '🍽️',
      portion: '1 standard meal serving',
      calories: fallbackKcal,
      protein: Math.round(fallbackKcal * 0.25 / 4),
      carbs: Math.round(fallbackKcal * 0.50 / 4),
      fats: Math.round(fallbackKcal * 0.25 / 9),
    });
    totalCalories = fallbackKcal;
    totalProtein = Math.round(fallbackKcal * 0.25 / 4);
    totalCarbs = Math.round(fallbackKcal * 0.50 / 4);
    totalFats = Math.round(fallbackKcal * 0.25 / 9);
  }

  // Verdict against target
  const diffKcal = totalCalories - targetKcal;
  let status = 'within_target';
  let headline = `🎯 Optimal Target Fit (${totalCalories} kcal)`;
  let verdict = `This meal matches your ${mealType} requirement (~${targetKcal} kcal) within healthy bounds.`;

  if (diffKcal < -60) {
    status = 'under_target';
    headline = `Under Target by ${Math.abs(diffKcal)} kcal`;
    verdict = `This meal provides ${totalCalories} kcal, which is below your ${mealType} target of ${targetKcal} kcal.`;
  } else if (diffKcal > 60) {
    status = 'exceeds_target';
    headline = `Exceeds Target by +${diffKcal} kcal`;
    verdict = `This meal provides ${totalCalories} kcal, exceeding your ${mealType} target of ${targetKcal} kcal.`;
  }

  const suggestions = [];
  if (totalProtein < 20) {
    suggestions.push(`Protein is relatively low (${totalProtein}g). Consider adding 1 boiled egg, 50g paneer, or 100g Greek yogurt to reach ~25g protein.`);
  } else {
    suggestions.push(`High protein quality (${totalProtein}g) detected. Excellent for muscle retention and satiety!`);
  }

  if (status === 'under_target') {
    suggestions.push(`To comfortably hit your ${targetKcal} kcal goal, you can safely add a cup of curd, fresh fruit, or a handful of almonds.`);
  } else if (status === 'exceeds_target') {
    suggestions.push(`To balance your daily calorie intake, consider reducing oils or having a lighter dinner to stay on track.`);
  }

  return {
    mealName: textDescription ? `Meal: ${textDescription.slice(0, 45)}` : 'Analyzed Meal Plate',
    items: matchedItems,
    totalCalories,
    totalProtein: parseFloat(totalProtein.toFixed(1)),
    totalCarbs: parseFloat(totalCarbs.toFixed(1)),
    totalFats: parseFloat(totalFats.toFixed(1)),
    totalFiber: 4.0,
    targetComparison: {
      mealType,
      mealTargetCalories: targetKcal,
      dailyTargetCalories,
      differenceCalories: diffKcal,
      status,
      headline,
      verdict,
      proteinVerdict: totalProtein >= 20 ? 'Optimal Protein (>=20g)' : 'Low Protein (<20g)',
      suggestions,
    },
    isLocalFallback: true,
    notice: 'Analyzed using Smart Nutrition Engine. (OpenAI credit balance currently requires top-up at platform.openai.com for live GPT-4o vision).',
  };
};

/**
 * Analyze Meal with OpenAI GPT-4o-mini Vision / Chat API
 */
export const analyzeMealWithOpenAI = async ({
  imageBase64 = null,
  textDescription = '',
  mealType = 'lunch',
  dailyTargetCalories = 1450,
  mealTargetCalories = null,
}) => {
  const targetKcal = mealTargetCalories || getMealTargetCalories(dailyTargetCalories, mealType);
  const apiKey = getOpenAiApiKey();

  if (!apiKey) {
    return analyzeMealLocally({ textDescription, mealType, dailyTargetCalories, mealTargetCalories: targetKcal });
  }

  // System instruction
  const systemPrompt = `You are an expert clinical dietitian and sports nutritionist.
Analyze the user's meal from the uploaded image and/or text description.
Accurately identify all food items, ingredients, realistic portion sizes, calories (kcal), and macronutrients (Protein in grams, Carbs in grams, Fats in grams, and Fiber in grams).
Evaluate whether this meal satisfies the user's per-meal calorie requirement of ${targetKcal} kcal for ${mealType.toUpperCase()} (out of a daily total target of ${dailyTargetCalories} kcal).

You MUST respond strictly with a valid JSON object matching this schema:
{
  "mealName": "Short descriptive meal title",
  "items": [
    {
      "name": "Item or ingredient name",
      "portion": "Estimated portion (e.g. 2 large eggs, 150g rice)",
      "calories": 140,
      "protein": 12.0,
      "carbs": 1.0,
      "fats": 9.5
    }
  ],
  "totalCalories": 420,
  "totalProtein": 28.5,
  "totalCarbs": 35.0,
  "totalFats": 16.0,
  "totalFiber": 5.0,
  "targetComparison": {
    "mealType": "${mealType}",
    "mealTargetCalories": ${targetKcal},
    "dailyTargetCalories": ${dailyTargetCalories},
    "differenceCalories": 0,
    "status": "within_target", // "within_target" (within +/- 50 kcal) | "under_target" | "exceeds_target"
    "headline": "Verdict Headline",
    "verdict": "Clear explanation of whether this completes their per-meal requirement",
    "proteinVerdict": "Evaluation of protein sufficiency (aiming for 20-35g per meal)",
    "suggestions": [
      "Actionable tip 1 to optimize calories or macros",
      "Actionable tip 2"
    ]
  }
}`;

  // User content payload (multi-modal support)
  const userContent = [];

  if (textDescription && textDescription.trim()) {
    userContent.push({
      type: 'text',
      text: `Meal Type: ${mealType}\nTarget calories for this meal: ${targetKcal} kcal (Daily Total: ${dailyTargetCalories} kcal)\nIngredients / Dish description: ${textDescription.trim()}`
    });
  } else {
    userContent.push({
      type: 'text',
      text: `Meal Type: ${mealType}\nTarget calories for this meal: ${targetKcal} kcal (Daily Total: ${dailyTargetCalories} kcal)\nPlease estimate all food items and portion sizes from this image.`
    });
  }

  if (imageBase64) {
    userContent.push({
      type: 'image_url',
      image_url: {
        url: imageBase64,
        detail: 'auto'
      }
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.warn('OpenAI API Error, falling back to smart local nutrition parser:', data.error);
      const fallback = analyzeMealLocally({ textDescription, mealType, dailyTargetCalories, mealTargetCalories: targetKcal });
      fallback.apiError = data.error?.message || 'API request failed';
      return fallback;
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsed = JSON.parse(content);
    parsed.isLocalFallback = false;
    return parsed;
  } catch (err) {
    console.warn('Exception during OpenAI meal analysis, using local fallback:', err);
    return analyzeMealLocally({ textDescription, mealType, dailyTargetCalories, mealTargetCalories: targetKcal });
  }
};
