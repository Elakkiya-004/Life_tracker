import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEFAULT_ROADMAP, ROADMAP_OUTCOMES } from '../services/storage';
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
  Briefcase,
  Table,
  LayoutGrid,
  Download,
  Copy,
  Check
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

  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [expandedNotes, setExpandedNotes] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weekToEdit, setWeekToEdit] = useState(null);
  const [copied, setCopied] = useState(false);

  // Filter weeks by month
  const safeRoadmap = Array.isArray(roadmap) && roadmap.length > 0 ? roadmap : DEFAULT_ROADMAP;
  const months = ['All', 'September', 'October', 'November', 'December'];
  const filteredWeeks = selectedMonth === 'All'
    ? safeRoadmap
    : safeRoadmap.filter(w => w && w.month === selectedMonth);

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

  const handleExportCSV = () => {
    const headers = ['Period', 'Month', 'Date Range', 'DSA Focus', 'Full Stack', 'React Native', 'Project / Implementation', 'Career/Interview', 'Status', 'Tasks Done'];
    const rows = safeRoadmap.map(w => [
      `"${w.period}"`,
      `"${w.month}"`,
      `"${w.dateRange || ''}"`,
      `"${(w.dsa || '').replace(/"/g, '""')}"`,
      `"${(w.fullstack || '').replace(/"/g, '""')}"`,
      `"${(w.mobile || '').replace(/"/g, '""')}"`,
      `"${(w.project || '').replace(/"/g, '""')}"`,
      `"${(w.career || '').replace(/"/g, '""')}"`,
      `"${w.status}"`,
      `"${(w.completedTasks || []).join(', ')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `career_roadmap_sep_dec_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySummary = () => {
    const text = ROADMAP_OUTCOMES.map(o => `• ${o.title}: ${o.target}`).join('\n');
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            16-Week Full-Stack + Mobile + DSA Master Plan
          </h2>
          <p className="hero-desc text-sub">
            Structured 16-week curriculum (Sep W1 – Dec W4) with DSA, Full-Stack, React Native, Projects, and Interview Prep.
          </p>

          {/* Progress bar */}
          <div className="roadmap-overall-progress">
            <div className="progress-info-row">
              <span className="text-xs font-bold">Overall Roadmap Progress: {roadmapCompletionPercent}%</span>
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
          <h4 className="alert-title">🧘 Flexible Pace & Rest Protocol</h4>
          <p className="alert-desc text-xs text-sub">
            Recommended pace: <strong>4 Study Days + 1 Project Day + 2 Buffer/Rest Days</strong> per week. Click any task checkbox in the spreadsheet below to mark it done!
          </p>
        </div>
      </div>

      {/* Controls: View Mode Switcher + Month Filters + Action Buttons */}
      <div className="roadmap-controls-row">
        <div className="view-mode-tabs">
          <button 
            className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Excel Spreadsheet Table View"
          >
            <Table size={16} />
            <span>Spreadsheet View</span>
          </button>
          <button 
            className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
            title="Interactive Cards View"
          >
            <LayoutGrid size={16} />
            <span>Cards View</span>
          </button>
        </div>

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
            className="btn btn-secondary btn-sm"
            onClick={handleExportCSV}
            title="Export as CSV spreadsheet"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

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

      {/* VIEW 1: SPREADSHEET TABLE VIEW (Matches Excel Sheet Exactly) */}
      {viewMode === 'table' ? (
        <div className="card roadmap-table-card">
          <div className="table-responsive">
            <table className="roadmap-excel-table">
              <thead>
                <tr>
                  <th className="col-period">Period</th>
                  <th className="col-dsa">🧠 DSA Focus</th>
                  <th className="col-fullstack">💻 Full Stack</th>
                  <th className="col-mobile">📱 React Native</th>
                  <th className="col-project">🚀 Project / Implementation</th>
                  <th className="col-career">👔 Career / Interview Prep</th>
                  <th className="col-status">Status</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWeeks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-sub">
                      No milestones found under "{selectedMonth}".
                    </td>
                  </tr>
                ) : (
                  filteredWeeks.map((week) => {
                    const dsaDone = week.completedTasks?.includes('dsa');
                    const fsDone = week.completedTasks?.includes('fullstack');
                    const rnDone = week.completedTasks?.includes('mobile');
                    const projDone = week.completedTasks?.includes('project');
                    const careerDone = week.completedTasks?.includes('career');
                    const isAllDone = (week.completedTasks?.length || 0) === 5;

                    return (
                      <tr key={week.id} className={`table-row ${isAllDone ? 'row-all-done' : ''} ${week.isLightWeek ? 'row-light-week' : ''}`}>
                        {/* Period */}
                        <td className="cell-period">
                          <div className="period-badge">{week.period}</div>
                          {week.dateRange && <span className="period-sub">{week.dateRange}</span>}
                        </td>

                        {/* DSA Focus */}
                        <td 
                          className={`cell-task ${dsaDone ? 'task-cell-done' : ''}`}
                          onClick={() => toggleRoadmapTask(week.id, 'dsa')}
                          title="Click to toggle DSA complete"
                        >
                          <div className="cell-task-inner">
                            <div className="cell-check">
                              {dsaDone ? <CheckCircle2 size={16} className="text-emerald" /> : <Circle size={16} className="text-muted" />}
                            </div>
                            <span className="cell-text">{week.dsa || '—'}</span>
                          </div>
                        </td>

                        {/* Full Stack */}
                        <td 
                          className={`cell-task ${fsDone ? 'task-cell-done' : ''}`}
                          onClick={() => toggleRoadmapTask(week.id, 'fullstack')}
                          title="Click to toggle Full-Stack complete"
                        >
                          <div className="cell-task-inner">
                            <div className="cell-check">
                              {fsDone ? <CheckCircle2 size={16} className="text-emerald" /> : <Circle size={16} className="text-muted" />}
                            </div>
                            <span className="cell-text">{week.fullstack || '—'}</span>
                          </div>
                        </td>

                        {/* React Native */}
                        <td 
                          className={`cell-task ${rnDone ? 'task-cell-done' : ''}`}
                          onClick={() => toggleRoadmapTask(week.id, 'mobile')}
                          title="Click to toggle React Native complete"
                        >
                          <div className="cell-task-inner">
                            <div className="cell-check">
                              {rnDone ? <CheckCircle2 size={16} className="text-emerald" /> : <Circle size={16} className="text-muted" />}
                            </div>
                            <span className="cell-text">{week.mobile || '—'}</span>
                          </div>
                        </td>

                        {/* Project / Implementation */}
                        <td 
                          className={`cell-task ${projDone ? 'task-cell-done' : ''}`}
                          onClick={() => toggleRoadmapTask(week.id, 'project')}
                          title="Click to toggle Project complete"
                        >
                          <div className="cell-task-inner">
                            <div className="cell-check">
                              {projDone ? <CheckCircle2 size={16} className="text-emerald" /> : <Circle size={16} className="text-muted" />}
                            </div>
                            <span className="cell-text">{week.project || '—'}</span>
                          </div>
                        </td>

                        {/* Career / Interview */}
                        <td 
                          className={`cell-task ${careerDone ? 'task-cell-done' : ''}`}
                          onClick={() => toggleRoadmapTask(week.id, 'career')}
                          title="Click to toggle Career/Interview complete"
                        >
                          <div className="cell-task-inner">
                            <div className="cell-check">
                              {careerDone ? <CheckCircle2 size={16} className="text-emerald" /> : <Circle size={16} className="text-muted" />}
                            </div>
                            <span className="cell-text">{week.career || '—'}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="cell-status">
                          <select
                            className={`table-status-select ${week.status.replace(/\s+/g, '-').toLowerCase()}`}
                            value={week.status}
                            onChange={(e) => updateWeekStatus(week.id, e.target.value)}
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Light / Rest Week">Light / Rest Week</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="cell-actions">
                          <div className="row-actions">
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
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW 2: INTERACTIVE CARDS VIEW */
        <div className="weeks-list">
          {filteredWeeks.length === 0 ? (
            <div className="card empty-weeks">
              <Compass size={36} className="text-muted" />
              <p className="text-sub">No milestones found under "{selectedMonth}".</p>
              <button className="btn btn-primary" onClick={handleCreate}>
                + Add Milestone for {selectedMonth}
              </button>
            </div>
          ) : (
            filteredWeeks.map((week) => {
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
            })
          )}
        </div>
      )}

      {/* End-of-December Outcome Targets Section (Matching User Excel Exactly) */}
      <div className="card outcomes-card">
        <div className="outcomes-header-row">
          <div className="outcomes-title-area">
            <div className="outcomes-icon-box">
              <Award size={22} className="text-primary" />
            </div>
            <div>
              <h3 className="outcomes-main-heading">End-of-Dec Outcomes & Deliverables</h3>
              <p className="outcomes-sub-heading text-sub text-xs">Core competencies achieved after completing the 16-week syllabus</p>
            </div>
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={handleCopySummary}
          >
            {copied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>
        </div>

        <div className="outcomes-list">
          {ROADMAP_OUTCOMES.map((o) => (
            <div key={o.id} className="outcome-row-item">
              <div className="outcome-bullet" style={{ backgroundColor: o.color || '#6366f1' }} />
              <div className="outcome-content-wrap">
                <span className="outcome-badge" style={{ color: o.color || '#6366f1', borderColor: `${o.color || '#6366f1'}40`, backgroundColor: `${o.color || '#6366f1'}15` }}>
                  {o.title}
                </span>
                <span className="outcome-desc-text">{o.target}</span>
              </div>
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
          background: rgba(99, 102, 241, 0.2);
          color: var(--primary-color);
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          width: fit-content;
        }

        .hero-title {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .hero-desc {
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .roadmap-overall-progress {
          margin-top: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .progress-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .progress-track {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #10b981);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .countdown-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--bg-card);
          padding: 1rem 1.25rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          min-width: 100px;
          text-align: center;
        }

        .countdown-val {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--primary-color);
          line-height: 1;
        }

        .countdown-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .flexible-schedule-alert {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: rgba(245, 158, 11, 0.08);
          border-color: rgba(245, 158, 11, 0.25);
        }

        .alert-icon-box {
          background: rgba(245, 158, 11, 0.15);
          padding: 0.6rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .alert-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: #f59e0b;
        }

        .roadmap-controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .view-mode-tabs {
          display: flex;
          background: var(--bg-card);
          padding: 0.2rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          gap: 0.2rem;
        }

        .view-mode-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-mode-btn.active {
          background: var(--primary-color);
          color: #ffffff;
        }

        .month-tabs-scroll {
          display: flex;
          gap: 0.4rem;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .month-tab-btn {
          padding: 0.45rem 0.85rem;
          border-radius: var(--radius-md);
          font-size: 0.8rem;
          font-weight: 600;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }

        .month-tab-btn.active {
          background: rgba(99, 102, 241, 0.15);
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .roadmap-actions-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* SPREADSHEET TABLE STYLES */
        .roadmap-table-card {
          padding: 0;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }

        .roadmap-excel-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.825rem;
          text-align: left;
        }

        .roadmap-excel-table th {
          background: var(--bg-secondary);
          color: var(--text-main);
          font-weight: 700;
          padding: 0.85rem 0.75rem;
          border-bottom: 2px solid var(--border-color);
          border-right: 1px solid var(--border-color);
          white-space: nowrap;
          font-size: 0.8rem;
          letter-spacing: 0.02em;
        }

        .roadmap-excel-table td {
          padding: 0.75rem 0.75rem;
          border-bottom: 1px solid var(--border-color);
          border-right: 1px solid var(--border-color);
          vertical-align: top;
        }

        .col-period { width: 95px; }
        .col-dsa { width: 17%; }
        .col-fullstack { width: 19%; }
        .col-mobile { width: 18%; }
        .col-project { width: 19%; }
        .col-career { width: 18%; }
        .col-status { width: 125px; }
        .col-actions { width: 75px; text-align: center; }

        .cell-period {
          font-weight: 700;
          background: var(--bg-secondary);
        }

        .period-badge {
          display: inline-block;
          font-weight: 800;
          color: var(--primary-color);
          font-size: 0.85rem;
        }

        .period-sub {
          display: block;
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: normal;
          margin-top: 0.15rem;
        }

        .cell-task {
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .cell-task:hover {
          background: rgba(99, 102, 241, 0.08);
        }

        .cell-task-inner {
          display: flex;
          align-items: flex-start;
          gap: 0.45rem;
        }

        .cell-check {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .cell-text {
          line-height: 1.35;
          color: var(--text-main);
        }

        .task-cell-done {
          background: rgba(16, 185, 129, 0.06);
        }

        .task-cell-done .cell-text {
          text-decoration: line-through;
          color: var(--text-muted);
        }

        .row-all-done {
          background: rgba(16, 185, 129, 0.03);
        }

        .row-light-week {
          background: rgba(245, 158, 11, 0.03);
        }

        .table-status-select {
          width: 100%;
          padding: 0.3rem 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          color: var(--text-main);
          cursor: pointer;
        }

        .table-status-select.completed {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border-color: #10b981;
        }

        .table-status-select.in-progress {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          border-color: #6366f1;
        }

        .table-status-select.light---rest-week {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
          border-color: #f59e0b;
        }

        .row-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.2rem;
        }

        /* OUTCOMES CARD */
        .outcomes-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 1.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
        }

        .outcomes-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .outcomes-title-area {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .outcomes-icon-box {
          background: rgba(99, 102, 241, 0.15);
          padding: 0.6rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .outcomes-main-heading {
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: -0.01em;
        }

        .outcomes-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-left: 0.25rem;
        }

        .outcome-row-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .outcome-bullet {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 0.45rem;
          flex-shrink: 0;
        }

        .outcome-content-wrap {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .outcome-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-sm);
          border: 1px solid;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        .outcome-desc-text {
          font-size: 0.85rem;
          line-height: 1.45;
          color: var(--text-main);
        }

        /* CARDS VIEW STYLES */
        .weeks-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .week-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 1.25rem;
          border: 1px solid var(--border-color);
          transition: transform 0.2s, border-color 0.2s;
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
          gap: 0.75rem;
        }

        .week-period-tag {
          font-size: 0.95rem;
          font-weight: 800;
          background: rgba(99, 102, 241, 0.15);
          color: var(--primary-color);
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-md);
        }

        .week-title {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .week-header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .light-week-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 0.35rem 0.65rem;
          border-radius: var(--radius-md);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
        }

        .light-week-btn.active {
          background: rgba(245, 158, 11, 0.2);
          border-color: #f59e0b;
          color: #f59e0b;
        }

        .tasks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 0.75rem;
        }

        .task-row {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          padding: 0.75rem;
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: all 0.2s;
        }

        .task-row:hover {
          border-color: var(--primary-color);
        }

        .task-track-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          padding: 0.15rem 0.4rem;
          border-radius: var(--radius-sm);
          margin-bottom: 0.25rem;
        }

        .task-track-badge.dsa { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
        .task-track-badge.fullstack { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .task-track-badge.mobile { background: rgba(6, 182, 212, 0.15); color: #22d3ee; }
        .task-track-badge.project { background: rgba(236, 72, 153, 0.15); color: #f472b6; }
        .task-track-badge.career { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }

        .task-row.task-done {
          opacity: 0.7;
          background: rgba(16, 185, 129, 0.05);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .task-row.task-done .task-text {
          text-decoration: line-through;
        }

        .week-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--border-color);
          padding-top: 0.75rem;
        }

        @media (max-width: 768px) {
          .roadmap-hero {
            flex-direction: column;
            align-items: flex-start;
          }
          .countdown-pill {
            width: 100%;
          }
          .roadmap-controls-row {
            flex-direction: column;
            align-items: stretch;
          }
          .view-mode-tabs {
            width: 100%;
            justify-content: center;
          }
          .month-tabs-scroll {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};