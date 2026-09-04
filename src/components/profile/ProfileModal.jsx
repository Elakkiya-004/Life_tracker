import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { PRESET_AVATARS } from '../../services/storage';
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  Sparkles,
  KeyRound,
  Briefcase,
  FileText
} from 'lucide-react';

export const ProfileModal = ({ isOpen, onClose }) => {
  const { currentUser, updateCurrentUserProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarBg, setAvatarBg] = useState(null);

  // Password fields
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser && isOpen) {
      setName(currentUser.name || '');
      setJobTitle(currentUser.jobTitle || '');
      setBio(currentUser.bio || '');
      setAvatar(currentUser.avatar || null);
      setAvatarBg(currentUser.avatarBg || null);

      setShowPasswordSection(false);
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setSuccessMsg(null);
    }
  }, [currentUser, isOpen]);

  if (!currentUser) return null;

  const isCustomImage = avatar && (avatar.startsWith('data:image') || avatar.startsWith('http'));

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size exceeds 2MB limit. Please upload a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setAvatar(dataUrl);
      setAvatarBg(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset) => {
    setAvatar(preset.emoji);
    setAvatarBg(preset.bg);
    setError(null);
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setAvatarBg(null);
  };

  const getInitials = (userName = '') => {
    const parts = (userName || '').trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return ((userName && userName[0]) || 'U').toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    if (!name.trim()) {
      setError('Full Name cannot be empty.');
      setIsSubmitting(false);
      return;
    }

    // Password validation if attempting password change
    if (showPasswordSection && newPassword) {
      if (newPassword.length < 4) {
        setError('New password must be at least 4 characters long.');
        setIsSubmitting(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New password and confirmation do not match.');
        setIsSubmitting(false);
        return;
      }
    }

    const res = await updateCurrentUserProfile({
      name: name.trim(),
      avatar,
      avatarBg,
      jobTitle: jobTitle.trim(),
      bio: bio.trim(),
      newPassword: showPasswordSection && newPassword ? newPassword : null,
    });

    if (!res.success) {
      setError(res.error);
      setIsSubmitting(false);
      return;
    }

    setSuccessMsg('Profile updated successfully!');
    setIsSubmitting(false);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="👤 Edit Profile & Account Details"
      maxWidth="540px"
    >
      <form onSubmit={handleSubmit} className="profile-edit-form">
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Avatar & Photo Selection Center */}
        <div className="avatar-edit-card">
          <div className="avatar-preview-wrapper">
            <div 
              className="avatar-large-preview"
              style={{
                background: isCustomImage ? 'none' : (avatarBg || (currentUser.role === 'super_admin' ? 'linear-gradient(135deg, #6366f1, #f59e0b)' : 'linear-gradient(135deg, #0ea5e9, #10b981)'))
              }}
            >
              {isCustomImage ? (
                <img src={avatar} alt="Profile Avatar" className="avatar-img" />
              ) : avatar ? (
                <span className="avatar-emoji">{avatar}</span>
              ) : (
                <span className="avatar-initials">{getInitials(name || currentUser.name)}</span>
              )}
            </div>

            <button
              type="button"
              className="avatar-upload-overlay-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Upload Custom Image"
            >
              <Camera size={16} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>

          <div className="avatar-actions-area">
            <div className="avatar-actions-row">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} />
                <span>Upload Photo</span>
              </button>

              {avatar && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm text-danger"
                  onClick={handleRemoveAvatar}
                  title="Remove Profile Photo"
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              )}
            </div>
            <span className="text-xs text-sub">JPG, PNG, GIF up to 2MB or choose a preset below:</span>
          </div>
        </div>

        {/* Preset Avatars Gallery */}
        <div className="preset-avatars-box">
          <span className="preset-label text-xs font-semibold text-sub">✨ Choose from Preset Avatars:</span>
          <div className="preset-grid">
            {PRESET_AVATARS.map((preset) => {
              const isSelected = avatar === preset.emoji;
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`preset-btn ${isSelected ? 'selected' : ''}`}
                  style={{ background: preset.bg }}
                  onClick={() => handleSelectPreset(preset)}
                  title={preset.label}
                >
                  <span>{preset.emoji}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Name & Job Title Row */}
        <div className="form-row">
          <div className="input-group flex-1">
            <label className="label">Full Name *</label>
            <div className="input-with-icon">
              <User size={16} className="input-icon" />
              <input
                type="text"
                className="input pl-9"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
          </div>

          <div className="input-group flex-1">
            <label className="label">Job Title / Role</label>
            <div className="input-with-icon">
              <Briefcase size={16} className="input-icon" />
              <input
                type="text"
                className="input pl-9"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Software Engineer"
              />
            </div>
          </div>
        </div>

        {/* Email & Role (Read-only) */}
        <div className="form-row">
          <div className="input-group flex-1">
            <label className="label">Email Address (Login ID)</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                className="input pl-9 disabled-input"
                value={currentUser.email}
                disabled
              />
            </div>
          </div>

          <div className="input-group flex-1">
            <label className="label">Account Governance Role</label>
            <div className="input-with-icon">
              <Shield size={16} className="input-icon" />
              <input
                type="text"
                className="input pl-9 disabled-input"
                value={currentUser.role === 'super_admin' ? '👑 Super Admin' : '👤 Regular Member'}
                disabled
              />
            </div>
          </div>
        </div>

        {/* Bio / Focus */}
        <div className="input-group">
          <label className="label">Bio / Daily Focus Goal</label>
          <div className="input-with-icon">
            <FileText size={16} className="input-icon" />
            <input
              type="text"
              className="input pl-9"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Staying consistent on Habits & ₹18k Budget"
            />
          </div>
        </div>

        {/* Password Security Accordion */}
        <div className="password-accordion-card">
          <button
            type="button"
            className="accordion-toggle-btn"
            onClick={() => setShowPasswordSection(!showPasswordSection)}
          >
            <div className="flex-center-gap">
              <KeyRound size={16} className="text-primary" />
              <span className="font-bold text-sm">
                {showPasswordSection ? 'Hide Password Change' : '🔒 Change Account Password'}
              </span>
            </div>
            <span className="text-xs text-primary font-semibold">
              {showPasswordSection ? 'Close' : 'Modify'}
            </span>
          </button>

          {showPasswordSection && (
            <div className="password-fields-box">
              <div className="form-row">
                <div className="input-group flex-1">
                  <label className="label">New Password (min 4 chars) *</label>
                  <div className="input-with-icon">
                    <Lock size={16} className="input-icon" />
                    <input
                      type="password"
                      className="input pl-9"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      minLength={4}
                    />
                  </div>
                </div>

                <div className="input-group flex-1">
                  <label className="label">Confirm New Password *</label>
                  <div className="input-with-icon">
                    <Lock size={16} className="input-icon" />
                    <input
                      type="password"
                      className="input pl-9"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      minLength={4}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving Profile...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <style>{`
        .profile-edit-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .avatar-edit-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.15rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .avatar-preview-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .avatar-large-preview {
          width: 72px;
          height: 72px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          border: 2px solid rgba(255, 255, 255, 0.15);
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-emoji {
          font-size: 2.2rem;
          line-height: 1;
        }

        .avatar-initials {
          font-size: 1.5rem;
          font-weight: 800;
          color: #ffffff;
        }

        .avatar-upload-overlay-btn {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 28px;
          height: 28px;
          border-radius: var(--radius-full);
          background: var(--primary-color);
          color: #ffffff;
          border: 2px solid var(--bg-card);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.15s ease;
        }

        .avatar-upload-overlay-btn:hover {
          transform: scale(1.1);
        }

        .avatar-actions-area {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .avatar-actions-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .preset-avatars-box {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.85rem 1rem;
          background: rgba(99, 102, 241, 0.04);
          border: 1px dashed rgba(99, 102, 241, 0.25);
          border-radius: var(--radius-md);
        }

        .preset-grid {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.25rem;
        }

        .preset-btn {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          border: 2px solid transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
          cursor: pointer;
          flex-shrink: 0;
          transition: transform 0.15s ease, border-color 0.15s ease;
        }

        .preset-btn:hover {
          transform: scale(1.12);
        }

        .preset-btn.selected {
          border-color: #ffffff;
          box-shadow: 0 0 0 2px var(--primary-color);
          transform: scale(1.1);
        }

        .form-row {
          display: flex;
          gap: 0.75rem;
        }

        .flex-1 {
          flex: 1;
        }

        .disabled-input {
          opacity: 0.7;
          cursor: not-allowed;
          background: rgba(255, 255, 255, 0.02) !important;
        }

        .password-accordion-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .accordion-toggle-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
        }

        .password-fields-box {
          padding: 0.85rem 1rem;
          border-top: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          background: rgba(0, 0, 0, 0.1);
        }

        .flex-center-gap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
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

        .alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-md);
          font-size: 0.825rem;
          font-weight: 600;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .alert-success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
        }
      `}</style>
    </Modal>
  );
};
