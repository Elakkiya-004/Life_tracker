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
    title: 'Marvel Cinematic Universe (Phase 1 to 6)',
    description: 'Track all MCU movies & Disney+ series in chronological & release order ahead of Avengers: Doomsday.',
    icon: 'Film',
    color: '#ef4444',
    items: [
      { id: 'mcu-1', number: '01', type: 'FILM', title: 'Iron Man (2008)', category: 'Phase 1', importance: 'Origin of MCU', rating: '7.9', status: 'watched', notes: 'Tony Stark builds the Mark I armor.' },
      { id: 'mcu-2', number: '02', type: 'FILM', title: 'The Incredible Hulk (2008)', category: 'Phase 1', importance: 'Phase 1 Canon', rating: '6.6', status: 'unwatched', notes: 'Bruce Banner origin.' },
      { id: 'mcu-3', number: '03', type: 'FILM', title: 'Iron Man 2 (2010)', category: 'Phase 1', importance: 'Introduces Black Widow & War Machine', rating: '6.9', status: 'watched', notes: 'Justin Hammer & Whiplash.' },
      { id: 'mcu-4', number: '04', type: 'FILM', title: 'Thor (2011)', category: 'Phase 1', importance: 'Introduces Thor, Loki & Asgard', rating: '7.0', status: 'watched', notes: 'God of Thunder banishment.' },
      { id: 'mcu-5', number: '05', type: 'FILM', title: 'Captain America: The First Avenger (2011)', category: 'Phase 1', importance: 'Introduces Steve Rogers & Tesseract', rating: '6.9', status: 'watched', notes: 'Super Soldier serum & Red Skull.' },
      { id: 'mcu-6', number: '06', type: 'FILM', title: 'The Avengers (2012)', category: 'Phase 1', importance: 'Battle of New York • Essential', rating: '8.0', status: 'watched', notes: 'First team assembly.' },
      { id: 'mcu-7', number: '07', type: 'FILM', title: 'Iron Man 3 (2013)', category: 'Phase 2', importance: 'Tony Stark PTSD Arc', rating: '7.1', status: 'watched', notes: 'Extremis & Clean Slate protocol.' },
      { id: 'mcu-8', number: '08', type: 'FILM', title: 'Thor: The Dark World (2013)', category: 'Phase 2', importance: 'Introduces Reality Stone (Aether)', rating: '6.8', status: 'unwatched', notes: 'Malekith & Dark Elves.' },
      { id: 'mcu-9', number: '09', type: 'FILM', title: 'Captain America: The Winter Soldier (2014)', category: 'Phase 2', importance: 'HYDRA Infiltration • Top Tier', rating: '7.8', status: 'watched', notes: 'Bucky Barnes return.' },
      { id: 'mcu-10', number: '10', type: 'FILM', title: 'Guardians of the Galaxy (2014)', category: 'Phase 2', importance: 'Introduces Cosmic MCU & Power Stone', rating: '8.0', status: 'watched', notes: 'Star-Lord, Gamora, Rocket, Groot, Drax.' },
      { id: 'mcu-11', number: '11', type: 'FILM', title: 'Avengers: Age of Ultron (2015)', category: 'Phase 2', importance: 'Introduces Wanda, Vision & Mind Stone', rating: '7.3', status: 'watched', notes: 'Sokovia destruction.' },
      { id: 'mcu-12', number: '12', type: 'FILM', title: 'Ant-Man (2015)', category: 'Phase 2', importance: 'Introduces Quantum Realm', rating: '7.3', status: 'watched', notes: 'Scott Lang & Hank Pym.' },
      { id: 'mcu-13', number: '13', type: 'FILM', title: 'Captain America: Civil War (2016)', category: 'Phase 3', importance: 'Introduces Spider-Man & Black Panther', rating: '7.8', status: 'watched', notes: 'Sokovia Accords division.' },
      { id: 'mcu-14', number: '14', type: 'FILM', title: 'Doctor Strange (2016)', category: 'Phase 3', importance: 'Introduces Mystic Arts & Time Stone', rating: '7.5', status: 'watched', notes: 'Stephen Strange & Dormammu.' },
      { id: 'mcu-15', number: '15', type: 'FILM', title: 'Guardians of the Galaxy Vol. 2 (2017)', category: 'Phase 3', importance: 'Ego the Living Planet', rating: '7.6', status: 'watched', notes: 'Yondu redemption.' },
      { id: 'mcu-16', number: '16', type: 'FILM', title: 'Spider-Man: Homecoming (2017)', category: 'Phase 3', importance: 'Peter Parker high school arc', rating: '7.4', status: 'watched', notes: 'Vulture & Iron Man mentorship.' },
      { id: 'mcu-17', number: '17', type: 'FILM', title: 'Thor: Ragnarok (2017)', category: 'Phase 3', importance: 'Asgard destruction • Essential', rating: '7.9', status: 'watched', notes: 'Hela & Planet Sakaar.' },
      { id: 'mcu-18', number: '18', type: 'FILM', title: 'Black Panther (2018)', category: 'Phase 3', importance: 'Wakanda & Vibranium world', rating: '7.3', status: 'watched', notes: "T'Challa & Killmonger." },
      { id: 'mcu-19', number: '19', type: 'FILM', title: 'Avengers: Infinity War (2018)', category: 'Phase 3', importance: 'Thanos Snap • Masterpiece', rating: '8.4', status: 'watched', notes: '50% universe wiped out.' },
      { id: 'mcu-20', number: '20', type: 'FILM', title: 'Ant-Man and the Wasp (2018)', category: 'Phase 3', importance: 'Quantum Realm Time Vortex', rating: '7.0', status: 'watched', notes: 'Ghost & Quantum extraction.' },
      { id: 'mcu-21', number: '21', type: 'FILM', title: 'Captain Marvel (2019)', category: 'Phase 3', importance: 'Carol Danvers & Space Stone Origin', rating: '6.8', status: 'unwatched', notes: 'Kree-Skrull war.' },
      { id: 'mcu-22', number: '22', type: 'FILM', title: 'Avengers: Endgame (2019)', category: 'Phase 3', importance: 'Time Heist & Climax • Pinnacle', rating: '8.4', status: 'watched', notes: 'Whatever it takes.' },
      { id: 'mcu-23', number: '23', type: 'FILM', title: 'Spider-Man: Far From Home (2019)', category: 'Phase 3', importance: 'Post-Endgame Legacy', rating: '7.4', status: 'watched', notes: 'Mysterio & Identity reveal.' },
      { id: 'mcu-24', number: '24', type: 'SERIES', title: 'WandaVision (2021)', category: 'Phase 4', importance: 'Scarlet Witch Transformation', rating: '7.9', status: 'watched', notes: 'Hex in Westview.' },
      { id: 'mcu-25', number: '25', type: 'SERIES', title: 'Loki Season 1 (2021)', category: 'Phase 4', importance: 'Multiverse Sacred Timeline & He Who Remains', rating: '8.2', status: 'watched', notes: 'TVA & Multiversal War origin.' },
      { id: 'mcu-26', number: '26', type: 'FILM', title: 'Spider-Man: No Way Home (2021)', category: 'Phase 4', importance: '3 Spider-Men Multiverse • Essential', rating: '8.2', status: 'watched', notes: 'Tobey, Andrew, Tom team-up.' },
      { id: 'mcu-27', number: '27', type: 'FILM', title: 'Doctor Strange in the Multiverse of Madness (2022)', category: 'Phase 4', importance: 'Incursions & Illuminati', rating: '6.9', status: 'watched', notes: 'Earth-838 & Darkhold.' },
      { id: 'mcu-28', number: '28', type: 'SERIES', title: 'Loki Season 2 (2023)', category: 'Phase 5', importance: 'God of Stories & Multiverse Anchor', rating: '8.2', status: 'watched', notes: 'Loki holds the multiverse tree.' },
      { id: 'mcu-29', number: '29', type: 'FILM', title: 'Deadpool & Wolverine (2024)', category: 'Phase 5', importance: 'Anchor Beings & Void Incursion', rating: '7.8', status: 'watched', notes: 'Deadpool joins the MCU.' },
      { id: 'mcu-30', number: '30', type: 'FILM', title: 'Avengers: Doomsday (2026)', category: 'Phase 6', importance: 'Robert Downey Jr. as Doctor Doom • Upcoming Climax', rating: '10.0', status: 'unwatched', notes: 'The Multiverse Saga Endgame begins.' }
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
    if (!mcuSnap.exists()) {
      await setDoc(mcuDocRef, {
        lists: DB_MCU_WATCHLIST_TEMPLATE,
        seededAt: new Date().toISOString()
      });
      console.log('🌱 Seeded system_templates/mcu_watchlist in Cloud Database');
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
    const userDocRef = doc(db, 'users', userId || 'default_user');
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
    const userDocRef = doc(db, 'users', userId || 'default_user');
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
    const userDocRef = doc(db, 'users', userId || 'default_user');
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
export const saveTodoListToDB = async (userId = 'default_user', todosList = []) => {
  if (!db || !isInitialized) {
    initFirebase();
  }
  if (!db) return { success: false, reason: 'offline_mode' };
  try {
    const cleanTodos = JSON.parse(JSON.stringify(todosList || []));
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      habits: cleanTodos,
      todos: cleanTodos,
      todoCount: cleanTodos.length,
      lastUpdated: new Date().toISOString(),
    }, { merge: true });
    return { success: true };
  } catch (err) {
    console.error('Error saving To-Do list to Cloud DB:', err);
    return { success: false, error: err };
  }
};

/**
 * Fetch To-Do List from Cloud Firestore
 */
export const getTodoListFromDB = async (userId = 'default_user') => {
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
export const saveDailyHistoryToDB = async (userId = 'default_user', dailyHistory = {}, dailyHabitNotes = {}) => {
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
export const archiveDailyRecordToCloud = async (userId = 'default_user', dateStr, daySummary) => {
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
export const getAllDailyHistoryFromDB = async (userId = 'default_user') => {
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

