import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { DateAdjustModal } from '../components/roadmap/DateAdjustModal';
import { DayEditModal } from '../components/roadmap/DayEditModal';
import { 
  Compass, 
  Calendar, 
  Clock, 
  Brain, 
  FolderGit2, 
  BookOpen, 
  Coffee, 
  Table, 
  LayoutGrid, 
  Focus, 
  Search, 
  Download, 
  RotateCcw, 
  FastForward, 
  ExternalLink, 
  Copy, 
  Check, 
  Edit3, 
  ArrowRight, 
  ArrowLeft, 
  Flame, 
  Bot, 
  FileText
} from 'lucide-react';

export const RoadmapView = () => {
  const { 
    roadmap, 
    totalRoadmapDays, 
    completedRoadmapDays, 
    totalStudyHoursLogged, 
    roadmapCompletionPercent,
    updateDayPlan,
    toggleDayComplete,
    toggleDayChecklist,
    resetRoadmapToDefault,
    devPlanConcepts,
    toggleConceptMastery,
    devPlanWeeklyReviews,
    updateWeeklyReview,
    devPlanResources,
    devPlanAiWorkflow,
    defaultPlanStartDate,
    totalPlanDays
  } = useApp();

  // Submenu Navigation: 'plan' | 'concepts' | 'reviews' | 'resources' | 'ai-workflow'
  const [activeSubmenu, setActiveSubmenu] = useState('plan');

  // Plan View Mode: 'table' | 'cards' | 'daily-focus'
  const [viewMode, setViewMode] = useState('table');

  // Filters & Search
  const [selectedCycle, setSelectedCycle] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All'); // 'All' | 'Study' | 'Rest' | 'Completed' | 'Pending'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isDateAdjustModalOpen, setIsDateAdjustModalOpen] = useState(false);
  const [dayToEdit, setDayToEdit] = useState(null);
  const [isDayEditModalOpen, setIsDayEditModalOpen] = useState(false);

  // Daily focus day index (0 to 119)
  const [focusDayIndex, setFocusDayIndex] = useState(0);

  // Copied prompt feedback
  const [copiedPromptId, setCopiedPromptId] = useState(null);

  // Concepts Filter
  const [conceptAreaFilter, setConceptAreaFilter] = useState('All');
  const [conceptSearch, setConceptSearch] = useState('');

  // Ref for table scroll
  const tableRef = useRef(null);

  // Calculate current date string (YYYY-MM-DD)
  const todayDateStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Safe roadmap list
  const safeDays = useMemo(() => {
    return Array.isArray(roadmap) && roadmap.length > 0 ? roadmap : [];
  }, [roadmap]);

  // Find today's day in the roadmap
  const todayDay = useMemo(() => {
    return safeDays.find(d => d.date === todayDateStr) || null;
  }, [safeDays, todayDateStr]);

  // Target countdown calculation
  const planFinishDate = safeDays[safeDays.length - 1]?.date || '2027-02-23';
  const daysRemaining = useMemo(() => {
    const end = new Date(planFinishDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [planFinishDate]);

  // Cycles list
  const cycles = [
    'All',
    'Cycle 1: JS + DSA',
    'Cycle 2: React + TS',
    'Cycle 3: Backend + DB',
    'Cycle 4: Design + Deploy'
  ];

  // Filtered days
  const filteredDays = useMemo(() => {
    return safeDays.filter(day => {
      // Cycle filter
      if (selectedCycle !== 'All' && day.cycle !== selectedCycle) return false;

      // Status filter
      if (selectedStatus === 'Study' && day.planStatus === 'Rest') return false;
      if (selectedStatus === 'Rest' && day.planStatus !== 'Rest') return false;
      if (selectedStatus === 'Completed' && day.status !== 'Completed' && day.completion !== 'Done') return false;
      if (selectedStatus === 'Pending' && (day.status === 'Completed' || day.completion === 'Done')) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTopic = (day.mainTopic || '').toLowerCase().includes(q);
        const matchConcepts = (day.concepts || '').toLowerCase().includes(q);
        const matchDsa = (day.dsa || '').toLowerCase().includes(q);
        const matchProject = (day.projectTask || '').toLowerCase().includes(q);
        const matchExercise = (day.exercise || '').toLowerCase().includes(q);
        const matchNotes = (day.notes || '').toLowerCase().includes(q);
        const matchDay = `day ${day.day}`.includes(q);
        if (!matchTopic && !matchConcepts && !matchDsa && !matchProject && !matchExercise && !matchNotes && !matchDay) {
          return false;
        }
      }

      return true;
    });
  }, [safeDays, selectedCycle, selectedStatus, searchQuery]);

  // Jump to Today or Next Study Day
  const handleJumpToToday = () => {
    const target = todayDay || safeDays.find(d => d.status !== 'Completed' && d.planStatus !== 'Rest') || safeDays[0];
    if (target) {
      if (viewMode === 'daily-focus') {
        const idx = safeDays.findIndex(d => d.id === target.id);
        if (idx !== -1) setFocusDayIndex(idx);
      } else {
        const el = document.getElementById(`day-row-${target.day}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('highlight-pulse');
          setTimeout(() => el.classList.remove('highlight-pulse'), 3000);
        }
      }
    }
  };

  const handleOpenEdit = (day, e) => {
    if (e) e.stopPropagation();
    setDayToEdit(day);
    setIsDayEditModalOpen(true);
  };

  const handleCopyPrompt = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = [
      'Day', 'Date', 'Cycle', 'Status', 'Completion', 'Main Topic', 
      'Concepts', 'Acceptance Criteria / Exercise', 'DSA Practice', 
      'Project Task', 'Minutes Studied', 'Confidence (1-5)', 'Mistakes / Notes', "Tomorrow's Task"
    ];

    const rows = safeDays.map(d => [
      d.day,
      `"${d.date}"`,
      `"${d.cycle}"`,
      `"${d.status}"`,
      `"${d.completion || ''}"`,
      `"${(d.mainTopic || '').replace(/"/g, '""')}"`,
      `"${(d.concepts || '').replace(/"/g, '""')}"`,
      `"${(d.exercise || '').replace(/"/g, '""')}"`,
      `"${(d.dsa || '').replace(/"/g, '""')}"`,
      `"${(d.projectTask || '').replace(/"/g, '""')}"`,
      d.actualMinutes || 0,
      d.confidence || 0,
      `"${(d.notes || d.mistakesBlockers || '').replace(/"/g, '""')}"`,
      `"${(d.tomorrowsTask || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `120_Day_Full_Stack_Developer_Plan_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetSyllabus = () => {
    if (window.confirm('Reset all 120 days to default syllabus template? This will reload the pristine Excel plan.')) {
      resetRoadmapToDefault();
    }
  };

  // Distinct Concept Areas for filter
  const conceptAreas = useMemo(() => {
    const set = new Set((devPlanConcepts || []).map(c => c.area).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [devPlanConcepts]);

  const filteredConcepts = useMemo(() => {
    return (devPlanConcepts || []).filter(c => {
      if (conceptAreaFilter !== 'All' && c.area !== conceptAreaFilter) return false;
      if (conceptSearch.trim()) {
        const q = conceptSearch.toLowerCase();
        return (
          c.concept.toLowerCase().includes(q) ||
          c.whatToUnderstand.toLowerCase().includes(q) ||
          c.exercise.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [devPlanConcepts, conceptAreaFilter, conceptSearch]);

  const currentFocusDay = safeDays[focusDayIndex] || safeDays[0];

  return (
    <div className="dev-roadmap-container">
      {/* ========================================================
          1. SUBMENU NAVIGATION BAR (Keeps Submenu Intact)
          ======================================================== */}
      <div className="career-submenu-bar card">
        <div className="career-submenu-items">
          <button 
            type="button"
            className={`career-submenu-item ${activeSubmenu === 'plan' ? 'active' : ''}`}
            onClick={() => setActiveSubmenu('plan')}
          >
            <Calendar size={18} />
            <span className="submenu-label">120-Day Master Plan</span>
            <span className="submenu-badge">{completedRoadmapDays}/{totalRoadmapDays}</span>
          </button>

          <button 
            type="button"
            className={`career-submenu-item ${activeSubmenu === 'concepts' ? 'active' : ''}`}
            onClick={() => setActiveSubmenu('concepts')}
          >
            <Brain size={18} />
            <span className="submenu-label">Tech Concepts</span>
            <span className="submenu-badge cyan">{(devPlanConcepts || []).filter(c => c.mastered).length}/{devPlanConcepts?.length || 33}</span>
          </button>

          <button 
            type="button"
            className={`career-submenu-item ${activeSubmenu === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveSubmenu('reviews')}
          >
            <FileText size={18} />
            <span className="submenu-label">Weekly Reviews</span>
            <span className="submenu-badge purple">17 Weeks</span>
          </button>

          <button 
            type="button"
            className={`career-submenu-item ${activeSubmenu === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveSubmenu('resources')}
          >
            <BookOpen size={18} />
            <span className="submenu-label">Resources</span>
            <span className="submenu-badge amber">{devPlanResources?.length || 16}</span>
          </button>

          <button 
            type="button"
            className={`career-submenu-item ${activeSubmenu === 'ai-workflow' ? 'active' : ''}`}
            onClick={() => setActiveSubmenu('ai-workflow')}
          >
            <Bot size={18} />
            <span className="submenu-label">AI Workflow Rules</span>
            <span className="submenu-badge rose">5 Steps</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. HERO HEADER & COUNTDOWN METRICS (For Plan Tab)
          ======================================================== */}
      {activeSubmenu === 'plan' && (
        <div className="dev-plan-hero card">
          <div className="hero-left">
            <div className="hero-pill-badge">
              <Compass size={16} className="text-cyan spin-slow" />
              <span>120-DAY FULL-STACK DEVELOPER PLAN • 2 HOURS/DAY</span>
            </div>
            <h2 className="hero-heading">
              120-Day Full-Stack Developer Growth Tracker
            </h2>
            <p className="hero-subtitle text-sub text-sm">
              Master JavaScript Internals, DSA, React 19, TypeScript, Express, PostgreSQL, and System Design with structured daily exercises and rest protocols.
            </p>

            {/* Overall Progress Tracker */}
            <div className="hero-progress-block">
              <div className="hero-progress-info">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Flame size={14} className="text-amber-400" />
                  <span>Overall Curriculum Completion: {roadmapCompletionPercent}%</span>
                </span>
                <span className="text-xs text-sub font-mono">
                  {completedRoadmapDays} / {totalRoadmapDays} Days Finished • {totalStudyHoursLogged} Study Hours Logged
                </span>
              </div>
              <div className="hero-progress-bar">
                <div 
                  className="hero-progress-fill"
                  style={{ width: `${roadmapCompletionPercent}%` }}
                />
              </div>
            </div>

            {/* Cycle Progress Badges */}
            <div className="cycle-pills-row">
              <span className="cycle-pill c1">Cycle 1: JS + DSA (Days 1–30)</span>
              <span className="cycle-pill c2">Cycle 2: React + TS (Days 31–60)</span>
              <span className="cycle-pill c3">Cycle 3: Backend + DB (Days 61–90)</span>
              <span className="cycle-pill c4">Cycle 4: Design + Deploy (Days 91–120)</span>
            </div>
          </div>

          <div className="hero-right">
            <div className="countdown-card">
              <span className="countdown-number">{daysRemaining}</span>
              <span className="countdown-label">Days to Target</span>
              <span className="countdown-sub text-xs text-sub font-mono">End: {planFinishDate}</span>
            </div>

            {todayDay && (
              <div className="today-focus-pill" onClick={handleJumpToToday}>
                <span className="text-xs font-bold text-cyan">📍 Today: Day {todayDay.day}</span>
                <span className="text-xs text-sub truncate max-w-full">{todayDay.mainTopic}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          3. DATE ADJUSTMENT & SCHEDULE TOOLBAR
          ("Switch Date and Adjust Dates")
          ======================================================== */}
      {activeSubmenu === 'plan' && (
        <div className="schedule-toolbar card">
          <div className="schedule-toolbar-left">
            {/* Start Date Button & Date Adjuster trigger */}
            <div className="date-adjust-quick-group">
              <div className="schedule-start-badge" title="Click to adjust dates">
                <Calendar size={15} className="text-cyan" />
                <span className="text-xs text-sub">Start:</span>
                <span className="font-bold text-xs font-mono">{safeDays[0]?.date || defaultPlanStartDate}</span>
              </div>

              <button 
                type="button"
                className="btn btn-secondary btn-sm date-switch-btn"
                onClick={() => setIsDateAdjustModalOpen(true)}
                title="Switch plan start date, shift schedule buffer, or swap dates"
              >
                <FastForward size={14} className="text-indigo-400" />
                <span>Adjust & Switch Dates</span>
              </button>

              <button 
                type="button"
                className="btn btn-ghost btn-sm jump-today-btn"
                onClick={handleJumpToToday}
                title="Jump to today's study day"
              >
                <span>📍 Jump to Today</span>
              </button>
            </div>
          </div>

          <div className="schedule-toolbar-right">
            {/* View Mode Switcher */}
            <div className="view-mode-tabs">
              <button 
                type="button"
                className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Spreadsheet Table View (Excel format)"
              >
                <Table size={15} />
                <span className="desktop-only">Spreadsheet</span>
              </button>

              <button 
                type="button"
                className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
                title="Interactive Cards View"
              >
                <LayoutGrid size={15} />
                <span className="desktop-only">Cards</span>
              </button>

              <button 
                type="button"
                className={`view-mode-btn ${viewMode === 'daily-focus' ? 'active' : ''}`}
                onClick={() => setViewMode('daily-focus')}
                title="Single Day Deep-Dive Focus"
              >
                <Focus size={15} />
                <span className="desktop-only">Daily Focus</span>
              </button>
            </div>

            {/* Export & Reset */}
            <div className="export-reset-group">
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={handleExportCSV}
                title="Export user plan to CSV"
              >
                <Download size={14} />
                <span className="desktop-only">Export</span>
              </button>

              <button 
                type="button" 
                className="btn btn-ghost btn-sm text-sub"
                onClick={handleResetSyllabus}
                title="Reset to standard Excel syllabus"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          4. FILTER & SEARCH BAR (For Table and Cards Views)
          ======================================================== */}
      {activeSubmenu === 'plan' && viewMode !== 'daily-focus' && (
        <div className="plan-filters-row">
          {/* Cycle Tabs */}
          <div className="cycle-tabs-scroll">
            {cycles.map((c) => (
              <button
                key={c}
                type="button"
                className={`cycle-tab-btn ${selectedCycle === c ? 'active' : ''}`}
                onClick={() => setSelectedCycle(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Status & Search Filter */}
          <div className="status-search-group">
            <select 
              className="status-select-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Study">Study Days Only</option>
              <option value="Rest">Rest Days (16 Days)</option>
              <option value="Completed">Completed Days</option>
              <option value="Pending">Pending Days</option>
            </select>

            <div className="search-input-wrapper">
              <Search size={14} className="search-icon text-muted" />
              <input 
                type="text"
                className="search-input"
                placeholder="Search topic, DSA, project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="clear-search-btn" onClick={() => setSearchQuery('')}>×</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          5. VIEW 1: SPREADSHEET TABLE VIEW (Exact Excel Format)
          ======================================================== */}
      {activeSubmenu === 'plan' && viewMode === 'table' && (
        <div className="card dev-plan-table-card" ref={tableRef}>
          <div className="table-responsive">
            <table className="dev-excel-table">
              <thead>
                <tr>
                  <th className="col-day">Day & Date</th>
                  <th className="col-status">Status</th>
                  <th className="col-topic">Main Topic & Concepts</th>
                  <th className="col-exercise">Specific Exercise / Acceptance Criteria</th>
                  <th className="col-dsa">🧠 DSA Practice</th>
                  <th className="col-project">🚀 Project Task</th>
                  <th className="col-checklist">Study Checklist</th>
                  <th className="col-minutes">⏱️ Mins</th>
                  <th className="col-confidence">⭐ Rating</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDays.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-sub">
                      No days found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDays.map((day) => {
                    const isDone = day.status === 'Completed' || day.completion === 'Done';
                    const isRest = day.planStatus === 'Rest';
                    const isToday = day.date === todayDateStr;
                    const completedCount = Array.isArray(day.completedTasks) ? day.completedTasks.length : (isDone ? 4 : 0);

                    return (
                      <tr 
                        key={day.id} 
                        id={`day-row-${day.day}`}
                        className={`table-day-row ${isDone ? 'row-done' : ''} ${isRest ? 'row-rest' : ''} ${isToday ? 'row-today' : ''}`}
                      >
                        {/* 1. Day & Date (with inline quick switch) */}
                        <td className="col-day">
                          <div className="day-number-badge">
                            <span className="day-num">Day {day.day}</span>
                            {isToday && <span className="today-indicator">TODAY</span>}
                          </div>
                          <button 
                            type="button" 
                            className="inline-date-btn"
                            onClick={(e) => handleOpenEdit(day, e)}
                            title="Click to edit date or shift schedule"
                          >
                            <Calendar size={12} className="text-sub" />
                            <span className="font-mono text-xs">{day.date}</span>
                          </button>
                          <span className="cycle-sub-text">{day.cycle.split(':')[0]}</span>
                        </td>

                        {/* 2. Status */}
                        <td className="col-status">
                          <button
                            type="button"
                            className={`status-pill ${isRest ? 'status-rest' : isDone ? 'status-done' : (completedCount > 0 || day.actualMinutes > 0 ? 'status-progress' : 'status-pending')}`}
                            onClick={() => toggleDayComplete(day.id)}
                            title="Click to toggle completed"
                          >
                            {isRest ? (
                              <>
                                <Coffee size={12} />
                                <span>Rest</span>
                              </>
                            ) : isDone ? (
                              <>
                                <Check size={12} strokeWidth={3} />
                                <span>Done</span>
                              </>
                            ) : completedCount > 0 || day.actualMinutes > 0 ? (
                              <span>In Progress</span>
                            ) : (
                              <span>Study</span>
                            )}
                          </button>
                        </td>

                        {/* 3. Main Topic & Concepts */}
                        <td className="col-topic" onClick={() => handleOpenEdit(day)}>
                          <div className="topic-title">{day.mainTopic}</div>
                          {day.concepts && (
                            <div className="topic-concepts text-sub text-xs">{day.concepts}</div>
                          )}
                          {day.resource && (
                            <div className="topic-resource text-xs">
                              <span className="text-muted">Ref:</span> {day.resource}
                            </div>
                          )}
                        </td>

                        {/* 4. Specific Exercise / Acceptance Criteria */}
                        <td className="col-exercise" onClick={() => handleOpenEdit(day)}>
                          <div className="exercise-text">{day.exercise || '—'}</div>
                        </td>

                        {/* 5. DSA Practice */}
                        <td className="col-dsa" onClick={() => handleOpenEdit(day)}>
                          {day.dsa ? (
                            <div className="dsa-box">
                              <Brain size={13} className="text-purple-400 shrink-0" />
                              <span className="dsa-text">{day.dsa}</span>
                            </div>
                          ) : '—'}
                          {day.dsaResult && (
                            <div className="result-sub-text text-xs text-sub">✓ {day.dsaResult}</div>
                          )}
                        </td>

                        {/* 6. Project Task */}
                        <td className="col-project" onClick={() => handleOpenEdit(day)}>
                          {day.projectTask ? (
                            <div className="project-box">
                              <FolderGit2 size={13} className="text-amber-400 shrink-0" />
                              <span className="project-text">{day.projectTask}</span>
                            </div>
                          ) : '—'}
                        </td>

                        {/* 7. Study Checklist */}
                        <td className="col-checklist">
                          {isRest ? (
                            <span className="text-xs text-sub">🧘 Rest day protocol</span>
                          ) : (
                            <div className="table-checklist-chips">
                              {['Learn', 'Code', 'DSA/Project', 'Recall'].map((item) => {
                                const checked = (day.completedTasks || []).includes(item);
                                return (
                                  <button
                                    key={item}
                                    type="button"
                                    className={`table-check-chip ${checked ? 'checked' : ''}`}
                                    onClick={() => toggleDayChecklist(day.id, item)}
                                    title={`Toggle ${item}`}
                                  >
                                    <span className="check-box-mini">{checked ? '✓' : ''}</span>
                                    <span>{item === 'DSA/Project' ? 'DSA' : item}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </td>

                        {/* 8. Minutes Studied */}
                        <td className="col-minutes" onClick={() => handleOpenEdit(day)}>
                          <div className="minutes-display" title="Click to edit study time">
                            <Clock size={12} className="text-emerald-400" />
                            <span className="font-mono font-bold">{day.actualMinutes || 0}m</span>
                          </div>
                        </td>

                        {/* 9. Confidence Rating */}
                        <td className="col-confidence">
                          <div className="table-confidence-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                className={`mini-star ${day.confidence >= star ? 'active' : ''}`}
                                onClick={() => updateDayPlan(day.id, { confidence: star === day.confidence ? 0 : star })}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </td>

                        {/* 10. Actions */}
                        <td className="col-actions">
                          <button
                            type="button"
                            className="btn-icon btn-ghost btn-sm"
                            onClick={(e) => handleOpenEdit(day, e)}
                            title="Edit all fields & logs for this day"
                          >
                            <Edit3 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          6. VIEW 2: CARDS VIEW
          ======================================================== */}
      {activeSubmenu === 'plan' && viewMode === 'cards' && (
        <div className="dev-cards-grid">
          {filteredDays.map((day) => {
            const isDone = day.status === 'Completed' || day.completion === 'Done';
            const isRest = day.planStatus === 'Rest';
            const isToday = day.date === todayDateStr;

            return (
              <div 
                key={day.id} 
                className={`dev-card card ${isDone ? 'card-done' : ''} ${isRest ? 'card-rest' : ''} ${isToday ? 'card-today' : ''}`}
                onClick={() => handleOpenEdit(day)}
              >
                <div className="card-top-bar">
                  <div className="card-day-badge">
                    <span className="font-bold text-sm">Day {day.day}</span>
                    <span className="card-date-badge font-mono text-xs">{day.date}</span>
                    {isToday && <span className="today-indicator">TODAY</span>}
                  </div>

                  <button
                    type="button"
                    className={`card-status-pill ${isRest ? 'rest' : isDone ? 'done' : 'pending'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDayComplete(day.id);
                    }}
                  >
                    {isRest ? '🧘 Rest Day' : isDone ? '✓ Completed' : 'Study'}
                  </button>
                </div>

                <h4 className="card-topic-title">{day.mainTopic}</h4>

                {day.concepts && (
                  <p className="card-concepts-text text-sub text-xs">{day.concepts}</p>
                )}

                {day.exercise && (
                  <div className="card-exercise-box">
                    <span className="exercise-label">Exercise:</span>
                    <span className="exercise-desc text-xs">{day.exercise}</span>
                  </div>
                )}

                <div className="card-tracks-row">
                  {day.dsa && (
                    <div className="track-pill dsa">
                      <Brain size={12} />
                      <span className="truncate">{day.dsa}</span>
                    </div>
                  )}
                  {day.projectTask && (
                    <div className="track-pill project">
                      <FolderGit2 size={12} />
                      <span className="truncate">{day.projectTask}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer: Checklist & Minutes */}
                <div className="card-footer-row">
                  <div className="card-check-mini-group">
                    {['Learn', 'Code', 'DSA/Project', 'Recall'].map((item) => {
                      const checked = (day.completedTasks || []).includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          className={`card-check-dot ${checked ? 'on' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDayChecklist(day.id, item);
                          }}
                          title={`Toggle ${item}`}
                        >
                          {item[0]}
                        </button>
                      );
                    })}
                  </div>

                  <div className="card-stats-mini">
                    <span className="text-xs text-sub font-mono">{day.actualMinutes || 0}m</span>
                    <div className="card-stars">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className={`star-char ${day.confidence >= s ? 'lit' : ''}`}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          7. VIEW 3: DAILY FOCUS DEEP-DIVE MODE
          ======================================================== */}
      {activeSubmenu === 'plan' && viewMode === 'daily-focus' && currentFocusDay && (
        <div className="daily-focus-container card">
          <div className="focus-header-nav">
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              disabled={focusDayIndex === 0}
              onClick={() => setFocusDayIndex(prev => Math.max(0, prev - 1))}
            >
              <ArrowLeft size={16} />
              <span>Day {currentFocusDay.day - 1}</span>
            </button>

            <div className="focus-selector">
              <span className="font-bold text-lg text-cyan">Day {currentFocusDay.day} of {totalPlanDays}</span>
              <span className="text-xs text-sub font-mono">{currentFocusDay.date} • {currentFocusDay.cycle}</span>
            </div>

            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              disabled={focusDayIndex >= safeDays.length - 1}
              onClick={() => setFocusDayIndex(prev => Math.min(safeDays.length - 1, prev + 1))}
            >
              <span>Day {currentFocusDay.day + 1}</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="focus-main-card card">
            <div className="focus-card-header">
              <div>
                <span className="badge badge-primary">{currentFocusDay.cycle}</span>
                <h3 className="focus-title mt-2">{currentFocusDay.mainTopic}</h3>
                <p className="focus-concepts text-sub">{currentFocusDay.concepts}</p>
              </div>

              <button 
                type="button" 
                className={`btn btn-lg ${currentFocusDay.status === 'Completed' ? 'btn-success' : 'btn-primary'}`}
                onClick={() => toggleDayComplete(currentFocusDay.id)}
              >
                <Check size={18} />
                <span>{currentFocusDay.status === 'Completed' ? 'Completed!' : 'Mark Day Complete'}</span>
              </button>
            </div>

            {/* Exercise criteria */}
            <div className="focus-exercise-box">
              <h5 className="font-bold text-xs uppercase tracking-wider text-emerald-400">Acceptance Criteria / Exercise:</h5>
              <p className="text-sm mt-1">{currentFocusDay.exercise || 'No specific exercise defined.'}</p>
            </div>

            {/* 2-column details: DSA & Project */}
            <div className="focus-details-grid">
              <div className="focus-detail-card dsa card">
                <div className="detail-card-title">
                  <Brain size={18} className="text-purple-400" />
                  <span className="font-bold">🧠 DSA Practice Problem</span>
                </div>
                <p className="text-sm mt-1">{currentFocusDay.dsa || 'DSA review'}</p>
                <div className="mt-3">
                  <input 
                    type="text"
                    className="form-input text-xs"
                    placeholder="Record your DSA result / complexity notes..."
                    value={currentFocusDay.dsaResult || ''}
                    onChange={(e) => updateDayPlan(currentFocusDay.id, { dsaResult: e.target.value })}
                  />
                </div>
              </div>

              <div className="focus-detail-card project card">
                <div className="detail-card-title">
                  <FolderGit2 size={18} className="text-amber-400" />
                  <span className="font-bold">🚀 Project Task</span>
                </div>
                <p className="text-sm mt-1">{currentFocusDay.projectTask || 'Project implementation'}</p>
                <div className="mt-3">
                  <input 
                    type="text"
                    className="form-input text-xs"
                    placeholder="Record code repo / component built..."
                    value={currentFocusDay.projectOutput || ''}
                    onChange={(e) => updateDayPlan(currentFocusDay.id, { projectOutput: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Interactive Checklist & Study Minutes */}
            <div className="focus-logger-row card">
              <div className="focus-checklist-group">
                <span className="text-xs font-bold uppercase text-sub">Daily Checklist:</span>
                <div className="focus-chips-row">
                  {['Learn', 'Code', 'DSA/Project', 'Recall'].map((item) => {
                    const checked = (currentFocusDay.completedTasks || []).includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        className={`focus-check-btn ${checked ? 'checked' : ''}`}
                        onClick={() => toggleDayChecklist(currentFocusDay.id, item)}
                      >
                        <span className="check-box-mini">{checked ? '✓' : ''}</span>
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="focus-time-group">
                <span className="text-xs font-bold uppercase text-sub">Minutes Studied:</span>
                <div className="focus-time-controls">
                  <input 
                    type="number"
                    min="0"
                    step="15"
                    className="form-input time-input-sm"
                    value={currentFocusDay.actualMinutes || 0}
                    onChange={(e) => updateDayPlan(currentFocusDay.id, { actualMinutes: Number(e.target.value) || 0 })}
                  />
                  <button type="button" className="btn btn-ghost btn-xs" onClick={() => updateDayPlan(currentFocusDay.id, { actualMinutes: (Number(currentFocusDay.actualMinutes) || 0) + 30 })}>+30m</button>
                  <button type="button" className="btn btn-ghost btn-xs" onClick={() => updateDayPlan(currentFocusDay.id, { actualMinutes: (Number(currentFocusDay.actualMinutes) || 0) + 60 })}>+1h</button>
                </div>
              </div>

              <div className="focus-confidence-group">
                <span className="text-xs font-bold uppercase text-sub">Confidence:</span>
                <div className="table-confidence-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`mini-star ${currentFocusDay.confidence >= star ? 'active' : ''}`}
                      onClick={() => updateDayPlan(currentFocusDay.id, { confidence: star === currentFocusDay.confidence ? 0 : star })}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Blockers & Tomorrow's Goal */}
            <div className="focus-logs-grid">
              <div className="form-group">
                <label className="form-label text-xs font-bold text-rose-400">Mistakes / Blockers Encountered</label>
                <textarea 
                  className="form-textarea text-xs"
                  rows={2}
                  placeholder="What was difficult or what mistake did you make today?"
                  value={currentFocusDay.notes || currentFocusDay.mistakesBlockers || ''}
                  onChange={(e) => updateDayPlan(currentFocusDay.id, { notes: e.target.value, mistakesBlockers: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label text-xs font-bold text-cyan">Tomorrow's First Priority</label>
                <textarea 
                  className="form-textarea text-xs"
                  rows={2}
                  placeholder="What will you jump into first thing tomorrow?"
                  value={currentFocusDay.tomorrowsTask || ''}
                  onChange={(e) => updateDayPlan(currentFocusDay.id, { tomorrowsTask: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          8. SUBMENU 2: TECH CONCEPTS TAB (33 Concepts)
          ======================================================== */}
      {activeSubmenu === 'concepts' && (
        <div className="tech-concepts-container">
          <div className="concepts-header card">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Brain size={20} className="text-cyan" />
                <span>33 Core Professional Concepts</span>
              </h3>
              <p className="text-xs text-sub mt-1">
                Beyond syntax: Master HTTP, security, databases, system architecture, testing, and runtime internals.
              </p>
            </div>

            {/* Filter by Area */}
            <div className="concepts-filter-bar">
              <div className="area-tabs-scroll">
                {conceptAreas.map(area => (
                  <button
                    key={area}
                    type="button"
                    className={`area-pill ${conceptAreaFilter === area ? 'active' : ''}`}
                    onClick={() => setConceptAreaFilter(area)}
                  >
                    {area}
                  </button>
                ))}
              </div>

              <div className="search-input-wrapper">
                <Search size={14} className="search-icon text-muted" />
                <input 
                  type="text"
                  className="search-input"
                  placeholder="Search concepts..."
                  value={conceptSearch}
                  onChange={(e) => setConceptSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="concepts-grid">
            {filteredConcepts.map((item) => (
              <div 
                key={item.id} 
                className={`concept-card card ${item.mastered ? 'mastered' : ''}`}
                onClick={() => toggleConceptMastery(item.id)}
              >
                <div className="concept-top-row">
                  <span className="badge badge-secondary text-xs">{item.area}</span>
                  <div className="concept-badges-right">
                    <span className={`priority-tag ${item.priority.toLowerCase()}`}>{item.priority}</span>
                    <button
                      type="button"
                      className={`concept-mastery-btn ${item.mastered ? 'checked' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleConceptMastery(item.id);
                      }}
                    >
                      {item.mastered ? '✓ Mastered' : 'Mark Mastered'}
                    </button>
                  </div>
                </div>

                <h4 className="concept-title mt-2">{item.concept}</h4>
                <p className="concept-what text-sub text-xs mt-1">{item.whatToUnderstand}</p>

                <div className="concept-exercise-box mt-3">
                  <span className="text-xs font-bold text-emerald-400">Exercise:</span>
                  <span className="text-xs text-secondary ml-1">{item.exercise}</span>
                </div>

                <div className="concept-mastery-check mt-2">
                  <span className="text-xs font-bold text-purple-400">Mastery Check:</span>
                  <span className="text-xs text-secondary ml-1">{item.masteryCheck}</span>
                </div>

                {item.resource && item.resource.startsWith('http') && (
                  <a 
                    href={item.resource} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="concept-resource-link mt-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>Read Docs / Guide</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          9. SUBMENU 3: WEEKLY REVIEWS TAB (17 Weeks)
          ======================================================== */}
      {activeSubmenu === 'reviews' && (
        <div className="weekly-reviews-container">
          <div className="reviews-header card">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FileText size={20} className="text-purple-400" />
              <span>17 Weekly Retrospective Checklists</span>
            </h3>
            <p className="text-xs text-sub mt-1">
              Review every 7-day period to reinforce concepts, celebrate milestones, and fix recurring blockers.
            </p>
          </div>

          <div className="reviews-grid">
            {(devPlanWeeklyReviews || []).map((review) => (
              <div key={review.id} className="review-card card">
                <div className="review-card-header">
                  <div className="review-week-title">
                    <span className="font-bold text-base">Week {review.week}</span>
                    <span className="text-xs text-sub">Days {review.daysCovered} • Review: {review.formattedDate || review.reviewDate}</span>
                  </div>

                  <div className="review-checklist-badge">
                    <span className="text-xs text-cyan font-bold">{review.checklist}</span>
                  </div>
                </div>

                <div className="review-fields-grid mt-3">
                  <div className="form-group">
                    <label className="form-label text-xs font-bold text-secondary">Concepts I Can Explain Unaided</label>
                    <textarea 
                      className="form-textarea text-xs"
                      rows={2}
                      placeholder="e.g. Closures, Event Loop, Flexbox, React Hooks..."
                      value={review.conceptsExplained || ''}
                      onChange={(e) => updateWeeklyReview(review.id, { conceptsExplained: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label text-xs font-bold text-secondary">Biggest Mistake / Lesson Learned</label>
                    <textarea 
                      className="form-textarea text-xs"
                      rows={2}
                      placeholder="e.g. Spent too much time over-engineering without testing edge cases..."
                      value={review.biggestMistake || ''}
                      onChange={(e) => updateWeeklyReview(review.id, { biggestMistake: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label text-xs font-bold text-secondary">Project Milestone Achieved</label>
                    <input 
                      type="text"
                      className="form-input text-xs"
                      placeholder="e.g. Deployed Expense Tracker to GitHub Pages"
                      value={review.projectMilestone || ''}
                      onChange={(e) => updateWeeklyReview(review.id, { projectMilestone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label text-xs font-bold text-secondary">Next Week's High Priority Goal</label>
                    <input 
                      type="text"
                      className="form-input text-xs"
                      placeholder="e.g. Master TypeScript Generics & Redux Toolkit"
                      value={review.nextWeekPriority || ''}
                      onChange={(e) => updateWeeklyReview(review.id, { nextWeekPriority: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          10. SUBMENU 4: CURATED RESOURCES TAB (16 Resources)
          ======================================================== */}
      {activeSubmenu === 'resources' && (
        <div className="resources-container">
          <div className="resources-header card">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <BookOpen size={20} className="text-amber-400" />
              <span>16 Curated Learning Paths & Docs</span>
            </h3>
            <p className="text-xs text-sub mt-1">
              Authoritative references, official documentation, and curated study tracks.
            </p>
          </div>

          <div className="resources-grid mt-4">
            {(devPlanResources || []).map((res) => (
              <div key={res.id} className="resource-item-card card">
                <div className="resource-topic-badge">
                  <span className="font-bold text-sm text-cyan">{res.topic}</span>
                </div>

                <p className="resource-how text-xs text-secondary mt-2">
                  {res.howToUse}
                </p>

                {res.url && res.url.startsWith('http') ? (
                  <a 
                    href={res.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="resource-cta-link mt-4"
                  >
                    <span className="truncate">{res.url}</span>
                    <ExternalLink size={14} className="shrink-0" />
                  </a>
                ) : (
                  <span className="text-xs text-muted mt-3">{res.url}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          11. SUBMENU 5: AI WORKFLOW RULES TAB (5 Steps)
          ======================================================== */}
      {activeSubmenu === 'ai-workflow' && (
        <div className="ai-workflow-container">
          <div className="ai-header card">
            <div className="ai-badge-row">
              <Bot size={22} className="text-rose-400" />
              <div>
                <h3 className="font-bold text-lg">AI-Assisted Learning Rules & Reusable Prompts</h3>
                <p className="text-xs text-sub mt-1">
                  Do not copy-paste code blindly! Follow this 5-step engineering framework to maximize actual retention.
                </p>
              </div>
            </div>
          </div>

          <div className="ai-steps-list mt-4">
            {(devPlanAiWorkflow || []).map((step) => {
              const isCopied = copiedPromptId === step.id;
              return (
                <div key={step.id} className="ai-step-card card">
                  <div className="ai-step-top">
                    <div className="ai-step-title-group">
                      <span className="step-number-tag">{step.step}</span>
                      <p className="step-what text-sm text-primary font-semibold">{step.whatToDo}</p>
                    </div>

                    <button 
                      type="button"
                      className={`btn btn-secondary btn-sm copy-prompt-btn ${isCopied ? 'copied' : ''}`}
                      onClick={() => handleCopyPrompt(step.id, step.prompt)}
                    >
                      {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{isCopied ? 'Copied Prompt!' : 'Copy Prompt'}</span>
                    </button>
                  </div>

                  <div className="prompt-quote-box mt-3">
                    <span className="prompt-label text-xs font-bold text-indigo-400">Reusable Prompt:</span>
                    <p className="prompt-text text-xs font-mono mt-1">"{step.prompt}"</p>
                  </div>

                  <div className="evidence-box mt-2">
                    <span className="evidence-label text-xs font-bold text-emerald-400">Evidence to Record:</span>
                    <span className="evidence-text text-xs text-sub ml-1">{step.evidence}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          12. MODALS
          ======================================================== */}
      <DateAdjustModal 
        isOpen={isDateAdjustModalOpen} 
        onClose={() => setIsDateAdjustModalOpen(false)} 
      />

      <DayEditModal 
        isOpen={isDayEditModalOpen} 
        onClose={() => {
          setIsDayEditModalOpen(false);
          setDayToEdit(null);
        }} 
        dayToEdit={dayToEdit} 
      />

      {/* ========================================================
          13. STYLES
          ======================================================== */}
      <style>{`
        .dev-roadmap-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding-bottom: 3rem;
        }

        /* Submenu Navigation Bar */
        .career-submenu-bar {
          padding: 0.5rem;
          overflow-x: auto;
        }

        .career-submenu-items {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-width: max-content;
        }

        .career-submenu-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.65rem 1.1rem;
          border-radius: var(--radius-md);
          border: 1px solid transparent;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .career-submenu-item:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .career-submenu-item.active {
          background: var(--accent-primary);
          color: #ffffff;
          box-shadow: 0 4px 14px var(--accent-primary-glow);
        }

        .submenu-badge {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.15);
          color: inherit;
        }

        .submenu-badge.cyan { background: rgba(14, 165, 233, 0.2); color: #38bdf8; }
        .submenu-badge.purple { background: rgba(139, 92, 246, 0.2); color: #c084fc; }
        .submenu-badge.amber { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
        .submenu-badge.rose { background: rgba(244, 63, 94, 0.2); color: #fb7185; }

        /* Hero Header */
        .dev-plan-hero {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(14, 165, 233, 0.05));
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        @media (min-width: 860px) {
          .dev-plan-hero {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .hero-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .hero-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: var(--accent-cyan);
          background: rgba(14, 165, 233, 0.12);
          border: 1px solid rgba(14, 165, 233, 0.3);
          border-radius: var(--radius-full);
          padding: 0.25rem 0.75rem;
          width: fit-content;
        }

        .hero-heading {
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.25;
        }

        .hero-progress-block {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-top: 0.35rem;
        }

        .hero-progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .hero-progress-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .hero-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #0ea5e9, #10b981);
          border-radius: var(--radius-full);
          transition: width 0.4s ease;
        }

        .cycle-pills-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          margin-top: 0.35rem;
        }

        .cycle-pill {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
        }

        .cycle-pill.c1 { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .cycle-pill.c2 { background: rgba(14, 165, 233, 0.15); color: #38bdf8; }
        .cycle-pill.c3 { background: rgba(139, 92, 246, 0.15); color: #c084fc; }
        .cycle-pill.c4 { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }

        .hero-right {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          align-items: center;
        }

        .countdown-card {
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 170px;
        }

        .countdown-number {
          font-size: 2.2rem;
          font-weight: 900;
          font-family: monospace;
          color: var(--accent-cyan);
          line-height: 1;
        }

        .countdown-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-top: 0.2rem;
        }

        .today-focus-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.15rem;
          background: rgba(14, 165, 233, 0.1);
          border: 1px dashed rgba(14, 165, 233, 0.4);
          border-radius: var(--radius-md);
          padding: 0.5rem 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
          max-width: 200px;
          text-align: center;
        }

        .today-focus-pill:hover {
          background: rgba(14, 165, 233, 0.18);
          transform: translateY(-1px);
        }

        /* Schedule Toolbar */
        .schedule-toolbar {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          padding: 0.85rem 1rem;
        }

        @media (min-width: 768px) {
          .schedule-toolbar {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .schedule-toolbar-left, .schedule-toolbar-right {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
        }

        .date-adjust-quick-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .schedule-start-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.4rem 0.65rem;
        }

        .view-mode-tabs {
          display: flex;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.2rem;
          gap: 0.2rem;
        }

        .view-mode-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.65rem;
          border-radius: 4px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
        }

        .view-mode-btn.active {
          background: var(--accent-primary);
          color: #ffffff;
        }

        /* Plan Filters */
        .plan-filters-row {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        @media (min-width: 860px) {
          .plan-filters-row {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .cycle-tabs-scroll {
          display: flex;
          gap: 0.4rem;
          overflow-x: auto;
          padding-bottom: 0.25rem;
        }

        .cycle-tab-btn {
          padding: 0.45rem 0.85rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 0.78rem;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cycle-tab-btn:hover {
          color: var(--text-primary);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .cycle-tab-btn.active {
          background: var(--accent-primary);
          color: #ffffff;
          border-color: var(--accent-primary);
        }

        .status-search-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-select-sm {
          padding: 0.45rem 0.65rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 0.8rem;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 0.65rem;
          pointer-events: none;
        }

        .search-input {
          padding: 0.45rem 0.65rem 0.45rem 2rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 0.8rem;
          width: 190px;
        }

        .clear-search-btn {
          position: absolute;
          right: 0.4rem;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 1rem;
        }

        /* Spreadsheet Table */
        .dev-plan-table-card {
          padding: 0;
          overflow: hidden;
        }

        .table-responsive {
          overflow-x: auto;
          max-height: 75vh;
        }

        .dev-excel-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.82rem;
          text-align: left;
        }

        .dev-excel-table thead th {
          position: sticky;
          top: 0;
          background: #111726;
          color: var(--text-secondary);
          font-weight: 700;
          padding: 0.75rem 0.85rem;
          border-bottom: 2px solid var(--border-color);
          white-space: nowrap;
          z-index: 10;
        }

        .table-day-row {
          border-bottom: 1px solid var(--border-color);
          transition: background 0.15s ease;
        }

        .table-day-row:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .table-day-row.row-done {
          background: rgba(16, 185, 129, 0.04);
        }

        .table-day-row.row-rest {
          background: rgba(245, 158, 11, 0.04);
        }

        .table-day-row.row-today {
          background: rgba(14, 165, 233, 0.09);
          border-left: 3px solid var(--accent-cyan);
        }

        .highlight-pulse {
          animation: pulseGlow 1s ease infinite alternate;
        }

        @keyframes pulseGlow {
          from { background: rgba(14, 165, 233, 0.15); }
          to { background: rgba(14, 165, 233, 0.35); }
        }

        .dev-excel-table td {
          padding: 0.75rem 0.85rem;
          vertical-align: top;
        }

        .col-day {
          min-width: 120px;
        }

        .day-number-badge {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .day-num {
          font-weight: 800;
          color: var(--text-primary);
          font-size: 0.88rem;
        }

        .today-indicator {
          font-size: 0.62rem;
          font-weight: 800;
          color: #0284c7;
          background: rgba(14, 165, 233, 0.2);
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
        }

        .inline-date-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0;
          margin-top: 0.15rem;
        }

        .inline-date-btn:hover {
          color: var(--accent-cyan);
        }

        .cycle-sub-text {
          display: block;
          font-size: 0.65rem;
          color: var(--text-muted);
          margin-top: 0.15rem;
        }

        .status-pill {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.3rem 0.65rem;
          border-radius: var(--radius-full);
          border: none;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .status-pill.status-done { background: rgba(16, 185, 129, 0.2); color: #34d399; }
        .status-pill.status-rest { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
        .status-pill.status-progress { background: rgba(14, 165, 233, 0.2); color: #38bdf8; }
        .status-pill.status-pending { background: rgba(255, 255, 255, 0.08); color: var(--text-secondary); }

        .col-topic {
          min-width: 220px;
          cursor: pointer;
        }

        .topic-title {
          font-weight: 700;
          color: var(--text-primary);
        }

        .col-exercise {
          min-width: 240px;
          cursor: pointer;
          line-height: 1.4;
          color: var(--text-secondary);
        }

        .col-dsa {
          min-width: 180px;
          cursor: pointer;
        }

        .dsa-box {
          display: flex;
          align-items: flex-start;
          gap: 0.4rem;
        }

        .col-project {
          min-width: 180px;
          cursor: pointer;
        }

        .project-box {
          display: flex;
          align-items: flex-start;
          gap: 0.4rem;
        }

        .table-checklist-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          max-width: 180px;
        }

        .table-check-chip {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.2rem 0.45rem;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-secondary);
          font-size: 0.68rem;
          cursor: pointer;
        }

        .table-check-chip.checked {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.4);
          color: #34d399;
          font-weight: 700;
        }

        .check-box-mini {
          font-size: 0.6rem;
          font-weight: 900;
        }

        .minutes-display {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          cursor: pointer;
        }

        .table-confidence-stars {
          display: flex;
          align-items: center;
          gap: 0.1rem;
        }

        .mini-star {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.18);
          font-size: 1.1rem;
          padding: 0;
          cursor: pointer;
          line-height: 1;
        }

        .mini-star.active {
          color: #f59e0b;
        }

        /* Cards View */
        .dev-cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .dev-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .dev-cards-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .dev-card {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dev-card:hover {
          transform: translateY(-2px);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .dev-card.card-done {
          border-color: rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.03);
        }

        .dev-card.card-rest {
          border-color: rgba(245, 158, 11, 0.3);
          background: rgba(245, 158, 11, 0.03);
        }

        .dev-card.card-today {
          border-color: var(--accent-cyan);
          background: rgba(14, 165, 233, 0.06);
          box-shadow: 0 0 16px rgba(14, 165, 233, 0.15);
        }

        .card-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-day-badge {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .card-date-badge {
          color: var(--text-muted);
        }

        .card-status-pill {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);
          border: none;
          cursor: pointer;
        }

        .card-status-pill.done { background: rgba(16, 185, 129, 0.2); color: #34d399; }
        .card-status-pill.rest { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
        .card-status-pill.pending { background: rgba(255, 255, 255, 0.08); color: var(--text-secondary); }

        .card-topic-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .card-exercise-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.5rem 0.65rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .exercise-label {
          font-size: 0.68rem;
          font-weight: 800;
          color: var(--accent-cyan);
          text-transform: uppercase;
        }

        .card-tracks-row {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .track-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .track-pill.dsa { background: rgba(139, 92, 246, 0.1); color: #c084fc; }
        .track-pill.project { background: rgba(245, 158, 11, 0.1); color: #fbbf24; }

        .card-footer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-color);
          padding-top: 0.5rem;
          margin-top: auto;
        }

        .card-check-mini-group {
          display: flex;
          gap: 0.3rem;
        }

        .card-check-dot {
          width: 22px;
          height: 22px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-muted);
          font-size: 0.68rem;
          font-weight: 800;
          cursor: pointer;
        }

        .card-check-dot.on {
          background: #10b981;
          border-color: #10b981;
          color: #ffffff;
        }

        .card-stats-mini {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .card-stars {
          display: flex;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.18);
        }

        .star-char.lit {
          color: #f59e0b;
        }

        /* Daily Focus Mode */
        .daily-focus-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 1.25rem;
        }

        .focus-header-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .focus-selector {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .focus-main-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 1.5rem;
        }

        .focus-card-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .focus-card-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
          }
        }

        .focus-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .focus-exercise-box {
          background: rgba(16, 185, 129, 0.06);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: var(--radius-md);
          padding: 1rem;
        }

        .focus-details-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .focus-details-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .focus-detail-card {
          padding: 1rem;
        }

        .detail-card-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .focus-logger-row {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1rem;
        }

        @media (min-width: 768px) {
          .focus-logger-row {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .focus-chips-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-top: 0.35rem;
        }

        .focus-check-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.75rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-secondary);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
        }

        .focus-check-btn.checked {
          background: rgba(16, 185, 129, 0.2);
          border-color: rgba(16, 185, 129, 0.5);
          color: #34d399;
        }

        .focus-time-controls {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-top: 0.35rem;
        }

        .time-input-sm {
          width: 75px;
          padding: 0.35rem 0.5rem;
          font-weight: 800;
          font-family: monospace;
        }

        .focus-logs-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .focus-logs-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        /* Tech Concepts */
        .tech-concepts-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .concepts-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.25rem;
        }

        .concepts-filter-bar {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        @media (min-width: 768px) {
          .concepts-filter-bar {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .area-tabs-scroll {
          display: flex;
          gap: 0.35rem;
          overflow-x: auto;
          padding-bottom: 0.25rem;
        }

        .area-pill {
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
        }

        .area-pill.active {
          background: var(--accent-cyan);
          border-color: var(--accent-cyan);
          color: #000000;
          font-weight: 800;
        }

        .concepts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .concepts-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .concepts-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .concept-card {
          padding: 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .concept-card:hover {
          transform: translateY(-2px);
          border-color: rgba(14, 165, 233, 0.4);
        }

        .concept-card.mastered {
          border-color: rgba(16, 185, 129, 0.4);
          background: rgba(16, 185, 129, 0.03);
        }

        .concept-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .concept-badges-right {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .priority-tag {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
        }

        .priority-tag.high { background: rgba(244, 63, 94, 0.2); color: #fb7185; }
        .priority-tag.medium { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }

        .concept-mastery-btn {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .concept-mastery-btn.checked {
          background: #10b981;
          border-color: #10b981;
          color: #ffffff;
        }

        .concept-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .concept-resource-link {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          color: var(--accent-cyan);
          text-decoration: none;
          margin-top: auto;
        }

        .concept-resource-link:hover {
          text-decoration: underline;
        }

        /* Weekly Reviews */
        .weekly-reviews-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .reviews-header {
          padding: 1.25rem;
        }

        .reviews-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 768px) {
          .reviews-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .review-card {
          padding: 1.2rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .review-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
        }

        .review-week-title {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .review-fields-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        /* Resources */
        .resources-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .resources-header {
          padding: 1.25rem;
        }

        .resources-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .resources-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .resources-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .resource-item-card {
          padding: 1.2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .resource-cta-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
          background: rgba(14, 165, 233, 0.1);
          color: var(--accent-cyan);
          text-decoration: none;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .resource-cta-link:hover {
          background: rgba(14, 165, 233, 0.2);
        }

        /* AI Workflow */
        .ai-workflow-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .ai-header {
          padding: 1.25rem;
        }

        .ai-badge-row {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
        }

        .ai-steps-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .ai-step-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .ai-step-top {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        @media (min-width: 640px) {
          .ai-step-top {
            flex-direction: row;
            align-items: flex-start;
            justify-content: space-between;
          }
        }

        .ai-step-title-group {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .step-number-tag {
          font-weight: 800;
          font-size: 0.82rem;
          color: #fb7185;
          background: rgba(244, 63, 94, 0.15);
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-sm);
          white-space: nowrap;
        }

        .copy-prompt-btn {
          white-space: nowrap;
        }

        .copy-prompt-btn.copied {
          background: rgba(16, 185, 129, 0.15);
          border-color: #10b981;
          color: #34d399;
        }

        .prompt-quote-box {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-left: 3px solid var(--accent-primary);
          border-radius: var(--radius-sm);
          padding: 0.75rem 1rem;
        }

        .evidence-box {
          background: rgba(16, 185, 129, 0.05);
          border: 1px dashed rgba(16, 185, 129, 0.3);
          border-radius: var(--radius-sm);
          padding: 0.5rem 0.75rem;
        }

        @media (max-width: 640px) {
          .desktop-only { display: none !important; }
        }
      `}</style>
    </div>
  );
};