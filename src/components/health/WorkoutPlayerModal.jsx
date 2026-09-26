import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  X, 
  CheckCircle2, 
  Award, 
  Flame, 
  Clock, 
  Sparkles,
  Info,
  ShieldCheck,
  ChevronRight,
  Heart
} from 'lucide-react';
import { ExerciseAnimation } from './ExerciseAnimation';
import { soundEffects } from '../../services/workoutPlanData';

export const WorkoutPlayerModal = ({ 
  isOpen, 
  onClose, 
  dayPlan, 
  progression, 
  onWorkoutComplete 
}) => {
  if (!isOpen || !dayPlan) return null;

  const exercises = dayPlan.exercises || [];
  const workSec = progression?.workSec || 40;
  const restSec = progression?.restSec || 20;

  // Session state: 'warmup' | 'work' | 'rest' | 'mid_break' | 'cooldown' | 'finished'
  const [phase, setPhase] = useState('warmup');
  const [currentRound, setCurrentRound] = useState(1); // 1 or 2
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180); // Warmup starts with 180s (3m)
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Completion Form State
  const [rating, setRating] = useState(5);
  const [userNotes, setUserNotes] = useState('');

  const currentExercise = exercises[currentExerciseIndex] || exercises[0];
  const nextExercise = exercises[currentExerciseIndex + 1] || (currentRound === 1 ? exercises[0] : null);

  // Play sound wrapper
  const triggerSound = (action) => {
    if (!soundEnabled) return;
    if (action === 'beep') soundEffects.countdownBeep();
    if (action === 'work') soundEffects.startWorkChime();
    if (action === 'rest') soundEffects.restChime();
    if (action === 'victory') soundEffects.victoryFanfare();
  };

  // Main Timer Tick Effect
  useEffect(() => {
    if (isPaused || phase === 'finished') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        // Sound countdown on 3, 2, 1
        if (prev <= 4 && prev > 1) {
          triggerSound('beep');
        }

        if (prev <= 1) {
          handlePhaseTransition();
          return 0;
        }
        return prev - 1;
      });

      setTotalTimeElapsed(t => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, phase, currentRound, currentExerciseIndex, workSec, restSec]);

  // Phase Transition Logic
  const handlePhaseTransition = () => {
    if (phase === 'warmup') {
      // Transition to Round 1, Exercise 1
      setPhase('work');
      setCurrentRound(1);
      setCurrentExerciseIndex(0);
      setTimeLeft(workSec);
      triggerSound('work');
      return;
    }

    if (phase === 'work') {
      // Finished an exercise: is it the last exercise in the round?
      if (currentExerciseIndex === exercises.length - 1) {
        if (currentRound === 1) {
          // Halfway mid-break!
          setPhase('mid_break');
          setTimeLeft(60); // 1-minute water break
          triggerSound('rest');
        } else {
          // Finished Round 2! Move to 3-min cool-down
          setPhase('cooldown');
          setTimeLeft(180);
          triggerSound('work');
        }
      } else {
        // Normal rest before next exercise
        setPhase('rest');
        setTimeLeft(restSec);
        triggerSound('rest');
      }
      return;
    }

    if (phase === 'rest') {
      // Move to next exercise
      setCurrentExerciseIndex(prev => prev + 1);
      setPhase('work');
      setTimeLeft(workSec);
      triggerSound('work');
      return;
    }

    if (phase === 'mid_break') {
      // Start Round 2, Exercise 1
      setCurrentRound(2);
      setCurrentExerciseIndex(0);
      setPhase('work');
      setTimeLeft(workSec);
      triggerSound('work');
      return;
    }

    if (phase === 'cooldown') {
      // Finished whole workout!
      setPhase('finished');
      triggerSound('victory');
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      } catch {}
    }
  };

  // Skip Current Phase Button
  const handleSkipPhase = () => {
    handlePhaseTransition();
  };

  // Restart Current Interval
  const handleRestartInterval = () => {
    if (phase === 'work') setTimeLeft(workSec);
    else if (phase === 'rest') setTimeLeft(restSec);
    else if (phase === 'warmup') setTimeLeft(180);
    else if (phase === 'cooldown') setTimeLeft(180);
    else if (phase === 'mid_break') setTimeLeft(60);
  };

  // Format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Finish & Save Record
  const handleSaveAndClose = () => {
    const minutesTrained = Math.max(1, Math.round(totalTimeElapsed / 60));
    const estimatedKcal = Math.round(minutesTrained * 6.5); // ~130 kcal for 20 mins

    const record = {
      id: `workout-${Date.now()}`,
      date: new Date().toISOString(),
      dateStr: new Date().toLocaleDateString('en-GB'),
      dayId: dayPlan.id,
      dayTitle: dayPlan.title,
      progressionWeek: progression?.week || 3,
      durationMinutes: minutesTrained,
      caloriesBurned: estimatedKcal,
      roundsCompleted: currentRound,
      rating,
      notes: userNotes,
    };

    if (onWorkoutComplete) onWorkoutComplete(record);
    onClose();
  };

  // Progress percentage of current interval
  const totalPhaseDuration = phase === 'work' ? workSec : phase === 'rest' ? restSec : phase === 'mid_break' ? 60 : 180;
  const progressPct = Math.max(0, Math.min(100, ((totalPhaseDuration - timeLeft) / totalPhaseDuration) * 100));

  return (
    <div className="workout-player-overlay" role="dialog" aria-modal="true">
      <div className="workout-player-card">
        {/* Top Header Bar */}
        <div className="player-top-bar">
          <div className="player-title-col">
            <span className="player-day-badge" style={{ backgroundColor: `${dayPlan.accentColor}25`, color: dayPlan.accentColor }}>
              {dayPlan.icon} {dayPlan.name} • {dayPlan.title}
            </span>
            <span className="player-sub-info">
              {progression?.label || 'Week 3: 40s Work / 20s Rest'} • Total Elapsed: {formatTime(totalTimeElapsed)}
            </span>
          </div>

          <div className="player-top-actions">
            <button
              type="button"
              className="btn-icon btn-ghost"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Audio Chimes' : 'Unmute Audio Chimes'}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button
              type="button"
              className="btn-icon btn-ghost"
              onClick={onClose}
              title="Exit Workout"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Phase Body */}
        {phase !== 'finished' ? (
          <div className="player-body">
            {/* Status Pills */}
            <div className="player-phase-pills">
              <span className={`phase-pill ${phase === 'work' ? 'active-work' : ''}`}>
                {phase === 'work' ? `🔥 ROUND ${currentRound}/2 • WORK` : phase === 'rest' ? '💤 RECOVERY REST' : phase === 'warmup' ? '🌿 3-MIN WARM-UP' : phase === 'mid_break' ? '💧 1-MIN WATER BREAK' : '🧘 3-MIN COOL-DOWN'}
              </span>
              <span className="round-pill">
                Exercise {currentExerciseIndex + 1} of {exercises.length}
              </span>
            </div>

            {/* Main Interactive Stage */}
            <div className="player-stage-grid">
              {/* Left Column: Visual Animation Demonstration */}
              <div className="player-animation-box">
                {phase === 'work' || phase === 'rest' ? (
                  <>
                    <ExerciseAnimation 
                      animationType={currentExercise.animationType}
                      isPlaying={!isPaused && phase === 'work'}
                      size={200}
                      showGuide={true}
                      showFormBreakdown={true}
                    />
                    <div className="anim-caption">
                      <span className="anim-exercise-name">{currentExercise.name}</span>
                      <span className="anim-target-tag">Target: {currentExercise.target}</span>
                    </div>
                  </>
                ) : (
                  <div className="phase-intro-box">
                    <span className="intro-icon">
                      {phase === 'warmup' ? '🏃' : phase === 'mid_break' ? '💧' : '🧘'}
                    </span>
                    <h3 className="intro-title">
                      {phase === 'warmup' ? 'Gentle 3-Min Warm-Up' : phase === 'mid_break' ? 'Catch Your Breath & Drink Water' : 'Deep 3-Min Stretching'}
                    </h3>
                    <p className="intro-desc">
                      {phase === 'warmup' ? dayPlan.warmup : phase === 'mid_break' ? 'Halfway there! Round 1 completed. Get ready for Round 2.' : dayPlan.cooldown}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Timer & Coaching Form */}
              <div className="player-timer-box">
                {/* Circular / Ring Countdown */}
                <div className={`timer-countdown-ring ${phase === 'work' ? 'work' : phase === 'rest' ? 'rest' : 'misc'}`}>
                  <span className="countdown-number">{formatTime(timeLeft)}</span>
                  <span className="countdown-label">
                    {phase === 'work' ? 'WORK TIME' : phase === 'rest' ? 'RESTING' : 'REMAINING'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="interval-progress-track">
                  <div className="interval-progress-bar" style={{ width: `${progressPct}%` }} />
                </div>

                {/* Next Up Preview during Rest */}
                {phase === 'rest' && nextExercise && (
                  <div className="next-up-preview card">
                    <span className="nup-lbl">UP NEXT:</span>
                    <span className="nup-name">{nextExercise.name}</span>
                    <span className="nup-cue">👉 {nextExercise.coachTip}</span>
                  </div>
                )}

                {/* Form Coaching Card */}
                {phase === 'work' && (
                  <div className="coach-tips-card card">
                    <div className="coach-tip-item">
                      <Info size={15} className="text-primary flex-shrink-0" />
                      <span>{currentExercise.instructions}</span>
                    </div>
                    {currentExercise.lowImpactCue && (
                      <div className="coach-tip-item knee-safe">
                        <ShieldCheck size={15} className="text-success flex-shrink-0" />
                        <span><strong>Knee & Joint Friendly:</strong> {currentExercise.lowImpactCue}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="player-controls-bar">
              <button
                type="button"
                className="btn-control-secondary"
                onClick={handleRestartInterval}
                title="Restart interval"
              >
                <RotateCcw size={18} />
                <span>Restart</span>
              </button>

              <button
                type="button"
                className="btn-control-primary"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? <Play size={24} /> : <Pause size={24} />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                type="button"
                className="btn-control-secondary"
                onClick={handleSkipPhase}
                title="Skip to next"
              >
                <SkipForward size={18} />
                <span>Skip</span>
              </button>
            </div>
          </div>
        ) : (
          /* Workout Complete Screen */
          <div 
            className="player-complete-view"
            style={{
              overflowY: 'auto',
              flex: 1,
              minHeight: 0,
              width: '100%',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: '2.5rem'
            }}
          >
            <div className="complete-hero-circle">
              <Award size={48} className="text-primary" />
            </div>

            <h2 className="complete-heading">Workout Crushed! 🎉</h2>
            <p className="complete-sub">
              You completed your 20-minute {dayPlan.title} session with full low-impact discipline.
            </p>

            {/* Stats Overview */}
            <div className="complete-stats-grid">
              <div className="comp-stat card">
                <Clock size={18} className="text-primary" />
                <span className="cs-val">{Math.round(totalTimeElapsed / 60)} <small>min</small></span>
                <span className="cs-lbl">Total Time</span>
              </div>
              <div className="comp-stat card">
                <Flame size={18} className="text-amber" />
                <span className="cs-val">~{Math.round(totalTimeElapsed / 60 * 6.5)} <small>kcal</small></span>
                <span className="cs-lbl">Est. Calorie Burn</span>
              </div>
              <div className="comp-stat card">
                <CheckCircle2 size={18} className="text-success" />
                <span className="cs-val">12 <small>sets</small></span>
                <span className="cs-lbl">2 Rounds Done</span>
              </div>
            </div>

            {/* User Rating & Notes Form */}
            <div className="complete-form card">
              <label className="comp-label">How did your joints & muscles feel today?</label>
              <div className="rating-stars-row">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${rating >= star ? 'filled' : ''}`}
                    onClick={() => setRating(star)}
                  >
                    ⭐
                  </button>
                ))}
                <span className="rating-desc">
                  {rating === 5 ? 'Amazing! No knee/ankle discomfort' : rating >= 3 ? 'Good, energized session' : 'Tough / Need more rest'}
                </span>
              </div>

              <textarea
                className="calc-input comp-notes"
                placeholder="Optional notes (e.g. Legs felt stronger on squats, used chair for lunges)..."
                rows={2}
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
              />

              <button
                type="button"
                className="btn btn-primary w-full btn-save-workout"
                onClick={handleSaveAndClose}
              >
                <CheckCircle2 size={18} />
                <span>Save to My Workout Records</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
