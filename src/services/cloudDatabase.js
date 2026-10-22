// Unified Cloud Database Service (Firebase Firestore)
// Controls all dynamic cloud persistence, collection schemas, real-time listeners and database seeding
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import { db, isInitialized, initFirebase } from './firebase';
import { 
  NIGHT_DIET_SOUPS, 
  WEEKLY_SOUP_ROTATION, 
  SOUP_WEIGHT_LOSS_TIPS 
} from './nightDietSoupData';

// ============================================================================
// 1. DATABASE DEFAULT SCHEMAS & SEED TEMPLATES
// ============================================================================

export const DB_HEALTH_PROTOCOL_TEMPLATE = {
  meta: {
    isCustom: false,
    planName: 'Daily Calorie, Care & Nutrition Protocol',
    uploadedAt: null,
    source: 'cloud_database',
  },
  calories: {
    maintenance: 1850,
    fatLossTarget: '1350–1450 kcal/day',
    expectedLoss: '0.5–0.7 kg/week (healthy & sustainable)',
    cheatDay: {
      target: '1800–1900 kcal',
      frequency: '1 day / week only',
      rules: 'No binge eating • Protein + Fiber first • Stop at 80% fullness'
    },
    macros: [
      {
        id: 'protein',
        name: 'Protein',
        amount: '75–85 g',
        percentage: '30%',
        color: '#ef4444',
        purpose: 'Hair strength, hormone synthesis, muscle & skin renewal',
        foods: 'Paneer, curd, dal, legumes, sprouts, eggs/tofu'
      },
      {
        id: 'carbs',
        name: 'Carbohydrates',
        amount: '140–160 g',
        percentage: '40–45%',
        color: '#f59e0b',
        purpose: 'Sustained energy, brain power & mood stability',
        foods: 'Rice (1 cup), vegetable oats, dosa, fruits, vegetables'
      },
      {
        id: 'fats',
        name: 'Healthy Fats',
        amount: '40–45 g',
        percentage: '25–30%',
        color: '#10b981',
        purpose: 'Hormone balance, skin glow & nutrient absorption',
        foods: 'Almonds, pumpkin seeds, peanuts, coconut oil, curd'
      },
    ]
  },
  micronutrients: [
    { id: 'iron', name: 'Iron', color: '#f43f5e', target: 'Bloating, fatigue, hair fall', sources: 'Dates, spinach, beetroot, jaggery' },
    { id: 'b12', name: 'Vitamin B12', color: '#8b5cf6', target: 'Mood swings, low energy', sources: 'Curd, paneer, fortified foods' },
    { id: 'vit_d', name: 'Vitamin D', color: '#f59e0b', target: 'Joint pain, low mood', sources: 'Sunlight + supplementation if deficient' },
    { id: 'magnesium', name: 'Magnesium', color: '#6366f1', target: 'Sleep, stress, cravings', sources: 'Pumpkin seeds, peanuts' },
    { id: 'zinc', name: 'Zinc', color: '#0ea5e9', target: 'Hair strength & skin healing', sources: 'Nuts, seeds, legumes' },
  ],
  skinCare: {
    daily: 'AM and PM (Cleanse, hydrate, sunscreen AM, barrier repair PM)',
    weeklySunday: 'Sunday: Face shaving and scrub',
    weeklyTueFri: 'Tuesday & Friday: Face pack',
    notes: 'Gentle circular motion for scrub; use soothing gel after face shaving.'
  },
  bodyCare: {
    sunday: 'Sunday: Oiling, scrub, shaving',
    tueFri: 'Tuesday & Friday: Exfoliating body wash',
    notes: 'Warm oil before bath on Sundays; gentle loofah with exfoliating wash on Tue/Fri.'
  },
  hairCare: {
    daily: 'Serum and hair growth water',
    weekly: '3x Oiling, hair pack, hair wash',
    biWeekly: 'Two weeks once: Saturday henna and Sunday avari podi (In the next alternate: Hair growth serum)',
    notes: 'Air dry naturally, wide-tooth detangling comb, warm oil massage.'
  },
  exerciseRoutine: {
    morning: {
      title: '🌅 Morning Cardio (30–40 Mins)',
      activities: 'Cycling or brisk outdoor walking',
      benefits: 'Fat burning zone, insulin sensitivity & stimulates natural gut motility'
    },
    evening: {
      title: '💪 Evening Bodyweight Routine (20 Mins)',
      activities: 'Squats (3x15), Glute bridges (3x15), Wall push-ups (3x12), Planks (3x30s)',
      benefits: 'Tones glutes/core, improves posture, activates metabolism. Consistency > Intensity.'
    }
  },
  sugarCutting: {
    phases: [
      { week: 'Week 1', action: 'Remove added sugar from tea & coffee', status: 'Phase 1' },
      { week: 'Week 2', action: 'Replace sweets & bakery snacks with fresh fruits / dates', status: 'Phase 2' },
      { week: 'Week 3', action: 'Sugar strictly limited to festival / weekly cheat day', status: 'Phase 3' }
    ],
    cravingHack: '🧠 Craving Hack: Drink 1 glass warm water + take 5 slow deep breaths. Cravings fade in 90 seconds.'
  },
  juiceProtocol: {
    enabled: true,
    frequency: 'two_days_once',
    startDate: '2026-09-26',
    notes: 'Drink fresh on an empty stomach or mid-morning for optimal nutrient absorption.',
    juices: [
      {
        id: 'juice-1',
        name: 'Carrot + Amla + Ginger Juice',
        emoji: '🥕',
        ingredients: 'Carrot + amla + small piece of ginger + water',
        benefits: 'Vitamin C + carotenoids + antioxidants + digestive support',
        color: '#f97316',
        timeOfDay: 'Morning',
      },
      {
        id: 'juice-2',
        name: 'Cucumber + Mint + Lemon Juice',
        emoji: '🥒',
        ingredients: 'Cucumber + mint + lemon + water',
        benefits: 'Hydration + vitamin C + refreshing + very low calorie',
        color: '#10b981',
        timeOfDay: 'Morning',
      },
      {
        id: 'juice-3',
        name: 'Apple + Cucumber + Ginger Smoothie',
        emoji: '🍎',
        ingredients: 'Apple + cucumber + ginger + water',
        benefits: 'Fibre + polyphenols + hydration + digestive support',
        color: '#ef4444',
        timeOfDay: 'Morning',
      },
      {
        id: 'juice-4',
        name: 'Orange + Carrot + Ginger Juice',
        emoji: '🍊',
        ingredients: 'Orange + carrot + small piece of ginger + water',
        benefits: 'Vitamin C + carotenoids + antioxidants + skin support',
        color: '#f59e0b',
        timeOfDay: 'Morning',
      },
      {
        id: 'juice-5',
        name: 'Watermelon + Mint + Lemon Juice',
        emoji: '🍉',
        ingredients: 'Watermelon + mint + lemon + water',
        benefits: 'Hydration + vitamin C + refreshing + supports healthy-looking skin',
        color: '#ec4899',
        timeOfDay: 'Morning',
      },
      {
        id: 'juice-6',
        name: 'Papaya + Amla Smoothie',
        emoji: '🧡',
        ingredients: 'Ripe papaya + amla + water',
        benefits: 'Fibre + vitamin C + carotenoids + digestive support',
        color: '#ea580c',
        timeOfDay: 'Morning',
      },
      {
        id: 'juice-7',
        name: 'Tomato + Carrot + Amla Juice',
        emoji: '🍅',
        ingredients: 'Tomato + carrot + amla + water',
        benefits: 'Lycopene + carotenoids + vitamin C + antioxidants',
        color: '#dc2626',
        timeOfDay: 'Morning',
      },
      {
        id: 'juice-8',
        name: 'Pineapple + Mint + Ginger Smoothie',
        emoji: '🍍',
        ingredients: 'Pineapple + mint + small piece of ginger + water',
        benefits: 'Vitamin C + antioxidants + fibre + digestive support',
        color: '#eab308',
        timeOfDay: 'Morning',
      },
      {
        id: 'juice-9',
        name: 'Cucumber + Amla + Coriander Juice',
        emoji: '🥒',
        ingredients: 'Cucumber + amla + coriander leaves + lemon + water',
        benefits: 'Hydration + vitamin C + antioxidants + refreshing',
        color: '#059669',
        timeOfDay: 'Morning',
      },
      {
        id: 'juice-10',
        name: 'Tomato + Watermelon + Mint Juice',
        emoji: '🍅',
        ingredients: 'Tomato + watermelon + mint + lemon',
        benefits: 'Lycopene + hydration + antioxidants + vitamin C',
        color: '#e11d48',
        timeOfDay: 'Morning',
      },
      {
        id: 'juice-11',
        name: 'ABC Miracle Glow (Apple + Beetroot + Carrot + Lemon)',
        emoji: '🍎',
        ingredients: '1 Apple + 1/2 small Beetroot + 1 Carrot + squeeze of Lemon + water',
        benefits: 'Glutathione booster + deep blood purification + liver detox for luminous skin & gut motility',
        color: '#be123c',
        timeOfDay: 'Morning',
      },
      {
        id: 'juice-12',
        name: 'Pomegranate + Amla + Mint Radiance Elixir',
        emoji: '🍷',
        ingredients: '1 cup Pomegranate arils + 1 Amla + fresh Mint leaves + pinch of Rock Salt + water',
        benefits: 'Ellagic acid & punicalagins inhibit melanin synthesis + prebiotic polyphenols balance gut microbiome',
        color: '#991b1b',
        timeOfDay: 'Morning',
      },
      {
        id: 'juice-13',
        name: 'Coconut Water + Aloe Vera + Cucumber Glass-Skin Dew',
        emoji: '🥥',
        ingredients: 'Fresh Tender Coconut Water + 2 tbsp pure Aloe Vera gel + 1/2 Cucumber + squeeze of Lemon',
        benefits: 'Cools internal heat (pitta) + repairs intestinal mucosa + deep cellular electrolyte hydration for glass skin',
        color: '#0d9488',
        timeOfDay: 'Morning',
      },
      {
        id: 'juice-14',
        name: 'Spinach + Green Apple + Ginger + Mint (Chlorophyll Glow)',
        emoji: '🍏',
        ingredients: 'Handful fresh Spinach (Palak) + 1 Green Apple + 1/2 inch Ginger + fresh Mint + Lemon juice',
        benefits: 'Chlorophyll & folate accelerate cellular renewal + apple pectin prebiotic fiber soothes digestive tract',
        color: '#15803d',
        timeOfDay: 'Morning',
      },
      {
        id: 'juice-15',
        name: 'Golden Turmeric + Orange + Carrot Brightening Tonic',
        emoji: '✨',
        ingredients: '1 Orange + 1 Carrot + 1/4 tsp organic Turmeric + tiny pinch of Black Pepper + water',
        benefits: 'Curcumin & beta-carotene reduce hyperpigmentation + potent anti-inflammatory protection for gut lining',
        color: '#eab308',
        timeOfDay: 'Morning',
      },
      {
        id: 'juice-16',
        name: 'Coriander + Cucumber + Lemon Alkaline Gut Flush',
        emoji: '🌿',
        ingredients: 'Fresh Coriander leaves (Dhaniya) + 1 Cucumber + Lemon juice + pinch of Cumin powder + water',
        benefits: 'Heavy metal flush + rich in Vitamin K & C to clear blemishes + eliminates gas & stomach bloating',
        color: '#16a34a',
        timeOfDay: 'Morning',
      },
      {
        id: 'juice-17',
        name: 'Papaya + Coconut Water + Chia Seed Digestion Elixir',
        emoji: '🥭',
        ingredients: '1 cup ripe Papaya chunks + Tender Coconut Water + 1 tsp soaked Chia seeds',
        benefits: 'Papain enzyme breaks down waste + soluble mucilage fiber feeds gut flora for blemish-free skin',
        color: '#f97316',
        timeOfDay: 'Morning',
      },
      {
        id: 'juice-18',
        name: 'Beetroot + Amla + Ginger + Mint Micro-Circulation Flush',
        emoji: '🧃',
        ingredients: '1/2 Beetroot + 1 Amla + 1/2 inch Ginger + fresh Mint + Pink Salt + water',
        benefits: 'Nitric oxide enhances facial oxygenation & natural pink glow + collagen synthesis & liver detox',
        color: '#881337',
        timeOfDay: 'Morning',
      },
      {
        id: 'juice-19',
        name: 'Watermelon + Cucumber + Sabja (Basil Seeds) Gut Cooler',
        emoji: '🍉',
        ingredients: '1 cup chilled Watermelon + 1/2 Cucumber + 1 tsp soaked Sabja seeds + squeeze of Lime',
        benefits: 'Lycopene protects skin from photo-aging + cooling mucilage sabja seeds relieve gastric burning & acid reflux',
        color: '#e11d48',
        timeOfDay: 'Morning',
      },
      {
        id: 'juice-20',
        name: 'Pineapple + Fennel (Saunf) + Ginger Anti-Bloat Nectar',
        emoji: '🍍',
        ingredients: '1 cup fresh Pineapple + 1 tsp soaked Fennel seeds (Saunf) + 1/2 inch Ginger + water',
        benefits: 'Bromelain enzyme banishes bloat & water retention + fennel anethole eases cramps for clear radiant skin',
        color: '#ca8a04',
        timeOfDay: 'Morning',
      },
    ],
  }
};

