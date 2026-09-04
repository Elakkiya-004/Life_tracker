import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HabitWeeklyGrid } from './HabitWeeklyGrid';
import { 
  Check, 
  Flame, 
  Trash2, 
  Edit3, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Droplets, 
  Dumbbell, 
  BookOpen, 
  Moon, 
  Sparkles,
  Zap,
  Target,
  Heart,
  Sunrise,
  Clock,
  Footprints,
  Utensils
} from 'lucide-react';

const ICON_MAP = {
  Droplets,
  Dumbbell,
  BookOpen,
  Moon,
  Sparkles,
  Zap,
  Target,
  Heart,
  Sunrise,
  Clock,
  Footprints,
  Utensils,
};

export const HabitTodoItem = ({ 
  habit, 
  onEdit, 
  isCompact = false, 
  isBulkMode = false, 
  isSelected = false, 
  onToggleSelect 
}) => {
  const { toggleHabit, deleteHabit, todayStr } = useApp();
  const [showHistory, setShowHistory] = useState(false);
  const isDoneToday = habit.completedDates?.includes(todayStr);

  const IconComponent = ICON_MAP[habit.icon] || Sparkles;
  const habitColor = habit.color || '#6366f1';

  const handleRowClick = () => {
    if (isBulkMode && onToggleSelect) {
      onToggleSelect(habit.id);
    } else {
      toggleHabit(habit.id, todayStr);
    }
  };

  return (
    <div 
      className={`todo-item-card ${isDoneToday ? 'is-completed' : ''} ${isCompact ? 'is-compact' : ''} ${isBulkMode ? 'is-bulk-mode' : ''} ${isSelected ? 'is-selected' : ''}`}
      style={{
        borderLeftColor: isSelected ? 'var(--accent-danger)' : habitColor,
      }}
    >
      <div className="todo-item-main">
        {/* Bulk Selection Checkbox (When Bulk Mode is Active) */}
        {isBulkMode && (
          <button
            type="button"
            className={`bulk-select-box ${isSelected ? 'selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleSelect) onToggleSelect(habit.id);
            }}
            aria-label={isSelected ? `Deselect ${habit.name}` : `Select ${habit.name}`}
          >
            {isSelected && <Check size={14} className="bulk-check-icon" />}
          </button>
        )}

        {/* Regular Completion Checkbox */}
        {!isBulkMode && (
          <button
            type="button"
            className={`todo-checkbox ${isDoneToday ? 'checked' : ''}`}
            style={{
              borderColor: isDoneToday ? habitColor : 'var(--border-color)',
              backgroundColor: isDoneToday ? habitColor : 'transparent',
              boxShadow: isDoneToday ? `0 0 12px ${habitColor}60` : 'none',
            }}
            onClick={() => toggleHabit(habit.id, todayStr)}
            aria-label={isDoneToday ? `Mark ${habit.name} incomplete` : `Mark ${habit.name} complete`}
          >
            {isDoneToday && <Check size={16} className="todo-check-icon" />}
          </button>
        )}

        {/* Icon & Details */}
        <div className="todo-content" onClick={handleRowClick}>
          <div className="todo-title-row">
            <span 
              className="todo-mini-icon" 
              style={{ color: habitColor, backgroundColor: `${habitColor}18` }}
            >
              <IconComponent size={14} />
            </span>
            <span className="todo-name">{habit.name}</span>
          </div>

          {/* Badges / Meta Info */}
          <div className="todo-meta-row">
            {habit.timeOfDay && (
              <span className="todo-badge time-badge">
                {habit.timeOfDay === 'Morning' ? '🌅 Morning' : habit.timeOfDay === 'Daytime' ? '☀️ Daytime' : '🌙 Evening'}
              </span>
            )}
            {habit.category && (
              <span className="todo-badge cat-badge" style={{ color: habitColor }}>
                {habit.category}
              </span>
            )}
            {(habit.streak || 0) > 0 && (
              <span className="todo-badge streak-badge">
                <Flame size={12} className="streak-flame" />
                <span>{habit.streak}d streak</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {!isBulkMode && (
          <div className="todo-actions">
            {!isCompact && (
              <button
                type="button"
                className={`todo-action-btn ${showHistory ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHistory(!showHistory);
                }}
                title="7-Day History"
              >
                <Calendar size={14} />
                {showHistory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                className="todo-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(habit);
                }}
                title="Edit Task"
              >
                <Edit3 size={14} />
              </button>
            )}

            <button
              type="button"
              className="todo-action-btn delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete "${habit.name}" from your todo list?`)) {
                  deleteHabit(habit.id);
                }
              }}
              title="Delete Task"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Expandable 7-Day History */}
      {showHistory && !isCompact && (
        <div className="todo-history-drawer">
          <div className="history-header">
            <span className="history-title">Last 7 Days Consistency</span>
            <span className="history-count">
              {habit.completedDates?.length || 0} total completions
            </span>
          </div>
          <HabitWeeklyGrid
            completedDates={habit.completedDates}
            color={habitColor}
            onToggleDay={(dateStr) => toggleHabit(habit.id, dateStr)}
          />
        </div>
      )}

      <style>{`
        .todo-item-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-left: 4px solid var(--accent-primary);
          border-radius: var(--radius-sm);
          transition: all 0.2s ease;
          overflow: hidden;
        }

        .todo-item-card:hover {
          border-color: rgba(255, 255, 255, 0.18);
          background: var(--bg-card-hover);
          transform: translateY(-1px);
        }

        .todo-item-card.is-bulk-mode {
          cursor: pointer;
        }

        .todo-item-card.is-selected {
          border-color: rgba(239, 68, 68, 0.4);
          background: rgba(239, 68, 68, 0.08);
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.15);
        }

        .bulk-select-box {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          border: 2px solid rgba(255, 255, 255, 0.25);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .bulk-select-box:hover {
          border-color: var(--accent-danger);
          background: rgba(239, 68, 68, 0.15);
        }

        .bulk-select-box.selected {
          border-color: var(--accent-danger);
          background: var(--accent-danger);
          color: #ffffff;
        }

        .bulk-check-icon {
          stroke-width: 3;
          animation: checkPop 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .todo-item-card.is-completed {
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(16, 185, 129, 0.25);
        }

        .todo-item-card.is-completed .todo-name {
          text-decoration: line-through;
          color: var(--text-muted);
        }

        .todo-item-card.is-completed .todo-mini-icon {
          opacity: 0.6;
        }

        .todo-item-main {
          display: flex;
          align-items: center;
          padding: 0.85rem 1rem;
          gap: 0.85rem;
        }

        .is-compact .todo-item-main {
          padding: 0.65rem 0.85rem;
          gap: 0.65rem;
        }

        .todo-checkbox {
          width: 26px;
          height: 26px;
          border-radius: 8px;
          border: 2px solid var(--border-color);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .todo-checkbox:hover {
          transform: scale(1.1);
          border-color: var(--text-primary);
        }

        .todo-checkbox.checked {
          color: #ffffff;
        }

        .todo-check-icon {
          stroke-width: 3.5;
          animation: checkPop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes checkPop {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }

        .todo-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 0;
          cursor: pointer;
        }

        .todo-title-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-width: 0;
        }

        .todo-mini-icon {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .todo-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.2s ease;
        }

        .is-compact .todo-name {
          font-size: 0.88rem;
        }

        .todo-meta-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .todo-badge {
          font-size: 0.68rem;
          font-weight: 600;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }

        .time-badge {
          color: var(--text-secondary);
        }

        .streak-badge {
          background: rgba(245, 158, 11, 0.12);
          color: var(--accent-warning);
          font-weight: 700;
        }

        .streak-flame {
          color: var(--accent-warning);
        }

        .todo-actions {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          flex-shrink: 0;
        }

        .todo-action-btn {
          height: 28px;
          padding: 0 0.4rem;
          border-radius: 6px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .todo-action-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
        }

        .todo-action-btn.active {
          background: var(--accent-primary-glow);
          color: var(--accent-primary);
          border-color: rgba(99, 102, 241, 0.3);
        }

        .delete-btn:hover {
          color: var(--accent-danger) !important;
          background: rgba(239, 68, 68, 0.12) !important;
        }

        .todo-history-drawer {
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding: 0.65rem 1rem 0.85rem 1rem;
          background: rgba(0, 0, 0, 0.15);
        }

        .history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.72rem;
          color: var(--text-muted);
          margin-bottom: 0.4rem;
        }

        .history-title {
          font-weight: 600;
        }

        .history-count {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};
