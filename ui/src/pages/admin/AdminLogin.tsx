import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, Shield, Home, ArrowLeft } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
import { apiUrl } from '../../config/api';
import { adminAuth } from '../../services/adminAuth';
import { useVisitor } from '../../context/VisitorContext';
import { initAdminPushNotifications } from '../../services/adminPushNotifications';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { syncAdminAsVisitor } = useVisitor();

  // If already logged in, seamlessly redirect to dashboard without showing login form
  useEffect(() => {
    (async () => {
      const token = await adminAuth.getToken();
      if (token) {
        navigate('/admin/dashboard', { replace: true });
      }
    })();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(apiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      let data: any = {};
      try {
        data = await response.json();
      } catch (e) {
        // Response was not JSON
      }

      if (response.ok) {
        await adminAuth.setToken(data.access_token, data.user);
        syncAdminAsVisitor({
          name: data.user?.display_name || 'Rakeshwar Pandey',
          email: data.user?.email || 'rakeshwarpandey@gmail.com',
          is_subscribed: true
        });
        initAdminPushNotifications();
        navigate('/admin/dashboard', { replace: true });
      } else {
        setError(data.error || data.detail || 'Invalid username or password. Please try again.');
      }
    } catch (err) {
      setError('Unable to connect to backend API. Please verify server status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <button 
          type="button"
          onClick={() => navigate('/')} 
          className="login-home-btn"
          title="Return to Website Home"
          aria-label="Return to Website Home"
        >
          <ArrowLeft size={16} />
          <span>Home</span>
        </button>
        <ThemeToggle style={{ position: 'absolute', top: '16px', right: '16px' }} />
        <div className="login-header text-center" style={{ marginBottom: '32px' }}>
          <div className="admin-badge-circle saffron">
            <Shield size={32} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 8px', color: 'var(--text-primary)' }}>Admin Portal</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0' }}>Please log in to manage your portfolio content.</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="username" className="form-label">Username</label>
            <div className="input-group" style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter username"
                className="form-control"
                style={{ paddingLeft: '42px', width: '100%' }}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-group" style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
                className="form-control"
                style={{ paddingLeft: '42px', width: '100%' }}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="form-error-alert" style={{ marginBottom: '20px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-saffron" style={{ width: '100%', height: '46px', fontWeight: '600', justifyContent: 'center' }}>
            {loading ? 'Logging in...' : 'Access Dashboard'}
          </button>
        </form>

        <div className="login-footer-nav" style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="login-footer-home-link"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--saffron)',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              transition: 'var(--transition)'
            }}
          >
            <Home size={16} />
            <span>Return to Public Website</span>
          </button>
        </div>
      </div>
    </div>
  );
}