export const DEFAULT_JUICES = DB_HEALTH_PROTOCOL_TEMPLATE.juiceProtocol.juices;

export const sanitizeHealthProtocol = (raw) => {
  if (!raw || typeof raw !== 'object') return DB_HEALTH_PROTOCOL_TEMPLATE;
  const protocol = JSON.parse(JSON.stringify(raw));

  if (protocol.calories) {
    if (typeof protocol.calories.fatLossTarget === 'string' && protocol.calories.fatLossTarget.includes('kg/')) {
      protocol.calories.fatLossTarget = '1350–1450 kcal/day';
    }
    if (!protocol.calories.expectedLoss) {
      protocol.calories.expectedLoss = '0.5–0.7 kg/week (healthy & sustainable)';
    }

    if (Array.isArray(protocol.calories.macros)) {
      protocol.calories.macros = protocol.calories.macros.map(m => {
        if (!m) return m;
        let cleanAmount = String(m.amount || '').replace(/\s*\([^)]*\)/g, '').trim();
        let cleanFoods = String(m.foods || '').replace(/^.*Sources:\s*/i, '').replace(/^Purpose:[^|]*\|\s*Sources:\s*/i, '').trim();
        return {
          ...m,
          amount: cleanAmount || m.amount,
          foods: cleanFoods || m.foods
        };
      });
    }
  }

  const existingJuices = protocol.juiceProtocol?.juices;
  if (!protocol.juiceProtocol || !Array.isArray(existingJuices) || existingJuices.length === 0) {
    protocol.juiceProtocol = {
      ...DB_HEALTH_PROTOCOL_TEMPLATE.juiceProtocol,
      ...(protocol.juiceProtocol || {}),
      juices: DEFAULT_JUICES,
    };
  } else if (existingJuices.length < 20) {
    // Seamlessly merge in the 10 new skin-brightening & gut-health juices without losing custom entries
    const existingIds = new Set(existingJuices.map(j => j.id || j.name));
    const toAppend = DEFAULT_JUICES.filter(j => !existingIds.has(j.id) && !existingIds.has(j.name));
    if (toAppend.length > 0) {
      protocol.juiceProtocol.juices = [...existingJuices, ...toAppend];
    }
  }

  return protocol;
};

