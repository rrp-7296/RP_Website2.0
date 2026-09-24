import React, { useState, useEffect } from 'react';
import { useVisitor } from '../context/VisitorContext';
import { User, Mail, Phone, X, Check, LogOut } from 'lucide-react';

export default function VisitorLoginModal() {
  const { visitor, saveVisitor, clearVisitor, isModalOpen, closeModal } = useVisitor();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visitor) {
      setName(visitor.name || '');
      setEmail(visitor.email || '');
      setPhone(visitor.phone || '');
      setIsSubscribed(visitor.is_subscribed !== false);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setIsSubscribed(true);
    }
  }, [visitor, isModalOpen]);

  if (!isModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    saveVisitor({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      is_subscribed: isSubscribed
    });
  };

  const handleLogout = () => {
    clearVisitor();
    setName('');
    setEmail('');
    setPhone('');
    closeModal();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '28px',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)'
        }}
      >
        <button
          onClick={closeModal}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Close"
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF9933 0%, #E65100 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginBottom: '12px',
              boxShadow: '0 8px 20px rgba(255, 153, 51, 0.3)'
            }}
          >
            <User size={26} />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '700', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            {visitor ? 'Visitor Profile' : 'Welcome Visitor 👋'}
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
            {visitor
              ? 'Update your info for likes & comments on the website.'
              : 'Enter your details once to like posts & share comments!'}
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '16px',
              textAlign: 'center'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: '600',
                marginBottom: '6px',
                color: 'var(--text-primary)'
              }}
            >
              Your Name <span style={{ color: '#FF9933' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-body)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: '600',
                marginBottom: '6px',
                color: 'var(--text-primary)'
              }}
            >
              Email Address <span style={{ color: '#FF9933' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="email"
                placeholder="e.g. rahul@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-body)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: '600',
                marginBottom: '6px',
                color: 'var(--text-primary)'
              }}
            >
              Phone Number <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>(Optional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Phone
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-body)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <input
              type="checkbox"
              id="subscribeCheck"
              checked={isSubscribed}
              onChange={(e) => setIsSubscribed(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: '#FF9933' }}
            />
            <label htmlFor="subscribeCheck" style={{ fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer', userSelect: 'none' }}>
              Subscribe to newsletter & get updates on new posts
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="submit"
              className="btn btn-saffron"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '10px',
                fontWeight: '600'
              }}
            >
              <Check size={16} /> {visitor ? 'Save Changes' : 'Save & Continue'}
            </button>
            {visitor && (
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#EF4444',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.85rem'
                }}
                title="Clear profile"
              >
                <LogOut size={16} /> Reset
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
