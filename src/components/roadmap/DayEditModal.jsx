import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, 
  Clock, 
  Star, 
  Code2, 
  Brain, 
  FolderGit2, 
  BookOpen, 
  CheckCircle2, 
  Coffee, 
  AlertTriangle, 
  ArrowRight,
  ExternalLink,
  Save
} from 'lucide-react';

export const DayEditModal = ({ isOpen, onClose, dayToEdit }) => {
  const { updateDayPlan, shiftDatesFromDay } = useApp();

  const [date, setDate] = useState('');
  const [cascadeFromThisDay, setCascadeFromThisDay] = useState(false);
  const [status, setStatus] = useState('Study'); // 'Study' | 'Rest'
  const [completion, setCompletion] = useState('Pending'); // 'Done' | 'Partial' | 'Skipped' | 'Pending' | 'Rest'
  const [actualMinutes, setActualMinutes] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [mainTopic, setMainTopic] = useState('');
  const [concepts, setConcepts] = useState('');
  const [exercise, setExercise] = useState('');
  const [dsa, setDsa] = useState('');
  const [dsaResult, setDsaResult] = useState('');
  const [projectTask, setProjectTask] = useState('');
  const [projectOutput, setProjectOutput] = useState('');
  const [resource, setResource] = useState('');
  const [mistakesBlockers, setMistakesBlockers] = useState('');
  const [tomorrowsTask, setTomorrowsTask] = useState('');
  const [completedTasks, setCompletedTasks] = useState([]);

  useEffect(() => {
    if (dayToEdit) {
      setDate(dayToEdit.date || '');
      setCascadeFromThisDay(false);
      setStatus(dayToEdit.status === 'Rest' ? 'Rest' : (dayToEdit.planStatus === 'Rest' ? 'Rest' : 'Study'));
      setCompletion(dayToEdit.completion || (dayToEdit.status === 'Completed' ? 'Done' : 'Pending'));
      setActualMinutes(Number(dayToEdit.actualMinutes) || 0);
      setConfidence(Number(dayToEdit.confidence) || 0);
      setMainTopic(dayToEdit.mainTopic || '');
      setConcepts(dayToEdit.concepts || '');
      setExercise(dayToEdit.exercise || '');
      setDsa(dayToEdit.dsa || '');
      setDsaResult(dayToEdit.dsaResult || '');
      setProjectTask(dayToEdit.projectTask || '');
      setProjectOutput(dayToEdit.projectOutput || '');
      setResource(dayToEdit.resource || '');
      setMistakesBlockers(dayToEdit.mistakesBlockers || dayToEdit.notes || '');
      setTomorrowsTask(dayToEdit.tomorrowsTask || '');
      setCompletedTasks(Array.isArray(dayToEdit.completedTasks) ? dayToEdit.completedTasks : []);
    }
  }, [dayToEdit, isOpen]);

  if (!dayToEdit) return null;

  const toggleChecklist = (item) => {
    setCompletedTasks(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const addMinutes = (mins) => {
    setActualMinutes(prev => Math.max(0, (Number(prev) || 0) + mins));
  };

  const handleQuickDateShift = (deltaDays) => {
    if (!date) return;
    const [y, m, d] = date.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d + deltaDays));
    setDate(dt.toISOString().split('T')[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isComplete = completion === 'Done' || completedTasks.length >= 4;

    const payload = {
      date,
      status: status === 'Rest' ? 'Rest' : (isComplete ? 'Completed' : (completedTasks.length > 0 || actualMinutes > 0 ? 'In Progress' : 'Not Started')),
      planStatus: status,
      completion: status === 'Rest' ? 'Rest' : completion,
      actualMinutes: Number(actualMinutes) || 0,
      confidence: Number(confidence) || 0,
      mainTopic: mainTopic.trim(),
      concepts: concepts.trim(),
      exercise: exercise.trim(),
      dsa: dsa.trim(),
      dsaResult: dsaResult.trim(),
      projectTask: projectTask.trim(),
      projectOutput: projectOutput.trim(),
      resource: resource.trim(),
      notes: mistakesBlockers.trim(),
      mistakesBlockers: mistakesBlockers.trim(),
      tomorrowsTask: tomorrowsTask.trim(),
      completedTasks,
      fullstack: (mainTopic.trim() ? mainTopic.trim() + ': ' : '') + concepts.trim(),
      mobile: exercise.trim(),
      project: projectTask.trim(),
      career: concepts.trim() || exercise.trim()
    };

    updateDayPlan(dayToEdit.id, payload);

    // If user asked to cascade future days from this new date
    if (cascadeFromThisDay && date !== dayToEdit.date) {
      const oldTime = new Date(dayToEdit.date).getTime();
      const newTime = new Date(date).getTime();
      const diffDays = Math.round((newTime - oldTime) / (1000 * 60 * 60 * 24));
      if (diffDays !== 0) {
        shiftDatesFromDay(dayToEdit.day + 1, diffDays);
      }
    }

    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Day ${dayToEdit.day} • ${dayToEdit.cycle || 'Mastery Plan'}`}
      maxWidth="720px"
    >
      <form onSubmit={handleSubmit} className="day-edit-form">
        {/* Top Header Card: Date Switcher & Status */}
        <div className="day-header-edit-card">
          <div className="day-date-group">
            <label className="form-label font-bold flex items-center gap-1.5">
              <Calendar size={15} className="text-cyan" />
              <span>Assigned Date</span>
            </label>
            <div className="date-input-row">
              <input 
                type="date"
                className="form-input date-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <div className="quick-shift-btns">
                <button 
                  type="button" 
                  className="btn btn-ghost btn-xs shift-btn"
                  onClick={() => handleQuickDateShift(-1)}
                  title="Shift 1 day back"
                >
                  -1d
                </button>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-xs shift-btn"
                  onClick={() => handleQuickDateShift(1)}
                  title="Shift 1 day forward"
                >
                  +1d
                </button>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-xs shift-btn"
                  onClick={() => handleQuickDateShift(7)}
                  title="Shift 1 week forward"
                >
                  +1w
                </button>
              </div>
            </div>

            {date !== dayToEdit.date && (
              <label className="cascade-future-checkbox">
                <input 
                  type="checkbox"
                  checked={cascadeFromThisDay}
                  onChange={(e) => setCascadeFromThisDay(e.target.checked)}
                />
                <span>Cascade all future days from Day {dayToEdit.day + 1} onward?</span>
              </label>
            )}
          </div>

          <div className="day-status-toggles">
            <label className="form-label font-bold">Plan Mode</label>
            <div className="mode-toggle-group">
              <button
                type="button"
                className={`mode-btn ${status === 'Study' ? 'active study' : ''}`}
                onClick={() => setStatus('Study')}
              >
                <Code2 size={14} />
                <span>Study Day</span>
              </button>
              <button
                type="button"
                className={`mode-btn ${status === 'Rest' ? 'active rest' : ''}`}
                onClick={() => {
                  setStatus('Rest');
                  setCompletion('Rest');
                }}
              >
                <Coffee size={14} />
                <span>Rest Day</span>
              </button>
            </div>
          </div>
        </div>

        {/* Execution Log: Minutes & Confidence & Completion */}
        <div className="execution-log-grid card">
          <div className="form-group">
            <label className="form-label font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock size={15} className="text-emerald-400" />
                <span>Minutes Studied</span>
              </span>
              <span className="text-sub font-mono text-xs">{(actualMinutes / 60).toFixed(1)} hrs</span>
            </label>
            <div className="minutes-input-wrapper">
              <input 
                type="number"
                min="0"
                step="5"
                className="form-input minutes-number-input"
                value={actualMinutes}
                onChange={(e) => setActualMinutes(Math.max(0, Number(e.target.value) || 0))}
              />
              <div className="quick-min-buttons">
                <button type="button" className="btn btn-ghost btn-xs min-pill" onClick={() => addMinutes(15)}>+15m</button>
                <button type="button" className="btn btn-ghost btn-xs min-pill" onClick={() => addMinutes(30)}>+30m</button>
                <button type="button" className="btn btn-ghost btn-xs min-pill" onClick={() => addMinutes(60)}>+1h</button>
                <button type="button" className="btn btn-ghost btn-xs min-pill" onClick={() => addMinutes(120)}>+2h</button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label font-bold flex items-center gap-1.5">
              <Star size={15} className="text-amber-400" />
              <span>Confidence Rating</span>
            </label>
            <div className="confidence-stars-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${confidence >= star ? 'active' : ''}`}
                  onClick={() => setConfidence(star === confidence ? 0 : star)}
                  title={`Confidence ${star}/5`}
                >
                  ★
                </button>
              ))}
              <span className="confidence-label text-xs text-sub">
                {confidence === 5 ? 'Mastered' : confidence === 4 ? 'Confident' : confidence === 3 ? 'Solid' : confidence === 2 ? 'Shaky' : confidence === 1 ? 'Needs review' : 'Unrated'}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label font-bold flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-indigo-400" />
              <span>Completion Status</span>
            </label>
            <select 
              className="form-select"
              value={completion}
              onChange={(e) => setCompletion(e.target.value)}
            >
              <option value="Pending">Pending / Not Started</option>
              <option value="Done">Done (Completed)</option>
              <option value="Partial">Partial</option>
              <option value="Skipped">Skipped</option>
              <option value="Rest">Rest Day</option>
            </select>
          </div>
        </div>

        {/* Study Checklist */}
        <div className="checklist-box card">
          <label className="form-label font-bold flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-cyan" />
            <span>Study Session Checklist (Click to toggle)</span>
          </label>
          <div className="checklist-chips-row">
            {['Learn', 'Code', 'DSA/Project', 'Recall'].map((item) => {
              const isChecked = completedTasks.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  className={`checklist-chip ${isChecked ? 'checked' : ''}`}
                  onClick={() => toggleChecklist(item)}
                >
                  <span className={`chip-box ${isChecked ? 'on' : ''}`}>
                    {isChecked ? '✓' : ''}
                  </span>
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Details: Topic, Concepts, Acceptance Criteria */}
        <div className="form-group">
          <label className="form-label font-bold flex items-center gap-1.5">
            <BookOpen size={15} className="text-cyan" />
            <span>Main Topic</span>
          </label>
          <input 
            type="text"
            className="form-input"
            value={mainTopic}
            onChange={(e) => setMainTopic(e.target.value)}
            placeholder="e.g. JavaScript foundations"
          />
        </div>

        <div className="form-group">
          <label className="form-label font-bold flex items-center gap-1.5">
            <BookOpen size={15} className="text-indigo-400" />
            <span>Concepts to Learn</span>
          </label>
          <textarea 
            className="form-textarea"
            rows={2}
            value={concepts}
            onChange={(e) => setConcepts(e.target.value)}
            placeholder="e.g. Variables, let/const/var, primitive types, typeof"
          />
        </div>

        <div className="form-group">
          <label className="form-label font-bold flex items-center gap-1.5">
            <Code2 size={15} className="text-emerald-400" />
            <span>Specific Exercise / Acceptance Criteria</span>
          </label>
          <textarea 
            className="form-textarea"
            rows={2}
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            placeholder="e.g. Write 8 variables; predict output; explain reassignment vs mutation."
          />
        </div>

        {/* DSA & Project Tasks */}
        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label font-bold flex items-center gap-1.5">
              <Brain size={15} className="text-purple-400" />
              <span>DSA Practice Problem</span>
            </label>
            <input 
              type="text"
              className="form-input"
              value={dsa}
              onChange={(e) => setDsa(e.target.value)}
              placeholder="e.g. Largest of 3 numbers; even/odd"
            />
          </div>

          <div className="form-group">
            <label className="form-label font-bold flex items-center gap-1.5">
              <FolderGit2 size={15} className="text-amber-400" />
              <span>Project Task</span>
            </label>
            <input 
              type="text"
              className="form-input"
              value={projectTask}
              onChange={(e) => setProjectTask(e.target.value)}
              placeholder="e.g. Create repo, index.html, style.css, app.js"
            />
          </div>
        </div>

        {/* Detailed Logs: Blockers, Tomorrow's Task, Resource */}
        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label font-bold flex items-center gap-1.5">
              <AlertTriangle size={15} className="text-rose-400" />
              <span>Mistakes / Blockers Log</span>
            </label>
            <textarea 
              className="form-textarea"
              rows={2}
              value={mistakesBlockers}
              onChange={(e) => setMistakesBlockers(e.target.value)}
              placeholder="What mistake did you make today? What was tricky?"
            />
          </div>

          <div className="form-group">
            <label className="form-label font-bold flex items-center gap-1.5">
              <ArrowRight size={15} className="text-cyan" />
              <span>Tomorrow's First Task</span>
            </label>
            <textarea 
              className="form-textarea"
              rows={2}
              value={tomorrowsTask}
              onChange={(e) => setTomorrowsTask(e.target.value)}
              placeholder="What is the first thing you will tackle tomorrow?"
            />
          </div>
        </div>

        {/* Resource link */}
        <div className="form-group">
          <label className="form-label font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ExternalLink size={15} className="text-cyan" />
              <span>Recommended Resource</span>
            </span>
            {resource && resource.startsWith('http') && (
              <a href={resource} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan flex items-center gap-1 hover:underline">
                <span>Open Resource</span>
                <ExternalLink size={12} />
              </a>
            )}
          </label>
          <input 
            type="text"
            className="form-input"
            value={resource}
            onChange={(e) => setResource(e.target.value)}
            placeholder="e.g. MDN JavaScript Guide or URL"
          />
        </div>

        {/* Modal Actions */}
        <div className="modal-actions-bar">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <Save size={16} />
            <span>Save Day {dayToEdit.day}</span>
          </button>
        </div>
      </form>

      <style>{`
        .day-edit-form {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }

        .day-edit-form .form-group {
          margin-bottom: 0;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          width: 100%;
        }

        .form-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .form-input {
          width: 100%;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.65rem 0.85rem;
          color: var(--text-primary);
          font-size: 0.88rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px var(--accent-primary-glow);
          background: rgba(15, 23, 42, 0.85);
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: var(--text-muted);
          opacity: 0.7;
        }

        .form-select {
          width: 100%;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.65rem 0.85rem;
          color: var(--text-primary);
          font-size: 0.88rem;
          font-family: inherit;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          box-sizing: border-box;
        }

        .form-select:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px var(--accent-primary-glow);
        }

        .form-select option {
          background: #111726;
          color: #F8FAFC;
        }

        .day-header-edit-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1rem;
        }

        @media (min-width: 600px) {
          .day-header-edit-card {
            flex-direction: row;
            align-items: flex-start;
            justify-content: space-between;
          }
        }

        .day-date-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .date-input-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .date-input {
          font-weight: 700;
          font-size: 0.95rem;
          max-width: 170px;
          color-scheme: dark;
        }

        .quick-shift-btns {
          display: flex;
          gap: 0.25rem;
        }

        .shift-btn {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-size: 0.72rem;
          padding: 0.35rem 0.55rem;
        }

        .shift-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .cascade-future-checkbox {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--accent-cyan);
          cursor: pointer;
          margin-top: 0.35rem;
        }

        .mode-toggle-group {
          display: flex;
          gap: 0.4rem;
        }

        .mode-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 0.85rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-secondary);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mode-btn.active.study {
          background: rgba(99, 102, 241, 0.2);
          border-color: var(--accent-primary);
          color: #a5b4fc;
        }

        .mode-btn.active.rest {
          background: rgba(245, 158, 11, 0.2);
          border-color: var(--accent-warning);
          color: #fde68a;
        }

        .execution-log-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1rem;
        }

        @media (min-width: 640px) {
          .execution-log-grid {
            grid-template-columns: 1fr 1fr 1fr;
          }
        }

        .minutes-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .minutes-number-input {
          font-weight: 800;
          font-size: 1.1rem;
          font-family: monospace;
        }

        .quick-min-buttons {
          display: flex;
          gap: 0.25rem;
        }

        .min-pill {
          flex: 1;
          font-size: 0.7rem;
          border: 1px solid var(--border-color);
          padding: 0.2rem;
          border-radius: 4px;
        }

        .confidence-stars-row {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-top: 0.4rem;
        }

        .star-btn {
          background: transparent;
          border: none;
          font-size: 1.5rem;
          color: rgba(255, 255, 255, 0.2);
          cursor: pointer;
          padding: 0 0.1rem;
          line-height: 1;
          transition: transform 0.15s ease, color 0.15s ease;
        }

        .star-btn:hover {
          transform: scale(1.2);
        }

        .star-btn.active {
          color: #f59e0b;
          text-shadow: 0 0 12px rgba(245, 158, 11, 0.5);
        }

        .checklist-box {
          background: rgba(99, 102, 241, 0.05);
          border: 1px dashed rgba(99, 102, 241, 0.3);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .checklist-chips-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .checklist-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 0.85rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-secondary);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .checklist-chip.checked {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.5);
          color: #34d399;
        }

        .chip-box {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1.5px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 800;
        }

        .chip-box.on {
          background: #10b981;
          border-color: #10b981;
          color: #ffffff;
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 600px) {
          .form-row-2 {
            grid-template-columns: 1fr 1fr;
          }
        }

        .form-textarea {
          width: 100%;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.65rem 0.85rem;
          color: var(--text-primary);
          font-size: 0.88rem;
          font-family: inherit;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
          box-sizing: border-box;
        }

        .form-textarea:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px var(--accent-primary-glow);
          background: rgba(15, 23, 42, 0.85);
        }

        .modal-actions-bar {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.5rem;
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
        }
      `}</style>
    </Modal>
  );
};
