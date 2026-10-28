import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

function excelDateToJS(serial) {
  if (!serial || isNaN(serial)) return '';
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return date_info.toISOString().split('T')[0];
}

const wb = XLSX.readFile('120_Day_Full_Stack_Developer_Plan.xlsx');

const planRows = XLSX.utils.sheet_to_json(wb.Sheets['120-Day Plan'], { defval: '' });
const trackerRows = XLSX.utils.sheet_to_json(wb.Sheets['Daily Tracker'], { defval: '' });
const conceptsRows = XLSX.utils.sheet_to_json(wb.Sheets['Tech Concepts'], { defval: '' });
const weeklyRows = XLSX.utils.sheet_to_json(wb.Sheets['Weekly Review'], { defval: '' });
const resRows = XLSX.utils.sheet_to_json(wb.Sheets['Resources'], { defval: '' });
const aiRowsRaw = XLSX.utils.sheet_to_json(wb.Sheets['AI Workflow'], { header: 1 });

const days = planRows.map((p, idx) => {
  const t = trackerRows[idx] || {};
  const dateStr = excelDateToJS(p.Date);
  const dateObj = new Date(dateStr);
  const monthName = !isNaN(dateObj) ? dateObj.toLocaleString('en-US', { month: 'long' }) : '';
  const formattedDate = !isNaN(dateObj) ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  return {
    id: `day-${p.Day}`,
    day: Number(p.Day),
    date: dateStr,
    dateRange: formattedDate,
    period: `Day ${p.Day}`,
    month: monthName,
    cycle: p.Cycle || 'Cycle 1: JS + DSA',
    status: p.Status === 'Rest' ? 'Rest' : 'Not Started',
    planStatus: p.Status || 'Study',
    actualStatus: t['Actual status'] || '',
    completion: t['Completion (Done/Partial/Skipped/Rest)'] || (p.Status === 'Rest' ? 'Rest' : 'Pending'),
    mainTopic: p['Main topic'] || '',
    concepts: p['Concepts to learn'] || '',
    exercise: p['Specific exercise / acceptance criteria'] || '',
    dsa: p['DSA practice'] || '',
    projectTask: p['Project task'] || '',
    resource: p.Resource || '',
    studyChecklist: p['Study checklist'] || 'Learn; code; DSA/project; recall',
    checklistItems: ['Learn', 'Code', 'DSA/Project', 'Recall'],
    completedTasks: [],
    actualMinutes: Number(t['Minutes studied']) || 0,
    confidence: Number(t['Confidence (1-5)']) || 0,
    notes: t['Mistake / blocker'] || p['Notes / mistakes'] || '',
    mistakesBlockers: t['Mistake / blocker'] || '',
    dsaResult: t['DSA problem / result'] || '',
    projectOutput: t['Project output'] || '',
    tomorrowsTask: t["Tomorrow's first task"] || '',
    // Backwards-compatible fields for dashboard and existing widgets:
    fullstack: (p['Main topic'] ? p['Main topic'] + ': ' : '') + (p['Concepts to learn'] || ''),
    mobile: p['Specific exercise / acceptance criteria'] || '',
    project: p['Project task'] || '',
    career: p['Concepts to learn'] || p['Specific exercise / acceptance criteria'] || ''
  };
});

const concepts = conceptsRows.map((c, idx) => ({
  id: `concept-${idx + 1}`,
  area: c['Concept area'] || '',
  concept: c['Concept'] || '',
  whatToUnderstand: c['What to understand'] || '',
  exercise: c['Hands-on exercise'] || '',
  cycle: c['When to learn'] || '',
  priority: c['Priority'] || 'Medium',
  masteryCheck: c['Mastery check'] || '',
  resource: c['Resource'] || '',
  mastered: false,
  notes: ''
}));

const weeklyReviews = weeklyRows.map((w, idx) => {
  const dateStr = excelDateToJS(w['Review date']);
  const dateObj = new Date(dateStr);
  const formattedDate = !isNaN(dateObj) ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  return {
    id: `week-${w.Week}`,
    week: Number(w.Week),
    daysCovered: w['Days covered'] || '',
    reviewDate: dateStr,
    formattedDate,
    conceptsExplained: w['Concepts I can explain'] || '',
    problemsSolved: Number(w['Problems solved unaided']) || 0,
    projectMilestone: w['Project milestone'] || '',
    biggestMistake: w['Biggest mistake / lesson'] || '',
    confidence: Number(w['Confidence (1-5)']) || 0,
    nextWeekPriority: w["Next week's priority"] || '',
    checklist: w['Review checklist'] || 'Explain concepts; redo one problem; review mistakes',
    completed: false
  };
});

