import React from 'react';
import { useApp } from '../../context/AppContext';
import { HabitWeeklyGrid } from './HabitWeeklyGrid';
import { 
  Check, 
  Flame, 
  Trash2, 
  Edit3, 
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

export const HabitCard = ({ 
  habit, 
  onEdit, 
  isBulkMode = false, 
  isSelected = false, 
  onToggleSelect 
}) => {
  const { toggleHabit, deleteHabit, todayStr } = useApp();
  const isDoneToday = habit.completedDates?.includes(todayStr);

  const IconComponent = ICON_MAP[habit.icon] || Sparkles;

  const handleCardClick = () => {
    if (isBulkMode && onToggleSelect) {
      onToggleSelect(habit.id);
    }
  };

  return (
    <div 
      className={`habit-card card ${isDoneToday ? 'habit-completed' : ''} ${isBulkMode ? 'is-bulk-mode' : ''} ${isSelected ? 'is-selected' : ''}`}
      onClick={handleCardClick}
    >
      <div className="habit-header">
        <div className="habit-left">
          {/* Bulk select checkbox */}
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

          <div 
            className="habit-icon-wrap" 
            style={{ 
              backgroundColor: `${habit.color}20`,
              color: habit.color,
              borderColor: `${habit.color}40`
            }}
          >
            <IconComponent size={20} />
          </div>

          <div className="habit-title-area">
            <div className="habit-tag-row">
              <span className="habit-category" style={{ color: habit.color }}>
                {habit.category || 'Habit'}
              </span>
              {habit.timeOfDay && (
                <span className="habit-time-badge">
                  {habit.timeOfDay === 'Morning' ? '🌅 Morning' : habit.timeOfDay === 'Daytime' ? '☀️ Day' : '🌙 Night'}
                </span>
              )}
            </div>
            <h4 className="habit-name">{habit.name}</h4>
          </div>
        </div>

        {/* Big Interactive Check Button (Hidden in bulk mode) */}
        {!isBulkMode && (
          <button
            className={`habit-check-btn ${isDoneToday ? 'checked' : ''}`}
            style={{
              backgroundColor: isDoneToday ? habit.color : 'transparent',
              borderColor: habit.color,
            }}
            onClick={(e) => {
              e.stopPropagation();
              toggleHabit(habit.id, todayStr);
            }}
            aria-label={isDoneToday ? 'Mark incomplete' : 'Mark complete'}
          >
            {isDoneToday ? <Check size={18} className="check-icon" /> : null}
          </button>
        )}
      </div>

      {/* Streak and Info Row */}
      <div className="habit-stats-row">
        <div className="streak-indicator">
          <Flame size={14} className="flame-icon" />
          <span>{habit.streak || 0} day streak</span>
        </div>

        {!isBulkMode && (
          <div className="habit-actions">
            {onEdit && (
              <button 
                className="btn-icon btn-ghost btn-sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(habit);
                }}
                title="Edit habit"
              >
                <Edit3 size={15} />
              </button>
            )}
            <button 
              className="btn-icon btn-ghost btn-sm text-danger" 
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete habit "${habit.name}"?`)) {
                  deleteHabit(habit.id);
                }
              }}
              title="Delete habit"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {/* 7-Day Consistency Grid */}
      <HabitWeeklyGrid 
        completedDates={habit.completedDates}
        color={habit.color}
        onToggleDay={(dateStr) => toggleHabit(habit.id, dateStr)}
      />

      <style>{`
        .habit-card {
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .habit-card.is-bulk-mode {
          cursor: pointer;
        }

        .habit-card.is-selected {
          border-color: rgba(239, 68, 68, 0.45);
          background: rgba(239, 68, 68, 0.08);
          box-shadow: 0 0 16px rgba(239, 68, 68, 0.2);
        }

        .bulk-select-box {
          width: 26px;
          height: 26px;
          border-radius: 8px;
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

        .habit-card:hover {
          transform: translateY(-2px);
        }

        .habit-completed {
          border-color: rgba(16, 185, 129, 0.35);
        }

        .habit-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .habit-left {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex: 1;
          min-width: 0;
        }

        .habit-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid transparent;
          flex-shrink: 0;
        }

        .habit-title-area {
          display: flex;
          flex-direction: column;
          min-width: 0;
          gap: 0.15rem;
        }

        .habit-tag-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .habit-category {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .habit-time-badge {
          font-size: 0.65rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .habit-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .habit-check-btn {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-full);
          border: 2px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          flex-shrink: 0;
        }

        .habit-check-btn:hover {
          transform: scale(1.1);
        }

        .habit-check-btn:active {
          transform: scale(0.9);
        }

        .habit-check-btn.checked {
          color: #ffffff;
          box-shadow: 0 0 12px currentColor;
        }

        .check-icon {
          stroke-width: 3;
          animation: checkPop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes checkPop {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }

        .habit-stats-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.85rem;
          padding-top: 0.65rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .streak-indicator {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent-warning);
        }

        .habit-actions {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .btn-sm {
          width: 28px;
          height: 28px;
        }

        .text-danger:hover {
          color: var(--accent-danger) !important;
        }
      `}</style>
    </div>
  );
};
