import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowDownLeft, ArrowUpRight, Wallet, Target } from 'lucide-react';

export const FinanceSummary = () => {
  const { currentMonthIncome, currentMonthExpense, netSavings, settings } = useApp();

  const currency = settings.currency || '$';
  const monthlyBudget = settings.monthlyBudget || 1500;
  const budgetUsedPercent = Math.min(100, Math.round((currentMonthExpense / monthlyBudget) * 100));

  const isOverBudget = currentMonthExpense > monthlyBudget;

  return (
    <div className="finance-summary-container">
      {/* 3 Metric Cards */}
      <div className="finance-cards-grid">
        <div className="finance-card card">
          <div className="finance-card-icon income">
            <ArrowDownLeft size={20} />
          </div>
          <div className="finance-card-info">
            <span className="finance-card-label">Monthly Income</span>
            <h3 className="finance-card-val text-success">
              +{currency}{currentMonthIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        <div className="finance-card card">
          <div className="finance-card-icon expense">
            <ArrowUpRight size={20} />
          </div>
          <div className="finance-card-info">
            <span className="finance-card-label">Monthly Expenses</span>
            <h3 className="finance-card-val text-danger">
              -{currency}{currentMonthExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        <div className="finance-card card">
          <div className="finance-card-icon savings">
            <Wallet size={20} />
          </div>
          <div className="finance-card-info">
            <span className="finance-card-label">Net Cash Flow</span>
            <h3 className={`finance-card-val ${netSavings >= 0 ? 'text-primary' : 'text-danger'}`}>
              {netSavings >= 0 ? '+' : '-'}{currency}{Math.abs(netSavings).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>
      </div>

      {/* Monthly Budget Progress Card */}
      <div className="budget-bar-card card">
        <div className="budget-bar-header">
          <div className="budget-title-area">
            <Target size={16} className="text-muted" />
            <span className="budget-title">Monthly Budget Target ({currency}{monthlyBudget})</span>
          </div>
          <span className={`budget-percent ${isOverBudget ? 'text-danger' : 'text-primary'}`}>
            {budgetUsedPercent}% used
          </span>
        </div>

        <div className="budget-progress-track">
          <div 
            className={`budget-progress-fill ${isOverBudget ? 'fill-danger' : ''}`}
            style={{ width: `${budgetUsedPercent}%` }}
          />
        </div>

        <div className="budget-footer-text">
          <span>{currency}{currentMonthExpense.toFixed(2)} spent</span>
          <span>{currency}{Math.max(0, monthlyBudget - currentMonthExpense).toFixed(2)} remaining</span>
        </div>
      </div>

      <style>{`
        .finance-summary-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .finance-cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }

        @media (min-width: 640px) {
          .finance-cards-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .finance-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
        }

        .finance-card-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .finance-card-icon.income {
          background: rgba(16, 185, 129, 0.15);
          color: var(--accent-success);
        }

        .finance-card-icon.expense {
          background: rgba(244, 63, 94, 0.15);
          color: var(--accent-danger);
        }

        .finance-card-icon.savings {
          background: rgba(99, 102, 241, 0.15);
          color: var(--accent-primary);
        }

        .finance-card-info {
          display: flex;
          flex-direction: column;
        }

        .finance-card-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .finance-card-val {
          font-size: 1.15rem;
          font-weight: 800;
        }

        .text-success {
          color: var(--accent-success);
        }

        .text-danger {
          color: var(--accent-danger);
        }

        .text-primary {
          color: var(--accent-primary);
        }

        .budget-bar-card {
          padding: 1.15rem 1.25rem;
        }

        .budget-bar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.65rem;
        }

        .budget-title-area {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .budget-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .budget-percent {
          font-size: 0.82rem;
          font-weight: 800;
        }

        .budget-progress-track {
          height: 8px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .budget-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-cyan));
          border-radius: var(--radius-full);
          transition: width 0.4s ease;
        }

        .budget-progress-fill.fill-danger {
          background: var(--accent-danger);
        }

        .budget-footer-text {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};
