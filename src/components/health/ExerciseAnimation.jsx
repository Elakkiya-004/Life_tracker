import React from 'react';

/**
 * Animated Vector Illustrations for Low-Impact Bodyweight Exercises
 * Smooth CSS keyframe loops showing precise biomechanics and joint paths.
 */
export const ExerciseAnimation = ({ animationType = 'squat', isPlaying = true, size = 180 }) => {
  return (
    <div 
      className={`exercise-anim-container ${isPlaying ? 'playing' : 'paused'}`}
      style={{ width: size, height: size }}
      aria-label={`Animation of ${animationType}`}
    >
      <svg 
        viewBox="0 0 200 200" 
        className={`anim-svg svg-${animationType}`}
        width="100%" 
        height="100%"
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Floor Line */}
        <line x1="20" y1="170" x2="180" y2="170" stroke="rgba(255,255,255,0.15)" strokeWidth="3" strokeDasharray="4 4" />

        {/* 1. SQUAT / CONTROLLED SQUAT */}
        {(animationType === 'squat' || animationType === 'sumo_squat') && (
          <g className="anim-group-squat">
            {/* Head */}
            <circle cx="100" cy="50" r="12" className="anim-part head" fill="url(#bodyGrad)" />
            {/* Torso */}
            <line x1="100" y1="62" x2="100" y2="110" className="anim-part spine" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
            {/* Arms reaching forward for balance */}
            <polyline points="100,75 125,75 145,75" className="anim-part arms" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Left Leg */}
            <polyline points="100,110 85,138 85,170" className="anim-part left-leg" stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            {/* Right Leg */}
            <polyline points="100,110 115,138 115,170" className="anim-part right-leg" stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            {/* Joint dots */}
            <circle cx="85" cy="138" r="4" fill="#fff" className="anim-part knee-l" />
            <circle cx="115" cy="138" r="4" fill="#fff" className="anim-part knee-r" />
          </g>
        )}

        {/* 2. GLUTE BRIDGE */}
        {animationType === 'bridge' && (
          <g className="anim-group-bridge">
            {/* Floor Mat */}
            <line x1="30" y1="168" x2="170" y2="168" stroke="#334155" strokeWidth="4" />
            {/* Head resting */}
            <circle cx="50" cy="155" r="10" fill="url(#bodyGrad)" />
            {/* Torso lifting */}
            <line x1="58" y1="155" x2="110" y2="130" className="anim-part bridge-torso" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
            {/* Thigh */}
            <line x1="110" y1="130" x2="140" y2="140" className="anim-part bridge-thigh" stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" />
            {/* Shin to floor */}
            <line x1="140" y1="140" x2="140" y2="168" className="anim-part bridge-shin" stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" />
            {/* Hands flat on floor */}
            <line x1="60" y1="165" x2="105" y2="165" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
            {/* Glute power glow indicator */}
            <circle cx="110" cy="130" r="7" fill="#ec4899" opacity="0.8" className="anim-part bridge-glow" filter="url(#glow)" />
          </g>
        )}

        {/* 3. REVERSE LUNGE */}
        {animationType === 'lunge' && (
          <g className="anim-group-lunge">
            {/* Head */}
            <circle cx="95" cy="45" r="11" className="anim-part head" fill="url(#bodyGrad)" />
            {/* Torso upright */}
            <line x1="95" y1="56" x2="95" y2="105" className="anim-part spine" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
            {/* Hands on hips */}
            <polyline points="95,70 115,80 102,90" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Front Leg (Stable 90 deg) */}
            <polyline points="95,105 125,135 125,170" className="anim-part front-leg" stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            {/* Back Leg (Stepping back & dipping) */}
            <polyline points="95,105 60,135 50,168" className="anim-part back-leg" stroke="#a855f7" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            {/* Knee target dot */}
            <circle cx="125" cy="135" r="4" fill="#fff" />
          </g>
        )}

        {/* 4. WALL / INCLINE PUSH-UP */}
        {animationType === 'pushup' && (
          <g className="anim-group-pushup">
            {/* Wall or Counter Surface */}
            <rect x="160" y="30" width="8" height="140" fill="#475569" rx="3" />
            {/* Head */}
            <circle cx="125" cy="65" r="10" className="anim-part push-head" fill="url(#bodyGrad)" />
            {/* Torso straight plank */}
            <line x1="120" y1="72" x2="70" y2="135" className="anim-part push-body" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
            {/* Arms pressing against wall */}
            <polyline points="115,80 140,80 160,80" className="anim-part push-arms" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            {/* Feet planted back */}
            <line x1="70" y1="135" x2="50" y2="170" stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" />
          </g>
        )}

        {/* 5. OVERHEAD SHOULDER PRESS */}
        {animationType === 'overhead_press' && (
          <g className="anim-group-press">
            {/* Head */}
            <circle cx="100" cy="65" r="11" fill="url(#bodyGrad)" />
            {/* Torso */}
            <line x1="100" y1="76" x2="100" y2="125" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
            {/* Left Arm & Weight */}
            <polyline points="100,85 70,85 70,45" className="anim-part press-l" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="70" cy="40" r="6" fill="#f59e0b" className="anim-part weight-l" />
            {/* Right Arm & Weight */}
            <polyline points="100,85 130,85 130,45" className="anim-part press-r" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="130" cy="40" r="6" fill="#f59e0b" className="anim-part weight-r" />
            {/* Legs standing stable */}
            <line x1="100" y1="125" x2="85" y2="170" stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" />
            <line x1="100" y1="125" x2="115" y2="170" stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" />
          </g>
        )}

        {/* 6. BENT-OVER ROW */}
        {animationType === 'row' && (
          <g className="anim-group-row">
            {/* Head */}
            <circle cx="130" cy="70" r="10" fill="url(#bodyGrad)" />
            {/* Hinged Back */}
            <line x1="125" y1="78" x2="80" y2="105" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
            {/* Row Arm pulling up */}
            <polyline points="110,88 110,120" className="anim-part row-arm" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="110" cy="122" r="6" fill="#f59e0b" className="anim-part row-weight" />
            {/* Soft bent knees */}
            <polyline points="80,105 75,138 70,170" stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="80,105 90,138 90,170" stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}

        {/* 7. BIRD DOG */}
        {animationType === 'bird_dog' && (
          <g className="anim-group-birddog">
            {/* Head */}
            <circle cx="80" cy="85" r="9" fill="url(#bodyGrad)" />
            {/* Tabletop Spine */}
            <line x1="80" y1="92" x2="130" y2="92" stroke="url(#bodyGrad)" strokeWidth="7" strokeLinecap="round" />
            {/* Extended Arm */}
            <line x1="85" y1="95" x2="40" y2="95" className="anim-part bd-arm" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
            {/* Base Arm */}
            <line x1="90" y1="95" x2="90" y2="140" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
            {/* Extended Leg */}
            <line x1="130" y1="92" x2="175" y2="92" className="anim-part bd-leg" stroke="#ec4899" strokeWidth="6" strokeLinecap="round" />
            {/* Base Knee on Floor */}
            <polyline points="120,92 120,140 135,140" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}

        {/* 8. DEAD BUG */}
        {animationType === 'dead_bug' && (
          <g className="anim-group-deadbug">
            {/* Head on floor */}
            <circle cx="70" cy="140" r="10" fill="url(#bodyGrad)" />
            {/* Spine flat */}
            <line x1="75" y1="140" x2="130" y2="140" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
            {/* Left Arm extended back */}
            <line x1="85" y1="135" x2="50" y2="115" className="anim-part db-arm-l" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
            {/* Right Arm vertical */}
            <line x1="85" y1="135" x2="85" y2="95" className="anim-part db-arm-r" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
            {/* Left Knee bent 90 */}
            <polyline points="125,135 125,95 145,95" className="anim-part db-leg-l" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            {/* Right Leg extended out */}
            <polyline points="125,135 155,125 175,125" className="anim-part db-leg-r" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}

        {/* 9. PLANK / KNEE PLANK */}
        {animationType === 'plank' && (
          <g className="anim-group-plank">
            {/* Head */}
            <circle cx="150" cy="100" r="10" fill="url(#bodyGrad)" />
            {/* Forearm on floor */}
            <polyline points="145,108 145,135 160,135" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            {/* Straight rigid body plank */}
            <line x1="140" y1="110" x2="55" y2="135" className="anim-part plank-body" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
            {/* Feet on floor */}
            <polyline points="55,135 48,155 56,155" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            {/* Core tension glow indicator */}
            <ellipse cx="100" cy="122" rx="15" ry="5" fill="#f43f5e" opacity="0.6" className="anim-part core-glow" filter="url(#glow)" />
          </g>
        )}

        {/* 10. MARCHING / HIGH KNEES */}
        {(animationType === 'marching' || animationType === 'knee_raise') && (
          <g className="anim-group-march">
            {/* Head */}
            <circle cx="100" cy="45" r="11" fill="url(#bodyGrad)" />
            {/* Torso */}
            <line x1="100" y1="56" x2="100" y2="110" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
            {/* Pumping Arms */}
            <polyline points="100,70 120,85 135,70" className="anim-part march-arm-r" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="100,70 80,85 65,70" className="anim-part march-arm-l" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Standing Leg */}
            <line x1="100" y1="110" x2="90" y2="170" stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" />
            {/* High Knee Leg */}
            <polyline points="100,110 120,110 120,145" className="anim-part march-knee" stroke="#10b981" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}

        {/* 11. STANDING SIDE LEG RAISE */}
        {(animationType === 'side_raise' || animationType === 'side_lying_raise') && (
          <g className="anim-group-sideraise">
            {/* Wall / Chair support */}
            <line x1="60" y1="60" x2="60" y2="170" stroke="#475569" strokeWidth="4" />
            {/* Head */}
            <circle cx="100" cy="45" r="11" fill="url(#bodyGrad)" />
            {/* Torso */}
            <line x1="100" y1="56" x2="100" y2="110" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
            {/* Hand on support */}
            <line x1="100" y1="75" x2="60" y2="75" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
            {/* Standing Leg */}
            <line x1="100" y1="110" x2="95" y2="170" stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" />
            {/* Lateral Abducting Leg */}
            <line x1="100" y1="110" x2="145" y2="140" className="anim-part abduct-leg" stroke="#ec4899" strokeWidth="7" strokeLinecap="round" />
            <circle cx="145" cy="140" r="4" fill="#fff" />
          </g>
        )}

        {/* 12. WALL SIT */}
        {animationType === 'wall_sit' && (
          <g className="anim-group-wallsit">
            {/* Wall */}
            <rect x="40" y="30" width="8" height="140" fill="#475569" rx="3" />
            {/* Back against wall */}
            <circle cx="58" cy="70" r="11" fill="url(#bodyGrad)" />
            <line x1="50" y1="81" x2="50" y2="125" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
            {/* Hands on thighs */}
            <polyline points="50,95 85,120" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
            {/* Thighs horizontal */}
            <line x1="50" y1="125" x2="95" y2="125" stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" />
            {/* Shins vertical 90 deg */}
            <line x1="95" y1="125" x2="95" y2="170" stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" />
            {/* Quad isometric flame */}
            <ellipse cx="75" cy="122" rx="10" ry="4" fill="#f59e0b" opacity="0.7" filter="url(#glow)" />
          </g>
        )}

        {/* 13. SIT TO STAND (CHAIR SQUAT) */}
        {animationType === 'sit_to_stand' && (
          <g className="anim-group-sittostand">
            {/* Chair outline */}
            <path d="M55,125 L75,125 L75,170 M55,85 L55,170" stroke="#64748b" strokeWidth="3" fill="none" />
            {/* Moving person */}
            <g className="anim-part chair-person">
              <circle cx="95" cy="55" r="10" fill="url(#bodyGrad)" />
              <line x1="95" y1="65" x2="85" y2="115" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
              <polyline points="85,115 105,135 105,170" stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="95,80 120,80" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
            </g>
          </g>
        )}

        {/* 14. DEFAULT / OTHER EXERCISES (Cardio, Climbers, Donkey Kick, etc.) */}
        {!['squat', 'sumo_squat', 'bridge', 'lunge', 'pushup', 'overhead_press', 'row', 'bird_dog', 'dead_bug', 'plank', 'marching', 'knee_raise', 'side_raise', 'side_lying_raise', 'wall_sit', 'sit_to_stand'].includes(animationType) && (
          <g className="anim-group-generic">
            <circle cx="100" cy="55" r="12" fill="url(#bodyGrad)" />
            <line x1="100" y1="67" x2="100" y2="115" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
            <polyline points="100,80 75,70 65,95" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="100,80 125,70 135,95" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="100,115 85,140 80,170" stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="100,115 115,140 120,170" stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </svg>
    </div>
  );
};
