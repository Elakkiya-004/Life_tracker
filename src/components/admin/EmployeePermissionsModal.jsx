import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  HeartPulse, 
  Compass, 
  Film, 
  Wallet, 
  BarChart3, 
  Settings as SettingsIcon,
  SlidersHorizontal,
  Globe,
  UserCheck,
  Check,
  X,
  RotateCcw,
  Sparkles,
  AlertCircle
} from 'lucide-react';

const MENU_ICONS = {
  LayoutDashboard: LayoutDashboard,
  CheckCircle2: CheckCircle2,
  HeartPulse: HeartPulse,
  Compass: Compass,
  Film: Film,
  Wallet: Wallet,
  BarChart3: BarChart3,
  Settings: SettingsIcon,
};

export const EmployeePermissionsModal = ({ isOpen, onClose, employee = null }) => {
  const { 
    availableMenus = [], 
    menuPermissions = {}, 
    updateUserAllowedMenus 
  } = useAuth();

  const [mode, setMode] = useState('global'); // 'global' | 'custom'
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (employee && isOpen) {
      if (Array.isArray(employee.allowedMenus)) {
        setMode('custom');
        setSelectedMenus(employee.allowedMenus);
      } else {
        setMode('global');
        // Default custom selection to currently enabled global menus if switched
        const activeGlobals = availableMenus.filter(m => menuPermissions[m.id] !== false).map(m => m.id);
        setSelectedMenus(activeGlobals);
      }
      setError(null);
    }
  }, [employee, isOpen, menuPermissions]);

  if (!employee) return null;

  const handleToggleMenu = (menuId) => {
    setSelectedMenus(prev => 
      prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]
    );
  };

  const handleSelectAll = () => {
    setSelectedMenus(availableMenus.map(m => m.id));
  };

  const handleDeselectAll = () => {
    // Keep dashboard enabled by default
    setSelectedMenus(['dashboard']);
  };

  const handleCopyGlobal = () => {
    const activeGlobals = availableMenus.filter(m => menuPermissions[m.id] !== false).map(m => m.id);
    setSelectedMenus(activeGlobals);
  };

  const handleSave = async () => {
    setError(null);
    setIsSubmitting(true);

    const payload = mode === 'custom' ? selectedMenus : null;
    const res = await updateUserAllowedMenus(employee.uid, payload);

    if (!res.success) {
      setError(res.error || 'Failed to update permissions.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onClose();
  };

  const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (name[0] || 'U').toUpperCase();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`🎛️ Navigation Access Control: ${employee.name}`}
      maxWidth="580px"
    >
      <div className="employee-permissions-content">
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Employee Summary Card */}
        <div className="employee-header-card">
          <div className="employee-avatar-box">
            {employee.avatar && (employee.avatar.startsWith('data:image') || employee.avatar.startsWith('http')) ? (
              <img src={employee.avatar} alt={employee.name} className="employee-img" />
            ) : employee.avatar ? (
              <span className="avatar-emoji">{employee.avatar}</span>
            ) : (
              <span className="avatar-initials">{getInitials(employee.name)}</span>
            )}
          </div>

          <div className="employee-info-texts">
            <div className="employee-title-row">
              <span className="employee-name">{employee.name}</span>
              <span className="employee-role-badge">
                {employee.role === 'super_admin' ? '👑 Super Admin' : '👤 Regular Member'}
              </span>
            </div>
            <span className="employee-email text-xs text-sub">{employee.email}</span>
            {employee.jobTitle && (
              <span className="employee-job text-xs text-primary font-semibold">{employee.jobTitle}</span>
            )}
          </div>
        </div>

        {/* Access Mode Selector */}
        <div className="mode-selector-card">
          <label className="mode-label text-xs font-bold text-sub">Access Control Strategy:</label>
          <div className="mode-btn-group">
            <button
              type="button"
              className={`mode-btn ${mode === 'global' ? 'active' : ''}`}
              onClick={() => setMode('global')}
            >
              <Globe size={16} />
              <div className="mode-btn-texts">
                <span className="mode-btn-title">Inherit Global Admin Rules</span>
                <span className="mode-btn-sub">Uses whatever menus you toggle on the Admin overview</span>
              </div>
            </button>

            <button
              type="button"
              className={`mode-btn ${mode === 'custom' ? 'active' : ''}`}
              onClick={() => setMode('custom')}
            >
              <SlidersHorizontal size={16} />
              <div className="mode-btn-texts">
                <span className="mode-btn-title">Custom Permissions for this User</span>
                <span className="mode-btn-sub">Manually specify which menus this user can access</span>
              </div>
            </button>
          </div>
        </div>

        {/* Custom Permissions Checklist */}
        {mode === 'custom' ? (
          <div className="custom-modules-container">
            <div className="custom-modules-header">
              <div className="flex-center-gap">
                <span className="font-bold text-sm">Module Permissions ({selectedMenus.length} of {availableMenus.length} Enabled)</span>
              </div>

              <div className="quick-action-buttons">
                <button type="button" className="btn-link text-xs" onClick={handleSelectAll}>
                  Select All
                </button>
                <span>•</span>
                <button type="button" className="btn-link text-xs" onClick={handleDeselectAll}>
                  Clear
                </button>
                <span>•</span>
                <button type="button" className="btn-link text-xs" onClick={handleCopyGlobal}>
                  Match Global
                </button>
              </div>
            </div>

            <div className="modules-list">
              {availableMenus.map((menu) => {
                const isEnabled = selectedMenus.includes(menu.id);
                const IconComponent = MENU_ICONS[menu.icon] || LayoutDashboard;

                return (
                  <div
                    key={menu.id}
                    className={`module-row-card ${isEnabled ? 'module-active' : 'module-inactive'}`}
                    onClick={() => handleToggleMenu(menu.id)}
                  >
                    <div className="module-left">
                      <div className={`module-icon-wrap ${isEnabled ? 'icon-on' : 'icon-off'}`}>
                        <IconComponent size={18} />
                      </div>
                      <div className="module-text-info">
                        <div className="module-name-line">
                          <span className="module-name font-bold text-sm">{menu.label}</span>
                          <span className="module-path font-mono text-xs">{menu.path}</span>
                        </div>
                        <span className="module-desc text-xs text-sub">{menu.desc}</span>
                      </div>
                    </div>

                    <div className="module-right" onClick={(e) => e.stopPropagation()}>
                      <label className="switch-toggle-label">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => handleToggleMenu(menu.id)}
                          className="switch-input"
                        />
                        <span className="switch-slider" />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="global-info-banner">
            <Globe size={18} className="text-primary flex-shrink-0" />
            <div className="global-info-text">
              <span className="font-semibold text-xs text-primary">Active via Global Admin Rules</span>
              <p className="text-xs text-sub mt-0.5">
                This user will automatically see whatever modules you enable on the Super Admin control panel. If you disable a menu globally, it will also be hidden for this user.
              </p>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="form-actions mt-4">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Saving Permissions...' : 'Apply Permissions'}
          </button>
        </div>
      </div>

      <style>{`
        .employee-permissions-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .employee-header-card {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .employee-avatar-box {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, #0ea5e9, #10b981);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .employee-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-emoji {
          font-size: 1.5rem;
          line-height: 1;
        }

        .avatar-initials {
          font-weight: 800;
          font-size: 1rem;
          color: #ffffff;
        }

        .employee-info-texts {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .employee-title-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .employee-name {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .employee-role-badge {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 0.1rem 0.45rem;
          border-radius: var(--radius-full);
          background: rgba(14, 165, 233, 0.15);
          color: #0ea5e9;
        }

        .mode-selector-card {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .mode-btn-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.65rem;
        }

        @media (max-width: 500px) {
          .mode-btn-group {
            grid-template-columns: 1fr;
          }
        }

        .mode-btn {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          padding: 0.75rem 0.85rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
        }

        .mode-btn:hover {
          border-color: var(--primary-color);
        }

        .mode-btn.active {
          border-color: var(--primary-color);
          background: rgba(99, 102, 241, 0.08);
        }

        .mode-btn-texts {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .mode-btn-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .mode-btn-sub {
          font-size: 0.68rem;
          color: var(--text-muted);
          line-height: 1.3;
        }

        .custom-modules-container {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .custom-modules-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.25rem 0.2rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .quick-action-buttons {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .btn-link {
          background: transparent;
          border: none;
          color: var(--primary-color);
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .btn-link:hover {
          text-decoration: underline;
        }

        .modules-list {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          max-height: 280px;
          overflow-y: auto;
          padding-right: 0.25rem;
        }

        .module-row-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
          gap: 0.5rem;
        }

        .module-row-card:hover {
          border-color: var(--primary-color);
        }

        .module-row-card.module-active {
          border-color: rgba(99, 102, 241, 0.35);
          background: rgba(99, 102, 241, 0.04);
        }

        .module-row-card.module-inactive {
          opacity: 0.6;
        }

        .module-left {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          min-width: 0;
        }

        .module-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .icon-on {
          background: rgba(99, 102, 241, 0.18);
          color: var(--primary-color);
        }

        .icon-off {
          background: rgba(148, 163, 184, 0.1);
          color: #94a3b8;
        }

        .module-text-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .module-name-line {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .module-name {
          color: var(--text-main);
          white-space: nowrap;
        }

        .module-path {
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.06);
          padding: 0.05rem 0.3rem;
          border-radius: var(--radius-sm);
        }

        .module-desc {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .global-info-banner {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          background: rgba(99, 102, 241, 0.06);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: var(--radius-md);
        }

        .global-info-text {
          display: flex;
          flex-direction: column;
        }

        /* iOS Switch Toggle Component */
        .switch-toggle-label {
          position: relative;
          display: inline-block;
          width: 38px;
          height: 20px;
          cursor: pointer;
        }

        .switch-input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .switch-slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background-color: rgba(255, 255, 255, 0.15);
          transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 34px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .switch-slider:before {
          position: absolute;
          content: "";
          height: 14px;
          width: 14px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .switch-input:checked + .switch-slider {
          background-color: var(--primary-color);
          border-color: var(--primary-color);
        }

        .switch-input:checked + .switch-slider:before {
          transform: translateX(18px);
        }
      `}</style>
    </Modal>
  );
};
