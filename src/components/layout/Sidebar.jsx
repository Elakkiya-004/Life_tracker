import React from 'react';
import { useApp } from '../../context/AppContext';
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
  Plus
} from 'lucide-react';

export const Sidebar = () => {
  const { 
    activeTab, 
    setActiveTab, 
    habits, 
    todayCompletedHabits, 
    todayHabitProgress,
    roadmapCompletionPercent,
    syncStatus,
    setIsQuickAddOpen
  } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'habits', label: 'Habits & Routines', icon: CheckCircle2, badge: `${todayCompletedHabits}/${(Array.isArray(habits) ? habits.length : 0)}` },
    { id: 'protocol', label: 'Health & Diet Protocol', icon: HeartPulse, highlight: true },
    { id: 'roadmap', label: 'Career Roadmap', icon: Compass, badge: `${roadmapCompletionPercent}%` },
    { id: 'finance', label: 'Finance & Budget', icon: Wallet },
    { id: 'analytics', label: 'Analytics & Score', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Cloud', icon: Settings },
  ];

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
            <button
              key={item.id}
              className={`nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <div className="nav-link-content">
                <Icon size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`nav-badge ${item.id === 'watchlists' ? 'badge-marvel' : item.id === 'roadmap' ? 'badge-roadmap' : (todayHabitProgress === 100 ? 'badge-success' : '')}`}>
                  {item.badge}
                </span>
              )}
            </button>
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

      {/* Cloud Status Footer */}
      <div className="sidebar-footer">
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
                {syncStatus === 'synced' ? 'Auto-syncing across devices' : 'Stored on this device'}
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
        }

        .nav-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 0.9rem;
          border-radius: var(--radius-sm);
          border: 1px solid transparent;
          background: transparent;
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }

        .nav-link.active {
          background: var(--accent-primary-glow);
          color: var(--accent-primary);
          border-color: rgba(99, 102, 241, 0.3);
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
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-muted);
        }

        .nav-badge.badge-success {
          background: var(--accent-success-glow);
          color: var(--accent-success);
        }

        .nav-badge.badge-roadmap {
          background: rgba(14, 165, 233, 0.15);
          color: var(--accent-cyan);
          border: 1px solid rgba(14, 165, 233, 0.3);
        }

        .nav-badge.badge-marvel {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .sidebar-progress-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.85rem;
          margin-bottom: 1rem;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.4rem;
        }

        .progress-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .progress-percent {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--accent-primary);
        }

        .progress-bar-bg {
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-bottom: 0.35rem;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-success));
          border-radius: var(--radius-full);
          transition: width 0.4s ease;
        }

        .progress-sub {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .sidebar-footer {
          border-top: 1px solid var(--border-color);
          padding-top: 0.85rem;
        }

        .cloud-status-card {
          padding: 0.6rem 0.75rem;
          background: var(--bg-card);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }

        .cloud-status-left {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .status-texts {
          display: flex;
          flex-direction: column;
        }

        .status-heading {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .status-sub {
          font-size: 0.65rem;
          color: var(--text-muted);
        }
      `}</style>
    </aside>
  );
};
