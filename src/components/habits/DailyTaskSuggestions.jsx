import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getTodaySoupRotation } from '../../services/nightDietSoupData';
import { getJuiceSchedule, getScheduledProtocolsForDay } from '../../services/careProtocolUtils';
import { WORKOUT_DAYS } from '../../services/workoutPlanData';
import { 
  Sparkles, 
  Utensils, 
  Droplets, 
  Briefcase, 
  Code, 
  CheckCheck, 
  Plus, 
  Calendar, 
  Flame,
  Check,
  Dumbbell,
  X
} from 'lucide-react';

export const DailyTaskSuggestions = ({ isInline = true }) => {
  const {
    todayStr = new Date().toISOString().split('T')[0],
    healthProtocol = {},
    habits = [],
    dailyMeals = [],
    roadmap = [],
    logDietItem,
    addHabit,
    deleteHabit,
    removeDietItem,
  } = useApp();

  const habitsList = Array.isArray(habits) ? habits : [];

  // Helper to extract clean name for fuzzy matching
  const getCleanName = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/^(have|drink|workout|exercise)\s+/i, '')
      .replace(/\s*\(\d+\s*kcal\)/i, '')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // strip emojis
      .trim();
  };

  // 1. Soup Suggestion for Today
  const todaySoupData = useMemo(() => {
    return getTodaySoupRotation(todayStr);
  }, [todayStr]);

  const primarySoup = todaySoupData?.primarySoup;

  // Soup is considered added only if present in today's active habits list
  const matchingSoupHabit = useMemo(() => {
    if (!primarySoup) return null;
    const cleanSoupName = getCleanName(primarySoup.name);
    return habitsList.find(h => {
      if (!h || !h.name) return false;
      const hClean = getCleanName(h.name);
      return hClean.includes(cleanSoupName) || cleanSoupName.includes(hClean);
    }) || null;
  }, [primarySoup, habitsList]);

  const isSoupAdded = Boolean(matchingSoupHabit);

  // 2. Alternate-Day Juice Suggestion for Today
  const juiceSchedule = useMemo(() => {
    return getJuiceSchedule(todayStr, healthProtocol?.juiceProtocol);
  }, [todayStr, healthProtocol]);

  const activeJuice = juiceSchedule.isJuiceDayToday ? juiceSchedule.todayJuice : null;
  const tomorrowJuice = juiceSchedule.tomorrowJuice;

  const targetJuice = activeJuice || tomorrowJuice;

  const matchingJuiceHabit = useMemo(() => {
    if (!targetJuice) return null;
    const cleanJuiceName = getCleanName(targetJuice.name);
    return habitsList.find(h => {
      if (!h || !h.name) return false;
      const hClean = getCleanName(h.name);
      return hClean.includes(cleanJuiceName) || cleanJuiceName.includes(hClean);
    }) || null;
  }, [targetJuice, habitsList]);

  const isJuiceAdded = Boolean(matchingJuiceHabit);

  // 3. Exercise / Workout of the Day
  const todayWorkout = useMemo(() => {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    try {
      const d = new Date(todayStr + 'T12:00:00');
      const dayKey = dayNames[d.getDay()] || 'monday';
      return WORKOUT_DAYS[dayKey] || WORKOUT_DAYS.monday;
    } catch {
      return WORKOUT_DAYS.monday;
    }
  }, [todayStr]);

  const matchingWorkoutHabit = useMemo(() => {
    if (!todayWorkout) return null;
    const titleClean = getCleanName(todayWorkout.title);
    const nameClean = getCleanName(todayWorkout.name);
    return habitsList.find(h => {
      if (!h || !h.name) return false;
      const hClean = getCleanName(h.name);
      return (
        hClean.includes(titleClean) || 
        hClean.includes(`${nameClean} workout`) || 
        h.category === 'Workout'
      );
    }) || null;
  }, [todayWorkout, habitsList]);

  const isWorkoutAdded = Boolean(matchingWorkoutHabit);

  // Morning Cardio check
  const matchingCardioHabit = useMemo(() => {
    return habitsList.find(h => {
      if (!h || !h.name) return false;
      const hClean = getCleanName(h.name);
      return hClean.includes('morning cardio') || hClean.includes('brisk walk');
    }) || null;
  }, [habitsList]);

  const isCardioAdded = Boolean(matchingCardioHabit);

  // 4. Career Roadmap Suggestions (From Active Week)
  const activeRoadmapWeek = useMemo(() => {
    const list = Array.isArray(roadmap) && roadmap.length > 0 ? roadmap : [];
    return list.find(w => w && w.status === 'In Progress') || list[0] || null;
  }, [roadmap]);

  const careerSuggestions = useMemo(() => {
    if (!activeRoadmapWeek) return [];
    const items = [];
    if (activeRoadmapWeek.dsa && activeRoadmapWeek.dsa !== '—') {
      items.push({
        id: 'c-dsa',
        category: 'DSA',
        title: `DSA: ${activeRoadmapWeek.dsa}`,
        color: '#6366f1',
      });
    }
    if (activeRoadmapWeek.fullstack && activeRoadmapWeek.fullstack !== '—') {
      items.push({
        id: 'c-fs',
        category: 'Full Stack',
        title: `Fullstack: ${activeRoadmapWeek.fullstack}`,
        color: '#0ea5e9',
      });
    }
    if (activeRoadmapWeek.project && activeRoadmapWeek.project !== '—') {
      items.push({
        id: 'c-proj',
        category: 'Project',
        title: `Project: ${activeRoadmapWeek.project}`,
        color: '#10b981',
      });
    }
    if (activeRoadmapWeek.career && activeRoadmapWeek.career !== '—') {
      items.push({
        id: 'c-car',
        category: 'Career',
        title: `Career: ${activeRoadmapWeek.career}`,
        color: '#ec4899',
      });
    }
    return items;
  }, [activeRoadmapWeek]);

  // 5. Care Protocols for Today
  const daySchedule = useMemo(() => {
    return getScheduledProtocolsForDay(healthProtocol, todayStr || 'Sunday');
  }, [healthProtocol, todayStr]);

  // --- Click / Toggle Handlers ---

  const handleToggleSoup = () => {
    if (!primarySoup) return;
    if (isSoupAdded) {
      // Remove soup from both habits and meals
      if (removeDietItem) {
        removeDietItem(primarySoup.name);
      } else if (matchingSoupHabit) {
        deleteHabit(matchingSoupHabit.id);
      }
    } else {
      // Log soup to habits and calorie meals
      if (logDietItem) {
        logDietItem({ item: primarySoup, mealType: 'dinner' });
      } else {
        addHabit({
          name: `Have ${primarySoup.emoji || '🥣'} ${primarySoup.name} (${primarySoup.calories} kcal)`,
          category: 'Diet & Nutrition',
          timeOfDay: 'Evening',
          icon: 'Moon',
          color: '#6366f1',
          frequency: 'daily',
          targetDays: 7,
          completedDates: [todayStr],
        });
      }
    }
  };

  const handleToggleJuice = (juiceItem) => {
    if (!juiceItem) return;
    if (isJuiceAdded) {
      // Remove juice from both habits and meals
      if (removeDietItem) {
        removeDietItem(juiceItem.name);
      } else if (matchingJuiceHabit) {
        deleteHabit(matchingJuiceHabit.id);
      }
    } else {
      // Log juice to habits and calorie meals
      if (logDietItem) {
        logDietItem({ item: juiceItem, mealType: 'snack' });
      } else {
        addHabit({
          name: `Drink ${juiceItem.emoji || '🥤'} ${juiceItem.name} (${juiceItem.calories || 80} kcal)`,
          category: 'Diet & Nutrition',
          timeOfDay: 'Morning',
          icon: 'Droplets',
          color: juiceItem.color || '#f97316',
          frequency: 'two_days_once',
          targetDays: 3,
          completedDates: [todayStr],
        });
      }
    }
  };

  const handleToggleWorkout = () => {
    if (!todayWorkout) return;
    if (isWorkoutAdded && matchingWorkoutHabit) {
      deleteHabit(matchingWorkoutHabit.id);
    } else {
      addHabit({
        name: `${todayWorkout.icon || '💪'} ${todayWorkout.name} Workout: ${todayWorkout.title} (20 min)`,
        category: 'Workout',
        timeOfDay: 'Evening',
        icon: 'Dumbbell',
        color: todayWorkout.accentColor || '#3b82f6',
        frequency: 'daily',
        targetDays: 6,
      });
    }
  };

  const handleToggleCardio = () => {
    if (isCardioAdded && matchingCardioHabit) {
      deleteHabit(matchingCardioHabit.id);
    } else {
      addHabit({
        name: '🌅 Morning Cardio (30–40 Mins Brisk Walk / Cycling)',
        category: 'Workout',
        timeOfDay: 'Morning',
        icon: 'Flame',
        color: '#f59e0b',
        frequency: 'daily',
        targetDays: 7,
      });
    }
  };

  const handleToggleCareerTask = (item) => {
    if (!item) return;
    const cleanTitle = getCleanName(item.title);
    const existing = habitsList.find(h => h && h.name && getCleanName(h.name).includes(cleanTitle));
    if (existing) {
      deleteHabit(existing.id);
    } else {
      addHabit({
        name: item.title,
        category: 'Career',
        timeOfDay: 'Daytime',
        icon: 'Briefcase',
        color: item.color || '#6366f1',
        frequency: 'daily',
        targetDays: 5,
      });
    }
  };

  const isCareerTaskAdded = (item) => {
    if (!item) return false;
    const cleanTitle = getCleanName(item.title);
    return habitsList.some(h => h && h.name && getCleanName(h.name).includes(cleanTitle));
  };

  const handleToggleProtocol = (proto) => {
    if (!proto) return;
    const cleanName = getCleanName(proto.suggestedHabitName);
    const existing = habitsList.find(h => h && h.name && getCleanName(h.name).includes(cleanName));
    if (existing) {
      deleteHabit(existing.id);
    } else {
      addHabit({
        name: proto.suggestedHabitName,
        category: proto.category || 'Self Care',
        timeOfDay: proto.suggestedHabitName.toLowerCase().includes('pm') ? 'Evening' : 'Morning',
        icon: proto.iconName === 'Sun' ? 'Sunrise' : 'Sparkles',
        color: proto.color || '#ec4899',
        frequency: proto.frequency || 'weekly',
        targetDays: 1,
      });
    }
  };

  return (
    <div className={`daily-task-suggestions-container ${isInline ? 'is-inline-mode' : 'is-card-mode'}`}>
      <div className="suggestions-header-line">
        <div className="flex-center gap-1">
          <Sparkles size={14} className="text-amber-400" />
          <span className="sugg-main-label">Quick Suggestions for Today:</span>
        </div>
        {activeRoadmapWeek && (
          <span className="sugg-roadmap-pill">
            💼 {activeRoadmapWeek.period} ({activeRoadmapWeek.dateRange})
          </span>
        )}
      </div>

      <div className="suggestions-chips-wrap">
        {/* 🥣 Today's Night Diet Soup Suggestion */}
        {primarySoup && (
          <button
            type="button"
            className={`sugg-chip soup-chip ${isSoupAdded ? 'is-added' : ''}`}
            onClick={handleToggleSoup}
            title={isSoupAdded ? 'Currently in routine & calories. Click to remove.' : `Add "${primarySoup.name}" (${primarySoup.calories} kcal) to today's tasks & calories`}
          >
            <span className="sugg-chip-icon">{primarySoup.emoji || '🥣'}</span>
            <span className="sugg-chip-text">
              <strong>Soup:</strong> {primarySoup.name} <span className="sugg-kcal">({primarySoup.calories} kcal)</span>
            </span>
            {isSoupAdded ? (
              <span className="sugg-done-badge" title="Click to remove">
                <Check size={12} /> Logged <X size={10} className="remove-cross" />
              </span>
            ) : (
              <span className="sugg-add-action"><Plus size={12} /> Add</span>
            )}
          </button>
        )}

        {/* 🥤 Alternate-Day Juice Suggestion */}
        {activeJuice ? (
          <button
            type="button"
            className={`sugg-chip juice-chip ${isJuiceAdded ? 'is-added' : ''}`}
            onClick={() => handleToggleJuice(activeJuice)}
            title={isJuiceAdded ? 'Currently in routine & calories. Click to remove.' : `Add "${activeJuice.name}" (${activeJuice.calories} kcal) to today's tasks & calories`}
          >
            <span className="sugg-chip-icon">{activeJuice.emoji || '🥤'}</span>
            <span className="sugg-chip-text">
              <strong>Juice:</strong> {activeJuice.name} <span className="sugg-kcal">({activeJuice.calories} kcal)</span>
            </span>
            {isJuiceAdded ? (
              <span className="sugg-done-badge" title="Click to remove">
                <Check size={12} /> Logged <X size={10} className="remove-cross" />
              </span>
            ) : (
              <span className="sugg-add-action"><Plus size={12} /> Add</span>
            )}
          </button>
        ) : (
          tomorrowJuice && (
            <div className="sugg-rest-day-pill">
              <span className="rest-tag">🌿 Juice Rest Day</span>
              <button
                type="button"
                className={`sugg-chip juice-tomorrow-chip ${isJuiceAdded ? 'is-added' : ''}`}
                onClick={() => handleToggleJuice(tomorrowJuice)}
                title={isJuiceAdded ? 'Tomorrow\'s juice logged for today. Click to remove.' : `Drink "${tomorrowJuice.name}" today (+${tomorrowJuice.calories || 80} kcal)`}
              >
                <span>{tomorrowJuice.emoji || '🥤'} Tomorrow: {tomorrowJuice.name}</span>
                {isJuiceAdded ? (
                  <span className="sugg-done-badge"><Check size={11} /> Logged <X size={9} className="remove-cross" /></span>
                ) : (
                  <span className="sugg-add-action"><Plus size={11} /> Drink Today</span>
                )}
              </button>
            </div>
          )
        )}

        {/* 🏋️ Exercise of the Day (Low-Impact Daily Routine) */}
        {todayWorkout && (
          <button
            type="button"
            className={`sugg-chip workout-chip ${isWorkoutAdded ? 'is-added' : ''}`}
            onClick={handleToggleWorkout}
            title={isWorkoutAdded ? 'Workout is on today\'s checklist. Click to remove.' : `Add ${todayWorkout.name} Workout: ${todayWorkout.title} to today's checklist`}
          >
            <span className="sugg-chip-icon">{todayWorkout.icon || '💪'}</span>
            <span className="sugg-chip-text">
              <strong>Workout:</strong> {todayWorkout.name} ({todayWorkout.title})
            </span>
            {isWorkoutAdded ? (
              <span className="sugg-done-badge" title="Click to remove">
                <Check size={12} /> Added <X size={10} className="remove-cross" />
              </span>
            ) : (
              <span className="sugg-add-action"><Plus size={12} /> Add</span>
            )}
          </button>
        )}

        {/* 🚴 Daily Morning Cardio */}
        <button
          type="button"
          className={`sugg-chip cardio-chip ${isCardioAdded ? 'is-added' : ''}`}
          onClick={handleToggleCardio}
          title={isCardioAdded ? 'Morning Cardio is on today\'s checklist. Click to remove.' : 'Add 30-40 min Morning Cardio / Walk to today\'s checklist'}
        >
          <span className="sugg-chip-icon">🚴</span>
          <span className="sugg-chip-text">
            <strong>Cardio:</strong> 30–40m Walk / Cycle
          </span>
          {isCardioAdded ? (
            <span className="sugg-done-badge" title="Click to remove">
              <Check size={12} /> Added <X size={10} className="remove-cross" />
            </span>
          ) : (
            <span className="sugg-add-action"><Plus size={12} /> Add</span>
          )}
        </button>

        {/* 💼 Career Roadmap Milestones */}
        {careerSuggestions.map(item => {
          const added = isCareerTaskAdded(item);
          return (
            <button
              type="button"
              key={item.id}
              className={`sugg-chip career-chip ${added ? 'is-added' : ''}`}
              onClick={() => handleToggleCareerTask(item)}
              title={added ? 'Task is on today\'s checklist. Click to remove.' : `Add "${item.title}" to today's To-Do list`}
            >
              <span className="sugg-dot" style={{ backgroundColor: item.color }} />
              <span className="sugg-chip-text">
                <strong>{item.category}:</strong> {item.title.replace(/^[^:]+:\s*/, '')}
              </span>
              {added ? (
                <span className="sugg-done-badge" title="Click to remove">
                  <Check size={12} /> Added <X size={10} className="remove-cross" />
                </span>
              ) : (
                <span className="sugg-add-action"><Plus size={12} /> Add</span>
              )}
            </button>
          );
        })}

        {/* ✨ Scheduled Care Protocols */}
        {daySchedule.protocols.map(proto => {
          const cleanName = getCleanName(proto.suggestedHabitName);
          const added = habitsList.some(h => h && h.name && getCleanName(h.name).includes(cleanName));
          return (
            <button
              type="button"
              key={proto.id}
              className={`sugg-chip proto-chip ${added ? 'is-added' : ''}`}
              onClick={() => handleToggleProtocol(proto)}
              title={added ? 'Protocol is on today\'s checklist. Click to remove.' : `Add "${proto.suggestedHabitName}" to today's habits`}
            >
              <span className="sugg-dot" style={{ backgroundColor: proto.color }} />
              <span className="sugg-chip-text">{proto.suggestedHabitName}</span>
              {added ? (
                <span className="sugg-done-badge" title="Click to remove">
                  <Check size={12} /> Added <X size={10} className="remove-cross" />
                </span>
              ) : (
                <span className="sugg-add-action"><Plus size={12} /> Add</span>
              )}
            </button>
          );
        })}
      </div>

      <style>{`
        .daily-task-suggestions-container {
          width: 100%;
          margin-top: 0.65rem;
          padding-top: 0.65rem;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
        }

        .daily-task-suggestions-container.is-card-mode {
          background: rgba(255, 255, 255, 0.025);
          border: 1px dashed rgba(255, 255, 255, 0.12);
          border-radius: var(--radius-md, 12px);
          padding: 0.85rem 1rem;
          margin-top: 1rem;
        }

        .suggestions-header-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
        }

        .sugg-main-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--accent-warning, #f59e0b);
          letter-spacing: 0.02em;
        }

        .sugg-roadmap-pill {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-sub, #94a3b8);
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          padding: 0.15rem 0.5rem;
          border-radius: 999px;
        }

        .suggestions-chips-wrap {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-wrap: wrap;
        }

        .sugg-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.65rem;
          border-radius: 999px;
          font-size: 0.76rem;
          font-weight: 500;
          color: var(--text-primary, #f8fafc);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: all 0.18s ease;
          max-width: 100%;
          text-align: left;
        }

        .sugg-chip:hover {
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.25);
          background: rgba(255, 255, 255, 0.08);
        }

        .sugg-chip.soup-chip {
          background: rgba(99, 102, 241, 0.08);
          border-color: rgba(99, 102, 241, 0.22);
        }

        .sugg-chip.soup-chip:hover {
          background: rgba(99, 102, 241, 0.18);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .sugg-chip.juice-chip {
          background: rgba(249, 115, 22, 0.08);
          border-color: rgba(249, 115, 22, 0.22);
        }

        .sugg-chip.juice-chip:hover {
          background: rgba(249, 115, 22, 0.18);
          border-color: rgba(249, 115, 22, 0.4);
        }

        .sugg-chip.workout-chip {
          background: rgba(59, 130, 246, 0.08);
          border-color: rgba(59, 130, 246, 0.22);
        }

        .sugg-chip.workout-chip:hover {
          background: rgba(59, 130, 246, 0.18);
          border-color: rgba(59, 130, 246, 0.4);
        }

        .sugg-chip.cardio-chip {
          background: rgba(245, 158, 11, 0.08);
          border-color: rgba(245, 158, 11, 0.22);
        }

        .sugg-chip.cardio-chip:hover {
          background: rgba(245, 158, 11, 0.18);
          border-color: rgba(245, 158, 11, 0.4);
        }

        .sugg-chip.career-chip {
          background: rgba(14, 165, 233, 0.08);
          border-color: rgba(14, 165, 233, 0.22);
        }

        .sugg-chip.career-chip:hover {
          background: rgba(14, 165, 233, 0.18);
          border-color: rgba(14, 165, 233, 0.4);
        }

        .sugg-chip.proto-chip {
          background: rgba(236, 72, 153, 0.08);
          border-color: rgba(236, 72, 153, 0.22);
        }

        .sugg-chip.is-added {
          background: rgba(16, 185, 129, 0.12) !important;
          border-color: rgba(16, 185, 129, 0.35) !important;
        }

        .sugg-chip.is-added:hover {
          background: rgba(239, 68, 68, 0.12) !important;
          border-color: rgba(239, 68, 68, 0.35) !important;
        }

        .sugg-chip.is-added:hover .sugg-done-badge {
          background: rgba(239, 68, 68, 0.25) !important;
          color: #ef4444 !important;
        }

        .sugg-chip.is-added:hover .remove-cross {
          display: inline-block !important;
        }

        .sugg-chip-icon {
          font-size: 0.95rem;
          line-height: 1;
        }

        .sugg-chip-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 240px;
        }

        .sugg-kcal {
          font-size: 0.7rem;
          color: var(--accent-warning, #f59e0b);
          font-weight: 600;
        }

        .sugg-add-action {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--primary, #6366f1);
          background: rgba(99, 102, 241, 0.14);
          padding: 0.12rem 0.35rem;
          border-radius: 999px;
        }

        .sugg-done-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 0.68rem;
          font-weight: 700;
          color: #10b981;
          background: rgba(16, 185, 129, 0.15);
          padding: 0.12rem 0.4rem;
          border-radius: 999px;
          transition: all 0.15s ease;
        }

        .remove-cross {
          display: none;
        }

        .sugg-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .sugg-rest-day-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 999px;
          padding: 0.1rem 0.25rem 0.1rem 0.5rem;
        }

        .rest-tag {
          font-size: 0.72rem;
          color: var(--text-sub, #94a3b8);
          font-weight: 500;
        }

        .juice-tomorrow-chip {
          padding: 0.18rem 0.45rem;
          font-size: 0.72rem;
        }

        @media (max-width: 640px) {
          .sugg-chip-text {
            max-width: 160px;
          }
        }
      `}</style>
    </div>
  );
};
