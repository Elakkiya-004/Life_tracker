import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { HabitTodoItem } from '../components/habits/HabitTodoItem';
import { HabitCard } from '../components/habits/HabitCard';
import { HabitModal } from '../components/habits/HabitModal';
import { HabitHistoryModal } from '../components/habits/HabitHistoryModal';
import { 
  Plus, 
  Flame, 
  Sunrise, 
  Sun, 
  Moon, 
  Clock, 
  Sparkles,
  ListTodo,
  LayoutGrid,
  RotateCcw,
  CheckCheck,
  Search,
  Calendar,
  Trash2,
  CheckSquare,
  Square,
  X,
  RefreshCw,
  Sliders
} from 'lucide-react';

export const HabitsView = () => {
  const { 
    habits = [], 
    todayCompletedHabits = 0, 
    todayHabitProgress = 0, 
    addHabit, 
    deleteHabit,
    bulkDeleteHabits,
    clearAllHabits,
    resetHabitsToDefault,
    markAllHabitsToday, 
    resetAllHabitsToday,
    settings = {},
    updateSettings,
    todayStr 
  } = useApp();

  const [quickInput, setQuickInput] = useState('');
  const [quickTimeOfDay, setQuickTimeOfDay] = useState('Morning');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all'); // 'all' | 'todo' | 'completed'
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('All'); // 'All' | 'Morning' | 'Daytime' | 'Evening'
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('checklist'); // 'checklist' | 'cards'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState(null);

  // Bulk Selection & Deletion State
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showRolloverConfig, setShowRolloverConfig] = useState(false);

  const habitsList = Array.isArray(habits) ? habits : [];
  const totalCount = habitsList.length;
  const completedCount = habitsList.filter(h => h.completedDates?.includes(todayStr)).length;
  const remainingCount = totalCount - completedCount;

  const averageStreak = totalCount > 0 
    ? (habitsList.reduce((sum, h) => sum + (h.streak || 0), 0) / totalCount).toFixed(1) 
    : 0;

  const rolloverMode = settings?.habitRolloverMode || 'fresh_checks'; // 'fresh_checks' | 'auto_clear'

  // Filter habits based on Status, Time of Day, and Search Query
  const filteredHabits = useMemo(() => {
    return habitsList.filter(h => {
      const isDone = h.completedDates?.includes(todayStr);

      // Status filter
      if (selectedStatusFilter === 'todo' && isDone) return false;
      if (selectedStatusFilter === 'completed' && !isDone) return false;

      // Time filter
      if (selectedTimeFilter !== 'All') {
        const matchesTime = h.timeOfDay === selectedTimeFilter || 
          (selectedTimeFilter === 'Morning' && h.category === 'Morning') || 
          (selectedTimeFilter === 'Evening' && (h.category === 'Night' || h.timeOfDay === 'Evening'));
        if (!matchesTime) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = h.name?.toLowerCase().includes(query);
        const matchesCategory = h.category?.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory) return false;
      }

      return true;
    });
  }, [habitsList, selectedStatusFilter, selectedTimeFilter, searchQuery, todayStr]);

  // Bulk Selection Handlers
  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredHabits.map(h => h.id);
    setSelectedIds(filteredIds);
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected habit(s)?`)) {
      bulkDeleteHabits(selectedIds);
      setSelectedIds([]);
      if (habitsList.length - selectedIds.length === 0) {
        setIsBulkMode(false);
      }
    }
  };

  const handleClearAll = () => {
    if (window.confirm('⚠️ Are you sure you want to delete ALL habits? This will give you an empty fresh list to create new daily habits.')) {
      clearAllHabits();
      setSelectedIds([]);
      setIsBulkMode(false);
    }
  };

  const handleRestoreDefaults = () => {
    if (window.confirm('Restore the standard 14 daily routine habits?')) {
      resetHabitsToDefault();
      setSelectedIds([]);
    }
  };

  const toggleRolloverMode = () => {
    const newMode = rolloverMode === 'fresh_checks' ? 'auto_clear' : 'fresh_checks';
    updateSettings({ habitRolloverMode: newMode });
  };

  // Handle Quick Add inline
  const handleQuickAdd = (e) => {
    e.preventDefault();
    const title = quickInput.trim();
    if (!title) {
      const inputEl = document.querySelector('.quick-todo-input');
      if (inputEl) inputEl.focus();
      return;
    }

    let defaultColor = '#f59e0b';
    let defaultIcon = 'Sunrise';
    let category = 'Routine';

    if (quickTimeOfDay === 'Morning') {
      defaultColor = '#f59e0b';
      defaultIcon = 'Sunrise';
      category = 'Morning';
    } else if (quickTimeOfDay === 'Daytime') {
      defaultColor = '#0ea5e9';
      defaultIcon = 'Zap';
      category = 'Daytime';
    } else if (quickTimeOfDay === 'Evening') {
      defaultColor = '#8b5cf6';
      defaultIcon = 'Moon';
      category = 'Night';
    }

    addHabit({
      name: title,
      category,
      timeOfDay: quickTimeOfDay,
      icon: defaultIcon,
      color: defaultColor,
      frequency: 'daily',
      targetDays: 7,
    });

    if (selectedStatusFilter === 'completed') {
      setSelectedStatusFilter('all');
    }
    if (selectedTimeFilter !== 'All' && selectedTimeFilter !== quickTimeOfDay) {
      setSelectedTimeFilter('All');
    }
    setSearchQuery('');
    setQuickInput('');
  };

  const handleEdit = (habit) => {
    setHabitToEdit(habit);
    setIsModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setHabitToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="habits-todo-view">
      {/* Header & Daily Progress Banner */}
      <div className="todo-header-card card">
        <div className="header-top-row">
          <div className="header-title-block">
            <div className="header-badges-line">
              <div className="todo-header-badge">
                <ListTodo size={16} />
                <span>DAILY TO-DO & ROUTINES</span>
              </div>
              <button 
                type="button" 
                className={`reset-pill-badge clickable ${rolloverMode === 'auto_clear' ? 'badge-auto-clear' : ''}`}
                onClick={() => setShowRolloverConfig(!showRolloverConfig)}
                title="Click to configure 10:30 PM daily auto-reset behavior"
              >
                <Moon size={12} className="text-purple" />
                <span>
                  10:30 PM: {rolloverMode === 'auto_clear' ? '🧹 Auto-Clear Tasks' : '🔄 Fresh Checklist'}
                </span>
              </button>
            </div>
            <h2 className="header-main-title">
              {todayHabitProgress === 100 
                ? '🎉 All Done For Today! Amazing Job!' 
                : `Today's Checklist (${completedCount}/${totalCount} completed)`}
            </h2>
          </div>

          {/* Action Buttons: Batch Operations & 30-Day History */}
          <div className="header-actions-group">
            <button 
              type="button"
              className={`btn btn-sm ${isBulkMode ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setIsBulkMode(!isBulkMode);
                if (isBulkMode) setSelectedIds([]);
              }}
              title="Select multiple habits to delete in bulk"
            >
              <CheckSquare size={15} />
              <span>{isBulkMode ? 'Exit Selection' : 'Bulk Delete'}</span>
            </button>

            <button 
              type="button"
              className="btn btn-secondary btn-sm history-open-btn"
              onClick={() => setIsHistoryModalOpen(true)}
              title="View daily completed tasks from past 30 days"
            >
              <Calendar size={15} className="text-primary" />
              <span>30-Day History</span>
            </button>

            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                markAllHabitsToday();
                if (selectedStatusFilter === 'todo') {
                  setSelectedStatusFilter('all');
                }
              }}
              title="Mark all items as completed for today"
            >
              <CheckCheck size={16} className="text-emerald-400" />
              <span>Mark All Done</span>
            </button>

            <button 
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                resetAllHabitsToday();
                if (selectedStatusFilter === 'completed') {
                  setSelectedStatusFilter('all');
                }
              }}
              title="Reset today's checks"
            >
              <RotateCcw size={15} />
              <span>Reset Today</span>
            </button>
          </div>
        </div>

        {/* 10:30 PM Auto-Rollover Mode Settings Drawer */}
        {showRolloverConfig && (
          <div className="rollover-config-box">
            <div className="rollover-config-header">
              <div className="flex-center gap-2">
                <Moon size={16} className="text-purple" />
                <span className="font-bold text-xs">10:30 PM Daily Rollover Behavior</span>
              </div>
              <button 
                type="button" 
                className="btn-icon btn-ghost btn-xs" 
                onClick={() => setShowRolloverConfig(false)}
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-xs text-sub">
              Every day at 10:30 PM (22:30), the app rolls over to the next day and archives today's completions into your 30-Day History. Choose what happens to habits after 10:30 PM:
            </p>
            <div className="rollover-options-grid">
              <label 
                className={`rollover-option-card ${rolloverMode === 'fresh_checks' ? 'active' : ''}`}
                onClick={() => updateSettings({ habitRolloverMode: 'fresh_checks' })}
              >
                <input 
                  type="radio" 
                  name="rollover" 
                  checked={rolloverMode === 'fresh_checks'} 
                  onChange={() => updateSettings({ habitRolloverMode: 'fresh_checks' })}
                />
                <div>
                  <div className="option-title">🔄 Fresh Daily Checklist (Default)</div>
                  <div className="option-desc">Keep your habit routines, but reset all checkboxes fresh and uncompleted for tomorrow.</div>
                </div>
              </label>

              <label 
                className={`rollover-option-card ${rolloverMode === 'auto_clear' ? 'active' : ''}`}
                onClick={() => updateSettings({ habitRolloverMode: 'auto_clear' })}
              >
                <input 
                  type="radio" 
                  name="rollover" 
                  checked={rolloverMode === 'auto_clear'} 
                  onChange={() => updateSettings({ habitRolloverMode: 'auto_clear' })}
                />
                <div>
                  <div className="option-title">🧹 Auto-Delete Daily Habits</div>
                  <div className="option-desc">Automatically clear/delete all habits at 10:30 PM so you get a completely blank fresh slate each day.</div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Interactive Progress Bar */}
        <div className="progress-section">
          <div className="progress-label-row">
            <span className="progress-text">
              <strong>{todayHabitProgress}% completed</strong> • {remainingCount} tasks remaining
            </span>
            <span className="streak-summary">
              <Flame size={14} className="text-amber-400" />
              <span>Avg Streak: <strong>{averageStreak}d</strong></span>
            </span>
          </div>
          <div className="todo-progress-track">
            <div 
              className="todo-progress-fill" 
              style={{ width: `${todayHabitProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ⚡ Inline Fast Add Input Bar */}
      <form onSubmit={handleQuickAdd} className="quick-todo-bar card">
        <div className="quick-input-wrap">
          <input
            type="text"
            className="quick-todo-input"
            placeholder="✍️ Add a habit / routine task... (e.g. Drink 3L water, 30 min workout, Read 10 pages)"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
          />
        </div>

        <div className="quick-bar-controls">
          <select
            className="quick-time-select select"
            value={quickTimeOfDay}
            onChange={(e) => setQuickTimeOfDay(e.target.value)}
          >
            <option value="Morning">🌅 Morning (5-9 AM)</option>
            <option value="Daytime">☀️ Daytime (9 AM-6 PM)</option>
            <option value="Evening">🌙 Evening (6-11 PM)</option>
          </select>

          <button type="submit" className="btn btn-primary quick-add-btn">
            <Plus size={16} />
            <span>Add Task</span>
          </button>

          <button 
            type="button" 
            className="btn btn-secondary quick-custom-btn"
            onClick={handleOpenCreateModal}
            title="Custom icon & color options"
          >
            <span>+ Advanced</span>
          </button>
        </div>
      </form>

      {/* Controls: Filters, Search & View Switcher */}
      <div className="todo-controls-bar">
        {/* Status Filter Tabs (All / To-Do / Completed) */}
        <div className="status-tabs-group">
          <button
            type="button"
            className={`status-tab-btn ${selectedStatusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedStatusFilter('all')}
          >
            <span>All Tasks</span>
            <span className="tab-badge">{totalCount}</span>
          </button>
          <button
            type="button"
            className={`status-tab-btn ${selectedStatusFilter === 'todo' ? 'active' : ''}`}
            onClick={() => setSelectedStatusFilter('todo')}
          >
            <span>To-Do</span>
            <span className={`tab-badge ${remainingCount > 0 ? 'badge-amber' : ''}`}>
              {remainingCount}
            </span>
          </button>
          <button
            type="button"
            className={`status-tab-btn ${selectedStatusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setSelectedStatusFilter('completed')}
          >
            <span>Done</span>
            <span className="tab-badge badge-green">{completedCount}</span>
          </button>
        </div>

        {/* Time of Day Pills */}
        <div className="time-pills-row">
          {[
            { id: 'All', label: 'All Times', icon: Clock },
            { id: 'Morning', label: '🌅 Morning', icon: Sunrise },
            { id: 'Daytime', label: '☀️ Daytime', icon: Sun },
            { id: 'Evening', label: '🌙 Evening', icon: Moon },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`time-pill-btn ${selectedTimeFilter === tab.id ? 'active' : ''}`}
              onClick={() => setSelectedTimeFilter(tab.id)}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Right Side: Search & View Mode Switcher */}
        <div className="controls-right-group">
          <div className="search-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="view-mode-toggle">
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'checklist' ? 'active' : ''}`}
              onClick={() => setViewMode('checklist')}
              title="Checklist View"
            >
              <ListTodo size={16} />
            </button>
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Expanded Cards View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Controls Bar (When Selection Mode is Active) */}
      {isBulkMode && (
        <div className="bulk-action-bar card">
          <div className="bulk-bar-left">
            <span className="bulk-count-badge">
              <strong>{selectedIds.length}</strong> of {filteredHabits.length} selected
            </span>
            <button 
              type="button" 
              className="btn btn-ghost btn-xs"
              onClick={handleSelectAllFiltered}
            >
              Select All ({filteredHabits.length})
            </button>
            {selectedIds.length > 0 && (
              <button 
                type="button" 
                className="btn btn-ghost btn-xs"
                onClick={handleDeselectAll}
              >
                Deselect All
              </button>
            )}
          </div>

          <div className="bulk-bar-right">
            <button 
              type="button" 
              className="btn btn-danger btn-sm"
              disabled={selectedIds.length === 0}
              onClick={handleBulkDelete}
              title="Delete selected habits"
            >
              <Trash2 size={14} />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>

            <button 
              type="button" 
              className="btn btn-ghost text-danger btn-sm"
              onClick={handleClearAll}
              title="Clear all habits to start fresh"
            >
              <span>Clear All Habits</span>
            </button>

            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setIsBulkMode(false);
                setSelectedIds([]);
              }}
            >
              <X size={14} />
              <span>Done</span>
            </button>
          </div>
        </div>
      )}

      {/* Task List / Checklist Grid */}
      {filteredHabits.length === 0 ? (
        <div className="card empty-state">
          <Sparkles size={40} className="text-muted" />
          <h4 className="empty-title">
            {habitsList.length === 0
              ? '✨ Clean Slate! No habits in your list.'
              : selectedStatusFilter === 'completed' 
              ? 'No completed tasks yet today' 
              : selectedStatusFilter === 'todo'
              ? '🎉 All caught up! No pending tasks remaining.' 
              : 'No habits or tasks found.'}
          </h4>
          <p className="text-sub">
            {habitsList.length === 0
              ? 'You can add new custom habits above or restore the default daily routine.'
              : selectedStatusFilter === 'completed'
              ? 'Check off tasks above to build your daily streak.'
              : 'Add your first daily routine task using the bar above.'}
          </p>
          <div className="empty-actions-row">
            {habitsList.length === 0 && (
              <button 
                type="button" 
                className="btn btn-primary btn-sm"
                onClick={handleRestoreDefaults}
              >
                <RotateCcw size={14} />
                <span>Restore Default Routines (14 Tasks)</span>
              </button>
            )}
            {selectedStatusFilter !== 'all' && (
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSelectedStatusFilter('all');
                  setSelectedTimeFilter('All');
                  setSearchQuery('');
                }}
              >
                View All Tasks
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'checklist' ? (
        <div className="checklist-container">
          {filteredHabits.map((habit) => (
            <HabitTodoItem 
              key={habit.id} 
              habit={habit} 
              onEdit={handleEdit}
              isBulkMode={isBulkMode}
              isSelected={selectedIds.includes(habit.id)}
              onToggleSelect={handleToggleSelect}
            />
          ))}
        </div>
      ) : (
        <div className="cards-grid-container">
          {filteredHabits.map((habit) => (
            <HabitCard 
              key={habit.id} 
              habit={habit} 
              onEdit={handleEdit} 
              isBulkMode={isBulkMode}
              isSelected={selectedIds.includes(habit.id)}
              onToggleSelect={handleToggleSelect}
            />
          ))}
        </div>
      )}

      {/* Full Edit / Create Modal */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setHabitToEdit(null);
        }}
        habitToEdit={habitToEdit}
      />

      {/* 30-Day Daily Progress History Modal */}
      <HabitHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      <style>{`
        .habits-todo-view {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .todo-header-card {
          padding: 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(16, 185, 129, 0.08));
          border-color: rgba(99, 102, 241, 0.25);
        }

        .header-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-title-block {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .header-badges-line {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .todo-header-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--accent-primary);
          letter-spacing: 0.05em;
        }

        .reset-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
          background: rgba(139, 92, 246, 0.12);
          border: 1px solid rgba(139, 92, 246, 0.3);
          color: #a78bfa;
          transition: all 0.2s ease;
        }

        .reset-pill-badge.clickable {
          cursor: pointer;
        }

        .reset-pill-badge.clickable:hover {
          background: rgba(139, 92, 246, 0.25);
          border-color: rgba(139, 92, 246, 0.5);
          transform: translateY(-1px);
        }

        .reset-pill-badge.badge-auto-clear {
          background: rgba(245, 158, 11, 0.15);
          border-color: rgba(245, 158, 11, 0.4);
          color: #fbbf24;
        }

        .rollover-config-box {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: var(--radius-sm);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          animation: fadeIn 0.2s ease;
        }

        .rollover-config-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .rollover-options-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }

        @media (min-width: 640px) {
          .rollover-options-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .rollover-option-card {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .rollover-option-card:hover {
          background: var(--bg-card-hover);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .rollover-option-card.active {
          background: rgba(139, 92, 246, 0.12);
          border-color: rgba(139, 92, 246, 0.5);
        }

        .option-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.2rem;
        }

        .option-desc {
          font-size: 0.72rem;
          color: var(--text-secondary);
          line-height: 1.35;
        }

        .bulk-action-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(99, 102, 241, 0.08));
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-sm);
          flex-wrap: wrap;
          gap: 0.75rem;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .bulk-bar-left {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .bulk-count-badge {
          font-size: 0.82rem;
          color: var(--text-primary);
        }

        .bulk-bar-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .btn-danger {
          background: #ef4444;
          color: #ffffff;
          border: none;
          font-weight: 700;
        }

        .btn-danger:hover:not(:disabled) {
          background: #dc2626;
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.4);
        }

        .btn-danger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .empty-actions-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .header-main-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .header-actions-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .progress-section {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .progress-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .streak-summary {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        .todo-progress-track {
          height: 8px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .todo-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-success));
          border-radius: var(--radius-full);
          transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .quick-todo-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          flex-wrap: wrap;
        }

        .quick-input-wrap {
          flex: 1;
          min-width: 260px;
        }

        .quick-todo-input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .quick-todo-input::placeholder {
          color: var(--text-muted);
        }

        .quick-bar-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .quick-time-select {
          padding: 0.45rem 0.75rem;
          font-size: 0.82rem;
          border-radius: var(--radius-sm);
        }

        .quick-add-btn {
          padding: 0.45rem 1rem;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .quick-custom-btn {
          padding: 0.45rem 0.75rem;
          font-size: 0.82rem;
        }

        .todo-controls-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.85rem;
        }

        .status-tabs-group {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: var(--bg-card);
          padding: 0.25rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }

        .status-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.4rem 0.75rem;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .status-tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.04);
        }

        .status-tab-btn.active {
          background: var(--accent-primary);
          color: #ffffff;
        }

        .tab-badge {
          font-size: 0.7rem;
          padding: 0.1rem 0.4rem;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.15);
          font-weight: 700;
        }

        .tab-badge.badge-amber {
          background: rgba(245, 158, 11, 0.25);
          color: #f59e0b;
        }

        .tab-badge.badge-green {
          background: rgba(16, 185, 129, 0.25);
          color: #10b981;
        }

        .status-tab-btn.active .tab-badge {
          background: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }

        .time-pills-row {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          overflow-x: auto;
        }

        .time-pill-btn {
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .time-pill-btn:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary);
        }

        .time-pill-btn.active {
          background: var(--accent-primary-glow);
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          font-weight: 700;
        }

        .controls-right-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.65rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
        }

        .search-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .search-input {
          border: none;
          background: transparent;
          outline: none;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.8rem;
          width: 110px;
        }

        .search-input:focus {
          width: 140px;
        }

        .view-mode-toggle {
          display: flex;
          align-items: center;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.15rem;
        }

        .view-mode-btn {
          padding: 0.35rem 0.5rem;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .view-mode-btn:hover {
          color: var(--text-primary);
        }

        .view-mode-btn.active {
          background: rgba(255, 255, 255, 0.1);
          color: var(--accent-primary);
        }

        .checklist-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .cards-grid-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.85rem;
        }

        @media (min-width: 768px) {
          .cards-grid-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 3rem 1.5rem;
          gap: 0.75rem;
        }

        .empty-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};
