import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';

/**
 * Exercise Form Breakdown Database
 * Precise biomechanical cues for every exercise in the workout regime
 */
export const EXERCISE_FORM_GUIDES = {
  squat: {
    title: 'Controlled Bodyweight Squat',
    target: 'Quads, Glutes & Core',
    cadence: '⬇️ Lower 2s (Inhale)  •  ⏸️ Hold 1s  •  ⬆️ Drive 1s (Exhale)',
    setup: 'Feet shoulder-width apart, toes turned slightly outward (15°). Chest proud and arms forward for balance.',
    execution: 'Hinge hips backward first like sitting into a sturdy chair. Keep knees tracking in line with your 2nd toe. Lower until thighs are parallel to the floor.',
    mistake: 'Never let your knees cave inward or heels lift off the gym mat. Keep your weight distributed through mid-foot and heels.',
    muscles: 'Quads & Glutes'
  },
  sumo_squat: {
    title: 'Wide Sumo Squat',
    target: 'Inner Thighs (Adductors) & Glutes',
    cadence: '⬇️ Lower 2s (Inhale)  •  ⏸️ Hold 1s  •  ⬆️ Drive 1s (Exhale)',
    setup: 'Take a wider stance (1.5x shoulder width) with toes angled outward at 45°.',
    execution: 'Keep your torso upright and sink straight down, pushing knees wide along toe angle. Squeeze glutes and inner thighs as you rise.',
    mistake: 'Avoid leaning too far forward. Imagine sliding your back down a smooth wall.',
    muscles: 'Inner Thighs & Glutes'
  },
  squat_reach: {
    title: 'Squat to Overhead Reach',
    target: 'Legs, Shoulders & Cardio Stamina',
    cadence: '⬇️ Squat (Inhale)  •  ⬆️ Stand & Reach (Exhale)',
    setup: 'Feet shoulder-width, arms relaxed at chest level.',
    execution: 'Lower into a controlled squat. As you drive up to standing, extend both arms smoothly overhead in a full-body stretch.',
    mistake: 'Do not arch your lower back when reaching overhead. Keep ribs tucked and core braced.',
    muscles: 'Legs & Shoulders'
  },
  bridge: {
    title: 'Glute Bridge',
    target: 'Gluteus Maximus, Hamstrings & Lower Back',
    cadence: '⬆️ Drive Hips 2s (Exhale)  •  ⏸️ Squeeze 1s  •  ⬇️ Lower 2s (Inhale)',
    setup: 'Lie on your back, knees bent at 90°, feet flat on the floor hip-width apart. Arms resting flat along your sides.',
    execution: 'Drive through your heels to elevate your hips until your thighs, pelvis, and torso form a straight diagonal line. Squeeze glutes hard at the top.',
    mistake: 'Do not overarch your lower back at the top. The drive should come from your glutes and hips, not the lumbar spine.',
    muscles: 'Glutes & Hamstrings'
  },
  lunge: {
    title: 'Controlled Reverse Lunge',
    target: 'Quadriceps, Glutes & Balance',
    cadence: '⬇️ Step Back & Lower (Inhale)  •  ⏸️ Pause  •  ⬆️ Step Together (Exhale)',
    setup: 'Stand tall with feet hip-width apart, hands on hips or clasped at chest level for stability.',
    execution: 'Step one foot backward smoothly. Lower your hips until both knees form clean 90° angles. Front knee stays stacked over front ankle.',
    mistake: 'Do not slam your back knee into the floor. Hover gently 1-2 inches above the ground.',
    muscles: 'Front Quad & Glute'
  },
  pushup: {
    title: 'Incline / Wall Push-Up',
    target: 'Chest (Pectorals), Front Shoulders & Triceps',
    cadence: '⬇️ Lower Chest 2s (Inhale)  •  ⏸️ Pause  •  ⬆️ Press Back 1s (Exhale)',
    setup: 'Place hands slightly wider than shoulder-width against wall or elevated counter. Step feet back into a straight diagonal plank.',
    execution: 'Lower your chest toward the surface by bending your elbows back at a 45° angle (arrow shape, not flared T-shape). Press firmly through palms to return.',
    mistake: 'Do not let your hips sag down or butt stick out. Maintain a rigid, unbroken plank line from head to heels.',
    muscles: 'Chest & Triceps'
  },
  overhead_press: {
    title: 'Dumbbell / Water Bottle Shoulder Press',
    target: 'Deltoids & Upper Trapezius',
    cadence: '⬆️ Press Up 1.5s (Exhale)  •  ⏸️ Pause  •  ⬇️ Lower 2s (Inhale)',
    setup: 'Stand or sit tall with feet grounded. Hold weights at ear height with elbows bent at 90° and forearms vertical.',
    execution: 'Press both weights smoothly overhead in a gentle inward arc until arms are extended overhead (without locking elbows). Lower slowly with control.',
    mistake: 'Avoid arching your lower back or leaning backward as you press. Keep abs tightened and ribs locked down.',
    muscles: 'Shoulders & Triceps'
  },
  row: {
    title: 'Hinged Dumbbell Row',
    target: 'Lats, Rhomboids & Upper Back Posture',
    cadence: '⬆️ Pull Elbows 1s (Exhale)  •  ⏸️ Squeeze 1s  •  ⬇️ Lower 2s (Inhale)',
    setup: 'Hinge forward at hips at a 45° angle with a flat, neutral spine. Knees softly unlocked. Let weights hang straight down from shoulders.',
    execution: 'Drive your elbows backward and upward close to your ribcage. Squeeze your shoulder blades together at peak contraction, then lower slowly.',
    mistake: 'Never round your back like a hunchback. Keep your shoulder blades retracted and gaze looking slightly ahead on the floor.',
    muscles: 'Upper Back & Lats'
  },
  bird_dog: {
    title: 'Tabletop Bird Dog',
    target: 'Deep Core, Lower Back & Glute Stability',
    cadence: '⬆️ Extend Out 2s (Exhale)  •  ⏸️ Hold 1s  •  ⬇️ Return 2s (Inhale)',
    setup: 'Start on all fours (tabletop) on the gym mat: wrists stacked directly under shoulders, knees stacked under hips.',
    execution: 'Simultaneously reach your left arm straight forward and right leg straight backward until parallel to the floor. Hold for 1 second with a braced core.',
    mistake: 'Do not let your hips rotate or lower back sag. Keep your pelvis level like a tray of water that cannot spill.',
    muscles: 'Core & Glutes'
  },
  dead_bug: {
    title: 'Dead Bug Core Stabilizer',
    target: 'Transverse Abdominis & Pelvic Stability',
    cadence: '⬇️ Lower Opposite Limbs (Inhale)  •  ⬆️ Return to Center (Exhale)',
    setup: 'Lie flat on back with knees bent at 90° (tabletop) and arms pointing straight up toward ceiling.',
    execution: 'Slowly lower your right arm overhead while extending your left leg straight out hovering above floor. Return to start and alternate sides.',
    mistake: 'Your lower back must stay firmly glued to the floor. If you feel your back arching, do not lower your leg as low.',
    muscles: 'Deep Core Abdominals'
  },
  plank: {
    title: 'Forearm Plank / Knee Plank',
    target: 'Total Core Cylinder & Shoulder Girdle',
    cadence: '🔥 Continuous Isometric Hold  •  Breathe Deeply & Steadily',
    setup: 'Rest forearms on the gym mat with elbows directly under shoulders. Step feet back hip-width (or rest knees on mat for low-impact).',
    execution: 'Brace your abdominal wall like preparing for a punch. Squeeze glutes and thighs. Keep head neutral looking down at your hands.',
    mistake: 'Do not allow your lower back to sag toward the floor or your hips to pike up into an A-frame.',
    muscles: 'Entire Core & Shoulders'
  },
  marching: {
    title: 'Standing High-Knee March',
    target: 'Hip Flexors, Core & Low-Impact Cardio',
    cadence: '⬆️ Drive Knee Up (Exhale)  •  ⬇️ Plant Softly (Inhale)',
    setup: 'Stand tall with posture upright and shoulders relaxed. Core gently engaged.',
    execution: 'Drive one knee up to hip level (90° bend) while pumping the opposite arm forward. Step down softly and immediately drive the other knee.',
    mistake: 'Do not lean backward as your knee rises. Stay tall and upright throughout the march.',
    muscles: 'Hip Flexors & Core'
  },
  knee_raise: {
    title: 'Standing High-Knee March',
    target: 'Hip Flexors, Core & Low-Impact Cardio',
    cadence: '⬆️ Drive Knee Up (Exhale)  •  ⬇️ Plant Softly (Inhale)',
    setup: 'Stand tall with posture upright and shoulders relaxed. Core gently engaged.',
    execution: 'Drive one knee up to hip level (90° bend) while pumping the opposite arm forward. Step down softly and immediately drive the other knee.',
    mistake: 'Do not lean backward as your knee rises. Stay tall and upright throughout the march.',
    muscles: 'Hip Flexors & Core'
  },
  wall_sit: {
    title: 'Isometric Wall Sit',
    target: 'Quadriceps Isometric Endurance & Knee Stability',
    cadence: '🔥 Continuous Isometric Hold  •  Rhythmic Breathing',
    setup: 'Lean your back flat against a smooth wall. Slide down until your thighs are parallel to floor and knees are bent at 90°.',
    execution: 'Press your entire back (shoulders to lumbar) flat into the wall. Keep feet flat on floor directly under knees. Rest hands on lap or across chest.',
    mistake: 'Do not rest hands heavily on knees to push yourself up. Let your quadriceps do the work.',
    muscles: 'Quadriceps & Glutes'
  },
  sit_to_stand: {
    title: 'Chair Squat / Sit to Stand',
    target: 'Leg Strength, Hip Mobility & Safe Daily Function',
    cadence: '⬆️ Stand Tall (Exhale)  •  ⏸️ Squeeze  •  ⬇️ Sit Gently 2s (Inhale)',
    setup: 'Sit on the front half of a sturdy chair with feet flat on the floor, shoulder-width apart. Arms crossed across chest or extended forward.',
    execution: 'Hinge slightly forward at the hips, press firmly through your heels, and stand all the way up. Slowly hinge and lower back down until glutes tap chair.',
    mistake: 'Do not plop down hard onto the chair. Maintain control all the way until your glutes touch the seat.',
    muscles: 'Quads & Glutes'
  },
  calf_raise: {
    title: 'Standing Calf Raise',
    target: 'Calves (Gastrocnemius & Soleus) & Ankle Strength',
    cadence: '⬆️ Rise Onto Toes 1s (Exhale)  •  ⏸️ Peak Hold 1s  •  ⬇️ Lower Slowly (Inhale)',
    setup: 'Stand upright with feet hip-width apart. Lightly place hands on a wall or chair back for balance.',
    execution: 'Push through the balls of both feet to lift your heels as high off the floor as possible. Pause at the top for maximum contraction, then lower slowly.',
    mistake: 'Avoid rolling your ankles outward. Keep pressure evenly distributed across all toes, especially the big toe.',
    muscles: 'Calves & Ankle Stabilizers'
  },
  side_raise: {
    title: 'Standing Lateral Leg Raise',
    target: 'Gluteus Medius & Outer Hip Stability',
    cadence: '⬆️ Lift Leg Out 1.5s (Exhale)  •  ⏸️ Pause  •  ⬇️ Lower Controlled 2s (Inhale)',
    setup: 'Stand tall holding onto a wall or chair with one hand. Feet together, posture upright.',
    execution: 'Keeping your toes pointing straight forward (not turned up), lift your outer leg out to the side ~45°. Squeeze outer hip, then return slowly.',
    mistake: 'Do not lean your upper body to the opposite side to cheat the height. Keep torso upright and motionless.',
    muscles: 'Outer Hips (Glute Medius)'
  },
  side_lying_raise: {
    title: 'Side-Lying Hip Abduction',
    target: 'Gluteus Medius & Pelvic Alignment',
    cadence: '⬆️ Lift Leg Out 1.5s (Exhale)  •  ⏸️ Pause  •  ⬇️ Lower Controlled 2s (Inhale)',
    setup: 'Lie on your side on the mat with bottom leg bent for stability and top leg straight.',
    execution: 'Lift your top leg straight up towards the ceiling at a 45° angle with toes pointed slightly down or forward. Lower slowly.',
    mistake: 'Do not rotate your top hip backward toward the floor. Keep hips stacked vertically.',
    muscles: 'Gluteus Medius'
  },
  donkey_kick: {
    title: 'Quadruped Donkey Kick',
    target: 'Gluteus Maximus Isolation',
    cadence: '⬆️ Kick Toward Ceiling (Exhale)  •  ⏸️ Squeeze  •  ⬇️ Lower (Inhale)',
    setup: 'Start on all fours with hands under shoulders and knees under hips.',
    execution: 'Keeping knee bent at 90°, stamp the sole of your foot straight up toward the ceiling by contracting your glute.',
    mistake: 'Do not arch your lower back to get your leg higher. The movement is isolated in the hip joint.',
    muscles: 'Gluteus Maximus'
  },
  rest: {
    title: 'Rest & Deep Diaphragmatic Recovery',
    target: 'Heart Rate Recovery & Oxygenation',
    cadence: '🌬️ Inhale 4s through nose  •  Hold 2s  •  Exhale 4s through mouth',
    setup: 'Stand tall with hands on lower ribs or sit comfortably. Relax your neck and shoulders.',
    execution: 'Take deep, expansive breaths into your belly and lower ribcage. Allow heart rate to return to resting baseline. Sip water.',
    mistake: 'Do not sit slumped over. Keep chest open to allow full lung expansion.',
    muscles: 'Diaphragm & Nervous System'
  }
};

