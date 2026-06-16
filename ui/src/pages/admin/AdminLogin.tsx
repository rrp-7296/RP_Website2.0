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
    <div className="admin-login-page">
      <div className="admin-login-card">
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
      </div>
    </div>
  );
}
