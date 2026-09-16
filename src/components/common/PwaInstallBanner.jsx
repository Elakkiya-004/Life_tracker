import React, { useState, useEffect } from 'react';
import { usePwa } from '../../context/PwaContext';
import { Download, RefreshCw, WifiOff, X, Sparkles } from 'lucide-react';

export const PwaInstallBanner = () => {
  const { canInstall, isInstalled, isOffline, updateAvailable, installApp, updateApp } = usePwa();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('pwa_prompt_dismissed');
    if (isDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  return (
    <>
      {/* Offline Alert Strip */}
      {isOffline && (
        <div className="pwa-offline-strip" role="status" aria-live="polite">
          <WifiOff size={15} />
          <span>You are working offline. LifeTracker is caching your data locally.</span>
        </div>
      )}

      {/* App Update Available Notification */}
      {updateAvailable && (
        <div className="pwa-update-banner" role="alert">
          <div className="pwa-update-content">
            <RefreshCw size={16} className="pwa-spin-icon" />
            <span>A new version of LifeTracker Pro is ready!</span>
          </div>
          <button className="pwa-update-btn" onClick={updateApp}>
            Reload & Update
          </button>
        </div>
      )}

      {/* Floating Install Prompt (shows only if installable, not already installed, and not dismissed) */}
      {canInstall && !isInstalled && !dismissed && (
        <div className="pwa-floating-prompt">
          <div className="pwa-prompt-icon-wrap">
            <Sparkles size={20} className="pwa-sparkle" />
          </div>
          <div className="pwa-prompt-body">
            <div className="pwa-prompt-title">Install LifeTracker App</div>
            <div className="pwa-prompt-desc">Fast, offline-ready & standalone desktop/mobile app</div>
          </div>
          <div className="pwa-prompt-actions">
            <button className="pwa-prompt-install-btn" onClick={installApp}>
              <Download size={14} />
              <span>Install</span>
            </button>
            <button 
              className="pwa-prompt-dismiss-btn" 
              onClick={handleDismiss} 
              aria-label="Dismiss install prompt"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .pwa-offline-strip {
          background: linear-gradient(90deg, #b45309, #d97706);
          color: #ffffff;
          padding: 6px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.82rem;
          font-weight: 500;
          position: sticky;
          top: 0;
          z-index: 9999;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .pwa-update-banner {
          background: linear-gradient(135deg, #1e1b4b, #312e81);
          border: 1px solid #6366f1;
          color: #e0e7ff;
          padding: 10px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-radius: 10px;
          margin: 12px;
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.25);
          position: sticky;
          top: 8px;
          z-index: 9998;
          animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pwa-update-content {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.88rem;
          font-weight: 500;
        }

        .pwa-spin-icon {
          animation: spin 3s linear infinite;
          color: #818cf8;
        }

        .pwa-update-btn {
          background: #4f46e5;
          color: #ffffff;
          border: none;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
          white-space: nowrap;
        }

        .pwa-update-btn:hover {
          background: #4338ca;
        }

        .pwa-floating-prompt {
          position: fixed;
          bottom: 24px;
          right: 24px;
          max-width: 380px;
          background: var(--card-bg, #111827);
          border: 1px solid var(--border-color, #374151);
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
          z-index: 9990;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(12px);
        }

        @media (max-width: 640px) {
          .pwa-floating-prompt {
            bottom: 74px; /* above mobile bottom bar */
            left: 12px;
            right: 12px;
            max-width: unset;
          }
        }

        .pwa-prompt-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2));
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .pwa-sparkle {
          color: #a855f7;
        }

        .pwa-prompt-body {
          flex: 1;
          min-width: 0;
        }

        .pwa-prompt-title {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-primary, #f9fafb);
          line-height: 1.2;
        }

        .pwa-prompt-desc {
          font-size: 0.75rem;
          color: var(--text-secondary, #9ca3af);
          margin-top: 2px;
          line-height: 1.2;
        }

        .pwa-prompt-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pwa-prompt-install-btn {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #ffffff;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: opacity 0.15s;
          white-space: nowrap;
        }

        .pwa-prompt-install-btn:hover {
          opacity: 0.92;
        }

        .pwa-prompt-dismiss-btn {
          background: transparent;
          color: var(--text-secondary, #9ca3af);
          border: none;
          padding: 6px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pwa-prompt-dismiss-btn:hover {
          color: var(--text-primary, #f9fafb);
          background: rgba(255, 255, 255, 0.05);
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes slideDown {
          from { transform: translateY(-16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};
