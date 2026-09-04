import * as XLSX from 'xlsx';
import { DEFAULT_HEALTH_PROTOCOL } from './healthProtocolData';

/**
 * Helper to normalize string for flexible header/key comparison
 */
const normalizeKey = (str) => {
  if (!str) return '';
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Find value in row by searching multiple possible column header aliases
 */
const getFieldValue = (row, aliases = []) => {
  if (!row || typeof row !== 'object') return '';
  const rowKeys = Object.keys(row);
  for (const alias of aliases) {
    const normAlias = normalizeKey(alias);
    const matchedKey = rowKeys.find(k => normalizeKey(k) === normAlias);
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
      return String(row[matchedKey]).trim();
    }
  }
  return '';
};

/**
 * Export Health Protocol to a beautifully structured Excel (.xlsx) file
 */
export const exportHealthProtocolToExcel = (protocol = DEFAULT_HEALTH_PROTOCOL, userName = 'Custom') => {
  try {
    const wb = XLSX.utils.book_new();
    const cleanProtocol = { ...DEFAULT_HEALTH_PROTOCOL, ...protocol };

    // --- SHEET 1: Meal Schedule ---
    const mealRows = (cleanProtocol.mealSchedule || []).map((m, idx) => ({
      'Meal Number': idx + 1,
      'Time': m.time || '',
      'Meal Name': m.name || '',
      'Dishes & Ingredients': m.dishes || '',
      'Calories (kcal)': m.calories || 0,
      'Protein': m.protein || '',
      'Hair & Skin Benefits': m.hairSkinBenefits || ''
    }));

    const wsMeals = XLSX.utils.json_to_sheet(mealRows);
    wsMeals['!cols'] = [
      { wch: 12 }, // Meal Number
      { wch: 14 }, // Time
      { wch: 32 }, // Meal Name
      { wch: 65 }, // Dishes & Ingredients
      { wch: 16 }, // Calories
      { wch: 14 }, // Protein
      { wch: 55 }, // Hair & Skin Benefits
    ];
    XLSX.utils.book_append_sheet(wb, wsMeals, 'Meal_Schedule');

    // --- SHEET 2: Macros & Calories ---
    const cal = cleanProtocol.calories || {};
    const macroRows = [
      {
        'Metric / Target': 'Maintenance Calories',
        'Value': `${cal.maintenance || 1850} kcal/day`,
        'Category / Type': 'Baseline',
        'Notes & Food Sources': 'Daily energy needed with zero weight change'
      },
      {
        'Metric / Target': 'Fat Loss Target',
        'Value': cal.fatLossTarget || '1350–1450 kcal/day',
        'Category / Type': 'Deficit Goal',
        'Notes & Food Sources': 'Optimal daily intake for steady fat burn'
      },
      {
        'Metric / Target': 'Expected Fat Loss',
        'Value': cal.expectedLoss || '0.5–0.7 kg/week',
        'Category / Type': 'Weekly Rate',
        'Notes & Food Sources': 'Healthy and sustainable fat reduction pace'
      },
      {
        'Metric / Target': 'Cheat Day Target',
        'Value': cal.cheatDay?.target || '1800–1900 kcal',
        'Category / Type': '1 Day / Week',
        'Notes & Food Sources': cal.cheatDay?.rules || 'No binge eating • Protein + Fiber first'
      },
      ...(cal.macros || []).map(m => ({
        'Metric / Target': `${m.name} Target`,
        'Value': `${m.amount} (${m.percentage})`,
        'Category / Type': 'Macro Ratio',
        'Notes & Food Sources': `Purpose: ${m.purpose} | Sources: ${m.foods}`
      }))
    ];

    const wsMacros = XLSX.utils.json_to_sheet(macroRows);
    wsMacros['!cols'] = [
      { wch: 26 },
      { wch: 22 },
      { wch: 18 },
      { wch: 60 },
    ];
    XLSX.utils.book_append_sheet(wb, wsMacros, 'Macros_And_Calories');

    // --- SHEET 3: Fasting & Hydration ---
    const fw = cleanProtocol.fastingAndWater || {};
    const fastingRows = [
      {
        'Protocol Name': 'Intermittent Fasting Protocol',
        'Setting / Target': fw.fastingProtocol || '16:8 Intermittent Fasting',
        'Timing / Window': fw.fastingWindow || 'Fasting 8:00 PM to 12:00 PM next day',
        'Special Guidelines': fw.fastingNotes || 'Zero-calorie drinks allowed (Water, black coffee, green tea)'
      },
      {
        'Protocol Name': 'Daily Water Intake Goal',
        'Setting / Target': `${fw.waterTargetLiters || 3.5} Litres`,
        'Timing / Window': `${fw.waterTargetGlasses || 14} Glasses (250ml each)`,
        'Special Guidelines': 'Drink 1 glass every 60–90 minutes; stop 1 hr before bedtime'
      },
      {
        'Protocol Name': 'Morning Electrolyte Hack',
        'Setting / Target': 'Warm lemon water + Pink Himalayan Salt',
        'Timing / Window': '08:00 AM (Immediately on waking)',
        'Special Guidelines': fw.electrolyteHack || 'Stimulates gut motility, rehydrates cells, flushes toxins'
      }
    ];

    const wsFasting = XLSX.utils.json_to_sheet(fastingRows);
    wsFasting['!cols'] = [
      { wch: 28 },
      { wch: 32 },
      { wch: 36 },
      { wch: 60 },
    ];
    XLSX.utils.book_append_sheet(wb, wsFasting, 'Fasting_And_Water');

    // --- SHEET 4: Micronutrients Focus ---
    const microRows = (cleanProtocol.micronutrients || []).map(micro => ({
      'Nutrient Name': micro.name || '',
      'Target Deficiency / Symptom': micro.target || '',
      'Top Food Sources': micro.sources || ''
    }));

    const wsMicro = XLSX.utils.json_to_sheet(microRows);
    wsMicro['!cols'] = [
      { wch: 20 },
      { wch: 38 },
      { wch: 55 },
    ];
    XLSX.utils.book_append_sheet(wb, wsMicro, 'Micronutrients_Focus');

    // --- SHEET 5: Hair, Skin & Body Regimes ---
    const skin = cleanProtocol.skinCare || {};
    const body = cleanProtocol.bodyCare || {};
    const hair = cleanProtocol.hairCare || {};

    const regimeRows = [
      {
        'Category': 'Skin Care',
        'Frequency': 'Daily AM & PM',
        'Routine & Steps': skin.daily || 'Cleanse, hydrate, sunscreen AM, barrier repair PM',
        'Special Notes': skin.notes || 'Gentle circular motion; use soothing gel'
      },
      {
        'Category': 'Skin Care',
        'Frequency': 'Weekly Sunday',
        'Routine & Steps': skin.weeklySunday || 'Face shaving and scrub',
        'Special Notes': 'Always disinfect razor and hydrate immediately'
      },
      {
        'Category': 'Skin Care',
        'Frequency': 'Weekly Tuesday & Friday',
        'Routine & Steps': skin.weeklyTueFri || 'Face pack',
        'Special Notes': 'Multani mitti, turmeric or soothing sandalwood'
      },
      {
        'Category': 'Body Care',
        'Frequency': 'Weekly Sunday',
        'Routine & Steps': body.sunday || 'Oiling, scrub, shaving',
        'Special Notes': body.notes || 'Warm oil massage before bath'
      },
      {
        'Category': 'Body Care',
        'Frequency': 'Weekly Tuesday & Friday',
        'Routine & Steps': body.tueFri || 'Exfoliating body wash',
        'Special Notes': 'Gentle loofah with exfoliating wash'
      },
      {
        'Category': 'Hair Care',
        'Frequency': 'Daily',
        'Routine & Steps': hair.daily || 'Serum and hair growth water',
        'Special Notes': hair.notes || 'Air dry naturally, wide-tooth detangling comb'
      },
      {
        'Category': 'Hair Care',
        'Frequency': 'Weekly (3x)',
        'Routine & Steps': hair.weekly || '3x Oiling, hair pack, hair wash',
        'Special Notes': 'Warm coconut/rosemary oil massage'
      },
      {
        'Category': 'Hair Care',
        'Frequency': 'Bi-Weekly (Two Weeks Once)',
        'Routine & Steps': hair.biWeekly || 'Saturday henna and Sunday avari podi (In the next alternate: Hair growth serum)',
        'Special Notes': 'Natural organic herbs for deep root nourishment'
      }
    ];

    const wsRegimes = XLSX.utils.json_to_sheet(regimeRows);
    wsRegimes['!cols'] = [
      { wch: 16 },
      { wch: 28 },
      { wch: 65 },
      { wch: 45 },
    ];
    XLSX.utils.book_append_sheet(wb, wsRegimes, 'Hair_Skin_Body_Regimes');

    // --- SHEET 6: Fitness & Sugar Strategy ---
    const ex = cleanProtocol.exerciseRoutine || {};
    const sug = cleanProtocol.sugarCutting || {};

    const fitnessRows = [
      {
        'Protocol Type': 'Morning Cardio',
        'Timing / Phase': '30–40 Mins (Morning)',
        'Routine & Action': ex.morning?.activities || 'Cycling or brisk outdoor walking',
        'Benefits & Notes': ex.morning?.benefits || 'Fat burning zone, insulin sensitivity & gut motility'
      },
      {
        'Protocol Type': 'Evening Bodyweight',
        'Timing / Phase': '20 Mins (Evening)',
        'Routine & Action': ex.evening?.activities || 'Squats (3x15), Glute bridges (3x15), Wall push-ups (3x12), Planks (3x30s)',
        'Benefits & Notes': ex.evening?.benefits || 'Tones glutes/core, improves posture, activates metabolism'
      },
      ...(sug.phases || []).map(p => ({
        'Protocol Type': 'Sugar Cutting Progression',
        'Timing / Phase': p.week || 'Phase',
        'Routine & Action': p.action || '',
        'Benefits & Notes': 'Step-by-step sugar reduction without withdrawal shock'
      })),
      {
        'Protocol Type': 'Craving Emergency Hack',
        'Timing / Phase': 'Instant (90 Seconds)',
        'Routine & Action': 'Drink 1 glass warm water + take 5 slow deep breaths',
        'Benefits & Notes': sug.cravingHack || 'Craving neuro-pathway fades in 90 seconds'
      }
    ];

    const wsFitness = XLSX.utils.json_to_sheet(fitnessRows);
    wsFitness['!cols'] = [
      { wch: 26 },
      { wch: 24 },
      { wch: 55 },
      { wch: 55 },
    ];
    XLSX.utils.book_append_sheet(wb, wsFitness, 'Fitness_And_Sugar');

    // Trigger file download in browser
    const cleanUserName = (userName || 'Custom').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `LifeTracker_Diet_Health_Protocol_${cleanUserName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    return { success: true, fileName };
  } catch (err) {
    console.error('Error generating Excel protocol:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Quick helper to download empty/sample template
 */
export const downloadSampleDietTemplate = () => {
  return exportHealthProtocolToExcel(DEFAULT_HEALTH_PROTOCOL, 'Template');
};

/**
 * Parse uploaded Excel (.xlsx, .xls) or CSV file into LifeTracker Health Protocol schema
 */
export const parseHealthProtocolFromExcel = async (file) => {
  return new Promise((resolve) => {
    if (!file) {
      resolve({ success: false, error: 'No file provided.' });
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          resolve({ success: false, error: 'The uploaded spreadsheet contains no sheets.' });
          return;
        }

        const sheetsParsed = [];
        const warnings = [];

        // Start with default protocol as foundation
        const newProtocol = JSON.parse(JSON.stringify(DEFAULT_HEALTH_PROTOCOL));
        newProtocol.meta = {
          isCustom: true,
          planName: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
          uploadedAt: new Date().toISOString(),
          fileName: file.name,
          source: 'excel_upload'
        };

        // --- 1. Parse Meal Schedule Sheet ---
        const mealSheetName = workbook.SheetNames.find(name => {
          const n = normalizeKey(name);
          return n.includes('meal') || n.includes('diet') || n.includes('food') || n.includes('schedule') || n.includes('timetable') || n.includes('menu');
        });

        if (mealSheetName) {
          sheetsParsed.push(mealSheetName);
          const mealRows = XLSX.utils.sheet_to_json(workbook.Sheets[mealSheetName]);

          if (Array.isArray(mealRows) && mealRows.length > 0) {
            const parsedMeals = [];
            mealRows.forEach((row, idx) => {
              const name = getFieldValue(row, ['Meal Name', 'Meal', 'Title', 'Item', 'Name']);
              const time = getFieldValue(row, ['Time', 'Timing', 'Schedule', 'When']);
              const dishes = getFieldValue(row, ['Dishes & Ingredients', 'Dishes', 'Ingredients', 'Food', 'Menu', 'Description', 'Items']);
              const rawCal = getFieldValue(row, ['Calories (kcal)', 'Calories', 'Cal', 'Kcal', 'Energy']);
              const rawProtein = getFieldValue(row, ['Protein', 'Protein (g)', 'Prot']);
              const benefits = getFieldValue(row, ['Hair & Skin Benefits', 'Benefits', 'Hair & Skin', 'Target', 'Purpose', 'Notes']);

              if (name || dishes || time) {
                const calNum = parseInt(String(rawCal).replace(/[^0-9]/g, ''), 10) || 0;
                let proteinStr = String(rawProtein || '').trim();
                if (proteinStr && !proteinStr.toLowerCase().endsWith('g')) {
                  proteinStr = `${proteinStr} g`;
                }

                parsedMeals.push({
                  id: `meal-custom-${idx + 1}`,
                  time: time || `${(idx + 1) * 3}:00 PM`,
                  name: name || `Meal ${idx + 1}`,
                  dishes: dishes || 'Custom healthy meal',
                  calories: calNum,
                  protein: proteinStr || '15 g',
                  hairSkinBenefits: benefits || 'Nutritional balance and sustained energy'
                });
              }
            });

            if (parsedMeals.length > 0) {
              newProtocol.mealSchedule = parsedMeals;
            } else {
              warnings.push('Meal Schedule sheet had rows but headers were unrecognized; standard meals preserved.');
            }
          }
        }

        // --- 2. Parse Macros & Calories Sheet ---
        const macroSheetName = workbook.SheetNames.find(name => {
          const n = normalizeKey(name);
          return n.includes('macro') || n.includes('calor') || n.includes('target') || n.includes('nutrition');
        });

        if (macroSheetName) {
          sheetsParsed.push(macroSheetName);
          const macroRows = XLSX.utils.sheet_to_json(workbook.Sheets[macroSheetName]);

          if (Array.isArray(macroRows) && macroRows.length > 0) {
            macroRows.forEach(row => {
              const metric = getFieldValue(row, ['Metric / Target', 'Metric', 'Target', 'Name', 'Item']).toLowerCase();
              const val = getFieldValue(row, ['Value', 'Target Value', 'Amount', 'Number', 'Goal']);
              const notes = getFieldValue(row, ['Notes & Food Sources', 'Notes', 'Foods', 'Sources', 'Description']);

              if (metric.includes('maintenance')) {
                const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
                if (num > 500) newProtocol.calories.maintenance = num;
              } else if (metric.includes('fat loss') || (metric.includes('target') && metric.includes('calor'))) {
                if (val) newProtocol.calories.fatLossTarget = val;
              } else if (metric.includes('loss') || metric.includes('expected')) {
                if (val) newProtocol.calories.expectedLoss = val;
              } else if (metric.includes('cheat')) {
                if (val) newProtocol.calories.cheatDay.target = val;
                if (notes) newProtocol.calories.cheatDay.rules = notes;
              } else if (metric.includes('protein')) {
                const mObj = newProtocol.calories.macros.find(m => m.id === 'protein');
                if (mObj && val) {
                  mObj.amount = val;
                  if (notes) mObj.foods = notes;
                }
              } else if (metric.includes('carb')) {
                const mObj = newProtocol.calories.macros.find(m => m.id === 'carbs');
                if (mObj && val) {
                  mObj.amount = val;
                  if (notes) mObj.foods = notes;
                }
              } else if (metric.includes('fat')) {
                const mObj = newProtocol.calories.macros.find(m => m.id === 'fats');
                if (mObj && val) {
                  mObj.amount = val;
                  if (notes) mObj.foods = notes;
                }
              }
            });
          }
        }

        // --- 3. Parse Fasting & Water Sheet ---
        const fastingSheetName = workbook.SheetNames.find(name => {
          const n = normalizeKey(name);
          return n.includes('fast') || n.includes('water') || n.includes('hydrat');
        });

        if (fastingSheetName) {
          sheetsParsed.push(fastingSheetName);
          const fastingRows = XLSX.utils.sheet_to_json(workbook.Sheets[fastingSheetName]);

          if (Array.isArray(fastingRows) && fastingRows.length > 0) {
            fastingRows.forEach(row => {
              const name = getFieldValue(row, ['Protocol Name', 'Protocol', 'Name', 'Item']).toLowerCase();
              const setting = getFieldValue(row, ['Setting / Target', 'Setting', 'Target', 'Value']);
              const timing = getFieldValue(row, ['Timing / Window', 'Timing', 'Window', 'Time']);
              const guidelines = getFieldValue(row, ['Special Guidelines', 'Guidelines', 'Instructions', 'Notes']);

              if (name.includes('fast') || name.includes('intermittent')) {
                if (setting) newProtocol.fastingAndWater.fastingProtocol = setting;
                if (timing) newProtocol.fastingAndWater.fastingWindow = timing;
                if (guidelines) newProtocol.fastingAndWater.fastingNotes = guidelines;
              } else if (name.includes('water') || name.includes('hydrat')) {
                const liters = parseFloat(setting.replace(/[^0-9.]/g, '')) || 3.5;
                newProtocol.fastingAndWater.waterTargetLiters = liters;
                newProtocol.fastingAndWater.waterTargetGlasses = Math.round(liters * 4);
              } else if (name.includes('electrolyte') || name.includes('morning')) {
                if (setting || guidelines) {
                  newProtocol.fastingAndWater.electrolyteHack = `${setting} - ${guidelines}`.replace(/^[ -]+|[ -]+$/g, '');
                }
              }
            });
          }
        }

        // --- 4. Parse Micronutrients Focus Sheet ---
        const microSheetName = workbook.SheetNames.find(name => {
          const n = normalizeKey(name);
          return n.includes('micro') || n.includes('nutrient') || n.includes('vitamin');
        });

        if (microSheetName) {
          sheetsParsed.push(microSheetName);
          const microRows = XLSX.utils.sheet_to_json(workbook.Sheets[microSheetName]);

          if (Array.isArray(microRows) && microRows.length > 0) {
            const parsedMicros = [];
            const defaultColors = ['#f43f5e', '#8b5cf6', '#f59e0b', '#6366f1', '#0ea5e9', '#10b981', '#ec4899'];

            microRows.forEach((row, idx) => {
              const name = getFieldValue(row, ['Nutrient Name', 'Nutrient', 'Name', 'Vitamin', 'Mineral']);
              const target = getFieldValue(row, ['Target Deficiency / Symptom', 'Target', 'Symptom', 'Need', 'Purpose']);
              const sources = getFieldValue(row, ['Top Food Sources', 'Food Sources', 'Sources', 'Foods']);

              if (name) {
                parsedMicros.push({
                  id: `micro-${idx + 1}`,
                  name,
                  target: target || 'General vitality & cellular wellness',
                  sources: sources || 'Whole foods, nuts, leafy greens',
                  color: defaultColors[idx % defaultColors.length]
                });
              }
            });

            if (parsedMicros.length > 0) {
              newProtocol.micronutrients = parsedMicros;
            }
          }
        }

        // --- 5. Parse Hair, Skin & Body Regimes Sheet ---
        const regimeSheetName = workbook.SheetNames.find(name => {
          const n = normalizeKey(name);
          return n.includes('regime') || n.includes('skin') || n.includes('hair') || n.includes('body') || n.includes('care');
        });

        if (regimeSheetName) {
          sheetsParsed.push(regimeSheetName);
          const regimeRows = XLSX.utils.sheet_to_json(workbook.Sheets[regimeSheetName]);

          if (Array.isArray(regimeRows) && regimeRows.length > 0) {
            regimeRows.forEach(row => {
              const cat = getFieldValue(row, ['Category', 'Type', 'Area']).toLowerCase();
              const freq = getFieldValue(row, ['Frequency', 'Frequency / Day', 'When', 'Timing']).toLowerCase();
              const steps = getFieldValue(row, ['Routine & Steps', 'Routine', 'Steps', 'Action', 'Regime']);
              const notes = getFieldValue(row, ['Special Notes', 'Notes', 'Tips', 'Guidelines']);

              if (cat.includes('skin')) {
                if (freq.includes('daily') || freq.includes('am') || freq.includes('pm')) {
                  if (steps) newProtocol.skinCare.daily = steps;
                } else if (freq.includes('sunday')) {
                  if (steps) newProtocol.skinCare.weeklySunday = steps;
                } else if (freq.includes('tue') || freq.includes('fri')) {
                  if (steps) newProtocol.skinCare.weeklyTueFri = steps;
                }
                if (notes) newProtocol.skinCare.notes = notes;
              } else if (cat.includes('body')) {
                if (freq.includes('sunday')) {
                  if (steps) newProtocol.bodyCare.sunday = steps;
                } else if (freq.includes('tue') || freq.includes('fri')) {
                  if (steps) newProtocol.bodyCare.tueFri = steps;
                }
                if (notes) newProtocol.bodyCare.notes = notes;
              } else if (cat.includes('hair')) {
                if (freq.includes('daily')) {
                  if (steps) newProtocol.hairCare.daily = steps;
                } else if (freq.includes('weekly') && !freq.includes('bi')) {
                  if (steps) newProtocol.hairCare.weekly = steps;
                } else if (freq.includes('two') || freq.includes('bi')) {
                  if (steps) newProtocol.hairCare.biWeekly = steps;
                }
                if (notes) newProtocol.hairCare.notes = notes;
              }
            });
          }
        }

        // --- 6. Parse Fitness & Sugar Strategy Sheet ---
        const fitnessSheetName = workbook.SheetNames.find(name => {
          const n = normalizeKey(name);
          return n.includes('fitness') || n.includes('workout') || n.includes('exercise') || n.includes('sugar');
        });

        if (fitnessSheetName) {
          sheetsParsed.push(fitnessSheetName);
          const fitnessRows = XLSX.utils.sheet_to_json(workbook.Sheets[fitnessSheetName]);

          if (Array.isArray(fitnessRows) && fitnessRows.length > 0) {
            const sugarPhases = [];
            fitnessRows.forEach(row => {
              const type = getFieldValue(row, ['Protocol Type', 'Type', 'Protocol', 'Name']).toLowerCase();
              const timing = getFieldValue(row, ['Timing / Phase', 'Timing', 'Phase', 'Duration']);
              const action = getFieldValue(row, ['Routine & Action', 'Action', 'Routine', 'Activities']);
              const benefits = getFieldValue(row, ['Benefits & Notes', 'Benefits', 'Notes']);

              if (type.includes('morning') || (type.includes('cardio') && !type.includes('evening'))) {
                if (action) newProtocol.exerciseRoutine.morning.activities = action;
                if (benefits) newProtocol.exerciseRoutine.morning.benefits = benefits;
                if (timing) newProtocol.exerciseRoutine.morning.title = `🌅 Morning Cardio (${timing})`;
              } else if (type.includes('evening') || type.includes('bodyweight') || type.includes('strength')) {
                if (action) newProtocol.exerciseRoutine.evening.activities = action;
                if (benefits) newProtocol.exerciseRoutine.evening.benefits = benefits;
                if (timing) newProtocol.exerciseRoutine.evening.title = `💪 Evening Routine (${timing})`;
              } else if (type.includes('sugar')) {
                if (action) {
                  sugarPhases.push({
                    week: timing || `Phase ${sugarPhases.length + 1}`,
                    action,
                    status: `Phase ${sugarPhases.length + 1}`
                  });
                }
              } else if (type.includes('craving') || type.includes('hack')) {
                if (action) newProtocol.sugarCutting.cravingHack = `🧠 Craving Hack: ${action}`;
              }
            });

            if (sugarPhases.length > 0) {
              newProtocol.sugarCutting.phases = sugarPhases;
            }
          }
        }

        // --- 7. Fallback for Simple Single-Sheet or CSV files ---
        if (sheetsParsed.length === 0) {
          const firstSheetName = workbook.SheetNames[0];
          const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);

          if (Array.isArray(rawRows) && rawRows.length > 0) {
            sheetsParsed.push(firstSheetName);
            const parsedMeals = [];

            rawRows.forEach((row, idx) => {
              const name = getFieldValue(row, ['Meal Name', 'Meal', 'Title', 'Item', 'Name', 'Food']);
              const time = getFieldValue(row, ['Time', 'Timing', 'Schedule', 'When']);
              const dishes = getFieldValue(row, ['Dishes & Ingredients', 'Dishes', 'Ingredients', 'Menu', 'Description', 'Items']);
              const rawCal = getFieldValue(row, ['Calories (kcal)', 'Calories', 'Cal', 'Kcal', 'Energy']);
              const rawProtein = getFieldValue(row, ['Protein', 'Protein (g)', 'Prot']);
              const benefits = getFieldValue(row, ['Hair & Skin Benefits', 'Benefits', 'Hair & Skin', 'Target', 'Notes']);

              if (name || dishes || time) {
                const calNum = parseInt(String(rawCal).replace(/[^0-9]/g, ''), 10) || 0;
                parsedMeals.push({
                  id: `meal-custom-${idx + 1}`,
                  time: time || `${(idx + 1) * 3}:00 PM`,
                  name: name || `Meal ${idx + 1}`,
                  dishes: dishes || name || 'Custom healthy dish',
                  calories: calNum,
                  protein: rawProtein ? (rawProtein.endsWith('g') ? rawProtein : `${rawProtein} g`) : '15 g',
                  hairSkinBenefits: benefits || 'Nutritional balance & cell renewal'
                });
              }
            });

            if (parsedMeals.length > 0) {
              newProtocol.mealSchedule = parsedMeals;
            }
          }
        }

        // Compute summary statistics
        const totalMealsParsed = (newProtocol.mealSchedule || []).length;
        const totalCaloriesFromMeals = (newProtocol.mealSchedule || []).reduce((sum, m) => sum + (m.calories || 0), 0);
        const totalProteinFromMeals = (newProtocol.mealSchedule || []).reduce((sum, m) => {
          const pVal = parseInt(String(m.protein || '').replace(/[^0-9]/g, ''), 10) || 0;
          return sum + pVal;
        }, 0);

        resolve({
          success: true,
          protocol: newProtocol,
          stats: {
            fileName: file.name,
            sheetsParsed,
            totalMealsParsed,
            totalCaloriesFromMeals,
            totalProteinFromMeals,
            hasCustomMacros: macroSheetName !== undefined,
            hasCustomFasting: fastingSheetName !== undefined,
            hasCustomMicro: microSheetName !== undefined,
            hasCustomRegimes: regimeSheetName !== undefined,
            warnings
          }
        });
      } catch (parseError) {
        console.error('Error parsing Excel spreadsheet:', parseError);
        resolve({
          success: false,
          error: `Failed to parse spreadsheet: ${parseError.message}`
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: 'File read error. Please ensure the file is a valid Excel or CSV file.' });
    };

    reader.readAsArrayBuffer(file);
  });
};
