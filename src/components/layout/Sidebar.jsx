import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Compass, 
  CheckCircle2, 
  HeartPulse,
  Wallet, 
  BarChart3, 
  Settings, 
  Sparkles,
  Cloud,
  CloudOff,
  Plus,
  Film,
  ShieldCheck,
  LogOut,
  User
} from 'lucide-react';

export const Sidebar = () => {
  const { 
    activeTab, 
    setActiveTab, 
    habits, 
    todayCompletedHabits, 
    todayHabitProgress,
    roadmapCompletionPercent,
    marvelProgressPercent,
    syncStatus,
    setIsQuickAddOpen
  } = useApp();

  const { currentUser, logout, isSuperAdmin, isMenuVisible, setIsProfileModalOpen } = useAuth();

  const userAvatarIsImg = currentUser?.avatar && (currentUser.avatar.startsWith('data:image') || currentUser.avatar.startsWith('http'));

  const allNavItems = [
    ...(isSuperAdmin ? [
      { id: 'admin', path: '/admin', label: 'Super Admin Console', icon: ShieldCheck, highlightAdmin: true }
    ] : []),
    { id: 'dashboard', path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'habits', path: '/habits', label: 'Habits & Routines', icon: CheckCircle2, badge: `${todayCompletedHabits}/${(Array.isArray(habits) ? habits.length : 0)}` },
    { id: 'protocol', path: '/health', label: 'Health & Diet Protocol', icon: HeartPulse, highlight: true },
    { id: 'roadmap', path: '/roadmap', label: 'Career Roadmap', icon: Compass, badge: `${roadmapCompletionPercent}%` },
    { id: 'watchlists', path: '/mcu', label: 'MCU Watchlist', icon: Film, badge: `${marvelProgressPercent}%` },
    { id: 'finance', path: '/finance', label: 'Finance & Budget', icon: Wallet },
    { id: 'analytics', path: '/analytics', label: 'Analytics & Score', icon: BarChart3 },
    { id: 'settings', path: '/settings', label: 'Settings & Cloud', icon: Settings },
  ];

  const navItems = allNavItems.filter(item => item.id === 'admin' || isMenuVisible(item.id));

  const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (name[0] || 'U').toUpperCase();
  };

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Sparkles size={22} className="brand-icon" />
        </div>
        <div className="brand-info">
          <h1 className="brand-name">LifeTracker</h1>
          <span className="brand-tag">PRO • HABITS, CAREER & MEDIA</span>
        </div>
      </div>

      {/* Quick Add CTA */}
      <div className="sidebar-cta">
        <button 
          className="btn btn-primary w-full"
          onClick={() => setIsQuickAddOpen(true)}
        >
          <Plus size={18} />
          <span>Quick Log</span>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <a
              key={item.id}
              href={item.path}
              className={`nav-link ${isActive ? 'active' : ''} ${item.highlightAdmin ? 'admin-nav-item' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(item.id);
              }}
            >
              <div className="nav-link-content">
                <Icon size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </div>
              {item.highlightAdmin ? (
                <span className="nav-badge badge-admin">Admin</span>
              ) : item.badge ? (
                <span className={`nav-badge ${item.id === 'watchlists' ? 'badge-marvel' : item.id === 'roadmap' ? 'badge-roadmap' : item.id === 'protocol' ? 'badge-protocol' : item.id === 'finance' ? 'badge-finance' : (todayHabitProgress === 100 ? 'badge-success' : '')}`}>
                  {item.badge}
                </span>
              ) : null}
            </a>
          );
        })}
      </nav>

      {/* Mini Habits Progress Card */}
      <div className="sidebar-progress-card">
        <div className="progress-header">
          <span className="progress-title">Today's Habits</span>
          <span className="progress-percent">{todayHabitProgress}%</span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${todayHabitProgress}%` }}
          />
        </div>
        <p className="progress-sub">
          {todayCompletedHabits} of {habits.length} completed
        </p>
      </div>

      {/* User Session & Sign Out Footer */}
      <div className="sidebar-footer">
        {currentUser && (
          <div className="sidebar-user-card">
            <div 
              className="user-card-info cursor-pointer"
              onClick={() => setIsProfileModalOpen(true)}
              title="Click to edit profile"
            >
              <div 
                className={`user-sidebar-avatar ${isSuperAdmin ? 'avatar-admin' : 'avatar-user'}`}
                style={{ background: currentUser.avatarBg || undefined }}
              >
                {userAvatarIsImg ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="sidebar-avatar-img" />
                ) : currentUser.avatar ? (
                  <span className="sidebar-avatar-emoji">{currentUser.avatar}</span>
                ) : (
                  getInitials(currentUser.name)
                )}
              </div>
              <div className="user-sidebar-texts">
                <span className="user-sidebar-name">{currentUser.name}</span>
                <span className="user-sidebar-role">
                  {isSuperAdmin ? '👑 Super Admin' : (currentUser.jobTitle || '👤 Member')}
                </span>
              </div>
            </div>

            <button 
              className="btn-icon btn-ghost btn-sm btn-logout" 
              onClick={logout}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}

        <div className="cloud-status-card">
          <div className="cloud-status-left">
            {syncStatus === 'synced' ? (
              <Cloud size={16} className="text-emerald-400" />
            ) : (
              <CloudOff size={16} className="text-slate-400" />
            )}
            <div className="status-texts">
              <span className="status-heading">
                {syncStatus === 'synced' ? 'Firebase Cloud' : 'Local Offline'}
              </span>
              <span className="status-sub">
                {syncStatus === 'synced' ? 'Multi-device synced' : 'Stored locally'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .app-sidebar {
          display: none;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          width: var(--sidebar-width);
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          padding: 1.5rem 1rem;
          flex-direction: column;
          z-index: 50;
        }

        @media (min-width: 768px) {
          .app-sidebar {
            display: flex;
          }
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0 0.5rem 1.25rem 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .brand-logo {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-sm);
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-purple));
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: var(--shadow-glow);
        }

        .brand-name {
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .brand-tag {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--accent-primary);
          display: block;
        }

        .sidebar-cta {
          margin: 1.25rem 0 1rem 0;
        }

        .w-full {
          width: 100%;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          flex: 1;
          overflow-y: auto;
        }

        .nav-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          color: var(--text-primary);
          background: var(--bg-card);
        }

        .nav-link.active {
          color: #ffffff;
          background: var(--accent-primary);
          box-shadow: var(--shadow-glow);
        }

        .admin-nav-item {
          background: rgba(245, 158, 11, 0.1);
          border: 1px dashed rgba(245, 158, 11, 0.3);
          color: #f59e0b;
        }

        .admin-nav-item.active {
          background: #f59e0b;
          color: #000000;
          border-color: #f59e0b;
        }

        .badge-admin {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
          font-weight: 800;
        }

        .nav-link-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .nav-icon {
          flex-shrink: 0;
        }

        .nav-badge {
          font-size: 0.7rem;
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-full);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-weight: 700;
        }

        .nav-link.active .nav-badge {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        .badge-marvel {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          font-weight: 800;
        }

        .badge-roadmap {
          background: rgba(14, 165, 233, 0.2);
          color: #0ea5e9;
          font-weight: 800;
        }

        .badge-protocol {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          font-weight: 800;
        }

        .badge-finance {
          background: rgba(236, 72, 153, 0.2);
          color: #ec4899;
          font-weight: 800;
        }

        .badge-success {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .sidebar-progress-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.85rem;
          margin-top: 1rem;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .progress-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .progress-percent {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--accent-primary);
        }

        .progress-bar-bg {
          height: 6px;
          background: var(--border-color);
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-bottom: 0.4rem;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-success));
          border-radius: var(--radius-full);
          transition: width 0.3s ease;
        }

        .progress-sub {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .sidebar-footer {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .sidebar-user-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.65rem 0.75rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .user-card-info {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          min-width: 0;
          cursor: pointer;
          transition: opacity 0.15s ease;
        }

        .user-card-info:hover {
          opacity: 0.85;
        }

        .user-sidebar-avatar {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.75rem;
          flex-shrink: 0;
          overflow: hidden;
        }

        .sidebar-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sidebar-avatar-emoji {
          font-size: 1.15rem;
          line-height: 1;
        }

        .avatar-admin {
          background: linear-gradient(135deg, #6366f1, #f59e0b);
          color: #ffffff;
        }

        .avatar-user {
          background: linear-gradient(135deg, #0ea5e9, #10b981);
          color: #ffffff;
        }

        .user-sidebar-texts {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          min-width: 0;
        }

        .user-sidebar-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-sidebar-role {
          font-size: 0.68rem;
          color: var(--text-muted);
        }

        .btn-logout {
          color: var(--text-muted);
        }

        .btn-logout:hover {
          color: #ef4444;
        }

        .cloud-status-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.65rem 0.75rem;
        }

        .cloud-status-left {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .status-texts {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .status-heading {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .status-sub {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .text-emerald-400 { color: #10b981; }
        .text-slate-400 { color: #94a3b8; }
      `}</style>
    </aside>
  );
};
