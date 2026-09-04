import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Shield, KeyRound, AlertCircle, CheckSquare, Square, SlidersHorizontal } from 'lucide-react';

export const UserModal = ({ isOpen, onClose, userToEdit = null }) => {
  const { createUser, updateUserPassword, updateUserAllowedMenus, availableMenus = [] } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [useCustomMenus, setUseCustomMenus] = useState(false);
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name || '');
      setEmail(userToEdit.email || '');
      setPassword('');
      setRole(userToEdit.role || 'user');
      if (Array.isArray(userToEdit.allowedMenus)) {
        setUseCustomMenus(true);
        setSelectedMenus(userToEdit.allowedMenus);
      } else {
        setUseCustomMenus(false);
        setSelectedMenus(availableMenus.map(m => m.id));
      }
      setError(null);
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('user');
      setUseCustomMenus(false);
      setSelectedMenus(availableMenus.map(m => m.id));
      setError(null);
    }
  }, [userToEdit, isOpen]);

  const toggleMenuSelect = (menuId) => {
    setSelectedMenus(prev => 
      prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const allowedMenusPayload = useCustomMenus ? selectedMenus : null;

    if (userToEdit) {
      // Password reset or custom menu update
      if (password.trim()) {
        const res = await updateUserPassword(userToEdit.uid, password);
        if (!res.success) {
          setError(res.error);
          setIsSubmitting(false);
          return;
        }
      }

      if (userToEdit.role !== 'super_admin') {
        const menuRes = await updateUserAllowedMenus(userToEdit.uid, allowedMenusPayload);
        if (!menuRes.success) {
          setError(menuRes.error);
          setIsSubmitting(false);
          return;
        }
      }

      setIsSubmitting(false);
      onClose();
    } else {
      // Create new user
      const res = await createUser({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
        allowedMenus: allowedMenusPayload
      });

      if (!res.success) {
        setError(res.error);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={userToEdit ? `Manage User: ${userToEdit.name}` : '➕ Add New User Account'}
      maxWidth="520px"
    >
      <form onSubmit={handleSubmit} className="user-modal-form">
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {!userToEdit && (
          <>
            <div className="input-group">
              <label className="label">Full Name *</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  className="input pl-9"
                  placeholder="e.g. John Doe or Member Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="input-group">
              <label className="label">Email Address *</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  className="input pl-9"
                  placeholder="e.g. user@lifetracker.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="label">Account Role *</label>
              <div className="input-with-icon">
                <Shield size={16} className="input-icon" />
                <select
                  className="select pl-9"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="user">👤 Regular User (Access to Life Tracker)</option>
                  <option value="super_admin">👑 Super Admin (Full User Management Privileges)</option>
                </select>
              </div>
            </div>
          </>
        )}

        <div className="input-group">
          <label className="label">
            {userToEdit ? 'New Password (leave empty to keep current)' : 'Initial Password *'}
          </label>
          <div className="input-with-icon">
            <Lock size={16} className="input-icon" />
            <input
              type="text"
              className="input pl-9"
              placeholder={userToEdit ? 'Enter new password to reset' : 'Set a temporary login password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!userToEdit}
              minLength={4}
            />
          </div>
          <span className="text-xs text-sub mt-1">
            Min 4 characters. The user can log in with these credentials immediately.
          </span>
        </div>

        {/* Custom Menu Permissions for Regular Users */}
        {(role === 'user' || userToEdit?.role === 'user') && (
          <div className="custom-permissions-section">
            <div className="custom-perm-header">
              <label className="custom-checkbox-row">
                <input
                  type="checkbox"
                  checked={useCustomMenus}
                  onChange={(e) => setUseCustomMenus(e.target.checked)}
                />
                <span className="font-semibold text-sm">Assign Custom Module Permissions for this user</span>
              </label>
              <span className="text-xs text-sub">
                {useCustomMenus ? 'Custom overrides enabled' : 'Uses Global Admin Toggles'}
              </span>
            </div>

            {useCustomMenus && (
              <div className="user-menus-checklist">
                {availableMenus.map((menu) => {
                  const isChecked = selectedMenus.includes(menu.id);
                  return (
                    <div 
                      key={menu.id} 
                      className={`menu-check-card ${isChecked ? 'checked' : ''}`}
                      onClick={() => toggleMenuSelect(menu.id)}
                    >
                      {isChecked ? (
                        <CheckSquare size={16} className="text-primary flex-shrink-0" />
                      ) : (
                        <Square size={16} className="text-muted flex-shrink-0" />
                      )}
                      <div className="menu-check-info">
                        <span className="menu-check-name">{menu.label}</span>
                        <span className="menu-check-path">{menu.path}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : userToEdit ? 'Save Changes' : 'Create User Account'}
          </button>
        </div>
      </form>

      <style>{`
        .user-modal-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 0.75rem;
          color: var(--text-muted);
          pointer-events: none;
        }

        .pl-9 {
          padding-left: 2.3rem !important;
        }

        .alert-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 0.85rem;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          color: #ef4444;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .custom-permissions-section {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .custom-perm-header {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .custom-checkbox-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .user-menus-checklist {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
          margin-top: 0.25rem;
        }

        .menu-check-card {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.65rem;
          border-radius: var(--radius-sm);
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .menu-check-card:hover {
          border-color: var(--primary-color);
        }

        .menu-check-card.checked {
          border-color: var(--primary-color);
          background: rgba(99, 102, 241, 0.08);
        }

        .menu-check-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .menu-check-name {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .menu-check-path {
          font-size: 0.65rem;
          color: var(--text-muted);
          font-family: monospace;
        }
      `}</style>
    </Modal>
  );
};
