import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sun, 
  Moon, 
  Plus, 
  Flame, 
  Cloud, 
  CloudOff, 
  RefreshCw,
  Sparkles,
  Menu
} from 'lucide-react';

export const Header = () => {
  const { 
    settings, 
    updateSettings, 
    todayCompletedHabits, 
    habits, 
    setIsQuickAddOpen,
    setIsMobileDrawerOpen,
    syncStatus,
    pushToCloud 
  } = useApp();

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Mobile Hamburger Toggle Button */}
        <button 
          className="btn-icon btn-ghost mobile-menu-btn"
          onClick={() => setIsMobileDrawerOpen(true)}
          aria-label="Open Navigation Menu"
        >
          <Menu size={22} />
        </button>

        <div className="header-titles">
          <div className="date-badge">
            <span>{formattedDate}</span>
          </div>
          <h2 className="greeting-text">
            {getGreeting()}, <span className="user-highlight">{settings.userName || 'Champion'}</span> 👋
          </h2>
        </div>
      </div>

      <div className="header-actions">
        {/* Sync Status Badge */}
        <button 
          className={`sync-indicator ${syncStatus}`}
          onClick={() => pushToCloud()}
          title={syncStatus === 'synced' ? 'Cloud Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Local Offline Mode (Click to sync)'}
        >
          {syncStatus === 'synced' && <Cloud size={16} className="text-emerald-400" />}
          {syncStatus === 'syncing' && <RefreshCw size={16} className="spin-animate text-indigo-400" />}
          {syncStatus === 'local' && <CloudOff size={16} className="text-slate-400" />}
          {syncStatus === 'error' && <CloudOff size={16} className="text-rose-400" />}
          <span className="sync-text">
            {syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing' : 'Local'}
          </span>
        </button>

        {/* Daily Streak Indicator */}
        <div className="streak-pill">
          <Flame size={16} className="flame-icon" />
          <span>{todayCompletedHabits}/{(Array.isArray(habits) ? habits.length : 0)} Done</span>
        </div>

        {/* Theme Toggle */}
        <button 
          className="btn-icon btn-ghost theme-btn desktop-only" 
          onClick={toggleTheme}
          aria-label="Toggle Theme"
        >
          {settings.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Desktop Quick Add Button */}
        <button 
          className="btn btn-primary quick-add-btn desktop-only"
          onClick={() => setIsQuickAddOpen(true)}
        >
          <Plus size={18} />
          <span>Quick Log</span>
        </button>
      </div>

      <style>{`
        .app-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1rem;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-glass);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 40;
        }

        @media (min-width: 768px) {
          .app-header {
            padding: 1.25rem 2rem;
          }
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .mobile-menu-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
        }

        @media (min-width: 768px) {
          .mobile-menu-btn {
            display: none;
          }
        }

        .header-titles {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .date-badge {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .greeting-text {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        @media (min-width: 768px) {
          .greeting-text {
            font-size: 1.2rem;
          }
        }

        .user-highlight {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-cyan));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        @media (min-width: 768px) {
          .header-actions {
            gap: 0.75rem;
          }
        }

        .sync-indicator {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.6rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sync-indicator:hover {
          background: var(--bg-card-hover);
        }

        .sync-indicator.synced {
          border-color: rgba(16, 185, 129, 0.3);
          color: var(--accent-success);
        }

        .streak-pill {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.65rem;
          border-radius: var(--radius-full);
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.25);
          color: var(--accent-warning);
          font-size: 0.75rem;
          font-weight: 700;
        }

        .flame-icon {
          color: #f59e0b;
        }

        .theme-btn {
          color: var(--text-secondary);
        }

        .spin-animate {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .desktop-only {
          display: none;
        }

        @media (min-width: 768px) {
          .desktop-only {
            display: inline-flex;
          }
        }
      `}</style>
    </header>
  );
};