export const DB_CAREER_ROADMAP_TEMPLATE = [
  {
    id: 'oct-w1',
    period: 'Week 1',
    month: 'October',
    dateRange: 'Oct 14 - Oct 20',
    dsa: 'Big-O, arrays, two pointers',
    fullstack: 'React fundamentals, components, JSX',
    mobile: 'RN setup, environment (CLI / Expo), core components',
    project: 'Refactor one existing UI into clean modular components',
    career: 'Git/GitHub portfolio setup, profile audit',
    status: 'In Progress',
    completedTasks: [],
    isLightWeek: false,
    notes: 'Focus on core array algorithms and clean Git commit history.',
  },
  {
    id: 'oct-w2',
    period: 'Week 2',
    month: 'October',
    dateRange: 'Oct 21 - Oct 27',
    dsa: 'Hash maps, frequency counters, sliding window',
    fullstack: 'Hooks, forms, state management (Context/Zustand)',
    mobile: 'Flexbox, styling, responsive mobile layouts',
    project: 'Build a small interactive component dashboard',
    career: 'Explain React lifecycle & state management in mock',
    status: 'Not Started',
    completedTasks: [],
    isLightWeek: false,
    notes: '',
  },
  {
    id: 'oct-w3',
    period: 'Week 3',
    month: 'Oct - Nov',
    dateRange: 'Oct 28 - Nov 3',
    dsa: 'Stack, queue, monotonic stack basics',
    fullstack: 'Context, custom hooks, API integration (Axios/Fetch)',
    mobile: 'Navigation (React Navigation: Stack & Tabs)',
    project: 'Build reusable UI component library',
    career: '1 mock interview: Frontend & Core JS fundamentals',
    status: 'Not Started',
    completedTasks: [],
    isLightWeek: false,
    notes: '',
  },
  {
    id: 'nov-w1',
    period: 'Week 4',
    month: 'November',
    dateRange: 'Nov 4 - Nov 10',
    dsa: 'Binary search, search on answers',
    fullstack: 'TypeScript fundamentals in React & state typing',
    mobile: 'AsyncStorage, local persistence, offline state',
    project: 'React app converted to TypeScript with full typing',
    career: 'Update LinkedIn/resume with TS & modern React projects',
    status: 'Not Started',
    completedTasks: [],
    isLightWeek: false,
    notes: '',
  },
  {
    id: 'nov-w2',
    period: 'Week 5',
    month: 'November',
    dateRange: 'Nov 11 - Nov 17',
    dsa: 'Linked lists, fast-slow pointers, reversal patterns',
    fullstack: 'Advanced React: memoization, performance optimization, React 19 features',
    mobile: 'Native animations (Reanimated 3 / Animated API)',
    project: 'Profile/Settings system with offline-first persistence',
    career: 'System design basics: Client caching, optimistic UI',
    status: 'Not Started',
    completedTasks: [],
    isLightWeek: false,
    notes: '',
  },
  {
    id: 'nov-w3',
    period: 'Week 6',
    month: 'November',
    dateRange: 'Nov 18 - Nov 24',
    dsa: 'Recursion fundamentals & backtracking basics',
    fullstack: 'Backend API design with Node.js/Express & Firestore',
    mobile: 'State management in React Native (Zustand & Context)',
    project: 'Full-stack task & habits API with real-time sync',
    career: 'Behavioral prep: STAR stories for engineering leadership',
    status: 'Not Started',
    completedTasks: [],
    isLightWeek: false,
    notes: '',
  },
  {
    id: 'nov-w4',
    period: 'Week 7',
    month: 'Nov - Dec',
    dateRange: 'Nov 25 - Dec 1',
    dsa: 'Binary Trees: traversals, DFS, BFS, level order',
    fullstack: 'Authentication & RBAC security: JWT, Firebase Auth, sessions',
    mobile: 'Push notifications & background tasks (Expo / Notifee)',
    project: 'Multi-role RBAC admin & employee permission manager',
    career: 'Mock technical screen: Data structures & problem solving',
    status: 'Not Started',
    completedTasks: [],
    isLightWeek: false,
    notes: '',
  },
  {
    id: 'dec-w1',
    period: 'Week 8',
    month: 'December',
    dateRange: 'Dec 2 - Dec 8',
    dsa: 'Binary Search Trees (BST) & tree validation',
    fullstack: 'Database optimization, indexing, queries & pagination',
    mobile: 'Device camera, photo uploads, image compression',
    project: 'Profile avatar & picture upload system with cloud storage',
    career: 'Portfolio review: Polish live GitHub repos & READMEs',
    status: 'Not Started',
    completedTasks: [],
    isLightWeek: false,
    notes: '',
  },
  {
    id: 'dec-w2',
    period: 'Week 9',
    month: 'December',
    dateRange: 'Dec 9 - Dec 15',
    dsa: 'Graphs: BFS, DFS, adjacency list representations',
    fullstack: 'Excel parser / exporter with sheetjs & CSV processing',
    mobile: 'Offline-first SQLite / WatermelonDB in React Native',
    project: 'Spreadsheet import/export tool for protocols & schedules',
    career: 'Apply to 10 tier-1 frontend & full-stack roles',
    status: 'Not Started',
    completedTasks: [],
    isLightWeek: false,
    notes: '',
  },
  {
    id: 'dec-w3',
    period: 'Week 10',
    month: 'December',
    dateRange: 'Dec 16 - Dec 22',
    dsa: 'Graph cycle detection, topological sort & bipartite check',
    fullstack: 'Real-time WebSockets & cloud listener architectures',
    mobile: 'App performance profiling, bundle optimization & Hermes',
    project: 'Real-time collaborative workspace / tracker',
    career: 'System design interview: Live analytics dashboard',
    status: 'Not Started',
    completedTasks: [],
    isLightWeek: false,
    notes: '',
  },
  {
    id: 'dec-w4',
    period: 'Week 11',
    month: 'December',
    dateRange: 'Dec 23 - Dec 29',
    dsa: 'Dynamic Programming (DP) 1D: memoization & tabulation',
    fullstack: 'Testing: Unit & Integration tests with Vitest / Jest',
    mobile: 'End-to-end mobile testing with Detox / Maestro',
    project: 'Comprehensive automated test suite for web & mobile',
    career: 'Mock interview: Live pair programming & code walkthrough',
    status: 'Not Started',
    completedTasks: [],
    isLightWeek: false,
    notes: '',
  },
  {
    id: 'dec-w5',
    period: 'Week 12',
    month: 'Dec - Jan',
    dateRange: 'Dec 30 - Jan 5',
    dsa: 'Dynamic Programming 2D: grid paths, knapsack patterns',
    fullstack: 'CI/CD pipeline: GitHub Actions, automated builds & deployment',
    mobile: 'Android APK / iOS build pipeline with Fastlane',
    project: 'Production ready deployment on Vercel / Cloudflare',
    career: 'Follow-ups on job applications & technical recruiter calls',
    status: 'Not Started',
    completedTasks: [],
    isLightWeek: false,
    notes: '',
  },
  {
    id: 'jan-w1',
    period: 'Week 13',
    month: 'January',
    dateRange: 'Jan 6 - Jan 12',
    dsa: 'Trie, Disjoint Set Union (DSU) & interval problems',
    fullstack: 'Micro-frontends, monorepos (Turborepo) & design systems',
    mobile: 'Publishing: Google Play Store & Apple App Store readiness',
    project: 'LifeTracker Android app build with Capacitor',
    career: 'Interview round: Deep dive technical architecture',
    status: 'Not Started',
    completedTasks: [],
    isLightWeek: false,
    notes: '',
  },
  {
    id: 'jan-w2',
    period: 'Week 14',
    month: 'January',
    dateRange: 'Jan 13 - Jan 19',
    dsa: 'Top 50 Blind 75 / NeetCode high-frequency problem marathon',
    fullstack: 'Advanced security: CSRF, XSS, rate limiting, encryption',
    mobile: 'Crash analytics, Sentry error monitoring & telemetry',
    project: 'Full security audit & production hardening',
    career: 'Salary negotiation prep & total compensation benchmarks',
    status: 'Not Started',
    completedTasks: [],
    isLightWeek: false,
    notes: '',
  },
  {
    id: 'jan-w3',
    period: 'Week 15',
    month: 'January',
    dateRange: 'Jan 20 - Jan 26',
    dsa: 'Mock coding interview simulations under 45-minute timer',
    fullstack: 'Full-stack engineering recap & edge cases',
    mobile: 'Mobile system design recap: Feed architecture & caching',
    project: 'Final capstone portfolio release & live demo video',
    career: 'Final on-site interview rounds',
    status: 'Not Started',
    completedTasks: [],
    isLightWeek: false,
    notes: '',
  },
  {
    id: 'jan-w4',
    period: 'Week 16',
    month: 'Jan - Feb',
    dateRange: 'Jan 27 - Feb 2',
    dsa: 'Light review & algorithmic intuition mastery',
    fullstack: 'Annual achievement audit & career retrospective',
    mobile: 'Play Store release celebration',
    project: 'Year-end review & 2027 high-income career roadmap',
    career: 'Offer evaluation, acceptance & onboarding',
    status: 'Not Started',
    completedTasks: [],
    isLightWeek: true,
    notes: 'Rest, recharge, celebrate milestones & step into high-paying SWE role.',
  }
];

