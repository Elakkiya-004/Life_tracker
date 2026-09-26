/**
 * 6-Day 20-Minute Low-Impact Workout Protocol
 * Optimized for Fat Loss, Strength & Toning with Knee/Ankle Safety
 */

export const WORKOUT_PROGRESSIONS = [
  { week: 1, workSec: 30, restSec: 30, label: 'Week 1 (30s Work / 30s Rest)', badge: 'Beginner Base' },
  { week: 2, workSec: 35, restSec: 25, label: 'Week 2 (35s Work / 25s Rest)', badge: 'Building Stamina' },
  { week: 3, workSec: 40, restSec: 20, label: 'Week 3 (40s Work / 20s Rest)', badge: 'Recommended Standard' },
  { week: 4, workSec: 45, restSec: 15, label: 'Week 4 (45s Work / 15s Rest)', badge: 'Peak Burn' },
];

export const WORKOUT_DAYS = {
  monday: {
    id: 'monday',
    dayIndex: 1,
    name: 'Monday',
    title: 'Legs + Glutes',
    icon: '🦵',
    accentColor: '#ec4899',
    badge: 'Strength & Tone',
    goal: 'Strengthen thighs, hips, and glutes with low-impact stability',
    targetMuscles: ['Glutes', 'Quadriceps', 'Hamstrings', 'Calves'],
    warmup: '3 min: Gentle marching in place, hip circles, and ankle rotations',
    cooldown: '3 min: Standing quad stretch, hamstring reach, and calf stretches against wall',
    exercises: [
      {
        id: 'bodyweight_squat',
        name: 'Bodyweight Squat',
        durationSec: 40,
        target: 'Quadriceps, Glutes & Core',
        animationType: 'squat',
        instructions: 'Stand with feet shoulder-width apart. Push your hips back as if sitting in a chair, bend your knees, then press through your heels to stand tall.',
        coachTip: 'Keep your knees pointing in the same direction as your toes and chest proud.',
        lowImpactCue: 'Do not squat too deep if knees feel tight—a half-squat works wonders.',
      },
      {
        id: 'glute_bridge',
        name: 'Glute Bridge',
        durationSec: 40,
        target: 'Glutes, Hamstrings & Core',
        animationType: 'bridge',
        instructions: 'Lie on your back with knees bent and feet flat. Push through your heels to lift your hips toward the ceiling. Squeeze your glutes firmly at the top, then slowly lower.',
        coachTip: 'Do not arch your lower back—form a straight diagonal line from knees to shoulders.',
        lowImpactCue: 'Zero pressure on knees or ankles; excellent for spine support.',
      },
      {
        id: 'reverse_lunges',
        name: 'Reverse Lunges',
        durationSec: 40,
        target: 'Quads, Glutes & Balance',
        animationType: 'lunge',
        instructions: 'Stand tall. Step one leg backward, bending both knees gently, then push through your front foot to return. Alternate legs smoothly.',
        coachTip: 'Stepping backward puts significantly less pressure on the front knee than forward lunges.',
        lowImpactCue: 'Hold a wall or sturdy chair for balance if needed; keep the step shallow.',
      },
      {
        id: 'standing_side_leg_raise',
        name: 'Standing Side Leg Raise',
        durationSec: 40,
        splitTime: '20s each side',
        target: 'Gluteus Medius & Outer Hips',
        animationType: 'side_raise',
        instructions: 'Stand straight holding a wall or chair. Slowly lift your right leg sideways without tilting your torso. Hold for a moment, lower with control, and switch sides after 20 seconds.',
        coachTip: 'Keep your toes pointing forward, not upward, to isolate the outer hip.',
        lowImpactCue: 'No impact on joints; tones the side glutes and stabilizes the pelvis.',
      },
      {
        id: 'calf_raises',
        name: 'Calf Raises',
        durationSec: 40,
        target: 'Calves, Feet & Ankle Stability',
        animationType: 'calf_raise',
        instructions: 'Stand with feet hip-width apart. Slowly rise onto your toes as high as comfortable. Hold for 1 second, then lower your heels back to the floor.',
        coachTip: 'Perform slowly and with control—avoid bouncing.',
        lowImpactCue: 'Hold a wall for balance; builds tendon resilience to relieve ankle discomfort.',
      },
      {
        id: 'wall_sit',
        name: 'Wall Sit',
        durationSec: 40,
        target: 'Isometric Quad Endurance',
        animationType: 'wall_sit',
        instructions: 'Lean your back flat against a wall and slide down until your knees are bent at a comfortable angle. Hold your position firmly.',
        coachTip: 'Press your entire spine and lower back firmly against the wall.',
        lowImpactCue: 'Slide down only to a gentle angle (above 90 degrees) to protect your knees.',
      }
    ]
  },
  tuesday: {
    id: 'tuesday',
    dayIndex: 2,
    name: 'Tuesday',
    title: 'Upper Body + Core',
    icon: '💪',
    accentColor: '#3b82f6',
    badge: 'Posture & Strength',
    goal: 'Strengthen arms, shoulders, back, and deep abdominal wall',
    targetMuscles: ['Chest', 'Upper Back', 'Shoulders', 'Deep Core', 'Triceps'],
    warmup: '3 min: Arm circles, shoulder shrugs, and torso twists',
    cooldown: '3 min: Overhead triceps stretch, chest opener, and child’s pose',
    exercises: [
      {
        id: 'wall_incline_pushups',
        name: 'Wall / Incline Push-Ups',
        durationSec: 40,
        target: 'Chest, Shoulders & Triceps',
        animationType: 'pushup',
        instructions: 'Place your hands shoulder-width apart on a sturdy wall or high table. Lower your chest toward the surface, keeping your body in a straight plank, then press away.',
        coachTip: 'Keep elbows at a 45-degree angle rather than flaring out wide.',
        lowImpactCue: 'Stand closer to the wall to make it easier, step further back to increase resistance.',
      },
      {
        id: 'shoulder_press',
        name: 'Shoulder Press (Water Bottles / Light DB)',
        durationSec: 40,
        target: 'Deltoids & Upper Arms',
        animationType: 'overhead_press',
        instructions: 'Hold two water bottles at shoulder height with palms facing forward. Press them smoothly overhead until arms are extended, then slowly lower.',
        coachTip: 'Keep your core engaged and avoid arching your lower back as you press.',
        lowImpactCue: 'Can be performed seated on a chair to keep the spine supported.',
      },
      {
        id: 'bent_over_row',
        name: 'Bent-Over Row',
        durationSec: 40,
        target: 'Upper Back, Lats & Posture',
        animationType: 'row',
        instructions: 'Hold your water bottles. Slightly bend your knees and hinge forward at your hips with a straight back. Pull the bottles toward your ribcage, squeezing your shoulder blades together.',
        coachTip: 'Drive your elbows back toward the ceiling and squeeze your back muscles.',
        lowImpactCue: 'Keep knees soft and back neutral to protect the spine.',
      },
      {
        id: 'bird_dog',
        name: 'Bird Dog',
        durationSec: 40,
        target: 'Posterior Chain & Core Stability',
        animationType: 'bird_dog',
        instructions: 'Start on all fours with hands under shoulders and knees under hips. Slowly reach your right arm forward and left leg straight back simultaneously. Return and alternate.',
        coachTip: 'Imagine balancing a glass of water on your lower back without spilling it.',
        lowImpactCue: 'Place a soft towel under your knees for added comfort.',
      },
      {
        id: 'dead_bug',
        name: 'Dead Bug',
        durationSec: 40,
        target: 'Transverse Abdominis & Deep Core',
        animationType: 'dead_bug',
        instructions: 'Lie on your back with arms reaching up and knees bent at 90 degrees. Slowly extend opposite arm and leg toward the floor, keeping your lower back pressed down. Alternate sides.',
        coachTip: 'Do not let your lower back peel off the floor—brace your stomach gently.',
        lowImpactCue: 'Zero neck strain and highly protective of the lumbar spine.',
      },
      {
        id: 'plank',
        name: 'Plank (Forearm or Knee Plank)',
        durationSec: 40,
        target: 'Total Core & Shoulder Stability',
        animationType: 'plank',
        instructions: 'Rest on your forearms and toes (or knees). Keep your body in one straight line from head to heels. Squeeze your core and glutes firmly.',
        coachTip: 'Breathe steadily—do not hold your breath.',
        lowImpactCue: 'Drop to knees whenever fatigue sets in; form is much more important than duration.',
      }
    ]
  },
  wednesday: {
    id: 'wednesday',
    dayIndex: 3,
    name: 'Wednesday',
    title: 'Full Body + Low-Impact Cardio',
    icon: '🔥',
    accentColor: '#f59e0b',
    badge: 'Calorie Burn',
    goal: 'Elevate heart rate and burn calories without jumping or jarring joints',
    targetMuscles: ['Full Body', 'Cardiovascular System', 'Legs', 'Core'],
    warmup: '3 min: Gentle side steps, shoulder rolls, and deep rhythmic breathing',
    cooldown: '3 min: Deep hamstring stretch, calf stretch, and relaxing deep breaths',
    exercises: [
      {
        id: 'squat_reach',
        name: 'Squat + Overhead Reach',
        durationSec: 40,
        target: 'Legs, Shoulders & Heart Rate',
        animationType: 'squat_reach',
        instructions: 'Lower into a shallow squat. As you stand up, extend both arms smoothly overhead and reach for the ceiling.',
        coachTip: 'Creates full-body movement to increase calorie burn naturally without jumping.',
        lowImpactCue: 'Move at a steady, rhythmic pace that feels comfortable.',
      },
      {
        id: 'marching_high_knees',
        name: 'Marching High Knees (No Jumping)',
        durationSec: 40,
        target: 'Cardio, Hip Flexors & Core',
        animationType: 'marching',
        instructions: 'March in place, lifting each knee toward hip level while pumping your arms with energy.',
        coachTip: 'Land softly on the ball of your foot and roll to your heel.',
        lowImpactCue: '100% low impact—no bouncing or jarring on knees or ankles.',
      },
      {
        id: 'step_ups',
        name: 'Low Step-Ups',
        durationSec: 40,
        target: 'Quads, Glutes & Cardiovascular',
        animationType: 'step_up',
        instructions: 'Use a stable low step or bottom stair. Step up with one foot, bring the other foot up to meet it, then step down. Lead with alternating legs.',
        coachTip: 'Step flat on the surface without letting your heel hang off.',
        lowImpactCue: 'Use a low step (4–6 inches) to protect knee joints.',
      },
      {
        id: 'reverse_lunges_cardio',
        name: 'Reverse Lunges',
        durationSec: 40,
        target: 'Glutes, Quads & Stability',
        animationType: 'lunge',
        instructions: 'Step one leg backward, bend both knees slightly, then push through the front foot to return. Alternate sides with rhythm.',
        coachTip: 'Maintain upright posture and keep front knee behind toes.',
        lowImpactCue: 'Keep the step shallow to stay completely pain-free.',
      },
      {
        id: 'incline_mountain_climbers',
        name: 'Incline Mountain Climbers',
        durationSec: 40,
        target: 'Core & Low-Impact Cardio',
        animationType: 'climber',
        instructions: 'Place your hands on a sturdy table or kitchen counter in a plank angle. Drive one knee toward your chest, return, and alternate smoothly.',
        coachTip: 'Perform as a steady march—no bouncing or jumping.',
        lowImpactCue: 'Being inclined takes heavy strain off wrists, shoulders, and lower back.',
      },
      {
        id: 'standing_knee_to_elbow',
        name: 'Standing Knee-to-Elbow',
        durationSec: 40,
        target: 'Obliques, Abs & Cardio',
        animationType: 'knee_elbow',
        instructions: 'Stand tall with fingertips near ears. Lift your right knee diagonally across toward your left elbow, lower, and alternate sides.',
        coachTip: 'Engage your obliques as you rotate gently.',
        lowImpactCue: 'Great cardio stimulus that burns calories while protecting the floor and joints.',
      }
    ]
  },
  thursday: {
    id: 'thursday',
    dayIndex: 4,
    name: 'Thursday',
    title: 'Glutes + Core',
    icon: '🍑',
    accentColor: '#8b5cf6',
    badge: 'Shape & Stability',
    goal: 'Isolate and activate glutes and tighten abdominal wall',
    targetMuscles: ['Glute Max', 'Glute Med', 'Core', 'Pelvic Floor'],
    warmup: '3 min: Cat-cow spinal rolls, hip opening circles, and glute taps',
    cooldown: '3 min: Figure-4 glute stretch on back, cobra stretch, and child’s pose',
    exercises: [
      {
        id: 'glute_bridge_hold',
        name: 'Glute Bridge with Squeeze',
        durationSec: 40,
        target: 'Glutes & Hamstrings',
        animationType: 'bridge',
        instructions: 'Lie on your back, knees bent, feet flat. Drive hips upward and squeeze glutes firmly for 2 seconds at the top before slowly descending.',
        coachTip: 'Focus the mind-muscle connection directly into the buttocks.',
        lowImpactCue: 'Completely knee-friendly floor exercise.',
      },
      {
        id: 'sumo_squat',
        name: 'Sumo Squat',
        durationSec: 40,
        target: 'Inner Thighs (Adductors) & Glutes',
        animationType: 'sumo_squat',
        instructions: 'Take a wider stance than usual with toes angled out 45 degrees. Lower your hips down while keeping your knees pushed out wide, then press to stand.',
        coachTip: 'Keep your torso as upright as possible.',
        lowImpactCue: 'Less shear force on knees than forward movements.',
      },
      {
        id: 'donkey_kicks',
        name: 'Donkey Kicks',
        durationSec: 40,
        splitTime: '20s each leg',
        target: 'Upper Glute Isolation',
        animationType: 'donkey_kick',
        instructions: 'On hands and knees, keep one knee bent at 90 degrees and push your foot sole upward toward the ceiling. Lower slowly and repeat before switching legs.',
        coachTip: 'Do not rotate your hips—keep your pelvis level with the floor.',
        lowImpactCue: 'Place a folded mat or pillow beneath knees for comfort.',
      },
      {
        id: 'side_lying_leg_raise',
        name: 'Side-Lying Leg Raise',
        durationSec: 40,
        splitTime: '20s each side',
        target: 'Gluteus Medius (Side Glute)',
        animationType: 'side_lying_raise',
        instructions: 'Lie on your side with hips stacked. Keep the top leg straight and slowly raise it upward about 45 degrees, pause, and lower without touching down.',
        coachTip: 'Keep your top toe pointed slightly downward to hit the glute.',
        lowImpactCue: 'Excellent for hip stabilization and knee tracking health.',
      },
      {
        id: 'bird_dog_thursday',
        name: 'Bird Dog',
        durationSec: 40,
        target: 'Spinal Erectors & Core',
        animationType: 'bird_dog',
        instructions: 'Extend right arm and left leg simultaneously while bracing your abdominal wall. Hold for a beat, return, and alternate smoothly.',
        coachTip: 'Reach long through your fingertips and heel.',
        lowImpactCue: 'Protects the spine and builds natural core stability.',
      },
      {
        id: 'plank_thursday',
        name: 'Plank Hold',
        durationSec: 40,
        target: 'Total Core Endurance',
        animationType: 'plank',
        instructions: 'Hold a forearm or knee plank with straight alignment from head to heels.',
        coachTip: 'Keep shoulders away from your ears and glutes locked.',
        lowImpactCue: 'Knee planks are 100% effective for beginners.',
      }
    ]
  },
  friday: {
    id: 'friday',
    dayIndex: 5,
    name: 'Friday',
    title: 'Full Body Strength',
    icon: '💪',
    accentColor: '#10b981',
    badge: 'Muscle Tone',
    goal: 'Compound movements to firm the entire body and build lean tissue',
    targetMuscles: ['Chest', 'Back', 'Quads', 'Glutes', 'Core', 'Shoulders'],
    warmup: '3 min: Gentle torso twists, arm openers, and ankle circles',
    cooldown: '3 min: Overhead side stretch, hamstring stretch, and shoulder release',
    exercises: [
      {
        id: 'bodyweight_squat_fri',
        name: 'Controlled Squat',
        durationSec: 40,
        target: 'Legs & Glutes',
        animationType: 'squat',
        instructions: 'Lower your hips backward and down under control for 2 seconds, then press through heels to stand.',
        coachTip: 'Controlled speed creates greater muscle tension without needing heavy weights.',
        lowImpactCue: 'Stop at a comfortable depth.',
      },
      {
        id: 'incline_pushup_fri',
        name: 'Incline Push-Up',
        durationSec: 40,
        target: 'Chest & Arms',
        animationType: 'pushup',
        instructions: 'Hands on counter or sturdy table. Lower chest toward surface with elbows angled, press back.',
        coachTip: 'Maintain a rigid straight core plank throughout.',
        lowImpactCue: 'Zero floor struggle; easy on wrists and knees.',
      },
      {
        id: 'water_bottle_row_fri',
        name: 'Water-Bottle Row',
        durationSec: 40,
        target: 'Upper Back & Posture',
        animationType: 'row',
        instructions: 'Hinge forward at hips. Pull your water bottles upward along your thighs to your waist, squeezing shoulder blades.',
        coachTip: 'Keeps shoulders from rounding forward during computer/desk work.',
        lowImpactCue: 'Support lower back by keeping knees soft.',
      },
      {
        id: 'reverse_lunge_fri',
        name: 'Reverse Lunge',
        durationSec: 40,
        target: 'Lower Body Unilateral Strength',
        animationType: 'lunge',
        instructions: 'Step backward, bend knees comfortably, return to standing. Alternate legs.',
        coachTip: 'Hold a chair if balance feels wobbly.',
        lowImpactCue: 'Knee-friendly backward direction.',
      },
      {
        id: 'shoulder_press_fri',
        name: 'Overhead Shoulder Press',
        durationSec: 40,
        target: 'Deltoids & Posture',
        animationType: 'overhead_press',
        instructions: 'Press water bottles from ear level to overhead, then lower slowly.',
        coachTip: 'Keep your ribcage down and core braced.',
        lowImpactCue: 'Seated or standing with gentle resistance.',
      },
      {
        id: 'dead_bug_fri',
        name: 'Dead Bug',
        durationSec: 40,
        target: 'Deep Core & Stability',
        animationType: 'dead_bug',
        instructions: 'Lie on back, extend opposite arm and leg slowly, keep lower back flat against floor.',
        coachTip: 'Quality over speed—move with deliberate control.',
        lowImpactCue: 'Protects the lower spine completely.',
      }
    ]
  },
  saturday: {
    id: 'saturday',
    dayIndex: 6,
    name: 'Saturday',
    title: 'Low-Impact Mobility + Flow',
    icon: '🌿',
    accentColor: '#0ea5e9',
    badge: 'Movement & Recovery',
    goal: 'Restorative full-body movement, joint mobility, and guided stretching',
    targetMuscles: ['Joints', 'Hips', 'Spine', 'Full Body Mobility'],
    warmup: '3 min: Gentle marching with rhythmic arm swings',
    cooldown: '5 min: Dedicated deep stretching (Hamstrings, Quads, Calves, Chest & Hips)',
    exercises: [
      {
        id: 'march_in_place_sat',
        name: 'March in Place',
        durationSec: 60,
        target: 'Gentle Circulation & Warmth',
        animationType: 'marching',
        instructions: 'March comfortably in place while swinging your arms naturally for a full 60 seconds.',
        coachTip: 'Promotes blood circulation to speed up muscle recovery.',
        lowImpactCue: 'Zero impact on joints.',
      },
      {
        id: 'sit_to_stand',
        name: 'Sit-to-Stand (Chair Squat)',
        durationSec: 40,
        target: 'Functional Knee & Hip Strength',
        animationType: 'sit_to_stand',
        instructions: 'Sit on a sturdy chair. Push through your feet to stand tall without using your hands if possible. Slowly lower your hips back to sit.',
        coachTip: 'The ultimate functional strength builder for everyday life.',
        lowImpactCue: 'Safe and guided depth that removes knee strain.',
      },
      {
        id: 'wall_pushups_sat',
        name: 'Gentle Wall Push-Ups',
        durationSec: 40,
        target: 'Shoulder & Chest Mobility',
        animationType: 'pushup',
        instructions: 'Hands flat against wall at shoulder height. Bend elbows to bring nose close to wall, then push away.',
        coachTip: 'Great for relieving stiff shoulders and neck.',
        lowImpactCue: 'Zero wrist pressure.',
      },
      {
        id: 'standing_side_leg_sat',
        name: 'Standing Side Leg Raises',
        durationSec: 40,
        splitTime: '20s each side',
        target: 'Hip Mobility & Balance',
        animationType: 'side_raise',
        instructions: 'Hold a chair for support. Lift each leg sideways slowly to open up the hip capsule.',
        coachTip: 'Feel the stretch in the inner thigh of the standing leg.',
        lowImpactCue: 'Releases tight hip flexors.',
      },
      {
        id: 'standing_knee_raises_sat',
        name: 'Standing Knee Raises',
        durationSec: 40,
        target: 'Hip Flexor Mobility',
        animationType: 'knee_raise',
        instructions: 'Lift one knee toward your chest, hold for a split second, lower gently, and alternate.',
        coachTip: 'Keep your spine tall and proud.',
        lowImpactCue: 'Improves range of motion without impact.',
      },
      {
        id: 'glute_bridge_sat',
        name: 'Relaxed Glute Bridges',
        durationSec: 40,
        target: 'Glute Activation & Pelvic Alignment',
        animationType: 'bridge',
        instructions: 'Controlled bridges on the floor, focusing on deep breathing and pelvic alignment.',
        coachTip: 'Inhale on the way down, exhale as you lift.',
        lowImpactCue: 'Relieves lower back stiffness after a busy week.',
      }
    ]
  },
  sunday: {
    id: 'sunday',
    dayIndex: 0,
    name: 'Sunday',
    title: 'Active Rest & Recovery',
    icon: '😴',
    accentColor: '#64748b',
    badge: 'Rest & Restore',
    goal: 'Rest day! Allow muscles to repair, rebuild, and recharge for the new week.',
    targetMuscles: ['Recovery', 'Mental Well-being'],
    warmup: 'Optional: 15-20 min leisurely walk in nature or gentle stretching',
    cooldown: 'Adequate hydration & nourishing meals',
    exercises: [
      {
        id: 'rest_day_tip',
        name: 'Rest, Rehydrate & Recover',
        durationSec: 0,
        target: 'Muscle Repair & Glycogen Replenishment',
        animationType: 'rest',
        instructions: 'Take today completely off from structured workouts. Drink 2.5–3 Liters of water, eat protein-rich foods, and enjoy relaxing activities.',
        coachTip: 'Muscle growth and fat burning happen during recovery, not during the workout itself!',
        lowImpactCue: 'Listen to your body.',
      }
    ]
  }
};

