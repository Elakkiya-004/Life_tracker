import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { getFirebaseConfig, initFirebase } from '../../services/firebase';
import { setLocalData, STORAGE_KEYS } from '../../services/storage';
import { Cloud, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

export const FirebaseConfigModal = ({ isOpen, onClose }) => {
  const { setSyncStatus, pushToCloud } = useApp();
  
  const currentConfig = getFirebaseConfig() || {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  };

  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');
  const [authDomain, setAuthDomain] = useState(currentConfig.authDomain || '');
  const [projectId, setProjectId] = useState(currentConfig.projectId || '');
  const [storageBucket, setStorageBucket] = useState(currentConfig.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(currentConfig.messagingSenderId || '');
  const [appId, setAppId] = useState(currentConfig.appId || '');

  const [statusMsg, setStatusMsg] = useState(null); // { type: 'success' | 'error', text: '' }

  const handleSave = (e) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      setStatusMsg({ type: 'error', text: 'API Key and Project ID are required for Firebase.' });
      return;
    }

    const newConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    };

    setLocalData(STORAGE_KEYS.FIREBASE_CONFIG, newConfig);
    const result = initFirebase(newConfig);

    if (result.success) {
      setSyncStatus('synced');
      setStatusMsg({ type: 'success', text: '✅ Connected to Firebase Cloud! Syncing data...' });
      pushToCloud();
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setSyncStatus('error');
      setStatusMsg({ type: 'error', text: `Failed to connect: ${result.error?.message || 'Check credentials'}` });
    }
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEYS.FIREBASE_CONFIG);
    setSyncStatus('local');
    setStatusMsg({ type: 'success', text: 'Reverted to Local-Only mode.' });
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Firebase Cloud Sync Setup (100% Free)"
      maxWidth="540px"
    >
      <form onSubmit={handleSave} className="firebase-form">
        <div className="firebase-info-box">
          <Cloud size={20} className="text-primary" />
          <p className="text-xs text-sub">
            Connect your free Firebase Firestore to automatically sync your life tracking data across your laptop browser and your mobile APK in real time.
          </p>
        </div>

        {statusMsg && (
          <div className={`status-alert ${statusMsg.type}`}>
            {statusMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="input-group">
          <label className="label">Firebase API Key *</label>
          <input
            type="text"
            className="input"
            placeholder="AIzaSy..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label className="label">Project ID *</label>
          <input
            type="text"
            className="input"
            placeholder="my-life-tracker-app"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <div className="input-group flex-1">
            <label className="label">Auth Domain (optional)</label>
            <input
              type="text"
              className="input"
              placeholder="my-app.firebaseapp.com"
              value={authDomain}
              onChange={(e) => setAuthDomain(e.target.value)}
            />
          </div>

          <div className="input-group flex-1">
            <label className="label">App ID (optional)</label>
            <input
              type="text"
              className="input"
              placeholder="1:123456:web:abcd..."
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost text-sub" onClick={handleClear}>
            Disconnect / Reset to Local
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save & Connect
          </button>
        </div>
      </form>

      <style>{`
        .firebase-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .firebase-info-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem;
          background: var(--accent-primary-glow);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: var(--radius-sm);
        }

        .status-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.82rem;
          font-weight: 600;
        }

        .status-alert.success {
          background: rgba(16, 185, 129, 0.15);
          color: var(--accent-success);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .status-alert.error {
          background: rgba(244, 63, 94, 0.15);
          color: var(--accent-danger);
          border: 1px solid rgba(244, 63, 94, 0.3);
        }

        .form-row {
          display: flex;
          gap: 0.75rem;
        }

        .flex-1 {
          flex: 1;
        }

        .form-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1rem;
          flex-wrap: wrap;
        }
      `}</style>
    </Modal>
  );
};
