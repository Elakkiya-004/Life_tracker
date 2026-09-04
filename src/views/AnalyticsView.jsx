import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HabitHistoryModal } from '../components/habits/HabitHistoryModal';
import { 
  CheckCircle2, 
  Wallet, 
  Award, 
  TrendingUp, 
  Flame, 
  PieChart,
  Calendar,
  ChevronRight
} from 'lucide-react';

export const AnalyticsView = () => {
  const { 
    habits, 
    transactions, 
    settings, 
    currentMonthIncome, 
    currentMonthExpense, 
    netSavings,
    getPast30DaysHistory 
  } = useApp();

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const historyList = getPast30DaysHistory ? getPast30DaysHistory() : [];

  const safeHabits = Array.isArray(habits) ? habits.filter(Boolean) : [];
  const safeTransactions = Array.isArray(transactions) ? transactions.filter(Boolean) : [];

  const currency = settings?.currency || '₹';
  const monthlyBudget = settings?.monthlyBudget || 0;

  // 1. Habit Consistency Score (60% weight)
  const totalCompletions = safeHabits.reduce((sum, h) => sum + (Array.isArray(h?.completedDates) ? h.completedDates.length : 0), 0);
  const habitConsistencyScore = safeHabits.length > 0 
    ? Math.min(100, Math.round((totalCompletions / (safeHabits.length * 7 || 1)) * 100))
    : 0;

  // 2. Budget Health Score (40% weight)
  const budgetHealthScore = (!monthlyBudget || monthlyBudget <= 0)
    ? 100
    : currentMonthExpense <= monthlyBudget 
    ? 100 
    : Math.max(0, Math.round((1 - (currentMonthExpense - monthlyBudget) / monthlyBudget) * 100));

  // Overall Performance Score
  const performanceScore = Math.round((habitConsistencyScore * 0.60) + (budgetHealthScore * 0.40));

  // Category expense breakdown
  const expenseTransactions = safeTransactions.filter((t) => t && t.type === 'expense');
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const categoryTotals = {};
  expenseTransactions.forEach((t) => {
    const cat = t.category || 'General';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (parseFloat(t.amount) || 0);
  });

  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([cat, amount]) => ({
      category: cat,
      amount,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Best streak
  const bestStreak = safeHabits.reduce((max, h) => Math.max(max, h?.streak || 0), 0);

  return (
    <div className="analytics-view-container">
      {/* Life Score Hero Card */}
      <div className="life-score-card card">
        <div className="life-score-left">
          <div className="score-badge">
            <Award size={16} />
            <span>OVERALL PERFORMANCE SCORE</span>
          </div>
          <h2 className="score-title">
            {performanceScore >= 80 ? '🌟 Peak Consistency & Discipline!' : performanceScore >= 60 ? '⚡ Strong Momentum!' : '🌱 Building Consistency!'}
          </h2>
          <p className="score-desc text-sub">
            Composite rating calculated from your active habit adherence ({habitConsistencyScore}%) and monthly budget discipline ({budgetHealthScore}%).
          </p>
        </div>

        <div className="score-circle-wrap">
          <div className="score-number-box">
            <span className="score-main">{performanceScore}</span>
            <span className="score-out-of">/ 100</span>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="analytics-grid">
        {/* Habit Performance */}
        <div className="card analytics-panel">
          <div className="panel-header">
            <div className="panel-title-area">
              <CheckCircle2 size={18} className="text-indigo" />
              <h3 className="title-sm">Habit Completion Rates</h3>
            </div>
            <span className="badge badge-primary">{habits.length} Tracked</span>
          </div>

          <div className="habits-progress-list">
            {habits.map((habit) => {
              const count = habit.completedDates?.length || 0;
              const rate = Math.min(100, Math.round((count / 14) * 100)); // last 14 days basis
              return (
                <div key={habit.id} className="habit-rate-row">
                  <div className="habit-rate-header">
                    <span className="habit-rate-name">{habit.name}</span>
                    <span className="habit-rate-percent" style={{ color: habit.color }}>
                      {count} check-ins ({habit.streak}d streak)
                    </span>
                  </div>
                  <div className="rate-track">
                    <div 
                      className="rate-fill" 
                      style={{ 
                        width: `${Math.max(8, rate)}%`,
                        backgroundColor: habit.color 
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Flow Overview */}
        <div className="card analytics-panel">
          <div className="panel-header">
            <div className="panel-title-area">
              <TrendingUp size={18} className="text-emerald" />
              <h3 className="title-sm">Cash Flow & Budget Health</h3>
            </div>
            <span className="badge badge-success">{budgetHealthScore}% Health</span>
          </div>

          <div className="financial-analytics-content">
            <div className="flow-stat-row">
              <span className="text-sub">Total Income This Month</span>
              <span className="text-success font-bold">+{currency}{currentMonthIncome.toFixed(2)}</span>
            </div>
            <div className="flow-stat-row">
              <span className="text-sub">Total Spent This Month</span>
              <span className="text-danger font-bold">-{currency}{currentMonthExpense.toFixed(2)}</span>
            </div>
            <div className="flow-stat-row border-top">
              <span className="text-primary font-bold">Net Savings</span>
              <span className={`font-bold ${netSavings >= 0 ? 'text-success' : 'text-danger'}`}>
                {netSavings >= 0 ? '+' : '-'}{currency}{Math.abs(netSavings).toFixed(2)}
              </span>
            </div>

            <div className="budget-mini-track-wrap">
              <div className="budget-mini-header">
                <span className="text-xs text-sub">Budget Used: {currency}{currentMonthExpense.toFixed(0)} of {currency}{monthlyBudget}</span>
                <span className="text-xs font-bold">{Math.round((currentMonthExpense / monthlyBudget) * 100)}%</span>
              </div>
              <div className="rate-track">
                <div 
                  className={`rate-fill ${currentMonthExpense > monthlyBudget ? 'fill-danger' : 'fill-primary'}`}
                  style={{ width: `${Math.min(100, (currentMonthExpense / monthlyBudget) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Expense Category Breakdown */}
        <div className="card analytics-panel full-width">
          <div className="panel-header">
            <div className="panel-title-area">
              <Wallet size={18} className="text-emerald" />
              <h3 className="title-sm">Spending by Category</h3>
            </div>
            <span className="badge badge-success">Total: {currency}{totalExpenses.toFixed(2)}</span>
          </div>

          <div className="category-breakdown-grid">
            {categoryBreakdown.length === 0 ? (
              <p className="text-sub text-center py-4">No expenses logged yet.</p>
            ) : (
              categoryBreakdown.map((cat) => (
                <div key={cat.category} className="cat-breakdown-card">
                  <div className="cat-breakdown-header">
                    <span className="cat-breakdown-name">{cat.category}</span>
                    <span className="cat-breakdown-amount">
                      {currency}{cat.amount.toFixed(2)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="cat-breakdown-track">
                    <div 
                      className="cat-breakdown-fill" 
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 30-Day Progress History Card */}
      <div className="card analytics-panel">
        <div className="panel-header">
          <div className="panel-title-area">
            <Calendar size={18} className="text-primary" />
            <div>
              <h3 className="title-sm">30-Day Daily Habit Progress History</h3>
              <p className="text-sub" style={{ fontSize: '0.75rem', marginTop: '0.15rem' }}>
                View completed tasks and execution scores across the past 30 days. Auto-prunes after 30 days.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={() => setIsHistoryModalOpen(true)}
          >
            <span>Open Full Log</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="analytics-history-preview-grid">
          {historyList.slice(0, 14).map((day) => (
            <button
              key={day.date}
              type="button"
              className="analytics-day-chip"
              onClick={() => setIsHistoryModalOpen(true)}
            >
              <span className="chip-day-label">{day.dayLabel}</span>
              <span className="chip-day-date">{day.formattedDate}</span>
              <div 
                className={`chip-day-score ${day.percent === 100 ? 'score-100' : day.percent > 0 ? 'score-partial' : 'score-zero'}`}
              >
                {day.completed}/{day.total} ({day.percent}%)
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 30-Day Daily Progress History Modal */}
      <HabitHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      <style>{`
        .analytics-view-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .life-score-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.75rem;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(16, 185, 129, 0.12));
          border-color: rgba(99, 102, 241, 0.35);
          gap: 1.5rem;
        }

        .life-score-left {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .score-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--accent-primary);
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        .score-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .score-desc {
          font-size: 0.82rem;
          line-height: 1.4;
          max-width: 540px;
        }

        .score-circle-wrap {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-success));
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 24px var(--accent-primary-glow);
          flex-shrink: 0;
        }

        .score-number-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #ffffff;
        }

        .score-main {
          font-size: 1.6rem;
          font-weight: 800;
          line-height: 1;
        }

        .score-out-of {
          font-size: 0.65rem;
          opacity: 0.8;
          font-weight: 700;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }

        @media (min-width: 768px) {
          .analytics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .full-width {
          grid-column: 1 / -1;
        }

        .analytics-panel {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 1.25rem;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .panel-title-area {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .habits-progress-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .habit-rate-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 700;
          margin-bottom: 0.35rem;
        }

        .rate-track {
          height: 8px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .rate-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.4s ease;
        }

        .financial-analytics-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .flow-stat-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }

        .border-top {
          border-top: 1px solid var(--border-color);
          padding-top: 0.65rem;
        }

        .budget-mini-track-wrap {
          margin-top: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .budget-mini-header {
          display: flex;
          justify-content: space-between;
        }

        .fill-primary {
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-cyan));
        }

        .fill-danger {
          background: var(--accent-danger);
        }

        .category-breakdown-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.85rem;
        }

        @media (min-width: 640px) {
          .category-breakdown-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .cat-breakdown-card {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }

        .cat-breakdown-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .cat-breakdown-track {
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .cat-breakdown-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-cyan));
          border-radius: var(--radius-full);
        }

        .text-indigo { color: var(--accent-primary); }
        .text-emerald { color: var(--accent-success); }

        .analytics-history-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 0.65rem;
          margin-top: 0.5rem;
        }

        .analytics-day-chip {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-family: inherit;
          text-align: left;
          transition: all 0.2s ease;
        }

        .analytics-day-chip:hover {
          background: var(--bg-card-hover);
          border-color: var(--accent-primary);
          transform: translateY(-1px);
        }

        .chip-day-label {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .chip-day-date {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .chip-day-score {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          margin-top: 0.25rem;
          display: inline-block;
          width: fit-content;
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
      `}</style>
    </div>
  );
};
