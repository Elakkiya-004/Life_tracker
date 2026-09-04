import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Plus, Trash2, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';

export const JarModal = ({ isOpen, onClose }) => {
  const { jars, setAllJars, resetJarsToDefault, settings, updateSettings } = useApp();

  const [salary, setSalary] = useState(settings.monthlySalary || 18000);
  const [localJars, setLocalJars] = useState(jars);
  const [newJarName, setNewJarName] = useState('');
  const [newJarAlloc, setNewJarAlloc] = useState('');

  // Sync state when modal is opened or jars are updated
  useEffect(() => {
    if (isOpen) {
      setLocalJars(Array.isArray(jars) ? jars : []);
      setSalary(settings.monthlySalary || 18000);
    }
  }, [isOpen, jars, settings.monthlySalary]);

  const currency = settings.currency || '₹';

  const totalAllocated = (Array.isArray(localJars) ? localJars : []).reduce((sum, j) => sum + (parseFloat(j.allocated) || 0), 0);
  const unallocated = salary - totalAllocated;

  const handleJarAllocChange = (id, val) => {
    const num = parseFloat(val) || 0;
    setLocalJars(prev => prev.map(j => j.id === id ? { ...j, allocated: num } : j));
  };

  const handleAddJar = (e) => {
    e.preventDefault();
    if (!newJarName.trim()) return;

    const newJ = {
      id: `jar-${Date.now()}`,
      name: newJarName.trim(),
      category: 'General',
      allocated: parseFloat(newJarAlloc) || 1000,
      color: '#6366f1',
      icon: 'PiggyBank',
    };
    setLocalJars(prev => [...prev, newJ]);
    setNewJarName('');
    setNewJarAlloc('');
  };

  const handleDeleteJar = (id) => {
    setLocalJars(prev => prev.filter(j => j.id !== id));
  };

  const handleSave = () => {
    updateSettings({ monthlySalary: parseFloat(salary) || 18000 });
    setAllJars(localJars);
    onClose();
  };

  const handleReset = () => {
    if (window.confirm('Reset Jars to tailored ₹18k split (Loan ₹10k, Food ₹2k, Travel ₹1.5k, Bills ₹1.5k, Shopping ₹1k, Grandma ₹1k, Savings ₹1k)?')) {
      resetJarsToDefault();
      setSalary(18000);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🏺 Spill Salary into Budget Jars"
      maxWidth="540px"
    >
      <div className="jar-modal-content">
        {/* Salary Input */}
        <div className="salary-box card">
          <div className="salary-input-row">
            <div>
              <label className="label">Monthly Take-Home Salary</label>
              <div className="amount-input-wrap">
                <span className="currency-prefix">{currency}</span>
                <input
                  type="number"
                  className="input salary-input"
                  value={salary}
                  onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="salary-stats">
              <span className="text-xs text-sub">Allocated: {currency}{totalAllocated}</span>
              <span className={`text-xs font-bold ${unallocated === 0 ? 'text-success' : unallocated > 0 ? 'text-cyan' : 'text-danger'}`}>
                {unallocated === 0 ? '✓ 100% Spilled' : unallocated > 0 ? `+${currency}${unallocated} Unallocated` : `${currency}${unallocated} Overbudget`}
              </span>
            </div>
          </div>
        </div>

        {/* Jars Allocation List */}
        <div className="jars-edit-list">
          <h4 className="text-xs font-bold text-sub text-uppercase">Spill Across Categories:</h4>
          {localJars.map((jar) => (
            <div key={jar.id} className="jar-edit-row">
              <div className="jar-label-col">
                <span className="jar-color-dot" style={{ backgroundColor: jar.color }} />
                <span className="jar-name-text">{jar.name}</span>
              </div>

              <div className="jar-input-col">
                <span className="currency-symbol">{currency}</span>
                <input
                  type="number"
                  className="input jar-val-input"
                  value={jar.allocated}
                  onChange={(e) => handleJarAllocChange(jar.id, e.target.value)}
                  step="100"
                  min="0"
                />
                <button
                  type="button"
                  className="btn-icon btn-ghost btn-sm text-danger"
                  onClick={() => handleDeleteJar(jar.id)}
                  title="Remove jar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Jar Row */}
        <form onSubmit={handleAddJar} className="add-jar-form">
          <input
            type="text"
            className="input flex-1"
            placeholder="New jar name (e.g. Health, Pets)..."
            value={newJarName}
            onChange={(e) => setNewJarName(e.target.value)}
          />
          <input
            type="number"
            className="input w-80"
            placeholder={`Amount (${currency})`}
            value={newJarAlloc}
            onChange={(e) => setNewJarAlloc(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary btn-sm">
            <Plus size={14} /> Add
          </button>
        </form>

        {/* Actions */}
        <div className="modal-footer-actions">
          <button type="button" className="btn btn-ghost btn-sm text-sub" onClick={handleReset}>
            <RotateCcw size={14} />
            <span>Reset to ₹18k Default</span>
          </button>

          <div className="btn-group-right">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              Save Jar Split
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .jar-modal-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .salary-box {
          padding: 1rem;
          background: rgba(99, 102, 241, 0.08);
          border-color: rgba(99, 102, 241, 0.3);
        }

        .salary-input-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .amount-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .currency-prefix {
          position: absolute;
          left: 0.85rem;
          font-weight: 800;
          color: var(--text-muted);
        }

        .salary-input {
          padding-left: 2rem !important;
          font-size: 1.15rem;
          font-weight: 800;
          width: 140px;
        }

        .salary-stats {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.2rem;
        }

        .jars-edit-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          max-height: 280px;
          overflow-y: auto;
        }

        .text-uppercase {
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .jar-edit-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
        }

        .jar-label-col {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .jar-color-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .jar-name-text {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .jar-input-col {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .currency-symbol {
          font-weight: 700;
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .jar-val-input {
          width: 100px;
          padding: 0.35rem 0.5rem !important;
          font-weight: 700;
          text-align: right;
        }

        .add-jar-form {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid var(--border-color);
        }

        .w-80 {
          width: 110px;
        }

        .modal-footer-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.5rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .btn-group-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      `}</style>
    </Modal>
  );
};
