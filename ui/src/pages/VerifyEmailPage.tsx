import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, Mail, Home, ArrowRight, ShieldCheck } from 'lucide-react';
import { apiUrl } from '../config/api';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const type = searchParams.get('type') || 'verification';

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [verifiedType, setVerifiedType] = useState(type);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided. Please check the link from your email.');
      return;
    }

    let isMounted = true;

    async function performVerification() {
      try {
        const response = await fetch(apiUrl(`/verify?token=${encodeURIComponent(token!)}&type=${encodeURIComponent(type)}`), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (!isMounted) return;

        if (response.ok && data.verified) {
          setStatus('success');
          setMessage(data.message || 'Your email address has been successfully verified.');
          if (data.type) setVerifiedType(data.type);
        } else {
          setStatus('error');
          setMessage(data.detail || data.message || 'This verification link is invalid or has already expired.');
        }
      } catch (err) {
        if (!isMounted) return;
        setStatus('error');
        setMessage('Network error while verifying your email. Please check your connection and try again.');
      }
    }

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [token, type]);

  const getHeading = () => {
    switch (verifiedType) {
      case 'contact':
        return 'Message Confirmed & Delivered!';
      case 'subscriber':
        return 'Subscription Activated!';
      case 'visitor':
        return 'Visitor Profile Verified!';
      default:
        return 'Email Verified Successfully!';
    }
  };

  const getSubtext = () => {
    switch (verifiedType) {
      case 'contact':
        return 'Thank you for verifying your email. Your inquiry has been safely delivered to Rakeshwar Pandey’s office and our team will review it shortly.';
      case 'subscriber':
        return 'Thank you for subscribing! You will now receive official press statements, speeches, and community welfare updates.';
      case 'visitor':
        return 'Your visitor profile is now active on the official portal. Thank you for connecting with us.';
      default:
        return 'Your email address has been authenticated against our security gateway.';
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div style={{
        maxWidth: '540px',
        width: '100%',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-xl)',
        padding: '40px 32px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Top Accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, var(--saffron), #ffffff, var(--green))'
        }} />

        {/* Verifying Loading State */}
        {status === 'verifying' && (
          <div style={{ padding: '20px 0' }}>
            <div style={{
              width: '72px',
              height: '72px',
              margin: '0 auto 24px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 153, 51, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--saffron)'
            }}>
              <Loader2 size={36} className="spin" style={{ animation: 'spin 1.2s linear infinite' }} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Verifying Your Email...
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
              Please wait a moment while we validate your security confirmation link.
            </p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div style={{ padding: '10px 0' }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              borderRadius: '50%',
              backgroundColor: 'rgba(19, 136, 8, 0.12)',
              border: '2px solid rgba(19, 136, 8, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--green)'
            }}>
              <CheckCircle2 size={44} />
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(19, 136, 8, 0.08)',
              color: 'var(--green)',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '16px'
            }}>
              <ShieldCheck size={14} /> Security Verified
            </div>

            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px', lineHeight: 1.3 }}>
              {getHeading()}
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '28px' }}>
              {getSubtext()}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '32px' }}>
              <Link to="/" className="btn btn-green" style={{ justifyContent: 'center', padding: '14px 24px', fontWeight: 700 }}>
                <Home size={18} style={{ marginRight: '8px' }} /> Return to Home
              </Link>
              <Link to="/blog" className="btn btn-outline" style={{ justifyContent: 'center', padding: '12px 24px' }}>
                Read Latest Updates & Speeches <ArrowRight size={16} style={{ marginLeft: '6px' }} />
              </Link>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div style={{ padding: '10px 0' }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '2px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444'
            }}>
              <AlertCircle size={44} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px', lineHeight: 1.3 }}>
              Verification Failed
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.6, marginBottom: '28px' }}>
              {message}
            </p>

            <div style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '28px',
              border: '1px solid var(--border-color)',
              fontSize: '0.88rem',
              color: 'var(--text-muted)',
              textAlign: 'left'
            }}>
              <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: 'var(--text-primary)' }}>Why might this happen?</p>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>This link has already been used and validated.</li>
                <li>The confirmation link has expired (links expire after 24 hours).</li>
                <li>The verification URL was incomplete or copied incorrectly.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/" className="btn btn-saffron" style={{ justifyContent: 'center', padding: '14px 24px', fontWeight: 700 }}>
                <Mail size={18} style={{ marginRight: '8px' }} /> Submit Form Again
              </Link>
              <Link to="/" className="btn btn-outline" style={{ justifyContent: 'center', padding: '12px 24px' }}>
                Back to Homepage
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
