import React, { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { apiUrl } from '../config/api';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const response = await fetch(apiUrl('/subscriptions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      if (response.ok) {
        setStatus('success');
        setEmail('');
        setMessage('Thank you for subscribing to our newsletter!');
      } else {
        setStatus('error');
        setMessage(data.detail || 'Failed to subscribe. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Server error. Please try again later.');
    }
  };

  return (
    <section className="subscribe-section section-padding">
      <div className="container">
        <div className="subscribe-wrapper glass-card animate-fade-in">
          <div className="subscribe-info">
            <h2 className="subscribe-title">Subscribe to our Newsletter</h2>
            <p className="subscribe-subtitle">Stay updated with regular news, announcements, and thoughts from Rakeshwar Pandey.</p>
          </div>
          
          <div className="subscribe-form-wrapper">
            {status === 'success' ? (
              <div className="subscribe-success">
                <CheckCircle className="success-icon" size={24} />
                <p className="success-text">{message}</p>
                <button onClick={() => setStatus('idle')} className="btn btn-outline btn-sm" style={{ marginTop: '12px' }}>
                  Subscribe another email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="subscribe-form">
                <div className="input-group">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={status === 'loading'}
                    className="subscribe-input"
                  />
                </div>
                <button type="submit" disabled={status === 'loading'} className="btn btn-saffron subscribe-btn">
                  {status === 'loading' ? 'Subscribing...' : 'Subscribe Now'}
                </button>
              </form>
            )}
            {status === 'error' && (
              <p className="subscribe-error-text" style={{ color: '#ef4444', marginTop: '12px', fontSize: '0.9rem' }}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
