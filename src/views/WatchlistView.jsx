import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WatchlistModal } from '../components/watchlist/WatchlistModal';
import { 
  Film, 
  Tv, 
  Sparkles, 
  Check, 
  X, 
  RotateCcw, 
  Search, 
  Plus, 
  Star, 
  Flame, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  PlayCircle
} from 'lucide-react';

export const WatchlistView = () => {
  const { 
    customLists, 
    toggleListItem, 
    deleteListItem, 
    resetMarvelList,
    marvelWatchedCount,
    marvelSkippedCount,
    marvelProgressPercent 
  } = useApp();

  const [activeListId, setActiveListId] = useState('list-mcu-doomsday');
  const [selectedPhase, setSelectedPhase] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All'); // 'All' | 'unwatched' | 'watched' | 'skipped'
  const [selectedImportance, setSelectedImportance] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const activeList = customLists.find(l => l.id === activeListId) || customLists[0];
  const items = activeList?.items || [];

  // Extract unique phases/categories
  const phases = ['All', ...Array.from(new Set(items.map(i => i.category)))];

  // Filter items
  const filteredItems = items.filter(item => {
    if (selectedPhase !== 'All' && item.category !== selectedPhase) return false;
    if (selectedStatus !== 'All' && item.status !== selectedStatus) return false;
    if (selectedImportance !== 'All' && !item.importance?.includes(selectedImportance)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        item.number.includes(q)
      );
    }
    return true;
  });

  const watchedCount = items.filter(i => i.status === 'watched').length;
  const skippedCount = items.filter(i => i.status === 'skipped').length;
  const progressPercent = items.length > 0 ? Math.round((watchedCount / items.length) * 100) : 0;

  const handleReset = () => {
    if (window.confirm('Reset this list to the original 72 Marvel titles?')) {
      resetMarvelList();
    }
  };

  return (
    <div className="watchlist-view-container">
      {/* Hero Header */}
      <div className="watchlist-hero card">
        <div className="hero-content">
          <div className="hero-badge">
            <Film size={16} />
            <span>MARVEL CINEMATIC UNIVERSE • ROAD TO DOOMSDAY</span>
          </div>
          <h2 className="hero-title">{activeList?.title || 'MCU Chronological Watchlist'}</h2>
          <p className="hero-desc text-sub">
            The definitive 72-title chronological viewing order tailored for <strong>Avengers: Doomsday (2026)</strong>.
          </p>

          {/* Progress Bar */}
          <div className="watchlist-progress-bar-wrap">
            <div className="progress-info-row">
              <span className="text-xs font-bold">{watchedCount} of {items.length} Titles Watched ({progressPercent}%)</span>
              <span className="text-xs text-sub">{skippedCount} Skipped • {items.length - watchedCount - skippedCount} Remaining</span>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="hero-stat-box">
          <span className="stat-big-num">{items.length - watchedCount - skippedCount}</span>
          <span className="stat-label-sub">Titles Left to Watch</span>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="watchlist-controls card">
        <div className="controls-top-row">
          {/* Search Box */}
          <div className="search-wrap flex-1">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search movies, TV shows, or viewing advice..."
              className="input search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="actions-cluster">
            {activeListId === 'list-mcu-doomsday' && (
              <button 
                className="btn btn-ghost btn-sm text-sub"
                onClick={handleReset}
                title="Reset list"
              >
                <RotateCcw size={14} />
                <span>Reset 72 Titles</span>
              </button>
            )}

            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={16} />
              <span>Add Title</span>
            </button>
          </div>
        </div>

        {/* Phase Filter Scroll */}
        <div className="phase-filters-scroll">
          {phases.map(p => (
            <button
              key={p}
              className={`phase-chip ${selectedPhase === p ? 'active' : ''}`}
              onClick={() => setSelectedPhase(p)}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Status Filter Sub-row */}
        <div className="status-filter-subrow">
          <div className="status-pill-group">
            <button
              className={`status-pill ${selectedStatus === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('All')}
            >
              All Status
            </button>
            <button
              className={`status-pill ${selectedStatus === 'unwatched' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('unwatched')}
            >
              To Watch ({items.filter(i => i.status === 'unwatched').length})
            </button>
            <button
              className={`status-pill ${selectedStatus === 'watched' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('watched')}
            >
              Watched ({watchedCount})
            </button>
            <button
              className={`status-pill ${selectedStatus === 'skipped' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('skipped')}
            >
              Skipped ({skippedCount})
            </button>
          </div>

          <select
            className="select filter-select"
            value={selectedImportance}
            onChange={(e) => setSelectedImportance(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="Essential">Essential for Doomsday Only</option>
            <option value="Recommended">Recommended</option>
            <option value="Optional">Optional / Skippable</option>
          </select>
        </div>
      </div>

      {/* Titles Grid / List */}
      {filteredItems.length === 0 ? (
        <div className="card empty-state">
          <Film size={36} className="text-muted" />
          <p className="text-sub">No titles found matching your search or filters.</p>
        </div>
      ) : (
        <div className="titles-list">
          {filteredItems.map((item) => {
            const isWatched = item.status === 'watched';
            const isSkipped = item.status === 'skipped';

            return (
              <div 
                key={item.id}
                className={`title-card card ${isWatched ? 'card-watched' : ''} ${isSkipped ? 'card-skipped' : ''}`}
              >
                <div className="title-card-main">
                  {/* Left Number & Type Box */}
                  <div className="title-left-col">
                    <span className="title-number">{item.number}</span>
                    <span className={`type-badge ${item.type.toLowerCase()}`}>
                      {item.type === 'FILM' ? 'FILM' : item.type === 'TV' ? 'TV' : 'SPC'}
                    </span>
                  </div>

                  {/* Center Details */}
                  <div className="title-details-col">
                    <div className="title-top-row">
                      <h4 className="title-heading">{item.title}</h4>
                      {item.studio && <span className="studio-badge">{item.studio}</span>}
                    </div>

                    <div className="title-meta-row">
                      <span className={`importance-tag ${item.importance.toLowerCase().includes('essential') ? 'essential' : item.importance.toLowerCase().includes('recommended') ? 'recommended' : 'optional'}`}>
                        {item.importance}
                      </span>
                      {item.rating && (
                        <span className="rating-pill">
                          <Star size={12} className="star-icon" />
                          <span>{item.rating}</span>
                        </span>
                      )}
                      <span className="category-text text-sub text-xs">• {item.category}</span>
                    </div>

                    {/* Viewing Notes & Guide */}
                    {item.notes && (
                      <div className="notes-box">
                        <span className="notes-text">{item.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="title-card-actions">
                  <button
                    className={`action-btn watch-btn ${isWatched ? 'active' : ''}`}
                    onClick={() => toggleListItem(activeList.id, item.id, isWatched ? 'unwatched' : 'watched')}
                  >
                    <Check size={14} />
                    <span>{isWatched ? 'WATCHED' : 'WATCHED'}</span>
                  </button>

                  <button
                    className={`action-btn skip-btn ${isSkipped ? 'active' : ''}`}
                    onClick={() => toggleListItem(activeList.id, item.id, isSkipped ? 'unwatched' : 'skipped')}
                  >
                    <X size={14} />
                    <span>{isSkipped ? 'SKIPPED' : 'SKIP'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Title Modal */}
      <WatchlistModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        listId={activeList.id}
      />

      <style>{`
        .watchlist-view-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .watchlist-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.75rem;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(99, 102, 241, 0.12));
          border-color: rgba(239, 68, 68, 0.35);
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
          color: #ef4444;
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

        .watchlist-progress-bar-wrap {
          margin-top: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          max-width: 500px;
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
          background: linear-gradient(90deg, #ef4444, var(--accent-success));
          border-radius: var(--radius-full);
          transition: width 0.4s ease;
        }

        .hero-stat-box {
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

        .stat-big-num {
          font-size: 2.2rem;
          font-weight: 900;
          color: #ef4444;
          line-height: 1;
        }

        .stat-label-sub {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .watchlist-controls {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          padding: 1.25rem;
        }

        .controls-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .search-wrap {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          padding-left: 2.3rem !important;
        }

        .actions-cluster {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .phase-filters-scroll {
          display: flex;
          gap: 0.4rem;
          overflow-x: auto;
          padding-bottom: 0.35rem;
        }

        .phase-chip {
          padding: 0.35rem 0.8rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .phase-chip:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
        }

        .phase-chip.active {
          background: #ef4444;
          border-color: #ef4444;
          color: #ffffff;
        }

        .status-filter-subrow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .status-pill-group {
          display: flex;
          background: rgba(255, 255, 255, 0.04);
          padding: 0.2rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }

        .status-pill {
          padding: 0.3rem 0.75rem;
          border-radius: calc(var(--radius-sm) - 2px);
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .status-pill.active {
          background: var(--accent-primary);
          color: #ffffff;
        }

        .filter-select {
          max-width: 220px;
          padding: 0.4rem 0.75rem;
          font-size: 0.8rem;
        }

        .titles-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .title-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          gap: 1rem;
          flex-wrap: wrap;
          transition: all 0.2s ease;
        }

        .card-watched {
          border-color: rgba(16, 185, 129, 0.4);
          background: rgba(16, 185, 129, 0.04);
        }

        .card-watched .title-heading {
          color: var(--accent-success);
        }

        .card-skipped {
          opacity: 0.6;
          border-color: rgba(255, 255, 255, 0.05);
        }

        .card-skipped .title-heading {
          text-decoration: line-through;
        }

        .title-card-main {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          flex: 1;
          min-width: 280px;
        }

        .title-left-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          flex-shrink: 0;
          padding-top: 2px;
        }

        .title-number {
          font-size: 1.15rem;
          font-weight: 900;
          color: var(--text-muted);
          font-family: monospace;
        }

        .type-badge {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.15rem 0.4rem;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
        }

        .type-badge.film {
          background: rgba(99, 102, 241, 0.2);
          color: var(--accent-primary);
        }

        .type-badge.tv {
          background: rgba(236, 72, 153, 0.2);
          color: #ec4899;
        }

        .type-badge.spc {
          background: rgba(245, 158, 11, 0.2);
          color: var(--accent-warning);
        }

        .title-details-col {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          min-width: 0;
          flex: 1;
        }

        .title-top-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .title-heading {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .studio-badge {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--accent-cyan);
          background: rgba(14, 165, 233, 0.15);
          padding: 0.1rem 0.4rem;
          border-radius: var(--radius-sm);
        }

        .title-meta-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .importance-tag {
          font-size: 0.72rem;
          font-weight: 700;
        }

        .importance-tag.essential { color: #ef4444; }
        .importance-tag.recommended { color: #f59e0b; }
        .importance-tag.optional { color: var(--text-muted); }

        .rating-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--accent-warning);
        }

        .star-icon {
          fill: currentColor;
        }

        .notes-box {
          padding: 0.45rem 0.65rem;
          background: rgba(255, 255, 255, 0.03);
          border-left: 2px solid var(--accent-primary);
          border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
          margin-top: 0.25rem;
        }

        .notes-text {
          font-size: 0.78rem;
          color: var(--text-secondary);
          line-height: 1.35;
        }

        .title-card-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 0.75rem;
          border-radius: var(--radius-sm);
          font-family: inherit;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-secondary);
          transition: all 0.2s ease;
        }

        .watch-btn.active {
          background: var(--accent-success);
          border-color: var(--accent-success);
          color: #ffffff;
          box-shadow: 0 2px 10px rgba(16, 185, 129, 0.3);
        }

        .skip-btn.active {
          background: rgba(255, 255, 255, 0.15);
          color: var(--text-primary);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.85rem;
          padding: 3rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
};
