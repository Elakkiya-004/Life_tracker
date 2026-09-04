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
  }
};

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

  return protocol;
};

export const DB_CAREER_ROADMAP_TEMPLATE = [
  {
    id: 'sep-w1',
    period: 'Sep W1',
    month: 'September',
    dateRange: 'Sep 1 - Sep 7',
    dsa: 'Big-O, arrays, two pointers',
    fullstack: 'React fundamentals, components, JSX',
    mobile: 'RN setup, environment (CLI / Expo), core components',
    project: 'Refactor one existing UI into clean modular components',
    career: 'Git/GitHub portfolio setup, profile audit',
    status: 'In Progress',
    completedTasks: ['dsa'],
    isLightWeek: false,
    notes: 'Focus on core array algorithms and clean Git commit history.',
  },
  {
    id: 'sep-w2',
    period: 'Sep W2',
    month: 'September',
    dateRange: 'Sep 8 - Sep 14',
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
    id: 'sep-w3',
    period: 'Sep W3',
    month: 'September',
    dateRange: 'Sep 15 - Sep 21',
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
    id: 'sep-w4',
    period: 'Sep W4',
    month: 'September',
    dateRange: 'Sep 22 - Sep 30',
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
    id: 'oct-w1',
    period: 'Oct W1',
    month: 'October',
    dateRange: 'Oct 1 - Oct 7',
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
    id: 'oct-w2',
    period: 'Oct W2',
    month: 'October',
    dateRange: 'Oct 8 - Oct 14',
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
    id: 'oct-w3',
    period: 'Oct W3',
    month: 'October',
    dateRange: 'Oct 15 - Oct 21',
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
    id: 'oct-w4',
    period: 'Oct W4',
    month: 'October',
    dateRange: 'Oct 22 - Oct 31',
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
    id: 'nov-w1',
    period: 'Nov W1',
    month: 'November',
    dateRange: 'Nov 1 - Nov 7',
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
    id: 'nov-w2',
    period: 'Nov W2',
    month: 'November',
    dateRange: 'Nov 8 - Nov 14',
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
    id: 'nov-w3',
    period: 'Nov W3',
    month: 'November',
    dateRange: 'Nov 15 - Nov 21',
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
    id: 'nov-w4',
    period: 'Nov W4',
    month: 'November',
    dateRange: 'Nov 22 - Nov 30',
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
    id: 'dec-w1',
    period: 'Dec W1',
    month: 'December',
    dateRange: 'Dec 1 - Dec 7',
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
    id: 'dec-w2',
    period: 'Dec W2',
    month: 'December',
    dateRange: 'Dec 8 - Dec 14',
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
    id: 'dec-w3',
    period: 'Dec W3',
    month: 'December',
    dateRange: 'Dec 15 - Dec 21',
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
    id: 'dec-w4',
    period: 'Dec W4',
    month: 'December',
    dateRange: 'Dec 22 - Dec 31',
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
    // 1. Seed Health Protocol Template in Firestore
    const healthDocRef = doc(db, 'system_templates', 'health_protocol');
    const healthSnap = await getDoc(healthDocRef);
    if (!healthSnap.exists()) {
      await setDoc(healthDocRef, {
        ...DB_HEALTH_PROTOCOL_TEMPLATE,
        seededAt: new Date().toISOString()
      });
      console.log('🌱 Seeded system_templates/health_protocol in Cloud Database');
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
