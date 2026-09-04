import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Trash2, 
  Utensils, 
  Car, 
  Receipt, 
  ShoppingBag, 
  HeartPulse, 
  Film, 
  GraduationCap, 
  Home, 
  Smile, 
  DollarSign, 
  Briefcase, 
  TrendingUp, 
  Gift, 
  Tag 
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Food': Utensils,
  'Transport': Car,
  'Bills & Utilities': Receipt,
  'Shopping': ShoppingBag,
  'Health': HeartPulse,
  'Entertainment': Film,
  'Education': GraduationCap,
  'Housing': Home,
  'Personal Care': Smile,
  'Salary': DollarSign,
  'Freelance': Briefcase,
  'Business': TrendingUp,
  'Investments': TrendingUp,
  'Gifts': Gift,
};

export const TransactionList = () => {
  const { transactions, deleteTransaction, settings } = useApp();
  const [filterType, setFilterType] = useState('all'); // 'all' | 'expense' | 'income'
  const [searchQuery, setSearchQuery] = useState('');

  const currency = settings.currency || '$';

  const filtered = transactions.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.note && t.note.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="tx-list-section">
      {/* Filters and Search */}
      <div className="tx-controls">
        <div className="filter-pill-group">
          <button 
            className={`filter-pill ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All
          </button>
          <button 
            className={`filter-pill ${filterType === 'expense' ? 'active' : ''}`}
            onClick={() => setFilterType('expense')}
          >
            Expenses
          </button>
          <button 
            className={`filter-pill ${filterType === 'income' ? 'active' : ''}`}
            onClick={() => setFilterType('income')}
          >
            Income
          </button>
        </div>

        <input
          type="text"
          placeholder="Search transactions..."
          className="input search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Transaction Items */}
      {filtered.length === 0 ? (
        <div className="empty-tx-card card">
          <p className="text-sub">No transactions found matching your filter.</p>
        </div>
      ) : (
        <div className="tx-items-wrapper">
          {filtered.map((t) => {
            const IconComp = CATEGORY_ICONS[t.category] || Tag;
            const isExpense = t.type === 'expense';

            return (
              <div key={t.id} className="tx-item card">
                <div className="tx-item-left">
                  <div className={`tx-icon-box ${isExpense ? 'expense' : 'income'}`}>
                    <IconComp size={18} />
                  </div>
                  <div className="tx-details">
                    <h5 className="tx-title">{t.title}</h5>
                    <div className="tx-meta">
                      <span className="tx-category-badge">{t.category}</span>
                      <span className="tx-date-text">{t.date}</span>
                      {t.note && <span className="tx-note-snippet">• {t.note}</span>}
                    </div>
                  </div>
                </div>

                <div className="tx-item-right">
                  <span className={`tx-amount ${isExpense ? 'amount-expense' : 'amount-income'}`}>
                    {isExpense ? '-' : '+'}{currency}{t.amount.toFixed(2)}
                  </span>
                  <button 
                    className="btn-icon btn-ghost btn-sm text-danger"
                    onClick={() => {
                      if (window.confirm(`Delete "${t.title}"?`)) {
                        deleteTransaction(t.id);
                      }
                    }}
                    title="Delete transaction"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .tx-list-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .tx-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .filter-pill-group {
          display: flex;
          background: rgba(255, 255, 255, 0.04);
          padding: 0.25rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }

        .filter-pill {
          padding: 0.35rem 0.85rem;
          border-radius: calc(var(--radius-sm) - 2px);
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-pill.active {
          background: var(--accent-primary);
          color: #ffffff;
        }

        .search-input {
          max-width: 240px;
          padding: 0.45rem 0.75rem;
          font-size: 0.85rem;
        }

        .tx-items-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .tx-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.15rem;
          gap: 0.75rem;
        }

        .tx-item-left {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          min-width: 0;
          flex: 1;
        }

        .tx-icon-box {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .tx-icon-box.expense {
          background: rgba(244, 63, 94, 0.12);
          color: var(--accent-danger);
        }

        .tx-icon-box.income {
          background: rgba(16, 185, 129, 0.12);
          color: var(--accent-success);
        }

        .tx-details {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .tx-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tx-meta {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          color: var(--text-muted);
          flex-wrap: wrap;
        }

        .tx-category-badge {
          color: var(--accent-primary);
          font-weight: 600;
        }

        .tx-item-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .tx-amount {
          font-size: 0.95rem;
          font-weight: 800;
        }

        .amount-expense {
          color: var(--accent-danger);
        }

        .amount-income {
          color: var(--accent-success);
        }

        .empty-tx-card {
          text-align: center;
          padding: 2rem;
        }

        .btn-sm {
          width: 28px;
          height: 28px;
        }
      `}</style>
    </div>
  );
};
