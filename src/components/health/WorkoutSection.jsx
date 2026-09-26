import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Dumbbell, 
  Play, 
  Calendar, 
  Flame, 
  Clock, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Sparkles,
  TrendingUp,
  Heart,
  RotateCcw,
  Check
} from 'lucide-react';
import { 
  WORKOUT_DAYS, 
  WORKOUT_PROGRESSIONS, 
  WEEKLY_SCHEDULE_OVERVIEW 
} from '../../services/workoutPlanData';
import { ExerciseAnimation } from './ExerciseAnimation';
import { WorkoutPlayerModal } from './WorkoutPlayerModal';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const WorkoutSection = () => {
  const { todayStr } = useApp();
  const { currentUser } = useAuth();

  // Determine current day of week (0 = Sunday, 1 = Monday, ...)
  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayDayIndex = new Date().getDay();
  const defaultDayKey = dayKeys[todayDayIndex] || 'monday';

  const [selectedDayKey, setSelectedDayKey] = useState(defaultDayKey);
  const [selectedProgressionWeek, setSelectedProgressionWeek] = useState(3); // Default Week 3 (40/20)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const currentDayPlan = WORKOUT_DAYS[selectedDayKey] || WORKOUT_DAYS.monday;
  const currentProgression = WORKOUT_PROGRESSIONS.find(p => p.week === selectedProgressionWeek) || WORKOUT_PROGRESSIONS[2];

  // Storage key for user workout logs
  const currentUserId = currentUser?.uid || 'default_user';
  const historyStorageKey = `life_tracker_workout_history_${currentUserId}`;

  const [workoutHistory, setWorkoutHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(historyStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveHistoryToStorage = (updated) => {
    setWorkoutHistory(updated);
    try {
      localStorage.setItem(historyStorageKey, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save workout history:', e);
    }
  };

  // Workout completed in player callback
  const handleWorkoutCompleted = (record) => {
    const updated = [record, ...workoutHistory];
    saveHistoryToStorage(updated);
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };

  // Delete history entry
  const handleDeleteRecord = (id) => {
    saveHistoryToStorage(workoutHistory.filter(h => h.id !== id));
  };

  // Calculate high-level stats
  const totalWorkouts = workoutHistory.length;
  const totalMinutesTrained = workoutHistory.reduce((s, h) => s + (h.durationMinutes || 0), 0);
  const totalCaloriesBurned = workoutHistory.reduce((s, h) => s + (h.caloriesBurned || 0), 0);

  // Check which days were completed this week
  const completedDayIdsThisWeek = useMemo(() => {
    const currentWeekStart = new Date();
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1); // Monday
    currentWeekStart.setHours(0, 0, 0, 0);

    const completed = new Set();
    workoutHistory.forEach(record => {
      const recordDate = new Date(record.date);
      if (recordDate >= currentWeekStart) {
        completed.add(record.dayId);
      }
    });
    return completed;
  }, [workoutHistory]);

  return (
    <div className="workout-section-hub">
      {/* Interactive Workout Session Player Modal */}
      <WorkoutPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        dayPlan={currentDayPlan}
        progression={currentProgression}
        onWorkoutComplete={handleWorkoutCompleted}
      />

      {/* Main Section Header Card */}
      <div className="card workout-hub-header">
        <div className="whh-top">
          <div className="whh-left">
            <div className="proto-icon-wrap bg-purple">
              <Dumbbell size={22} />
            </div>
            <div>
              <h3 className="proto-title">6-Day Low-Impact 20-Min Workout Protocol</h3>
              <p className="proto-sub">Fat Loss + Strength + Toned Body • Beginner & Joint Friendly (No Jumping)</p>
            </div>
          </div>

          <div className="whh-actions">
            {/* Progression Selector */}
            <div className="progression-pill-select">
              <span className="prog-select-lbl">Progression:</span>
              <select
                value={selectedProgressionWeek}
                onChange={(e) => setSelectedProgressionWeek(Number(e.target.value))}
                className="prog-select-dropdown"
              >
                {WORKOUT_PROGRESSIONS.map(p => (
                  <option key={p.week} value={p.week}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-start-workout"
              onClick={() => setIsPlayerOpen(true)}
              title="Launch Guided Interactive 20-Min Workout with Timer"
            >
              <Play size={16} fill="currentColor" />
              <span>Start {currentDayPlan.title} (20 Min)</span>
            </button>
          </div>
        </div>

        {/* Weekly Schedule Days Tabs */}
        <div className="workout-days-nav">
          {Object.values(WORKOUT_DAYS).map((day) => {
            const isSelected = selectedDayKey === day.id;
            const isCompletedThisWeek = completedDayIdsThisWeek.has(day.id);
            const isToday = dayKeys[todayDayIndex] === day.id;

            return (
              <button
                key={day.id}
                type="button"
                className={`day-tab-btn ${isSelected ? 'active' : ''} ${isToday ? 'is-today' : ''}`}
                onClick={() => setSelectedDayKey(day.id)}
              >
                <div className="dtb-top">
                  <span className="dtb-icon">{day.icon}</span>
                  <span className="dtb-name">{day.name.slice(0, 3)}</span>
                  {isCompletedThisWeek && (
                    <span className="dtb-check" title="Completed this week">
                      <Check size={11} />
                    </span>
                  )}
                </div>
                <span className="dtb-title">{day.title}</span>
                {isToday && <span className="today-badge">Today</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Overview & Safety Guarantee Banner */}
      <div className="workout-day-overview card" style={{ borderLeftColor: currentDayPlan.accentColor }}>
        <div className="wdo-content">
          <div className="wdo-header">
            <span className="wdo-badge" style={{ backgroundColor: `${currentDayPlan.accentColor}20`, color: currentDayPlan.accentColor }}>
              {currentDayPlan.icon} {currentDayPlan.name.toUpperCase()} FOCUS: {currentDayPlan.title.toUpperCase()}
            </span>
            <span className="wdo-goal-tag">{currentDayPlan.badge}</span>
          </div>

          <h4 className="wdo-goal">{currentDayPlan.goal}</h4>

          <div className="wdo-structure-row">
            <span className="structure-pill">
              <Clock size={13} /> <strong>3 Min:</strong> Warm-Up
            </span>
            <span className="structure-pill">
              <Flame size={13} /> <strong>14 Min:</strong> 6 Exercises × 2 Rounds ({currentProgression.workSec}s work / {currentProgression.restSec}s rest)
            </span>
            <span className="structure-pill">
              <Heart size={13} /> <strong>3 Min:</strong> Cool-Down & Stretch
            </span>
          </div>

          <div className="wdo-knee-safety-bar">
            <ShieldCheck size={16} className="text-success flex-shrink-0" />
            <span>
              <strong>Knee & Ankle Friendly:</strong> Every movement uses controlled low-impact mechanics. No jumping or pounding required.
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-launch-stage"
          onClick={() => setIsPlayerOpen(true)}
        >
          <Play size={18} fill="currentColor" />
          <span>Launch Session</span>
        </button>
      </div>

      {/* Exercise Cards Grid with Animated Visual Demonstrations */}
      <div className="workout-exercises-grid">
        {currentDayPlan.exercises.map((exercise, idx) => (
          <div key={exercise.id} className="card exercise-item-card">
            <div className="eic-top">
              <span className="eic-number">0{idx + 1}</span>
              <span className="eic-duration">{exercise.durationSec ? `${exercise.durationSec}s` : '60s'} {exercise.splitTime ? `(${exercise.splitTime})` : ''}</span>
            </div>

            {/* Animated Biomechanical Vector Illustration */}
            <div className="eic-anim-stage">
              <ExerciseAnimation 
                animationType={exercise.animationType}
                isPlaying={true}
                size={145}
                showGuide={true}
                showFormBreakdown={false}
              />
            </div>

            <div className="eic-details">
              <h5 className="eic-title">{exercise.name}</h5>
              <span className="eic-target">🎯 {exercise.target}</span>
              <p className="eic-instructions">{exercise.instructions}</p>
              
              <div className="eic-coach-tip">
                <strong>👉 Coach Tip:</strong> {exercise.coachTip}
              </div>

              {exercise.lowImpactCue && (
                <div className="eic-low-impact-cue">
                  <ShieldCheck size={13} className="text-success flex-shrink-0" />
                  <span>{exercise.lowImpactCue}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Workout History & App Records Section ("Keep records like other exercise app") */}
      <div className="card workout-records-hub">
        <div className="wrh-header">
          <div>
            <h4 className="wrh-title">📊 Workout Records & Consistency Streak</h4>
            <p className="wrh-sub">Track your 6-day low-impact consistency, completed sessions, and calorie burn records</p>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              const minutes = 20;
              const estKcal = 135;
              const manualRecord = {
                id: `workout-${Date.now()}`,
                date: new Date().toISOString(),
                dateStr: new Date().toLocaleDateString('en-GB'),
                dayId: currentDayPlan.id,
                dayTitle: currentDayPlan.title,
                progressionWeek: selectedProgressionWeek,
                durationMinutes: minutes,
                caloriesBurned: estKcal,
                roundsCompleted: 2,
                rating: 5,
                notes: 'Completed 20-min session',
              };
              handleWorkoutCompleted(manualRecord);
            }}
          >
            <Plus size={14} />
            <span>Quick Log Today ({currentDayPlan.title})</span>
          </button>
        </div>

        {/* Weekly Mon-Sat Consistency Tracker Bar */}
        <div className="weekly-streak-bar">
          <span className="streak-bar-lbl">This Week's Goal (Mon–Sat):</span>
          <div className="streak-days-list">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map(dKey => {
              const dObj = WORKOUT_DAYS[dKey];
              const isDone = completedDayIdsThisWeek.has(dKey);
              return (
                <div key={dKey} className={`streak-day-badge ${isDone ? 'completed' : ''}`}>
                  <span className="sdb-check">{isDone ? '✓' : '○'}</span>
                  <span className="sdb-name">{dObj.name.slice(0, 3)}</span>
                  <span className="sdb-title">{dObj.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overview Stat Counters */}
        <div className="records-stat-counters">
          <div className="stat-counter-box">
            <Award size={20} className="text-primary" />
            <span className="scb-val">{totalWorkouts}</span>
            <span className="scb-lbl">Workouts Completed</span>
          </div>

          <div className="stat-counter-box">
            <Clock size={20} className="text-amber" />
            <span className="scb-val">{totalMinutesTrained} <small>mins</small></span>
            <span className="scb-lbl">Total Time Trained</span>
          </div>

          <div className="stat-counter-box">
            <Flame size={20} className="text-danger" />
            <span className="scb-val">~{totalCaloriesBurned} <small>kcal</small></span>
            <span className="scb-lbl">Est. Calories Burned</span>
          </div>
        </div>

        {/* History Log Table */}
        {workoutHistory.length === 0 ? (
          <div className="empty-history-placeholder">
            <Dumbbell size={28} className="text-sub opacity-40" />
            <p className="empty-history-text">No workouts logged yet. Start today's guided session to build your consistency record!</p>
          </div>
        ) : (
          <div className="workout-history-list">
            <span className="whl-title">Recent Completed Workouts</span>
            {workoutHistory.slice(0, 10).map((record) => (
              <div key={record.id} className="history-record-row">
                <div className="hrr-icon-box">
                  <CheckCircle2 size={18} className="text-success" />
                </div>
                <div className="hrr-main">
                  <div className="hrr-top-line">
                    <span className="hrr-day">{record.dayTitle || 'Workout Session'}</span>
                    <span className="hrr-date">{record.dateStr}</span>
                  </div>
                  <div className="hrr-meta">
                    <span>⏱️ {record.durationMinutes} mins</span>
                    <span>🔥 ~{record.caloriesBurned} kcal</span>
                    <span>⭐ {record.rating}/5</span>
                    {record.notes && <span className="hrr-notes">"{record.notes}"</span>}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-icon-sm btn-ghost text-danger"
                  onClick={() => handleDeleteRecord(record.id)}
                  title="Delete record"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
