import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { apiUrl } from '../config/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch(apiUrl('/messages'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
        setErrorMessage(data.detail || 'Failed to send your message. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Server connection error. Please try again later.');
    }
  };

  return (
    <section id="contact" className="contact-section section-padding">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-eyebrow">
            <div className="eyebrow-line" aria-hidden="true" />
            Contact
            <div className="eyebrow-line" aria-hidden="true" />
          </div>
          <h2 className="section-title">Get In Touch</h2>
          <div className="section-divider" aria-hidden="true">
            <div className="divider-line divider-saffron" />
            <div className="divider-dot" />
            <div className="divider-line divider-green" />
          </div>
          <p className="section-subtitle">Have a question, proposal, or need assistance? Send a message directly to my office.</p>
        </div>

        <div className="contact-layout grid-2">
          {/* Contact Details Side */}
          <div className="contact-info-card">
            <h3 className="contact-info-title">Contact Information</h3>
            <p className="contact-info-desc" style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '0.95rem' }}>
              Feel free to reach out via email, phone, or visit our central office in Jamshedpur.
            </p>

            <div className="contact-details-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="contact-info-row">
                <div className="contact-icon">
                  <Mail size={20} />
                </div>
                <div>
                  <div className="contact-info-label">Email Us</div>
                  <div className="contact-info-value">
                    <a href="mailto:rakeshwarpandey@gmail.com" style={{ color: 'var(--saffron)', fontWeight: '600' }}>
                      rakeshwarpandey@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="contact-info-row">
                <div className="contact-icon green">
                  <Phone size={20} />
                </div>
                <div>
                  <div className="contact-info-label">Call Us</div>
                  <div className="contact-info-value">
                    <a href="tel:+916572234567" style={{ color: 'var(--green)', fontWeight: '600' }}>
                      +91 657 223 4567
                    </a>
                  </div>
                </div>
              </div>

              <div className="contact-info-row">
                <div className="contact-icon">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="contact-info-label">Central Office</div>
                  <div className="contact-info-value" style={{ color: 'var(--text-primary)' }}>
                    INTUC Central Office, Jamshedpur, Jharkhand, India
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="contact-form-card">
            {status === 'success' ? (
              <div className="contact-success-state">
                <CheckCircle className="success-icon" size={48} />
                <h3>Message Sent Successfully!</h3>
                <p>Thank you for getting in touch. Our office will review and respond to your message as soon as possible.</p>
                <button onClick={() => setStatus('idle')} className="btn btn-saffron" style={{ marginTop: '24px' }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                      className="form-control"
                      disabled={status === 'loading'}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="name@example.com"
                      className="form-control"
                      disabled={status === 'loading'}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject" className="form-label">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Topic of discussion"
                    className="form-control"
                    disabled={status === 'loading'}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Write your message here..."
                    className="form-control"
                    style={{ resize: 'vertical' }}
                    disabled={status === 'loading'}
                  />
                </div>

                {status === 'error' && (
                  <div className="form-error-alert">
                    <AlertCircle size={18} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button type="submit" disabled={status === 'loading'} className="btn btn-green submit-btn" style={{ width: '100%', justifyContent: 'center' }}>
                  {status === 'loading' ? 'Sending Message...' : 'Send Message'} <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
