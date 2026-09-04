import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
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
  Sun,
  Moon,
  Plus
} from 'lucide-react';

export const MobileDrawer = () => {
  const { 
    isMobileDrawerOpen, 
    setIsMobileDrawerOpen, 
    activeTab, 
    setActiveTab, 
    todayCompletedHabits, 
    habits, 
    syncStatus, 
    settings, 
    updateSettings,
    setIsQuickAddOpen
  } = useApp();

  if (!isMobileDrawerOpen) return null;

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsMobileDrawerOpen(false);
  };

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'habits', label: 'Habits & Routines', icon: CheckCircle2, badge: `${todayCompletedHabits}/${(Array.isArray(habits) ? habits.length : 0)}` },
    { id: 'protocol', label: 'Health & Diet Protocol', icon: HeartPulse, highlight: true },
    { id: 'roadmap', label: 'Career Roadmap', icon: Compass },
    { id: 'finance', label: 'Finance & Budget', icon: Wallet },
    { id: 'analytics', label: 'Analytics & Score', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Cloud', icon: Settings },
  ];

  return (
    <div className="mobile-drawer-overlay" onClick={() => setIsMobileDrawerOpen(false)}>
      <div className="mobile-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-brand">
            <div className="brand-logo-mini">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="brand-title">LifeTracker Pro</h3>
              <span className="brand-sub">Habits, Career & Media</span>
            </div>
          </div>
          <button 
            className="btn-icon btn-ghost close-btn" 
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-label="Close Navigation"
          >
            <X size={22} />
          </button>
        </div>

        {/* Quick Log CTA */}
        <div className="drawer-cta">
          <button 
            className="btn btn-primary w-full"
            onClick={() => {
              setIsMobileDrawerOpen(false);
              setIsQuickAddOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Quick Log</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="drawer-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`drawer-nav-item ${isActive ? 'active' : ''} ${item.highlight ? 'highlight' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <div className="drawer-nav-left">
                  <Icon size={20} className="nav-icon" />
                  <span className="drawer-nav-label">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="badge badge-primary text-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="drawer-footer">
          <div className="footer-status-pill">
            {syncStatus === 'synced' ? (
              <Cloud size={16} className="text-emerald-400" />
            ) : (
              <CloudOff size={16} className="text-slate-400" />
            )}
            <span className="text-xs">
              {syncStatus === 'synced' ? 'Firebase Synced' : 'Local Offline'}
            </span>
          </div>

          <button 
            className="btn-icon btn-ghost theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            {settings.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>

      <style>{`
        .mobile-drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          animation: fadeIn 0.2s ease;
        }

        .mobile-drawer-panel {
          width: 82%;
          max-width: 320px;
          height: 100%;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1.25rem;
          box-shadow: var(--shadow-lg);
          animation: slideRight 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideRight {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .drawer-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brand-logo-mini {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-purple));
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
        }

        .brand-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .brand-sub {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--accent-primary);
          display: block;
        }

        .drawer-cta {
          margin: 1.25rem 0 1rem 0;
        }

        .drawer-nav {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          flex: 1;
          overflow-y: auto;
        }

        .drawer-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.8rem 1rem;
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

        .drawer-nav-item:active {
          transform: scale(0.98);
        }

        .drawer-nav-item.active {
          background: var(--accent-primary-glow);
          border-color: rgba(99, 102, 241, 0.35);
          color: var(--accent-primary);
        }

        .drawer-nav-item.highlight {
          color: var(--text-primary);
        }

        .drawer-nav-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .drawer-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .footer-status-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};
