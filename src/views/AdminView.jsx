import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserModal } from '../components/admin/UserModal';
import { EmployeePermissionsModal } from '../components/admin/EmployeePermissionsModal';
import { 
  ShieldCheck, 
  UserPlus, 
  Users, 
  UserCheck, 
  UserX, 
  Search, 
  KeyRound, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Shield,
  LayoutDashboard,
  HeartPulse,
  Compass,
  Film,
  Wallet,
  BarChart3,
  Settings as SettingsIcon,
  Sliders,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  SlidersHorizontal,
  Globe,
  Sliders as SlidersIcon
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

export const AdminView = () => {
  const { 
    currentUser, 
    usersList = [], 
    updateUserStatus, 
    deleteUser,
    menuPermissions = {},
    availableMenus = [],
    toggleMenuPermission,
    updateAllMenuPermissions
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [permissionsUser, setPermissionsUser] = useState(null);
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [toggleSuccessMsg, setToggleSuccessMsg] = useState(null);

  const totalUsers = usersList.length;
  const activeUsers = usersList.filter(u => u && u.status === 'active').length;
  const disabledUsers = usersList.filter(u => u && u.status === 'disabled').length;
  const superAdminCount = usersList.filter(u => u && u.role === 'super_admin').length;

  const enabledMenusCount = availableMenus.filter(m => menuPermissions[m.id] !== false).length;

  const handleToggle = async (menuId, menuLabel) => {
    const isCurrentlyEnabled = menuPermissions[menuId] !== false;
    await toggleMenuPermission(menuId);
    setToggleSuccessMsg(`"${menuLabel}" is now ${!isCurrentlyEnabled ? 'visible' : 'hidden'} for regular users.`);
    setTimeout(() => setToggleSuccessMsg(null), 3000);
  };

  const handleEnableAll = async () => {
    const allEnabled = {};
    availableMenus.forEach(m => { allEnabled[m.id] = true; });
    await updateAllMenuPermissions(allEnabled);
    setToggleSuccessMsg('All navigation menus are now visible to users.');
    setTimeout(() => setToggleSuccessMsg(null), 3000);
  };

  const handleResetDefaults = async () => {
    const defaults = {
      dashboard: true,
      habits: true,
      protocol: true,
      roadmap: true,
      watchlists: true,
      finance: true,
      analytics: true,
      settings: true,
    };
    await updateAllMenuPermissions(defaults);
    setToggleSuccessMsg('Menu permissions reset to defaults.');
    setTimeout(() => setToggleSuccessMsg(null), 3000);
  };

  const filteredUsers = usersList.filter(user => {
    if (!user) return false;
    const matchSearch = 
      (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.jobTitle || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchRole = roleFilter === 'all' || user.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleCreateUser = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleOpenPermissions = (user) => {
    setPermissionsUser(user);
    setIsPermModalOpen(true);
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    const confirmMsg = newStatus === 'disabled' 
      ? `Are you sure you want to suspend access for "${user.name}" (${user.email})?`
      : `Re-activate access for "${user.name}"?`;

    if (window.confirm(confirmMsg)) {
      const res = await updateUserStatus(user.uid, newStatus);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Permanently delete user account "${user.name}" (${user.email})? This action cannot be undone.`)) {
      const res = await deleteUser(user.uid);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (name[0] || 'U').toUpperCase();
  };

  return (
    <div className="admin-container">
      {/* Admin Hero Header */}
      <div className="admin-hero card">
        <div className="hero-left-content">
          <div className="admin-pill">
            <ShieldCheck size={16} />
            <span>SUPER ADMIN CONTROL CENTER</span>
          </div>
          <h2 className="admin-main-title">
            User Directory & Access Governance
          </h2>
          <p className="admin-main-desc text-sub text-sm">
            As <strong>Super Admin</strong>, you have exclusive authority to add new users, grant role privileges, and control workspace access.
          </p>
        </div>

        <button 
          className="btn btn-primary btn-add-user"
          onClick={handleCreateUser}
        >
          <UserPlus size={18} />
          <span>Add New User</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="admin-metrics-grid">
        <div className="card metric-card">
          <div className="metric-icon-wrap bg-indigo-glow">
            <Users size={22} className="text-indigo" />
          </div>
          <div className="metric-info">
            <span className="metric-title">Total Users</span>
            <span className="metric-number">{totalUsers}</span>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon-wrap bg-emerald-glow">
            <UserCheck size={22} className="text-emerald" />
          </div>
          <div className="metric-info">
            <span className="metric-title">Active Accounts</span>
            <span className="metric-number text-emerald">{activeUsers}</span>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon-wrap bg-rose-glow">
            <UserX size={22} className="text-rose" />
          </div>
          <div className="metric-info">
            <span className="metric-title">Suspended</span>
            <span className="metric-number text-rose">{disabledUsers}</span>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon-wrap bg-amber-glow">
            <Shield size={22} className="text-amber" />
          </div>
          <div className="metric-info">
            <span className="metric-title">Super Admins</span>
            <span className="metric-number text-amber">{superAdminCount}</span>
          </div>
        </div>
      </div>

      {/* Navigation & Feature Access Controls (Show/Hide Toggles for Users) */}
      <div className="card menu-toggle-card">
        <div className="menu-toggle-header">
          <div className="menu-toggle-title-area">
            <div className="toggle-badge-icon">
              <SlidersHorizontal size={20} className="text-primary" />
            </div>
            <div>
              <div className="flex-center-gap">
                <h3 className="menu-toggle-title">User Navigation & Module Visibility</h3>
                <span className="active-modules-pill">
                  {enabledMenusCount} of {availableMenus.length} Menus Visible
                </span>
              </div>
              <p className="menu-toggle-desc text-sub text-xs">
                Toggle switches below to show or hide navigation items & pages for regular members in real-time. Super Admin always retains full access to everything.
              </p>
            </div>
          </div>

          <div className="menu-toggle-actions">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleEnableAll}
              title="Show all menus to users"
            >
              <Check size={14} />
              <span>Enable All</span>
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleResetDefaults}
              title="Reset to default visibility"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Live Feedback Banner */}
        {toggleSuccessMsg && (
          <div className="toggle-toast-banner">
            <CheckCircle2 size={16} className="text-emerald" />
            <span>{toggleSuccessMsg}</span>
          </div>
        )}

        {/* Grid of Menu Module Toggles */}
        <div className="menu-grid">
          {availableMenus.map((menu) => {
            const isEnabled = menuPermissions[menu.id] !== false;
            const IconComponent = MENU_ICONS[menu.icon] || LayoutDashboard;

            return (
              <div 
                key={menu.id} 
                className={`menu-toggle-item ${isEnabled ? 'menu-enabled' : 'menu-disabled'}`}
                onClick={() => handleToggle(menu.id, menu.label)}
              >
                <div className="menu-item-left">
                  <div className={`menu-icon-box ${isEnabled ? 'box-active' : 'box-inactive'}`}>
                    <IconComponent size={20} />
                  </div>
                  <div className="menu-info-texts">
                    <div className="menu-name-row">
                      <span className="menu-name">{menu.label}</span>
                      <span className="menu-path-tag">{menu.path}</span>
                    </div>
                    <span className="menu-desc">{menu.desc}</span>
                  </div>
                </div>

                <div className="menu-item-right" onClick={(e) => e.stopPropagation()}>
                  <span className={`status-indicator ${isEnabled ? 'ind-visible' : 'ind-hidden'}`}>
                    {isEnabled ? (
                      <>
                        <Eye size={13} />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff size={13} />
                        <span>Hidden</span>
                      </>
                    )}
                  </span>

                  {/* iOS Style Switch Toggle */}
                  <label className="switch-toggle-label" title={`Toggle ${menu.label} visibility`}>
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => handleToggle(menu.id, menu.label)}
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

      {/* Filter and Search Toolbar */}
      <div className="admin-toolbar-row">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="role-filter-group">
          <button
            className={`filter-btn ${roleFilter === 'all' ? 'active' : ''}`}
            onClick={() => setRoleFilter('all')}
          >
            All ({totalUsers})
          </button>
          <button
            className={`filter-btn ${roleFilter === 'user' ? 'active' : ''}`}
            onClick={() => setRoleFilter('user')}
          >
            Users ({totalUsers - superAdminCount})
          </button>
          <button
            className={`filter-btn ${roleFilter === 'super_admin' ? 'active' : ''}`}
            onClick={() => setRoleFilter('super_admin')}
          >
            Admins ({superAdminCount})
          </button>
        </div>
      </div>

      {/* User Management Table */}
      <div className="card admin-table-card">
        <div className="table-responsive">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>Employee / User</th>
                <th>Role</th>
                <th>Navigation Access</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-sub">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrentLoggedAdmin = user.email === currentUser?.email;
                  const isSuspended = user.status === 'disabled';
                  const isCustomMenus = Array.isArray(user.allowedMenus);
                  const userAvatarIsImg = user.avatar && (user.avatar.startsWith('data:image') || user.avatar.startsWith('http'));

                  return (
                    <tr key={user.uid} className={`user-row ${isSuspended ? 'row-suspended' : ''}`}>
                      {/* Name & Avatar & Email */}
                      <td>
                        <div className="user-profile-cell">
                          <div 
                            className={`user-avatar ${user.role === 'super_admin' ? 'avatar-admin' : 'avatar-user'}`}
                            style={{ background: user.avatarBg || undefined }}
                          >
                            {userAvatarIsImg ? (
                              <img src={user.avatar} alt={user.name} className="user-table-avatar-img" />
                            ) : user.avatar ? (
                              <span className="user-table-emoji">{user.avatar}</span>
                            ) : (
                              getInitials(user.name)
                            )}
                          </div>
                          <div className="user-details">
                            <div className="user-name-line">
                              <span className="user-name">{user.name}</span>
                              {isCurrentLoggedAdmin && <span className="you-tag">(You)</span>}
                            </div>
                            {user.jobTitle && (
                              <span className="user-job-sub">{user.jobTitle}</span>
                            )}
                            <span className="user-email">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td>
                        <span className={`role-badge ${user.role === 'super_admin' ? 'role-super-admin' : 'role-regular-user'}`}>
                          {user.role === 'super_admin' ? '👑 Super Admin' : '👤 Regular Member'}
                        </span>
                      </td>

                      {/* Navigation Menu Access Column */}
                      <td>
                        {user.role === 'super_admin' ? (
                          <span className="perm-badge badge-admin-all" title="Super Admins have unrestricted access to all 8 modules and Console">
                            👑 Full (8/8)
                          </span>
                        ) : isCustomMenus ? (
                          <button
                            type="button"
                            className="perm-btn btn-perm-custom"
                            onClick={() => handleOpenPermissions(user)}
                            title="Click to modify custom menu permissions for this employee"
                          >
                            <SlidersHorizontal size={13} />
                            <span>Custom ({user.allowedMenus.length}/8)</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="perm-btn btn-perm-global"
                            onClick={() => handleOpenPermissions(user)}
                            title="Click to customize menu permissions for this employee"
                          >
                            <Globe size={13} />
                            <span>Global Rules ({enabledMenusCount}/8)</span>
                          </button>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td>
                        <span className={`status-pill ${isSuspended ? 'status-disabled' : 'status-active'}`}>
                          {isSuspended ? (
                            <>
                              <XCircle size={13} />
                              <span>Suspended</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={13} />
                              <span>Active</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td>
                        <span className="text-xs text-sub">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="actions-cell">
                          {/* Menu Permissions Button (For regular users) */}
                          {user.role !== 'super_admin' && (
                            <button
                              className="btn-action btn-perms-action"
                              onClick={() => handleOpenPermissions(user)}
                              title="Configure Menus for this Employee"
                            >
                              <SlidersHorizontal size={13} />
                              <span>Menus</span>
                            </button>
                          )}

                          {/* Toggle Active / Suspend */}
                          {!isCurrentLoggedAdmin && (
                            <button
                              className={`btn-action ${isSuspended ? 'btn-activate' : 'btn-suspend'}`}
                              onClick={() => handleToggleStatus(user)}
                              title={isSuspended ? 'Reactivate User Account' : 'Suspend User Account'}
                            >
                              {isSuspended ? <CheckCircle2 size={14} /> : <UserX size={14} />}
                              <span>{isSuspended ? 'Activate' : 'Suspend'}</span>
                            </button>
                          )}

                          {/* Reset Password */}
                          <button
                            className="btn-icon btn-ghost btn-sm"
                            onClick={() => handleEditUser(user)}
                            title="Reset User Password"
                          >
                            <KeyRound size={15} />
                          </button>

                          {/* Delete */}
                          {!isCurrentLoggedAdmin && (
                            <button
                              className="btn-icon btn-ghost btn-sm text-danger"
                              onClick={() => handleDelete(user)}
                              title="Delete User"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Info Callout */}
      <div className="card admin-info-card">
        <div className="info-icon-box">
          <Sparkles size={20} className="text-primary" />
        </div>
        <div className="info-text-content">
          <h4 className="info-heading">Role-Based Access Control (RBAC) System Architecture</h4>
          <p className="info-sub text-xs text-sub">
            • <strong>Super Admin</strong>: Has unrestricted access to all 8 modules and the Super Admin Console (`/admin`) to create users, reset passwords, and toggle menu visibility.<br />
            • <strong>Per-Employee Menu Toggles</strong>: Super Admin can assign specific modules (e.g. Habits, Roadmap, Budget) individually per employee or apply global visibility toggles.
          </p>
        </div>
      </div>

      {/* User Create / Reset Password Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setUserToEdit(null);
        }}
        userToEdit={userToEdit}
      />

      {/* Employee Menu Permissions Modal */}
      <EmployeePermissionsModal
        isOpen={isPermModalOpen}
        onClose={() => {
          setIsPermModalOpen(false);
          setPermissionsUser(null);
        }}
        employee={permissionsUser}
      />

      <style>{`
        .admin-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .admin-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.75rem;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(245, 158, 11, 0.12));
          border-color: rgba(99, 102, 241, 0.35);
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .hero-left-content {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          max-width: 680px;
        }

        .admin-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(99, 102, 241, 0.2);
          color: var(--primary-color);
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          width: fit-content;
        }

        .admin-main-title {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .admin-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .metric-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
        }

        .metric-icon-wrap {
          width: 46px;
          height: 46px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .bg-indigo-glow { background: rgba(99, 102, 241, 0.15); }
        .bg-emerald-glow { background: rgba(16, 185, 129, 0.15); }
        .bg-rose-glow { background: rgba(239, 68, 68, 0.15); }
        .bg-amber-glow { background: rgba(245, 158, 11, 0.15); }

        .text-indigo { color: #818cf8; }
        .text-emerald { color: #10b981; }
        .text-rose { color: #ef4444; }
        .text-amber { color: #f59e0b; }

        .metric-info {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .metric-title {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
        }

        .metric-number {
          font-size: 1.5rem;
          font-weight: 800;
          line-height: 1;
        }

        .admin-toolbar-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 260px;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          color: var(--text-muted);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 0.5rem 0.75rem 0.5rem 2.2rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          color: var(--text-main);
          outline: none;
        }

        .search-input:focus {
          border-color: var(--primary-color);
        }

        .role-filter-group {
          display: flex;
          background: var(--bg-card);
          padding: 0.2rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          gap: 0.2rem;
        }

        .filter-btn {
          padding: 0.4rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn.active {
          background: var(--primary-color);
          color: #ffffff;
        }

        .admin-table-card {
          padding: 0;
          overflow: hidden;
        }

        .admin-users-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          text-align: left;
        }

        .admin-users-table th {
          background: var(--bg-secondary);
          color: var(--text-main);
          font-weight: 700;
          padding: 0.85rem 1rem;
          border-bottom: 2px solid var(--border-color);
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .admin-users-table td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid var(--border-color);
          vertical-align: middle;
        }

        .user-profile-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.85rem;
          flex-shrink: 0;
        }

        .avatar-admin {
          background: linear-gradient(135deg, #6366f1, #f59e0b);
          color: #ffffff;
        }

        .avatar-user {
          background: linear-gradient(135deg, #0ea5e9, #10b981);
          color: #ffffff;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .user-name-line {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .user-name {
          font-weight: 700;
          color: var(--text-main);
        }

        .user-job-sub {
          font-size: 0.7rem;
          color: var(--primary-color);
          font-weight: 600;
        }

        .user-table-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: var(--radius-full);
        }

        .user-table-emoji {
          font-size: 1.15rem;
          line-height: 1;
        }

        .you-tag {
          font-size: 0.7rem;
          color: var(--primary-color);
          margin-left: 0.35rem;
        }

        .user-email {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .perm-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.25rem 0.55rem;
          border-radius: var(--radius-full);
        }

        .badge-admin-all {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .perm-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-full);
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-perm-custom {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          border-color: rgba(99, 102, 241, 0.35);
        }

        .btn-perm-custom:hover {
          background: rgba(99, 102, 241, 0.25);
          transform: translateY(-1px);
        }

        .btn-perm-global {
          background: rgba(14, 165, 233, 0.12);
          color: #0ea5e9;
          border-color: rgba(14, 165, 233, 0.3);
        }

        .btn-perm-global:hover {
          background: rgba(14, 165, 233, 0.22);
          transform: translateY(-1px);
        }

        .btn-perms-action {
          background: rgba(99, 102, 241, 0.12);
          color: #818cf8;
        }

        .btn-perms-action:hover {
          background: rgba(99, 102, 241, 0.25);
        }

        .role-badge {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);
          letter-spacing: 0.02em;
        }

        .role-super-admin {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .role-regular-user {
          background: rgba(14, 165, 233, 0.15);
          color: #0ea5e9;
          border: 1px solid rgba(14, 165, 233, 0.3);
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);
        }

        .status-active {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .status-disabled {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .row-suspended {
          opacity: 0.6;
          background: rgba(239, 68, 68, 0.03);
        }

        .actions-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
        }

        .btn-action {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.3rem 0.6rem;
          border-radius: var(--radius-sm);
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-suspend {
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
        }

        .btn-suspend:hover {
          background: rgba(239, 68, 68, 0.25);
        }

        .btn-activate {
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
        }

        .btn-activate:hover {
          background: rgba(16, 185, 129, 0.25);
        }

        .admin-info-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem;
          background: rgba(99, 102, 241, 0.05);
          border-color: rgba(99, 102, 241, 0.2);
        }

        .info-icon-box {
          background: rgba(99, 102, 241, 0.15);
          padding: 0.6rem;
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }

        .info-heading {
          font-size: 0.88rem;
          font-weight: 700;
          margin-bottom: 0.3rem;
          color: var(--primary-color);
        }

        .info-sub {
          line-height: 1.6;
        }

        /* Menu Visibility Toggle Section */
        .menu-toggle-card {
          padding: 1.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .menu-toggle-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .menu-toggle-title-area {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          max-width: 680px;
        }

        .toggle-badge-icon {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-md);
          background: rgba(99, 102, 241, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .flex-center-gap {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 0.2rem;
        }

        .menu-toggle-title {
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: var(--text-main);
        }

        .active-modules-pill {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .menu-toggle-desc {
          line-height: 1.4;
        }

        .menu-toggle-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .toggle-toast-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 0.9rem;
          border-radius: var(--radius-md);
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
          font-size: 0.825rem;
          font-weight: 600;
          animation: fadeIn 0.2s ease;
        }

        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 0.85rem;
        }

        .menu-toggle-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          gap: 0.75rem;
        }

        .menu-toggle-item:hover {
          border-color: var(--primary-color);
          transform: translateY(-1px);
        }

        .menu-toggle-item.menu-enabled {
          background: rgba(99, 102, 241, 0.04);
          border-color: rgba(99, 102, 241, 0.3);
        }

        .menu-toggle-item.menu-disabled {
          opacity: 0.65;
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .menu-item-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
        }

        .menu-icon-box {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .box-active {
          background: rgba(99, 102, 241, 0.2);
          color: var(--primary-color);
        }

        .box-inactive {
          background: rgba(148, 163, 184, 0.1);
          color: #94a3b8;
        }

        .menu-info-texts {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          min-width: 0;
        }

        .menu-name-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .menu-name {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-main);
          white-space: nowrap;
        }

        .menu-path-tag {
          font-size: 0.68rem;
          font-weight: 600;
          font-family: monospace;
          padding: 0.1rem 0.35rem;
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-muted);
        }

        .menu-desc {
          font-size: 0.72rem;
          color: var(--text-muted);
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .menu-item-right {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-shrink: 0;
        }

        .status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-full);
        }

        .ind-visible {
          color: #10b981;
          background: rgba(16, 185, 129, 0.12);
        }

        .ind-hidden {
          color: #94a3b8;
          background: rgba(148, 163, 184, 0.1);
        }

        /* iOS Switch Toggle Component */
        .switch-toggle-label {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
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
          height: 18px;
          width: 18px;
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
          transform: translateX(20px);
        }
      `}</style>
    </div>
  );
};
