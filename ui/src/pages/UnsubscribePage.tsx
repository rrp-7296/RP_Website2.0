import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, Home, RefreshCw } from 'lucide-react';
import { apiUrl } from '../config/api';

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [status, setStatus] = useState<'idle' | 'loading' | 'unsubscribed' | 'resubscribed' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (emailParam) {
      handleUnsubscribe(emailParam);
    }
  }, [emailParam]);

  const handleUnsubscribe = async (targetEmail: string) => {
    if (!targetEmail) return;
    setStatus('loading');
    try {
      const res = await fetch(apiUrl('/unsubscribe'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('unsubscribed');
        setMessage(data.message || 'You have been unsubscribed from email updates.');
      } else {
        setStatus('error');
        setMessage(data.detail || 'Failed to process unsubscribe request.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Server error. Please try again later.');
    }
  };

  const handleResubscribe = async () => {
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch(apiUrl('/resubscribe'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('resubscribed');
        setMessage('Welcome back! You have been resubscribed to email updates.');
      } else {
        setStatus('error');
        setMessage(data.detail || 'Failed to resubscribe. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Server error. Please try again later.');
    }
  };

  return (
    <div className="page-container container section-padding" style={{ paddingTop: '140px', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card" style={{ maxWidth: '520px', width: '100%', padding: '36px', borderRadius: '24px', textAlign: 'center' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: status === 'resubscribed' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 153, 51, 0.15)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: status === 'resubscribed' ? '#22C55E' : '#FF9933',
            marginBottom: '20px'
          }}
        >
          {status === 'resubscribed' ? <CheckCircle2 size={32} /> : <Mail size={32} />}
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '10px', color: 'var(--text-primary)' }}>
          {status === 'resubscribed'
            ? 'Resubscribed Successfully!'
            : status === 'unsubscribed'
            ? 'Unsubscribed'
            : 'Email Preferences'}
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.6' }}>
          {message || 'Manage your email subscription preferences for updates from Rakeshwar Pandey.'}
        </p>

        {status === 'unsubscribed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Unsubscribed by mistake? You can resubscribe anytime with one click.
            </p>
            <button
              onClick={handleResubscribe}
              className="btn btn-saffron"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '20px' }}
            >
              <RefreshCw size={16} /> Resubscribe Email
            </button>
          </div>
        )}

        {status === 'idle' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUnsubscribe(email);
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-body)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
            <button type="submit" className="btn btn-outline" style={{ borderRadius: '12px', padding: '12px' }}>
              Confirm Unsubscribe
            </button>
          </form>
        )}

        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--saffron)', fontWeight: '600', textDecoration: 'none' }}>
            <Home size={16} /> Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
