import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Flame, 
  Clock, 
  ShieldAlert, 
  X, 
  ChevronRight, 
  Sparkles,
  Check
} from 'lucide-react';

export const HabitHistoryModal = ({ isOpen, onClose }) => {
  const { 
    habits = [], 
    todayStr, 
    getPast30DaysHistory,
    toggleHabit 
  } = useApp();

  const historyList = getPast30DaysHistory();
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);

  if (!isOpen) return null;

  const selectedDayData = historyList.find(d => d.date === selectedDateStr) || historyList[0] || {};
  
  // Calculate 30-day stats
  const totalTasksPossible = historyList.reduce((sum, d) => sum + d.total, 0);
  const totalTasksDone = historyList.reduce((sum, d) => sum + d.completed, 0);
  const average30DayRate = totalTasksPossible > 0 
    ? Math.round((totalTasksDone / totalTasksPossible) * 100) 
    : 0;

  const perfectDaysCount = historyList.filter(d => d.total > 0 && d.completed === d.total).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel history-modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="history-modal-title-wrap">
            <div className="history-icon-box">
              <Calendar size={22} className="text-primary" />
            </div>
            <div>
              <h3 className="modal-title">30-Day Daily Progress History</h3>
              <p className="history-modal-sub">
                Look back at any past day to see your completed routines & task counts.
              </p>
            </div>
          </div>
          <button type="button" className="btn-icon btn-ghost" onClick={onClose}><X size={18} /></button>
        </div>

        {/* 30-Day Summary Stat Banner */}
        <div className="history-stats-banner">
          <div className="history-stat-box">
            <span className="stat-label">30-Day Adherence</span>
            <span className="stat-val text-primary">{average30DayRate}%</span>
          </div>
          <div className="history-stat-box">
            <span className="stat-label">Total Completed</span>
            <span className="stat-val text-success">{totalTasksDone} <small className="text-muted">tasks</small></span>
          </div>
          <div className="history-stat-box">
            <span className="stat-label">100% Perfect Days</span>
            <span className="stat-val text-amber">{perfectDaysCount} <small className="text-muted">days</small></span>
          </div>
        </div>

        {/* 30-Day Date Scroller Strip */}
        <div className="history-section-title">
          <span>Select Any Day in the Past 30 Days:</span>
          <span className="badge badge-primary">30 Days Log</span>
        </div>

        <div className="history-days-scroller">
          {historyList.map((day) => {
            const isSelected = day.date === selectedDateStr;
            const isToday = day.date === todayStr;

            return (
              <button
                key={day.date}
                type="button"
                className={`history-day-chip ${isSelected ? 'active' : ''} ${isToday ? 'is-today' : ''}`}
                onClick={() => setSelectedDateStr(day.date)}
              >
                <span className="day-chip-label">{day.dayLabel}</span>
                <span className="day-chip-date">{day.formattedDate}</span>
                <div 
                  className={`day-chip-score ${day.percent === 100 ? 'score-100' : day.percent > 0 ? 'score-partial' : 'score-zero'}`}
                >
                  {day.completed}/{day.total} ({day.percent}%)
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Day Details Panel */}
        <div className="selected-day-detail card">
          <div className="detail-header">
            <div>
              <div className="detail-date-badge">
                <span>{selectedDayData.dayLabel}</span>
                <span className="text-muted">• {selectedDayData.formattedDate} ({selectedDayData.date})</span>
              </div>
              <h4 className="detail-title">
                {selectedDayData.percent === 100 
                  ? `🎉 Perfect 100% Completion on this day!` 
                  : `Completed ${selectedDayData.completed} of ${selectedDayData.total} tasks (${selectedDayData.percent}%)`}
              </h4>
            </div>

            <div className="detail-percent-ring">
              <span className={`percent-num ${selectedDayData.percent === 100 ? 'text-success' : 'text-primary'}`}>
                {selectedDayData.percent}%
              </span>
            </div>
          </div>

          {/* Progress bar for selected day */}
          <div className="selected-progress-track">
            <div 
              className="selected-progress-fill" 
              style={{ width: `${selectedDayData.percent}%` }}
            />
          </div>

          {/* Completed Tasks List */}
          <div className="tasks-breakdown-container">
            <div className="tasks-column">
              <span className="column-title text-success">
                <CheckCircle2 size={16} />
                <span>Completed Tasks ({selectedDayData.completedTasks?.length || 0})</span>
              </span>

              {selectedDayData.completedTasks?.length > 0 ? (
                <div className="task-items-list">
                  {selectedDayData.completedTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="history-task-row completed-row"
                      style={{ borderLeftColor: task.color || '#10b981' }}
                    >
                      <button
                        type="button"
                        className="check-btn checked"
                        onClick={() => toggleHabit(task.id, selectedDayData.date)}
                        title="Click to untick for this day"
                      >
                        <Check size={13} />
                      </button>
                      <span className="task-row-name">{task.name}</span>
                      <span className="task-row-time">{task.timeOfDay}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-tasks-note text-muted">
                  No tasks recorded as completed on this date.
                </div>
              )}
            </div>

            {/* Uncompleted Tasks List */}
            <div className="tasks-column">
              <span className="column-title text-muted">
                <Circle size={16} />
                <span>Uncompleted / Missed ({selectedDayData.uncompletedTasks?.length || 0})</span>
              </span>

              {selectedDayData.uncompletedTasks?.length > 0 ? (
                <div className="task-items-list">
                  {selectedDayData.uncompletedTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="history-task-row uncompleted-row"
                      style={{ borderLeftColor: task.color || '#6366f1' }}
                    >
                      <button
                        type="button"
                        className="check-btn unchecked"
                        onClick={() => toggleHabit(task.id, selectedDayData.date)}
                        title="Click to mark as done for this day"
                      >
                        <Circle size={13} />
                      </button>
                      <span className="task-row-name text-muted">{task.name}</span>
                      <span className="task-row-time">{task.timeOfDay}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-tasks-note text-success">
                  All active tasks were completed!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 30-Day Automatic Cleanup Notice */}
        <div className="retention-notice-box">
          <ShieldAlert size={16} className="text-amber flex-shrink-0" />
          <span>
            <strong>30-Day Auto Retention Policy:</strong> Logs and completed task history older than 30 days are automatically pruned to keep your app ultra-fast and storage lightweight.
          </span>
        </div>

        {/* Modal Actions */}
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close History
          </button>
        </div>
      </div>

      <style>{`
        .history-modal-panel {
          max-width: 780px !important;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
          overflow-y: auto;
        }

        .history-modal-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .history-icon-box {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-sm);
          background: var(--accent-primary-glow);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .history-modal-sub {
          font-size: 0.78rem;
          color: var(--text-secondary);
          margin-top: 0.15rem;
        }

        .history-stats-banner {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .history-stat-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.85rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .stat-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .stat-val {
          font-size: 1.3rem;
          font-weight: 800;
        }

        .history-section-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .history-days-scroller {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .history-day-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
          padding: 0.6rem 0.8rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 105px;
          flex-shrink: 0;
          font-family: inherit;
        }

        .history-day-chip:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary);
        }

        .history-day-chip.active {
          background: var(--accent-primary-glow);
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }

        .history-day-chip.is-today {
          border-width: 2px;
          border-color: var(--accent-warning);
        }

        .day-chip-label {
          font-size: 0.8rem;
          font-weight: 800;
        }

        .day-chip-date {
          font-size: 0.68rem;
          color: var(--text-muted);
        }

        .day-chip-score {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          margin-top: 0.2rem;
        }

        .score-100 {
          background: rgba(16, 185, 129, 0.15);
          color: var(--accent-success);
        }

        .score-partial {
          background: rgba(245, 158, 11, 0.15);
          color: var(--accent-warning);
        }

        .score-zero {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-muted);
        }

        .selected-day-detail {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.02);
        }

        .detail-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .detail-date-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--accent-primary);
        }

        .detail-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-top: 0.2rem;
        }

        .detail-percent-ring {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 3px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .percent-num {
          font-size: 0.95rem;
          font-weight: 800;
        }

        .selected-progress-track {
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .selected-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-success));
          border-radius: var(--radius-full);
          transition: width 0.3s ease;
        }

        .tasks-breakdown-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .tasks-breakdown-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .tasks-column {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .column-title {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .task-items-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          max-height: 220px;
          overflow-y: auto;
        }

        .history-task-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.5rem 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-left: 3px solid var(--accent-primary);
          border-radius: 4px;
          font-size: 0.82rem;
        }

        .completed-row {
          background: rgba(16, 185, 129, 0.03);
        }

        .uncompleted-row {
          background: rgba(255, 255, 255, 0.01);
          opacity: 0.8;
        }

        .check-btn {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .check-btn.checked {
          background: var(--accent-success);
          border-color: var(--accent-success);
          color: #ffffff;
        }

        .check-btn.unchecked {
          color: var(--text-muted);
        }

        .task-row-name {
          flex: 1;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .task-row-time {
          font-size: 0.68rem;
          color: var(--text-muted);
        }

        .empty-tasks-note {
          font-size: 0.78rem;
          font-style: italic;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }

        .retention-notice-box {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: var(--radius-sm);
          padding: 0.75rem 1rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};