/**
 * Weekly Schedule Metadata Table
 */
export const WEEKLY_SCHEDULE_OVERVIEW = [
  { day: 'Monday', title: 'Legs + Glutes', icon: '🩷', goal: 'Strength & Tone', duration: '20 min', kcal: '~120-140 kcal' },
  { day: 'Tuesday', title: 'Upper Body + Core', icon: '💪', goal: 'Strength & Posture', duration: '20 min', kcal: '~110-130 kcal' },
  { day: 'Wednesday', title: 'Full Body + Cardio', icon: '🔥', goal: 'Calorie Burn', duration: '20 min', kcal: '~140-160 kcal' },
  { day: 'Thursday', title: 'Glutes + Core', icon: '🍑', goal: 'Shape & Stability', duration: '20 min', kcal: '~120-140 kcal' },
  { day: 'Friday', title: 'Full Body Strength', icon: '💪', goal: 'Muscle Tone', duration: '20 min', kcal: '~120-140 kcal' },
  { day: 'Saturday', title: 'Low-Impact Mobility', icon: '🌿', goal: 'Movement & Mobility', duration: '20 min', kcal: '~90-110 kcal' },
  { day: 'Sunday', title: 'Active Rest', icon: '😴', goal: 'Recovery & Growth', duration: 'Rest Day', kcal: '—' },
];

/**
 * Web Audio Sound Generator for Workout Timer
 * Synthesizes clear audio chimes without external mp3 dependencies.
 */
class SoundService {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  beep(freq = 600, duration = 0.1, type = 'sine') {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {}
  }

  countdownBeep() {
    this.beep(880, 0.08, 'sine');
  }

  startWorkChime() {
    this.beep(587.33, 0.1, 'sine');
    setTimeout(() => this.beep(880, 0.25, 'triangle'), 100);
  }

  restChime() {
    this.beep(440, 0.2, 'sine');
  }

  victoryFanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.beep(freq, 0.25, 'triangle'), idx * 120);
    });
  }
}

export const soundEffects = new SoundService();
