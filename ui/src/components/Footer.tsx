import { useState } from 'react';
import { Info, X, Phone, Mail, MapPin } from 'lucide-react';
import { Facebook, Twitter, Instagram, Linkedin } from './SocialIcons';

export default function Footer() {
  const [showDevModal, setShowDevModal] = useState(false);

  return (
    <footer className="footer-area" aria-label="Site Footer">
      <div className="container">
        <div className="footer-top grid-3">
          {/* Brand Col */}
          <div className="footer-col-brand">
            <h3 className="footer-logo-title">Rakeshwar Pandey</h3>
            <p className="footer-logo-sub">Social Leader &amp; President, INTUC Jharkhand</p>
            <p className="footer-brand-desc">
              Dedicated to labor welfare, social leadership, educational upliftment, and sustainable industrial growth across Jharkhand and India for over 35 years.
            </p>
            <div className="footer-social-icons" aria-label="Social media links">
              <a href="https://www.facebook.com/profile.php?id=100006933303863" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook size={16} />
              </a>
              <a href="https://twitter.com/RakeshwarPandey" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X">
                <Twitter size={16} />
              </a>
              <a href="https://www.instagram.com/rakeshwar.pandey/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram size={16} />
              </a>
              <a href="https://www.linkedin.com/in/rakeshwar-pandey-88b35b54/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col-links">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links-list">
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About Me</a></li>
              <li><a href="#achievements">Achievements</a></li>
              <li><a href="#timeline">Timeline Events</a></li>
              <li><a href="#news">News &amp; Media</a></li>
              <li><a href="#blog">Written Blogs</a></li>
              <li><a href="#/gallery">Image Gallery</a></li>
              <li><a href="#contact">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="footer-col-contact">
            <h4 className="footer-col-title">Office Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <Phone size={16} style={{ color: 'var(--saffron)', marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)' }}>+91 657 223 4567</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <Mail size={16} style={{ color: 'var(--saffron)', marginTop: '2px', flexShrink: 0 }} />
                <a href="mailto:rakeshwarpandey@gmail.com" style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s' }}>
                  rakeshwarpandey@gmail.com
                </a>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <MapPin size={16} style={{ color: 'var(--saffron)', marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)' }}>
                  INTUC Central Office, Jamshedpur, Jharkhand, India
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowDevModal(true)}
              className="btn btn-sm"
              style={{
                marginTop: '24px',
                background: 'rgba(255,153,51,0.12)',
                border: '1px solid rgba(255,153,51,0.3)',
                color: 'var(--saffron)',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Info size={14} /> Developer Info
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-flex">
            <p className="footer-copyright">
              &copy; {new Date().getFullYear()} Rakeshwar Pandey. All Rights Reserved.
            </p>
            <div className="footer-bottom-links">
              <a href="#">Terms &amp; Conditions</a>
              <span className="divider" aria-hidden="true">|</span>
              <a href="#">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Modal */}
      {showDevModal && (
        <div className="modal-overlay" onClick={() => setShowDevModal(false)} role="dialog" aria-modal="true" aria-labelledby="dev-modal-title">
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <button className="modal-close" onClick={() => setShowDevModal(false)} aria-label="Close modal">
              <X size={20} />
            </button>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <img src="/img/abtddev.jpeg" alt="Ravi Roshan Pandey" className="developer-avatar" />
              <h3 id="dev-modal-title" className="developer-name">Ravi Roshan Pandey</h3>
              <p className="developer-role">B.Tech Graduate &amp; Web Developer</p>
              <div style={{
                background: 'var(--bg-body)',
                border: '1px solid var(--border-saffron)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '20px',
                textAlign: 'left',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.7'
              }}>
                <p>
                  Ravi Roshan Pandey is a B.Tech graduate, an employee at Infosys Ltd., and an enthusiastic web developer. He has built several exciting web systems and is always eager to explore and adopt new web technologies.
                </p>
                <p style={{ marginTop: '10px' }}>
                  Contact: <a href="mailto:rrp.7296@gmail.com" style={{ color: 'var(--saffron)', fontWeight: '600' }}>rrp.7296@gmail.com</a>
                </p>
              </div>
              <button onClick={() => setShowDevModal(false)} className="btn btn-green" style={{ width: '100%' }}>
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
