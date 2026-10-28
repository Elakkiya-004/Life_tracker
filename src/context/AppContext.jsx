import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';

import {
  getLocalData,
  setLocalData,
  STORAGE_KEYS,
  DEFAULT_HABITS,
  DEFAULT_USERS,
  DEFAULT_JARS,
  DEFAULT_ROADMAP,
  DEFAULT_CUSTOM_LISTS,
  DEFAULT_SETTINGS,
  DEFAULT_HEALTH_PROTOCOL,
  DEV_PLAN_CONCEPTS,
  DEV_PLAN_WEEKLY_REVIEWS,
  DEV_PLAN_RESOURCES,
  DEV_PLAN_AI_WORKFLOW,
  DEFAULT_PLAN_START_DATE,
  DEFAULT_DAILY_TARGET_HOURS,
  TOTAL_PLAN_DAYS,
  formatPlanDate,
  addDaysToDate,
  recalculatePlanDates,
  shiftPlanDatesFromDay,
  updateSingleDayDate,
  swapDatesBetweenDays,
  sanitizeHealthProtocol,
  seedDatabaseIfEmpty,
  getEffectiveTrackerDate,
  pruneOldHistoryData,
  archiveAndResetHabits,
  saveTodoListToDB,
  getTodoListFromDB,
  saveDailyHistoryToDB,
  archiveDailyRecordToCloud,
  getAllDailyHistoryFromDB,
  saveWorkoutHistoryToDB,
  getWorkoutHistoryFromDB,
} from '../services/storage';

import { initFirebase, syncToCloud, listenToCloud } from '../services/firebase';
import { logSoupToDailyMeals, getLoggedMealsForDate } from '../services/nightDietSoupData';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const PATH_TO_TAB = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/admin': 'admin',
  '/habits': 'habits',
  '/health': 'protocol',
  '/protocol': 'protocol',
  '/diet': 'protocol',
  '/soups': 'soups',
  '/diet-soups': 'soups',
  '/juices': 'juices',
  '/diet-juices': 'juices',
  '/soups-juices': 'soups',
  '/exercise': 'exercise',
  '/workout': 'exercise',
  '/workouts': 'exercise',
  '/fitness': 'exercise',
  '/roadmap': 'roadmap',
  '/career': 'roadmap',
  '/mcu': 'watchlists',
  '/watchlists': 'watchlists',
  '/marvel': 'watchlists',
  '/finance': 'finance',
  '/budget': 'finance',
  '/analytics': 'analytics',
  '/settings': 'settings',
};

const TAB_TO_PATH = {
  'dashboard': '/',
  'admin': '/admin',
  'habits': '/habits',
  'protocol': '/health',
  'health': '/health',
  'soups': '/soups',
  'diet-soups': '/soups',
  'juices': '/juices',
  'diet-juices': '/juices',
  'soups-juices': '/soups',
  'exercise': '/exercise',
  'workout': '/exercise',
  'workouts': '/exercise',
  'fitness': '/exercise',
  'roadmap': '/roadmap',
  'career': '/roadmap',
  'watchlists': '/mcu',
  'mcu': '/mcu',
  'marvel': '/mcu',
  'finance': '/finance',
  'budget': '/finance',
  'analytics': '/analytics',
  'settings': '/settings',
};

const getInitialTabFromLocation = () => {
  try {
    if (typeof window !== 'undefined' && window.location) {
      const pathname = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      return PATH_TO_TAB[pathname] || 'dashboard';
    }
    return 'dashboard';
  } catch {
    return 'dashboard';
  }
};