const resources = resRows.map((r, idx) => ({
  id: `res-${idx + 1}`,
  topic: r['Topic'] || '',
  url: r['Resource'] || '',
  howToUse: r['How to use it'] || ''
}));

const aiRules = aiRowsRaw.slice(2).map((row, idx) => ({
  id: `ai-step-${idx + 1}`,
  step: row[0] || '',
  whatToDo: row[1] || '',
  prompt: row[2] || '',
  evidence: row[3] || ''
}));

const cycleMilestones = [
  { cycle: 'Cycle 1 · Days 1-30', target: 'JavaScript expense tracker using HTML/CSS/JS + localStorage', badge: 'JS + DSA' },
  { cycle: 'Cycle 2 · Days 31-60', target: 'React + TypeScript dashboard with reusable components and tests', badge: 'React + TS' },
  { cycle: 'Cycle 3 · Days 61-90', target: 'Full-stack app with Express API, PostgreSQL and authentication', badge: 'Backend + DB' },
  { cycle: 'Cycle 4 · Days 91-120', target: 'Documented, tested, deployable capstone + architecture diagram', badge: 'Design + Deploy' }
];

const fileContent = `// Auto-generated 120-Day Full-Stack Developer Growth Plan Data from Excel
export const DEFAULT_PLAN_START_DATE = '2026-10-27';
export const DEFAULT_DAILY_TARGET_HOURS = 2;
export const TOTAL_PLAN_DAYS = 120;

export const CYCLE_MILESTONES = ${JSON.stringify(cycleMilestones, null, 2)};

export const DEFAULT_DEV_PLAN_DAYS = ${JSON.stringify(days, null, 2)};

export const DEV_PLAN_CONCEPTS = ${JSON.stringify(concepts, null, 2)};

export const DEV_PLAN_WEEKLY_REVIEWS = ${JSON.stringify(weeklyReviews, null, 2)};

export const DEV_PLAN_RESOURCES = ${JSON.stringify(resources, null, 2)};

export const DEV_PLAN_AI_WORKFLOW = ${JSON.stringify(aiRules, null, 2)};

export function formatPlanDate(dateStr) {
  if (!dateStr) return { dateRange: '', month: '', weekday: '' };
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return {
    dateRange: dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }),
    month: dt.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' }),
    weekday: dt.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })
  };
}

export function addDaysToDate(dateStr, n) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().split('T')[0];
}

export function recalculatePlanDates(daysList, newStartDateStr) {
  if (!Array.isArray(daysList) || !newStartDateStr) return daysList;
  return daysList.map((day, idx) => {
    const newDateStr = addDaysToDate(newStartDateStr, idx);
    const meta = formatPlanDate(newDateStr);
    return {
      ...day,
      date: newDateStr,
      dateRange: meta.dateRange,
      month: meta.month,
      weekday: meta.weekday
    };
  });
}

export function shiftPlanDatesFromDay(daysList, fromDayNumber, deltaDays) {
  if (!Array.isArray(daysList) || !deltaDays) return daysList;
  return daysList.map(day => {
    if (day.day < fromDayNumber) return day;
    const newDateStr = addDaysToDate(day.date, deltaDays);
    const meta = formatPlanDate(newDateStr);
    return {
      ...day,
      date: newDateStr,
      dateRange: meta.dateRange,
      month: meta.month,
      weekday: meta.weekday
    };
  });
}

export function updateSingleDayDate(daysList, dayId, newDateStr) {
  if (!Array.isArray(daysList)) return daysList;
  const meta = formatPlanDate(newDateStr);
  return daysList.map(day => {
    if (day.id !== dayId) return day;
    return {
      ...day,
      date: newDateStr,
      dateRange: meta.dateRange,
      month: meta.month,
      weekday: meta.weekday
    };
  });
}

export function swapDatesBetweenDays(daysList, dayId1, dayId2) {
  if (!Array.isArray(daysList)) return daysList;
  const day1 = daysList.find(d => d.id === dayId1);
  const day2 = daysList.find(d => d.id === dayId2);
  if (!day1 || !day2) return daysList;
  return daysList.map(day => {
    if (day.id === dayId1) {
      return {
        ...day,
        date: day2.date,
        dateRange: day2.dateRange,
        month: day2.month,
        weekday: day2.weekday
      };
    }
    if (day.id === dayId2) {
      return {
        ...day,
        date: day1.date,
        dateRange: day1.dateRange,
        month: day1.month,
        weekday: day1.weekday
      };
    }
    return day;
  });
}
`;

fs.writeFileSync('src/services/devPlanData.js', fileContent);
console.log('Successfully wrote src/services/devPlanData.js with date helpers!');
