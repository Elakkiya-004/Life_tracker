import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Calendar, FastForward, RefreshCw, ArrowLeftRight, Check, Sparkles, AlertCircle, Clock } from 'lucide-react';

export const DateAdjustModal = ({ isOpen, onClose }) => {
  const { 
    roadmap, 
    recalculateAllDates, 
    shiftDatesFromDay, 
    swapDayDates, 
    defaultPlanStartDate,
    totalPlanDays 
  } = useApp();

  const [activeTab, setActiveTab] = useState('cascade'); // 'cascade' | 'shift' | 'swap' | 'reset'
  
  // Cascade Start Date
  const currentFirstDate = roadmap && roadmap[0] ? roadmap[0].date : defaultPlanStartDate;
  const currentLastDate = roadmap && roadmap[roadmap.length - 1] ? roadmap[roadmap.length - 1].date : '';
  const [newStartDate, setNewStartDate] = useState(currentFirstDate || '2026-10-27');
  
  // Shift From Day
  const [shiftFromDay, setShiftFromDay] = useState(1);
  const [shiftDelta, setShiftDelta] = useState(1); // days to shift forward (+) or backward (-)

  // Swap Days
  const [swapDayA, setSwapDayA] = useState(1);
  const [swapDayB, setSwapDayB] = useState(2);

  const [successMsg, setSuccessMsg] = useState('');

  const flashSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  const handleApplyCascade = (e) => {
    e.preventDefault();
    if (!newStartDate) return;
    recalculateAllDates(newStartDate);
    flashSuccess(`All ${totalPlanDays} days rescheduled starting from ${newStartDate}!`);
  };

  const handleApplyShift = (e) => {
    e.preventDefault();
    const dayNum = Number(shiftFromDay);
    const delta = Number(shiftDelta);
    if (!dayNum || !delta) return;
    shiftDatesFromDay(dayNum, delta);
    flashSuccess(`Shifted Day ${dayNum} to Day ${roadmap.length} by ${delta > 0 ? '+' : ''}${delta} day(s)!`);
  };

  const handleApplySwap = (e) => {
    e.preventDefault();
    const day1 = Number(swapDayA);
    const day2 = Number(swapDayB);
    if (day1 === day2) return;
    const targetA = roadmap.find(d => d.day === day1);
    const targetB = roadmap.find(d => d.day === day2);
    if (!targetA || !targetB) return;
    swapDayDates(targetA.id, targetB.id);
    flashSuccess(`Swapped dates between Day ${day1} (${targetA.date}) and Day ${day2} (${targetB.date})!`);
  };

  const handleResetDefaultDates = () => {
    if (window.confirm(`Reset all 120 days back to standard schedule starting from ${defaultPlanStartDate}?`)) {
      recalculateAllDates(defaultPlanStartDate);
      flashSuccess('Dates reset back to default syllabus schedule!');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🗓️ Adjust & Switch Plan Dates" maxWidth="600px">
      <div className="date-adjust-modal-body">
        {/* Modal Navigation Tabs */}
        <div className="date-adjust-tabs">
          <button 
            type="button"
            className={`date-tab-btn ${activeTab === 'cascade' ? 'active' : ''}`}
            onClick={() => setActiveTab('cascade')}
          >
            <Calendar size={15} />
            <span>Switch Start Date</span>
          </button>

          <button 
            type="button"
            className={`date-tab-btn ${activeTab === 'shift' ? 'active' : ''}`}
            onClick={() => setActiveTab('shift')}
          >
            <FastForward size={15} />
            <span>Shift / Buffer Days</span>
          </button>

          <button 
            type="button"
            className={`date-tab-btn ${activeTab === 'swap' ? 'active' : ''}`}
            onClick={() => setActiveTab('swap')}
          >
            <ArrowLeftRight size={15} />
            <span>Swap Dates</span>
          </button>

          <button 
            type="button"
            className={`date-tab-btn ${activeTab === 'reset' ? 'active' : ''}`}
            onClick={() => setActiveTab('reset')}
          >
            <RefreshCw size={15} />
            <span>Reset</span>
          </button>
        </div>

        {/* Current Schedule Summary Badge */}
        <div className="current-schedule-badge">
          <div className="schedule-badge-item">
            <span className="badge-label">Start (Day 1)</span>
            <span className="badge-value">{roadmap?.[0]?.date || defaultPlanStartDate}</span>
          </div>
          <span className="schedule-arrow">➔</span>
          <div className="schedule-badge-item">
            <span className="badge-label">Finish (Day 120)</span>
            <span className="badge-value">{currentLastDate || '2027-02-23'}</span>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="date-success-alert">
            <Check size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: SWITCH START DATE & CASCADE ALL 120 DAYS */}
        {activeTab === 'cascade' && (
          <form onSubmit={handleApplyCascade} className="adjust-form">
            <div className="adjust-explainer">
              <Sparkles size={16} className="text-cyan" />
              <span>
                Pick any start date. All 120 days will automatically recalculate sequentially without gaps!
              </span>
            </div>

            <div className="form-group">
              <label className="form-label font-bold">New Plan Start Date (Day 1)</label>
              <div className="input-with-quick-buttons">
                <input 
                  type="date"
                  className="form-input date-input-large"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  required
                />
                <div className="quick-date-pills">
                  <button 
                    type="button" 
                    className="btn btn-ghost btn-xs date-quick-pill"
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setNewStartDate(today);
                    }}
                  >
                    Today
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-ghost btn-xs date-quick-pill"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      setNewStartDate(d.toISOString().split('T')[0]);
                    }}
                  >
                    Tomorrow
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-ghost btn-xs date-quick-pill"
                    onClick={() => {
                      // Next Monday
                      const d = new Date();
                      const day = d.getDay();
                      const diff = d.getDate() + (day === 0 ? 1 : 8 - day);
                      d.setDate(diff);
                      setNewStartDate(d.toISOString().split('T')[0]);
                    }}
                  >
                    Next Monday
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-ghost btn-xs date-quick-pill"
                    onClick={() => setNewStartDate(defaultPlanStartDate)}
                  >
                    Excel Default (Oct 27)
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-actions-bar">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Calendar size={16} />
                <span>Cascade All 120 Days</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: SHIFT SCHEDULE FROM DAY X (BUFFER / MISSED DAYS) */}
        {activeTab === 'shift' && (
          <form onSubmit={handleApplyShift} className="adjust-form">
            <div className="adjust-explainer">
              <Clock size={16} className="text-amber-400" />
              <span>
                Missed a study day or need a buffer? Shift remaining days forward so your schedule stays realistic!
              </span>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label font-bold">Shift From Day Number</label>
                <div className="day-select-wrapper">
                  <select 
                    className="form-select"
                    value={shiftFromDay}
                    onChange={(e) => setShiftFromDay(Number(e.target.value))}
                  >
                    {(roadmap || []).map((d) => (
                      <option key={d.id} value={d.day}>
                        Day {d.day} — {d.mainTopic ? d.mainTopic.substring(0, 24) : `Day ${d.day}`} ({d.date})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label font-bold">Shift Amount</label>
                <div className="shift-buttons-grid">
                  <button
                    type="button"
                    className={`shift-chip ${shiftDelta === 1 ? 'active' : ''}`}
                    onClick={() => setShiftDelta(1)}
                  >
                    +1 Day (Buffer)
                  </button>
                  <button
                    type="button"
                    className={`shift-chip ${shiftDelta === 2 ? 'active' : ''}`}
                    onClick={() => setShiftDelta(2)}
                  >
                    +2 Days
                  </button>
                  <button
                    type="button"
                    className={`shift-chip ${shiftDelta === 7 ? 'active' : ''}`}
                    onClick={() => setShiftDelta(7)}
                  >
                    +1 Week (+7)
                  </button>
                  <button
                    type="button"
                    className={`shift-chip ${shiftDelta === -1 ? 'active' : ''}`}
                    onClick={() => setShiftDelta(-1)}
                  >
                    -1 Day
                  </button>
                </div>
              </div>
            </div>

            <div className="shift-preview-note">
              <span>
                💡 Days <strong>1 to {shiftFromDay - 1}</strong> will remain unchanged. Days <strong>{shiftFromDay} to {roadmap?.length || 120}</strong> will move {shiftDelta > 0 ? `forward by +${shiftDelta}` : `backward by ${shiftDelta}`} day(s).
              </span>
            </div>

            <div className="modal-actions-bar">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <FastForward size={16} />
                <span>Apply Schedule Shift</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: SWAP DATES BETWEEN TWO DAYS */}
        {activeTab === 'swap' && (
          <form onSubmit={handleApplySwap} className="adjust-form">
            <div className="adjust-explainer">
              <ArrowLeftRight size={16} className="text-purple-400" />
              <span>
                Want to study a topic earlier or later? Swap the dates between any two days.
              </span>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label font-bold">First Day</label>
                <select 
                  className="form-select"
                  value={swapDayA}
                  onChange={(e) => setSwapDayA(Number(e.target.value))}
                >
                  {(roadmap || []).map((d) => (
                    <option key={d.id} value={d.day}>
                      Day {d.day}: {d.mainTopic ? d.mainTopic.substring(0, 20) : ''} ({d.date})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label font-bold">Second Day</label>
                <select 
                  className="form-select"
                  value={swapDayB}
                  onChange={(e) => setSwapDayB(Number(e.target.value))}
                >
                  {(roadmap || []).map((d) => (
                    <option key={d.id} value={d.day}>
                      Day {d.day}: {d.mainTopic ? d.mainTopic.substring(0, 20) : ''} ({d.date})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-actions-bar">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={swapDayA === swapDayB}>
                <ArrowLeftRight size={16} />
                <span>Swap Day Dates</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: RESET DATES */}
        {activeTab === 'reset' && (
          <div className="adjust-form">
            <div className="reset-warning-card">
              <AlertCircle size={24} className="text-amber-400" />
              <div>
                <h4 className="font-bold text-sm">Reset All Dates to Excel Template</h4>
                <p className="text-xs text-sub mt-1">
                  This will reset the schedule so Day 1 starts on <strong>{defaultPlanStartDate}</strong> and ends on <strong>2027-02-23</strong>. Your completed tasks, study minutes, notes, and progress will stay 100% intact!
                </p>
              </div>
            </div>

            <div className="modal-actions-bar mt-4">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleResetDefaultDates}>
                <RefreshCw size={15} />
                <span>Reset Dates to Default</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .date-adjust-modal-body {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .date-adjust-tabs {
          display: flex;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.35rem;
          gap: 0.35rem;
          overflow-x: auto;
        }

        .date-tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          padding: 0.6rem 0.85rem;
          border-radius: var(--radius-sm);
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .date-tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .date-tab-btn.active {
          background: var(--accent-primary);
          color: #ffffff;
          box-shadow: 0 4px 12px var(--accent-primary-glow);
        }

        .current-schedule-badge {
          display: flex;
          align-items: center;
          justify-content: space-around;
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: var(--radius-md);
          padding: 0.75rem 1rem;
        }

        .schedule-badge-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
        }

        .badge-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .badge-value {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--accent-primary);
          font-family: monospace;
        }

        .schedule-arrow {
          font-size: 1.1rem;
          color: var(--text-muted);
        }

        .date-success-alert {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem 1rem;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #10b981;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.85rem;
          animation: fadeIn 0.2s ease;
        }

        .adjust-explainer {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.45;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.75rem 0.9rem;
          margin-bottom: 1rem;
        }

        .adjust-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .adjust-form .form-group {
          margin-bottom: 0;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          width: 100%;
        }

        .date-input-large {
          font-size: 1.05rem;
          font-weight: 700;
          padding: 0.65rem 0.85rem;
          color-scheme: dark;
        }

        .input-with-quick-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .quick-date-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .date-quick-pill {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          padding: 0.25rem 0.65rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .date-quick-pill:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.12);
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 540px) {
          .form-row-2 {
            grid-template-columns: 1fr 1fr;
          }
        }

        .shift-buttons-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .shift-chip {
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-secondary);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .shift-chip:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.08);
        }

        .shift-chip.active {
          background: rgba(99, 102, 241, 0.2);
          border-color: var(--accent-primary);
          color: #a5b4fc;
          font-weight: 700;
        }

        .shift-preview-note {
          font-size: 0.75rem;
          color: var(--text-muted);
          background: rgba(0, 0, 0, 0.2);
          padding: 0.6rem 0.8rem;
          border-radius: var(--radius-sm);
          line-height: 1.4;
        }

        .reset-warning-card {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.25);
          padding: 1rem;
          border-radius: var(--radius-md);
        }

        .modal-actions-bar {
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
