/**
 * Water Tracker & Scheduled Drinking Water Reminder Service
 * - Tracks daily water intake in ml and glasses (250ml per glass)
 * - Persists logs by date in localStorage
 * - Plays soothing water-drop chime via Web Audio API
 * - Triggers desktop/browser notification and in-app hydration reminders
 */

const STORAGE_KEY = 'life_tracker_water_data_v2';
const DEFAULT_TARGET_ML = 2500; // 2.5 Liters (10 glasses of 250ml)

class WaterReminderService {
  constructor() {
    this.audioCtx = null;
    this.timerId = null;
    this.listeners = new Set();
  }

  // Initialize Web Audio API
  initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Melodic water drop chime (two gentle sine tones mimicking a droplet splash)
  playWaterChime() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      // Tone 1: gentle low drop
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.22);

      // Tone 2: high crystalline ripple
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.1); // A5
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.25); // D6
      gain2.gain.setValueAtTime(0.12, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.35);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  // Request browser notification permission
  async requestNotificationPermission() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const res = await Notification.requestPermission();
        return res === 'granted';
      }
      return Notification.permission === 'granted';
    }
    return false;
  }

  // Send browser notification if allowed
  sendNotification(title = '💧 Time to Drink Water!', body = 'Take a sip of water to stay energized, focused, and keep your skin hydrated.') {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      } catch (e) {
        console.warn('Notification error:', e);
      }
    }
  }

  // Get data for a specific date
  getData(dateStr = new Date().toISOString().split('T')[0]) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const dayData = parsed[dateStr] || {
        currentMl: 0,
        targetMl: parsed.defaultTargetMl || DEFAULT_TARGET_ML,
        logs: [],
        lastReminderTime: null,
      };

      return {
        dateStr,
        currentMl: dayData.currentMl || 0,
        targetMl: dayData.targetMl || parsed.defaultTargetMl || DEFAULT_TARGET_ML,
        logs: dayData.logs || [],
        reminderEnabled: parsed.reminderEnabled ?? true,
        reminderIntervalMinutes: parsed.reminderIntervalMinutes || 60,
        soundEnabled: parsed.soundEnabled ?? true,
        lastReminderTime: parsed.lastReminderTime || null,
      };
    } catch {
      return {
        dateStr,
        currentMl: 0,
        targetMl: DEFAULT_TARGET_ML,
        logs: [],
        reminderEnabled: true,
        reminderIntervalMinutes: 60,
        soundEnabled: true,
        lastReminderTime: null,
      };
    }
  }

  // Log water intake (e.g. +250ml)
  logWater(amountMl = 250, dateStr = new Date().toISOString().split('T')[0], label = 'Glass') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const day = parsed[dateStr] || {
        currentMl: 0,
        targetMl: parsed.defaultTargetMl || DEFAULT_TARGET_ML,
        logs: [],
      };

      const newCurrent = Math.max(0, (day.currentMl || 0) + amountMl);
      const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      const newLog = {
        id: `w-${Date.now()}`,
        amountMl,
        time: timeStr,
        label,
        timestamp: Date.now(),
      };

      parsed[dateStr] = {
        ...day,
        currentMl: newCurrent,
        logs: [newLog, ...(day.logs || [])].slice(0, 50),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      this.playWaterChime();
      this.notifyListeners();
      return this.getData(dateStr);
    } catch (e) {
      console.error('Error logging water:', e);
      return this.getData(dateStr);
    }
  }

  // Undo last water log
  undoLast(dateStr = new Date().toISOString().split('T')[0]) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const day = parsed[dateStr];
      if (!day || !day.logs || day.logs.length === 0) return this.getData(dateStr);

      const [removed, ...remainingLogs] = day.logs;
      const newCurrent = Math.max(0, day.currentMl - (removed.amountMl || 250));

      parsed[dateStr] = {
        ...day,
        currentMl: newCurrent,
        logs: remainingLogs,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      this.notifyListeners();
      return this.getData(dateStr);
    } catch {
      return this.getData(dateStr);
    }
  }

  // Update target daily milliliters
  setTarget(targetMl = 2500, dateStr = new Date().toISOString().split('T')[0]) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      parsed.defaultTargetMl = targetMl;
      if (parsed[dateStr]) {
        parsed[dateStr].targetMl = targetMl;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      this.notifyListeners();
    } catch {}
  }

  // Update reminder settings
  updateReminderSettings(settings = {}) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      if (settings.reminderEnabled !== undefined) parsed.reminderEnabled = settings.reminderEnabled;
      if (settings.reminderIntervalMinutes !== undefined) parsed.reminderIntervalMinutes = settings.reminderIntervalMinutes;
      if (settings.soundEnabled !== undefined) parsed.soundEnabled = settings.soundEnabled;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      this.notifyListeners();
    } catch {}
  }

  // Check and trigger scheduled reminder if due
  checkScheduledReminder(onReminderCallback) {
    const data = this.getData();
    if (!data.reminderEnabled) return;

    const intervalMs = (data.reminderIntervalMinutes || 60) * 60 * 1000;
    const now = Date.now();
    const lastReminder = data.lastReminderTime ? Number(data.lastReminderTime) : 0;

    // Only remind between 7 AM and 10:30 PM (daytime hours)
    const hour = new Date().getHours();
    if (hour < 7 || hour >= 22) return;

    if (now - lastReminder >= intervalMs) {
      // Mark as reminded
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        parsed.lastReminderTime = now;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch {}

      if (data.soundEnabled) {
        this.playWaterChime();
      }
      this.sendNotification(
        '💧 Time for a Glass of Water!',
        `You have drunk ${Math.round(data.currentMl)}ml today (${Math.round((data.currentMl / data.targetMl) * 100)}% of goal). Grab a fresh glass now!`
      );

      if (onReminderCallback) {
        onReminderCallback({
          message: '💧 Hydration Reminder: Time for a fresh glass of water!',
          currentMl: data.currentMl,
          targetMl: data.targetMl,
        });
      }
    }
  }

  // Listeners for live UI sync
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => {
      try { cb(); } catch {}
    });
  }
}

export const waterReminderService = new WaterReminderService();
