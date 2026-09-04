import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Shield, KeyRound, AlertCircle } from 'lucide-react';

export const UserModal = ({ isOpen, onClose, userToEdit = null }) => {
  const { createUser, updateUserPassword } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name || '');
      setEmail(userToEdit.email || '');
      setPassword('');
      setRole(userToEdit.role || 'user');
      setError(null);
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('user');
      setError(null);
    }
  }, [userToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (userToEdit) {
      // Password reset for existing user
      if (password.trim()) {
        const res = await updateUserPassword(userToEdit.uid, password);
        if (!res.success) {
          setError(res.error);
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
        role
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
      maxWidth="480px"
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
                  placeholder="e.g. John Doe or Developer Name"
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
      `}</style>
    </Modal>
  );
};
