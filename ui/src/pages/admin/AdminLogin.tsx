import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, Shield } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
import { apiUrl } from '../../config/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('admin_token', data.access_token);
        navigate('/admin/dashboard');
      } else {
        setError(data.detail || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Connection refused. Is the FastAPI backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container container section-padding" style={{ paddingTop: '160px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="login-card glass-card" style={{ padding: '40px', width: '100%', maxWidth: '420px', borderRadius: '16px', position: 'relative' }}>
        <ThemeToggle style={{ position: 'absolute', top: '16px', right: '16px' }} />
        <div className="login-header text-center" style={{ marginBottom: '32px' }}>
          <div className="admin-badge-circle saffron" style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', marginBottom: '16px', color: 'white' }}>
            <Shield size={32} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '700', margin: '0 0 8px' }}>Admin Portal</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0' }}>Please log in to manage your portfolio content.</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="username" style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Username</label>
            <div className="input-group" style={{ position: 'relative' }}>
              <User className="input-icon" size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter username"
                className="form-input"
                style={{ paddingLeft: '42px', width: '100%' }}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Password</label>
            <div className="input-group" style={{ position: 'relative' }}>
              <Lock className="input-icon" size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
                className="form-input"
                style={{ paddingLeft: '42px', width: '100%' }}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="form-error-alert" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', color: '#ef4444', fontSize: '0.9rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-saffron" style={{ width: '100%', height: '46px', fontWeight: '600' }}>
            {loading ? 'Logging in...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
