import { useState } from 'react';
import { Info, X } from 'lucide-react';
import { Facebook, Twitter, Instagram, Linkedin } from './SocialIcons';

export default function Footer() {
  const [showDevModal, setShowDevModal] = useState(false);

  return (
    <footer className="footer-area">
      <div className="container">
        <div className="footer-top grid-3">
          {/* Brand Col */}
          <div className="footer-col-brand">
            <h3 className="footer-logo-title">Rakeshwar Pandey</h3>
            <p className="footer-logo-sub">Social Leader & President, INTUC Jharkhand</p>
            <p className="footer-brand-desc">
              Dedicated to labor welfare, social leadership, educational upliftment, and sustainable industrial growth across Jharkhand and India.
            </p>
            <div className="footer-social-icons">
              <a href="https://www.facebook.com/profile.php?id=100006933303863" target="_blank" rel="noopener noreferrer"><Facebook size={18} /></a>
              <a href="https://twitter.com/RakeshwarPandey" target="_blank" rel="noopener noreferrer"><Twitter size={18} /></a>
              <a href="https://www.instagram.com/rakeshwar.pandey/?hl=en" target="_blank" rel="noopener noreferrer"><Instagram size={18} /></a>
              <a href="https://www.linkedin.com/in/rakeshwar-pandey-88b35b54/" target="_blank" rel="noopener noreferrer"><Linkedin size={18} /></a>
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
              <li><a href="#news">News & Media</a></li>
              <li><a href="#blog">Written Blogs</a></li>
              <li><a href="/gallery">Image Gallery</a></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="footer-col-contact">
            <h4 className="footer-col-title">Office Contact</h4>
            <p><strong>Phone:</strong> +91 657 223 4567</p>
            <p><strong>Email:</strong> rakeshwarpandey@gmail.com</p>
            <p><strong>Location:</strong> INTUC Central Office, Jamshedpur, Jharkhand, India</p>
            <button onClick={() => setShowDevModal(true)} className="btn btn-outline btn-sm dev-modal-trigger-btn" style={{ marginTop: '20px' }}>
              <Info size={14} /> Developer Info
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-flex">
            <p className="footer-copyright">&copy; {new Date().getFullYear()} Rakeshwar Pandey. All Rights Reserved.</p>
            <div className="footer-bottom-links">
              <a href="#">Terms & Conditions</a>
              <span className="divider">|</span>
              <a href="#">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Modal */}
      {showDevModal && (
        <div className="modal-overlay" onClick={() => setShowDevModal(false)}>
          <div className="modal-content glass-card animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <button className="modal-close" onClick={() => setShowDevModal(false)}>
              <X size={24} />
            </button>
            <div className="modal-body text-center" style={{ padding: '20px' }}>
              <img src="/img/abtddev.jpeg" alt="Ravi Roshan Pandey" className="developer-avatar" />
              <h3 className="developer-name">Ravi Roshan Pandey</h3>
              <p className="developer-role">B.Tech Graduate & Web Developer</p>
              
              <div className="developer-description glass-card" style={{ padding: '16px', margin: '20px 0', textAlign: 'left', fontSize: '0.95rem' }}>
                <p>
                  Ravi Roshan Pandey is a B.Tech graduate, an employee at Infosys Ltd., and an enthusiastic web developer. He has built several exciting web systems and is always eager to explore and adopt new web technologies.
                </p>
                <p style={{ marginTop: '10px', fontWeight: '500' }}>
                  Contact: <a href="mailto:rrp.7296@gmail.com" style={{ color: 'var(--color-saffron-light)' }}>rrp.7296@gmail.com</a>
                </p>
              </div>
              
              <button onClick={() => setShowDevModal(false)} className="btn btn-green">
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
