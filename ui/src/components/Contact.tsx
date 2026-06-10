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
        <div className="section-header">
          <h2 className="section-title">Get In Touch</h2>
          <div className="section-bar"></div>
          <p className="section-subtitle">Have a question, proposal, or need assistance? Send a message directly to my office.</p>
        </div>

        <div className="contact-layout grid-2">
          {/* Contact Details Side */}
          <div className="contact-info-side glass-card">
            <h3 className="contact-info-title">Contact Information</h3>
            <p className="contact-info-desc">Feel free to reach out via email, phone, or visit our central office in Jamshedpur.</p>

            <div className="contact-details-list">
              <div className="contact-detail-item">
                <div className="detail-icon-box saffron">
                  <Mail size={20} />
                </div>
                <div className="detail-text-box">
                  <h4>Email Us</h4>
                  <p><a href="mailto:rakeshwarpandey@gmail.com">rakeshwarpandey@gmail.com</a></p>
                </div>
              </div>

              <div className="contact-detail-item">
                <div className="detail-icon-box green">
                  <Phone size={20} />
                </div>
                <div className="detail-text-box">
                  <h4>Call Us</h4>
                  <p><a href="tel:+916572234567">+91 657 223 4567</a></p>
                </div>
              </div>

              <div className="contact-detail-item">
                <div className="detail-icon-box saffron">
                  <MapPin size={20} />
                </div>
                <div className="detail-text-box">
                  <h4>Central Office</h4>
                  <p>INTUC Central Office, Jamshedpur, Jharkhand, India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="contact-form-side glass-card">
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
                <div className="form-grid grid-2">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                      className="form-input"
                      disabled={status === 'loading'}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="name@example.com"
                      className="form-input"
                      disabled={status === 'loading'}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Topic of discussion"
                    className="form-input"
                    disabled={status === 'loading'}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Write your message here..."
                    className="form-input form-textarea"
                    disabled={status === 'loading'}
                  />
                </div>

                {status === 'error' && (
                  <div className="form-error-alert">
                    <AlertCircle size={18} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button type="submit" disabled={status === 'loading'} className="btn btn-green submit-btn">
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
