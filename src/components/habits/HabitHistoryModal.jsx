import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  ShieldAlert, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Check,
  FileText
} from 'lucide-react';

export const HabitHistoryModal = ({ isOpen, onClose }) => {
  const { 
    todayStr, 
    dailyHabitNotes = {},
    getPast30DaysHistory,
    toggleHabit 
  } = useApp();

  const [viewDays, setViewDays] = useState(30);
  const historyList = getPast30DaysHistory ? getPast30DaysHistory(viewDays) : [];
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);
  const scrollerRef = useRef(null);

  // Auto-scroll to active date when modal opens or viewDays / selectedDateStr changes
  useEffect(() => {
    if (isOpen && scrollerRef.current) {
      const timer = setTimeout(() => {
        if (!scrollerRef.current) return;
        const activeChip = scrollerRef.current.querySelector('.history-day-chip.active') ||
                           scrollerRef.current.querySelector('.history-day-chip.is-today');
        if (activeChip) {
          activeChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen, viewDays]);

  if (!isOpen) return null;

  const selectedDayData = historyList.find(d => d.date === selectedDateStr) || historyList[0] || {};
  
  const selectedDayNote = dailyHabitNotes[selectedDateStr] || null;
  const moodMap = {
    energized: { icon: '⚡', label: 'Energized', color: '#10b981' },
    productive: { icon: '🔥', label: 'Productive', color: '#6366f1' },
    focused: { icon: '🎯', label: 'Focused', color: '#0ea5e9' },
    calm: { icon: '🧘', label: 'Calm & Steady', color: '#8b5cf6' },
    tired: { icon: '😴', label: 'Low Energy', color: '#f59e0b' },
    recovery: { icon: '🩹', label: 'Recovery / Rest', color: '#ec4899' },
  };
  const selectedDayMood = selectedDayNote?.mood ? moodMap[selectedDayNote.mood] : null;

  // Calculate stats
  const totalTasksPossible = historyList.reduce((sum, d) => sum + (d.total || 0), 0);
  const totalTasksDone = historyList.reduce((sum, d) => sum + (d.completed || 0), 0);
  const average30DayRate = totalTasksPossible > 0 
    ? Math.round((totalTasksDone / totalTasksPossible) * 100) 
    : 0;

  const perfectDaysCount = historyList.filter(d => d.total > 0 && d.completed === d.total).length;

  const scrollScroller = (direction) => {
    if (scrollerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="modal-overlay history-modal-overlay" onClick={onClose}>
      <div className="modal-panel history-modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header history-modal-header">
          <div className="history-modal-title-wrap">
            <div className="history-icon-box">
              <Calendar size={20} className="text-primary" />
            </div>
            <div className="history-title-texts">
              <h3 className="modal-title">Daily Progress History & Cloud Archive</h3>
              <p className="history-modal-sub">
                Look back at any past day to see your completed routines & task counts saved in Firebase Cloud DB.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            className="btn-icon btn-ghost history-close-btn" 
            onClick={onClose} 
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="history-modal-body modal-body">
          {/* Summary Stat Banner */}
          <div className="history-stats-banner">
            <div className="history-stat-box">
              <span className="stat-label">{viewDays}-Day Adherence</span>
              <span className="stat-val text-primary">{average30DayRate}%</span>
            </div>
            <div className="history-stat-box">
              <span className="stat-label">Total Completed</span>
              <span className="stat-val text-success">
                {totalTasksDone} <small className="text-muted stat-unit">tasks</small>
              </span>
            </div>
            <div className="history-stat-box">
              <span className="stat-label">100% Perfect Days</span>
              <span className="stat-val text-amber">
                {perfectDaysCount} <small className="text-muted stat-unit">days</small>
              </span>
            </div>
          </div>

          {/* Date Scroller Header & Range Filters */}
          <div className="history-filter-header">
            <span className="history-filter-title">
              Select Any Day in the Past {viewDays} Days:
            </span>
            <div className="history-filter-range-pills">
              {[30, 60, 90, 365].map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`range-pill-btn ${viewDays === d ? 'active' : ''}`}
                  onClick={() => setViewDays(d)}
                >
                  {d === 365 ? '1 Year' : `${d}D`}
                </button>
              ))}
            </div>
          </div>

          {/* Date Scroller with Navigation Arrows */}
          <div className="history-scroller-wrap">
            <button
              type="button"
              className="scroller-arrow-btn scroller-arrow-left"
              onClick={() => scrollScroller('left')}
              title="Scroll back in time"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="history-days-scroller" ref={scrollerRef}>
              {historyList.map((day) => {
                const isSelected = day.date === (selectedDayData.date || selectedDateStr);
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

            <button
              type="button"
              className="scroller-arrow-btn scroller-arrow-right"
              onClick={() => scrollScroller('right')}
              title="Scroll forward in time"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Selected Day Details Panel */}
          <div className="selected-day-detail card">
            <div className="detail-header">
              <div className="detail-header-info">
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

            {/* Daily Note for Selected History Date */}
            {selectedDayNote && selectedDayNote.note?.trim() && (
              <div className="history-daily-note-box">
                <div className="hdnb-header">
                  <div className="flex-center gap-2">
                    <FileText size={15} className="text-primary" />
                    <span className="hdnb-title">Daily Note for {selectedDayData.formattedDate || selectedDateStr}:</span>
                  </div>
                  {selectedDayMood && (
                    <span 
                      className="hdnb-mood-tag"
                      style={{ 
                        borderColor: selectedDayMood.color, 
                        backgroundColor: `${selectedDayMood.color}18`,
                        color: selectedDayMood.color 
                      }}
                    >
                      <span>{selectedDayMood.icon}</span>
                      <span>{selectedDayMood.label}</span>
                    </span>
                  )}
                </div>
                <p className="hdnb-text">{selectedDayNote.note}</p>
              </div>
            )}

            {/* Completed & Uncompleted Tasks Breakdown */}
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
                        <span className="task-row-name" title={task.name}>{task.name}</span>
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
                        <span className="task-row-name text-muted" title={task.name}>{task.name}</span>
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
        </div>

        {/* Modal Actions */}
        <div className="modal-actions history-modal-actions">
          <button type="button" className="btn btn-secondary history-close-action-btn" onClick={onClose}>
            <X size={16} />
            <span>Close History</span>
          </button>
        </div>
      </div>

      <style>{`
        .history-modal-panel {
          width: 100%;
          max-width: min(780px, 95vw) !important;
          max-height: 90vh;
          max-height: 90dvh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 0;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65), 0 0 35px rgba(99, 102, 241, 0.15);
        }

        .history-modal-header {
          padding: 1.1rem 1.4rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .history-modal-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          min-width: 0;
          flex: 1;
        }

        .history-icon-box {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-sm, 8px);
          background: var(--accent-primary-glow, rgba(99, 102, 241, 0.15));
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .history-title-texts {
          min-width: 0;
          flex: 1;
        }

        .history-title-texts .modal-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.3;
        }

        .history-modal-sub {
          font-size: 0.78rem;
          color: var(--text-secondary);
          margin-top: 0.18rem;
          line-height: 1.35;
        }

        .history-modal-body {
          flex: 1 1 auto;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
          padding: 1.25rem 1.4rem;
          min-height: 0;
          -webkit-overflow-scrolling: touch;
        }

        /* Prevent flexbox from collapsing sections inside scrollable modal body! */
        .history-stats-banner,
        .history-filter-header,
        .history-scroller-wrap,
        .selected-day-detail,
        .history-daily-note-box,
        .retention-notice-box {
          flex-shrink: 0;
        }

        .history-modal-actions {
          margin-top: 0;
          padding: 0.85rem 1.4rem;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .history-stats-banner {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .history-stat-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm, 8px);
          padding: 0.85rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          min-width: 0;
        }

        .stat-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .stat-val {
          font-size: 1.3rem;
          font-weight: 800;
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
        }

        .stat-unit {
          font-size: 0.75rem;
          font-weight: 500;
        }

        .history-filter-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .history-filter-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .history-filter-range-pills {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .range-pill-btn {
          border: 1px solid var(--border-color);
          background: transparent;
          color: var(--text-secondary);
          border-radius: 6px;
          padding: 0.22rem 0.55rem;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .range-pill-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }

        .range-pill-btn.active {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          color: #ffffff;
        }

        /* Scroller Wrapper with Navigation Buttons */
        .history-scroller-wrap {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          width: 100%;
        }

        .scroller-arrow-btn {
          width: 32px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm, 6px);
          color: var(--text-secondary);
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .scroller-arrow-btn:hover {
          background: var(--accent-primary-glow, rgba(99, 102, 241, 0.15));
          color: var(--accent-primary);
          border-color: var(--accent-primary);
        }

        .history-days-scroller {
          flex: 1;
          display: flex;
          align-items: stretch;
          gap: 0.55rem;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 0.35rem 0.2rem 0.65rem 0.2rem;
          min-height: 82px;
          flex-shrink: 0;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: var(--border-color) transparent;
          scroll-behavior: smooth;
        }

        .history-days-scroller::-webkit-scrollbar {
          height: 6px;
        }

        .history-days-scroller::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 4px;
        }

        .history-days-scroller::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 4px;
        }

        .history-days-scroller::-webkit-scrollbar-thumb:hover {
          background: var(--accent-primary);
        }

        .history-day-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          padding: 0.6rem 0.85rem;
          border-radius: var(--radius-sm, 8px);
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          min-width: 110px;
          min-height: 70px;
          flex-shrink: 0;
          font-family: inherit;
          box-sizing: border-box;
          user-select: none;
        }

        .history-day-chip:hover {
          background: var(--bg-card-hover, rgba(255, 255, 255, 0.04));
          color: var(--text-primary);
          transform: translateY(-1px);
        }

        .history-day-chip.active {
          background: var(--accent-primary-glow, rgba(99, 102, 241, 0.15));
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.25);
        }

        .history-day-chip.is-today {
          border-width: 2px;
          border-color: var(--accent-warning, #f59e0b);
        }

        .day-chip-label {
          font-size: 0.8rem;
          font-weight: 800;
          line-height: 1.2;
        }

        .day-chip-date {
          font-size: 0.68rem;
          color: var(--text-muted);
          line-height: 1.2;
        }

        .day-chip-score {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.12rem 0.45rem;
          border-radius: 4px;
          margin-top: 0.15rem;
          white-space: nowrap;
        }

        .score-100 {
          background: rgba(16, 185, 129, 0.15);
          color: var(--accent-success, #10b981);
        }

        .score-partial {
          background: rgba(245, 158, 11, 0.15);
          color: var(--accent-warning, #f59e0b);
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
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md, 12px);
        }

        .detail-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .detail-header-info {
          min-width: 0;
          flex: 1;
        }

        .detail-date-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--accent-primary);
          flex-wrap: wrap;
        }

        .detail-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-top: 0.25rem;
          line-height: 1.35;
        }

        .detail-percent-ring {
          width: 50px;
          height: 50px;
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
          border-radius: var(--radius-full, 9999px);
          overflow: hidden;
        }

        .selected-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-success));
          border-radius: var(--radius-full, 9999px);
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
          min-width: 0;
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
          scrollbar-width: thin;
          padding-right: 0.2rem;
        }

        .history-task-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.5rem 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-left: 3px solid var(--accent-primary);
          border-radius: 6px;
          font-size: 0.82rem;
          transition: background 0.15s ease;
        }

        .completed-row {
          background: rgba(16, 185, 129, 0.03);
        }

        .uncompleted-row {
          background: rgba(255, 255, 255, 0.01);
          opacity: 0.85;
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
          transition: all 0.15s ease;
        }

        .check-btn.checked {
          background: var(--accent-success, #10b981);
          border-color: var(--accent-success, #10b981);
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
          flex-shrink: 0;
        }

        .empty-tasks-note {
          font-size: 0.78rem;
          font-style: italic;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 6px;
          border: 1px dashed var(--border-color);
        }

        .retention-notice-box {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: var(--radius-sm, 8px);
          padding: 0.75rem 1rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.45;
        }

        .history-daily-note-box {
          background: rgba(99, 102, 241, 0.07);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-left: 3px solid var(--accent-primary);
          border-radius: var(--radius-sm, 8px);
          padding: 0.85rem 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .hdnb-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .hdnb-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .hdnb-mood-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 12px;
          border: 1px solid;
        }

        .hdnb-text {
          font-size: 0.84rem;
          line-height: 1.5;
          color: var(--text-primary);
          white-space: pre-wrap;
        }

        /* Responsive Media Queries */
        @media (max-width: 640px) {
          .history-modal-panel {
            width: 100% !important;
            max-width: 100vw !important;
            max-height: 92dvh !important;
            border-radius: 20px 20px 0 0 !important;
          }

          .history-modal-header {
            padding: 0.85rem 1rem;
          }

          .history-icon-box {
            width: 36px;
            height: 36px;
          }

          .history-title-texts .modal-title {
            font-size: 0.98rem;
          }

          .history-modal-sub {
            font-size: 0.7rem;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .history-modal-body {
            padding: 1rem 0.85rem;
            gap: 0.9rem;
          }

          .history-stats-banner {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.45rem;
          }

          .history-stat-box {
            padding: 0.65rem 0.45rem;
            text-align: center;
            align-items: center;
          }

          .stat-label {
            font-size: 0.64rem;
          }

          .stat-val {
            font-size: 1.1rem;
            justify-content: center;
          }

          .scroller-arrow-btn {
            display: none; /* Native touch swipe on mobile */
          }

          .history-day-chip {
            min-width: 98px;
            min-height: 66px;
            padding: 0.5rem 0.65rem;
          }

          .selected-day-detail {
            padding: 1rem;
          }

          .detail-title {
            font-size: 0.95rem;
          }

          .detail-percent-ring {
            width: 44px;
            height: 44px;
          }

          .percent-num {
            font-size: 0.85rem;
          }

          .history-modal-actions {
            padding: 0.75rem 1rem !important;
          }

          .history-close-action-btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 380px) {
          .stat-label {
            font-size: 0.58rem;
          }
          .stat-val {
            font-size: 0.95rem;
          }
          .history-day-chip {
            min-width: 88px;
          }
        }
      `}</style>
    </div>
  );
};
