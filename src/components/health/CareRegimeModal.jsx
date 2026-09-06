import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Sun, 
  Sparkle, 
  Clock, 
  Calendar, 
  ListPlus,
  HelpCircle
} from 'lucide-react';
import { 
  FREQUENCY_OPTIONS, 
  normalizeCareRegime, 
  serializeCareRegime,
  getFrequencyMeta
} from '../../services/careProtocolUtils';

const REGIME_CONFIG = {
  skincare: {
    title: 'Edit Skin Care Regime',
    subtitle: 'Glow & Barrier Repair',
    icon: Sparkles,
    colorClass: 'bg-pink',
    accentColor: '#ec4899',
    pointPlaceholder: 'e.g. Cleanse with mild hydrating cleanser',
  },
  bodycare: {
    title: 'Edit Body Care Regime',
    subtitle: 'Smooth & Nourished Skin',
    icon: Sun,
    colorClass: 'bg-amber',
    accentColor: '#f59e0b',
    pointPlaceholder: 'e.g. Warm oil massage before bath on Sundays',
  },
  haircare: {
    title: 'Edit Hair Care Regime',
    subtitle: 'Length, Volume & Strength',
    icon: Sparkle,
    colorClass: 'bg-purple',
    accentColor: '#8b5cf6',
    pointPlaceholder: 'e.g. Hair pack with rosemary oil and scalp massage',
  },
};

