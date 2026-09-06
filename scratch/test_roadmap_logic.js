const DB_CAREER_ROADMAP_TEMPLATE = [
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
  }
];

const mergeRoadmapWithDefaults = (existingList) => {
  if (!Array.isArray(existingList) || existingList.length === 0) return DB_CAREER_ROADMAP_TEMPLATE;
  return DB_CAREER_ROADMAP_TEMPLATE.map(defaultWeek => {
    const matched = existingList.find(w => w && (w.id === defaultWeek.id || w.period === defaultWeek.period));
    if (!matched) return defaultWeek;
    return {
      ...defaultWeek,
      status: matched.status || defaultWeek.status,
      completedTasks: Array.isArray(matched.completedTasks) ? matched.completedTasks : defaultWeek.completedTasks,
      isLightWeek: typeof matched.isLightWeek === 'boolean' ? matched.isLightWeek : defaultWeek.isLightWeek,
      notes: matched.notes !== undefined ? matched.notes : defaultWeek.notes,
    };
  });
};

const toggleRoadmapTask = (currentRoadmap, weekId, taskKey) => {
  const taskKeys = ['dsa', 'fullstack', 'mobile', 'project', 'career'];
  return currentRoadmap.map(week => {
    if (week.id !== weekId) return week;
    const prevCompleted = week.completedTasks || [];
    const isAlreadyDone = prevCompleted.includes(taskKey);
    const newCompleted = isAlreadyDone 
      ? prevCompleted.filter(k => k !== taskKey)
      : [...prevCompleted, taskKey];

    let newStatus = week.status;
    if (newCompleted.length === taskKeys.length) {
      newStatus = 'Completed';
    } else if (newCompleted.length > 0) {
      newStatus = 'In Progress';
    } else if (!week.isLightWeek) {
      newStatus = 'Not Started';
    }

    return {
      ...week,
      completedTasks: newCompleted,
      status: newStatus,
    };
  });
};

let state = DB_CAREER_ROADMAP_TEMPLATE;
console.log('Initial sep-w1 completedTasks:', state[0].completedTasks);
state = toggleRoadmapTask(state, 'sep-w1', 'fullstack');
console.log('After toggle fullstack on sep-w1:', state[0].completedTasks, 'status:', state[0].status);

const serialized = JSON.parse(JSON.stringify(state));
const merged = mergeRoadmapWithDefaults(serialized);
console.log('After merge with defaults:', merged[0].completedTasks, 'status:', merged[0].status);
