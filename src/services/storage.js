import { 
  DB_HEALTH_PROTOCOL_TEMPLATE as DEFAULT_HEALTH_PROTOCOL, 
  DB_CAREER_ROADMAP_TEMPLATE as DEFAULT_ROADMAP, 
  DB_MCU_WATCHLIST_TEMPLATE as DEFAULT_CUSTOM_LISTS, 
  DB_ROADMAP_OUTCOMES as ROADMAP_OUTCOMES,
  sanitizeHealthProtocol,
  seedDatabaseIfEmpty,
  saveHealthProtocolToDB,
  getHealthProtocolFromDB,
  listenToHealthProtocolDB
} from './cloudDatabase';

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
  AUTH_USER: 'life_tracker_auth_user_v1',
  USERS_DIRECTORY: 'life_tracker_users_directory_v1',
  MENU_PERMISSIONS: 'life_tracker_menu_permissions_v1',
};

// Available Menus for Super Admin Control
export const AVAILABLE_MENUS = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: 'LayoutDashboard', desc: 'Main home overview, habits progress ring, streak tracker' },
  { id: 'habits', label: 'Habits & Routines', path: '/habits', icon: 'CheckCircle2', desc: 'Daily to-do checklist, routine streaks, 10:30 PM reset' },
  { id: 'protocol', label: 'Health & Diet Protocol', path: '/health', icon: 'HeartPulse', desc: 'Intermittent fasting 16:8, water counter, meal schedule' },
  { id: 'roadmap', label: 'Career Roadmap', path: '/roadmap', icon: 'Compass', desc: '16-Week DSA, Full-Stack, React Native Excel curriculum' },
  { id: 'watchlists', label: 'MCU Watchlist', path: '/mcu', icon: 'Film', desc: 'Marvel Cinematic Universe Phase 1–6 release tracker' },
  { id: 'finance', label: 'Finance & Budget', path: '/finance', icon: 'Wallet', desc: '₹18,000 monthly take-home 7-jar budget manager' },
  { id: 'analytics', label: 'Analytics & Score', path: '/analytics', icon: 'BarChart3', desc: 'Discipline score, completion trends & monthly graphs' },
  { id: 'settings', label: 'Settings & Cloud', path: '/settings', icon: 'Settings', desc: 'Theme switcher, profile customization, cloud backup' },
];

export const DEFAULT_MENU_PERMISSIONS = {
  dashboard: true,
  habits: true,
  protocol: true,
  roadmap: true,
  watchlists: true,
  finance: true,
  analytics: true,
  settings: true,
};

// Preset avatars for quick profile picture selection
export const PRESET_AVATARS = [
  { id: 'av-1', label: 'Tech Pro', emoji: '💻', bg: 'linear-gradient(135deg, #6366f1, #a855f7)' },
  { id: 'av-2', label: 'Rocket', emoji: '🚀', bg: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
  { id: 'av-3', label: 'Lion King', emoji: '🦁', bg: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { id: 'av-4', label: 'Cyber Fox', emoji: '🦊', bg: 'linear-gradient(135deg, #f97316, #ef4444)' },
  { id: 'av-5', label: 'Crown Admin', emoji: '👑', bg: 'linear-gradient(135deg, #eab308, #ca8a04)' },
  { id: 'av-6', label: 'Diamond', emoji: '💎', bg: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
  { id: 'av-7', label: 'Health Champion', emoji: '⚡', bg: 'linear-gradient(135deg, #10b981, #059669)' },
  { id: 'av-8', label: 'Shield Defender', emoji: '🛡️', bg: 'linear-gradient(135deg, #8b5cf6, #6366f1)' },
  { id: 'av-9', label: 'Marvel Hero', emoji: '🦾', bg: 'linear-gradient(135deg, #ef4444, #991b1b)' },
  { id: 'av-10', label: 'Target Achiever', emoji: '🎯', bg: 'linear-gradient(135deg, #14b8a6, #0d9488)' },
];

// Seeded Users for RBAC Authentication System
export const DEFAULT_USERS = [
  {
    uid: 'admin-super-001',
    name: 'Super Admin',
    email: 'admin@lifetracker.com',
    password: 'admin123',
    role: 'super_admin',
    status: 'active',
    avatar: '👑',
    avatarBg: 'linear-gradient(135deg, #6366f1, #f59e0b)',
    jobTitle: 'System Administrator',
    bio: 'Oversees workspace governance and user management.',
    allowedMenus: null, // null means inherits global defaults
    createdAt: '2026-09-01T00:00:00.000Z',
    createdBy: 'System Root',
  },
  {
    uid: 'user-demo-002',
    name: 'Elakkiya',
    email: 'user@lifetracker.com',
    password: 'user123',
    role: 'user',
    status: 'active',
    avatar: '💻',
    avatarBg: 'linear-gradient(135deg, #0ea5e9, #10b981)',
    jobTitle: 'Software Engineer',
    bio: 'Dedicated to daily habits, 16-week career roadmap, and financial discipline.',
    allowedMenus: null, // null means inherits global defaults
    createdAt: '2026-09-02T00:00:00.000Z',
    createdBy: 'admin@lifetracker.com',
  }
];

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

export { 
  STORAGE_KEYS, 
  DEFAULT_ROADMAP, 
  DEFAULT_CUSTOM_LISTS, 
  DEFAULT_HEALTH_PROTOCOL, 
  ROADMAP_OUTCOMES,
  sanitizeHealthProtocol,
  seedDatabaseIfEmpty,
  saveHealthProtocolToDB,
  getHealthProtocolFromDB,
  listenToHealthProtocolDB
};
