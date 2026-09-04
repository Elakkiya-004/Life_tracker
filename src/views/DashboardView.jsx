import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HabitTodoItem } from '../components/habits/HabitTodoItem';
import { HabitModal } from '../components/habits/HabitModal';
import { HabitHistoryModal } from '../components/habits/HabitHistoryModal';
import { TransactionModal } from '../components/finance/TransactionModal';
import { 
  Flame, 
  Plus, 
  Sparkles, 
  Compass, 
  CheckCircle2, 
  Wallet, 
  ArrowRight,
  Calendar
} from 'lucide-react';

const MOTIVATIONAL_QUOTES = [
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
  "Small daily improvements over time lead to stunning results.",
  "Your future is created by what you do today, not tomorrow.",
  "Discipline is choosing between what you want now and what you want most.",
  "Success is the sum of small efforts repeated day in and day out.",
];

export const DashboardView = () => {
  const { 
    habits = [], 
    roadmap = [],
    roadmapCompletionPercent = 0,
    todayCompletedHabits = 0, 
    todayHabitProgress = 0, 
    currentMonthIncome = 0,
    currentMonthExpense = 0,
    netSavings = 0,
    settings = {},
    setActiveTab,
    addHabit,
    todayStr
  } = useApp();

  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'todo'

  const dayIndex = new Date().getDate() % MOTIVATIONAL_QUOTES.length;
  const dailyQuote = MOTIVATIONAL_QUOTES[dayIndex];

  const currency = settings?.currency || '₹';
  const monthlySalary = settings?.monthlySalary || 18000;
  const budgetLeft = Math.max(0, monthlySalary - currentMonthExpense);

  const habitsList = Array.isArray(habits) ? habits : [];
  const roadmapList = Array.isArray(roadmap) ? roadmap : [];

  const bestStreak = habitsList.reduce((max, h) => Math.max(max, h?.streak || 0), 0);
  const currentWeek = roadmapList.find(w => w?.status === 'In Progress') || roadmapList[0] || null;

  return (
    <div className="dashboard-container">
      {/* Hero Welcome & Progress Banner */}
      <div className="hero-banner card">
        <div className="hero-left">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>DAILY PROGRESS</span>
          </div>
          <h2 className="hero-title">
            {todayHabitProgress === 100 
              ? "🎉 Incredible! All today's habits completed!" 
              : `You're ${todayHabitProgress}% done with your daily goals.`}
          </h2>
          <p className="hero-quote">"{dailyQuote}"</p>
        </div>

        {/* Circular Progress Ring */}
        <div className="hero-ring-container">
          <svg className="progress-ring" width="100" height="100">
            <circle
              className="progress-ring-bg"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="8"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className="progress-ring-circle"
              stroke="url(#accentGradient)"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40 - (todayHabitProgress / 100) * 2 * Math.PI * 40}
              strokeLinecap="round"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <defs>
              <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          <div className="ring-center-text">
            <span className="ring-percent">{todayHabitProgress}%</span>
            <span className="ring-sub">{todayCompletedHabits}/{habitsList.length}</span>
          </div>
        </div>
      </div>

      {/* Highlights: Career Roadmap */}
      {currentWeek && (
        <div className="highlights-grid">
          <div className="card highlight-card roadmap-highlight">
            <div className="highlight-left">
              <div className="highlight-icon-wrap bg-cyan-glow">
                <Compass size={22} className="text-cyan" />
              </div>
              <div className="highlight-texts">
                <div className="highlight-tag-row">
                  <span className="badge badge-primary">{currentWeek.period} Target</span>
                  <span className="text-xs text-sub">{roadmapCompletionPercent}% Roadmap</span>
                </div>
                <h4 className="highlight-main-title">
                  🧠 {currentWeek.dsa ? currentWeek.dsa.split(',')[0] : 'DSA Mastery'} • 💻 {currentWeek.fullstack ? currentWeek.fullstack.split(',')[0] : 'Full Stack'}
                </h4>
              </div>
            </div>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('roadmap')}
            >
              <span>Roadmap</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Quick Status Widgets Grid */}
      <div className="dashboard-grid">
        {/* Habit Completion Widget */}
        <div className="card dashboard-widget">
          <div className="widget-header">
            <div className="widget-title-area">
              <CheckCircle2 size={18} className="text-indigo" />
              <h4 className="widget-title">Habits Done Today</h4>
            </div>
            <button 
              className="btn-ghost btn-sm text-sub" 
              onClick={() => setActiveTab('habits')}
            >
              View All
            </button>
          </div>
          <div className="habit-widget-content">
            <div className="habit-big-val">
              <span className="text-indigo">{todayCompletedHabits}</span>
              <span className="text-sub text-base">/ {habitsList.length} Done</span>
            </div>
            <p className="text-sub text-xs">
              {habitsList.length - todayCompletedHabits === 0 
                ? 'All clear for today!' 
                : `${habitsList.length - todayCompletedHabits} habits remaining today`}
            </p>
          </div>
        </div>

        {/* Best Streak Widget */}
        <div className="card dashboard-widget">
          <div className="widget-header">
            <div className="widget-title-area">
              <Flame size={18} className="text-amber-400" />
              <h4 className="widget-title">Top Streak</h4>
            </div>
            <button 
              className="btn-ghost btn-sm text-sub" 
              onClick={() => setActiveTab('habits')}
            >
              Details
            </button>
          </div>
          <div className="streak-widget-content">
            <div className="streak-big-val">
              <Flame size={28} className="text-amber-400 flame-glow" />
              <span>{bestStreak} Days</span>
            </div>
            <p className="text-sub text-xs">Keep your daily momentum unbroken!</p>
          </div>
        </div>

        {/* Finance Snapshot Widget (Rupees) */}
        <div className="card dashboard-widget">
          <div className="widget-header">
            <div className="widget-title-area">
              <Wallet size={18} className="text-emerald-400" />
              <h4 className="widget-title">Monthly Cash Flow</h4>
            </div>
            <button 
              className="btn-ghost btn-sm text-sub" 
              onClick={() => setActiveTab('finance')}
            >
              Finance
            </button>
          </div>
          <div className="finance-widget-content">
            <div className="finance-mini-stat">
              <span className="text-sub text-xs">Net Saved</span>
              <span className={`font-bold ${netSavings >= 0 ? 'text-success' : 'text-danger'}`}>
                {netSavings >= 0 ? '+' : '-'}{currency}{Math.abs(netSavings).toFixed(0)}
              </span>
            </div>
            <div className="finance-mini-stat">
              <span className="text-sub text-xs">Budget Left</span>
              <span className="text-primary font-bold">{currency}{budgetLeft.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Habits & Routines Checklist Section */}
      <div className="section-block">
        <div className="section-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h3 className="title-md">Today's To-Do & Routines</h3>
              <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>🌙 10:30 PM Reset</span>
            </div>
            <p className="text-sub">Tick checkboxes to mark complete • {todayCompletedHabits}/{habitsList.length} done</p>
          </div>

          <div className="dashboard-habits-actions">
            <div className="dashboard-filter-pills">
              <button 
                type="button"
                className={`dash-pill ${filterMode === 'all' ? 'active' : ''}`}
                onClick={() => setFilterMode('all')}
              >
                All ({habitsList.length})
              </button>
              <button 
                type="button"
                className={`dash-pill ${filterMode === 'todo' ? 'active' : ''}`}
                onClick={() => setFilterMode('todo')}
              >
                To-Do ({habitsList.length - todayCompletedHabits})
              </button>
            </div>

            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsHistoryModalOpen(true)}
              title="View daily completed tasks from past 30 days"
            >
              <Calendar size={15} className="text-primary" />
              <span>30-Day History</span>
            </button>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setIsHabitModalOpen(true)}
            >
              <Plus size={16} />
              <span>New Routine</span>
            </button>
          </div>
        </div>

        {/* Inline Quick Add Input */}
        <form onSubmit={(e) => {
          e.preventDefault();
          const title = quickInput.trim();
          if (!title) return;
          addHabit({
            name: title,
            category: 'Daily',
            timeOfDay: 'Morning',
            icon: 'Sunrise',
            color: '#f59e0b',
            frequency: 'daily',
            targetDays: 7,
          });
          setQuickInput('');
        }} className="dashboard-quick-add">
          <input
            type="text"
            className="dash-quick-input"
            placeholder="✍️ Quick add a task to today's list... (Press Enter)"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            <Plus size={15} />
            <span>Add</span>
          </button>
        </form>

        {habitsList.length === 0 ? (
          <div className="card empty-habits">
            <CheckCircle2 size={36} className="text-muted" />
            <p>No habits or tasks added yet. Start by typing above!</p>
            <button className="btn btn-primary" onClick={() => setIsHabitModalOpen(true)}>
              + Create First Routine
            </button>
          </div>
        ) : (
          <div className="dashboard-todo-list">
            {(filterMode === 'todo' 
              ? habitsList.filter(h => !h.completedDates?.includes(todayStr))
              : habitsList
            ).map((habit) => (
              <HabitTodoItem key={habit.id} habit={habit} isCompact={true} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
      />

      <HabitHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
      />

      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .hero-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(16, 185, 129, 0.1));
          border-color: rgba(99, 102, 241, 0.3);
          gap: 1rem;
        }

        .hero-left {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--accent-primary);
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        .hero-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .hero-quote {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-style: italic;
        }

        .hero-ring-container {
          position: relative;
          width: 100px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .progress-ring {
          transform: rotate(-90deg);
        }

        .progress-ring-circle {
          transition: stroke-dashoffset 0.6s ease;
        }

        .ring-center-text {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .ring-percent {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .ring-sub {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .highlights-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 900px) {
          .highlights-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .highlight-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .roadmap-highlight {
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(99, 102, 241, 0.08));
          border-color: rgba(14, 165, 233, 0.3);
        }

        .marvel-highlight {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(245, 158, 11, 0.08));
          border-color: rgba(239, 68, 68, 0.3);
        }

        .highlight-left {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex: 1;
          min-width: 200px;
        }

        .highlight-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .bg-cyan-glow {
          background: rgba(14, 165, 233, 0.18);
        }

        .bg-red-glow {
          background: rgba(239, 68, 68, 0.18);
        }

        .text-cyan { color: var(--accent-cyan); }
        .text-red-400 { color: #ef4444; }

        .highlight-texts {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .highlight-tag-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .badge-marvel {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          font-weight: 800;
        }

        .highlight-main-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .marvel-card-actions {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 768px) {
          .dashboard-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .dashboard-widget {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.15rem;
        }

        .widget-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .widget-title-area {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .widget-title {
          font-size: 0.88rem;
          font-weight: 700;
        }

        .habit-widget-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .habit-big-val {
          display: flex;
          align-items: baseline;
          gap: 0.4rem;
          font-size: 1.5rem;
          font-weight: 800;
        }

        .streak-widget-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .streak-big-val {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .finance-widget-content {
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 0.5rem 0;
        }

        .finance-mini-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .section-block {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .dashboard-habits-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .dashboard-filter-pills {
          display: flex;
          align-items: center;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.2rem;
          gap: 0.2rem;
        }

        .dash-pill {
          padding: 0.3rem 0.6rem;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 4px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .dash-pill:hover {
          color: var(--text-primary);
        }

        .dash-pill.active {
          background: var(--accent-primary);
          color: #ffffff;
        }

        .dashboard-quick-add {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.45rem 0.75rem;
        }

        .dash-quick-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.88rem;
        }

        .dash-quick-input::placeholder {
          color: var(--text-muted);
        }

        .dashboard-todo-list {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .empty-habits {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.85rem;
          padding: 2.5rem;
          text-align: center;
        }

        .text-indigo { color: var(--accent-primary); }
        .text-amber-400 { color: #f59e0b; }
        .text-emerald-400 { color: #10b981; }
        .text-xs { font-size: 0.72rem; }
        .text-base { font-size: 0.9rem; font-weight: 600; }
        .font-bold { font-weight: 700; }
      `}</style>
    </div>
  );
};
