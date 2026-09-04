import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ROADMAP_OUTCOMES } from '../services/roadmapData';
import { RoadmapModal } from '../components/roadmap/RoadmapModal';
import { 
  Compass, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Flame, 
  Calendar, 
  Coffee, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Trash2,
  Plus,
  RotateCcw,
  Award,
  Layers,
  Code2,
  Smartphone,
  FolderGit2,
  Briefcase
} from 'lucide-react';

export const RoadmapView = () => {
  const { 
    roadmap, 
    toggleRoadmapTask, 
    updateWeekStatus, 
    toggleLightWeek, 
    updateWeekNotes,
    deleteRoadmapWeek,
    resetRoadmapToDefault,
    roadmapCompletionPercent,
    totalCompletedRoadmapTasks,
    totalRoadmapTasks 
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState('All');
  const [expandedNotes, setExpandedNotes] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weekToEdit, setWeekToEdit] = useState(null);

  // Filter weeks by month
  const months = ['All', 'September', 'October', 'November', 'December'];
  const filteredWeeks = selectedMonth === 'All'
    ? roadmap
    : roadmap.filter(w => w.month === selectedMonth);

  // Calculate days left to Dec 31, 2026
  const targetDate = new Date('2026-12-31T23:59:59');
  const now = new Date();
  const diffTime = targetDate - now;
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const toggleNoteOpen = (weekId) => {
    setExpandedNotes(prev => ({ ...prev, [weekId]: !prev[weekId] }));
  };

  const handleCreate = () => {
    setWeekToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (week, e) => {
    e.stopPropagation();
    setWeekToEdit(week);
    setIsModalOpen(true);
  };

  const handleDelete = (week, e) => {
    e.stopPropagation();
    if (window.confirm(`Delete milestone "${week.period}"?`)) {
      deleteRoadmapWeek(week.id);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset Career Roadmap to the default 16-Week (Sep–Dec) syllabus?')) {
      resetRoadmapToDefault();
    }
  };

  return (
    <div className="roadmap-container">
      {/* Hero Header & Target Countdown */}
      <div className="roadmap-hero card">
        <div className="hero-content">
          <div className="hero-badge">
            <Compass size={16} />
            <span>CAREER ROADMAP • TARGET DEC 31, 2026</span>
          </div>
          <h2 className="hero-title">
            Full-Stack + Mobile + DSA Master Plan
          </h2>
          <p className="hero-desc text-sub">
            Structured roadmap with built-in <strong>buffer & rest days</strong> for busy schedules. Add custom weeks or edit anytime!
          </p>

          {/* Progress bar */}
          <div className="roadmap-overall-progress">
            <div className="progress-info-row">
              <span className="text-xs font-bold">Overall Progress: {roadmapCompletionPercent}%</span>
              <span className="text-xs text-sub">{totalCompletedRoadmapTasks}/{totalRoadmapTasks} Tasks Completed</span>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill"
                style={{ width: `${roadmapCompletionPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="countdown-pill">
          <span className="countdown-val">{daysRemaining}</span>
          <span className="countdown-label">Days to Dec 31</span>
        </div>
      </div>

      {/* Flexible Buffer / Rest Strategy Alert */}
      <div className="flexible-schedule-alert card">
        <div className="alert-icon-box">
          <Coffee size={20} className="text-amber-400" />
        </div>
        <div className="alert-text-content">
          <h4 className="alert-title">🧘 Flexible Schedule & Rest Days Protocol</h4>
          <p className="alert-desc text-xs text-sub">
            Aim for <strong>4 Core Study Days + 1 Project Day + 2 Buffer/Relaxing Days</strong> each week. Having a busy work week? Tap <strong>"🏖️ Rest/Buffer Mode"</strong> on any week to adjust pace guilt-free!
          </p>
        </div>
      </div>

      {/* Controls: Month Filters + Add Milestone CTA */}
      <div className="roadmap-controls-row">
        <div className="month-tabs-scroll">
          {months.map((m) => (
            <button
              key={m}
              className={`month-tab-btn ${selectedMonth === m ? 'active' : ''}`}
              onClick={() => setSelectedMonth(m)}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="roadmap-actions-group">
          <button 
            className="btn btn-ghost btn-sm text-sub"
            onClick={handleReset}
            title="Reset to original 16-week syllabus"
          >
            <RotateCcw size={14} />
            <span>Reset Syllabus</span>
          </button>

          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={16} />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* Roadmap Weeks Cards */}
      {filteredWeeks.length === 0 ? (
        <div className="card empty-weeks">
          <Compass size={36} className="text-muted" />
          <p className="text-sub">No milestones found under "{selectedMonth}".</p>
          <button className="btn btn-primary" onClick={handleCreate}>
            + Add Milestone for {selectedMonth}
          </button>
        </div>
      ) : (
        <div className="weeks-list">
          {filteredWeeks.map((week) => {
            const completedCount = week.completedTasks?.length || 0;
            const isAllCompleted = completedCount === 5;
            const isNotesOpen = !!expandedNotes[week.id];

            return (
              <div 
                key={week.id} 
                className={`week-card card ${week.isLightWeek ? 'light-week-card' : ''} ${isAllCompleted ? 'week-completed' : ''}`}
              >
                {/* Card Header */}
                <div className="week-card-header">
                  <div className="week-title-group">
                    <span className="week-period-tag">{week.period}</span>
                    <div className="week-meta">
                      <h3 className="week-title">{week.month}</h3>
                      <span className="week-dates text-xs text-sub">{week.dateRange}</span>
                    </div>
                  </div>

                  <div className="week-header-actions">
                    {/* Rest / Light Week Toggle */}
                    <button
                      type="button"
                      className={`light-week-btn ${week.isLightWeek ? 'active' : ''}`}
                      onClick={() => toggleLightWeek(week.id)}
                      title="Toggle Busy / Relaxing Week mode"
                    >
                      <Coffee size={14} />
                      <span>{week.isLightWeek ? 'Rest Active' : 'Rest Mode'}</span>
                    </button>

                    {/* Status Dropdown */}
                    <select
                      className={`status-select ${week.status.replace(/\s+/g, '-').toLowerCase()}`}
                      value={week.status}
                      onChange={(e) => updateWeekStatus(week.id, e.target.value)}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Light / Rest Week">Light / Rest Week</option>
                    </select>

                    {/* Edit & Delete */}
                    <button 
                      className="btn-icon btn-ghost btn-sm"
                      onClick={(e) => handleEdit(week, e)}
                      title="Edit milestone"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      className="btn-icon btn-ghost btn-sm text-danger"
                      onClick={(e) => handleDelete(week, e)}
                      title="Delete milestone"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Tasks Checklist Grid */}
                <div className="tasks-grid">
                  {/* 1. DSA */}
                  {week.dsa && (
                    <div 
                      className={`task-row ${week.completedTasks?.includes('dsa') ? 'task-done' : ''}`}
                      onClick={() => toggleRoadmapTask(week.id, 'dsa')}
                    >
                      <div className="task-checkbox">
                        {week.completedTasks?.includes('dsa') ? (
                          <CheckCircle2 size={18} className="text-emerald" />
                        ) : (
                          <Circle size={18} className="text-muted" />
                        )}
                      </div>
                      <div className="task-body">
                        <div className="task-track-badge dsa">
                          <Code2 size={12} />
                          <span>DSA Focus</span>
                        </div>
                        <span className="task-text">{week.dsa}</span>
                      </div>
                    </div>
                  )}

                  {/* 2. Full Stack */}
                  {week.fullstack && (
                    <div 
                      className={`task-row ${week.completedTasks?.includes('fullstack') ? 'task-done' : ''}`}
                      onClick={() => toggleRoadmapTask(week.id, 'fullstack')}
                    >
                      <div className="task-checkbox">
                        {week.completedTasks?.includes('fullstack') ? (
                          <CheckCircle2 size={18} className="text-emerald" />
                        ) : (
                          <Circle size={18} className="text-muted" />
                        )}
                      </div>
                      <div className="task-body">
                        <div className="task-track-badge fullstack">
                          <Layers size={12} />
                          <span>Full Stack</span>
                        </div>
                        <span className="task-text">{week.fullstack}</span>
                      </div>
                    </div>
                  )}

                  {/* 3. React Native */}
                  {week.mobile && (
                    <div 
                      className={`task-row ${week.completedTasks?.includes('mobile') ? 'task-done' : ''}`}
                      onClick={() => toggleRoadmapTask(week.id, 'mobile')}
                    >
                      <div className="task-checkbox">
                        {week.completedTasks?.includes('mobile') ? (
                          <CheckCircle2 size={18} className="text-emerald" />
                        ) : (
                          <Circle size={18} className="text-muted" />
                        )}
                      </div>
                      <div className="task-body">
                        <div className="task-track-badge mobile">
                          <Smartphone size={12} />
                          <span>React Native</span>
                        </div>
                        <span className="task-text">{week.mobile}</span>
                      </div>
                    </div>
                  )}

                  {/* 4. Project Output */}
                  {week.project && (
                    <div 
                      className={`task-row ${week.completedTasks?.includes('project') ? 'task-done' : ''}`}
                      onClick={() => toggleRoadmapTask(week.id, 'project')}
                    >
                      <div className="task-checkbox">
                        {week.completedTasks?.includes('project') ? (
                          <CheckCircle2 size={18} className="text-emerald" />
                        ) : (
                          <Circle size={18} className="text-muted" />
                        )}
                      </div>
                      <div className="task-body">
                        <div className="task-track-badge project">
                          <FolderGit2 size={12} />
                          <span>Project / Practical</span>
                        </div>
                        <span className="task-text">{week.project}</span>
                      </div>
                    </div>
                  )}

                  {/* 5. Career / Interview */}
                  {week.career && (
                    <div 
                      className={`task-row ${week.completedTasks?.includes('career') ? 'task-done' : ''}`}
                      onClick={() => toggleRoadmapTask(week.id, 'career')}
                    >
                      <div className="task-checkbox">
                        {week.completedTasks?.includes('career') ? (
                          <CheckCircle2 size={18} className="text-emerald" />
                        ) : (
                          <Circle size={18} className="text-muted" />
                        )}
                      </div>
                      <div className="task-body">
                        <div className="task-track-badge career">
                          <Briefcase size={12} />
                          <span>Career / Interview</span>
                        </div>
                        <span className="task-text">{week.career}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Notes & Progress */}
                <div className="week-card-footer">
                  <span className="week-progress-indicator text-xs text-sub">
                    {completedCount} of 5 tasks completed
                  </span>

                  <button 
                    className="btn-ghost btn-sm toggle-notes-btn"
                    onClick={() => toggleNoteOpen(week.id)}
                  >
                    <Edit3 size={13} />
                    <span>{isNotesOpen ? 'Hide Notes' : 'Study Notes & Links'}</span>
                    {isNotesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {/* Collapsible Notes Editor */}
                {isNotesOpen && (
                  <div className="week-notes-editor">
                    <textarea
                      className="textarea text-xs"
                      placeholder="Add LeetCode problem links, GitHub repo URLs, key learnings, or buffer adjustments for this week..."
                      value={week.notes || ''}
                      onChange={(e) => updateWeekNotes(week.id, e.target.value)}
                      rows={3}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* End-of-December Outcome Targets */}
      <div className="outcomes-section">
        <div className="section-header">
          <div className="section-title-area">
            <Award size={20} className="text-primary" />
            <h3 className="title-md">End-of-December Target Outcomes</h3>
          </div>
          <span className="badge badge-primary">Dec 31 Milestone</span>
        </div>

        <div className="outcomes-grid">
          {ROADMAP_OUTCOMES.map((o) => (
            <div key={o.id} className="outcome-card card">
              <div className="outcome-header">
                <span className="outcome-title">{o.title}</span>
              </div>
              <p className="outcome-target text-sub text-xs">{o.target}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Roadmap Add / Edit Modal */}
      <RoadmapModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setWeekToEdit(null);
        }}
        weekToEdit={weekToEdit}
      />

      <style>{`
        .roadmap-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .roadmap-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.75rem;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(16, 185, 129, 0.12));
          border-color: rgba(99, 102, 241, 0.35);
          gap: 1.5rem;
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--accent-primary);
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        .hero-title {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .hero-desc {
          font-size: 0.85rem;
          max-width: 600px;
        }

        .roadmap-overall-progress {
          margin-top: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          max-width: 480px;
        }

        .progress-info-row {
          display: flex;
          justify-content: space-between;
        }

        .progress-track {
          height: 8px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-success));
          border-radius: var(--radius-full);
          transition: width 0.4s ease;
        }

        .countdown-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem 1.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          flex-shrink: 0;
        }

        .countdown-val {
          font-size: 2rem;
          font-weight: 900;
          color: var(--accent-primary);
          line-height: 1;
        }

        .countdown-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .flexible-schedule-alert {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: rgba(245, 158, 11, 0.08);
          border-color: rgba(245, 158, 11, 0.25);
        }

        .alert-icon-box {
          padding-top: 2px;
        }

        .alert-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--accent-warning);
          margin-bottom: 0.25rem;
        }

        .roadmap-controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .month-tabs-scroll {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
        }

        .month-tab-btn {
          padding: 0.45rem 1rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .month-tab-btn.active {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          color: #ffffff;
        }

        .roadmap-actions-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .weeks-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .week-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.25rem;
          transition: border-color 0.2s ease, transform 0.2s ease;
        }

        .week-completed {
          border-color: rgba(16, 185, 129, 0.4);
        }

        .light-week-card {
          border-color: rgba(245, 158, 11, 0.35);
          background: rgba(245, 158, 11, 0.03);
        }

        .week-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .week-title-group {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .week-period-tag {
          font-size: 0.85rem;
          font-weight: 800;
          color: #ffffff;
          background: var(--accent-primary);
          padding: 0.3rem 0.65rem;
          border-radius: var(--radius-sm);
        }

        .week-title {
          font-size: 1.05rem;
          font-weight: 700;
        }

        .week-header-actions {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .light-week-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.65rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .light-week-btn.active {
          background: rgba(245, 158, 11, 0.18);
          border-color: rgba(245, 158, 11, 0.4);
          color: var(--accent-warning);
        }

        .status-select {
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
        }

        .status-select.completed {
          color: var(--accent-success);
          border-color: rgba(16, 185, 129, 0.4);
        }

        .status-select.in-progress {
          color: var(--accent-primary);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .status-select.light-/-rest-week {
          color: var(--accent-warning);
          border-color: rgba(245, 158, 11, 0.4);
        }

        .tasks-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.6rem;
        }

        @media (min-width: 768px) {
          .tasks-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .task-row {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.65rem 0.85rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .task-row:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .task-row.task-done {
          border-color: rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.04);
        }

        .task-row.task-done .task-text {
          color: var(--text-muted);
          text-decoration: line-through;
        }

        .task-checkbox {
          padding-top: 2px;
          flex-shrink: 0;
        }

        .task-body {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          min-width: 0;
        }

        .task-track-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .task-track-badge.dsa { color: #0ea5e9; }
        .task-track-badge.fullstack { color: #6366f1; }
        .task-track-badge.mobile { color: #10b981; }
        .task-track-badge.project { color: #f59e0b; }
        .task-track-badge.career { color: #ec4899; }

        .task-text {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.35;
        }

        .week-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .toggle-notes-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
        }

        .week-notes-editor {
          animation: fadeIn 0.2s ease;
        }

        .empty-weeks {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 3rem;
          text-align: center;
        }

        .outcomes-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .section-title-area {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .outcomes-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.85rem;
        }

        @media (min-width: 640px) {
          .outcomes-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .outcomes-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .outcome-card {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          padding: 1rem;
        }

        .outcome-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .text-emerald { color: var(--accent-success); }
        .text-muted { color: var(--text-muted); }
      `}</style>
    </div>
  );
};
