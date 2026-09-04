import * as XLSX from 'xlsx';
import { 
  DB_HEALTH_PROTOCOL_TEMPLATE as DEFAULT_HEALTH_PROTOCOL, 
  sanitizeHealthProtocol 
} from './cloudDatabase';

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
    const cleanProtocol = sanitizeHealthProtocol({ ...DEFAULT_HEALTH_PROTOCOL, ...protocol });

    // --- SHEET 1: Macros & Calories ---
    const cal = cleanProtocol.calories || {};
    const macroRows = [
      {
        'Metric / Macro Name': 'Maintenance Calories',
        'Target Amount / Calories': `${cal.maintenance || 1850} kcal/day`,
        'Ratio / Percentage': '—',
        'Health & Body Purpose': 'Daily energy needed for zero weight change baseline',
        'Top Food Sources & Guidelines': 'Whole balanced diet'
      },
      {
        'Metric / Macro Name': 'Daily Fat Loss Target',
        'Target Amount / Calories': cal.fatLossTarget || '1350–1450 kcal/day',
        'Ratio / Percentage': '—',
        'Health & Body Purpose': 'Optimal daily calorie intake for steady fat burn',
        'Top Food Sources & Guidelines': 'High protein, high fiber, whole foods'
      },
      {
        'Metric / Macro Name': 'Expected Fat Loss Rate',
        'Target Amount / Calories': cal.expectedLoss || '0.5–0.7 kg/week (healthy & sustainable)',
        'Ratio / Percentage': '—',
        'Health & Body Purpose': 'Sustainable and healthy fat reduction pace',
        'Top Food Sources & Guidelines': 'Maintains lean muscle mass'
      },
      {
        'Metric / Macro Name': 'Cheat Day Target',
        'Target Amount / Calories': cal.cheatDay?.target || '1800–1900 kcal',
        'Ratio / Percentage': '1 Day / Week',
        'Health & Body Purpose': 'Prevents metabolic adaptation and refreshes leptin',
        'Top Food Sources & Guidelines': cal.cheatDay?.rules || 'No binge eating • Protein + Fiber first • Stop at 80% fullness'
      },
      ...(cal.macros || []).map(m => ({
        'Metric / Macro Name': `${m.name}`,
        'Target Amount / Calories': String(m.amount || '').replace(/\s*\([^)]*\)/g, '').trim(),
        'Ratio / Percentage': m.percentage || '',
        'Health & Body Purpose': m.purpose || '',
        'Top Food Sources & Guidelines': String(m.foods || '').replace(/^.*Sources:\s*/i, '').trim()
      }))
    ];

    const wsMacros = XLSX.utils.json_to_sheet(macroRows);
    wsMacros['!cols'] = [
      { wch: 26 },
      { wch: 24 },
      { wch: 18 },
      { wch: 52 },
      { wch: 65 },
    ];
    XLSX.utils.book_append_sheet(wb, wsMacros, 'Macros_And_Calories');

    // --- SHEET 2: Micronutrients Focus ---
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
        'Frequency / Schedule': 'Daily AM & PM',
        'Routine & Steps': skin.daily || 'Cleanse, hydrate, sunscreen AM, barrier repair PM',
        'Special Guidelines': skin.notes || 'Gentle circular motion; use soothing gel'
      },
      {
        'Category': 'Skin Care',
        'Frequency / Schedule': 'Weekly Sunday',
        'Routine & Steps': skin.weeklySunday || 'Face shaving and scrub',
        'Special Guidelines': 'Always disinfect razor and hydrate immediately'
      },
      {
        'Category': 'Skin Care',
        'Frequency / Schedule': 'Weekly Tuesday & Friday',
        'Routine & Steps': skin.weeklyTueFri || 'Face pack',
        'Special Guidelines': 'Multani mitti, turmeric or soothing sandalwood'
      },
      {
        'Category': 'Body Care',
        'Frequency / Schedule': 'Weekly Sunday',
        'Routine & Steps': body.sunday || 'Oiling, scrub, shaving',
        'Special Guidelines': body.notes || 'Warm oil massage before bath'
      },
      {
        'Category': 'Body Care',
        'Frequency / Schedule': 'Weekly Tuesday & Friday',
        'Routine & Steps': body.tueFri || 'Exfoliating body wash',
        'Special Guidelines': 'Gentle loofah with exfoliating wash'
      },
      {
        'Category': 'Hair Care',
        'Frequency / Schedule': 'Daily',
        'Routine & Steps': hair.daily || 'Serum and hair growth water',
        'Special Guidelines': hair.notes || 'Air dry naturally, wide-tooth detangling comb'
      },
      {
        'Category': 'Hair Care',
        'Frequency / Schedule': 'Weekly (3x)',
        'Routine & Steps': hair.weekly || '3x Oiling, hair pack, hair wash',
        'Special Guidelines': 'Warm coconut/rosemary oil massage'
      },
      {
        'Category': 'Hair Care',
        'Frequency / Schedule': 'Bi-Weekly (Two Weeks Once)',
        'Routine & Steps': hair.biWeekly || 'Saturday henna and Sunday avari podi (In the next alternate: Hair growth serum)',
        'Special Guidelines': 'Natural organic herbs for deep root nourishment'
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
  return exportHealthProtocolToExcel(DEFAULT_HEALTH_PROTOCOL, 'Sample_Template');
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
              const name = getFieldValue(row, ['Meal Title', 'Meal Name', 'Meal', 'Title', 'Item', 'Name']);
              const time = getFieldValue(row, ['Time', 'Timing', 'Schedule', 'When']);
              const dishes = getFieldValue(row, ['Dishes & Ingredients', 'Dishes', 'Ingredients', 'Food', 'Menu', 'Description', 'Items']);
              const rawCal = getFieldValue(row, ['Calories (kcal)', 'Calories', 'Cal', 'Kcal', 'Energy']);
              const rawProtein = getFieldValue(row, ['Protein (g)', 'Protein', 'Prot']);
              const benefits = getFieldValue(row, ['Hair & Skin Benefits', 'Benefits', 'Hair & Skin', 'Target', 'Purpose', 'Notes']);

              if (name || dishes || time) {
                const calNum = parseInt(String(rawCal).replace(/[^0-9]/g, ''), 10) || 0;
                let proteinStr = String(rawProtein || '').replace(/\s*\([^)]*\)/g, '').trim();
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
              const metric = getFieldValue(row, ['Metric / Macro Name', 'Metric / Target', 'Metric', 'Target', 'Name', 'Item', 'Macro / Metric Name', 'Macro']).toLowerCase();
              const val = getFieldValue(row, ['Target Amount / Calories', 'Value', 'Target Value', 'Amount', 'Number', 'Goal', 'Target Amount', 'Calories']);
              const ratio = getFieldValue(row, ['Ratio / Percentage', 'Ratio', 'Percentage', '%', 'Category / Type']);
              const purpose = getFieldValue(row, ['Health & Body Purpose', 'Purpose', 'Target / Purpose', 'Benefits']);
              const notes = getFieldValue(row, ['Top Food Sources & Guidelines', 'Notes & Food Sources', 'Notes', 'Foods', 'Sources', 'Top Food Sources', 'Description', 'Food Sources']);

              if (metric.includes('maintenance')) {
                const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
                if (num > 500) newProtocol.calories.maintenance = num;
              } else if (metric.includes('expected') || metric.includes('rate') || (metric.includes('loss') && !metric.includes('target') && !metric.includes('calorie') && !metric.includes('daily'))) {
                if (val) newProtocol.calories.expectedLoss = val;
              } else if (metric.includes('fat loss') || metric.includes('daily calorie') || (metric.includes('target') && !metric.includes('cheat') && !metric.includes('protein') && !metric.includes('carb') && !metric.includes('fat'))) {
                if (val && !val.toLowerCase().includes('kg')) {
                  newProtocol.calories.fatLossTarget = val;
                }
              } else if (metric.includes('cheat')) {
                if (val) newProtocol.calories.cheatDay.target = val;
                if (notes || purpose) newProtocol.calories.cheatDay.rules = notes || purpose;
              } else if (metric.includes('protein')) {
                const mObj = newProtocol.calories.macros.find(m => m.id === 'protein');
                if (mObj) {
                  const cleanAmount = val.replace(/\s*\([^)]*\)/g, '').trim();
                  if (cleanAmount) mObj.amount = cleanAmount;
                  if (ratio && ratio !== '—') mObj.percentage = ratio;
                  if (purpose) mObj.purpose = purpose;
                  if (notes) mObj.foods = notes.replace(/^.*Sources:\s*/i, '').trim();
                }
              } else if (metric.includes('carb')) {
                const mObj = newProtocol.calories.macros.find(m => m.id === 'carbs');
                if (mObj) {
                  const cleanAmount = val.replace(/\s*\([^)]*\)/g, '').trim();
                  if (cleanAmount) mObj.amount = cleanAmount;
                  if (ratio && ratio !== '—') mObj.percentage = ratio;
                  if (purpose) mObj.purpose = purpose;
                  if (notes) mObj.foods = notes.replace(/^.*Sources:\s*/i, '').trim();
                }
              } else if (metric === 'fats' || metric.includes('healthy fat') || (metric.includes('fat') && !metric.includes('loss') && !metric.includes('cheat'))) {
                const mObj = newProtocol.calories.macros.find(m => m.id === 'fats');
                if (mObj) {
                  const cleanAmount = val.replace(/\s*\([^)]*\)/g, '').trim();
                  if (cleanAmount) mObj.amount = cleanAmount;
                  if (ratio && ratio !== '—') mObj.percentage = ratio;
                  if (purpose) mObj.purpose = purpose;
                  if (notes) mObj.foods = notes.replace(/^.*Sources:\s*/i, '').trim();
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
              const freq = getFieldValue(row, ['Frequency / Schedule', 'Frequency', 'Frequency / Day', 'When', 'Timing']).toLowerCase();
              const steps = getFieldValue(row, ['Routine & Steps', 'Routine', 'Steps', 'Action', 'Regime']);
              const notes = getFieldValue(row, ['Special Guidelines', 'Special Notes', 'Notes', 'Tips', 'Guidelines']);

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
              const name = getFieldValue(row, ['Meal Title', 'Meal Name', 'Meal', 'Title', 'Item', 'Name', 'Food']);
              const time = getFieldValue(row, ['Time', 'Timing', 'Schedule', 'When']);
              const dishes = getFieldValue(row, ['Dishes & Ingredients', 'Dishes', 'Ingredients', 'Menu', 'Description', 'Items']);
              const rawCal = getFieldValue(row, ['Calories (kcal)', 'Calories', 'Cal', 'Kcal', 'Energy']);
              const rawProtein = getFieldValue(row, ['Protein (g)', 'Protein', 'Prot']);
              const benefits = getFieldValue(row, ['Hair & Skin Benefits', 'Benefits', 'Hair & Skin', 'Target', 'Notes']);

              if (name || dishes || time) {
                const calNum = parseInt(String(rawCal).replace(/[^0-9]/g, ''), 10) || 0;
                let cleanProt = String(rawProtein || '').replace(/\s*\([^)]*\)/g, '').trim();
                parsedMeals.push({
                  id: `meal-custom-${idx + 1}`,
                  time: time || `${(idx + 1) * 3}:00 PM`,
                  name: name || `Meal ${idx + 1}`,
                  dishes: dishes || name || 'Custom healthy dish',
                  calories: calNum,
                  protein: cleanProt ? (cleanProt.endsWith('g') ? cleanProt : `${cleanProt} g`) : '15 g',
                  hairSkinBenefits: benefits || 'Nutritional balance & cell renewal'
                });
              }
            });

            if (parsedMeals.length > 0) {
              newProtocol.mealSchedule = parsedMeals;
            }
          }
        }

        // Pass through sanitizer to guarantee 100% clean schema without duplications
        const sanitizedProtocol = sanitizeHealthProtocol(newProtocol);

        // Compute summary statistics
        const totalMealsParsed = (sanitizedProtocol.mealSchedule || []).length;
        const totalCaloriesFromMeals = (sanitizedProtocol.mealSchedule || []).reduce((sum, m) => sum + (m.calories || 0), 0);
        const totalProteinFromMeals = (sanitizedProtocol.mealSchedule || []).reduce((sum, m) => {
          const pVal = parseInt(String(m.protein || '').replace(/[^0-9]/g, ''), 10) || 0;
          return sum + pVal;
        }, 0);

        resolve({
          success: true,
          protocol: sanitizedProtocol,
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
