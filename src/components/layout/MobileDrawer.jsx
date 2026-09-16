import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
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
  Plus, 
  Film,
  ShieldCheck,
  LogOut,
  User,
  Download,
  RefreshCw
} from 'lucide-react';
import { usePwa } from '../../context/PwaContext';

export const MobileDrawer = () => {
  const { 
    isMobileDrawerOpen, 
    setIsMobileDrawerOpen, 
    activeTab, 
    setActiveTab, 
    todayCompletedHabits, 
    habits, 
    roadmapCompletionPercent,
    marvelProgressPercent,
    syncStatus, 
    settings, 
    updateSettings,
    setIsQuickAddOpen
  } = useApp();

  const { currentUser, logout, isSuperAdmin, isMenuVisible, setIsProfileModalOpen } = useAuth();
  const { canInstall, isInstalled, updateAvailable, installApp, updateApp } = usePwa();

  if (!isMobileDrawerOpen) return null;

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsMobileDrawerOpen(false);
  };

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
  };

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
    <div className="mobile-drawer-overlay" onClick={() => setIsMobileDrawerOpen(false)}>
      <div className="mobile-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-brand">
            <div className="brand-logo-mini">
              <img src="/app-logo.png" alt="LifeTracker Wheel" className="brand-logo-img" />
            </div>
            <div>
              <h3 className="brand-title">LifeTracker Pro</h3>
              <span className="brand-sub">Holistic Life OS</span>
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

        {/* Logged in User Pill */}
        {currentUser && (
          <div 
            className="drawer-user-pill cursor-pointer"
            onClick={() => {
              setIsMobileDrawerOpen(false);
              setIsProfileModalOpen(true);
            }}
            title="Click to edit profile"
          >
            <div 
              className={`drawer-user-avatar ${isSuperAdmin ? 'avatar-admin' : 'avatar-user'}`}
              style={{ background: currentUser.avatarBg || undefined }}
            >
              {userAvatarIsImg ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="drawer-avatar-img" />
              ) : currentUser.avatar ? (
                <span className="drawer-avatar-emoji">{currentUser.avatar}</span>
              ) : (
                getInitials(currentUser.name)
              )}
            </div>
            <div className="drawer-user-info">
              <span className="drawer-user-name">{currentUser.name}</span>
              <span className="drawer-user-role">
                {isSuperAdmin ? '👑 Super Admin' : (currentUser.jobTitle || '👤 Member')}
              </span>
            </div>
          </div>
        )}

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
              <a
                key={item.id}
                href={item.path}
                className={`drawer-nav-item ${isActive ? 'active' : ''} ${item.highlightAdmin ? 'admin-highlight' : item.highlight ? 'highlight' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.id);
                }}
              >
                <div className="drawer-nav-left">
                  <Icon size={20} className="nav-icon" />
                  <span className="drawer-nav-label">{item.label}</span>
                </div>
                {item.highlightAdmin ? (
                  <span className="badge badge-admin-mini text-xs">Admin</span>
                ) : item.badge ? (
                  <span className="badge badge-primary text-xs">
                    {item.badge}
                  </span>
                ) : null}
              </a>
            );
          })}
        </nav>

        {/* Mobile PWA Actions */}
        {((canInstall && !isInstalled) || updateAvailable) && (
          <div className="drawer-pwa-section">
            {updateAvailable && (
              <button 
                className="drawer-pwa-btn drawer-pwa-update"
                onClick={updateApp}
              >
                <RefreshCw size={15} className="spin-slow" />
                <span>Update LifeTracker</span>
              </button>
            )}
            {canInstall && !isInstalled && (
              <button 
                className="drawer-pwa-btn drawer-pwa-install"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  installApp();
                }}
              >
                <Download size={15} />
                <span>Install App on Phone</span>
              </button>
            )}
          </div>
        )}

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

          <div className="drawer-footer-actions">
            <button 
              className="btn-icon btn-ghost theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
            >
              {settings.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {currentUser && (
              <button 
                className="btn-icon btn-ghost btn-drawer-logout"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  logout();
                }}
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
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
          padding: 1.25rem 1rem;
          animation: slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-color);
        }

        .drawer-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .brand-logo-mini {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          border: 1px solid var(--border-color);
          background: #FFFDF7;
          flex-shrink: 0;
        }

        .brand-logo-mini img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .brand-title {
          font-size: 1rem;
          font-weight: 800;
          line-height: 1.1;
        }

        .brand-sub {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .drawer-user-pill {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.65rem 0.75rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          margin-top: 0.85rem;
          cursor: pointer;
          transition: opacity 0.15s ease;
        }

        .drawer-user-pill:hover {
          opacity: 0.85;
        }

        .drawer-user-avatar {
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

        .drawer-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .drawer-avatar-emoji {
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

        .drawer-user-info {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          min-width: 0;
        }

        .drawer-user-name {
          font-size: 0.825rem;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .drawer-user-role {
          font-size: 0.68rem;
          color: var(--text-muted);
        }

        .drawer-cta {
          margin: 0.85rem 0;
        }

        .drawer-nav {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          flex: 1;
          overflow-y: auto;
        }

        .drawer-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.65rem 0.75rem;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 600;
          transition: all 0.15s ease;
        }

        .drawer-nav-item:hover,
        .drawer-nav-item.active {
          background: var(--accent-primary);
          color: #ffffff;
        }

        .drawer-nav-item.admin-highlight {
          background: rgba(245, 158, 11, 0.12);
          border: 1px dashed rgba(245, 158, 11, 0.35);
          color: #f59e0b;
        }

        .drawer-nav-item.admin-highlight.active {
          background: #f59e0b;
          color: #000000;
        }

        .badge-admin-mini {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
          font-weight: 800;
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
          padding-top: 0.85rem;
          border-top: 1px solid var(--border-color);
          margin-top: 0.5rem;
        }

        .footer-status-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-muted);
        }

        .drawer-footer-actions {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .btn-drawer-logout:hover {
          color: #ef4444;
        }

        .drawer-pwa-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .drawer-pwa-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.65rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.82rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .drawer-pwa-install {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
        }

        .drawer-pwa-update {
          background: linear-gradient(135deg, #059669, #10b981);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
        }

        .spin-slow {
          animation: spin 3s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
