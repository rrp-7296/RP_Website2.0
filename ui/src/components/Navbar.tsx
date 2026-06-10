import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsOpen(false);
    
    if (location.pathname === '/') {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/', { state: { targetId } });
    }
  };

  // Scroll to section after navigating to homepage from a subpage
  useEffect(() => {
    if (location.pathname === '/' && location.state && (location.state as any).targetId) {
      const targetId = (location.state as any).targetId;
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      // clear state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <nav className={`nav-header ${isScrolled ? 'nav-scrolled' : ''}`}>
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-saffron">RAKESHWAR</span>
          <span className="logo-white">&nbsp;PANDEY</span>
          <div className="logo-sub">Jharkhand INTUC President</div>
        </Link>

        {/* Desktop Menu */}
        <div className="nav-menu-desktop">
          <a href="#home" onClick={(e) => handleNavClick(e, 'home')}>Home</a>
          <a href="#about" onClick={(e) => handleNavClick(e, 'about')}>About</a>
          <a href="#achievements" onClick={(e) => handleNavClick(e, 'achievements')}>Achievements</a>
          <a href="#timeline" onClick={(e) => handleNavClick(e, 'timeline')}>Timeline</a>
          <a href="#news" onClick={(e) => handleNavClick(e, 'news')}>News</a>
          <a href="#blog" onClick={(e) => handleNavClick(e, 'blog')}>Blog</a>
          <Link to="/gallery">Gallery</Link>
          <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>Contact</a>
          <ThemeToggle style={{ marginRight: '8px' }} />
          <Link to="/admin" className="admin-link-icon" title="Admin Panel">
            <Shield size={18} />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button className="nav-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Navigation">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`nav-menu-mobile ${isOpen ? 'open' : ''}`}>
        <a href="#home" onClick={(e) => handleNavClick(e, 'home')}>Home</a>
        <a href="#about" onClick={(e) => handleNavClick(e, 'about')}>About</a>
        <a href="#achievements" onClick={(e) => handleNavClick(e, 'achievements')}>Achievements</a>
        <a href="#timeline" onClick={(e) => handleNavClick(e, 'timeline')}>Timeline</a>
        <a href="#news" onClick={(e) => handleNavClick(e, 'news')}>News</a>
        <a href="#blog" onClick={(e) => handleNavClick(e, 'blog')}>Blog</a>
        <Link to="/gallery" onClick={() => setIsOpen(false)}>Gallery</Link>
        <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>Contact</a>
        <Link to="/admin" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} /> Admin Panel
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderTop: '1px solid var(--border-glass)' }}>
          <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Toggle Theme:</span>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
