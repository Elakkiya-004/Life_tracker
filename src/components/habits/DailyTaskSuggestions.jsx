import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getScheduledProtocolsForDay } from '../../services/careProtocolUtils';
import { 
  Sparkles, 
  Check, 
  Plus, 
  X
} from 'lucide-react';

export const DailyTaskSuggestions = ({ isInline = true }) => {
  const {
    todayStr = new Date().toISOString().split('T')[0],
    healthProtocol = {},
    habits = [],
    addHabit,
    deleteHabit,
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

  // Scheduled Health & Care Routine Protocols for Today
  const daySchedule = useMemo(() => {
    return getScheduledProtocolsForDay(healthProtocol, todayStr || 'Sunday');
  }, [healthProtocol, todayStr]);

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
        completedDates: [],
      });
    }
  };

  const protocols = Array.isArray(daySchedule.protocols) ? daySchedule.protocols : [];

  return (
    <div className={`daily-task-suggestions-container ${isInline ? 'is-inline-mode' : 'is-card-mode'}`}>
      <div className="suggestions-header-line">
        <div className="flex-center gap-1">
          <Sparkles size={14} className="text-amber-400" />
          <span className="sugg-main-label">Quick Suggestions for Today:</span>
        </div>
      </div>

      <div className="suggestions-chips-wrap">
        {protocols.length > 0 ? (
          protocols.map(proto => {
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
          })
        ) : (
          <span className="sugg-empty-msg">🌿 No special health care protocols scheduled for today. You are all set!</span>
        )}
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

        .sugg-chip.proto-chip {
          background: rgba(236, 72, 153, 0.08);
          border-color: rgba(236, 72, 153, 0.22);
        }

        .sugg-chip.proto-chip:hover {
          background: rgba(236, 72, 153, 0.18);
          border-color: rgba(236, 72, 153, 0.4);
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

        .sugg-chip-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 240px;
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

        .sugg-empty-msg {
          font-size: 0.74rem;
          color: var(--text-sub, #94a3b8);
          font-style: italic;
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
