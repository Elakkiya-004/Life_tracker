import React from 'react';

export const HabitWeeklyGrid = ({ completedDates = [], color = '#6366f1', onToggleDay }) => {
  // Get the last 7 days including today
  const days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const isToday = i === 0;
    const isCompleted = completedDates.includes(dateStr);
    
    days.push({
      dateStr,
      dayName,
      isToday,
      isCompleted,
    });
  }

  return (
    <div className="weekly-grid">
      {days.map((day) => (
        <button
          key={day.dateStr}
          className={`week-day-btn ${day.isCompleted ? 'completed' : ''} ${day.isToday ? 'today' : ''}`}
          style={{
            backgroundColor: day.isCompleted ? color : undefined,
            borderColor: day.isToday ? color : undefined,
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleDay) onToggleDay(day.dateStr);
          }}
          title={`${day.dateStr}: ${day.isCompleted ? 'Completed' : 'Not completed'}`}
        >
          <span className="day-name">{day.dayName}</span>
          <span className="day-dot" />
        </button>
      ))}

      <style>{`
        .weekly-grid {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-top: 0.75rem;
        }

        .week-day-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.4rem 0.2rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-secondary);
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .week-day-btn:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .week-day-btn.completed {
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .week-day-btn.today {
          border-width: 1.5px;
        }

        .day-name {
          font-size: 0.65rem;
          font-weight: 700;
        }

        .day-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};
