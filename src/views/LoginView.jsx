import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight
} from 'lucide-react';

export const LoginView = () => {
  const { login, quickLoginAsAdmin, isLoading, authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [localError, setLocalError] = useState(null);
  const [quickLoading, setQuickLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    const res = await login(email, password, rememberMe);
    if (!res.success) {
      setLocalError(res.error);
    }
  };

  const handleQuickAdminLogin = async () => {
    setLocalError(null);
    setQuickLoading(true);
    const res = await quickLoginAsAdmin();
    if (!res.success) {
      setLocalError(res.error);
    }
    setQuickLoading(false);
  };

  return (
    <div className="login-page-container">
      {/* Background Decorative Glow Elements */}
      <div className="bg-glow glow-1" />
      <div className="bg-glow glow-2" />

      <div className="login-card card">
        {/* Brand Header */}
        <div className="login-brand">
          <div className="login-logo">
            <img src="/app-logo.png" alt="LifeTracker Wheel" className="login-logo-img" />
          </div>
          <h1 className="login-title">LifeTracker Pro</h1>
          <p className="login-sub text-sub">
            Sign in to access your habits, career roadmap, MCU watchlist, and finances.
          </p>
        </div>

        {/* Error Alert */}
        {(localError || authError) && (
          <div className="alert alert-error">
            <AlertCircle size={16} className="alert-icon" />
            <span>{localError || authError}</span>
          </div>
        )}

        {/* 1-Tap Quick Access for Mobile PWA */}
        <div className="quick-access-box">
          <div className="quick-access-header">
            <Sparkles size={16} className="text-warning" />
            <span className="quick-access-label">Mobile Fast Access</span>
          </div>
          <div className="quick-access-content">
            <div className="quick-avatar-badge">👑</div>
            <div className="quick-user-info">
              <div className="quick-user-name">Elakkiya Sakthivelu</div>
              <div className="quick-user-role">Super Admin • Permanent Session</div>
            </div>
            <button
              type="button"
              className="btn btn-quick-login"
              onClick={handleQuickAdminLogin}
              disabled={isLoading || quickLoading}
            >
              {quickLoading ? 'Signing In...' : '1-Tap Sign In'}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="login-divider">
          <span>or sign in with credentials</span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label className="label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                className="input pl-9"
                placeholder="elakkiya.sakthivelu3089@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="input-group">
            <label className="label">Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input pl-9 pr-9"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn-toggle-pass"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox - Prevents Mobile PWA daily logouts */}
          <div className="remember-me-container">
            <label className="remember-me-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="remember-checkbox"
              />
              <span className="remember-text">
                <strong>Stay logged in permanently</strong>
                <span className="remember-sub">Preserves login on Mobile PWA & iOS Safari</span>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-submit-login"
            disabled={isLoading || quickLoading}
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer Info */}
        <div className="login-footer">
          <div className="pwa-status-badge">
            <span className="status-dot"></span>
            <span>4-Tier Resilient Storage • Multi-Device Cloud Sync</span>
          </div>
        </div>
      </div>

      <style>{`
        .login-page-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: var(--bg-main);
          position: relative;
          overflow: hidden;
        }

        .bg-glow {
          position: absolute;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
          pointer-events: none;
        }

        .glow-1 {
          top: -100px;
          left: -100px;
          background: #6366f1;
        }

        .glow-2 {
          bottom: -100px;
          right: -100px;
          background: #10b981;
        }

        .login-card {
          width: 100%;
          max-width: 460px;
          padding: 2.25rem 2rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          animation: fadeInUp 0.3s ease;
        }

        .login-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.5rem;
        }

        .login-logo {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          overflow: hidden;
          background: #FFFDF7;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2), 0 0 35px var(--accent-primary-glow);
          border: 2px solid var(--border-color);
          margin-bottom: 0.5rem;
          transition: transform 0.3s ease;
        }

        .login-logo:hover {
          transform: scale(1.06) rotate(4deg);
        }

        .login-logo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .login-title {
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .login-sub {
          font-size: 0.85rem;
          line-height: 1.45;
          max-width: 340px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
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

        .pr-9 {
          padding-right: 2.3rem !important;
        }

        .btn-toggle-pass {
          position: absolute;
          right: 0.75rem;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-toggle-pass:hover {
          color: var(--text-main);
        }

        .btn-submit-login {
          width: 100%;
          padding: 0.75rem;
          font-size: 0.95rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .alert-error {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem 1rem;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          color: #ef4444;
          font-size: 0.825rem;
          font-weight: 600;
        }

        .alert-icon {
          flex-shrink: 0;
        }

        .login-footer {
          border-top: 1px solid var(--border-color);
          padding-top: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        /* 1-Tap Quick Access */
        .quick-access-box {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.12) 100%);
          border: 1px solid rgba(168, 85, 247, 0.28);
          border-radius: var(--radius-md);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .quick-access-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .quick-access-label {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
          color: #f59e0b;
        }

        .quick-access-content {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .quick-avatar-badge {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .quick-user-info {
          flex: 1;
          min-width: 0;
        }

        .quick-user-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .quick-user-role {
          font-size: 0.72rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .btn-quick-login {
          background: #6366f1;
          color: #ffffff;
          border: none;
          padding: 0.5rem 0.85rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .btn-quick-login:hover:not(:disabled) {
          background: #4f46e5;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }

        /* Divider */
        .login-divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border-color);
        }

        .login-divider span {
          padding: 0 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Remember Me Container */
        .remember-me-container {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.75rem;
        }

        .remember-me-label {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          cursor: pointer;
        }

        .remember-checkbox {
          width: 17px;
          height: 17px;
          margin-top: 2px;
          accent-color: #6366f1;
          cursor: pointer;
        }

        .remember-text {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          font-size: 0.825rem;
        }

        .remember-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
          line-height: 1.3;
        }

        /* PWA Status Badge */
        .pwa-status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 0.4rem 0.8rem;
          border-radius: 9999px;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
          display: inline-block;
        }
      `}</style>
    </div>
  );
};
