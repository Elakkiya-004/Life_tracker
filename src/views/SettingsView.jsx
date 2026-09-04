import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { exportAllData, importAllData } from '../services/storage';
import { 
  User, 
  DollarSign, 
  Cloud, 
  Download, 
  Upload, 
  Smartphone, 
  Database, 
  Sparkles, 
  CheckCircle, 
  HelpCircle, 
  Film, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Moon, 
  ListTodo,
  Edit3,
  Shield,
  Briefcase
} from 'lucide-react';

export const SettingsView = () => {
  const { 
    settings, 
    updateSettings, 
    syncStatus, 
    pushToCloud,
    customLists,
    addCustomList,
    deleteCustomList,
    resetMarvelList,
    clearAllHabits,
    resetHabitsToDefault
  } = useApp();

  const { currentUser, setIsProfileModalOpen, isSuperAdmin } = useAuth();

  const [currency, setCurrency] = useState(settings.currency || '$');
  const [habitRolloverMode, setHabitRolloverMode] = useState(settings.habitRolloverMode || 'fresh_checks');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    updateSettings({
      currency,
      habitRolloverMode,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = importAllData(event.target.result);
      if (res.success) {
        alert('Data successfully imported! The page will now refresh.');
        window.location.reload();
      } else {
        alert(`Import error: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  const handleCreateList = (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    addCustomList({
      title: newListTitle.trim(),
      description: 'Custom tracking list',
      icon: 'Film',
      color: '#6366f1',
      items: [],
    });

    setNewListTitle('');
    setIsAddingList(false);
  };

  const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (name[0] || 'U').toUpperCase();
  };

  const userAvatarIsImg = currentUser?.avatar && (currentUser.avatar.startsWith('data:image') || currentUser.avatar.startsWith('http'));

  return (
    <div className="settings-container">
      {/* Account Profile Identity Card */}
      {currentUser && (
        <div className="settings-profile-hero card">
          <div className="profile-hero-left">
            <div 
              className="profile-hero-avatar"
              style={{ background: currentUser.avatarBg || undefined }}
            >
              {userAvatarIsImg ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="profile-hero-avatar-img" />
              ) : currentUser.avatar ? (
                <span className="profile-hero-emoji">{currentUser.avatar}</span>
              ) : (
                <span className="profile-hero-initials">{getInitials(currentUser.name)}</span>
              )}
            </div>

            <div className="profile-hero-details">
              <div className="profile-name-row">
                <h3 className="profile-hero-name">{currentUser.name}</h3>
                <span className={`profile-hero-role-pill ${isSuperAdmin ? 'role-pill-admin' : 'role-pill-user'}`}>
                  {isSuperAdmin ? '👑 Super Admin' : '👤 Regular Member'}
                </span>
              </div>
              <span className="profile-hero-email text-sub text-xs">{currentUser.email}</span>
              {currentUser.jobTitle && (
                <span className="profile-hero-job text-xs font-semibold text-primary">
                  {currentUser.jobTitle}
                </span>
              )}
              {currentUser.bio && (
                <p className="profile-hero-bio text-xs text-sub mt-1">"{currentUser.bio}"</p>
              )}
            </div>
          </div>

          <button 
            type="button" 
            className="btn btn-primary btn-sm btn-edit-profile"
            onClick={() => setIsProfileModalOpen(true)}
          >
            <Edit3 size={15} />
            <span>Edit Profile & Password</span>
          </button>
        </div>
      )}

      {/* App Preferences */}
      <div className="settings-card card">
        <div className="settings-card-header">
          <User size={20} className="text-primary" />
          <h3 className="title-md">App Preferences</h3>
        </div>

        <form onSubmit={handleSavePreferences} className="settings-form">
          <div className="form-row">
            <div className="input-group flex-1">
              <label className="label">Currency Symbol</label>
              <select
                className="select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="$">USD ($)</option>
                <option value="₹">INR (₹)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
                <option value="¥">JPY (¥)</option>
                <option value="C$">CAD (C$)</option>
                <option value="A$">AUD (A$)</option>
              </select>
            </div>

            <div className="input-group flex-1">
              <label className="label">10:30 PM Daily Rollover Behavior</label>
              <select
                className="select"
                value={habitRolloverMode}
                onChange={(e) => setHabitRolloverMode(e.target.value)}
              >
                <option value="fresh_checks">🔄 Fresh Checklist (Reset checkmarks for next day)</option>
                <option value="auto_clear">🧹 Auto-Delete Habits (Clean fresh slate every day)</option>
              </select>
            </div>
          </div>

          <div className="form-actions-left">
            <button type="submit" className="btn btn-primary">
              Save Preferences
            </button>
            {saveSuccess && (
              <span className="save-toast text-xs text-success">
                <CheckCircle size={14} /> Saved successfully!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Habits & Daily Routines Management */}
      <div className="settings-card card">
        <div className="settings-card-header">
          <ListTodo size={20} className="text-purple-400" />
          <h3 className="title-md">Habits & Daily Routines Management</h3>
        </div>
        <p className="text-sub text-xs">
          Manage your habit routine templates, perform bulk resets, or clear all tasks to build a completely new routine.
        </p>

        <div className="backup-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => {
              if (window.confirm('Restore the standard 14 daily routine habits?')) {
                resetHabitsToDefault();
                alert('Default habits restored!');
              }
            }}
          >
            <RotateCcw size={16} />
            <span>Restore Default Routines (14 Tasks)</span>
          </button>

          <button 
            type="button" 
            className="btn btn-ghost text-danger" 
            onClick={() => {
              if (window.confirm('⚠️ Are you sure you want to delete ALL habits? You will have an empty fresh list.')) {
                clearAllHabits();
                alert('All habits cleared!');
              }
            }}
          >
            <Trash2 size={16} />
            <span>Clear / Delete All Habits</span>
          </button>
        </div>
      </div>

      {/* Custom Lists & Marvel Watchlists Manager */}
      <div className="settings-card card">
        <div className="settings-card-header">
          <Film size={20} className="text-red-400" />
          <h3 className="title-md">Custom Progress Lists & Watchlists</h3>
        </div>
        <p className="text-sub text-xs">
          Manage your progress lists (like the Marvel Road to Doomsday 72-title watchlist) or create custom tracking lists.
        </p>

        <div className="lists-manager-grid">
          {customLists.map((list) => {
            const watched = list.items?.filter(i => i.status === 'watched').length || 0;
            const total = list.items?.length || 0;
            const pct = total > 0 ? Math.round((watched / total) * 100) : 0;

            return (
              <div key={list.id} className="custom-list-row card">
                <div className="custom-list-info">
                  <div className="custom-list-title-row">
                    <Film size={16} className="text-red-400" />
                    <span className="font-bold text-sm">{list.title}</span>
                    <span className="badge badge-marvel text-xs">{pct}% Watched</span>
                  </div>
                  <span className="text-xs text-sub">{watched} of {total} titles completed</span>
                </div>

                <div className="custom-list-actions">
                  {list.id === 'list-mcu-doomsday' ? (
                    <button
                      className="btn btn-ghost btn-sm text-sub"
                      onClick={() => {
                        if (window.confirm('Reset the 72 Marvel titles to default?')) {
                          resetMarvelList();
                        }
                      }}
                      title="Reset Marvel 72 titles"
                    >
                      <RotateCcw size={14} />
                      <span>Reset</span>
                    </button>
                  ) : (
                    <button
                      className="btn-icon btn-ghost btn-sm text-danger"
                      onClick={() => {
                        if (window.confirm(`Delete list "${list.title}"?`)) {
                          deleteCustomList(list.id);
                        }
                      }}
                      title="Delete list"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isAddingList ? (
          <form onSubmit={handleCreateList} className="new-list-form">
            <input
              type="text"
              className="input"
              placeholder="List title (e.g. Anime Series, Certifications, Books)..."
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              autoFocus
              required
            />
            <div className="form-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsAddingList(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Create List
              </button>
            </div>
          </form>
        ) : (
          <button className="btn btn-secondary btn-sm align-self-start" onClick={() => setIsAddingList(true)}>
            <Plus size={15} />
            <span>+ Create New Custom List</span>
          </button>
        )}
      </div>

      {/* Cloud Sync & Firebase Backend-as-a-Service */}
      <div className="settings-card card">
        <div className="settings-card-header">
          <Cloud size={20} className="text-cyan" />
          <h3 className="title-md">Firebase Real-Time Cloud Sync</h3>
        </div>
        <p className="text-sub text-xs">
          Your data persists 100% offline in LocalStorage/IndexedDB. Connect free Firebase Firestore to auto-sync seamlessly across your laptop and Android APK without any backend!
        </p>

        <div className="sync-status-box">
          <div className="sync-status-row">
            <span className="text-sub text-xs">Current Cloud Status:</span>
            <span className={`badge ${syncStatus === 'synced' ? 'badge-success' : 'badge-warning'}`}>
              {syncStatus === 'synced' ? '☁️ Firebase Connected & Synced' : '💾 Offline Storage Active'}
            </span>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={() => pushToCloud()}>
            Force Sync to Cloud Now
          </button>
        </div>
      </div>

      {/* Data Backup & Restore */}
      <div className="settings-card card">
        <div className="settings-card-header">
          <Database size={20} className="text-amber-400" />
          <h3 className="title-md">JSON Backup & Restore</h3>
        </div>
        <p className="text-sub text-xs">
          Export your habits, transactions, career roadmap, and Marvel watchlists as a portable JSON file.
        </p>

        <div className="backup-actions">
          <button className="btn btn-secondary" onClick={exportAllData}>
            <Download size={16} />
            <span>Export Backup (JSON)</span>
          </button>

          <label className="btn btn-ghost file-upload-btn">
            <Upload size={16} />
            <span>Restore Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <style>{`
        .settings-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 800px;
        }

        .settings-profile-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(14, 165, 233, 0.08));
          border-color: rgba(99, 102, 241, 0.25);
          gap: 1rem;
          flex-wrap: wrap;
        }

        .profile-hero-left {
          display: flex;
          align-items: center;
          gap: 1.15rem;
        }

        .profile-hero-avatar {
          width: 58px;
          height: 58px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-purple));
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          border: 2px solid rgba(255, 255, 255, 0.15);
          flex-shrink: 0;
        }

        .profile-hero-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-hero-emoji {
          font-size: 1.8rem;
          line-height: 1;
        }

        .profile-hero-initials {
          font-size: 1.3rem;
          font-weight: 800;
          color: #ffffff;
        }

        .profile-hero-details {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .profile-name-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .profile-hero-name {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .profile-hero-role-pill {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.15rem 0.55rem;
          border-radius: var(--radius-full);
        }

        .role-pill-admin {
          background: rgba(245, 158, 11, 0.18);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.35);
        }

        .role-pill-user {
          background: rgba(14, 165, 233, 0.18);
          color: #0ea5e9;
          border: 1px solid rgba(14, 165, 233, 0.35);
        }

        .profile-hero-job {
          letter-spacing: 0.02em;
        }

        .btn-edit-profile {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
        }

        .settings-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.5rem;
        }

        .settings-card-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .form-row {
          display: flex;
          gap: 1rem;
        }

        .flex-1 {
          flex: 1;
        }

        .form-actions-left {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .save-toast {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 700;
        }

        .lists-manager-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .custom-list-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.15rem;
          background: rgba(255, 255, 255, 0.02);
        }

        .custom-list-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .custom-list-title-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .custom-list-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .new-list-form {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.03);
          padding: 0.85rem;
          border-radius: var(--radius-sm);
        }

        .align-self-start {
          align-self: flex-start;
        }

        .sync-status-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .sync-status-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .backup-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .file-upload-btn {
          cursor: pointer;
        }

        .text-cyan { color: var(--accent-cyan); }
        .text-primary { color: var(--accent-primary); }
        .text-red-400 { color: #ef4444; }
        .badge-marvel {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};
