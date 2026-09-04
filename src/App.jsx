import React, { Component } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Catch Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 20px',
          maxWidth: '800px',
          margin: '40px auto',
          background: '#0f172a',
          color: '#f8fafc',
          borderRadius: '12px',
          fontFamily: 'monospace',
          border: '1px solid #ef4444',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}>
          <h2 style={{ color: '#ef4444', marginBottom: '16px', fontSize: '1.4rem' }}>
            ⚠️ Application Error Detected
          </h2>
          <p style={{ color: '#cbd5e1', marginBottom: '16px', fontSize: '1rem', lineHeight: 1.5 }}>
            {this.state.error?.message || String(this.state.error)}
          </p>
          <pre style={{
            background: '#1e293b',
            padding: '16px',
            borderRadius: '8px',
            overflowX: 'auto',
            fontSize: '0.85rem',
            color: '#fca5a5'
          }}>
            {this.state.error?.stack}
          </pre>
          <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🧹 Clear LocalStorage & Reset App
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#334155',
                color: '#fff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🔄 Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <Layout />
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