export const CareRegimeModal = ({ 
  isOpen, 
  onClose, 
  regimeType = 'skincare', 
  regimeData = {}, 
  onSave 
}) => {
  const [routines, setRoutines] = useState([]);
  const [notes, setNotes] = useState('');

  const config = REGIME_CONFIG[regimeType] || REGIME_CONFIG.skincare;
  const IconComp = config.icon;

  useEffect(() => {
    if (isOpen) {
      const normalized = normalizeCareRegime(regimeData, regimeType);
      setRoutines(normalized.routines);
      setNotes(normalized.notes);
    }
  }, [isOpen, regimeData, regimeType]);

  // Routine block handlers
  const handleAddRoutine = () => {
    setRoutines(prev => [
      ...prev,
      {
        id: `routine-${Date.now()}`,
        frequency: 'two_days_once',
        frequencyLabel: 'Two Days Once',
        title: 'Alternate Days Routine',
        points: [''],
      }
    ]);
  };

  const handleRemoveRoutine = (indexToRemove) => {
    if (routines.length <= 1) {
      alert('At least one routine schedule must be kept.');
      return;
    }
    setRoutines(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFrequencyChange = (routineIndex, newFreq) => {
    const meta = getFrequencyMeta(newFreq);
    setRoutines(prev => prev.map((r, idx) => {
      if (idx !== routineIndex) return r;
      let defaultTitle = r.title;
      // Provide intelligent default titles when switching frequency if title is empty or standard
      if (!defaultTitle || defaultTitle.includes('Routine') || defaultTitle.includes('Schedule')) {
        if (newFreq === 'daily') defaultTitle = 'AM & PM Routine';
        else if (newFreq === 'sunday') defaultTitle = 'Sunday Routine';
        else if (newFreq === 'tue_fri') defaultTitle = 'Tuesday & Friday Routine';
        else if (newFreq === 'two_days_once') defaultTitle = 'Two Days Once Routine';
        else if (newFreq === 'two_weeks_once') defaultTitle = 'Bi-Weekly Cycle';
        else if (newFreq === 'weekly') defaultTitle = 'Weekly Routine';
      }
      return {
        ...r,
        frequency: newFreq,
        frequencyLabel: meta.label,
        title: defaultTitle,
      };
    }));
  };

  const handleTitleChange = (routineIndex, newTitle) => {
    setRoutines(prev => prev.map((r, idx) => 
      idx === routineIndex ? { ...r, title: newTitle } : r
    ));
  };

  // Points handlers for each routine
  const handlePointChange = (routineIndex, pointIndex, value) => {
    setRoutines(prev => prev.map((r, rIdx) => {
      if (rIdx !== routineIndex) return r;
      const updatedPoints = [...r.points];
      updatedPoints[pointIndex] = value;
      return { ...r, points: updatedPoints };
    }));
  };

  const handleAddPoint = (routineIndex) => {
    setRoutines(prev => prev.map((r, rIdx) => {
      if (rIdx !== routineIndex) return r;
      return { ...r, points: [...r.points, ''] };
    }));
  };

  const handleRemovePoint = (routineIndex, pointIndex) => {
    setRoutines(prev => prev.map((r, rIdx) => {
      if (rIdx !== routineIndex) return r;
      const updatedPoints = r.points.filter((_, pIdx) => pIdx !== pointIndex);
      return { ...r, points: updatedPoints.length > 0 ? updatedPoints : [''] };
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const serialized = serializeCareRegime(routines, notes, regimeType);
    if (onSave) {
      onSave(serialized);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="care-modal-title-wrap">
          <div className={`regime-icon-wrap ${config.colorClass}`} style={{ width: 28, height: 28 }}>
            <IconComp size={16} />
          </div>
          <div>
            <span className="care-modal-main-title">{config.title}</span>
            <span className="care-modal-sub-title">{config.subtitle}</span>
          </div>
        </div>
      }
      maxWidth="650px"
    >
      <form onSubmit={handleSubmit} className="care-regime-form">
        <div className="care-form-intro">
          <span>Configure frequency schedules (Daily, Weekly, Two days once, etc.) and enter actions as bullet points.</span>
        </div>

        {/* List of Routine Blocks */}
        <div className="routines-blocks-list">
          {routines.map((routine, rIdx) => (
            <div key={routine.id || rIdx} className="routine-block-card">
              <div className="routine-block-header">
                <div className="routine-badge-tag">
                  <span className="routine-num">#{rIdx + 1}</span>
                  <span className="routine-freq-badge">{getFrequencyMeta(routine.frequency).label}</span>
                </div>
                {routines.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove-routine"
                    onClick={() => handleRemoveRoutine(rIdx)}
                    title="Remove this routine block"
                  >
                    <Trash2 size={13} />
                    <span>Remove Block</span>
                  </button>
                )}
              </div>

              {/* Frequency dropdown & Title inputs */}
              <div className="routine-meta-row">
                <div className="input-group flex-1">
                  <label className="label-sm">
                    <Clock size={12} />
                    <span>Frequency (Dropdown)</span>
                  </label>
                  <select
                    className="select select-sm"
                    value={routine.frequency || 'daily'}
                    onChange={(e) => handleFrequencyChange(rIdx, e.target.value)}
                  >
                    {FREQUENCY_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group flex-1">
                  <label className="label-sm">
                    <Calendar size={12} />
                    <span>Schedule / Target Label</span>
                  </label>
                  <input
                    type="text"
                    className="input input-sm"
                    placeholder="e.g. AM & PM, Sunday Routine"
                    value={routine.title}
                    onChange={(e) => handleTitleChange(rIdx, e.target.value)}
                  />
                </div>
              </div>

              {/* Routine Points List */}
              <div className="routine-points-section">
                <label className="label-sm">
                  <ListPlus size={12} />
                  <span>Routine Steps (Entered as Points)</span>
                </label>

                <div className="points-input-list">
                  {routine.points.map((pt, ptIdx) => (
                    <div key={ptIdx} className="point-input-row">
                      <span className="point-bullet-dot">•</span>
                      <input
                        type="text"
                        className="input point-text-input"
                        placeholder={config.pointPlaceholder}
                        value={pt}
                        onChange={(e) => handlePointChange(rIdx, ptIdx, e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn-remove-point"
                        onClick={() => handleRemovePoint(rIdx, ptIdx)}
                        title="Remove point"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-xs btn-add-point"
                  onClick={() => handleAddPoint(rIdx)}
                >
                  <Plus size={12} />
                  <span>Add Point</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Another Routine Schedule Block */}
        <div className="add-routine-block-bar">
          <button
            type="button"
            className="btn btn-secondary btn-sm btn-full-width"
            onClick={handleAddRoutine}
          >
            <Plus size={14} />
            <span>+ Add Another Frequency Schedule (e.g. Two days once, Weekly, etc.)</span>
          </button>
        </div>

        {/* Special Guidelines / Notes */}
        <div className="input-group">
          <label className="label">
            <span>💡 Special Guidelines / Notes</span>
          </label>
          <textarea
            className="textarea"
            rows={3}
            placeholder="e.g. Warm oil massage before bath; gentle circular motion for scrub."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Modal Actions */}
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" style={{ backgroundColor: config.accentColor, borderColor: config.accentColor }}>
            Save {config.title.replace('Edit ', '')}
          </button>
        </div>
      </form>

      <style>{`
        .care-modal-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .care-modal-main-title {
          font-weight: 700;
          font-size: 1.05rem;
          display: block;
        }
        .care-modal-sub-title {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .care-regime-form {
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
        }
        .care-form-intro {
          font-size: 0.78rem;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.03);
          border: 1px dashed var(--border-color);
          padding: 0.55rem 0.8rem;
          border-radius: var(--radius-sm);
        }
        .routines-blocks-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 52vh;
          overflow-y: auto;
          padding-right: 0.25rem;
        }
        .routine-block-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.95rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: border-color 0.2s;
        }
        .routine-block-card:hover {
          border-color: var(--border-focus);
        }
        .routine-block-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 0.45rem;
        }
        .routine-badge-tag {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .routine-num {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--accent-primary);
        }
        .routine-freq-badge {
          font-size: 0.72rem;
          font-weight: 700;
          background: rgba(99, 102, 241, 0.15);
          color: var(--accent-primary);
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-full);
        }
        .btn-remove-routine {
          background: transparent;
          border: none;
          color: var(--accent-danger);
          font-size: 0.72rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.2s;
          padding: 0.2rem 0.4rem;
          border-radius: var(--radius-sm);
        }
        .btn-remove-routine:hover {
          opacity: 1;
          background: rgba(239, 68, 68, 0.1);
        }
        .routine-meta-row {
          display: flex;
          gap: 0.75rem;
        }
        .label-sm {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-bottom: 0.25rem;
        }
        .select-sm, .input-sm {
          padding: 0.45rem 0.65rem;
          font-size: 0.82rem;
        }
        .routine-points-section {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }
        .points-input-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .point-input-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .point-bullet-dot {
          color: var(--accent-primary);
          font-size: 1.1rem;
          line-height: 1;
        }
        .point-text-input {
          flex: 1;
          padding: 0.45rem 0.65rem;
          font-size: 0.82rem;
        }
        .btn-remove-point {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.35rem;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        .btn-remove-point:hover {
          color: var(--accent-danger);
          background: rgba(239, 68, 68, 0.1);
        }
        .btn-add-point {
          align-self: flex-start;
          margin-top: 0.2rem;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.75rem;
        }
        .add-routine-block-bar {
          display: flex;
        }
        .btn-full-width {
          width: 100%;
          justify-content: center;
          border-style: dashed;
          gap: 0.4rem;
        }
      `}</style>
    </Modal>
  );
};