export const DB_ROADMAP_OUTCOMES = [
  { icon: 'Award', title: '16-Week Mastery', desc: 'DSA, React 19, TypeScript, React Native & System Design' },
  { icon: 'Layers', title: 'Full Stack & Mobile', desc: 'Complete web apps + native Android APK builds via Capacitor' },
  { icon: 'Sparkles', title: 'Cloud Connected', desc: 'Firebase Firestore cloud database sync & RBAC permissions' },
  { icon: 'Briefcase', title: 'High-Paying SWE Offer', desc: 'Comprehensive mock interviews, portfolio audit & resume polish' },
];

export const DB_MCU_WATCHLIST_TEMPLATE = [
  {
    id: 'list-mcu-doomsday',
    title: 'Marvel Cinematic Universe (Avengers: Doomsday 72-Title Watch Order)',
    description: 'Track all 72 MCU movies, Fox X-Men saga, Disney+ series, and special presentations in chronological story order leading to Avengers: Doomsday.',
    icon: 'Film',
    color: '#ef4444',
    items: [
      // Before 1950 (01 to 05)
      { id: 'mcu-1', number: '01', type: 'TV', title: 'Eyes of Wakanda (Season 1)', category: 'Before 1950', importance: 'Essential for Doomsday', rating: '6.2', status: 'unwatched', notes: 'Set in 1260 BC–1896 · 4 animated eps ~30min · Its last episode leads into Black Panther.' },
      { id: 'mcu-2', number: '02', type: 'FILM', title: 'Captain America: The First Avenger', category: 'Before 1950', importance: 'Essential for Doomsday', rating: '7.0', status: 'watched', notes: 'Set in 1943–1945 · 1 Credit · STOP before credits — the credits scene belongs RIGHT BEFORE The Avengers' },
      { id: 'mcu-3', number: '03', type: 'SPC', title: 'Marvel One-Shot: Agent Carter', category: 'Before 1950', importance: 'Essential for Doomsday', rating: '7.2', status: 'unwatched', notes: 'Set in 1946 · Short film canon to SSR & S.H.I.E.L.D. founding.' },
      { id: 'mcu-4', number: '04', type: 'TV', title: 'Agent Carter (Season 1)', category: 'Before 1950', importance: 'Essential for Doomsday', rating: '7.5', status: 'unwatched', notes: 'Set in 1946 · 8 eps · 1946 SSR operations.' },
      { id: 'mcu-5', number: '05', type: 'TV', title: 'Agent Carter (Season 2)', category: 'Before 1950', importance: 'Essential for Doomsday', rating: '7.5', status: 'unwatched', notes: 'Set in 1947 · 10 eps · 1947 Hollywood Zero Matter investigation.' },

      // 1960s and 1970s (06 to 07)
      { id: 'mcu-6', number: '06', type: 'FILM', studio: 'FOX', title: 'X-Men: First Class', category: '1960s and 1970s', importance: 'Recommended for Doomsday', rating: '7.3', status: 'watched', notes: 'Set in 1962 · Cuban Missile Crisis · Charles Xavier & Magneto origin.' },
      { id: 'mcu-7', number: '07', type: 'FILM', studio: 'FOX', title: 'X-Men Origins: Wolverine', category: '1960s and 1970s', importance: 'Unconfirmed for Doomsday', rating: '6.3', status: 'unwatched', notes: 'Set in 1845–1979 · Optional — Logan is the essential Wolverine film.' },

      // 1990s (08)
      { id: 'mcu-8', number: '08', type: 'FILM', title: 'Captain Marvel', category: '1990s', importance: 'Essential for Doomsday', rating: '6.8', status: 'watched', notes: 'Set in 1995 · 1 Credit · STOP before end-credits — post-credit scene belongs after Infinity War' },

      // 2000s (09 to 11)
      { id: 'mcu-9', number: '09', type: 'FILM', studio: 'FOX', title: 'X-Men', category: '2000s', importance: 'Recommended for Doomsday', rating: '7.0', status: 'watched', notes: 'Set in 2000 · Original Fox mutant saga beginning.' },
      { id: 'mcu-10', number: '10', type: 'FILM', studio: 'FOX', title: 'X2: X-Men United', category: '2000s', importance: 'Recommended for Doomsday', rating: '7.0', status: 'watched', notes: 'Set in 2003 · Weapon X & Colonel Stryker invasion.' },
      { id: 'mcu-11', number: '11', type: 'FILM', studio: 'FOX', title: 'X-Men: The Last Stand', category: '2000s', importance: 'Recommended for Doomsday', rating: '6.4', status: 'unwatched', notes: 'Set in 2006 · Mutant cure & Dark Phoenix manifestation.' },

      // 2008 to 2012 (12 to 19)
      { id: 'mcu-12', number: '12', type: 'FILM', title: 'Iron Man', category: '2008 to 2012', importance: 'Essential for Doomsday', rating: '7.7', status: 'watched', notes: 'Set in 2008 · Watch all credits · "I am Iron Man" birth of the MCU.' },
      { id: 'mcu-13', number: '13', type: 'FILM', title: 'Iron Man 2', category: '2008 to 2012', importance: 'Essential for Doomsday', rating: '6.9', status: 'watched', notes: 'Set in 2010 · 1 Credit · STOP before credits — the credits scene belongs RIGHT BEFORE Thor' },
      { id: 'mcu-14', number: '14', type: 'FILM', title: 'The Incredible Hulk', category: '2008 to 2012', importance: 'Essential for Doomsday', rating: '6.3', status: 'unwatched', notes: 'Set in 2010 · Watch all credits · Bruce Banner origin.' },
      { id: 'mcu-15', number: '15', type: 'SPC', title: 'Iron Man 2 (Post-Credit Scene)', category: '2008 to 2012', importance: 'Essential for Doomsday', rating: '7.0', status: 'unwatched', notes: 'Coulson arrives in New Mexico discovering Mjolnir hammer crater.' },
      { id: 'mcu-16', number: '16', type: 'FILM', title: 'Thor', category: '2008 to 2012', importance: 'Essential for Doomsday', rating: '6.8', status: 'watched', notes: 'Set in 2010 · 1 Credit · STOP before credits — the credits scene belongs RIGHT BEFORE The Avengers' },
      { id: 'mcu-17', number: '17', type: 'SPC', title: 'Captain America: The First Avenger (Credits)', category: '2008 to 2012', importance: 'Essential for Doomsday', rating: '7.0', status: 'unwatched', notes: 'Steve Rogers waking up in modern Times Square, recruited by Nick Fury.' },
      { id: 'mcu-18', number: '18', type: 'SPC', title: 'Thor (Post-Credit Scene)', category: '2008 to 2012', importance: 'Essential for Doomsday', rating: '7.0', status: 'unwatched', notes: 'Nick Fury shows Dr. Selvig the Tesseract; Loki mind controls him.' },
      { id: 'mcu-19', number: '19', type: 'FILM', title: 'The Avengers', category: '2008 to 2012', importance: 'Essential for Doomsday', rating: '8.1', status: 'watched', notes: 'Set in 2012 · Watch all credits · Battle of New York team assembly.' },

      // 2013 and 2014 (20 to 28)
      { id: 'mcu-20', number: '20', type: 'FILM', studio: 'FOX', title: 'The Wolverine', category: '2013 and 2014', importance: 'Optional for Doomsday', rating: '6.4', status: 'unwatched', notes: 'Set in 2013 · Optional — bridges The Last Stand to Days of Future Past.' },
      { id: 'mcu-21', number: '21', type: 'FILM', studio: 'FOX', title: 'X-Men: Days of Future Past', category: '2013 and 2014', importance: 'Recommended for Doomsday', rating: '7.5', status: 'watched', notes: 'Set in 1973 & future dystopia · Time travel multiverse milestone.' },
      { id: 'mcu-22', number: '22', type: 'FILM', studio: 'FOX', title: 'X-Men: Apocalypse', category: '2013 and 2014', importance: 'Recommended for Doomsday', rating: '6.5', status: 'unwatched', notes: 'Set in 1983 · Optional — continues the First Class and Days of Future Past timeline.' },
      { id: 'mcu-23', number: '23', type: 'FILM', studio: 'FOX', title: 'Dark Phoenix', category: '2013 and 2014', importance: 'Recommended for Doomsday', rating: '6.0', status: 'unwatched', notes: 'Set in 1992 · Optional — the final film of the Fox X-Men saga.' },
      { id: 'mcu-24', number: '24', type: 'FILM', title: 'Thor: The Dark World', category: '2013 and 2014', importance: 'Essential for Doomsday', rating: '6.5', status: 'unwatched', notes: 'Set in 2013 · Watch all credits · Reality Stone (Aether) introduction.' },
      { id: 'mcu-25', number: '25', type: 'FILM', title: 'Iron Man 3', category: '2013 and 2014', importance: 'Essential for Doomsday', rating: '6.9', status: 'watched', notes: 'Set in 2013–2014 · Watch credits · Tony Stark PTSD & Clean Slate Protocol.' },
      { id: 'mcu-26', number: '26', type: 'FILM', title: 'Captain America: The Winter Soldier', category: '2013 and 2014', importance: 'Essential for Doomsday', rating: '7.7', status: 'watched', notes: 'Set in 2014 · Watch credits · HYDRA inside S.H.I.E.L.D. & Bucky Barnes.' },
      { id: 'mcu-27', number: '27', type: 'FILM', title: 'Guardians of the Galaxy', category: '2013 and 2014', importance: 'Essential for Doomsday', rating: '7.9', status: 'watched', notes: 'Set in 2014 · Watch both credit scenes · Cosmic MCU & Power Stone.' },
      { id: 'mcu-28', number: '28', type: 'FILM', title: 'Guardians of the Galaxy Vol. 2', category: '2013 and 2014', importance: 'Essential for Doomsday', rating: '7.6', status: 'watched', notes: 'Set in 2014 · Watch all 5 credits · Ego the Living Planet & Celestial blood.' },

      // 2015 and 2016 (29 to 38)
      { id: 'mcu-29', number: '29', type: 'FILM', title: 'Avengers: Age of Ultron', category: '2015 and 2016', importance: 'Essential for Doomsday', rating: '7.3', status: 'watched', notes: 'Set in 2015 · Watch mid-credits · Wanda Maximoff, Vision & Mind Stone.' },
      { id: 'mcu-30', number: '30', type: 'FILM', title: 'Ant-Man', category: '2015 and 2016', importance: 'Essential for Doomsday', rating: '7.1', status: 'watched', notes: 'Set in 2015 · Watch credits · Scott Lang & first look at Quantum Realm.' },
      { id: 'mcu-31', number: '31', type: 'FILM', title: 'Captain America: Civil War', category: '2015 and 2016', importance: 'Essential for Doomsday', rating: '7.5', status: 'watched', notes: 'Set in 2016 · Watch credits · Introduces Spider-Man & Black Panther.' },
      { id: 'mcu-32', number: '32', type: 'SPC', title: 'Team Thor', category: '2015 and 2016', importance: 'Optional for Doomsday', rating: '7.2', status: 'unwatched', notes: 'Set in 2016 · Comedic mockumentary with flatmate Darryl — skippable.' },
      { id: 'mcu-33', number: '33', type: 'SPC', title: 'Team Thor: Part 2', category: '2015 and 2016', importance: 'Optional for Doomsday', rating: '6.9', status: 'unwatched', notes: 'Set in 2016 · Comedic short with flatmate Darryl — skippable.' },
      { id: 'mcu-34', number: '34', type: 'FILM', studio: 'FOX', title: 'Deadpool', category: '2015 and 2016', importance: 'Essential for Doomsday', rating: '7.6', status: 'watched', notes: 'Set in 2016 · Watch before Deadpool & Wolverine · Wade Wilson origin.' },
      { id: 'mcu-35', number: '35', type: 'FILM', title: 'Black Widow', category: '2015 and 2016', importance: 'Essential for Doomsday', rating: '7.2', status: 'watched', notes: 'Set in 2016 · 1 Credit · STOP before end-credits — post-credit scene belongs right before Hawkeye' },
      { id: 'mcu-36', number: '36', type: 'FILM', title: 'Black Panther', category: '2015 and 2016', importance: 'Essential for Doomsday', rating: '7.4', status: 'watched', notes: 'Set in 2016 · Watch credits · Wakanda world & Vibranium civilization.' },
      { id: 'mcu-37', number: '37', type: 'FILM', title: 'Spider-Man: Homecoming', category: '2015 and 2016', importance: 'Essential for Doomsday', rating: '7.3', status: 'watched', notes: 'Set in 2016 · Watch credits · Peter Parker high school arc & Tony mentorship.' },
      { id: 'mcu-38', number: '38', type: 'FILM', title: 'Doctor Strange', category: '2015 and 2016', importance: 'Essential for Doomsday', rating: '7.4', status: 'watched', notes: 'Set in 2016–2017 · Watch credits · Kamar-Taj, Mystic Arts & Time Stone.' },

      // 2017 and 2018 (39 to 46)
      { id: 'mcu-39', number: '39', type: 'FILM', title: 'Thor: Ragnarok', category: '2017 and 2018', importance: 'Essential for Doomsday', rating: '7.6', status: 'watched', notes: 'Set in 2017 · Watch credits · Asgard destruction & Sakaar gladiators.' },
      { id: 'mcu-40', number: '40', type: 'SPC', title: 'Team Darryl', category: '2017 and 2018', importance: 'Optional for Doomsday', rating: '6.2', status: 'unwatched', notes: 'Comedic short with Grandmaster as roommate — skippable.' },
      { id: 'mcu-41', number: '41', type: 'FILM', studio: 'FOX', title: 'Logan', category: '2017 and 2018', importance: 'Recommended for Doomsday', rating: '7.8', status: 'watched', notes: 'Set in 2029 · Recommended before Deadpool & Wolverine · Hugh Jackman emotional climax.' },
      { id: 'mcu-42', number: '42', type: 'FILM', studio: 'FOX', title: 'Deadpool 2', category: '2017 and 2018', importance: 'Essential for Doomsday', rating: '7.5', status: 'watched', notes: 'Set in 2018 · Watch before Deadpool & Wolverine · Cable & time device.' },
      { id: 'mcu-43', number: '43', type: 'FILM', title: 'Ant-Man and the Wasp', category: '2017 and 2018', importance: 'Essential for Doomsday', rating: '6.9', status: 'watched', notes: 'Set in 2018 · 1 Credit · STOP before credits — the credits scene belongs RIGHT AFTER Infinity War' },
      { id: 'mcu-44', number: '44', type: 'FILM', title: 'Avengers: Infinity War', category: '2017 and 2018', importance: 'Essential for Doomsday', rating: '8.2', status: 'watched', notes: 'Set in 2018 · Watch main credits. PAUSE before post-credits · The Thanos Snap.' },
      { id: 'mcu-45', number: '45', type: 'SPC', title: 'Ant-Man & The Wasp (All Credits)', category: '2017 and 2018', importance: 'Essential for Doomsday', rating: '7.0', status: 'watched', notes: 'Watch right after Infinity War · Hank, Janet & Hope dust while Scott is in Quantum Realm.' },
      { id: 'mcu-46', number: '46', type: 'SPC', title: 'Captain Marvel (Post-Credits Scene)', category: '2017 and 2018', importance: 'Essential for Doomsday', rating: '7.0', status: 'watched', notes: 'Watch NOW — directly connects to Endgame opening · Carol Danvers answers pager.' },

      // 2019 to 2023 (47 to 51)
      { id: 'mcu-47', number: '47', type: 'FILM', title: 'Avengers: Endgame', category: '2019 to 2023', importance: 'Essential for Doomsday', rating: '8.2', status: 'watched', notes: 'Set in 2018–2023 · Block out 3 hours · Time Heist & Tony Stark sacrifice.' },
      { id: 'mcu-48', number: '48', type: 'FILM', title: 'Avengers: Endgame Encore', category: '2019 to 2023', importance: 'Essential for Doomsday', rating: '8.2', status: 'unwatched', notes: 'Set in 2018–2023 · 1 Credit · Block out just over 3 hours. Same story as Endgame with theatrical re-release tribute.' },
      { id: 'mcu-49', number: '49', type: 'TV', title: 'Loki (Season 1)', category: '2019 to 2023', importance: 'Essential for Doomsday', rating: '8.2', status: 'watched', notes: '6 eps · Sacred Timeline, TVA, He Who Remains & Multiversal War origin.' },
      { id: 'mcu-50', number: '50', type: 'TV', title: 'WandaVision (Season 1)', category: '2019 to 2023', importance: 'Essential for Doomsday', rating: '8.2', status: 'watched', notes: 'Set in 2023 · 9 eps · Stay for episode 9 mid-credits · Scarlet Witch transformation.' },
      { id: 'mcu-51', number: '51', type: 'SPC', title: 'WandaVision (Ep 9 Mid-Credit Scene)', category: '2019 to 2023', importance: 'Essential for Doomsday', rating: '7.5', status: 'watched', notes: 'The scene in the middle of episode 9 credits. Watch it as you finish the episode.' },

      // 2024 (52 to 59)
      { id: 'mcu-52', number: '52', type: 'FILM', title: 'Shang-Chi and the Legend of the Ten Rings', category: '2024', importance: 'Essential for Doomsday', rating: '7.5', status: 'watched', notes: 'Set in 2024 · Watch credits · Ancient Ten Rings multiversal signal.' },
      { id: 'mcu-53', number: '53', type: 'TV', title: 'The Falcon and the Winter Soldier (Season 1)', category: '2024', importance: 'Essential for Doomsday', rating: '7.6', status: 'watched', notes: 'Set in 2024 · 6 eps · Sam Wilson becomes Captain America.' },
      { id: 'mcu-54', number: '54', type: 'SPC', title: "Peter's To-Do List", category: '2024', importance: 'Essential for Doomsday', rating: '7.0', status: 'unwatched', notes: 'Part of Far From Home — four minutes of footage cut from it. Watch with the film.' },
      { id: 'mcu-55', number: '55', type: 'FILM', title: 'Spider-Man: Far From Home', category: '2024', importance: 'Essential for Doomsday', rating: '7.4', status: 'watched', notes: 'Set in 2024 · 1 Credit · Watch credits · Mysterio & Identity revealed to the world.' },
      { id: 'mcu-56', number: '56', type: 'FILM', title: 'Spider-Man: No Way Home', category: '2024', importance: 'Essential for Doomsday', rating: '7.9', status: 'watched', notes: 'Set in 2024 · Tobey Maguire, Andrew Garfield & Tom Holland Multiverse collision.' },
      { id: 'mcu-57', number: '57', type: 'FILM', title: 'Doctor Strange in the Multiverse of Madness', category: '2024', importance: 'Essential for Doomsday', rating: '7.2', status: 'watched', notes: 'Set in 2024 · Earth-838 Illuminati, Incursions & Darkhold corruption.' },
      { id: 'mcu-58', number: '58', type: 'SPC', title: 'Black Widow (Post-Credit Scene)', category: '2024', importance: 'Essential for Doomsday', rating: '7.0', status: 'watched', notes: 'Watch NOW — directly sets up Hawkeye · Contessa Valentina visits Natasha grave.' },
      { id: 'mcu-59', number: '59', type: 'TV', title: 'Hawkeye (Season 1)', category: '2024', importance: 'Essential for Doomsday', rating: '7.8', status: 'watched', notes: 'Set in 2024 · 6 eps · Clint Barton, Kate Bishop & Kingpin return.' },

      // 2025 (60 to 62)
      { id: 'mcu-60', number: '60', type: 'FILM', title: 'Black Panther: Wakanda Forever', category: '2025', importance: 'Essential for Doomsday', rating: '7.0', status: 'watched', notes: 'Set in 2025 · Shuri takes mantle · Namor & Talokan introduction.' },
      { id: 'mcu-61', number: '61', type: 'TV', title: 'Ms. Marvel (Season 1)', category: '2025', importance: 'Optional for Doomsday', rating: '6.3', status: 'unwatched', notes: 'Set in 2025 · 6 eps · Kamala Khan Noor dimension & mutant bangle.' },
      { id: 'mcu-62', number: '62', type: 'FILM', title: 'Thor: Love and Thunder', category: '2025', importance: 'Essential for Doomsday', rating: '6.4', status: 'watched', notes: 'Set in 2025 · Gorr the God Butcher & Eternity realm.' },

      // 2026 (63 to 66)
      { id: 'mcu-63', number: '63', type: 'FILM', title: 'Ant-Man and the Wasp: Quantumania', category: '2026', importance: 'Essential for Doomsday', rating: '6.2', status: 'watched', notes: 'Set in 2026 · Kang the Conqueror & Quantum Realm multiverse gateway.' },
      { id: 'mcu-64', number: '64', type: 'FILM', title: 'The Marvels', category: '2026', importance: 'Optional for Doomsday', rating: '5.9', status: 'unwatched', notes: 'Set in 2026 · Carol, Monica & Kamala team up · X-Men universe tear in credits.' },
      { id: 'mcu-65', number: '65', type: 'TV', title: 'Loki (Season 2)', category: '2026', importance: 'Essential for Doomsday', rating: '8.2', status: 'watched', notes: '6 eps · God of Stories · Loki weaves and holds the multiverse timeline tree.' },
      { id: 'mcu-66', number: '66', type: 'FILM', studio: 'FOX', title: 'Deadpool & Wolverine', category: '2026', importance: 'Essential for Doomsday', rating: '7.6', status: 'watched', notes: 'Set in 2024 in Fox Universe & Void · Anchor beings, TVA & Wolverine team-up.' },

      // 2027 and 2028 (67 to 72)
      { id: 'mcu-67', number: '67', type: 'FILM', title: 'Captain America: Brave New World', category: '2027 and 2028', importance: 'Essential for Doomsday', rating: '6.0', status: 'unwatched', notes: 'Set in 2026–2027 · Red Hulk, Adamantium global crisis & President Ross.' },
      { id: 'mcu-68', number: '68', type: 'FILM', title: 'Thunderbolts*', category: '2027 and 2028', importance: 'Essential for Doomsday', rating: '7.3', status: 'unwatched', notes: 'Set in 2027 · Yelena Belova, Bucky Barnes, Sentry & anti-hero team.' },
      { id: 'mcu-69', number: '69', type: 'FILM', title: 'The Fantastic Four: First Steps', category: '2027 and 2028', importance: 'Essential for Doomsday', rating: '7.0', status: 'unwatched', notes: 'Set in 1964 in retro-future universe · Reed Richards, Sue Storm & Galactus.' },
      { id: 'mcu-70', number: '70', type: 'FILM', title: 'Spider-Man: Brand New Day', category: '2027 and 2028', importance: 'Optional for Doomsday', rating: '8.0', status: 'unwatched', notes: 'Set in 2028 · Peter Parker street-level hero era in post-memory wipe New York.' },
      { id: 'mcu-71', number: '71', type: 'SPC', title: 'Avengers: Endgame Encore (New Scenes)', category: '2027 and 2028', importance: 'Essential for Doomsday', rating: '7.5', status: 'unwatched', notes: 'Shown with the Encore in cinemas. If you can, see the Encore after Brand New Day.' },
      { id: 'mcu-72', number: '72', type: 'FILM', title: 'Avengers: Doomsday', category: '2027 and 2028', importance: 'Essential for Doomsday', rating: '10.0', status: 'unwatched', notes: 'Set in 2028 · Robert Downey Jr. stars as Doctor Doom in the Multiverse Saga culmination!' }
    ]
  }
];


