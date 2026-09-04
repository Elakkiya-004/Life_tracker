// Local Storage Service with Seed Data and Backup/Restore capabilities
import { DEFAULT_ROADMAP } from './roadmapData';
import { DEFAULT_CUSTOM_LISTS } from './marvelData';
import { DEFAULT_HEALTH_PROTOCOL } from './healthProtocolData';

const STORAGE_KEYS = {
  HABITS: 'life_tracker_habits_v2',
  TRANSACTIONS: 'life_tracker_transactions_v2',
  ROADMAP: 'life_tracker_roadmap',
  CUSTOM_LISTS: 'life_tracker_custom_lists_v1',
  JARS: 'life_tracker_budget_jars_v3',
  SETTINGS: 'life_tracker_settings_v2',
  HEALTH_PROTOCOL: 'life_tracker_health_protocol_v1',
  DAILY_HISTORY: 'life_tracker_daily_history_v1',
  FIREBASE_CONFIG: 'life_tracker_firebase_config',
};

// Default 7-Jar Budget System tailored for ₹18,000 Take-Home Salary (₹16k Spends + ₹2k Savings)
export const DEFAULT_JARS = [
  {
    id: 'jar-loan',
    name: 'Loan & Debt',
    category: 'Loan',
    allocated: 10000,
    color: '#ef4444',
    icon: 'Building2',
  },
  {
    id: 'jar-travel',
    name: 'Travel & Commute',
    category: 'Travel',
    allocated: 1500,
    color: '#0ea5e9',
    icon: 'Bus',
  },
  {
    id: 'jar-bills',
    name: 'Bills & Recharge',
    category: 'Bills',
    allocated: 1500,
    color: '#8b5cf6',
    icon: 'Receipt',
  },
  {
    id: 'jar-shopping',
    name: 'Shopping & Personal',
    category: 'Shopping',
    allocated: 1000,
    color: '#ec4899',
    icon: 'ShoppingBag',
  },
  {
    id: 'jar-grandma',
    name: 'Grandma Support',
    category: 'Family',
    allocated: 1000,
    color: '#3b82f6',
    icon: 'Heart',
  },
  {
    id: 'jar-snacks',
    name: 'Snacks & Outside Food',
    category: 'Food',
    allocated: 1000,
    color: '#f59e0b',
    icon: 'Coffee',
  },
  {
    id: 'jar-savings',
    name: 'Savings & Emergency Fund',
    category: 'Savings',
    allocated: 2000,
    color: '#10b981',
    icon: 'PiggyBank',
  },
];

// Clean Initial Transactions (No static dummy data)
export const DEFAULT_TRANSACTIONS = [];

// Clean Initial Habits (No static dummy data)
export const DEFAULT_HABITS = [];

export const DEFAULT_SETTINGS = {
  userName: 'Champion',
  currency: '₹', // Default in Rupees
  monthlySalary: 18000,
  monthlyBudget: 16000, // (₹16,000 monthly spend limit, ₹2,000 guaranteed saved)
  theme: 'dark',
  cloudSyncEnabled: false,
  habitRolloverMode: 'fresh_checks', // 'fresh_checks' | 'auto_clear'
};

export const getLocalData = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
};

export const setLocalData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
};

// Calculate effective tracker date with 10:30 PM (22:30) reset cutoff
export const getEffectiveTrackerDate = (dateObj = new Date()) => {
  const d = new Date(dateObj);
  const hours = d.getHours();
  const minutes = d.getMinutes();

  // If time is >= 22:30 (10:30 PM), advance the tracking date by 1 day
  if (hours > 22 || (hours === 22 && minutes >= 30)) {
    d.setDate(d.getDate() + 1);
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Clean up daily history and habit completed dates older than 30 days
export const pruneOldHistoryData = (historyObj = {}, habitsList = [], retentionDays = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];

  // Prune daily history object
  const prunedHistory = {};
  if (historyObj && typeof historyObj === 'object') {
    Object.keys(historyObj).forEach(dateStr => {
      if (dateStr >= cutoffStr) {
        prunedHistory[dateStr] = historyObj[dateStr];
      }
    });
  }

  // Prune habit completed dates safely
  const prunedHabits = Array.isArray(habitsList) 
    ? habitsList.filter(Boolean).map(h => ({
        ...h,
        completedDates: Array.isArray(h?.completedDates) 
          ? h.completedDates.filter(d => typeof d === 'string' && d >= cutoffStr) 
          : []
      })) 
    : [];

  return { prunedHistory, prunedHabits };
};

export const exportAllData = () => {
  const data = {
    version: '1.6.0',
    exportDate: new Date().toISOString(),
    habits: getLocalData(STORAGE_KEYS.HABITS, DEFAULT_HABITS),
    transactions: getLocalData(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS),
    jars: getLocalData(STORAGE_KEYS.JARS, DEFAULT_JARS),
    roadmap: getLocalData(STORAGE_KEYS.ROADMAP, DEFAULT_ROADMAP),
    customLists: getLocalData(STORAGE_KEYS.CUSTOM_LISTS, DEFAULT_CUSTOM_LISTS),
    healthProtocol: getLocalData(STORAGE_KEYS.HEALTH_PROTOCOL, DEFAULT_HEALTH_PROTOCOL),
    dailyHistory: getLocalData(STORAGE_KEYS.DAILY_HISTORY, {}),
    settings: getLocalData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `life_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const importAllData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (data.habits) setLocalData(STORAGE_KEYS.HABITS, data.habits);
    if (data.transactions) setLocalData(STORAGE_KEYS.TRANSACTIONS, data.transactions);
    if (data.jars) setLocalData(STORAGE_KEYS.JARS, data.jars);
    if (data.roadmap) setLocalData(STORAGE_KEYS.ROADMAP, data.roadmap);
    if (data.customLists) setLocalData(STORAGE_KEYS.CUSTOM_LISTS, data.customLists);
    if (data.healthProtocol) setLocalData(STORAGE_KEYS.HEALTH_PROTOCOL, data.healthProtocol);
    if (data.dailyHistory) setLocalData(STORAGE_KEYS.DAILY_HISTORY, data.dailyHistory);
    if (data.settings) setLocalData(STORAGE_KEYS.SETTINGS, data.settings);
    return { success: true, data };
  } catch (e) {
    console.error('Import failed:', e);
    return { success: false, error: e.message };
  }
};

export { STORAGE_KEYS, DEFAULT_ROADMAP, DEFAULT_CUSTOM_LISTS, DEFAULT_HEALTH_PROTOCOL };
