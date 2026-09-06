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
  const { login, isLoading, authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    const res = await login(email, password);
    if (!res.success) {
      setLocalError(res.error);
    }
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
            <Sparkles size={24} className="brand-icon" />
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label className="label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                className="input pl-9"
                placeholder="name@lifetracker.com"
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

          <button
            type="submit"
            className="btn btn-primary btn-submit-login"
            disabled={isLoading}
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer Info */}
        <div className="login-footer">
          <span className="text-xs text-sub">
            🔒 Protected by Super Admin Role Governance • Firebase Cloud Sync
          </span>
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
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, #6366f1, #10b981);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.35);
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
      `}</style>
    </div>
  );
};
