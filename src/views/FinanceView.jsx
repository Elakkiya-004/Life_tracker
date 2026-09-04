import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TransactionModal } from '../components/finance/TransactionModal';
import { JarModal } from '../components/finance/JarModal';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Download, 
  Camera, 
  Receipt, 
  Building2, 
  Utensils, 
  Bus, 
  ShoppingBag, 
  PiggyBank, 
  SlidersHorizontal, 
  Eye, 
  Printer, 
  CheckCircle2,
  FileText,
  Heart
} from 'lucide-react';

const JAR_ICON_MAP = {
  Building2,
  Utensils,
  Bus,
  ShoppingBag,
  Receipt,
  PiggyBank,
  Heart,
};

export const FinanceView = () => {
  const { 
    transactions, 
    deleteTransaction, 
    jars,
    currentMonthIncome, 
    currentMonthExpense, 
    netSavings, 
    settings 
  } = useApp();

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isJarModalOpen, setIsJarModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewImage, setPreviewImage] = useState(null);

  const safeTransactions = Array.isArray(transactions) ? transactions.filter(Boolean) : [];
  const safeJars = Array.isArray(jars) ? jars.filter(Boolean) : [];

  const currency = settings?.currency || '₹';
  const salary = settings?.monthlySalary || 0;

  // Calculate spent per jar safely
  const getJarSpent = (jarId, category) => {
    return safeTransactions
      .filter(t => t && t.type === 'expense' && (t.jarId === jarId || (!t.jarId && t.category?.toLowerCase() === category?.toLowerCase())))
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  };

  const filteredTransactions = selectedCategory === 'All'
    ? safeTransactions
    : safeTransactions.filter(t => t && t.category === selectedCategory);

  const transactionsWithBills = safeTransactions.filter(t => !!t?.receiptImage);

  // Generate and open printable/downloadable monthly statement with photos
  const handleDownloadStatement = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download the statement report.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Monthly Budget & Expense Statement - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 30px; color: #1e293b; }
          .header { border-bottom: 2px solid #6366f1; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .title { font-size: 24px; font-weight: 800; color: #1e1b4b; }
          .subtitle { font-size: 14px; color: #64748b; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
          .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
          .stat-val { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 4px; }
          .jars-table, .tx-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
          .jars-table th, .jars-table td, .tx-table th, .tx-table td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; font-size: 13px; }
          .jars-table th, .tx-table th { background: #f1f5f9; font-weight: 700; }
          .receipts-section { margin-top: 30px; }
          .receipts-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .receipt-card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; break-inside: avoid; }
          .receipt-img { max-width: 100%; height: auto; max-height: 280px; border-radius: 4px; object-fit: contain; }
          .print-btn { background: #6366f1; color: white; border: none; padding: 10px 20px; font-weight: 700; border-radius: 6px; cursor: pointer; margin-bottom: 20px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="no-print">
          <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
        </div>
        <div class="header">
          <div>
            <div class="title">LifeTracker Pro — Financial Statement</div>
            <div class="subtitle">Budget & Bill Receipts Report • User: ${settings.userName || 'Champion'} • Date: ${new Date().toLocaleDateString()}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: 800; color: #6366f1;">Salary: ${currency}${salary.toLocaleString()}</div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="stat-card">
            <div style="font-size: 12px; color: #64748b;">Monthly Salary</div>
            <div class="stat-val" style="color: #10b981;">${currency}${salary.toLocaleString()}</div>
          </div>
          <div class="stat-card">
            <div style="font-size: 12px; color: #64748b;">Total Expenses</div>
            <div class="stat-val" style="color: #ef4444;">${currency}${currentMonthExpense.toLocaleString()}</div>
          </div>
          <div class="stat-card">
            <div style="font-size: 12px; color: #64748b;">Net Savings</div>
            <div class="stat-val" style="color: #6366f1;">${currency}${netSavings.toLocaleString()}</div>
          </div>
          <div class="stat-card">
            <div style="font-size: 12px; color: #64748b;">Receipts Logged</div>
            <div class="stat-val">${transactionsWithBills.length} Bills</div>
          </div>
        </div>

        <h3>🏺 Salary Jar Allocation Breakdown</h3>
        <table class="jars-table">
          <thead>
            <tr>
              <th>Jar Category</th>
              <th>Allocated (${currency})</th>
              <th>Total Spent (${currency})</th>
              <th>Remaining Balance (${currency})</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${jars.map(j => {
              const spent = getJarSpent(j.id, j.category);
              const remaining = j.allocated - spent;
              return `
                <tr>
                  <td><strong>${j.name}</strong></td>
                  <td>${currency}${j.allocated.toLocaleString()}</td>
                  <td style="color: #ef4444;">${currency}${spent.toLocaleString()}</td>
                  <td style="color: ${remaining >= 0 ? '#10b981' : '#ef4444'}; font-weight: 700;">
                    ${currency}${remaining.toLocaleString()}
                  </td>
                  <td>${remaining >= 0 ? 'Within Budget' : 'Overbudget'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <h3>💳 Transaction History</h3>
        <table class="tx-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Title / Merchant</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount (${currency})</th>
              <th>Bill Attached</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(t => `
              <tr>
                <td>${t.date}</td>
                <td><strong>${t.title}</strong> ${t.note ? `<br><small style="color: #64748b;">${t.note}</small>` : ''}</td>
                <td>${t.category}</td>
                <td style="font-weight: 700; color: ${t.type === 'income' ? '#10b981' : '#ef4444'};">${t.type.toUpperCase()}</td>
                <td style="font-weight: 700;">${currency}${t.amount.toLocaleString()}</td>
                <td>${t.receiptImage ? '✓ Yes' : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${transactionsWithBills.length > 0 ? `
          <div class="receipts-section">
            <h3>📸 Attached Bill & Receipt Photos</h3>
            <div class="receipts-grid">
              ${transactionsWithBills.map(t => `
                <div class="receipt-card">
                  <div style="font-weight: 700; margin-bottom: 5px;">${t.title} — ${currency}${t.amount} (${t.date})</div>
                  <img src="${t.receiptImage}" class="receipt-img" alt="Bill Photo" />
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="finance-container">
      {/* Salary Overview Card */}
      <div className="finance-hero card">
        <div className="hero-content">
          <div className="hero-badge">
            <Wallet size={16} />
            <span>MONTHLY SALARY & JAR BUDGETING SYSTEM</span>
          </div>
          <h2 className="hero-title">
            Take-Home: <span className="text-emerald">{currency}{salary.toLocaleString()}</span>
          </h2>
          <p className="hero-desc text-sub">
            Salary spilled across <strong>{safeJars.length} smart budget jars</strong> (Loan, Food, Travel, Bills, Shopping, Grandma, Savings).
          </p>

          <div className="quick-hero-metrics">
            <div className="hero-stat-pill">
              <span className="text-xs text-sub">Total Spent</span>
              <span className="text-sm font-bold text-danger">-{currency}{currentMonthExpense.toFixed(0)}</span>
            </div>
            <div className="hero-stat-pill">
              <span className="text-xs text-sub">Net Savings</span>
              <span className="text-sm font-bold text-success">+{currency}{netSavings.toFixed(0)}</span>
            </div>
          </div>
        </div>

        <div className="hero-actions-cluster">
          <button className="btn btn-secondary btn-sm" onClick={() => setIsJarModalOpen(true)}>
            <SlidersHorizontal size={15} />
            <span>Spill / Adjust Jars</span>
          </button>

          <button className="btn btn-primary btn-sm" onClick={() => setIsTxModalOpen(true)}>
            <Plus size={16} />
            <span>+ Log Expense & Bill</span>
          </button>

          <button className="btn btn-ghost btn-sm text-cyan" onClick={handleDownloadStatement}>
            <Download size={15} />
            <span>Download Statement (PDF)</span>
          </button>
        </div>
      </div>

      {/* 6-Jar Visual Liquid Grid */}
      <div className="jars-section">
        <div className="section-header">
          <div className="section-title-wrap">
            <h3 className="title-md">🏺 Salary Budget Jars</h3>
            <span className="badge badge-primary">₹18k Distribution</span>
          </div>
          <button className="btn-ghost btn-sm text-sub" onClick={() => setIsJarModalOpen(true)}>
            Configure Allocations
          </button>
        </div>

        <div className="jars-grid">
          {jars.map((jar) => {
            const spent = getJarSpent(jar.id, jar.category);
            const remaining = jar.allocated - spent;
            const fillPercent = Math.min(100, Math.round((spent / jar.allocated) * 100)) || 0;
            const IconComp = JAR_ICON_MAP[jar.icon] || PiggyBank;

            return (
              <div key={jar.id} className="jar-card card">
                <div className="jar-card-top">
                  <div className="jar-icon-wrap" style={{ backgroundColor: `${jar.color}20`, color: jar.color }}>
                    <IconComp size={20} />
                  </div>
                  <div className="jar-heading-wrap">
                    <h4 className="jar-name">{jar.name}</h4>
                    <span className="jar-allocated-badge">
                      Target: {currency}{jar.allocated.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Visual Progress Bar & Values */}
                <div className="jar-meter-wrap">
                  <div className="jar-meter-bar">
                    <div 
                      className="jar-meter-fill"
                      style={{ 
                        width: `${fillPercent}%`,
                        backgroundColor: fillPercent > 90 ? 'var(--accent-danger)' : jar.color 
                      }}
                    />
                  </div>
                  <div className="jar-meter-numbers">
                    <span className="text-xs text-sub">Spent: {currency}{spent.toLocaleString()}</span>
                    <span className={`text-xs font-bold ${remaining >= 0 ? 'text-success' : 'text-danger'}`}>
                      {remaining >= 0 ? `Left: ${currency}${remaining}` : `Over: ${currency}${Math.abs(remaining)}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bill Receipts Photo Gallery */}
      {transactionsWithBills.length > 0 && (
        <div className="receipts-gallery-section">
          <div className="section-header">
            <div className="section-title-wrap">
              <Camera size={18} className="text-primary" />
              <h3 className="title-md">📸 Uploaded Bill Receipts ({transactionsWithBills.length})</h3>
            </div>
            <span className="text-xs text-sub">Tap to view full receipt</span>
          </div>

          <div className="receipts-scroll-row">
            {transactionsWithBills.map((t) => (
              <div 
                key={t.id} 
                className="receipt-thumbnail-card card"
                onClick={() => setPreviewImage(t.receiptImage)}
              >
                <img src={t.receiptImage} alt={t.title} className="thumbnail-img" />
                <div className="thumbnail-info">
                  <span className="thumbnail-title">{t.title}</span>
                  <span className="thumbnail-amount">{currency}{t.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction Register */}
      <div className="section-block">
        <div className="section-header">
          <h3 className="title-md">Recent Transactions</h3>
          <div className="tx-header-actions">
            <select
              className="select select-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {jars.map(j => (
                <option key={j.id} value={j.category}>{j.name}</option>
              ))}
              <option value="Salary">Salary</option>
            </select>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="card empty-tx">
            <Receipt size={36} className="text-muted" />
            <p className="text-sub">No transactions recorded yet.</p>
            <button className="btn btn-primary" onClick={() => setIsTxModalOpen(true)}>
              + Log First Expense
            </button>
          </div>
        ) : (
          <div className="tx-list">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="tx-row card">
                <div className="tx-left">
                  <div className={`tx-type-dot ${tx.type === 'income' ? 'income' : 'expense'}`} />
                  <div className="tx-details">
                    <div className="tx-title-row">
                      <span className="tx-title">{tx.title}</span>
                      {tx.receiptImage && (
                        <button 
                          className="bill-photo-badge"
                          onClick={() => setPreviewImage(tx.receiptImage)}
                          title="View attached bill receipt"
                        >
                          <Camera size={12} />
                          <span>Photo</span>
                        </button>
                      )}
                    </div>
                    <span className="tx-date text-xs text-sub">{tx.date} • {tx.category}</span>
                  </div>
                </div>

                <div className="tx-right">
                  <span className={`tx-amount ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toFixed(2)}
                  </span>
                  <button 
                    className="btn-icon btn-ghost btn-sm text-danger"
                    onClick={() => {
                      if (window.confirm(`Delete transaction "${tx.title}"?`)) {
                        deleteTransaction(tx.id);
                      }
                    }}
                    title="Delete transaction"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bill Photo Preview Lightbox */}
      {previewImage && (
        <div className="image-lightbox-overlay" onClick={() => setPreviewImage(null)}>
          <div className="image-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="Bill Receipt Preview" className="lightbox-full-img" />
            <button className="btn btn-secondary btn-sm close-lightbox-btn" onClick={() => setPreviewImage(null)}>
              Close Photo
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
      />

      <JarModal
        isOpen={isJarModalOpen}
        onClose={() => setIsJarModalOpen(false)}
      />

      <style>{`
        .finance-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .finance-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.75rem;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(99, 102, 241, 0.12));
          border-color: rgba(16, 185, 129, 0.35);
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
          min-width: 260px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--accent-success);
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        .hero-title {
          font-size: 1.5rem;
          font-weight: 900;
          color: var(--text-primary);
        }

        .text-emerald {
          color: var(--accent-success);
        }

        .quick-hero-metrics {
          display: flex;
          gap: 1rem;
          margin-top: 0.25rem;
        }

        .hero-stat-pill {
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.04);
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }

        .hero-actions-cluster {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .jars-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .section-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .jars-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.85rem;
        }

        @media (min-width: 640px) {
          .jars-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .jars-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .jar-card {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          padding: 1.15rem;
        }

        .jar-card-top {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .jar-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .jar-heading-wrap {
          display: flex;
          flex-direction: column;
        }

        .jar-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .jar-allocated-badge {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .jar-meter-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .jar-meter-bar {
          height: 7px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .jar-meter-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.4s ease;
        }

        .jar-meter-numbers {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .receipts-gallery-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .receipts-scroll-row {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .receipt-thumbnail-card {
          width: 140px;
          flex-shrink: 0;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .receipt-thumbnail-card:hover {
          transform: translateY(-2px);
          border-color: var(--accent-primary);
        }

        .thumbnail-img {
          width: 100%;
          height: 100px;
          object-fit: cover;
          border-radius: var(--radius-sm);
        }

        .thumbnail-info {
          display: flex;
          flex-direction: column;
        }

        .thumbnail-title {
          font-size: 0.75rem;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .thumbnail-amount {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--accent-danger);
        }

        .tx-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .tx-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.15rem;
        }

        .tx-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .tx-type-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .tx-type-dot.income { background: var(--accent-success); box-shadow: 0 0 8px var(--accent-success); }
        .tx-type-dot.expense { background: var(--accent-danger); }

        .tx-details {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .tx-title-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .tx-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .bill-photo-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.15rem 0.4rem;
          border-radius: var(--radius-sm);
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.3);
          color: var(--accent-primary);
          font-size: 0.68rem;
          font-weight: 700;
          cursor: pointer;
        }

        .tx-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .tx-amount {
          font-size: 1rem;
          font-weight: 800;
        }

        .image-lightbox-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: fadeIn 0.2s ease;
        }

        .image-lightbox-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          max-width: 90vw;
          max-height: 90vh;
        }

        .lightbox-full-img {
          max-width: 100%;
          max-height: 80vh;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          object-fit: contain;
        }

        .select-sm {
          padding: 0.35rem 0.65rem;
          font-size: 0.78rem;
        }

        .empty-tx {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 2.5rem;
          text-align: center;
        }

        .text-cyan { color: var(--accent-cyan); }
      `}</style>
    </div>
  );
};