/**
 * High-Definition Biomechanical Vector Animation Component
 * Renders precise anatomical joints, motion arcs, muscle activation glow,
 * and live tempo/breathing cues.
 */
export const ExerciseAnimation = ({ 
  animationType = 'squat', 
  isPlaying = true, 
  size = 180,
  showGuide = true,
  showFormBreakdown = true
}) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const guide = EXERCISE_FORM_GUIDES[animationType] || EXERCISE_FORM_GUIDES.squat;

  return (
    <div className={`exercise-anim-wrapper ${isPlaying ? 'is-playing' : 'is-paused'}`}>
      {/* SVG Biomechanical Motion Canvas */}
      <div 
        className="exercise-anim-stage" 
        style={{ width: size, height: size }}
        aria-label={`Biomechanical demonstration of ${guide.title}`}
      >
        <svg 
          viewBox="0 0 240 200" 
          className={`anim-svg svg-${animationType}`}
          width="100%" 
          height="100%"
        >
          <defs>
            {/* Primary Athletic Silhouette Gradient */}
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>

            {/* Depth Gradient for Far Limbs (3D Spatial Contrast) */}
            <linearGradient id="depthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4338ca" />
              <stop offset="100%" stopColor="#312e81" />
            </linearGradient>

            {/* Active Muscle Power Glow Gradient */}
            <linearGradient id="muscleGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            {/* Cyan Motion Trajectory Gradient */}
            <linearGradient id="trajGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.2" />
            </linearGradient>

            {/* Filter for glowing active muscle fibers */}
            <filter id="muscleGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Trajectory Arrow Marker */}
            <marker id="arrowHead" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#38bdf8" />
            </marker>
          </defs>

          {/* 1. Ground Gym Mat & Perspective Line (Pinned at y=168) */}
          <rect x="20" y="167" width="200" height="6" rx="3" fill="#1e293b" />
          <line x1="25" y1="167" x2="215" y2="167" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.35" />
          <line x1="50" y1="173" x2="190" y2="173" stroke="#475569" strokeWidth="1" strokeOpacity="0.4" />

          {/* ========================================================
              EXERCISE 1: SQUAT / SUMO SQUAT / SQUAT REACH
              Side view with grounded feet, natural hip hinge, knee tracking
              ======================================================== */}
          {(animationType === 'squat' || animationType === 'sumo_squat' || animationType === 'squat_reach') && (
            <g className="anim-group-squat">
              {/* Motion Trajectory Guide Arc */}
              <path 
                d="M 120,95 Q 100,120 100,140" 
                fill="none" 
                stroke="#38bdf8" 
                strokeWidth="2" 
                strokeDasharray="4 3" 
                opacity="0.6"
                markerEnd="url(#arrowHead)"
              />

              {/* Grounded Foot (Near) */}
              <path d="M 128,167 L 150,167 Q 153,165 148,162 L 132,162 Z" fill="#94a3b8" />
              {/* Grounded Foot (Far - depth) */}
              <path d="M 112,167 L 132,167 Q 135,165 130,162 L 116,162 Z" fill="#64748b" opacity="0.6" />

              {/* Far Leg (Shadow depth) */}
              <polyline 
                points="110,125 125,148 122,167" 
                stroke="url(#depthGrad)" 
                strokeWidth="7" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="anim-part squat-far-leg"
              />

              {/* Near Leg (Primary Front Articulation) */}
              <polyline 
                points="115,125 138,148 138,167" 
                stroke="url(#bodyGrad)" 
                strokeWidth="8" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="anim-part squat-near-leg"
              />

              {/* Target Muscle Activation: Quads & Glute Highlight */}
              <path 
                d="M 116,125 L 136,145" 
                stroke="url(#muscleGlowGrad)" 
                strokeWidth="5" 
                strokeLinecap="round" 
                className="anim-part squat-quad-glow" 
                filter="url(#muscleGlowFilter)" 
              />
              <circle cx="112" cy="126" r="6" fill="#f43f5e" className="anim-part squat-glute-glow" filter="url(#muscleGlowFilter)" />

              {/* Torso & Head (Moving group with hip hinge pivot) */}
              <g className="anim-part squat-torso-group">
                {/* Spine & Pelvis */}
                <line x1="115" y1="125" x2="128" y2="78" stroke="url(#bodyGrad)" strokeWidth="10" strokeLinecap="round" />
                {/* Head */}
                <circle cx="132" cy="62" r="12" fill="url(#bodyGrad)" />
                {/* Face gaze directional cue */}
                <circle cx="140" cy="62" r="2.5" fill="#38bdf8" />
                {/* Arms reaching forward for counterbalance */}
                <polyline 
                  points="126,84 152,86 172,86" 
                  stroke="#38bdf8" 
                  strokeWidth="5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </g>

              {/* Knee Joint Alignment Dot */}
              <circle cx="138" cy="148" r="3.5" fill="#fff" className="anim-part squat-knee-joint" />
            </g>
          )}

          {/* ========================================================
              EXERCISE 2: GLUTE BRIDGE
              Head & shoulders flat on floor, pelvis driving up to straight diagonal
              ======================================================== */}
          {animationType === 'bridge' && (
            <g className="anim-group-bridge">
              {/* Upward Drive Trajectory Arrow */}
              <path 
                d="M 125,160 L 125,125" 
                fill="none" 
                stroke="#38bdf8" 
                strokeWidth="2" 
                strokeDasharray="4 3" 
                opacity="0.6"
                markerEnd="url(#arrowHead)"
              />

              {/* Head resting on mat */}
              <circle cx="55" cy="155" r="11" fill="url(#bodyGrad)" />
              {/* Shoulders / Upper Back pinned to floor */}
              <line x1="65" y1="158" x2="80" y2="158" stroke="url(#bodyGrad)" strokeWidth="10" strokeLinecap="round" />
              {/* Grounded Hands */}
              <line x1="68" y1="165" x2="110" y2="165" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />

              {/* Planted Feet on mat */}
              <path d="M 160,167 L 180,167 Q 183,165 178,162 L 164,162 Z" fill="#94a3b8" />

              {/* Shins to floor */}
              <line x1="168" y1="135" x2="168" y2="166" className="anim-part bridge-shin" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />

              {/* Elevating Torso & Thighs */}
              <line x1="80" y1="158" x2="128" y2="135" className="anim-part bridge-torso" stroke="url(#bodyGrad)" strokeWidth="10" strokeLinecap="round" />
              <line x1="128" y1="135" x2="168" y2="135" className="anim-part bridge-thigh" stroke="url(#bodyGrad)" strokeWidth="9" strokeLinecap="round" />

              {/* Target Muscle: Glute & Hamstring Contraction Glow */}
              <circle cx="128" cy="135" r="8" fill="#f43f5e" className="anim-part bridge-glow" filter="url(#muscleGlowFilter)" />
              <line x1="132" y1="135" x2="162" y2="135" stroke="url(#muscleGlowGrad)" strokeWidth="5" strokeLinecap="round" className="anim-part bridge-glow" filter="url(#muscleGlowFilter)" />

              {/* Knee Joint Dot */}
              <circle cx="168" cy="135" r="3.5" fill="#fff" className="anim-part bridge-knee-dot" />
            </g>
          )}

          {/* ========================================================
              EXERCISE 3: REVERSE LUNGE
              Front foot flat, back leg steps back with knee hovering, upright torso
              ======================================================== */}
          {animationType === 'lunge' && (
            <g className="anim-group-lunge">
              {/* Downward & Back Motion Arc */}
              <path 
                d="M 115,100 Q 95,120 75,145" 
                fill="none" 
                stroke="#38bdf8" 
                strokeWidth="2" 
                strokeDasharray="4 3" 
                opacity="0.6"
                markerEnd="url(#arrowHead)"
              />

              {/* Front Planted Foot */}
              <path d="M 140,167 L 165,167 Q 168,165 163,162 L 144,162 Z" fill="#94a3b8" />
              {/* Back Toe / Ball of Foot */}
              <circle cx="65" cy="165" r="4" fill="#64748b" />

              {/* Back Leg (Stepping back and dipping knee) */}
              <polyline 
                points="115,115 82,142 65,165" 
                className="anim-part lunge-back-leg" 
                stroke="url(#depthGrad)" 
                strokeWidth="7" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />

              {/* Front Leg (Stable 90° Stack) */}
              <polyline 
                points="115,115 148,138 148,166" 
                className="anim-part lunge-front-leg" 
                stroke="url(#bodyGrad)" 
                strokeWidth="8" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />

              {/* Target Glow: Front Quad */}
              <line x1="118" y1="117" x2="145" y2="136" stroke="url(#muscleGlowGrad)" strokeWidth="5" strokeLinecap="round" className="anim-part lunge-quad-glow" filter="url(#muscleGlowFilter)" />

              {/* Torso & Head (Moving down smoothly) */}
              <g className="anim-part lunge-upper-body">
                <circle cx="115" cy="55" r="11" fill="url(#bodyGrad)" />
                <circle cx="123" cy="55" r="2.5" fill="#38bdf8" />
                <line x1="115" y1="66" x2="115" y2="115" stroke="url(#bodyGrad)" strokeWidth="10" strokeLinecap="round" />
                {/* Hands on hips */}
                <polyline points="115,80 130,90 120,102" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              </g>

              {/* Knee Dots */}
              <circle cx="148" cy="138" r="3.5" fill="#fff" />
              <circle cx="82" cy="142" r="3" fill="#cbd5e1" />
            </g>
          )}

          {/* ========================================================
              EXERCISE 4: INCLINE / WALL PUSH-UP
              Rigid plank body line, elbows bending at 45°, pressing firmly
              ======================================================== */}
          {animationType === 'pushup' && (
            <g className="anim-group-pushup">
              {/* Wall Surface Bar */}
              <rect x="180" y="35" width="8" height="135" fill="#475569" rx="3" />
              <line x1="184" y1="35" x2="184" y2="170" stroke="#64748b" strokeWidth="1.5" />

              {/* Push direction guide arrows */}
              <line x1="135" y1="80" x2="165" y2="80" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" markerEnd="url(#arrowHead)" />

              {/* Planted Feet on floor */}
              <path d="M 50,167 L 70,167 Q 73,165 68,162 L 54,162 Z" fill="#94a3b8" />

              {/* Rigid Body Line from Feet to Head */}
              <g className="anim-part pushup-body-group">
                <circle cx="142" cy="72" r="11" fill="url(#bodyGrad)" />
                {/* Straight Plank Line */}
                <line x1="136" y1="80" x2="68" y2="152" stroke="url(#bodyGrad)" strokeWidth="10" strokeLinecap="round" />
                {/* Arms pressing against wall */}
                <polyline 
                  points="132,88 155,90 180,90" 
                  className="anim-part pushup-arms" 
                  stroke="#38bdf8" 
                  strokeWidth="6" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                {/* Pectoral & Tricep Activation Glow */}
                <ellipse cx="130" cy="90" rx="9" ry="5" fill="#f43f5e" className="anim-part pushup-chest-glow" filter="url(#muscleGlowFilter)" />
              </g>

              {/* Wall Contact Hand Marker */}
              <circle cx="180" cy="90" r="4.5" fill="#38bdf8" />
            </g>
          )}

          {/* ========================================================
              EXERCISE 5: OVERHEAD SHOULDER PRESS
              Standing tall, dumbbells pressing from ears overhead in arc
              ======================================================== */}
          {animationType === 'overhead_press' && (
            <g className="anim-group-press">
              {/* Vertical Drive Arrows */}
              <line x1="80" y1="70" x2="80" y2="40" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" markerEnd="url(#arrowHead)" />
              <line x1="160" y1="70" x2="160" y2="40" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" markerEnd="url(#arrowHead)" />

              {/* Stable Grounded Feet */}
              <path d="M 95,167 L 115,167 Z" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
              <path d="M 125,167 L 145,167 Z" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />

              {/* Legs standing stable */}
              <line x1="120" y1="120" x2="105" y2="167" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
              <line x1="120" y1="120" x2="135" y2="167" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />

              {/* Torso & Head */}
              <line x1="120" y1="75" x2="120" y2="120" stroke="url(#bodyGrad)" strokeWidth="10" strokeLinecap="round" />
              <circle cx="120" cy="62" r="11" fill="url(#bodyGrad)" />

              {/* Shoulder Muscle Activation Glow */}
              <circle cx="102" cy="78" r="6" fill="#f43f5e" className="anim-part press-deltoid-glow" filter="url(#muscleGlowFilter)" />
              <circle cx="138" cy="78" r="6" fill="#f43f5e" className="anim-part press-deltoid-glow" filter="url(#muscleGlowFilter)" />

              {/* Left Arm & Dumbbell */}
              <g className="anim-part press-arm-left">
                <polyline points="108,78 82,78 82,50" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="73" y="44" width="18" height="7" rx="3" fill="#f59e0b" />
                <line x1="82" y1="42" x2="82" y2="53" stroke="#d97706" strokeWidth="3" />
              </g>

              {/* Right Arm & Dumbbell */}
              <g className="anim-part press-arm-right">
                <polyline points="132,78 158,78 158,50" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="149" y="44" width="18" height="7" rx="3" fill="#f59e0b" />
                <line x1="158" y1="42" x2="158" y2="53" stroke="#d97706" strokeWidth="3" />
              </g>
            </g>
          )}

          {/* ========================================================
              EXERCISE 6: BENT-OVER DUMBBELL ROW
              Flat back 45° hinge, elbows driving up close to ribs
              ======================================================== */}
          {animationType === 'row' && (
            <g className="anim-group-row">
              {/* Elbow Pull Trajectory Arrow */}
              <path d="M 125,130 Q 130,110 125,95" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" markerEnd="url(#arrowHead)" />

              {/* Planted Feet */}
              <path d="M 80,167 L 105,167 Z" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />

              {/* Soft bent knees */}
              <polyline points="100,118 90,144 90,167" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />

              {/* Hinged Flat Spine at 45° */}
              <line x1="100" y1="118" x2="148" y2="82" stroke="url(#bodyGrad)" strokeWidth="10" strokeLinecap="round" />
              {/* Head in neutral alignment */}
              <circle cx="156" cy="74" r="11" fill="url(#bodyGrad)" />
              <circle cx="163" cy="74" r="2.5" fill="#38bdf8" />

              {/* Target Glow: Lats and Rhomboid Upper Back */}
              <line x1="110" y1="110" x2="140" y2="88" stroke="url(#muscleGlowGrad)" strokeWidth="6" strokeLinecap="round" className="anim-part row-lat-glow" filter="url(#muscleGlowFilter)" />

              {/* Row Arm & Weight (Driving back and up along ribs) */}
              <g className="anim-part row-arm-group">
                <polyline points="138,88 126,108 126,132" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="117" y="130" width="18" height="7" rx="3" fill="#f59e0b" />
                <circle cx="126" cy="108" r="3" fill="#fff" />
              </g>
            </g>
          )}

          {/* ========================================================
              EXERCISE 7: BIRD DOG
              Tabletop position, opposite arm and leg extending simultaneously
              ======================================================== */}
          {animationType === 'bird_dog' && (
            <g className="anim-group-birddog">
              {/* Level Tabletop Reference Line */}
              <line x1="40" y1="95" x2="200" y2="95" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />

              {/* Base Contact Points on Mat */}
              {/* Grounded Hand */}
              <line x1="90" y1="95" x2="90" y2="165" stroke="url(#depthGrad)" strokeWidth="6" strokeLinecap="round" />
              <circle cx="90" cy="166" r="4" fill="#94a3b8" />
              {/* Grounded Knee & Shin */}
              <polyline points="135,95 135,165 150,165" stroke="url(#depthGrad)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />

              {/* Tabletop Spine */}
              <line x1="85" y1="95" x2="140" y2="95" stroke="url(#bodyGrad)" strokeWidth="10" strokeLinecap="round" />
              {/* Neutral Head */}
              <circle cx="75" cy="92" r="10" fill="url(#bodyGrad)" />

              {/* Core Cylinder Glow */}
              <rect x="95" y="90" width="35" height="10" rx="4" fill="#f43f5e" className="anim-part bd-core-glow" filter="url(#muscleGlowFilter)" />

              {/* Extended Forward Arm */}
              <line x1="85" y1="95" x2="42" y2="95" className="anim-part bd-arm" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />

              {/* Extended Backward Leg */}
              <g className="anim-part bd-leg">
                <line x1="140" y1="95" x2="195" y2="95" stroke="url(#bodyGrad)" strokeWidth="7" strokeLinecap="round" />
                <circle cx="168" cy="95" r="3.5" fill="#fff" />
                <circle cx="140" cy="95" r="6" fill="#f43f5e" filter="url(#muscleGlowFilter)" />
              </g>
            </g>
          )}

          {/* ========================================================
              EXERCISE 8: DEAD BUG
              Flat back on floor, alternating limb extensions, transverse abdominis
              ======================================================== */}
          {animationType === 'dead_bug' && (
            <g className="anim-group-deadbug">
              {/* Head & Spine flat on floor */}
              <circle cx="65" cy="150" r="10" fill="url(#bodyGrad)" />
              <line x1="72" y1="152" x2="145" y2="152" stroke="url(#bodyGrad)" strokeWidth="10" strokeLinecap="round" />

              {/* Deep Core Muscle Glow */}
              <ellipse cx="110" cy="150" rx="20" ry="6" fill="#f43f5e" className="anim-part db-core-glow" filter="url(#muscleGlowFilter)" />

              {/* Vertical Base Arm */}
              <line x1="90" y1="148" x2="90" y2="105" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
              {/* Reaching Arm (overhead toward floor) */}
              <line x1="90" y1="148" x2="48" y2="130" className="anim-part db-arm-active" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />

              {/* Tabletop Base Knee */}
              <polyline points="140,148 140,105 160,105" stroke="url(#depthGrad)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
              {/* Extending Leg (hovering above mat) */}
              <polyline points="140,148 175,138 202,138" className="anim-part db-leg-active" stroke="url(#bodyGrad)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}

          {/* ========================================================
              EXERCISE 9: FOREARM PLANK
              Straight rigid plank line, forearms on mat, pulsing core
              ======================================================== */}
          {animationType === 'plank' && (
            <g className="anim-group-plank">
              {/* Forearm Contact on Mat */}
              <polyline points="155,120 155,152 175,152" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              {/* Grounded Toes on Mat */}
              <circle cx="58" cy="155" r="4.5" fill="#94a3b8" />

              {/* Straight Rigid Body Line */}
              <line x1="150" y1="120" x2="60" y2="150" className="anim-part plank-body" stroke="url(#bodyGrad)" strokeWidth="10" strokeLinecap="round" />
              {/* Neutral Head */}
              <circle cx="162" cy="115" r="10" fill="url(#bodyGrad)" />

              {/* Core Cylinder Power Pulse Glow */}
              <ellipse cx="110" cy="135" rx="22" ry="7" fill="#f43f5e" opacity="0.8" className="anim-part plank-core-glow" filter="url(#muscleGlowFilter)" />
              {/* Breathing Wave Indicator */}
              <circle cx="110" cy="135" r="14" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.4" className="anim-part plank-breath-ring" />
            </g>
          )}

          {/* ========================================================
              EXERCISE 10: MARCHING / KNEE RAISE / CARDIO
              Standing tall, driving knee to 90°, pumping opposite arm
              ======================================================== */}
          {(animationType === 'marching' || animationType === 'knee_raise' || animationType === 'climber' || animationType === 'knee_elbow') && (
            <g className="anim-group-march">
              {/* Height Reference Line at 90° Hip */}
              <line x1="120" y1="115" x2="165" y2="115" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />

              {/* Grounded Standing Leg */}
              <line x1="115" y1="115" x2="105" y2="167" stroke="url(#depthGrad)" strokeWidth="8" strokeLinecap="round" />
              <path d="M 98,167 L 118,167 Z" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />

              {/* Torso & Head */}
              <line x1="115" y1="65" x2="115" y2="115" stroke="url(#bodyGrad)" strokeWidth="10" strokeLinecap="round" />
              <circle cx="115" cy="52" r="11" fill="url(#bodyGrad)" />
              <circle cx="122" cy="52" r="2.5" fill="#38bdf8" />

              {/* Pumping Arms */}
              <polyline points="115,75 95,90 85,75" className="anim-part march-arm-l" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="115,75 135,90 148,75" className="anim-part march-arm-r" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

              {/* High Knee Drive (90° bend) */}
              <g className="anim-part march-knee-group">
                <polyline points="115,115 145,115 145,148" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="145" cy="115" r="4" fill="#fff" />
                {/* Hip Flexor Glow */}
                <circle cx="125" cy="115" r="6" fill="#f43f5e" filter="url(#muscleGlowFilter)" />
              </g>
            </g>
          )}

          {/* ========================================================
              EXERCISE 11: WALL SIT
              Back flat against wall, 90° angles at hip and knee, isometric quad flame
              ======================================================== */}
          {animationType === 'wall_sit' && (
            <g className="anim-group-wallsit">
              {/* Supporting Wall */}
              <rect x="45" y="35" width="8" height="135" fill="#475569" rx="3" />
              <line x1="49" y1="35" x2="49" y2="170" stroke="#64748b" strokeWidth="1.5" />

              {/* Back flat against wall */}
              <circle cx="62" cy="62" r="11" fill="url(#bodyGrad)" />
              <line x1="56" y1="73" x2="56" y2="120" stroke="url(#bodyGrad)" strokeWidth="10" strokeLinecap="round" />

              {/* Thighs Horizontal (90°) */}
              <line x1="56" y1="120" x2="110" y2="120" stroke="url(#bodyGrad)" strokeWidth="9" strokeLinecap="round" />

              {/* Shins Vertical to Floor (90°) */}
              <line x1="110" y1="120" x2="110" y2="167" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
              <path d="M 104,167 L 126,167 Z" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />

              {/* Arms rested on thighs */}
              <polyline points="56,88 95,115" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />

              {/* Quadriceps Isometric Flame Glow */}
              <ellipse cx="85" cy="118" rx="14" ry="5" fill="#f59e0b" className="anim-part wallsit-quad-flame" filter="url(#muscleGlowFilter)" />

              {/* Knee Angle 90° Dot */}
              <circle cx="110" cy="120" r="4" fill="#fff" />
            </g>
          )}

          {/* ========================================================
              EXERCISE 12: SIT TO STAND (CHAIR SQUAT)
              Chair guide, smooth hip hinge, heel drive to tall standing
              ======================================================== */}
          {animationType === 'sit_to_stand' && (
            <g className="anim-group-sittostand">
              {/* Chair Frame */}
              <path d="M 65,85 L 65,130 L 90,130 L 90,167 M 65,130 L 65,167" stroke="#64748b" strokeWidth="3.5" fill="none" strokeLinecap="round" />

              {/* Grounded Feet */}
              <path d="M 120,167 L 142,167 Z" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />

              {/* Moving Body: Seated to Standing Transition */}
              <g className="anim-part chair-person-group">
                <circle cx="110" cy="62" r="11" fill="url(#bodyGrad)" />
                <line x1="108" y1="73" x2="98" y2="125" stroke="url(#bodyGrad)" strokeWidth="10" strokeLinecap="round" />
                <polyline points="98,125 125,142 125,167" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="108,88 135,88" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
                {/* Leg Drive Glow */}
                <line x1="100" y1="126" x2="124" y2="142" stroke="url(#muscleGlowGrad)" strokeWidth="5" strokeLinecap="round" filter="url(#muscleGlowFilter)" />
              </g>
            </g>
          )}

          {/* ========================================================
              EXERCISE 13: STANDING CALF RAISE
              Balance support, lifting high onto balls of feet, calf contraction
              ======================================================== */}
          {animationType === 'calf_raise' && (
            <g className="anim-group-calfraise">
              {/* Wall / Balance Bar */}
              <line x1="60" y1="65" x2="60" y2="167" stroke="#475569" strokeWidth="3" />

              {/* Upward Elevation Guide Arrows */}
              <line x1="140" y1="165" x2="140" y2="145" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" markerEnd="url(#arrowHead)" />

              {/* Tall Standing Body (Pivoting onto balls of feet) */}
              <g className="anim-part calf-body-elevate">
                <circle cx="115" cy="55" r="11" fill="url(#bodyGrad)" />
                <line x1="115" y1="66" x2="115" y2="115" stroke="url(#bodyGrad)" strokeWidth="10" strokeLinecap="round" />
                <line x1="115" y1="80" x2="60" y2="80" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
                {/* Standing Legs */}
                <line x1="115" y1="115" x2="115" y2="155" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
                {/* Active Foot on Ball of Foot */}
                <line x1="115" y1="155" x2="125" y2="167" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
                {/* Gastrocnemius Calf Muscle Glow */}
                <ellipse cx="112" cy="138" rx="6" ry="12" fill="#f43f5e" className="anim-part calf-muscle-glow" filter="url(#muscleGlowFilter)" />
              </g>
            </g>
          )}

          {/* ========================================================
              EXERCISE 14: STANDING / SIDE-LYING LEG RAISE
              ======================================================== */}
          {(animationType === 'side_raise' || animationType === 'side_lying_raise') && (
            <g className="anim-group-sideraise">
              <line x1="60" y1="65" x2="60" y2="167" stroke="#475569" strokeWidth="3" />
              {/* Standing Base Leg */}
              <line x1="105" y1="115" x2="105" y2="167" stroke="url(#depthGrad)" strokeWidth="8" strokeLinecap="round" />
              <path d="M 98,167 L 118,167 Z" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />

              {/* Torso & Head */}
              <line x1="105" y1="65" x2="105" y2="115" stroke="url(#bodyGrad)" strokeWidth="10" strokeLinecap="round" />
              <circle cx="105" cy="52" r="11" fill="url(#bodyGrad)" />
              <line x1="105" y1="75" x2="60" y2="75" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />

              {/* Lateral Abducting Leg (Lifting 45° to the side) */}
              <g className="anim-part abduct-leg-group">
                <line x1="105" y1="115" x2="155" y2="148" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
                <circle cx="155" cy="148" r="4" fill="#38bdf8" />
                {/* Glute Medius Glow */}
                <circle cx="108" cy="115" r="7" fill="#f43f5e" filter="url(#muscleGlowFilter)" />
              </g>
            </g>
          )}

          {/* ========================================================
              EXERCISE 15: REST / DEEP BREATHING RECOVERY
              ======================================================== */}
          {animationType === 'rest' && (
            <g className="anim-group-rest">
              <circle cx="120" cy="65" r="13" fill="url(#bodyGrad)" />
              <line x1="120" y1="78" x2="120" y2="125" stroke="url(#bodyGrad)" strokeWidth="10" strokeLinecap="round" />
              {/* Hands rested over lower ribs */}
              <polyline points="120,95 105,108 120,112" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="120,95 135,108 120,112" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="120" y1="125" x2="105" y2="167" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
              <line x1="120" y1="125" x2="135" y2="167" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" />
              {/* Expanding Diaphragmatic Breath Rings */}
              <circle cx="120" cy="100" r="18" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.7" className="anim-part breath-pulse-1" />
              <circle cx="120" cy="100" r="28" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.4" className="anim-part breath-pulse-2" />
            </g>
          )}

          {/* ========================================================
              FALLBACK / GENERIC EXERCISE
              ======================================================== */}
          {!['squat', 'sumo_squat', 'squat_reach', 'bridge', 'lunge', 'pushup', 'overhead_press', 'row', 'bird_dog', 'dead_bug', 'plank', 'marching', 'knee_raise', 'climber', 'knee_elbow', 'wall_sit', 'sit_to_stand', 'calf_raise', 'side_raise', 'side_lying_raise', 'rest'].includes(animationType) && (
            <g className="anim-group-generic">
              <circle cx="120" cy="55" r="11" fill="url(#bodyGrad)" />
              <line x1="120" y1="66" x2="120" y2="115" stroke="url(#bodyGrad)" strokeWidth="10" strokeLinecap="round" />
              <polyline points="120,80 95,70 85,95" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="120,80 145,70 155,95" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="120,115 105,140 100,167" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="120,115 135,140 140,167" stroke="url(#bodyGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
        </svg>

        {/* Live Cadence & Phase Pill synced above bottom */}
        {showGuide && (
          <div className="anim-phase-badge">
            <span className="phase-text">{guide.cadence}</span>
          </div>
        )}
      </div>

      {/* Target Muscle Tag */}
      <div className="anim-target-row">
        <span className="anim-target-pill">
          <Flame size={12} className="text-amber-400" />
          <span>Active: {guide.muscles}</span>
        </span>

        {showFormBreakdown && (
          <button 
            type="button" 
            className="btn-toggle-guide"
            onClick={() => setIsGuideOpen(!isGuideOpen)}
            title="View proper form steps & cues"
          >
            <Info size={13} />
            <span>{isGuideOpen ? 'Hide Form Cues' : 'Form Guide (1-2-3)'}</span>
            {isGuideOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        )}
      </div>

      {/* Step-by-Step Proper Form Breakdown Drawer */}
      {showFormBreakdown && isGuideOpen && (
        <div className="exercise-form-drawer">
          <div className="form-step-item">
            <div className="step-num-badge">1</div>
            <div className="step-content">
              <strong>Stance & Setup:</strong>
              <span>{guide.setup}</span>
            </div>
          </div>

          <div className="form-step-item">
            <div className="step-num-badge">2</div>
            <div className="step-content">
              <strong>Movement Path:</strong>
              <span>{guide.execution}</span>
            </div>
          </div>

          <div className="form-step-item mistake-item">
            <div className="step-num-badge mistake-badge">⚠️</div>
            <div className="step-content">
              <strong>What to Avoid:</strong>
              <span>{guide.mistake}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
