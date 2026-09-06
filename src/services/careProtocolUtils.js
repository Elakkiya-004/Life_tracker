/**
 * Utility functions for Skin Care, Body Care, and Hair Care regimes:
 * - Frequency dropdown options & badges
 * - Normalizing routines and points (backward and forward compatible)
 * - Serializing routines back to state & legacy fields
 * - Extracting scheduled protocols for any day (e.g. Sunday) for Habit reminders
 */

export const FREQUENCY_OPTIONS = [
  { id: 'daily', label: 'Daily', badge: 'DAILY', tagClass: 'tag-daily' },
  { id: 'weekly', label: 'Weekly', badge: 'WEEKLY', tagClass: 'tag-weekly' },
  { id: 'two_days_once', label: 'Two days once (Alternate days)', badge: 'TWO DAYS ONCE', tagClass: 'tag-twodays' },
  { id: 'two_weeks_once', label: 'Two weeks once (Bi-Weekly)', badge: 'TWO WEEKS ONCE', tagClass: 'tag-biweekly' },
  { id: 'sunday', label: 'Sunday (Weekly)', badge: 'SUNDAY', tagClass: 'tag-sunday' },
  { id: 'tue_fri', label: 'Tuesday & Friday', badge: 'TUE & FRI', tagClass: 'tag-tuefri' },
  { id: 'custom', label: 'Custom Schedule', badge: 'CUSTOM', tagClass: 'tag-custom' },
];

export const getFrequencyMeta = (freqId) => {
  const found = FREQUENCY_OPTIONS.find(f => f.id === freqId);
  if (found) return found;
  return {
    id: freqId || 'custom',
    label: freqId || 'Custom',
    badge: (freqId || 'CUSTOM').toUpperCase(),
    tagClass: 'tag-custom',
  };
};

/**
 * Split raw string or array into clean non-empty points
 */
