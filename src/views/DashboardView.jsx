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
  Circle,
  Wallet, 
  ArrowRight,
  Calendar,
  Code2,
  Layers,
  Smartphone,
  FolderGit2,
  Briefcase,
  Award,
  Table
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
    toggleRoadmapTask,
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

      {/* 🎯 16-Week Career Curriculum Current Milestone Widget */}
      {currentWeek && (
        <div className="card roadmap-dashboard-card">
          <div className="roadmap-dash-header">
            <div className="roadmap-dash-title-group">
              <div className="dash-badge-icon">
                <Compass size={22} className="text-cyan" />
              </div>
              <div>
                <div className="roadmap-badge-row">
                  <span className="badge badge-primary">{currentWeek.period} Target</span>
                  <span className="text-xs text-sub">{currentWeek.dateRange || currentWeek.month}</span>
                  <span className="badge badge-roadmap">{currentWeek.completedTasks?.length || 0}/5 Done</span>
                </div>
                <h3 className="roadmap-dash-heading">
                  16-Week Master Curriculum • {currentWeek.period} Focus
                </h3>
              </div>
            </div>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('roadmap')}
            >
              <Table size={14} />
              <span>Full 16-Week Table</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* 5 Tracks Grid */}
          <div className="roadmap-dash-grid">
            {/* 1. DSA */}
            {currentWeek.dsa && (
              <div 
                className={`dash-task-item ${currentWeek.completedTasks?.includes('dsa') ? 'done' : ''}`}
                onClick={() => toggleRoadmapTask(currentWeek.id, 'dsa')}
                title="Click to toggle DSA complete"
              >
                <div className="dash-task-check">
                  {currentWeek.completedTasks?.includes('dsa') ? (
                    <CheckCircle2 size={16} className="text-emerald" />
                  ) : (
                    <Circle size={16} className="text-muted" />
                  )}
                </div>
                <div className="dash-task-content">
                  <span className="dash-track-label dsa">🧠 DSA Focus</span>
                  <span className="dash-task-text">{currentWeek.dsa}</span>
                </div>
              </div>
            )}

            {/* 2. Full Stack */}
            {currentWeek.fullstack && (
              <div 
                className={`dash-task-item ${currentWeek.completedTasks?.includes('fullstack') ? 'done' : ''}`}
                onClick={() => toggleRoadmapTask(currentWeek.id, 'fullstack')}
                title="Click to toggle Full Stack complete"
              >
                <div className="dash-task-check">
                  {currentWeek.completedTasks?.includes('fullstack') ? (
                    <CheckCircle2 size={16} className="text-emerald" />
                  ) : (
                    <Circle size={16} className="text-muted" />
                  )}
                </div>
                <div className="dash-task-content">
                  <span className="dash-track-label fullstack">💻 Full Stack</span>
                  <span className="dash-task-text">{currentWeek.fullstack}</span>
                </div>
              </div>
            )}

            {/* 3. React Native */}
            {currentWeek.mobile && (
              <div 
                className={`dash-task-item ${currentWeek.completedTasks?.includes('mobile') ? 'done' : ''}`}
                onClick={() => toggleRoadmapTask(currentWeek.id, 'mobile')}
                title="Click to toggle React Native complete"
              >
                <div className="dash-task-check">
                  {currentWeek.completedTasks?.includes('mobile') ? (
                    <CheckCircle2 size={16} className="text-emerald" />
                  ) : (
                    <Circle size={16} className="text-muted" />
                  )}
                </div>
                <div className="dash-task-content">
                  <span className="dash-track-label mobile">📱 React Native</span>
                  <span className="dash-task-text">{currentWeek.mobile}</span>
                </div>
              </div>
            )}

            {/* 4. Project */}
            {currentWeek.project && (
              <div 
                className={`dash-task-item ${currentWeek.completedTasks?.includes('project') ? 'done' : ''}`}
                onClick={() => toggleRoadmapTask(currentWeek.id, 'project')}
                title="Click to toggle Project complete"
              >
                <div className="dash-task-check">
                  {currentWeek.completedTasks?.includes('project') ? (
                    <CheckCircle2 size={16} className="text-emerald" />
                  ) : (
                    <Circle size={16} className="text-muted" />
                  )}
                </div>
                <div className="dash-task-content">
                  <span className="dash-track-label project">🚀 Project / Build</span>
                  <span className="dash-task-text">{currentWeek.project}</span>
                </div>
              </div>
            )}

            {/* 5. Career */}
            {currentWeek.career && (
              <div 
                className={`dash-task-item ${currentWeek.completedTasks?.includes('career') ? 'done' : ''}`}
                onClick={() => toggleRoadmapTask(currentWeek.id, 'career')}
                title="Click to toggle Career Prep complete"
              >
                <div className="dash-task-check">
                  {currentWeek.completedTasks?.includes('career') ? (
                    <CheckCircle2 size={16} className="text-emerald" />
                  ) : (
                    <Circle size={16} className="text-muted" />
                  )}
                </div>
                <div className="dash-task-content">
                  <span className="dash-track-label career">👔 Career / Mock</span>
                  <span className="dash-task-text">{currentWeek.career}</span>
                </div>
              </div>
            )}
          </div>

          {/* End-of-Dec Deliverables Footer Strip */}
          <div className="roadmap-dash-footer">
            <Award size={16} className="text-primary" />
            <span className="text-xs text-sub">
              <strong>End-of-Dec Goal:</strong> 60–80 DSA Qs • React+TS+Node+Postgres+Prisma • RN Mobile App • Docker+VPS DevOps • 1 Polished Portfolio
            </span>
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

        /* 🎯 ROADMAP DASHBOARD CARD */
        .roadmap-dashboard-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.35rem;
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.08), rgba(99, 102, 241, 0.06));
          border: 1px solid rgba(14, 165, 233, 0.25);
        }

        .roadmap-dash-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .roadmap-dash-title-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .dash-badge-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          background: rgba(14, 165, 233, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .text-cyan { color: #06b6d4; }

        .roadmap-badge-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          margin-bottom: 0.2rem;
        }

        .badge-roadmap {
          background: rgba(16, 185, 129, 0.18);
          color: #10b981;
          font-weight: 700;
          font-size: 0.7rem;
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-sm);
        }

        .roadmap-dash-heading {
          font-size: 1.05rem;
          font-weight: 800;
          letter-spacing: -0.01em;
        }

        .roadmap-dash-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 0.65rem;
        }

        .dash-task-item {
          display: flex;
          align-items: flex-start;
          gap: 0.55rem;
          padding: 0.65rem 0.75rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .dash-task-item:hover {
          border-color: var(--primary-color);
          transform: translateY(-1px);
        }

        .dash-task-check {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .dash-task-content {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .dash-track-label {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .dash-track-label.dsa { color: #818cf8; }
        .dash-track-label.fullstack { color: #34d399; }
        .dash-track-label.mobile { color: #22d3ee; }
        .dash-track-label.project { color: #f472b6; }
        .dash-track-label.career { color: #fbbf24; }

        .dash-task-text {
          font-size: 0.78rem;
          line-height: 1.35;
          color: var(--text-main);
        }

        .dash-task-item.done {
          background: rgba(16, 185, 129, 0.05);
          border-color: rgba(16, 185, 129, 0.25);
        }

        .dash-task-item.done .dash-task-text {
          text-decoration: line-through;
          color: var(--text-muted);
        }

        .roadmap-dash-footer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding-top: 0.6rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        /* DASHBOARD GRID */
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