// ============================================================================
// 2. DATABASE INITIALIZATION & CLOUD SEEDING
// ============================================================================

/**
 * Seed cloud Firestore database collections if they are empty
 */
export const seedDatabaseIfEmpty = async () => {
  const initRes = initFirebase();
  if (!initRes.success || !db) return { success: false, reason: 'offline_mode' };

  try {
    // 1. Seed Health Protocol Template in Firestore (and update if juices count < 20)
    const healthDocRef = doc(db, 'system_templates', 'health_protocol');
    const healthSnap = await getDoc(healthDocRef);
    if (!healthSnap.exists() || (healthSnap.data()?.juiceProtocol?.juices?.length || 0) < 20) {
      await setDoc(healthDocRef, {
        ...DB_HEALTH_PROTOCOL_TEMPLATE,
        seededAt: new Date().toISOString()
      }, { merge: true });
      console.log('🌱 Seeded 20 Juices in system_templates/health_protocol in Cloud Database');
    }

    // 2. Seed Career Roadmap Template
    const roadmapDocRef = doc(db, 'system_templates', 'career_roadmap');
    const roadmapSnap = await getDoc(roadmapDocRef);
    if (!roadmapSnap.exists()) {
      await setDoc(roadmapDocRef, {
        weeks: DB_CAREER_ROADMAP_TEMPLATE,
        outcomes: DB_ROADMAP_OUTCOMES,
        seededAt: new Date().toISOString()
      });
      console.log('🌱 Seeded system_templates/career_roadmap in Cloud Database');
    }

    // 3. Seed MCU Watchlist Template
    const mcuDocRef = doc(db, 'system_templates', 'mcu_watchlist');
    const mcuSnap = await getDoc(mcuDocRef);
    if (!mcuSnap.exists() || (mcuSnap.data()?.lists?.[0]?.items?.length || 0) < 72) {
      await setDoc(mcuDocRef, {
        lists: DB_MCU_WATCHLIST_TEMPLATE,
        seededAt: new Date().toISOString()
      }, { merge: true });
      console.log('🌱 Seeded 72 Titles in system_templates/mcu_watchlist in Cloud Database');
    }

    // 4. Seed 20 Night Diet Soups & Weekly Rotation in Firestore
    const soupsDocRef = doc(db, 'system_templates', 'night_diet_soups');
    const soupsSnap = await getDoc(soupsDocRef);
    if (!soupsSnap.exists()) {
      await setDoc(soupsDocRef, {
        soups: NIGHT_DIET_SOUPS,
        weeklyRotation: WEEKLY_SOUP_ROTATION,
        tips: SOUP_WEIGHT_LOSS_TIPS,
        count: NIGHT_DIET_SOUPS.length,
        seededAt: new Date().toISOString()
      });
      console.log('🌱 Seeded system_templates/night_diet_soups in Cloud Database');
    }

    return { success: true };
  } catch (err) {
    console.error('Error seeding Cloud Database:', err);
    return { success: false, error: err };
  }
};