export const cleanPoints = (pointsInput) => {
  if (Array.isArray(pointsInput)) {
    return pointsInput.map(p => String(p).trim()).filter(Boolean);
  }
  if (typeof pointsInput === 'string') {
    const raw = pointsInput.trim();
    if (!raw) return [];
    // If separated by bullet or newlines
    if (raw.includes('\n')) {
      return raw.split('\n').map(s => s.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
    }
    if (raw.includes('•')) {
      return raw.split('•').map(s => s.trim()).filter(Boolean);
    }
    return [raw];
  }
  return [];
};

/**
 * Normalizes a care regime (skinCare, bodyCare, or hairCare) into structured routines with points
 */
export const normalizeCareRegime = (regime = {}, regimeType = 'skincare') => {
  if (!regime || typeof regime !== 'object') {
    return { routines: getDefaultRoutines(regimeType), notes: '' };
  }

  // If already structured with valid routines array
  if (Array.isArray(regime.routines) && regime.routines.length > 0) {
    const routines = regime.routines.map((r, idx) => ({
      id: r.id || `routine-${idx}-${Date.now()}`,
      frequency: r.frequency || 'daily',
      frequencyLabel: r.frequencyLabel || getFrequencyMeta(r.frequency).label,
      title: r.title || '',
      points: cleanPoints(r.points && r.points.length > 0 ? r.points : (r.text || '')),
    }));
    return {
      routines,
      notes: regime.notes || '',
    };
  }

  // Legacy fallback parsing based on regimeType
  const routines = [];

  if (regimeType === 'skincare') {
    if (regime.daily) {
      routines.push({
        id: 'skin-daily',
        frequency: 'daily',
        frequencyLabel: 'Daily',
        title: 'AM & PM',
        points: cleanPoints(regime.daily),
      });
    }
    if (regime.weeklySunday) {
      routines.push({
        id: 'skin-sunday',
        frequency: 'sunday',
        frequencyLabel: 'Sunday',
        title: 'Sunday Routine',
        points: cleanPoints(regime.weeklySunday.replace(/^Sunday:\s*/i, '')),
      });
    }
    if (regime.weeklyTueFri) {
      routines.push({
        id: 'skin-tuefri',
        frequency: 'tue_fri',
        frequencyLabel: 'Tuesday & Friday',
        title: 'Tuesday & Friday Routine',
        points: cleanPoints(regime.weeklyTueFri.replace(/^Tuesday & Friday:\s*/i, '')),
      });
    }
  } else if (regimeType === 'bodycare') {
    if (regime.sunday) {
      routines.push({
        id: 'body-sunday',
        frequency: 'sunday',
        frequencyLabel: 'Sunday',
        title: 'Sunday Routine',
        points: cleanPoints(regime.sunday.replace(/^Sunday:\s*/i, '')),
      });
    }
    if (regime.tueFri) {
      routines.push({
        id: 'body-tuefri',
        frequency: 'tue_fri',
        frequencyLabel: 'Tuesday & Friday',
        title: 'Tuesday & Friday Routine',
        points: cleanPoints(regime.tueFri.replace(/^Tuesday & Friday:\s*/i, '')),
      });
    }
  } else if (regimeType === 'haircare') {
    if (regime.daily) {
      routines.push({
        id: 'hair-daily',
        frequency: 'daily',
        frequencyLabel: 'Daily',
        title: 'Daily Routine',
        points: cleanPoints(regime.daily),
      });
    }
    if (regime.weekly) {
      routines.push({
        id: 'hair-weekly',
        frequency: 'weekly',
        frequencyLabel: 'Weekly',
        title: 'Weekly Routine',
        points: cleanPoints(regime.weekly),
      });
    }
    if (regime.biWeekly) {
      routines.push({
        id: 'hair-biweekly',
        frequency: 'two_weeks_once',
        frequencyLabel: 'Two Weeks Once',
        title: 'Bi-Weekly Cycle',
        points: cleanPoints(regime.biWeekly.replace(/^Two weeks once:\s*/i, '')),
      });
    }
  }

  // If nothing was parsed, provide default starter routines
  if (routines.length === 0) {
    return {
      routines: getDefaultRoutines(regimeType),
      notes: regime.notes || '',
    };
  }

  return {
    routines,
    notes: regime.notes || '',
  };
};

/**
 * Default starter routines when creating from scratch
 */
export const getDefaultRoutines = (regimeType) => {
  if (regimeType === 'skincare') {
    return [
      {
        id: 'skin-1',
        frequency: 'daily',
        frequencyLabel: 'Daily',
        title: 'AM & PM',
        points: ['Cleanse, hydrate, sunscreen AM, barrier repair PM'],
      },
      {
        id: 'skin-2',
        frequency: 'sunday',
        frequencyLabel: 'Sunday',
        title: 'Sunday Routine',
        points: ['Face shaving and scrub'],
      },
      {
        id: 'skin-3',
        frequency: 'tue_fri',
        frequencyLabel: 'Tuesday & Friday',
        title: 'Tuesday & Friday Routine',
        points: ['Face pack'],
      },
    ];
  }

  if (regimeType === 'bodycare') {
    return [
      {
        id: 'body-1',
        frequency: 'sunday',
        frequencyLabel: 'Sunday',
        title: 'Sunday Routine',
        points: ['Oiling, scrub, shaving'],
      },
      {
        id: 'body-2',
        frequency: 'tue_fri',
        frequencyLabel: 'Tuesday & Friday',
        title: 'Tuesday & Friday Routine',
        points: ['Exfoliating body wash'],
      },
    ];
  }

  return [
    {
      id: 'hair-1',
      frequency: 'daily',
      frequencyLabel: 'Daily',
      title: 'Daily Routine',
      points: ['Serum and hair growth water'],
    },
    {
      id: 'hair-2',
      frequency: 'weekly',
      frequencyLabel: 'Weekly',
      title: 'Weekly Routine',
      points: ['3x Oiling, hair pack, hair wash'],
    },
    {
      id: 'hair-3',
      frequency: 'two_weeks_once',
      frequencyLabel: 'Two Weeks Once',
      title: 'Bi-Weekly Cycle',
      points: ['Saturday henna and Sunday avari podi (In the next alternate: Hair growth serum)'],
    },
  ];
};

/**
 * Serializes routines array & notes back into a regime object,
 * while automatically keeping legacy fields populated for backward compatibility with Excel/Storage.
 */
export const serializeCareRegime = (routines = [], notes = '', regimeType = 'skincare') => {
  const cleanRoutines = routines.map(r => ({
    id: r.id || `r-${Date.now()}-${Math.random()}`,
    frequency: r.frequency || 'daily',
    frequencyLabel: getFrequencyMeta(r.frequency).label,
    title: (r.title || '').trim(),
    points: cleanPoints(r.points),
  }));

  const result = {
    routines: cleanRoutines,
    notes: (notes || '').trim(),
  };

  // Helper to join points into a readable summary string
  const formatPointsString = (pts) => pts.join('; ');

  if (regimeType === 'skincare') {
    const dailyRoutine = cleanRoutines.find(r => r.frequency === 'daily');
    const sundayRoutine = cleanRoutines.find(r => r.frequency === 'sunday' || r.title?.toLowerCase().includes('sunday'));
    const tueFriRoutine = cleanRoutines.find(r => r.frequency === 'tue_fri' || r.title?.toLowerCase().includes('tue'));

    result.daily = dailyRoutine ? formatPointsString(dailyRoutine.points) : '';
    result.weeklySunday = sundayRoutine ? (sundayRoutine.title.startsWith('Sunday') ? formatPointsString(sundayRoutine.points) : `Sunday: ${formatPointsString(sundayRoutine.points)}`) : '';
    result.weeklyTueFri = tueFriRoutine ? (tueFriRoutine.title.includes('Tuesday') ? formatPointsString(tueFriRoutine.points) : `Tuesday & Friday: ${formatPointsString(tueFriRoutine.points)}`) : '';
  } else if (regimeType === 'bodycare') {
    const sundayRoutine = cleanRoutines.find(r => r.frequency === 'sunday' || r.title?.toLowerCase().includes('sunday'));
    const tueFriRoutine = cleanRoutines.find(r => r.frequency === 'tue_fri' || r.title?.toLowerCase().includes('tue'));

    result.sunday = sundayRoutine ? (sundayRoutine.title.startsWith('Sunday') ? formatPointsString(sundayRoutine.points) : `Sunday: ${formatPointsString(sundayRoutine.points)}`) : '';
    result.tueFri = tueFriRoutine ? (tueFriRoutine.title.includes('Tuesday') ? formatPointsString(tueFriRoutine.points) : `Tuesday & Friday: ${formatPointsString(tueFriRoutine.points)}`) : '';
  } else if (regimeType === 'haircare') {
    const dailyRoutine = cleanRoutines.find(r => r.frequency === 'daily');
    const weeklyRoutine = cleanRoutines.find(r => r.frequency === 'weekly');
    const biWeeklyRoutine = cleanRoutines.find(r => r.frequency === 'two_weeks_once' || r.frequency === 'biweekly');

    result.daily = dailyRoutine ? formatPointsString(dailyRoutine.points) : '';
    result.weekly = weeklyRoutine ? formatPointsString(weeklyRoutine.points) : '';
    result.biWeekly = biWeeklyRoutine ? (biWeeklyRoutine.title.toLowerCase().includes('two weeks') ? formatPointsString(biWeeklyRoutine.points) : `Two weeks once: ${formatPointsString(biWeeklyRoutine.points)}`) : '';
  }

  return result;
};

/**
 * Returns scheduled protocols from healthProtocol for a specific day (e.g. 'Sunday') or given date string.
 * This is used by HabitsView and HabitModal to remind the user of Sunday protocols.
 */
export const getScheduledProtocolsForDay = (healthProtocol = {}, dateOrDayName = 'Sunday') => {
  let targetDay = 'Sunday';

  if (typeof dateOrDayName === 'string') {
    if (['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].includes(dateOrDayName.toLowerCase())) {
      targetDay = dateOrDayName.charAt(0).toUpperCase() + dateOrDayName.slice(1).toLowerCase();
    } else {
      // Date string format e.g. YYYY-MM-DD
      try {
        const d = new Date(dateOrDayName + 'T12:00:00');
        if (!isNaN(d.getTime())) {
          targetDay = d.toLocaleDateString('en-US', { weekday: 'long' });
        }
      } catch (e) {
        targetDay = 'Sunday';
      }
    }
  }

  const targetDayLower = targetDay.toLowerCase();
  const results = [];

  const checkRoutineMatch = (routine) => {
    if (!routine) return false;
    const freq = (routine.frequency || '').toLowerCase();
    const title = (routine.title || '').toLowerCase();
    const pointsText = Array.isArray(routine.points) ? routine.points.join(' ').toLowerCase() : '';

    if (targetDayLower === 'sunday') {
      if (freq === 'sunday') return true;
      if (title.includes('sunday')) return true;
      if (pointsText.includes('sunday')) return true;
    } else if (targetDayLower === 'tuesday' || targetDayLower === 'friday') {
      if (freq === 'tue_fri') return true;
      if (title.includes('tuesday') || title.includes('friday') || title.includes('tue')) return true;
    } else if (targetDayLower === 'saturday') {
      if (title.includes('saturday') || pointsText.includes('saturday')) return true;
    }

    // Direct day match in custom frequency or title
    if (freq === targetDayLower || title.includes(targetDayLower) || pointsText.includes(targetDayLower)) {
      return true;
    }

    return false;
  };

  // 1. Skin Care
  const skin = normalizeCareRegime(healthProtocol.skinCare, 'skincare');
  skin.routines.forEach((r) => {
    if (checkRoutineMatch(r)) {
      results.push({
        id: `proto-skin-${r.id}`,
        regimeKey: 'skinCare',
        regimeName: 'Skin Care',
        iconName: 'Sparkles',
        color: '#ec4899',
        category: 'Self Care',
        title: r.title ? `Skin Care: ${r.title}` : `Skin Care (${r.frequencyLabel})`,
        frequencyLabel: r.frequencyLabel,
        frequency: r.frequency,
        points: r.points,
        notes: skin.notes || '',
        suggestedHabitName: r.points.length > 0 ? r.points[0] : (r.title || 'Skin Care Routine'),
      });
    }
  });

  // 2. Body Care
  const body = normalizeCareRegime(healthProtocol.bodyCare, 'bodycare');
  body.routines.forEach((r) => {
    if (checkRoutineMatch(r)) {
      results.push({
        id: `proto-body-${r.id}`,
        regimeKey: 'bodyCare',
        regimeName: 'Body Care',
        iconName: 'Sun',
        color: '#f59e0b',
        category: 'Self Care',
        title: r.title ? `Body Care: ${r.title}` : `Body Care (${r.frequencyLabel})`,
        frequencyLabel: r.frequencyLabel,
        frequency: r.frequency,
        points: r.points,
        notes: body.notes || '',
        suggestedHabitName: r.points.length > 0 ? r.points[0] : (r.title || 'Body Care Routine'),
      });
    }
  });

  // 3. Hair Care
  const hair = normalizeCareRegime(healthProtocol.hairCare, 'haircare');
  hair.routines.forEach((r) => {
    if (checkRoutineMatch(r)) {
      results.push({
        id: `proto-hair-${r.id}`,
        regimeKey: 'hairCare',
        regimeName: 'Hair Care',
        iconName: 'Sparkle',
        color: '#8b5cf6',
        category: 'Self Care',
        title: r.title ? `Hair Care: ${r.title}` : `Hair Care (${r.frequencyLabel})`,
        frequencyLabel: r.frequencyLabel,
        frequency: r.frequency,
        points: r.points,
        notes: hair.notes || '',
        suggestedHabitName: r.points.length > 0 ? r.points[0] : (r.title || 'Hair Care Routine'),
      });
    }
  });

  return {
    dayName: targetDay,
    protocols: results,
    hasProtocols: results.length > 0,
  };
};
