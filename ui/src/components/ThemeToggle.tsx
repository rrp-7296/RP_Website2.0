import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function ThemeToggle({ className = '', style }: ThemeToggleProps) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      style={style}
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? (
        <Moon size={16} />
      ) : (
        <Sun size={16} style={{ color: '#FF9933' }} />
      )}
    </button>
  );
}
