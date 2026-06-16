import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

// Ashoka Chakra SVG (24 spokes)
function AshokaSVG({ size = 24, className = '' }) {
  const spokes = Array.from({ length: 24 }, (_, i) => i * 15);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} fill="currentColor">
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="50" cy="50" r="6" />
      <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {spokes.map(angle => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 50 + 8 * Math.cos(rad);
        const y1 = 50 + 8 * Math.sin(rad);
        const x2 = 50 + 32 * Math.cos(rad);
        const y2 = 50 + 32 * Math.sin(rad);
        return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.5" />;
      })}
    </svg>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsOpen(false);
    if (location.pathname === '/') {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/', { state: { targetId } });
    }
  };

  useEffect(() => {
    if (location.pathname === '/' && location.state && (location.state as any).targetId) {
      const targetId = (location.state as any).targetId;
      setTimeout(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const navLinks = [
    { label: 'Home', id: 'home' },
    { label: 'About', id: 'about' },
    { label: 'Achievements', id: 'achievements' },
    { label: 'Timeline', id: 'timeline' },
    { label: 'News', id: 'news' },
    { label: 'Blog', id: 'blog' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <>
      {/* Animated tricolor bar at the very top */}
      <div className="tricolor-bar-top" aria-hidden="true" />

      <nav className={`nav-header ${isScrolled ? 'nav-scrolled' : ''}`}>
        <div className="container nav-container">
          {/* Logo */}
          <Link to="/" className="nav-logo" aria-label="Rakeshwar Pandey Homepage">
            <div className="logo-name">
              <span className="logo-saffron">RAKESHWAR&nbsp;</span>
              <span className="logo-green">PANDEY</span>
            </div>
            <div className="logo-sub">Jharkhand INTUC President</div>
          </Link>

          {/* Desktop Menu */}
          <div className="nav-menu-desktop" role="navigation" aria-label="Main Navigation">
            {navLinks.map(link => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => handleNavClick(e, link.id)}
              >
                {link.label}
              </a>
            ))}
            <Link to="/gallery">Gallery</Link>
            <ThemeToggle style={{ marginLeft: '8px' }} />
            <Link to="/admin" className="admin-link-icon" title="Admin Panel" aria-label="Admin Panel">
              <Shield size={16} />
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="nav-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Navigation"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Drawer */}
        <div className={`nav-menu-mobile ${isOpen ? 'open' : ''}`} role="navigation" aria-label="Mobile Navigation">
          {navLinks.map(link => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => handleNavClick(e, link.id)}
            >
              {link.label}
            </a>
          ))}
          <Link to="/gallery" onClick={() => setIsOpen(false)}>Gallery</Link>
          <Link
            to="/admin"
            onClick={() => setIsOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Shield size={16} /> Admin Panel
          </Link>
          <div className="nav-mobile-theme-row">
            <span>Toggle Theme:</span>
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </>
  );
}