// ============================================================================
// 3. LIVE DATABASE ASYNC METHODS (DIRECT DB CRUD)
// ============================================================================

/**
 * Save user health protocol directly to Cloud Database
 */
export const saveHealthProtocolToDB = async (userId, protocol) => {
  if (!db || !isInitialized) {
    initFirebase();
  }
  try {
    const clean = sanitizeHealthProtocol(protocol);
    const userDocRef = doc(db, 'users', userId || 'admin-super-001');
    await setDoc(userDocRef, {
      healthProtocol: clean,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    return { success: true, protocol: clean };
  } catch (err) {
    console.error('Error saving health protocol to DB:', err);
    return { success: false, error: err };
  }
};

/**
 * Fetch health protocol for user from Cloud Database
 */
export const getHealthProtocolFromDB = async (userId) => {
  if (!db || !isInitialized) {
    initFirebase();
  }
  try {
    const userDocRef = doc(db, 'users', userId || 'admin-super-001');
    const snap = await getDoc(userDocRef);
    if (snap.exists() && snap.data()?.healthProtocol) {
      return sanitizeHealthProtocol(snap.data().healthProtocol);
    }

    // Check system template if user has no document yet
    const tplDocRef = doc(db, 'system_templates', 'health_protocol');
    const tplSnap = await getDoc(tplDocRef);
    if (tplSnap.exists()) {
      return sanitizeHealthProtocol(tplSnap.data());
    }

    return DB_HEALTH_PROTOCOL_TEMPLATE;
  } catch (err) {
    console.error('Error fetching health protocol from DB:', err);
    return DB_HEALTH_PROTOCOL_TEMPLATE;
  }
};

/**
 * Real-time listener for Health Protocol in Cloud Database
 */
export const listenToHealthProtocolDB = (userId, onUpdate) => {
  if (!db || !isInitialized) {
    initFirebase();
    if (!db) return () => {};
  }
  try {
    const userDocRef = doc(db, 'users', userId || 'admin-super-001');
    return onSnapshot(userDocRef, (snap) => {
      if (snap.exists() && snap.data()?.healthProtocol) {
        onUpdate(sanitizeHealthProtocol(snap.data().healthProtocol));
      }
    }, (err) => {
      console.error('Health protocol DB listener error:', err);
    });
  } catch (err) {
    console.error('Failed to attach health protocol DB listener:', err);
    return () => {};
  }
};

/**
 * Fetch Night Diet Soups from Firestore with fallback to bundled master data
 */
export const getNightDietSoupsFromDB = async () => {
  if (!db || !isInitialized) {
    initFirebase();
  }
  try {
    const soupsDocRef = doc(db, 'system_templates', 'night_diet_soups');
    const snap = await getDoc(soupsDocRef);
    if (snap.exists() && snap.data()?.soups) {
      return snap.data();
    }
  } catch (err) {
    console.warn('Error fetching soups from DB, using bundled data:', err);
  }
  return {
    soups: NIGHT_DIET_SOUPS,
    weeklyRotation: WEEKLY_SOUP_ROTATION,
    tips: SOUP_WEIGHT_LOSS_TIPS,
  };
};

/**
 * Save Night Diet Soups directly to Cloud Firestore
 */
export const saveNightDietSoupsToDB = async (soupsData) => {
  if (!db || !isInitialized) {
    initFirebase();
  }
  try {
    const soupsDocRef = doc(db, 'system_templates', 'night_diet_soups');
    await setDoc(soupsDocRef, {
      ...soupsData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return { success: true };
  } catch (err) {
    console.error('Error saving night diet soups to DB:', err);
    return { success: false, error: err };
  }
};

// ============================================================================
// 4. TO-DO LIST & DAILY HISTORY CLOUD DATABASE CRUD (FOR FUTURE ANALYTICS)
// ============================================================================

/**
 * Save user To-Do List / Habits directly to Cloud Firestore
 */
export const saveTodoListToDB = async (userId = 'admin-super-001', todosList = [], trackerDate = null) => {
  if (!db || !isInitialized) {
    initFirebase();
  }
  if (!db) return { success: false, reason: 'offline_mode' };
  try {
    const cleanTodos = JSON.parse(JSON.stringify(todosList || []));
    const userDocRef = doc(db, 'users', userId);
    const updatePayload = {
      habits: cleanTodos,
      todos: cleanTodos,
      todoCount: cleanTodos.length,
      lastUpdated: new Date().toISOString(),
    };
    if (trackerDate) {
      updatePayload.lastTrackerDate = trackerDate;
    }
    await setDoc(userDocRef, updatePayload, { merge: true });
    return { success: true };
  } catch (err) {
    console.error('Error saving To-Do list to Cloud DB:', err);
    return { success: false, error: err };
  }
};

/**
 * Fetch To-Do List from Cloud Firestore
 */
export const getTodoListFromDB = async (userId = 'admin-super-001') => {
  if (!db || !isInitialized) {
    initFirebase();
  }
  if (!db) return null;
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return Array.isArray(data.todos) ? data.todos : (Array.isArray(data.habits) ? data.habits : null);
    }
    return null;
  } catch (err) {
    console.error('Error fetching To-Do list from Cloud DB:', err);
    return null;
  }
};

/**
 * Save historical daily progress & reflections to Cloud DB for future analytics
 */
export const saveDailyHistoryToDB = async (userId = 'admin-super-001', dailyHistory = {}, dailyHabitNotes = {}) => {
  if (!db || !isInitialized) {
    initFirebase();
  }
  if (!db) return { success: false, reason: 'offline_mode' };
  try {
    const cleanHistory = JSON.parse(JSON.stringify(dailyHistory || {}));
    const cleanNotes = JSON.parse(JSON.stringify(dailyHabitNotes || {}));
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      dailyHistory: cleanHistory,
      dailyHabitNotes: cleanNotes,
      historyCount: Object.keys(cleanHistory).length,
      lastHistorySync: new Date().toISOString(),
    }, { merge: true });
    return { success: true };
  } catch (err) {
    console.error('Error saving Daily History to Cloud DB:', err);
    return { success: false, error: err };
  }
};

