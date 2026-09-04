import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Sun, 
  Moon, 
  Plus, 
  Flame, 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  Sparkles, 
  Menu,
  LogOut,
  ShieldCheck,
  User
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

  const { currentUser, logout, isSuperAdmin, setIsProfileModalOpen } = useAuth();

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

  const userName = currentUser?.name || settings.userName || 'Champion';
  const userAvatarIsImg = currentUser?.avatar && (currentUser.avatar.startsWith('data:image') || currentUser.avatar.startsWith('http'));

  const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (name[0] || 'U').toUpperCase();
  };

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

        {/* User Profile Avatar Trigger */}
        {currentUser && (
          <button 
            type="button" 
            className="header-avatar-btn"
            onClick={() => setIsProfileModalOpen(true)}
            title="Edit Profile & Account Settings"
          >
            <div 
              className="header-avatar-circle"
              style={{ background: currentUser.avatarBg || (isSuperAdmin ? 'linear-gradient(135deg, #6366f1, #f59e0b)' : 'linear-gradient(135deg, #0ea5e9, #10b981)') }}
            >
              {userAvatarIsImg ? (
                <img src={currentUser.avatar} alt={userName} className="header-avatar-img" />
              ) : currentUser.avatar ? (
                <span className="header-avatar-emoji">{currentUser.avatar}</span>
              ) : (
                <span className="header-avatar-initials">{getInitials(userName)}</span>
              )}
            </div>
          </button>
        )}

        <div className="header-titles">
          <div className="date-badge">
            <span>{formattedDate}</span>
          </div>
          <h2 
            className="greeting-text cursor-pointer"
            onClick={() => setIsProfileModalOpen(true)}
            title="Click to edit profile"
          >
            {getGreeting()}, <span className="user-highlight">{userName}</span> 👋
            {isSuperAdmin && <span className="admin-badge-mini">👑 Super Admin</span>}
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

        {/* Sign Out Button */}
        {currentUser && (
          <button
            className="btn-icon btn-ghost desktop-only btn-header-logout"
            onClick={logout}
            title={`Signed in as ${currentUser.email} • Click to Sign Out`}
            aria-label="Sign Out"
          >
            <LogOut size={17} />
          </button>
        )}
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

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-avatar-btn {
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          border-radius: var(--radius-full);
          transition: transform 0.15s ease;
        }

        .header-avatar-btn:hover {
          transform: scale(1.08);
        }

        .header-avatar-circle {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .header-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .header-avatar-emoji {
          font-size: 1.3rem;
          line-height: 1;
        }

        .header-avatar-initials {
          font-size: 0.95rem;
          font-weight: 800;
          color: #ffffff;
        }

        .cursor-pointer {
          cursor: pointer;
        }

        .mobile-menu-btn {
          display: flex;
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
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .greeting-text {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .user-highlight {
          color: var(--accent-primary);
        }

        .admin-badge-mini {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.1rem 0.45rem;
          border-radius: var(--radius-full);
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.35);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .sync-indicator {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.65rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          color: var(--text-secondary);
        }

        .streak-pill {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.65rem;
          border-radius: var(--radius-full);
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.25);
          color: #f59e0b;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .flame-icon {
          color: #f59e0b;
        }

        .btn-header-logout {
          color: var(--text-muted);
        }

        .btn-header-logout:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
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
