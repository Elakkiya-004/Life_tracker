import React, { useState, useEffect, useMemo } from 'react';
import { 
  Droplets, 
  Plus, 
  Volume2, 
  VolumeX, 
  Bell, 
  BellOff, 
  Clock, 
  Check, 
  RotateCcw, 
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { waterReminderService } from '../../services/waterReminderService';
import { useApp } from '../../context/AppContext';

export const WaterReminderCard = ({ compact = false, onAddHabitSync = null }) => {
  const { todayStr = new Date().toISOString().split('T')[0], habits = [], addHabit } = useApp();
  
  // Local reactive state from waterReminderService
  const [waterData, setWaterData] = useState(() => waterReminderService.getData(todayStr));
  const [notificationPermission, setNotificationPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isChiming, setIsChiming] = useState(false);

  // Subscribe to service updates & poll scheduled reminders
  useEffect(() => {
    setWaterData(waterReminderService.getData(todayStr));

    const unsubscribe = waterReminderService.subscribe(() => {
      setWaterData(waterReminderService.getData(todayStr));
    });

    // Scheduled reminder check timer (runs every 60 seconds)
    const intervalId = setInterval(() => {
      waterReminderService.checkScheduledReminder();
    }, 60000);

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [todayStr]);

  const currentMl = waterData.currentMl || 0;
  const targetMl = waterData.targetMl || 2500;
  const percent = Math.min(100, Math.round((currentMl / targetMl) * 100));
  const glasses = (currentMl / 250).toFixed(1).replace('.0', '');
  const totalGlasses = Math.round(targetMl / 250);

  // Check if water habit is already added to habits list
  const isWaterHabitAdded = useMemo(() => {
    return habits.some(h => 
      h.name && (
        h.name.toLowerCase().includes('water') || 
        h.name.toLowerCase().includes('hydration') ||
        h.name.toLowerCase().includes('2.5l')
      )
    );
  }, [habits]);

  // Actions
  const handleLog = (amountMl, label) => {
    waterReminderService.logWater(amountMl, todayStr, label);
  };

  const handleUndo = () => {
    waterReminderService.undoLast(todayStr);
  };

  const handleToggleReminder = () => {
    const nextVal = !waterData.reminderEnabled;
    waterReminderService.updateReminderSettings({ reminderEnabled: nextVal });
    if (nextVal && notificationPermission === 'default') {
      handleRequestPermission();
    }
  };

  const handleIntervalChange = (mins) => {
    waterReminderService.updateReminderSettings({ reminderIntervalMinutes: Number(mins) });
  };

  const handleToggleSound = () => {
    waterReminderService.updateReminderSettings({ soundEnabled: !waterData.soundEnabled });
  };

  const handlePlayTestChime = () => {
    setIsChiming(true);
    waterReminderService.playWaterChime();
    setTimeout(() => setIsChiming(false), 500);
  };

  const handleRequestPermission = async () => {
    const granted = await waterReminderService.requestNotificationPermission();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    if (granted) {
      waterReminderService.sendNotification(
        '💧 Water Reminder Enabled!',
        `You will be gently reminded every ${waterData.reminderIntervalMinutes} mins between 7:00 AM and 10:30 PM.`
      );
    }
  };

  const handleAddWaterToHabits = () => {
    if (isWaterHabitAdded) return;
    if (onAddHabitSync) {
      onAddHabitSync();
    } else if (addHabit) {
      addHabit({
        name: 'Drink 8-10 Glasses of Water (2.5L)',
        category: 'Diet & Nutrition',
        timeOfDay: 'Daytime',
        icon: 'Droplets',
        color: '#0ea5e9',
        frequency: 'daily',
        targetDays: 7,
      });
    }
  };

  return (
    <div className={`water-reminder-card card ${compact ? 'water-compact' : ''}`}>
      {/* Top Banner Row */}
      <div className="water-card-header">
        <div className="water-title-wrap">
          <div className="water-icon-circle">
            <Droplets className="water-drop-icon" size={22} />
          </div>
          <div>
            <div className="water-badge-line">
              <span className="water-tag">💧 HYDRATION & DRINKING WATER</span>
              {waterData.reminderEnabled && (
                <span className="water-timer-tag">
                  <Clock size={11} />
                  <span>Every {waterData.reminderIntervalMinutes}m (7am - 10:30pm)</span>
                </span>
              )}
            </div>
            <h3 className="water-main-title">
              Daily Water Intake Tracker & Scheduled Reminder
            </h3>
          </div>
        </div>

        <div className="water-header-actions">
          <button 
            type="button" 
            className={`btn-water-sound ${isChiming ? 'chiming' : ''}`}
            onClick={handlePlayTestChime}
            title="Test water droplet chime"
          >
            <Volume2 size={15} />
            <span>Test Chime</span>
          </button>

          <button 
            type="button" 
            className="btn-water-settings-toggle"
            onClick={() => setShowSettings(!showSettings)}
            title="Configure hydration reminder & sound alerts"
          >
            <span>Settings</span>
            {showSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Main Hydration Progress Row */}
      <div className="water-progress-block">
        <div className="water-stats-row">
          <div className="water-stat-item">
            <span className="water-stat-number">{currentMl.toLocaleString()}</span>
            <span className="water-stat-label">/ {targetMl.toLocaleString()} ml consumed</span>
          </div>

          <div className="water-percent-badge" style={{ 
            backgroundColor: percent >= 100 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(14, 165, 233, 0.15)',
            color: percent >= 100 ? '#10b981' : '#38bdf8',
            borderColor: percent >= 100 ? '#10b98140' : '#38bdf840'
          }}>
            <span>{percent}% Completed</span>
            <small>({glasses} of {totalGlasses} glasses)</small>
          </div>
        </div>

        {/* Dynamic Water Wave Progress Bar */}
        <div className="water-progress-track">
          <div 
            className="water-progress-fill" 
            style={{ width: `${percent}%` }}
          >
            <div className="water-progress-shine" />
          </div>
        </div>

        {/* 10 Visual Glass Segments (Clickable to quick log!) */}
        <div className="water-glasses-row" title="Click any glass to quickly log 250ml">
          {Array.from({ length: totalGlasses }).map((_, i) => {
            const isFilled = currentMl >= (i + 1) * 250;
            const isHalf = !isFilled && currentMl >= i * 250 + 125;
            return (
              <button
                key={i}
                type="button"
                className={`water-glass-dot ${isFilled ? 'filled' : isHalf ? 'half' : ''}`}
                onClick={() => handleLog(250, `Glass ${i + 1}`)}
                title={`Glass ${i + 1} (250ml) - Click to log`}
              >
                <Droplets size={12} />
                <span className="glass-number">{i + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Logging Buttons & Habit Sync */}
      <div className="water-actions-bar">
        <div className="water-quick-buttons">
          <button 
            type="button" 
            className="btn-water-quick btn-water-glass"
            onClick={() => handleLog(250, 'Standard Glass')}
          >
            <Plus size={14} />
            <span>+250 ml (1 Glass)</span>
          </button>

          <button 
            type="button" 
            className="btn-water-quick btn-water-bottle"
            onClick={() => handleLog(500, 'Water Bottle')}
          >
            <Plus size={14} />
            <span>+500 ml (Bottle)</span>
          </button>

          <button 
            type="button" 
            className="btn-water-quick btn-water-sip"
            onClick={() => handleLog(150, 'Quick Sip')}
          >
            <Plus size={14} />
            <span>+150 ml (Sip)</span>
          </button>

          {waterData.logs && waterData.logs.length > 0 && (
            <button 
              type="button" 
              className="btn-water-undo"
              onClick={handleUndo}
              title="Undo last logged glass"
            >
              <RotateCcw size={13} />
              <span>Undo</span>
            </button>
          )}
        </div>

        <div className="water-habit-sync">
          {isWaterHabitAdded ? (
            <span className="water-synced-badge">
              <Check size={13} />
              <span>In Today's Routine</span>
            </span>
          ) : (
            <button 
              type="button" 
              className="btn-water-sync-habit"
              onClick={handleAddWaterToHabits}
              title="Add 2.5L Water to your daily routine checklist"
            >
              <Sparkles size={13} />
              <span>+ Add to Daily Routine</span>
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Reminder Settings Drawer */}
      {showSettings && (
        <div className="water-settings-panel">
          <div className="water-settings-grid">
            {/* Reminder Toggle */}
            <div className="water-setting-row">
              <div className="setting-info">
                <span className="setting-title">Scheduled Hydration Reminders</span>
                <span className="setting-desc">Triggers sound chime & in-app prompt during awake hours (7am - 10:30pm).</span>
              </div>
              <label className="water-switch">
                <input 
                  type="checkbox" 
                  checked={waterData.reminderEnabled} 
                  onChange={handleToggleReminder} 
                />
                <span className="slider round" />
              </label>
            </div>

            {/* Reminder Frequency */}
            <div className="water-setting-row">
              <div className="setting-info">
                <span className="setting-title">Reminder Frequency</span>
                <span className="setting-desc">How often should we remind you to drink water?</span>
              </div>
              <select 
                className="water-interval-select"
                value={waterData.reminderIntervalMinutes}
                onChange={(e) => handleIntervalChange(e.target.value)}
                disabled={!waterData.reminderEnabled}
              >
                <option value="30">Every 30 minutes (Intensive hydration)</option>
                <option value="45">Every 45 minutes</option>
                <option value="60">Every 60 minutes (Recommended)</option>
                <option value="90">Every 90 minutes</option>
                <option value="120">Every 2 hours</option>
              </select>
            </div>

            {/* Sound Chime Toggle */}
            <div className="water-setting-row">
              <div className="setting-info">
                <span className="setting-title">Droplet Audio Chime</span>
                <span className="setting-desc">Plays a gentle crystalline water-drop tone via Web Audio API.</span>
              </div>
              <button 
                type="button" 
                className={`btn-sound-toggle ${waterData.soundEnabled ? 'active' : 'disabled'}`}
                onClick={handleToggleSound}
              >
                {waterData.soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                <span>{waterData.soundEnabled ? 'Chime ON' : 'Muted'}</span>
              </button>
            </div>

            {/* Browser Desktop Alerts */}
            <div className="water-setting-row">
              <div className="setting-info">
                <span className="setting-title">Desktop / Browser Notifications</span>
                <span className="setting-desc">
                  {notificationPermission === 'granted' 
                    ? '✅ Desktop alerts active even when tab is in background.' 
                    : 'Get desktop notifications when working in other tabs.'}
                </span>
              </div>
              {notificationPermission === 'granted' ? (
                <span className="notif-granted-pill">
                  <Check size={13} />
                  <span>Active</span>
                </span>
              ) : (
                <button 
                  type="button" 
                  className="btn-enable-notif"
                  onClick={handleRequestPermission}
                >
                  <Bell size={13} />
                  <span>Enable Alerts</span>
                </button>
              )}
            </div>
          </div>

          <div className="water-settings-footer-note">
            <Info size={13} className="text-sub" />
            <span>Reminders are automatically paused between 10:30 PM and 7:00 AM IST so your rest is never disturbed.</span>
          </div>
        </div>
      )}
    </div>
  );
};
