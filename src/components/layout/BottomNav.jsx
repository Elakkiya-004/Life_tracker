import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Compass,
  CheckCircle2, 
  HeartPulse,
  Film,
  Plus, 
  Menu
} from 'lucide-react';

export const BottomNav = () => {
  const { 
    activeTab, 
    setActiveTab, 
    setIsQuickAddOpen, 
    setIsMobileDrawerOpen,
    todayCompletedHabits, 
    habits,
    roadmapCompletionPercent 
  } = useApp();

  const { isMenuVisible } = useAuth();

  return (
    <nav className="bottom-nav">
      {isMenuVisible('dashboard') && (
        <button 
          className={`bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>Home</span>
        </button>
      )}

      {isMenuVisible('roadmap') ? (
        <button 
          className={`bottom-nav-item ${activeTab === 'roadmap' ? 'active' : ''}`}
          onClick={() => setActiveTab('roadmap')}
        >
          <div className="icon-with-badge">
            <Compass size={20} />
            {roadmapCompletionPercent > 0 && (
              <span className="dot-badge cyan" />
            )}
          </div>
          <span>Roadmap</span>
        </button>
      ) : isMenuVisible('protocol') ? (
        <button 
          className={`bottom-nav-item ${activeTab === 'protocol' ? 'active' : ''}`}
          onClick={() => setActiveTab('protocol')}
        >
          <HeartPulse size={20} />
          <span>Health</span>
        </button>
      ) : null}

      {/* Center Floating Action Button */}
      <div className="fab-container">
        <button 
          className="fab-button"
          onClick={() => setIsQuickAddOpen(true)}
          aria-label="Quick Add"
        >
          <Plus size={24} />
        </button>
      </div>

      {isMenuVisible('habits') ? (
        <button 
          className={`bottom-nav-item ${activeTab === 'habits' ? 'active' : ''}`}
          onClick={() => setActiveTab('habits')}
        >
          <div className="icon-with-badge">
            <CheckCircle2 size={20} />
            {habits.length > todayCompletedHabits && (
              <span className="dot-badge" />
            )}
          </div>
          <span>Habits</span>
        </button>
      ) : isMenuVisible('watchlists') ? (
        <button 
          className={`bottom-nav-item ${activeTab === 'watchlists' ? 'active' : ''}`}
          onClick={() => setActiveTab('watchlists')}
        >
          <Film size={20} />
          <span>MCU</span>
        </button>
      ) : null}

      {/* Menu / More Drawer Toggle Button */}
      <button 
        className="bottom-nav-item menu-more-btn"
        onClick={() => setIsMobileDrawerOpen(true)}
      >
        <Menu size={20} />
        <span>Menu</span>
      </button>

      <style>{`
        .bottom-nav {
          display: flex;
          align-items: center;
          justify-content: space-around;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: calc(var(--bottom-nav-height) + var(--safe-bottom));
          padding-bottom: var(--safe-bottom);
          background: var(--bg-glass);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid var(--border-color);
          z-index: 50;
        }

        @media (min-width: 768px) {
          .bottom-nav {
            display: none;
          }
        }

        .bottom-nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0.5rem 0;
          transition: color 0.2s ease, transform 0.15s ease;
        }

        .bottom-nav-item:active {
          transform: scale(0.92);
        }

        .bottom-nav-item.active {
          color: var(--accent-primary);
        }

        .icon-with-badge {
          position: relative;
          display: inline-flex;
        }

        .dot-badge {
          position: absolute;
          top: -2px;
          right: -3px;
          width: 7px;
          height: 7px;
          background: var(--accent-warning);
          border-radius: 50%;
          box-shadow: 0 0 6px var(--accent-warning);
        }

        .dot-badge.cyan {
          background: var(--accent-cyan);
          box-shadow: 0 0 6px var(--accent-cyan);
        }

        .fab-container {
          flex: 1;
          display: flex;
          justify-content: center;
          position: relative;
        }

        .fab-button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-purple));
          border: 3px solid var(--bg-primary);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-glow);
          cursor: pointer;
          transform: translateY(-12px);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .fab-button:active {
          transform: translateY(-8px) scale(0.95);
        }
      `}</style>
    </nav>
  );
};