/**
 * Archive a specific day's completed record into Cloud Firestore subcollection for permanent storage & analytics
 */
export const archiveDailyRecordToCloud = async (userId = 'admin-super-001', dateStr, daySummary) => {
  if (!db || !isInitialized) {
    initFirebase();
  }
  if (!db || !dateStr) return { success: false };
  try {
    const cleanSummary = JSON.parse(JSON.stringify(daySummary || {}));
    const dayDocRef = doc(db, 'users', userId, 'daily_history', dateStr);
    await setDoc(dayDocRef, {
      ...cleanSummary,
      date: dateStr,
      archivedAt: new Date().toISOString(),
    }, { merge: true });
    return { success: true };
  } catch (err) {
    console.error(`Error archiving day ${dateStr} to Cloud DB:`, err);
    return { success: false, error: err };
  }
};

/**
 * Fetch all historical daily records from Cloud DB for future deep-dive analytics
 */
export const getAllDailyHistoryFromDB = async (userId = 'admin-super-001') => {
  if (!db || !isInitialized) {
    initFirebase();
  }
  if (!db) return {};
  try {
    const historyMap = {};
    // 1. Fetch from user document first
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists() && snap.data()?.dailyHistory) {
      Object.assign(historyMap, snap.data().dailyHistory);
    }

    // 2. Query individual subcollection records if available
    try {
      const subColRef = collection(db, 'users', userId, 'daily_history');
      const subSnap = await getDocs(subColRef);
      subSnap.forEach(docSnap => {
        if (docSnap.id) {
          historyMap[docSnap.id] = { id: docSnap.id, ...docSnap.data() };
        }
      });
    } catch {
      // Ignore subcollection error if permissions don't allow listing
    }

    return historyMap;
  } catch (err) {
    console.error('Error fetching all daily history from Cloud DB:', err);
    return {};
  }
};

/**
 * Save user workout history directly to Cloud Firestore
 */
export const saveWorkoutHistoryToDB = async (userId = 'admin-super-001', workoutHistory = []) => {
  if (!db || !isInitialized) {
    initFirebase();
  }
  if (!db) return { success: false, reason: 'offline_mode' };
  try {
    const cleanHistory = JSON.parse(JSON.stringify(workoutHistory || []));
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      workoutHistory: cleanHistory,
      workoutCount: cleanHistory.length,
      lastWorkoutSync: new Date().toISOString(),
    }, { merge: true });
    return { success: true };
  } catch (err) {
    console.error('Error saving Workout History to Cloud DB:', err);
    return { success: false, error: err };
  }
};

/**
 * Fetch Workout History from Cloud Firestore
 */
export const getWorkoutHistoryFromDB = async (userId = 'admin-super-001') => {
  if (!db || !isInitialized) {
    initFirebase();
  }
  if (!db) return [];
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists() && Array.isArray(snap.data()?.workoutHistory)) {
      return snap.data().workoutHistory;
    }
    return [];
  } catch (err) {
    console.error('Error fetching Workout History from Cloud DB:', err);
    return [];
  }
};

