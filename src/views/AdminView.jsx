import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserModal } from '../components/admin/UserModal';
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
  ArrowRight,
  Shield,
  Clock,
  Mail,
  User as UserIcon,
  RefreshCw
} from 'lucide-react';

export const AdminView = () => {
  const { 
    currentUser, 
    usersList = [], 
    updateUserStatus, 
    deleteUser 
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const totalUsers = usersList.length;
  const activeUsers = usersList.filter(u => u && u.status === 'active').length;
  const disabledUsers = usersList.filter(u => u && u.status === 'disabled').length;
  const superAdminCount = usersList.filter(u => u && u.role === 'super_admin').length;

  const filteredUsers = usersList.filter(user => {
    if (!user) return false;
    const matchSearch = 
      (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    
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
                <th>User Account</th>
                <th>Role</th>
                <th>Access Status</th>
                <th>Created Date</th>
                <th>Created By</th>
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

                  return (
                    <tr key={user.uid} className={`user-row ${isSuspended ? 'row-suspended' : ''}`}>
                      {/* Name & Email */}
                      <td>
                        <div className="user-profile-cell">
                          <div className={`user-avatar ${user.role === 'super_admin' ? 'avatar-admin' : 'avatar-user'}`}>
                            {getInitials(user.name)}
                          </div>
                          <div className="user-details">
                            <span className="user-name">
                              {user.name}
                              {isCurrentLoggedAdmin && <span className="you-tag">(You)</span>}
                            </span>
                            <span className="user-email">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td>
                        <span className={`role-badge ${user.role === 'super_admin' ? 'role-super-admin' : 'role-regular-user'}`}>
                          {user.role === 'super_admin' ? '👑 Super Admin' : '👤 Regular User'}
                        </span>
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

                      {/* Created By */}
                      <td>
                        <span className="text-xs text-sub">
                          {user.createdBy || 'System'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="actions-cell">
                          {/* Toggle Active / Suspend */}
                          {!isCurrentLoggedAdmin && (
                            <button
                              className={`btn-action ${isSuspended ? 'btn-activate' : 'btn-suspend'}`}
                              onClick={() => handleToggleStatus(user)}
                              title={isSuspended ? 'Reactivate User Account' : 'Suspend User Account'}
                            >
                              {isSuspended ? <CheckCircle2 size={15} /> : <UserX size={15} />}
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
            • <strong>Super Admin</strong>: Can create, manage, suspend, or reset passwords for all users.<br />
            • <strong>Regular Users</strong>: Can log in with their credentials to access the <strong>Dashboard</strong>, <strong>Habits & Routines</strong>, <strong>Health Protocol</strong>, <strong>16-Week Career Roadmap</strong>, <strong>MCU Watchlist</strong>, and <strong>₹18,000 Budget Jars</strong>. User data is saved in isolated private cloud documents.
          </p>
        </div>
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setUserToEdit(null);
        }}
        userToEdit={userToEdit}
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

        .user-name {
          font-weight: 700;
          color: var(--text-main);
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
      `}</style>
    </div>
  );
};
