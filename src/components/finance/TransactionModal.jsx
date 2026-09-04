import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { 
  Camera, 
  Upload, 
  X, 
  Trash2, 
  Utensils, 
  Bus, 
  Building2, 
  ShoppingBag, 
  Receipt, 
  PiggyBank,
  DollarSign
} from 'lucide-react';

const CATEGORIES = [
  'Loan',
  'Food',
  'Travel',
  'Bills',
  'Shopping',
  'Grandma',
  'Family',
  'Savings',
  'Salary',
  'Freelance',
  'Other',
];

export const TransactionModal = ({ isOpen, onClose }) => {
  const { addTransaction, todayStr, settings, jars } = useApp();

  const [title, setTitle] = useState('');
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [jarId, setJarId] = useState('jar-food');
  const [date, setDate] = useState(todayStr);
  const [note, setNote] = useState('');
  const [receiptImage, setReceiptImage] = useState(null);

  const currency = settings.currency || '₹';

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Compress & convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      setReceiptImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    const matchingJar = jars.find(j => j.category.toLowerCase() === newCat.toLowerCase() || j.name.toLowerCase().includes(newCat.toLowerCase()));
    if (matchingJar) {
      setJarId(matchingJar.id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    addTransaction({
      title: title.trim(),
      type,
      amount: parseFloat(amount),
      category,
      jarId: type === 'expense' ? jarId : null,
      date,
      note: note.trim(),
      receiptImage,
    });

    setTitle('');
    setAmount('');
    setNote('');
    setReceiptImage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Transaction & Bill"
      maxWidth="500px"
    >
      <form onSubmit={handleSubmit} className="tx-form">
        {/* Type Toggle */}
        <div className="type-toggle-group">
          <button
            type="button"
            className={`type-toggle-btn ${type === 'expense' ? 'active-expense' : ''}`}
            onClick={() => setType('expense')}
          >
            Expense (-)
          </button>
          <button
            type="button"
            className={`type-toggle-btn ${type === 'income' ? 'active-income' : ''}`}
            onClick={() => setType('income')}
          >
            Income / Salary (+)
          </button>
        </div>

        {/* Amount */}
        <div className="input-group">
          <label className="label">Amount ({currency}) *</label>
          <div className="amount-input-wrap">
            <span className="currency-prefix">{currency}</span>
            <input
              type="number"
              className="input amount-input"
              placeholder="0.00"
              step="1"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
            />
          </div>
        </div>

        {/* Title */}
        <div className="input-group">
          <label className="label">Title / Merchant *</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Loan EMI, Grocery Store, Metro Pass"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Category & Budget Jar */}
        <div className="form-row">
          <div className="input-group flex-1">
            <label className="label">Category</label>
            <select
              className="select"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {type === 'expense' && (
            <div className="input-group flex-1">
              <label className="label">Spill to Jar 🏺</label>
              <select
                className="select"
                value={jarId || ''}
                onChange={(e) => setJarId(e.target.value)}
              >
                <option value="">No Specific Jar</option>
                {jars.map((j) => (
                  <option key={j.id} value={j.id}>{j.name} ({currency}{j.allocated})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Date */}
        <div className="input-group">
          <label className="label">Date</label>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Photo of Bill / Receipt Attachment */}
        <div className="input-group">
          <label className="label">📸 Photo of Bill / Receipt (Optional)</label>
          
          {receiptImage ? (
            <div className="receipt-preview-box">
              <img src={receiptImage} alt="Bill receipt" className="receipt-preview-img" />
              <button 
                type="button" 
                className="btn-icon btn-ghost btn-sm remove-receipt-btn"
                onClick={() => setReceiptImage(null)}
                title="Remove photo"
              >
                <Trash2 size={16} className="text-danger" />
              </button>
            </div>
          ) : (
            <label className="receipt-upload-dropzone">
              <Camera size={22} className="text-primary" />
              <span className="upload-text text-xs">
                Tap to Take Photo or Upload Bill Receipt
              </span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>

        {/* Notes */}
        <div className="input-group">
          <label className="label">Notes (Optional)</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Paid via UPI, Bill invoice #492"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Record {type === 'expense' ? 'Expense' : 'Income'}
          </button>
        </div>
      </form>

      <style>{`
        .tx-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .type-toggle-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.04);
          padding: 0.25rem;
          border-radius: var(--radius-sm);
        }

        .type-toggle-btn {
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-family: inherit;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .active-expense {
          background: var(--accent-danger);
          color: #ffffff;
        }

        .active-income {
          background: var(--accent-success);
          color: #ffffff;
        }

        .amount-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .currency-prefix {
          position: absolute;
          left: 1rem;
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-muted);
        }

        .amount-input {
          padding-left: 2.2rem !important;
          font-size: 1.25rem;
          font-weight: 800;
        }

        .form-row {
          display: flex;
          gap: 0.75rem;
        }

        .flex-1 {
          flex: 1;
        }

        .receipt-upload-dropzone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 1rem;
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.02);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .receipt-upload-dropzone:hover {
          border-color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.05);
        }

        .upload-text {
          font-weight: 600;
          color: var(--text-secondary);
        }

        .receipt-preview-box {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.5rem;
          background: rgba(0, 0, 0, 0.3);
          max-height: 180px;
          overflow: hidden;
        }

        .receipt-preview-img {
          max-height: 160px;
          max-width: 100%;
          border-radius: var(--radius-sm);
          object-fit: contain;
        }

        .remove-receipt-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(0, 0, 0, 0.6);
          border-radius: var(--radius-full);
        }

        .form-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
      `}</style>
    </Modal>
  );
};
