import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  getLocalData,
  setLocalData,
  STORAGE_KEYS,
  DEFAULT_HABITS,
  DEFAULT_TRANSACTIONS,
  DEFAULT_JARS,
  DEFAULT_ROADMAP,
  DEFAULT_CUSTOM_LISTS,
  DEFAULT_SETTINGS,
  DEFAULT_HEALTH_PROTOCOL,
  getEffectiveTrackerDate,
  pruneOldHistoryData,
} from '../services/storage';
import { initFirebase, syncToCloud, listenToCloud } from '../services/firebase';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const PATH_TO_TAB = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/habits': 'habits',
  '/health': 'protocol',
  '/protocol': 'protocol',
  '/diet': 'protocol',
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

export const TAB_TO_PATH = {
  'dashboard': '/',
  'habits': '/habits',
  'protocol': '/health',
  'health': '/health',
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

  const [roadmap, setRoadmap] = useState(() => {
    try {
      const data = getLocalData(STORAGE_KEYS.ROADMAP, null);
      if (Array.isArray(data) && data.length > 0) return data;
      setLocalData(STORAGE_KEYS.ROADMAP, DEFAULT_ROADMAP);
      return DEFAULT_ROADMAP;
    } catch {
      return DEFAULT_ROADMAP;
    }
  });

  const [customLists, setCustomLists] = useState(() => {
    try {
      const data = getLocalData(STORAGE_KEYS.CUSTOM_LISTS, null);
      if (Array.isArray(data) && data.length > 0 && data.some(l => l && Array.isArray(l.items) && l.items.length > 0)) return data;
      setLocalData(STORAGE_KEYS.CUSTOM_LISTS, DEFAULT_CUSTOM_LISTS);
      return DEFAULT_CUSTOM_LISTS;
    } catch {
      return DEFAULT_CUSTOM_LISTS;
    }
  });

  const [healthProtocol, setHealthProtocol] = useState(() => {
    const data = getLocalData(STORAGE_KEYS.HEALTH_PROTOCOL, DEFAULT_HEALTH_PROTOCOL);
    return data && typeof data === 'object' ? data : DEFAULT_HEALTH_PROTOCOL;
  });

  const [dailyHistory, setDailyHistory] = useState(() => {
    const data = getLocalData(STORAGE_KEYS.DAILY_HISTORY, {});
    const { prunedHistory } = pruneOldHistoryData(data, [], 30);
    return prunedHistory;
  });

  const [settings, setSettings] = useState(() => {
    const data = getLocalData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    return data && typeof data === 'object' ? { ...DEFAULT_SETTINGS, ...data } : DEFAULT_SETTINGS;
  });
  
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
    const payload = customPayload || {
      habits: habits || [],
      transactions: transactions || [],
      jars: jars || DEFAULT_JARS,
      roadmap: roadmap || DEFAULT_ROADMAP,
      customLists: customLists || DEFAULT_CUSTOM_LISTS,
      healthProtocol: healthProtocol || DEFAULT_HEALTH_PROTOCOL,
      dailyHistory: dailyHistory || {},
      settings: settings || DEFAULT_SETTINGS,
    };
    const res = await syncToCloud('default_user', payload);
    if (res.success) {
      setSyncStatus('synced');
    } else {
      setSyncStatus(res.reason === 'offline_mode' ? 'local' : 'error');
    }
  }, [habits, transactions, jars, roadmap, customLists, healthProtocol, dailyHistory, settings]);

  // Dynamic tracker date with 10:30 PM (22:30) auto-reset cutoff for next day
  const [todayStr, setTodayStr] = useState(() => getEffectiveTrackerDate());

  // Interval to auto-advance to next day after 10:30 PM (22:30)
  useEffect(() => {
    const checkTimer = setInterval(() => {
      const currentEffectiveDate = getEffectiveTrackerDate();
      if (todayStr !== currentEffectiveDate) {
        // Date transition after 10:30 PM!
        const currentHabits = Array.isArray(habits) ? habits : [];
        const completedCount = currentHabits.filter(h => h && Array.isArray(h.completedDates) && h.completedDates.includes(todayStr)).length;
        const totalCount = currentHabits.length;
        const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        const updatedHist = {
          ...(dailyHistory || {}),
          [todayStr]: {
            date: todayStr,
            total: totalCount,
            completed: completedCount,
            percent,
            archivedAt: new Date().toISOString()
          }
        };
        setDailyHistory(updatedHist);
        setLocalData(STORAGE_KEYS.DAILY_HISTORY, updatedHist);

        if (settings?.habitRolloverMode === 'auto_clear') {
          setHabits([]);
          setLocalData(STORAGE_KEYS.HABITS, []);
          pushToCloud({ habits: [], transactions, jars, roadmap, customLists, healthProtocol, dailyHistory: updatedHist, settings });
        }

        setTodayStr(currentEffectiveDate);
      }
    }, 10000);

    return () => clearInterval(checkTimer);
  }, [todayStr, habits, dailyHistory, settings?.habitRolloverMode, transactions, jars, roadmap, customLists, healthProtocol, pushToCloud]);

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
    if (healthProtocol) setLocalData(STORAGE_KEYS.HEALTH_PROTOCOL, healthProtocol);
  }, [healthProtocol]);

  useEffect(() => {
    if (dailyHistory) setLocalData(STORAGE_KEYS.DAILY_HISTORY, dailyHistory);
  }, [dailyHistory]);

  useEffect(() => {
    if (settings) setLocalData(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  // Initialize Firebase and real-time cloud sync
  useEffect(() => {
    const fbResult = initFirebase();
    if (fbResult.success) {
      setSyncStatus('synced');

      const unsubscribe = listenToCloud('default_user', (cloudData) => {
        if (!cloudData) return;
        if (Array.isArray(cloudData.habits)) setHabits(cloudData.habits);
        if (Array.isArray(cloudData.transactions)) setTransactions(cloudData.transactions);
        if (Array.isArray(cloudData.jars)) {
          const isOldDefault = !cloudData.jars.some(j => j && j.id === 'jar-snacks');
          if (isOldDefault) {
            setJars(DEFAULT_JARS);
            setLocalData(STORAGE_KEYS.JARS, DEFAULT_JARS);
            syncToCloud('default_user', { jars: DEFAULT_JARS });
          } else {
            setJars(cloudData.jars);
            setLocalData(STORAGE_KEYS.JARS, cloudData.jars);
          }
        }
        if (Array.isArray(cloudData.roadmap) && cloudData.roadmap.length > 0) {
          setRoadmap(cloudData.roadmap);
          setLocalData(STORAGE_KEYS.ROADMAP, cloudData.roadmap);
        } else if (!cloudData.roadmap) {
          syncToCloud('default_user', { roadmap: DEFAULT_ROADMAP });
        }

        if (Array.isArray(cloudData.customLists) && cloudData.customLists.length > 0 && cloudData.customLists.some(l => l && Array.isArray(l.items) && l.items.length > 0)) {
          setCustomLists(cloudData.customLists);
          setLocalData(STORAGE_KEYS.CUSTOM_LISTS, cloudData.customLists);
        } else if (!cloudData.customLists || cloudData.customLists.length === 0) {
          syncToCloud('default_user', { customLists: DEFAULT_CUSTOM_LISTS });
        }

        if (cloudData.healthProtocol) setHealthProtocol(cloudData.healthProtocol);
        if (cloudData.dailyHistory) setDailyHistory(cloudData.dailyHistory);
        if (cloudData.settings) setSettings(prev => ({ ...prev, ...cloudData.settings }));
      });

      return () => unsubscribe && unsubscribe();
    } else {
      setSyncStatus('local');
    }
  }, []);

  // Habit Operations
  const toggleHabit = (habitId, dateStr = todayStr) => {
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
      pushToCloud({ habits: updated, transactions, jars, roadmap, customLists, healthProtocol, dailyHistory, settings });
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
      pushToCloud({ habits: updated, transactions, jars, roadmap, customLists, healthProtocol, dailyHistory, settings });
      return updated;
    });
  };

  const updateHabit = (id, habitData) => {
    setHabits(prevHabits => {
      const currentHabits = Array.isArray(prevHabits) ? prevHabits : [];
      const updated = currentHabits.map(h => h.id === id ? { ...h, ...habitData } : h);
      setLocalData(STORAGE_KEYS.HABITS, updated);
      pushToCloud({ habits: updated, transactions, jars, roadmap, customLists, healthProtocol, dailyHistory, settings });
      return updated;
    });
  };

  const deleteHabit = (id) => {
    setHabits(prevHabits => {
      const currentHabits = Array.isArray(prevHabits) ? prevHabits : [];
      const updated = currentHabits.filter(h => h.id !== id);
      setLocalData(STORAGE_KEYS.HABITS, updated);
      pushToCloud({ habits: updated, transactions, jars, roadmap, customLists, healthProtocol, dailyHistory, settings });
      return updated;
    });
  };

  const bulkDeleteHabits = (habitIds = []) => {
    if (!Array.isArray(habitIds) || habitIds.length === 0) return;
    const idSet = new Set(habitIds);
    setHabits(prevHabits => {
      const currentHabits = Array.isArray(prevHabits) ? prevHabits : [];
      const updated = currentHabits.filter(h => !idSet.has(h.id));
      setLocalData(STORAGE_KEYS.HABITS, updated);
      pushToCloud({ habits: updated, transactions, jars, roadmap, customLists, healthProtocol, dailyHistory, settings });
      return updated;
    });
  };

  const clearAllHabits = () => {
    setHabits([]);
    setLocalData(STORAGE_KEYS.HABITS, []);
    pushToCloud({ habits: [], transactions, jars, roadmap, customLists, healthProtocol, dailyHistory, settings });
  };

  const resetHabitsToDefault = () => {
    setHabits(DEFAULT_HABITS);
    setLocalData(STORAGE_KEYS.HABITS, DEFAULT_HABITS);
    pushToCloud({ habits: DEFAULT_HABITS, transactions, jars, roadmap, customLists, healthProtocol, dailyHistory, settings });
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
      triggerCelebration();
      pushToCloud({ habits: updated, transactions, jars, roadmap, customLists, healthProtocol, dailyHistory, settings });
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
        // Since today is reset, check yesterday
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
      pushToCloud({ habits: updated, transactions, jars, roadmap, customLists, healthProtocol, dailyHistory, settings });
      return updated;
    });
  };

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
    setJars(safeJars);
    setLocalData(STORAGE_KEYS.JARS, safeJars);
    pushToCloud({ habits, transactions, jars: safeJars, roadmap, customLists, healthProtocol, dailyHistory, settings });
  };

  const updateJar = (jarId, jarData) => {
    const currentJars = Array.isArray(jars) ? jars : DEFAULT_JARS;
    const updated = currentJars.map(j => j.id === jarId ? { ...j, ...jarData } : j);
    setJars(updated);
    setLocalData(STORAGE_KEYS.JARS, updated);
    pushToCloud({ habits, transactions, jars: updated, roadmap, customLists, healthProtocol, dailyHistory, settings });
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
    setJars(updated);
    setLocalData(STORAGE_KEYS.JARS, updated);
    pushToCloud({ habits, transactions, jars: updated, roadmap, customLists, healthProtocol, dailyHistory, settings });
  };

  const deleteJar = (jarId) => {
    const currentJars = Array.isArray(jars) ? jars : DEFAULT_JARS;
    const updated = currentJars.filter(j => j.id !== jarId);
    setJars(updated);
    setLocalData(STORAGE_KEYS.JARS, updated);
    pushToCloud({ habits, transactions, jars: updated, roadmap, customLists, healthProtocol, dailyHistory, settings });
  };

  const resetJarsToDefault = () => {
    setJars(DEFAULT_JARS);
    setLocalData(STORAGE_KEYS.JARS, DEFAULT_JARS);
    pushToCloud({ habits, transactions, jars: DEFAULT_JARS, roadmap, customLists, healthProtocol, dailyHistory, settings });
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
    const currentRoadmap = Array.isArray(roadmap) ? roadmap : DEFAULT_ROADMAP;
    const updated = currentRoadmap.map(week => {
      if (week.id !== weekId) return week;
      const prevCompleted = week.completedTasks || [];
      const isAlreadyDone = prevCompleted.includes(taskKey);
      const newCompleted = isAlreadyDone 
        ? prevCompleted.filter(k => k !== taskKey)
        : [...prevCompleted, taskKey];

      let newStatus = week.status;
      if (newCompleted.length === taskKeys.length) {
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
    pushToCloud({ habits, transactions, jars, roadmap: updated, customLists, settings });
  };

  const updateWeekStatus = (weekId, status) => {
    const currentRoadmap = Array.isArray(roadmap) ? roadmap : DEFAULT_ROADMAP;
    const updated = currentRoadmap.map(week => {
      if (week.id !== weekId) return week;
      const isCompleted = status === 'Completed';
      const allTasks = ['dsa', 'fullstack', 'mobile', 'project', 'career'];
      return {
        ...week,
        status,
        completedTasks: isCompleted ? allTasks : (status === 'Not Started' ? [] : week.completedTasks),
      };
    });
    setRoadmap(updated);
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
    const updated = { ...(settings || DEFAULT_SETTINGS), ...newSettings };
    setSettings(updated);
    pushToCloud({ habits, transactions, jars, roadmap, customLists, healthProtocol, settings: updated });
  };

  // Health Protocol Operations
  const updateHealthProtocol = (newProtocol) => {
    setHealthProtocol(prev => {
      const updated = typeof newProtocol === 'function' ? newProtocol(prev || DEFAULT_HEALTH_PROTOCOL) : { ...(prev || DEFAULT_HEALTH_PROTOCOL), ...newProtocol };
      setLocalData(STORAGE_KEYS.HEALTH_PROTOCOL, updated);
      pushToCloud({ habits, transactions, jars, roadmap, customLists, healthProtocol: updated, settings });
      return updated;
    });
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
    const safeHabitsList = Array.isArray(habits) ? habits : DEFAULT_HABITS;
    const completedTasks = safeHabitsList.filter(h => h.completedDates?.includes(targetDateStr));
    const uncompletedTasks = safeHabitsList.filter(h => !h.completedDates?.includes(targetDateStr));
    const total = safeHabitsList.length;
    const completed = completedTasks.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      date: targetDateStr,
      total,
      completed,
      percent,
      completedTasks,
      uncompletedTasks
    };
  };

  const getPast30DaysHistory = () => {
    const list = [];
    const safeHabitsList = Array.isArray(habits) ? habits : DEFAULT_HABITS;
    const baseDate = new Date(todayStr + 'T00:00:00');

    for (let i = 0; i < 30; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const completedTasks = safeHabitsList.filter(h => h.completedDates?.includes(dateStr));
      const uncompletedTasks = safeHabitsList.filter(h => !h.completedDates?.includes(dateStr));
      const total = safeHabitsList.length;
      const completed = completedTasks.length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

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

  // Calculated Metrics (Guaranteed Safe)
  const safeHabits = Array.isArray(habits) ? habits.filter(Boolean) : [];
  const safeTransactions = Array.isArray(transactions) ? transactions.filter(Boolean) : [];
  const safeRoadmap = Array.isArray(roadmap) ? roadmap.filter(Boolean) : [];
  const safeCustomLists = Array.isArray(customLists) ? customLists.filter(Boolean) : [];

  const todayCompletedHabits = safeHabits.filter(h => h && Array.isArray(h.completedDates) && h.completedDates.includes(todayStr)).length;
  const todayHabitProgress = safeHabits.length > 0 ? Math.round((todayCompletedHabits / safeHabits.length) * 100) : 0;

  const currentMonthStr = typeof todayStr === 'string' ? todayStr.substring(0, 7) : '';
  const currentMonthTransactions = safeTransactions.filter(t => t && typeof t.date === 'string' && t.date.startsWith(currentMonthStr));
  
  const currentMonthIncome = currentMonthTransactions
    .filter(t => t && t.type === 'income')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const currentMonthExpense = currentMonthTransactions
    .filter(t => t && t.type === 'expense')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const netSavings = currentMonthIncome - currentMonthExpense;

  // Roadmap Metrics
  const totalRoadmapTasks = safeRoadmap.length * 5;
  const totalCompletedRoadmapTasks = safeRoadmap.reduce((sum, w) => sum + (Array.isArray(w?.completedTasks) ? w.completedTasks.length : 0), 0);
  const roadmapCompletionPercent = totalRoadmapTasks > 0 
    ? Math.round((totalCompletedRoadmapTasks / totalRoadmapTasks) * 100) 
    : 0;

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
        customLists: safeCustomLists,
        marvelList,
        marvelItems,
        marvelWatchedCount,
        marvelSkippedCount,
        marvelProgressPercent,
        nextMarvelItem,
        healthProtocol: healthProtocol || DEFAULT_HEALTH_PROTOCOL,
        updateHealthProtocol,
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
        dailyHistory,
        getPastDayProgress,
        getPast30DaysHistory,
        currentMonthIncome,
        currentMonthExpense,
        netSavings,
        totalRoadmapTasks,
        totalCompletedRoadmapTasks,
        roadmapCompletionPercent,
        toggleHabit,
        addHabit,
        updateHabit,
        deleteHabit,
        bulkDeleteHabits,
        clearAllHabits,
        resetHabitsToDefault,
        markAllHabitsToday,
        resetAllHabitsToday,
        addTransaction,
        deleteTransaction,
        updateJar,
        setAllJars,
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