export const AppProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.uid || DEFAULT_USERS[0]?.uid || 'admin-super-001';
  // Safe state initialization with clean defaults (No static dummy data)
  const [habits, setHabits] = useState(() => {
    try {
      const data = getLocalData(STORAGE_KEYS.HABITS, []);
      const validList = Array.isArray(data) ? data.filter(Boolean) : [];
      const cleaned = validList.filter(h => h && h.id && !['h-1', 'h-2', 'h-3', 'h-4', 'h-5', 'h-6', 'h-7', 'h-8', 'h-9', 'h-10', 'h-11', 'h-12', 'h-13', 'h-14'].includes(h.id));
      const { prunedHabits } = pruneOldHistoryData({}, cleaned, 30);
      return prunedHabits;
    } catch {
      return [];
    }
  });

  const [transactions, setTransactions] = useState(() => {
    try {
      const data = getLocalData(STORAGE_KEYS.TRANSACTIONS, []);
      const validList = Array.isArray(data) ? data.filter(Boolean) : [];
      const cleaned = validList.filter(t => t && t.id && !['t-1', 't-2', 't-3', 't-4'].includes(t.id));
      return cleaned;
    } catch {
      return [];
    }
  });

  const [jars, setJars] = useState(() => {
    try {
      const data = getLocalData(STORAGE_KEYS.JARS, null);
      if (Array.isArray(data) && data.length > 0 && data.some(j => j && j.id === 'jar-snacks')) {
        return data;
      }
      setLocalData(STORAGE_KEYS.JARS, DEFAULT_JARS);
      return DEFAULT_JARS;
    } catch {
      return DEFAULT_JARS;
    }
  });

  const mergeRoadmapWithDefaults = (existingList) => {
    if (!Array.isArray(existingList) || existingList.length < 100 || !existingList[0]?.day) {
      return DEFAULT_ROADMAP;
    }
    
    // Map through existingList to preserve all custom fields, user-completed tasks, actualMinutes, confidence, and notes
    const seenDays = new Set();
    const mergedList = [];

    existingList.forEach(day => {
      if (!day || !day.day) return;
      const defaultDay = DEFAULT_ROADMAP.find(d => d.id === day.id || d.day === day.day);
      if (!defaultDay) {
        if (!seenDays.has(day.day)) {
          seenDays.add(day.day);
          mergedList.push(day);
        }
        return;
      }
      if (!seenDays.has(defaultDay.day)) {
        seenDays.add(defaultDay.day);
        mergedList.push({
          ...defaultDay,
          ...day,
          id: defaultDay.id,
          day: defaultDay.day,
          date: day.date || defaultDay.date,
          dateRange: day.dateRange || defaultDay.dateRange,
          month: day.month || defaultDay.month,
          weekday: day.weekday || defaultDay.weekday,
          status: day.status || defaultDay.status,
          completion: day.completion || defaultDay.completion,
          actualMinutes: typeof day.actualMinutes === 'number' ? day.actualMinutes : defaultDay.actualMinutes,
          confidence: typeof day.confidence === 'number' ? day.confidence : defaultDay.confidence,
          completedTasks: Array.isArray(day.completedTasks) ? day.completedTasks : (defaultDay.completedTasks || []),
          notes: day.notes !== undefined ? day.notes : (defaultDay.notes || ''),
          mistakesBlockers: day.mistakesBlockers !== undefined ? day.mistakesBlockers : (defaultDay.mistakesBlockers || ''),
          dsaResult: day.dsaResult !== undefined ? day.dsaResult : (defaultDay.dsaResult || ''),
          projectOutput: day.projectOutput !== undefined ? day.projectOutput : (defaultDay.projectOutput || ''),
          tomorrowsTask: day.tomorrowsTask !== undefined ? day.tomorrowsTask : (defaultDay.tomorrowsTask || ''),
        });
      }
    });

    // Ensure any default day that wasn't in existingList is added
    DEFAULT_ROADMAP.forEach(defaultDay => {
      if (!seenDays.has(defaultDay.day)) {
        seenDays.add(defaultDay.day);
        mergedList.push(defaultDay);
      }
    });

    return mergedList.sort((a, b) => a.day - b.day);
  };

  const [roadmap, setRoadmap] = useState(() => {
    try {
      const data = getLocalData(STORAGE_KEYS.ROADMAP, null);
      const merged = mergeRoadmapWithDefaults(data);
      setLocalData(STORAGE_KEYS.ROADMAP, merged);
      return merged;
    } catch {
      return DEFAULT_ROADMAP;
    }
  });

  const [customLists, setCustomLists] = useState(() => {
    try {
      const data = getLocalData(STORAGE_KEYS.CUSTOM_LISTS, null);
      if (Array.isArray(data) && data.length > 0 && data.some(l => l && Array.isArray(l.items) && l.items.length > 0)) {
        const needsUpgrade = data.some(l => l && l.id === 'list-mcu-doomsday' && Array.isArray(l.items) && l.items.length < 72);
        if (needsUpgrade) {
          const upgraded = data.map(list => {
            if (list && list.id === 'list-mcu-doomsday') {
              const watchedMap = new Map();
              (list.items || []).forEach(i => {
                if (i && i.title) {
                  const key = i.title.toLowerCase().replace(/\s*\(\d{4}\)/, '').trim();
                  watchedMap.set(key, i.status);
                }
              });
              const freshItems = DEFAULT_CUSTOM_LISTS[0].items.map(fresh => {
                const cleanKey = fresh.title.toLowerCase().replace(/\s*\(\d{4}\)/, '').trim();
                const existingStatus = watchedMap.get(cleanKey);
                return existingStatus ? { ...fresh, status: existingStatus } : fresh;
              });
              return { ...DEFAULT_CUSTOM_LISTS[0], items: freshItems };
            }
            return list;
          });
          setLocalData(STORAGE_KEYS.CUSTOM_LISTS, upgraded);
          return upgraded;
        }
        return data;
      }
      setLocalData(STORAGE_KEYS.CUSTOM_LISTS, DEFAULT_CUSTOM_LISTS);
      return DEFAULT_CUSTOM_LISTS;
    } catch {
      return DEFAULT_CUSTOM_LISTS;
    }
  });

  const [healthProtocol, setHealthProtocol] = useState(() => {
    const uid = currentUser?.uid || DEFAULT_USERS[0]?.uid || 'admin-super-001';
    const userKey = `${STORAGE_KEYS.HEALTH_PROTOCOL}_${uid}`;
    const data = getLocalData(userKey, null);
    if (data && typeof data === 'object') {
      return sanitizeHealthProtocol(data);
    }
    return DEFAULT_HEALTH_PROTOCOL;
  });

  // Reload protocol when current user switches
  useEffect(() => {
    const uid = currentUser?.uid || DEFAULT_USERS[0]?.uid || 'admin-super-001';
    const userKey = `${STORAGE_KEYS.HEALTH_PROTOCOL}_${uid}`;
    const saved = getLocalData(userKey, null);
    if (saved && typeof saved === 'object') {
      setHealthProtocol(sanitizeHealthProtocol(saved));
    } else {
      setHealthProtocol(DEFAULT_HEALTH_PROTOCOL);
    }
  }, [currentUser?.uid]);

  const [dailyHistory, setDailyHistory] = useState(() => {
    const data = getLocalData(STORAGE_KEYS.DAILY_HISTORY, {});
    const { prunedHistory } = pruneOldHistoryData(data, [], 30);
    return prunedHistory;
  });

  const [dailyHabitNotes, setDailyHabitNotes] = useState(() => {
    try {
      const data = getLocalData(STORAGE_KEYS.HABIT_DAILY_NOTES, {});
      return (data && typeof data === 'object') ? data : {};
    } catch {
      return {};
    }
  });

  const saveHabitDailyNote = useCallback((dateStr, noteData) => {
    if (!dateStr) return;
    setDailyHabitNotes(prev => {
      const existing = prev[dateStr] || {};
      const updated = {
        ...prev,
        [dateStr]: {
          ...existing,
          ...noteData,
          date: dateStr,
          updatedAt: new Date().toISOString(),
        }
      };
      setLocalData(STORAGE_KEYS.HABIT_DAILY_NOTES, updated);
      return updated;
    });
  }, []);

  const getHabitDailyNote = useCallback((dateStr) => {
    return dailyHabitNotes[dateStr] || null;
  }, [dailyHabitNotes]);

  const deleteHabitDailyNote = useCallback((dateStr) => {
    if (!dateStr) return;
    setDailyHabitNotes(prev => {
      const nextNotes = { ...prev };
      delete nextNotes[dateStr];
      setLocalData(STORAGE_KEYS.HABIT_DAILY_NOTES, nextNotes);
      return nextNotes;
    });
  }, []);

  const [workoutHistory, setWorkoutHistory] = useState(() => {
    return getLocalData(STORAGE_KEYS.WORKOUT_HISTORY, []);
  });

  const [settings, setSettings] = useState(() => {
    const data = getLocalData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    const resolved = data && typeof data === 'object' ? { ...DEFAULT_SETTINGS, ...data } : DEFAULT_SETTINGS;
    // Ensure default rollover mode is auto_clear
    if (!resolved.habitRolloverMode) {
      resolved.habitRolloverMode = 'auto_clear';
    }
    return resolved;
  });

  const settingsRef = useRef(settings);
  const jarsRef = useRef(jars);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    jarsRef.current = jars;
  }, [jars]);
  
  // Real browser URL routing state (Supports /habits, /health, /roadmap, /mcu, /finance, etc.)
  const [activeTab, setActiveTabState] = useState(() => getInitialTabFromLocation());
  const [syncStatus, setSyncStatus] = useState('local'); // 'local' | 'synced' | 'syncing' | 'error'
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Sync activeTab changes to browser URL bar
  const setActiveTab = useCallback((tabOrPath, shouldPushState = true) => {
    const tabId = PATH_TO_TAB[tabOrPath] || tabOrPath || 'dashboard';
    setActiveTabState(tabId);
    if (shouldPushState && typeof window !== 'undefined' && window.history) {
      const targetPath = TAB_TO_PATH[tabId] || `/${tabId}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ tab: tabId }, '', targetPath);
      }
    }
  }, []);

  // Listen for browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const currentTab = getInitialTabFromLocation();
      setActiveTabState(currentTab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Trigger Confetti effect
  const triggerCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'],
      });
    } catch {
      // Ignore if confetti not supported
    }
  }, []);

  // Sync to Firebase helper (Defined before any useEffect hook)
  const pushToCloud = useCallback(async (customPayload = null) => {
    setSyncStatus('syncing');
    const effectiveDate = getEffectiveTrackerDate();
    const payload = {
      habits: habits || [],
      todos: habits || [],
      transactions: transactions || [],
      jars: jarsRef.current || jars || DEFAULT_JARS,
      roadmap: roadmap || DEFAULT_ROADMAP,
      customLists: customLists || DEFAULT_CUSTOM_LISTS,
      healthProtocol: healthProtocol || DEFAULT_HEALTH_PROTOCOL,
      dailyHistory: dailyHistory || {},
      dailyHabitNotes: dailyHabitNotes || {},
      workoutHistory: workoutHistory || [],
      settings: settingsRef.current || settings || DEFAULT_SETTINGS,
      lastTrackerDate: effectiveDate,
      ...(customPayload || {}),
    };
    if (!payload.lastTrackerDate) {
      payload.lastTrackerDate = effectiveDate;
    }
    const res = await syncToCloud(currentUserId, payload);
    if (res.success) {
      setSyncStatus('synced');
    } else {
      setSyncStatus(res.reason === 'offline_mode' ? 'local' : 'error');
    }
  }, [currentUserId, habits, transactions, jars, roadmap, customLists, healthProtocol, dailyHistory, dailyHabitNotes, workoutHistory, settings]);

  // Dynamic tracker date with 22:15 IST (10:15 PM) auto-reset cutoff for next day
  const [todayStr, setTodayStr] = useState(() => getEffectiveTrackerDate());

  // Daily Logged Meals for Calorie Tracking & Habit Integration
  const [dailyMeals, setDailyMeals] = useState(() => {
    return getLoggedMealsForDate(todayStr, currentUserId);
  });

  // Sync dailyMeals on date change, user change, or meal update events
  useEffect(() => {
    setDailyMeals(getLoggedMealsForDate(todayStr, currentUserId));

    const handleMealUpdate = (e) => {
      if (e?.detail?.meals) {
        setDailyMeals(e.detail.meals);
      } else {
        setDailyMeals(getLoggedMealsForDate(todayStr, currentUserId));
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('life_tracker_meals_updated', handleMealUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('life_tracker_meals_updated', handleMealUpdate);
      }
    };
  }, [todayStr, currentUserId]);

  // Today's total consumed calories calculated from dailyMeals
  const todayCaloriesConsumed = useMemo(() => {
    return (dailyMeals || []).reduce((sum, m) => sum + Math.round((m.calories || 0) * (m.multiplier || 1)), 0);
  }, [dailyMeals]);

  // Startup Tracker Date Initialization (Safe: does not wipe habits before Cloud connects)
  useEffect(() => {
    const currentEffectiveDate = getEffectiveTrackerDate();
    const lastTrackerDate = getLocalData(STORAGE_KEYS.LAST_TRACKER_DATE, null);

    if (!lastTrackerDate) {
      setLocalData(STORAGE_KEYS.LAST_TRACKER_DATE, currentEffectiveDate);
    }
  }, []);

  // Proactively fetch latest habits from Cloud Database on mount or user change
  useEffect(() => {
    let isCancelled = false;
    getTodoListFromDB(currentUserId).then((dbHabits) => {
      if (!isCancelled && Array.isArray(dbHabits) && dbHabits.length > 0) {
        setHabits(dbHabits);
        setLocalData(STORAGE_KEYS.HABITS, dbHabits);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [currentUserId]);

  // Live timer: auto-advance, archive previous tasks into history & Cloud DB at 22:15 IST
  useEffect(() => {
    const checkTimer = setInterval(() => {
      const currentEffectiveDate = getEffectiveTrackerDate();
      if (todayStr !== currentEffectiveDate) {
        console.log(`🌙 22:15 IST Transition: ${todayStr} -> ${currentEffectiveDate}`);
        const currentHabits = Array.isArray(habits) ? habits : [];
        const mode = settings?.habitRolloverMode || 'auto_clear';
        const { updatedHistory, clearedHabits } = archiveAndResetHabits(currentHabits, todayStr, dailyHistory, mode);

        setDailyHistory(updatedHistory);
        setLocalData(STORAGE_KEYS.DAILY_HISTORY, updatedHistory);
        setHabits(clearedHabits);
        setLocalData(STORAGE_KEYS.HABITS, clearedHabits);

        // Permanently archive transitioned day to Cloud DB subcollection
        if (updatedHistory[todayStr]) {
          archiveDailyRecordToCloud(currentUserId, todayStr, updatedHistory[todayStr]);
        }
        saveTodoListToDB(currentUserId, clearedHabits);

        pushToCloud({
          habits: clearedHabits,
          todos: clearedHabits,
          dailyHistory: updatedHistory,
          dailyHabitNotes,
          lastTrackerDate: currentEffectiveDate,
          transactions, jars, roadmap, customLists, healthProtocol, settings
        });

        setLocalData(STORAGE_KEYS.LAST_TRACKER_DATE, currentEffectiveDate);
        setTodayStr(currentEffectiveDate);
      }
    }, 5000);

    return () => clearInterval(checkTimer);
  }, [todayStr, habits, dailyHistory, dailyHabitNotes, transactions, jars, roadmap, customLists, healthProtocol, settings, currentUserId, pushToCloud]);

  // Apply Theme class to document root
  useEffect(() => {
    const theme = settings?.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, [settings?.theme]);

  // Save to LocalStorage on changes
  useEffect(() => {
    if (Array.isArray(habits)) setLocalData(STORAGE_KEYS.HABITS, habits);
  }, [habits]);

  useEffect(() => {
    if (Array.isArray(transactions)) setLocalData(STORAGE_KEYS.TRANSACTIONS, transactions);
  }, [transactions]);

  useEffect(() => {
    if (Array.isArray(jars)) setLocalData(STORAGE_KEYS.JARS, jars);
  }, [jars]);

  useEffect(() => {
    if (Array.isArray(roadmap)) setLocalData(STORAGE_KEYS.ROADMAP, roadmap);
  }, [roadmap]);

  useEffect(() => {
    if (Array.isArray(customLists)) setLocalData(STORAGE_KEYS.CUSTOM_LISTS, customLists);
  }, [customLists]);

  useEffect(() => {
    if (healthProtocol) {
      const uid = currentUser?.uid || 'default_user';
      setLocalData(`${STORAGE_KEYS.HEALTH_PROTOCOL}_${uid}`, healthProtocol);
    }
  }, [healthProtocol, currentUser?.uid]);

  useEffect(() => {
    if (dailyHistory) setLocalData(STORAGE_KEYS.DAILY_HISTORY, dailyHistory);
  }, [dailyHistory]);

  useEffect(() => {
    if (settings) setLocalData(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  useEffect(() => {
    if (Array.isArray(workoutHistory)) {
      setLocalData(STORAGE_KEYS.WORKOUT_HISTORY, workoutHistory);
    }
  }, [workoutHistory]);

  // Initialize Firebase and real-time cloud sync
  useEffect(() => {
    const fbResult = initFirebase();
    if (fbResult.success) {
      setSyncStatus('synced');
      seedDatabaseIfEmpty();

      const unsubscribe = listenToCloud(currentUserId, (cloudData) => {
        if (!cloudData) return;
        const currentEffectiveDate = getEffectiveTrackerDate();

        // 1. Sync dailyHistory (merge local + cloud for permanent analytics)
        let mergedHist = { ...(getLocalData(STORAGE_KEYS.DAILY_HISTORY, {}) || {}) };
        if (cloudData.dailyHistory && typeof cloudData.dailyHistory === 'object') {
          mergedHist = { ...mergedHist, ...cloudData.dailyHistory };
          setDailyHistory(mergedHist);
          setLocalData(STORAGE_KEYS.DAILY_HISTORY, mergedHist);
        }

        // 2. Sync dailyHabitNotes (merge local + cloud reflections)
        if (cloudData.dailyHabitNotes && typeof cloudData.dailyHabitNotes === 'object') {
          setDailyHabitNotes(prev => {
            const mergedNotes = { ...(prev || {}), ...cloudData.dailyHabitNotes };
            setLocalData(STORAGE_KEYS.HABIT_DAILY_NOTES, mergedNotes);
            return mergedNotes;
          });
        }

        // 3. To-Do List & Habits: Intelligently merge without losing data
        const cloudTrackerDate = cloudData.lastTrackerDate;
        const cloudHabits = Array.isArray(cloudData.todos)
          ? cloudData.todos
          : (Array.isArray(cloudData.habits) ? cloudData.habits : []);
        const localHabits = getLocalData(STORAGE_KEYS.HABITS, []);

        if (cloudTrackerDate && cloudTrackerDate !== currentEffectiveDate && cloudHabits.length > 0) {
          const mode = cloudData.settings?.habitRolloverMode || settings?.habitRolloverMode || 'auto_clear';
          const { updatedHistory, clearedHabits } = archiveAndResetHabits(cloudHabits, cloudTrackerDate, mergedHist, mode);
          setDailyHistory(updatedHistory);
          setLocalData(STORAGE_KEYS.DAILY_HISTORY, updatedHistory);
          setHabits(clearedHabits);
          setLocalData(STORAGE_KEYS.HABITS, clearedHabits);
          setLocalData(STORAGE_KEYS.LAST_TRACKER_DATE, currentEffectiveDate);
          if (updatedHistory[cloudTrackerDate]) {
            archiveDailyRecordToCloud(currentUserId, cloudTrackerDate, updatedHistory[cloudTrackerDate]);
          }
          saveTodoListToDB(currentUserId, clearedHabits);
          syncToCloud(currentUserId, { habits: clearedHabits, todos: clearedHabits, dailyHistory: updatedHistory, lastTrackerDate: currentEffectiveDate });
        } else if (cloudData.habitsClearedAt && Array.isArray(cloudData.habits) && cloudData.habits.length === 0) {
          // Cloud has an explicit fresh clear signal: respect it!
          setHabits([]);
          setLocalData(STORAGE_KEYS.HABITS, []);
        } else if (cloudHabits.length > 0) {
          // Cloud has habits: Cloud database is authoritative single source of truth!
          setHabits(cloudHabits);
          setLocalData(STORAGE_KEYS.HABITS, cloudHabits);
          setLocalData(STORAGE_KEYS.LAST_TRACKER_DATE, currentEffectiveDate);
        } else if (Array.isArray(localHabits) && localHabits.length > 0) {
          // Cloud is empty / initial state: preserve local to-dos and upload to Cloud DB!
          setHabits(localHabits);
          saveTodoListToDB(currentUserId, localHabits, currentEffectiveDate);
          syncToCloud(currentUserId, { habits: localHabits, todos: localHabits, lastTrackerDate: currentEffectiveDate });
        } else if (Array.isArray(cloudData.habits) && cloudData.habits.length === 0) {
          // Cloud has explicit empty list and local is empty, keep clean slate
          setHabits([]);
          setLocalData(STORAGE_KEYS.HABITS, []);
        }
        if (Array.isArray(cloudData.transactions)) setTransactions(cloudData.transactions);
        if (Array.isArray(cloudData.jars)) {
          const isOldDefault = !cloudData.jars.some(j => j && j.id === 'jar-snacks');
          if (isOldDefault) {
            jarsRef.current = DEFAULT_JARS;
            setJars(DEFAULT_JARS);
            setLocalData(STORAGE_KEYS.JARS, DEFAULT_JARS);
            syncToCloud(currentUserId, { jars: DEFAULT_JARS });
          } else {
            jarsRef.current = cloudData.jars;
            setJars(cloudData.jars);
            setLocalData(STORAGE_KEYS.JARS, cloudData.jars);
          }
        }
        if (Array.isArray(cloudData.roadmap) && cloudData.roadmap.length > 0) {
          const merged = mergeRoadmapWithDefaults(cloudData.roadmap);
          setRoadmap(merged);
          setLocalData(STORAGE_KEYS.ROADMAP, merged);
        } else if (!cloudData.roadmap) {
          setRoadmap(DEFAULT_ROADMAP);
          setLocalData(STORAGE_KEYS.ROADMAP, DEFAULT_ROADMAP);
          syncToCloud(currentUserId, { roadmap: DEFAULT_ROADMAP });
        }

        if (Array.isArray(cloudData.customLists) && cloudData.customLists.length > 0 && cloudData.customLists.some(l => l && Array.isArray(l.items) && l.items.length > 0)) {
          const needsUpgrade = cloudData.customLists.some(l => l && l.id === 'list-mcu-doomsday' && Array.isArray(l.items) && l.items.length < 72);
          if (needsUpgrade) {
            const upgraded = cloudData.customLists.map(list => {
              if (list && list.id === 'list-mcu-doomsday') {
                const watchedMap = new Map();
                (list.items || []).forEach(i => {
                  if (i && i.title) {
                    const key = i.title.toLowerCase().replace(/\s*\(\d{4}\)/, '').trim();
                    watchedMap.set(key, i.status);
                  }
                });
                const freshItems = DEFAULT_CUSTOM_LISTS[0].items.map(fresh => {
                  const cleanKey = fresh.title.toLowerCase().replace(/\s*\(\d{4}\)/, '').trim();
                  const existingStatus = watchedMap.get(cleanKey);
                  return existingStatus ? { ...fresh, status: existingStatus } : fresh;
                });
                return { ...DEFAULT_CUSTOM_LISTS[0], items: freshItems };
              }
              return list;
            });
            setCustomLists(upgraded);
            setLocalData(STORAGE_KEYS.CUSTOM_LISTS, upgraded);
            syncToCloud(currentUserId, { customLists: upgraded });
          } else {
            setCustomLists(cloudData.customLists);
            setLocalData(STORAGE_KEYS.CUSTOM_LISTS, cloudData.customLists);
          }
        } else if (!cloudData.customLists || cloudData.customLists.length === 0) {
          syncToCloud(currentUserId, { customLists: DEFAULT_CUSTOM_LISTS });
        }

        if (cloudData.healthProtocol) {
          const clean = sanitizeHealthProtocol(cloudData.healthProtocol);
          setHealthProtocol(clean);
          setLocalData(`${STORAGE_KEYS.HEALTH_PROTOCOL}_${currentUserId}`, clean);
        }
        if (Array.isArray(cloudData.workoutHistory)) {
          setWorkoutHistory(cloudData.workoutHistory);
          setLocalData(STORAGE_KEYS.WORKOUT_HISTORY, cloudData.workoutHistory);
        }
        if (cloudData.settings) {
          setSettings(prev => {
            const merged = { ...(prev || DEFAULT_SETTINGS), ...cloudData.settings };
            settingsRef.current = merged;
            setLocalData(STORAGE_KEYS.SETTINGS, merged);
            return merged;
          });
        }
      });

      return () => unsubscribe && unsubscribe();
    } else {
      setSyncStatus('local');
    }
  }, [currentUserId]);

  // Real-time synchronization of today's habits into Daily Progress History & Cloud DB
  const syncTodayIntoDailyHistory = useCallback((habitsList, dateStr = todayStr) => {
    const list = Array.isArray(habitsList) ? habitsList : [];
    const completedTasks = list.filter(h => h && Array.isArray(h.completedDates) && h.completedDates.includes(dateStr));
    const total = list.length;
    const completed = completedTasks.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const archivedTasks = list.map(h => ({
      id: h.id,
      name: h.name,
      category: h.category || 'General',
      timeOfDay: h.timeOfDay || 'Morning',
      color: h.color || '#6366f1',
      icon: h.icon || 'CheckCircle2',
      isCompleted: Array.isArray(h.completedDates) && h.completedDates.includes(dateStr),
      streak: h.streak || 0,
      targetDays: h.targetDays || 7,
      completedDates: Array.isArray(h.completedDates) ? h.completedDates : []
    }));

    if (total > 0) {
      const daySummary = {
        date: dateStr,
        total,
        completed,
        percent,
        tasks: archivedTasks,
        updatedAt: new Date().toISOString()
      };
      setDailyHistory(prev => {
        const updated = {
          ...(prev || {}),
          [dateStr]: daySummary
        };
        setLocalData(STORAGE_KEYS.DAILY_HISTORY, updated);
        return updated;
      });
      // Archive permanently to Cloud Firestore subcollection for future analytics
      archiveDailyRecordToCloud(currentUserId, dateStr, daySummary);
    }
  }, [todayStr, currentUserId]);

  // Habit Operations
  const toggleHabit = (habitId, dateStr = todayStr) => {
    // If toggling a task in past archived history:
    if (dateStr !== todayStr && dailyHistory && dailyHistory[dateStr]) {
      const entry = dailyHistory[dateStr];
      const tasks = Array.isArray(entry.tasks) ? [...entry.tasks] : [];
      const taskIndex = tasks.findIndex(t => t.id === habitId);
      if (taskIndex >= 0) {
        const target = { ...tasks[taskIndex], isCompleted: !tasks[taskIndex].isCompleted };
        tasks[taskIndex] = target;
        const total = tasks.length;
        const completed = tasks.filter(t => t.isCompleted).length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        const updatedHist = {
          ...dailyHistory,
          [dateStr]: {
            ...entry,
            total,
            completed,
            percent,
            tasks,
            updatedAt: new Date().toISOString()
          }
        };
        setDailyHistory(updatedHist);
        setLocalData(STORAGE_KEYS.DAILY_HISTORY, updatedHist);
        pushToCloud({ habits, transactions, jars, roadmap, customLists, healthProtocol, dailyHistory: updatedHist, settings });
        return;
      }
    }

    setHabits(prevHabits => {
      const list = Array.isArray(prevHabits) ? prevHabits : DEFAULT_HABITS;
      const updated = list.map(h => {
        if (!h || h.id !== habitId) return h;
        const isCompleted = Array.isArray(h.completedDates) && h.completedDates.includes(dateStr);
        let newDates = Array.isArray(h.completedDates) ? [...h.completedDates] : [];

        if (isCompleted) {
          newDates = newDates.filter(d => d !== dateStr);
        } else {
          if (!newDates.includes(dateStr)) {
            newDates.push(dateStr);
          }
        }

        let streak = 0;
        let checkDate = new Date(todayStr + 'T00:00:00');
        while (true) {
          const year = checkDate.getFullYear();
          const month = String(checkDate.getMonth() + 1).padStart(2, '0');
          const day = String(checkDate.getDate()).padStart(2, '0');
          const formatted = `${year}-${month}-${day}`;

          if (newDates.includes(formatted)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            if (streak === 0 && formatted === todayStr) {
              checkDate.setDate(checkDate.getDate() - 1);
              const prevYear = checkDate.getFullYear();
              const prevMonth = String(checkDate.getMonth() + 1).padStart(2, '0');
              const prevDay = String(checkDate.getDate()).padStart(2, '0');
              const yesterdayFormatted = `${prevYear}-${prevMonth}-${prevDay}`;
              if (newDates.includes(yesterdayFormatted)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
                continue;
              }
            }
            break;
          }
        }

        return {
          ...h,
          completedDates: newDates,
          streak: Math.max(0, streak),
        };
      });

      const totalToday = updated.length;
      const completedToday = updated.filter(h => h && Array.isArray(h.completedDates) && h.completedDates.includes(todayStr)).length;
      if (totalToday > 0 && completedToday === totalToday) {
        triggerCelebration();
      }

      setLocalData(STORAGE_KEYS.HABITS, updated);
      syncTodayIntoDailyHistory(updated, todayStr);
      saveTodoListToDB(currentUserId, updated);
      pushToCloud({ habits: updated, todos: updated, transactions, jars, roadmap, customLists, healthProtocol, dailyHistory, dailyHabitNotes, settings });
      return updated;
    });
  };

  const addHabit = (habitData) => {
    if (!habitData || !habitData.name) return;
    const newHabit = {
      id: `h-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: habitData.name.trim(),
      category: habitData.category || 'Morning',
      timeOfDay: habitData.timeOfDay || 'Morning',
      icon: habitData.icon || 'Sunrise',
      color: habitData.color || '#f59e0b',
      frequency: habitData.frequency || 'daily',
      targetDays: habitData.targetDays || 7,
      completedDates: [],
      streak: 0,
      createdAt: new Date().toISOString(),
    };
    setHabits(prevHabits => {
      const currentHabits = Array.isArray(prevHabits) ? prevHabits : [];
      const updated = [newHabit, ...currentHabits];
      setLocalData(STORAGE_KEYS.HABITS, updated);
      syncTodayIntoDailyHistory(updated, todayStr);
      saveTodoListToDB(currentUserId, updated);
      pushToCloud({ habits: updated, todos: updated, transactions, jars, roadmap, customLists, healthProtocol, dailyHistory, dailyHabitNotes, settings });
      return updated;
    });
  };

  const updateHabit = (id, habitData) => {
    setHabits(prevHabits => {
      const currentHabits = Array.isArray(prevHabits) ? prevHabits : [];
      const updated = currentHabits.map(h => h.id === id ? { ...h, ...habitData } : h);
      setLocalData(STORAGE_KEYS.HABITS, updated);
      syncTodayIntoDailyHistory(updated, todayStr);
      saveTodoListToDB(currentUserId, updated);
      pushToCloud({ habits: updated, todos: updated, transactions, jars, roadmap, customLists, healthProtocol, dailyHistory, dailyHabitNotes, settings });
      return updated;
    });
  };

  const deleteHabit = (id) => {
    setHabits(prevHabits => {
      const currentHabits = Array.isArray(prevHabits) ? prevHabits : [];
      const habitToDelete = currentHabits.find(h => h.id === id);
      const updated = currentHabits.filter(h => h.id !== id);

      // If deleting a habit that was a logged diet item (soup or juice), also remove from today's meals & calories!
      if (habitToDelete && habitToDelete.name) {
        try {
          const habitClean = habitToDelete.name.toLowerCase().replace(/^(have|drink)\s+/i, '').replace(/\s*\(\d+\s*kcal\)/i, '').trim();
          const key = `life_tracker_meals_${currentUserId}_${todayStr}`;
          const raw = localStorage.getItem(key);
          const existingMeals = raw ? JSON.parse(raw) : [];
          const updatedMeals = existingMeals.filter(m => {
            if (!m || !m.name) return true;
            const mealClean = m.name.toLowerCase().trim();
            return !habitClean.includes(mealClean) && !mealClean.includes(habitClean);
          });
          if (updatedMeals.length !== existingMeals.length) {
            localStorage.setItem(key, JSON.stringify(updatedMeals));
            setDailyMeals(updatedMeals);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('life_tracker_meals_updated', {
                detail: { dateStr: todayStr, userId: currentUserId, meals: updatedMeals }
              }));
            }
            syncToCloud(currentUserId, {
              [`dailyMeals_${todayStr}`]: updatedMeals,
              lastMealLoggedAt: new Date().toISOString()
            });
          }
        } catch (e) {
          console.error('Failed to sync meal removal on deleteHabit:', e);
        }
      }

      setLocalData(STORAGE_KEYS.HABITS, updated);
      syncTodayIntoDailyHistory(updated, todayStr);
      saveTodoListToDB(currentUserId, updated);
      pushToCloud({ habits: updated, todos: updated, transactions, jars, roadmap, customLists, healthProtocol, dailyHistory, dailyHabitNotes, settings });
      return updated;
    });
  };

  const reorderHabits = (newOrderedHabits) => {
    if (!Array.isArray(newOrderedHabits)) return;
    setHabits(newOrderedHabits);
    setLocalData(STORAGE_KEYS.HABITS, newOrderedHabits);
    syncTodayIntoDailyHistory(newOrderedHabits, todayStr);
    saveTodoListToDB(currentUserId, newOrderedHabits);
    pushToCloud({ habits: newOrderedHabits, todos: newOrderedHabits, transactions, jars, roadmap, customLists, healthProtocol, dailyHistory, dailyHabitNotes, settings });
  };

  const moveHabit = (draggedId, targetId, position = 'before') => {
    setHabits(prevHabits => {
      const currentHabits = Array.isArray(prevHabits) ? prevHabits : [];
      const sourceIndex = currentHabits.findIndex(h => h.id === draggedId);
      const targetIndex = currentHabits.findIndex(h => h.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return prevHabits;

      const newHabits = [...currentHabits];
      const [movedItem] = newHabits.splice(sourceIndex, 1);
      const newTargetIndex = newHabits.findIndex(h => h.id === targetId);
      const insertIndex = position === 'after' ? newTargetIndex + 1 : newTargetIndex;
      newHabits.splice(insertIndex, 0, movedItem);

      setLocalData(STORAGE_KEYS.HABITS, newHabits);
      syncTodayIntoDailyHistory(newHabits, todayStr);
      saveTodoListToDB(currentUserId, newHabits);
      pushToCloud({ habits: newHabits, todos: newHabits, transactions, jars, roadmap, customLists, healthProtocol, dailyHistory, dailyHabitNotes, settings });
      return newHabits;
    });
  };

  const bulkDeleteHabits = (habitIds = []) => {
    if (!Array.isArray(habitIds) || habitIds.length === 0) return;
    const idSet = new Set(habitIds);
    setHabits(prevHabits => {
      const currentHabits = Array.isArray(prevHabits) ? prevHabits : [];
      const updated = currentHabits.filter(h => !idSet.has(h.id));
      setLocalData(STORAGE_KEYS.HABITS, updated);
      syncTodayIntoDailyHistory(updated, todayStr);
      saveTodoListToDB(currentUserId, updated);
      pushToCloud({ habits: updated, todos: updated, transactions, jars, roadmap, customLists, healthProtocol, dailyHistory, dailyHabitNotes, settings });
      return updated;
    });
  };

  const clearAllHabits = async () => {
    // 1. Archive current habits into daily progress history if any were completed
    if (Array.isArray(habits) && habits.length > 0) {
      syncTodayIntoDailyHistory(habits, todayStr);
    }

    // 2. Clear state and local storage immediately
    setHabits([]);
    setLocalData(STORAGE_KEYS.HABITS, []);

    // 3. Clear today's meals & calories so app is truly fresh
    try {
      const key = `life_tracker_meals_${currentUserId}_${todayStr}`;
      localStorage.removeItem(key);
      setDailyMeals([]);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('life_tracker_meals_updated', {
          detail: { dateStr: todayStr, userId: currentUserId, meals: [] }
        }));
      }
    } catch (e) {
      console.warn('Error clearing daily meals:', e);
    }

    // 4. Force update Cloud Firestore so cloud never resurrects them
    await saveTodoListToDB(currentUserId, []);
    await syncToCloud(currentUserId, {
      habits: [],
      todos: [],
      todoCount: 0,
      [`dailyMeals_${todayStr}`]: [],
      lastTrackerDate: todayStr,
      habitsClearedAt: new Date().toISOString(),
    });

    return true;
  };

  const resetHabitsToDefault = () => {
    setHabits(DEFAULT_HABITS);
    setLocalData(STORAGE_KEYS.HABITS, DEFAULT_HABITS);
    saveTodoListToDB(currentUserId, DEFAULT_HABITS);
    pushToCloud({ habits: DEFAULT_HABITS, todos: DEFAULT_HABITS, transactions, jars, roadmap, customLists, healthProtocol, dailyHistory, dailyHabitNotes, settings });
  };

  const markAllHabitsToday = (targetDate = todayStr) => {
    const effectiveDate = targetDate || getEffectiveTrackerDate();
    setHabits(prevHabits => {
      const list = Array.isArray(prevHabits) ? prevHabits : [];
      const updated = list.map(h => {
        if (!h) return h;
        const prevDates = Array.isArray(h.completedDates) ? [...h.completedDates] : [];
        if (!prevDates.includes(effectiveDate)) {
          prevDates.push(effectiveDate);
        }

        // Re-calculate streak accurately
        let streak = 0;
        let checkDate = new Date(effectiveDate + 'T00:00:00');
        while (true) {
          const y = checkDate.getFullYear();
          const m = String(checkDate.getMonth() + 1).padStart(2, '0');
          const d = String(checkDate.getDate()).padStart(2, '0');
          const fmt = `${y}-${m}-${d}`;
          if (prevDates.includes(fmt)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        return {
          ...h,
          completedDates: prevDates,
          streak: Math.max(1, streak),
        };
      });

      setLocalData(STORAGE_KEYS.HABITS, updated);
      syncTodayIntoDailyHistory(updated, effectiveDate);
      saveTodoListToDB(currentUserId, updated);
      triggerCelebration();
      pushToCloud({ habits: updated, todos: updated, transactions, jars, roadmap, customLists, healthProtocol, dailyHistory, dailyHabitNotes, settings });
      return updated;
    });
  };

  const resetAllHabitsToday = (targetDate = todayStr) => {
    const effectiveDate = targetDate || getEffectiveTrackerDate();
    const localToday = new Date().toISOString().split('T')[0];
    const targetDatesToRemove = new Set([effectiveDate, todayStr, localToday]);

    setHabits(prevHabits => {
      const list = Array.isArray(prevHabits) ? prevHabits : [];
      const updated = list.map(h => {
        if (!h) return h;
        const prevDates = Array.isArray(h.completedDates) ? h.completedDates : [];
        const newDates = prevDates.filter(d => !targetDatesToRemove.has(d));

        // Re-calculate streak from newDates backwards from effectiveDate
        let streak = 0;
        let checkDate = new Date(effectiveDate + 'T00:00:00');
        checkDate.setDate(checkDate.getDate() - 1);
        while (true) {
          const y = checkDate.getFullYear();
          const m = String(checkDate.getMonth() + 1).padStart(2, '0');
          const d = String(checkDate.getDate()).padStart(2, '0');
          const fmt = `${y}-${m}-${d}`;
          if (newDates.includes(fmt)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        return {
          ...h,
          completedDates: newDates,
          streak: Math.max(0, streak),
        };
      });

      setLocalData(STORAGE_KEYS.HABITS, updated);
      syncTodayIntoDailyHistory(updated, effectiveDate);
      saveTodoListToDB(currentUserId, updated);
      pushToCloud({ habits: updated, todos: updated, transactions, jars, roadmap, customLists, healthProtocol, dailyHistory, dailyHabitNotes, settings });
      return updated;
    });
  };

  /**
   * Logs a diet juice or soup meal, reflecting in:
   * 1. Calorie Calculation & Meals Tracker (added to consumed calories and macros)
   * 2. Daily Habits checklist (listed in today's tasks as pending, for MANUAL ticking by user)
   */
  const logDietItem = ({ item, mealType = null, isCompleted = false }) => {
    if (!item) return { success: false };

    // 1. Log to Calorie Calculator meals in storage & cloud
    const mealResult = logSoupToDailyMeals(item, mealType, todayStr, currentUserId);
    if (mealResult?.updatedMeals) {
      setDailyMeals(mealResult.updatedMeals);
    }

    // 2. Add or ensure entry in Daily Habits (unticked/pending so user ticks manually)
    const isJuice = item.type === 'juice' || item.id?.startsWith('juice-');
    const cleanItemName = (item.name || '').trim();

    setHabits(prevHabits => {
      const currentHabits = Array.isArray(prevHabits) ? prevHabits : [];
      // Look for existing habit matching juice/soup name
      const existingIndex = currentHabits.findIndex(h => {
        if (!h || !h.name) return false;
        const hName = h.name.toLowerCase();
        const cName = cleanItemName.toLowerCase();
        return hName.includes(cName) || cName.includes(hName.replace(/^(drink|have)\s+/i, '').replace(/\s*\(\d+.*kcal\)$/i, '').trim());
      });

      let updated;

      if (existingIndex >= 0) {
        // Habit exists: do NOT auto-complete; preserve user's existing completion state
        const existing = currentHabits[existingIndex];
        const prevDates = Array.isArray(existing.completedDates) ? existing.completedDates : [];
        let newDates = prevDates;
        if (isCompleted && !prevDates.includes(todayStr)) {
          newDates = [...prevDates, todayStr];
        }

        // Only calculate streak if isCompleted was explicitly passed as true
        let streak = existing.streak || 0;
        if (isCompleted) {
          streak = 0;
          let checkDate = new Date(todayStr + 'T00:00:00');
          while (true) {
            const y = checkDate.getFullYear();
            const m = String(checkDate.getMonth() + 1).padStart(2, '0');
            const d = String(checkDate.getDate()).padStart(2, '0');
            const f = `${y}-${m}-${d}`;
            if (newDates.includes(f)) {
              streak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }
        }

        const updatedHabit = {
          ...existing,
          completedDates: newDates,
          streak: Math.max(isCompleted ? 1 : (existing.streak || 0), streak),
        };
        updated = [...currentHabits];
        updated[existingIndex] = updatedHabit;
      } else {
        // Create fresh habit and list in tasks (pending / unticked for manual check)
        const habitName = isJuice 
          ? `Drink ${item.emoji || '🥤'} ${cleanItemName} (${item.calories || 80} kcal)`
          : `Have ${item.emoji || '🥣'} ${cleanItemName} (${item.calories} kcal)`;

        const newHabit = {
          id: `h-${item.id || Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: habitName,
          category: 'Diet & Nutrition',
          timeOfDay: isJuice ? 'Morning' : 'Night',
          icon: isJuice ? 'Droplets' : 'Moon',
          color: item.color || (isJuice ? '#f97316' : '#6366f1'),
          frequency: isJuice ? 'two_days_once' : 'daily',
          targetDays: isJuice ? 3 : 7,
          completedDates: isCompleted ? [todayStr] : [],
          streak: isCompleted ? 1 : 0,
          createdAt: new Date().toISOString(),
        };
        updated = [newHabit, ...currentHabits];
      }

      setLocalData(STORAGE_KEYS.HABITS, updated);
      syncTodayIntoDailyHistory(updated, todayStr);
      saveTodoListToDB(currentUserId, updated);
      pushToCloud({ habits: updated, todos: updated, transactions, jars, roadmap, customLists, healthProtocol, dailyHistory, dailyHabitNotes, settings });
      return updated;
    });

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}

    return { 
      success: true, 
      isJuice, 
      calories: item.calories, 
      name: item.name,
      entry: mealResult?.entry,
      updatedMeals: mealResult?.updatedMeals
    };
  };

  /**
   * Remove a logged diet meal from today's calorie tracker
   */
  const removeDietMeal = (mealId) => {
    try {
      const key = `life_tracker_meals_${currentUserId}_${todayStr}`;
      const raw = localStorage.getItem(key);
      const existing = raw ? JSON.parse(raw) : [];
      const mealToRemove = existing.find(m => m.id === mealId);
      const updated = existing.filter(m => m.id !== mealId);
      localStorage.setItem(key, JSON.stringify(updated));
      setDailyMeals(updated);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('life_tracker_meals_updated', {
          detail: { dateStr: todayStr, userId: currentUserId, meals: updated }
        }));
      }

      syncToCloud(currentUserId, {
        [`dailyMeals_${todayStr}`]: updated,
        lastMealLoggedAt: new Date().toISOString()
      });

      // Also clean corresponding habit from habits list if present
      if (mealToRemove && mealToRemove.name) {
        const mealClean = mealToRemove.name.toLowerCase().trim();
        setHabits(prevHabits => {
          const currentHabits = Array.isArray(prevHabits) ? prevHabits : [];
          const updatedHabits = currentHabits.filter(h => {
            if (!h || !h.name) return true;
            const hClean = h.name.toLowerCase().replace(/^(have|drink)\s+/i, '').replace(/\s*\(\d+\s*kcal\)/i, '').trim();
            return !hClean.includes(mealClean) && !mealClean.includes(hClean);
          });
          if (updatedHabits.length !== currentHabits.length) {
            setLocalData(STORAGE_KEYS.HABITS, updatedHabits);
            syncTodayIntoDailyHistory(updatedHabits, todayStr);
            saveTodoListToDB(currentUserId, updatedHabits);
            pushToCloud({ habits: updatedHabits, todos: updatedHabits, transactions, jars, roadmap, customLists, healthProtocol, dailyHistory, dailyHabitNotes, settings });
            return updatedHabits;
          }
          return currentHabits;
        });
      }

      return true;
    } catch (e) {
      console.error('Failed to remove diet meal:', e);
      return false;
    }
  };

  /**
   * Seamlessly remove a diet item by name from both today's meals and habits checklist
   */
  const removeDietItem = (itemName) => {
    if (!itemName) return false;
    const clean = itemName.toLowerCase().replace(/^(have|drink)\s+/i, '').replace(/\s*\(\d+\s*kcal\)/i, '').trim();

    // 1. Remove from meals
    try {
      const key = `life_tracker_meals_${currentUserId}_${todayStr}`;
      const raw = localStorage.getItem(key);
      const existingMeals = raw ? JSON.parse(raw) : [];
      const updatedMeals = existingMeals.filter(m => {
        if (!m || !m.name) return true;
        const mClean = m.name.toLowerCase().trim();
        return !mClean.includes(clean) && !clean.includes(mClean);
      });
      localStorage.setItem(key, JSON.stringify(updatedMeals));
      setDailyMeals(updatedMeals);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('life_tracker_meals_updated', {
          detail: { dateStr: todayStr, userId: currentUserId, meals: updatedMeals }
        }));
      }
      syncToCloud(currentUserId, {
        [`dailyMeals_${todayStr}`]: updatedMeals,
        lastMealLoggedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error('Error removing diet meal in removeDietItem:', e);
    }

    // 2. Remove from habits
    setHabits(prevHabits => {
      const currentHabits = Array.isArray(prevHabits) ? prevHabits : [];
      const updatedHabits = currentHabits.filter(h => {
        if (!h || !h.name) return true;
        const hClean = h.name.toLowerCase().replace(/^(have|drink)\s+/i, '').replace(/\s*\(\d+\s*kcal\)/i, '').trim();
        return !hClean.includes(clean) && !clean.includes(hClean);
      });
      setLocalData(STORAGE_KEYS.HABITS, updatedHabits);
      syncTodayIntoDailyHistory(updatedHabits, todayStr);
      saveTodoListToDB(currentUserId, updatedHabits);
      pushToCloud({ habits: updatedHabits, todos: updatedHabits, transactions, jars, roadmap, customLists, healthProtocol, dailyHistory, dailyHabitNotes, settings });
      return updatedHabits;
    });

    return true;
  };

  // Workout History Operations (Direct Cloud Firestore & PWA Multi-Device Sync)
  const addWorkoutRecord = useCallback((record) => {
    if (!record) return;
    setWorkoutHistory(prev => {
      const current = Array.isArray(prev) ? prev : [];
      const updated = [record, ...current];
      setLocalData(STORAGE_KEYS.WORKOUT_HISTORY, updated);
      saveWorkoutHistoryToDB(currentUserId, updated);
      pushToCloud({ workoutHistory: updated });
      return updated;
    });
  }, [currentUserId, pushToCloud]);

  const deleteWorkoutRecord = useCallback((id) => {
    if (!id) return;
    setWorkoutHistory(prev => {
      const current = Array.isArray(prev) ? prev : [];
      const updated = current.filter(r => r.id !== id);
      setLocalData(STORAGE_KEYS.WORKOUT_HISTORY, updated);
      saveWorkoutHistoryToDB(currentUserId, updated);
      pushToCloud({ workoutHistory: updated });
      return updated;
    });
  }, [currentUserId, pushToCloud]);

  // Finance & Jar Operations
  const addTransaction = (txData) => {
    const newTx = {
      id: `t-${Date.now()}`,
      title: txData.title,
      type: txData.type || 'expense',
      amount: parseFloat(txData.amount) || 0,
      category: txData.category || 'Food',
      jarId: txData.jarId || null,
      date: txData.date || todayStr,
      note: txData.note || '',
      receiptImage: txData.receiptImage || null,
      createdAt: new Date().toISOString(),
    };
    const currentTx = Array.isArray(transactions) ? transactions : [];
    const updated = [newTx, ...currentTx];
    setTransactions(updated);
    pushToCloud({ habits, transactions: updated, jars, roadmap, customLists, healthProtocol, dailyHistory, settings });
  };

  const deleteTransaction = (id) => {
    const currentTx = Array.isArray(transactions) ? transactions : [];
    const updated = currentTx.filter(t => t.id !== id);
    setTransactions(updated);
    pushToCloud({ habits, transactions: updated, jars, roadmap, customLists, healthProtocol, dailyHistory, settings });
  };

  const setAllJars = (newJarsList) => {
    const safeJars = Array.isArray(newJarsList) ? newJarsList : DEFAULT_JARS;
    jarsRef.current = safeJars;
    setJars(safeJars);
    setLocalData(STORAGE_KEYS.JARS, safeJars);
    pushToCloud({ habits, transactions, jars: safeJars, roadmap, customLists, healthProtocol, dailyHistory, settings: settingsRef.current || settings });
  };

  const updateSalaryAndJars = (newSalary, newBudget, newJarsList) => {
    const validSalary = !isNaN(parseFloat(newSalary)) ? parseFloat(newSalary) : (settingsRef.current?.monthlySalary || 18000);
    const validBudget = !isNaN(parseFloat(newBudget)) && parseFloat(newBudget) > 0 ? parseFloat(newBudget) : validSalary;
    const safeJars = Array.isArray(newJarsList) ? newJarsList : (jarsRef.current || jars || DEFAULT_JARS);

    const updatedSettings = {
      ...(settingsRef.current || settings || DEFAULT_SETTINGS),
      monthlySalary: validSalary,
      monthlyBudget: validBudget,
    };

    settingsRef.current = updatedSettings;
    jarsRef.current = safeJars;

    setSettings(updatedSettings);
    setLocalData(STORAGE_KEYS.SETTINGS, updatedSettings);

    setJars(safeJars);
    setLocalData(STORAGE_KEYS.JARS, safeJars);

    pushToCloud({
      habits,
      transactions,
      jars: safeJars,
      roadmap,
      customLists,
      healthProtocol,
      dailyHistory,
      settings: updatedSettings,
    });
  };

  const updateJar = (jarId, jarData) => {
    const currentJars = Array.isArray(jars) ? jars : DEFAULT_JARS;
    const updated = currentJars.map(j => j.id === jarId ? { ...j, ...jarData } : j);
    jarsRef.current = updated;
    setJars(updated);
    setLocalData(STORAGE_KEYS.JARS, updated);
    pushToCloud({ habits, transactions, jars: updated, roadmap, customLists, healthProtocol, dailyHistory, settings: settingsRef.current || settings });
  };

  const addJar = (jarData) => {
    const newJar = {
      id: `jar-${Date.now()}`,
      name: jarData.name,
      category: jarData.category || 'General',
      allocated: parseFloat(jarData.allocated) || 1000,
      color: jarData.color || '#6366f1',
      icon: jarData.icon || 'PiggyBank',
    };
    const currentJars = Array.isArray(jars) ? jars : DEFAULT_JARS;
    const updated = [...currentJars, newJar];
    jarsRef.current = updated;
    setJars(updated);
    setLocalData(STORAGE_KEYS.JARS, updated);
    pushToCloud({ habits, transactions, jars: updated, roadmap, customLists, healthProtocol, dailyHistory, settings: settingsRef.current || settings });
  };

  const deleteJar = (jarId) => {
    const currentJars = Array.isArray(jars) ? jars : DEFAULT_JARS;
    const updated = currentJars.filter(j => j.id !== jarId);
    jarsRef.current = updated;
    setJars(updated);
    setLocalData(STORAGE_KEYS.JARS, updated);
    pushToCloud({ habits, transactions, jars: updated, roadmap, customLists, healthProtocol, dailyHistory, settings: settingsRef.current || settings });
  };

  const resetJarsToDefault = (shouldResetSalary = true) => {
    jarsRef.current = DEFAULT_JARS;
    setJars(DEFAULT_JARS);
    setLocalData(STORAGE_KEYS.JARS, DEFAULT_JARS);
    let updatedSettings = settingsRef.current || settings || DEFAULT_SETTINGS;
    if (shouldResetSalary) {
      updatedSettings = { ...updatedSettings, monthlySalary: 18000, monthlyBudget: 16000 };
      settingsRef.current = updatedSettings;
      setSettings(updatedSettings);
      setLocalData(STORAGE_KEYS.SETTINGS, updatedSettings);
    }
    pushToCloud({ habits, transactions, jars: DEFAULT_JARS, roadmap, customLists, healthProtocol, dailyHistory, settings: updatedSettings });
  };

  // Career Roadmap Operations
  const addRoadmapWeek = (weekData) => {
    const newWeek = {
      id: `custom-w-${Date.now()}`,
      period: weekData.period || 'Custom Milestone',
      month: weekData.month || 'September',
      dateRange: weekData.dateRange || 'Flexible Dates',
      dsa: weekData.dsa || '',
      fullstack: weekData.fullstack || '',
      mobile: weekData.mobile || '',
      project: weekData.project || '',
      career: weekData.career || '',
      status: weekData.status || 'Not Started',
      completedTasks: [],
      isLightWeek: !!weekData.isLightWeek,
      notes: weekData.notes || '',
      createdAt: new Date().toISOString(),
    };
    const currentRoadmap = Array.isArray(roadmap) ? roadmap : DEFAULT_ROADMAP;
    const updated = [...currentRoadmap, newWeek];
    setRoadmap(updated);
    pushToCloud({ habits, transactions, jars, roadmap: updated, customLists, settings });
  };

  const updateRoadmapWeek = (weekId, weekData) => {
    const currentRoadmap = Array.isArray(roadmap) ? roadmap : DEFAULT_ROADMAP;
    const updated = currentRoadmap.map(w => w.id === weekId ? { ...w, ...weekData } : w);
    setRoadmap(updated);
    pushToCloud({ habits, transactions, jars, roadmap: updated, customLists, settings });
  };

  const deleteRoadmapWeek = (weekId) => {
    const currentRoadmap = Array.isArray(roadmap) ? roadmap : DEFAULT_ROADMAP;
    const updated = currentRoadmap.filter(w => w.id !== weekId);
    setRoadmap(updated);
    pushToCloud({ habits, transactions, jars, roadmap: updated, customLists, settings });
  };

  const resetRoadmapToDefault = () => {
    setRoadmap(DEFAULT_ROADMAP);
    pushToCloud({ habits, transactions, jars, roadmap: DEFAULT_ROADMAP, customLists, settings });
  };

  const toggleRoadmapTask = (weekId, taskKey) => {
    const taskKeys = ['dsa', 'fullstack', 'mobile', 'project', 'career'];
    const currentRoadmap = Array.isArray(roadmap) && roadmap.length > 0 ? roadmap : DEFAULT_ROADMAP;
    const updated = currentRoadmap.map(week => {
      if (week.id !== weekId) return week;
      const prevCompleted = Array.isArray(week.completedTasks) ? week.completedTasks : [];
      const isAlreadyDone = prevCompleted.includes(taskKey);
      const newCompleted = isAlreadyDone 
        ? prevCompleted.filter(k => k !== taskKey)
        : [...prevCompleted, taskKey];

      // Determine tasks present on this week
      const presentTaskKeys = taskKeys.filter(k => Boolean(week[k] && String(week[k]).trim() && String(week[k]).trim() !== '—'));
      const requiredKeys = presentTaskKeys.length > 0 ? presentTaskKeys : taskKeys;
      const allDone = requiredKeys.length > 0 && requiredKeys.every(k => newCompleted.includes(k));

      let newStatus = week.status;
      if (allDone) {
        newStatus = 'Completed';
        triggerCelebration();
      } else if (newCompleted.length > 0) {
        newStatus = 'In Progress';
      } else if (!week.isLightWeek) {
        newStatus = 'Not Started';
      }

      return {
        ...week,
        completedTasks: newCompleted,
        status: newStatus,
      };
    });

    setRoadmap(updated);
    setLocalData(STORAGE_KEYS.ROADMAP, updated);
    pushToCloud({ habits, transactions, jars, roadmap: updated, customLists, settings });
  };

  const updateWeekStatus = (weekId, status) => {
    const currentRoadmap = Array.isArray(roadmap) && roadmap.length > 0 ? roadmap : DEFAULT_ROADMAP;
    const allTasks = ['dsa', 'fullstack', 'mobile', 'project', 'career'];
    const isCompleted = status === 'Completed';
    if (isCompleted) {
      triggerCelebration();
    }
    const updated = currentRoadmap.map(week => {
      if (week.id !== weekId) return week;
      return {
        ...week,
        status,
        completedTasks: isCompleted ? allTasks : (status === 'Not Started' ? [] : (Array.isArray(week.completedTasks) ? week.completedTasks : [])),
      };
    });
    setRoadmap(updated);
    setLocalData(STORAGE_KEYS.ROADMAP, updated);
    pushToCloud({ habits, transactions, jars, roadmap: updated, customLists, settings });
  };

  const toggleLightWeek = (weekId) => {
    const currentRoadmap = Array.isArray(roadmap) ? roadmap : DEFAULT_ROADMAP;
    const updated = currentRoadmap.map(week => {
      if (week.id !== weekId) return week;
      const isNowLight = !week.isLightWeek;
      return {
        ...week,
        isLightWeek: isNowLight,
        status: isNowLight ? 'Light / Rest Week' : (week.completedTasks?.length > 0 ? 'In Progress' : 'Not Started'),
      };
    });
    setRoadmap(updated);
    pushToCloud({ habits, transactions, jars, roadmap: updated, customLists, settings });
  };

  const updateWeekNotes = (weekId, notes) => {
    const currentRoadmap = Array.isArray(roadmap) ? roadmap : DEFAULT_ROADMAP;
    const updated = currentRoadmap.map(week => week.id === weekId ? { ...week, notes } : week);
    setRoadmap(updated);
    pushToCloud({ habits, transactions, jars, roadmap: updated, customLists, settings });
  };

  // 120-Day Full-Stack Developer Plan Operations
  const updateDayPlan = (dayId, fields) => {
    const currentRoadmap = Array.isArray(roadmap) && roadmap.length > 0 ? roadmap : DEFAULT_ROADMAP;
    const updated = currentRoadmap.map(d => d.id === dayId ? { ...d, ...fields } : d);
    setRoadmap(updated);
    setLocalData(STORAGE_KEYS.ROADMAP, updated);
    pushToCloud({ habits, transactions, jars, roadmap: updated, customLists, settings });
  };

  const toggleDayComplete = (dayId) => {
    const currentRoadmap = Array.isArray(roadmap) && roadmap.length > 0 ? roadmap : DEFAULT_ROADMAP;
    const allChecklist = ['Learn', 'Code', 'DSA/Project', 'Recall'];
    const updated = currentRoadmap.map(day => {
      if (day.id !== dayId) return day;
      const willBeDone = day.status !== 'Completed' && day.completion !== 'Done';
      if (willBeDone) triggerCelebration();
      return {
        ...day,
        status: willBeDone ? 'Completed' : 'Not Started',
        completion: willBeDone ? 'Done' : 'Pending',
        completedTasks: willBeDone ? allChecklist : []
      };
    });
    setRoadmap(updated);
    setLocalData(STORAGE_KEYS.ROADMAP, updated);
    pushToCloud({ habits, transactions, jars, roadmap: updated, customLists, settings });
  };

  const toggleDayChecklist = (dayId, taskItem) => {
    const currentRoadmap = Array.isArray(roadmap) && roadmap.length > 0 ? roadmap : DEFAULT_ROADMAP;
    const updated = currentRoadmap.map(day => {
      if (day.id !== dayId) return day;
      const prev = Array.isArray(day.completedTasks) ? day.completedTasks : [];
      const hasIt = prev.includes(taskItem);
      const newTasks = hasIt ? prev.filter(t => t !== taskItem) : [...prev, taskItem];
      const isComplete = newTasks.length >= 4;
      if (isComplete && !hasIt) triggerCelebration();
      return {
        ...day,
        completedTasks: newTasks,
        status: isComplete ? 'Completed' : (newTasks.length > 0 ? 'In Progress' : 'Not Started'),
        completion: isComplete ? 'Done' : (newTasks.length > 0 ? 'Partial' : 'Pending')
      };
    });
    setRoadmap(updated);
    setLocalData(STORAGE_KEYS.ROADMAP, updated);
    pushToCloud({ habits, transactions, jars, roadmap: updated, customLists, settings });
  };

  const recalculateAllDates = (startDateStr) => {
    const currentRoadmap = Array.isArray(roadmap) && roadmap.length > 0 ? roadmap : DEFAULT_ROADMAP;
    const updated = recalculatePlanDates(currentRoadmap, startDateStr);
    setRoadmap(updated);
    setLocalData(STORAGE_KEYS.ROADMAP, updated);
    pushToCloud({ habits, transactions, jars, roadmap: updated, customLists, settings });
  };

  const shiftDatesFromDay = (fromDayNumber, deltaDays) => {
    const currentRoadmap = Array.isArray(roadmap) && roadmap.length > 0 ? roadmap : DEFAULT_ROADMAP;
    const updated = shiftPlanDatesFromDay(currentRoadmap, fromDayNumber, deltaDays);
    setRoadmap(updated);
    setLocalData(STORAGE_KEYS.ROADMAP, updated);
    pushToCloud({ habits, transactions, jars, roadmap: updated, customLists, settings });
  };

  const updateDayDate = (dayId, newDateStr) => {
    const currentRoadmap = Array.isArray(roadmap) && roadmap.length > 0 ? roadmap : DEFAULT_ROADMAP;
    const updated = updateSingleDayDate(currentRoadmap, dayId, newDateStr);
    setRoadmap(updated);
    setLocalData(STORAGE_KEYS.ROADMAP, updated);
    pushToCloud({ habits, transactions, jars, roadmap: updated, customLists, settings });
  };

  const swapDayDates = (dayId1, dayId2) => {
    const currentRoadmap = Array.isArray(roadmap) && roadmap.length > 0 ? roadmap : DEFAULT_ROADMAP;
    const updated = swapDatesBetweenDays(currentRoadmap, dayId1, dayId2);
    setRoadmap(updated);
    setLocalData(STORAGE_KEYS.ROADMAP, updated);
    pushToCloud({ habits, transactions, jars, roadmap: updated, customLists, settings });
  };

  // Tech Concepts Mastery
  const [devPlanConcepts, setDevPlanConcepts] = useState(() => {
    try {
      const data = getLocalData('life_tracker_dev_concepts_v1', null);
      return Array.isArray(data) && data.length > 0 ? data : DEV_PLAN_CONCEPTS;
    } catch {
      return DEV_PLAN_CONCEPTS;
    }
  });

  const toggleConceptMastery = (conceptId) => {
    setDevPlanConcepts(prev => {
      const updated = prev.map(c => c.id === conceptId ? { ...c, mastered: !c.mastered } : c);
      setLocalData('life_tracker_dev_concepts_v1', updated);
      return updated;
    });
  };

  // Weekly Reviews
  const [devPlanWeeklyReviews, setDevPlanWeeklyReviews] = useState(() => {
    try {
      const data = getLocalData('life_tracker_dev_reviews_v1', null);
      return Array.isArray(data) && data.length > 0 ? data : DEV_PLAN_WEEKLY_REVIEWS;
    } catch {
      return DEV_PLAN_WEEKLY_REVIEWS;
    }
  });

  const updateWeeklyReview = (reviewId, fields) => {
    setDevPlanWeeklyReviews(prev => {
      const updated = prev.map(r => r.id === reviewId ? { ...r, ...fields } : r);
      setLocalData('life_tracker_dev_reviews_v1', updated);
      return updated;
    });
  };

  // Custom List & Watchlist Operations
  const toggleListItem = (listId, itemId, newStatus) => {
    const currentLists = Array.isArray(customLists) ? customLists : DEFAULT_CUSTOM_LISTS;
    const updated = currentLists.map(list => {
      if (list.id !== listId) return list;
      const updatedItems = (list.items || []).map(item => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          status: newStatus,
        };
      });
      return {
        ...list,
        items: updatedItems,
      };
    });

    if (newStatus === 'watched') {
      triggerCelebration();
    }

    setCustomLists(updated);
    pushToCloud({ habits, transactions, jars, roadmap, customLists: updated, settings });
  };

  const addCustomList = (listData) => {
    const newList = {
      id: `list-${Date.now()}`,
      title: listData.title || 'My Progress List',
      description: listData.description || '',
      icon: listData.icon || 'Film',
      color: listData.color || '#ef4444',
      items: listData.items || [],
      createdAt: new Date().toISOString(),
    };
    const currentLists = Array.isArray(customLists) ? customLists : DEFAULT_CUSTOM_LISTS;
    const updated = [...currentLists, newList];
    setCustomLists(updated);
    pushToCloud({ habits, transactions, jars, roadmap, customLists: updated, settings });
  };

  const updateCustomList = (listId, listData) => {
    const currentLists = Array.isArray(customLists) ? customLists : DEFAULT_CUSTOM_LISTS;
    const updated = currentLists.map(l => l.id === listId ? { ...l, ...listData } : l);
    setCustomLists(updated);
    pushToCloud({ habits, transactions, jars, roadmap, customLists: updated, settings });
  };

  const deleteCustomList = (listId) => {
    const currentLists = Array.isArray(customLists) ? customLists : DEFAULT_CUSTOM_LISTS;
    const updated = currentLists.filter(l => l.id !== listId);
    setCustomLists(updated);
    pushToCloud({ habits, transactions, jars, roadmap, customLists: updated, settings });
  };

  const addListItem = (listId, itemData) => {
    const currentLists = Array.isArray(customLists) ? customLists : DEFAULT_CUSTOM_LISTS;
    const updated = currentLists.map(list => {
      if (list.id !== listId) return list;
      const listItems = list.items || [];
      const nextNum = (listItems.length + 1).toString().padStart(2, '0');
      const newItem = {
        id: `item-${Date.now()}`,
        number: nextNum,
        type: itemData.type || 'FILM',
        title: itemData.title,
        category: itemData.category || 'General',
        importance: itemData.importance || 'Essential for Doomsday',
        rating: itemData.rating || '7.0',
        notes: itemData.notes || '',
        status: 'unwatched',
      };
      return {
        ...list,
        items: [...listItems, newItem],
      };
    });
    setCustomLists(updated);
    pushToCloud({ habits, transactions, jars, roadmap, customLists: updated, settings });
  };

  const deleteListItem = (listId, itemId) => {
    const currentLists = Array.isArray(customLists) ? customLists : DEFAULT_CUSTOM_LISTS;
    const updated = currentLists.map(list => {
      if (list.id !== listId) return list;
      return {
        ...list,
        items: (list.items || []).filter(i => i.id !== itemId),
      };
    });
    setCustomLists(updated);
    pushToCloud({ habits, transactions, jars, roadmap, customLists: updated, settings });
  };

  const resetMarvelList = () => {
    setCustomLists(DEFAULT_CUSTOM_LISTS);
    pushToCloud({ habits, transactions, jars, roadmap, customLists: DEFAULT_CUSTOM_LISTS, settings });
  };

  // Settings Operations
  const updateSettings = (newSettings) => {
    const updated = { ...(settingsRef.current || settings || DEFAULT_SETTINGS), ...newSettings };
    settingsRef.current = updated;
    setSettings(updated);
    setLocalData(STORAGE_KEYS.SETTINGS, updated);
    pushToCloud({ habits, transactions, jars: jarsRef.current || jars, roadmap, customLists, healthProtocol, dailyHistory, settings: updated });
  };

  // Health Protocol Operations
  const updateHealthProtocol = (newProtocol) => {
    setHealthProtocol(prev => {
      const updated = typeof newProtocol === 'function' ? newProtocol(prev || DEFAULT_HEALTH_PROTOCOL) : newProtocol;
      const uid = currentUser?.uid || DEFAULT_USERS[0]?.uid || 'admin-super-001';
      const userKey = `${STORAGE_KEYS.HEALTH_PROTOCOL}_${uid}`;
      const clean = sanitizeHealthProtocol(updated);
      setLocalData(userKey, clean);
      pushToCloud({ habits, transactions, jars, roadmap, customLists, healthProtocol: clean, dailyHistory, settings });
      return clean;
    });
  };

  const importHealthProtocolFromExcel = (parsedProtocol, stats = null) => {
    const uid = currentUser?.uid || DEFAULT_USERS[0]?.uid || 'admin-super-001';
    const userKey = `${STORAGE_KEYS.HEALTH_PROTOCOL}_${uid}`;
    const enrichedProtocol = {
      ...DEFAULT_HEALTH_PROTOCOL,
      ...parsedProtocol,
      meta: {
        isCustom: true,
        planName: stats?.fileName ? stats.fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ') : 'Custom Uploaded Diet Protocol',
        uploadedAt: new Date().toISOString(),
        fileName: stats?.fileName || 'custom_diet_protocol.xlsx',
        source: 'excel_upload',
        uploaderEmail: currentUser?.email || 'user',
      }
    };
    const clean = sanitizeHealthProtocol(enrichedProtocol);
    setHealthProtocol(clean);
    setLocalData(userKey, clean);
    pushToCloud({ habits, transactions, jars, roadmap, customLists, healthProtocol: clean, dailyHistory, settings });
    triggerCelebration();
    return clean;
  };

  const resetHealthProtocolToDefault = () => {
    const uid = currentUser?.uid || DEFAULT_USERS[0]?.uid || 'admin-super-001';
    const userKey = `${STORAGE_KEYS.HEALTH_PROTOCOL}_${uid}`;
    setHealthProtocol(DEFAULT_HEALTH_PROTOCOL);
    setLocalData(userKey, DEFAULT_HEALTH_PROTOCOL);
    pushToCloud({ habits, transactions, jars, roadmap, customLists, healthProtocol: DEFAULT_HEALTH_PROTOCOL, dailyHistory, settings });
    return DEFAULT_HEALTH_PROTOCOL;
  };

  const updateUserHealthProtocol = async (targetUid, newProtocol, stats = null) => {
    if (!targetUid) return;
    const enrichedProtocol = {
      ...DEFAULT_HEALTH_PROTOCOL,
      ...newProtocol,
      meta: {
        isCustom: true,
        planName: stats?.fileName ? stats.fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ') : 'Custom Diet Protocol',
        uploadedAt: new Date().toISOString(),
        fileName: stats?.fileName || 'custom_diet_protocol.xlsx',
        source: 'excel_upload_admin',
        uploaderEmail: currentUser?.email || 'admin',
      }
    };
    const clean = sanitizeHealthProtocol(enrichedProtocol);
    const userKey = `${STORAGE_KEYS.HEALTH_PROTOCOL}_${targetUid}`;
    setLocalData(userKey, clean);
    if (currentUser?.uid === targetUid) {
      setHealthProtocol(clean);
    }
    await syncToCloud(targetUid, { healthProtocol: clean });
    return clean;
  };

  const addProtocolTasksToToday = (dayKey) => {
    const protocol = healthProtocol || DEFAULT_HEALTH_PROTOCOL;
    const dayData = protocol?.weeklySchedule?.[dayKey?.toLowerCase()];
    if (!dayData || !Array.isArray(dayData.tasks)) return 0;

    let addedCount = 0;
    setHabits(prevHabits => {
      const list = Array.isArray(prevHabits) ? [...prevHabits] : [...DEFAULT_HABITS];
      const existingNames = new Set(list.map(h => h.name.toLowerCase().trim()));

      dayData.tasks.forEach((task, idx) => {
        if (!existingNames.has(task.name.toLowerCase().trim())) {
          const newHabit = {
            id: `h-proto-${Date.now()}-${idx}`,
            name: task.name,
            category: task.category || 'Health',
            timeOfDay: task.timeOfDay || 'Morning',
            icon: task.icon || 'Sparkles',
            color: task.color || '#10b981',
            frequency: 'daily',
            targetDays: 7,
            completedDates: [],
            streak: 0,
            createdAt: new Date().toISOString(),
          };
          list.unshift(newHabit);
          existingNames.add(task.name.toLowerCase().trim());
          addedCount++;
        }
      });

      setLocalData(STORAGE_KEYS.HABITS, list);
      pushToCloud({ habits: list, transactions, jars, roadmap, customLists, healthProtocol, settings });
      return list;
    });

    if (addedCount > 0) {
      triggerCelebration();
    }
    return addedCount;
  };

  // 30-Day History Progress Query Operations
  const getPastDayProgress = (targetDateStr) => {
    const safeHabitsList = Array.isArray(habits) ? habits : [];
    if (targetDateStr === todayStr) {
      const completedTasks = safeHabitsList.filter(h => h && Array.isArray(h.completedDates) && h.completedDates.includes(targetDateStr));
      const uncompletedTasks = safeHabitsList.filter(h => h && (!Array.isArray(h.completedDates) || !h.completedDates.includes(targetDateStr)));
      const total = safeHabitsList.length;
      const completed = completedTasks.length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { date: targetDateStr, total, completed, percent, completedTasks, uncompletedTasks };
    }

    if (dailyHistory && dailyHistory[targetDateStr]) {
      const entry = dailyHistory[targetDateStr];
      const tasks = Array.isArray(entry.tasks) ? entry.tasks : [];
      return {
        date: targetDateStr,
        total: entry.total || tasks.length,
        completed: entry.completed || 0,
        percent: entry.percent || 0,
        completedTasks: tasks.filter(t => t.isCompleted),
        uncompletedTasks: tasks.filter(t => !t.isCompleted)
      };
    }

    const completedTasks = safeHabitsList.filter(h => h && Array.isArray(h.completedDates) && h.completedDates.includes(targetDateStr));
    const uncompletedTasks = safeHabitsList.filter(h => h && (!Array.isArray(h.completedDates) || !h.completedDates.includes(targetDateStr)));
    const total = safeHabitsList.length;
    const completed = completedTasks.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { date: targetDateStr, total, completed, percent, completedTasks, uncompletedTasks };
  };

  const getPast30DaysHistory = (daysCount = 30) => {
    const list = [];
    const safeHabitsList = Array.isArray(habits) ? habits : [];
    const baseDate = new Date(todayStr + 'T00:00:00');
    const totalDays = Math.max(1, parseInt(daysCount, 10) || 30);

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      let total = 0;
      let completed = 0;
      let percent = 0;
      let completedTasks = [];
      let uncompletedTasks = [];

      if (dateStr === todayStr) {
        completedTasks = safeHabitsList.filter(h => h && Array.isArray(h.completedDates) && h.completedDates.includes(dateStr));
        uncompletedTasks = safeHabitsList.filter(h => h && (!Array.isArray(h.completedDates) || !h.completedDates.includes(dateStr)));
        total = safeHabitsList.length;
        completed = completedTasks.length;
        percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      } else if (dailyHistory && dailyHistory[dateStr]) {
        const entry = dailyHistory[dateStr];
        total = entry.total || 0;
        completed = entry.completed || 0;
        percent = entry.percent || 0;
        if (Array.isArray(entry.tasks) && entry.tasks.length > 0) {
          completedTasks = entry.tasks.filter(t => t.isCompleted);
          uncompletedTasks = entry.tasks.filter(t => !t.isCompleted);
        } else {
          completedTasks = safeHabitsList.filter(h => h && Array.isArray(h.completedDates) && h.completedDates.includes(dateStr));
          uncompletedTasks = safeHabitsList.filter(h => h && (!Array.isArray(h.completedDates) || !h.completedDates.includes(dateStr)));
        }
      } else {
        completedTasks = safeHabitsList.filter(h => h && Array.isArray(h.completedDates) && h.completedDates.includes(dateStr));
        uncompletedTasks = safeHabitsList.filter(h => h && (!Array.isArray(h.completedDates) || !h.completedDates.includes(dateStr)));
        total = completedTasks.length + uncompletedTasks.length;
        completed = completedTasks.length;
        percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      }

      list.push({
        date: dateStr,
        dayOffset: i,
        dayLabel: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : `${i} days ago`,
        formattedDate: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        total,
        completed,
        percent,
        completedTasks,
        uncompletedTasks,
      });
    }

    return list;
  };

  // Manual one-tap sync to upload all To-Dos and full Daily History to Cloud DB
  const syncAllHistoryToCloud = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      const todoRes = await saveTodoListToDB(currentUserId, habits);
      const histRes = await saveDailyHistoryToDB(currentUserId, dailyHistory, dailyHabitNotes);
      const cloudRes = await syncToCloud(currentUserId, {
        habits: habits || [],
        todos: habits || [],
        dailyHistory: dailyHistory || {},
        dailyHabitNotes: dailyHabitNotes || {},
        transactions: transactions || [],
        jars: jars || DEFAULT_JARS,
        roadmap: roadmap || DEFAULT_ROADMAP,
        customLists: customLists || DEFAULT_CUSTOM_LISTS,
        healthProtocol: healthProtocol || DEFAULT_HEALTH_PROTOCOL,
        settings: settings || DEFAULT_SETTINGS,
      });
      const ok = todoRes.success || histRes.success || cloudRes.success;
      setSyncStatus(ok ? 'synced' : 'error');
      return { success: ok };
    } catch (e) {
      console.error('syncAllHistoryToCloud error:', e);
      setSyncStatus('error');
      return { success: false, error: e };
    }
  }, [currentUserId, habits, dailyHistory, dailyHabitNotes, transactions, jars, roadmap, customLists, healthProtocol, settings]);

  // Calculated Metrics (Guaranteed Safe)
  const safeHabits = Array.isArray(habits) ? habits.filter(Boolean) : [];
  const safeTransactions = Array.isArray(transactions) ? transactions.filter(Boolean) : [];
  const safeRoadmap = Array.isArray(roadmap) && roadmap.length > 0 ? roadmap.filter(Boolean) : DEFAULT_ROADMAP;
  const safeCustomLists = Array.isArray(customLists) ? customLists.filter(Boolean) : [];

  const todayCompletedHabits = safeHabits.filter(h => h && Array.isArray(h.completedDates) && h.completedDates.includes(todayStr)).length;
  const todayHabitProgress = safeHabits.length > 0 ? Math.round((todayCompletedHabits / safeHabits.length) * 100) : 0;

  // Compute continuous streak from 30-Day Daily History so wiping habits daily doesn't break momentum
  const currentStreak = useMemo(() => {
    const baseDate = new Date(todayStr + 'T00:00:00');
    const todayDone = Array.isArray(habits) ? habits.filter(h => h && Array.isArray(h.completedDates) && h.completedDates.includes(todayStr)).length : 0;

    let streak = 0;
    let checkDate = new Date(baseDate);

    if (todayDone > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const y = checkDate.getFullYear();
      const m = String(checkDate.getMonth() + 1).padStart(2, '0');
      const d = String(checkDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      const entry = dailyHistory && dailyHistory[dateStr];
      if (entry && entry.completed > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [dailyHistory, todayStr, habits]);

  // Compute yesterday's progress summary for instant feedback
  const yesterdayStr = useMemo(() => {
    const base = new Date(todayStr + 'T00:00:00');
    base.setDate(base.getDate() - 1);
    const y = base.getFullYear();
    const m = String(base.getMonth() + 1).padStart(2, '0');
    const d = String(base.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [todayStr]);

  const yesterdayProgress = useMemo(() => {
    if (dailyHistory && dailyHistory[yesterdayStr]) {
      return dailyHistory[yesterdayStr];
    }
    return null;
  }, [dailyHistory, yesterdayStr]);

  const currentMonthStr = typeof todayStr === 'string' ? todayStr.substring(0, 7) : '';
  const currentMonthTransactions = safeTransactions.filter(t => t && typeof t.date === 'string' && t.date.startsWith(currentMonthStr));
  
  const currentMonthIncome = currentMonthTransactions
    .filter(t => t && t.type === 'income')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const currentMonthExpense = currentMonthTransactions
    .filter(t => t && t.type === 'expense')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const netSavings = currentMonthIncome - currentMonthExpense;

  // Roadmap Metrics (120-Day Full-Stack Plan)
  const totalRoadmapDays = safeRoadmap.length;
  const completedRoadmapDays = safeRoadmap.filter(d => d && (d.status === 'Completed' || d.completion === 'Done')).length;
  const totalStudyMinutesLogged = safeRoadmap.reduce((sum, d) => sum + (Number(d?.actualMinutes) || 0), 0);
  const totalStudyHoursLogged = (totalStudyMinutesLogged / 60).toFixed(1);
  const totalRoadmapTasks = safeRoadmap.length * 4;
  const totalCompletedRoadmapTasks = safeRoadmap.reduce((sum, w) => sum + (Array.isArray(w?.completedTasks) ? w.completedTasks.length : (w?.status === 'Completed' ? 4 : 0)), 0);
  const roadmapCompletionPercent = totalRoadmapDays > 0 
    ? Math.round((completedRoadmapDays / totalRoadmapDays) * 100) 
    : 0;

  // Active current roadmap milestone (the first in-progress or first study day)
  const currentRoadmapWeek = safeRoadmap.find(w => w && (w.status === 'In Progress' || w.status === 'Study')) || safeRoadmap[0] || null;
  const currentRoadmapWeekDoneTasks = Array.isArray(currentRoadmapWeek?.completedTasks) ? currentRoadmapWeek.completedTasks.length : (currentRoadmapWeek?.status === 'Completed' ? 4 : 0);

  // Marvel Watchlist Metrics
  const marvelList = safeCustomLists.find(l => l && l.id === 'list-mcu-doomsday') || safeCustomLists[0] || null;
  const marvelItems = Array.isArray(marvelList?.items) ? marvelList.items : [];
  const marvelWatchedCount = marvelItems.filter(i => i && i.status === 'watched').length;
  const marvelSkippedCount = marvelItems.filter(i => i && i.status === 'skipped').length;
  const marvelProgressPercent = marvelItems.length > 0 
    ? Math.round((marvelWatchedCount / marvelItems.length) * 100) 
    : 0;
  const nextMarvelItem = marvelItems.find(i => i && i.status === 'unwatched');

  return (
    <AppContext.Provider
      value={{
        habits: safeHabits,
        transactions: safeTransactions,
        jars: Array.isArray(jars) ? jars : DEFAULT_JARS,
        roadmap: safeRoadmap,
        customLists: safeCustomLists,
        marvelList,
        marvelItems,
        marvelWatchedCount,
        marvelSkippedCount,
        marvelProgressPercent,
        nextMarvelItem,
        healthProtocol: healthProtocol || DEFAULT_HEALTH_PROTOCOL,
        updateHealthProtocol,
        importHealthProtocolFromExcel,
        resetHealthProtocolToDefault,
        updateUserHealthProtocol,
        addProtocolTasksToToday,
        settings: settings || DEFAULT_SETTINGS,
        activeTab,
        setActiveTab,
        syncStatus,
        setSyncStatus,
        isQuickAddOpen,
        setIsQuickAddOpen,
        isMobileDrawerOpen,
        setIsMobileDrawerOpen,
        todayStr,
        todayCompletedHabits,
        todayHabitProgress,
        currentStreak,
        yesterdayStr,
        yesterdayProgress,
        dailyHistory,
        dailyHabitNotes,
        todos: habits,
        syncAllHistoryToCloud,
        saveHabitDailyNote,
        getHabitDailyNote,
        deleteHabitDailyNote,
        getPastDayProgress,
        getPast30DaysHistory,
        getAllDailyHistoryFromDB,
        currentMonthIncome,
        currentMonthExpense,
        netSavings,
        totalRoadmapDays,
        completedRoadmapDays,
        totalStudyMinutesLogged,
        totalStudyHoursLogged,
        totalRoadmapTasks,
        totalCompletedRoadmapTasks,
        roadmapCompletionPercent,
        currentRoadmapWeek,
        currentRoadmapWeekDoneTasks,
        updateDayPlan,
        toggleDayComplete,
        toggleDayChecklist,
        recalculateAllDates,
        shiftDatesFromDay,
        updateDayDate,
        swapDayDates,
        devPlanConcepts,
        toggleConceptMastery,
        devPlanWeeklyReviews,
        updateWeeklyReview,
        devPlanResources: DEV_PLAN_RESOURCES,
        devPlanAiWorkflow: DEV_PLAN_AI_WORKFLOW,
        defaultPlanStartDate: DEFAULT_PLAN_START_DATE,
        defaultDailyTargetHours: DEFAULT_DAILY_TARGET_HOURS,
        totalPlanDays: TOTAL_PLAN_DAYS,
        toggleHabit,
        addHabit,
        updateHabit,
        deleteHabit,
        reorderHabits,
        moveHabit,
        bulkDeleteHabits,
        clearAllHabits,
        resetHabitsToDefault,
        markAllHabitsToday,
        resetAllHabitsToday,
        addTransaction,
        deleteTransaction,
        updateJar,
        setAllJars,
        updateSalaryAndJars,
        addJar,
        deleteJar,
        resetJarsToDefault,
        addRoadmapWeek,
        updateRoadmapWeek,
        deleteRoadmapWeek,
        resetRoadmapToDefault,
        toggleRoadmapTask,
        updateWeekStatus,
        toggleLightWeek,
        updateWeekNotes,
        toggleListItem,
        addCustomList,
        updateCustomList,
        deleteCustomList,
        addListItem,
        deleteListItem,
        resetMarvelList,
        updateSettings,
        pushToCloud,
        triggerCelebration,
        dailyMeals,
        todayCaloriesConsumed,
        logDietItem,
        removeDietMeal,
        removeDietItem,
        workoutHistory,
        addWorkoutRecord,
        deleteWorkoutRecord,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
