import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Code2, Layers, Smartphone, FolderGit2, Briefcase, Coffee } from 'lucide-react';

const MONTHS = ['September', 'October', 'November', 'December', 'Custom'];

export const RoadmapModal = ({ isOpen, onClose, weekToEdit = null }) => {
  const { addRoadmapWeek, updateRoadmapWeek } = useApp();

  const [period, setPeriod] = useState('');
  const [month, setMonth] = useState('September');
  const [dateRange, setDateRange] = useState('');
  const [dsa, setDsa] = useState('');
  const [fullstack, setFullstack] = useState('');
  const [mobile, setMobile] = useState('');
  const [project, setProject] = useState('');
  const [career, setCareer] = useState('');
  const [isLightWeek, setIsLightWeek] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (weekToEdit) {
      setPeriod(weekToEdit.period || '');
      setMonth(weekToEdit.month || 'September');
      setDateRange(weekToEdit.dateRange || '');
      setDsa(weekToEdit.dsa || '');
      setFullstack(weekToEdit.fullstack || '');
      setMobile(weekToEdit.mobile || '');
      setProject(weekToEdit.project || '');
      setCareer(weekToEdit.career || '');
      setIsLightWeek(!!weekToEdit.isLightWeek);
      setNotes(weekToEdit.notes || '');
    } else {
      setPeriod('');
      setMonth('September');
      setDateRange('');
      setDsa('');
      setFullstack('');
      setMobile('');
      setProject('');
      setCareer('');
      setIsLightWeek(false);
      setNotes('');
    }
  }, [weekToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!period.trim()) return;

    const payload = {
      period: period.trim(),
      month,
      dateRange: dateRange.trim() || 'Flexible Dates',
      dsa: dsa.trim() || 'General DSA practice',
      fullstack: fullstack.trim() || 'Full-stack building',
      mobile: mobile.trim() || 'React Native development',
      project: project.trim() || 'Project feature development',
      career: career.trim() || 'Career & Interview practice',
      isLightWeek,
      notes: notes.trim(),
    };

    if (weekToEdit) {
      updateRoadmapWeek(weekToEdit.id, payload);
    } else {
      addRoadmapWeek(payload);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={weekToEdit ? `Edit Milestone (${weekToEdit.period})` : 'Add New Roadmap Milestone / Week'}
      maxWidth="580px"
    >
      <form onSubmit={handleSubmit} className="roadmap-modal-form">
        <div className="form-row">
          <div className="input-group flex-1">
            <label className="label">Period / Label *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Sep W5 or Bonus Sprint"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="input-group flex-1">
            <label className="label">Month</label>
            <select
              className="select"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              {MONTHS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="input-group">
          <label className="label">Date Range</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Sep 28 - Oct 4"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          />
        </div>

        {/* 5 Focus Tracks */}
        <div className="input-group">
          <label className="label track-label dsa">
            <Code2 size={13} />
            <span>DSA Focus</span>
          </label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Tries, Segment trees, LeetCode 75"
            value={dsa}
            onChange={(e) => setDsa(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="label track-label fullstack">
            <Layers size={13} />
            <span>Full Stack Focus</span>
          </label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Next.js 14, Server Actions, Redis caching"
            value={fullstack}
            onChange={(e) => setFullstack(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="label track-label mobile">
            <Smartphone size={13} />
            <span>React Native Focus</span>
          </label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Expo Camera, Reanimated 3, Push notifications"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="label track-label project">
            <FolderGit2 size={13} />
            <span>Project / Practical Output</span>
          </label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Real-time chat module with WebSockets"
            value={project}
            onChange={(e) => setProject(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="label track-label career">
            <Briefcase size={13} />
            <span>Career / Interview Prep</span>
          </label>
          <input
            type="text"
            className="input"
            placeholder="e.g. System design mock interview round"
            value={career}
            onChange={(e) => setCareer(e.target.value)}
          />
        </div>

        {/* Rest / Buffer Week Option */}
        <div className="rest-week-toggle-row">
          <label className="rest-checkbox-label">
            <input
              type="checkbox"
              checked={isLightWeek}
              onChange={(e) => setIsLightWeek(e.target.checked)}
            />
            <div className="rest-label-text">
              <Coffee size={15} className="text-amber-400" />
              <span>Mark as Buffer / Relaxing Week (Lighter pace)</span>
            </div>
          </label>
        </div>

        {/* Notes */}
        <div className="input-group">
          <label className="label">Study Links & Notes</label>
          <textarea
            className="textarea"
            placeholder="Add any helpful study URLs, LeetCode list links, or reminders..."
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
            {weekToEdit ? 'Save Changes' : 'Add Milestone'}
          </button>
        </div>
      </form>

      <style>{`
        .roadmap-modal-form {
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

        .track-label {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 700;
        }

        .track-label.dsa { color: #0ea5e9; }
        .track-label.fullstack { color: #6366f1; }
        .track-label.mobile { color: #10b981; }
        .track-label.project { color: #f59e0b; }
        .track-label.career { color: #ec4899; }

        .rest-week-toggle-row {
          padding: 0.6rem 0.85rem;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: var(--radius-sm);
          margin-bottom: 0.5rem;
        }

        .rest-checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          cursor: pointer;
        }

        .rest-label-text {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-primary);
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
