import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function ThemeToggle({ className = '', style }: ThemeToggleProps) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle-btn glass-card ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--border-glass)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        padding: '0',
        transition: 'var(--transition-smooth)',
        ...style
      }}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Sun size={18} style={{ color: '#ff6f00' }} />
      ) : (
        <Moon size={18} style={{ color: '#64748b' }} />
      )}
    </button>
  );
}
