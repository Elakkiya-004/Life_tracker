import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Film, Tv, Sparkles, Star, Tag } from 'lucide-react';

const TYPES = ['FILM', 'TV', 'SPC'];
const IMPORTANCE_LEVELS = [
  'Essential for Doomsday',
  'Recommended for Doomsday',
  'Optional for Doomsday',
  'Unconfirmed for Doomsday',
];

export const WatchlistModal = ({ isOpen, onClose, listId = 'list-mcu-doomsday' }) => {
  const { addListItem } = useApp();

  const [title, setTitle] = useState('');
  const [type, setType] = useState('FILM');
  const [category, setCategory] = useState('Phase 6 — Doomsday');
  const [importance, setImportance] = useState('Essential for Doomsday');
  const [rating, setRating] = useState('7.5');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addListItem(listId, {
      title: title.trim(),
      type,
      category: category.trim() || 'General',
      importance,
      rating: rating.trim() || '7.0',
      notes: notes.trim(),
    });

    setTitle('');
    setNotes('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Title to Watchlist / List"
      maxWidth="500px"
    >
      <form onSubmit={handleSubmit} className="watchlist-modal-form">
        <div className="input-group">
          <label className="label">Title / Name *</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Avengers: Secret Wars"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="form-row">
          <div className="input-group flex-1">
            <label className="label">Type</label>
            <select
              className="select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {TYPES.map(t => (
                <option key={t} value={t}>{t === 'FILM' ? '🎬 FILM' : t === 'TV' ? '📺 TV Series' : '✨ Special / Post-Credit'}</option>
              ))}
            </select>
          </div>

          <div className="input-group flex-1">
            <label className="label">Rating (★)</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. 7.8"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
          </div>
        </div>

        <div className="input-group">
          <label className="label">Phase / Category</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Phase 6 — Doomsday, Legacy, etc."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="label">Importance / Priority</label>
          <select
            className="select"
            value={importance}
            onChange={(e) => setImportance(e.target.value)}
          >
            {IMPORTANCE_LEVELS.map(lvl => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="label">Viewing Advice & Notes</label>
          <textarea
            className="textarea"
            placeholder="e.g. Watch mid-credits scene, connects to..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Add to List
          </button>
        </div>
      </form>

      <style>{`
        .watchlist-modal-form {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .form-row {
          display: flex;
          gap: 0.75rem;
        }

        .flex-1 {
          flex: 1;
        }

        .form-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.75rem;
        }
      `}</style>
    </Modal>
  );
};
