import React, { useState } from 'react';
import { Mail, CheckCircle, Bell } from 'lucide-react';
import { apiUrl } from '../config/api';
import { useVisitor } from '../context/VisitorContext';

export default function Newsletter() {
  const { visitor, saveVisitor } = useVisitor();
  const [email, setEmail] = useState('');
  const [hpValue, setHpValue] = useState('');
  const [formMountedAt] = useState(() => Date.now());
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Auto-fill visitor email if already saved in profile
  React.useEffect(() => {
    if (visitor?.email && !email) {
      setEmail(visitor.email);
    }
  }, [visitor]);

  const [submittedEmail, setSubmittedEmail] = useState('');
  const [requiresVerification, setRequiresVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    const targetEmail = email;

    try {
      const response = await fetch(apiUrl('/subscriptions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: visitor?.name || '',
          phone: visitor?.phone || '',
          website_hp: hpValue,
          _t: formMountedAt
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setSubmittedEmail(targetEmail);
        setRequiresVerification(Boolean(data.requires_verification));
        setStatus('success');
        setMessage(data.message || (data.requires_verification 
          ? `We sent a confirmation link to ${targetEmail}. Please click it to activate your subscription.` 
          : 'Thank you for subscribing! We\'ll keep you updated.'));

        // Update visitor profile in context & localStorage
        saveVisitor({
          name: visitor?.name || targetEmail.split('@')[0],
          email: targetEmail,
          phone: visitor?.phone,
          is_subscribed: true
        });
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.detail || 'Failed to subscribe. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Server error. Please try again later.');
    }
  };

  return (
    <section className="newsletter-section section-padding-sm" aria-labelledby="newsletter-heading">
      <div className="container">
        <div className="newsletter-card">
          {/* Icon */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--saffron-pale), var(--green-pale))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            border: '2px solid var(--border-saffron)'
          }}>
            <Bell size={28} color="var(--saffron)" />
          </div>

          {/* Tricolor divider */}
          <div className="section-divider" aria-hidden="true" style={{ marginBottom: '16px' }}>
            <div className="divider-line divider-saffron" />
            <div className="divider-dot" />
            <div className="divider-line divider-green" />
          </div>

          <h2 id="newsletter-heading" className="newsletter-title">
            Stay Updated with <span style={{ color: 'var(--saffron)' }}>Latest News</span>
          </h2>
          <p className="newsletter-subtitle">
            Subscribe to receive announcements, news, and insights from Rakeshwar Pandey directly in your inbox.
          </p>

          {status === 'success' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '480px', margin: '0 auto' }}>
              {requiresVerification ? (
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 153, 51, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--saffron)'
                }}>
                  <Mail size={32} />
                </div>
              ) : (
                <CheckCircle size={44} color="var(--green)" />
              )}
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {requiresVerification ? 'Confirm Your Subscription' : 'Subscription Active!'}
              </h3>
              <p className="newsletter-success" style={{ textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
                {message}
              </p>
              {requiresVerification && (
                <div style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  fontSize: '0.84rem',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-color)'
                }}>
                  Please check your inbox (and Spam folder) to click the confirmation link.
                </div>
              )}
              <button onClick={() => { setStatus('idle'); setRequiresVerification(false); }} className="btn btn-outline btn-sm" style={{ marginTop: '4px' }}>
                Subscribe another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="newsletter-form" aria-label="Newsletter subscription form">
              {/* Honeypot anti-bot trap */}
              <div style={{ position: 'absolute', opacity: 0, zIndex: -1, pointerEvents: 'none', height: 0, width: 0, overflow: 'hidden' }} aria-hidden="true">
                <label htmlFor="newsletter_website_hp">Leave this empty</label>
                <input
                  type="text"
                  id="newsletter_website_hp"
                  name="website_hp"
                  value={hpValue}
                  onChange={(e) => setHpValue(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div style={{ position: 'relative', flex: 1 }}>
                <Mail
                  size={18}
                  style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={status === 'loading'}
                  className="newsletter-input"
                  style={{ paddingLeft: '46px' }}
                  aria-label="Email address"
                />
              </div>
              <button type="submit" disabled={status === 'loading'} className="btn btn-saffron">
                {status === 'loading' ? 'Subscribing…' : 'Subscribe Now'}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="alert alert-error" style={{ maxWidth: '400px', margin: '12px auto 0' }}>
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
