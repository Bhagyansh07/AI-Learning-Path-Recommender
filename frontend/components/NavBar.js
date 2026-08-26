import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeContext';

export default function NavBar({ active }) {
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <div className="navbar-logo">LP</div>
          <span>LearnPath AI</span>
        </Link>
        <div className={`navbar-right ${menuOpen ? 'open' : ''}`}>
          <div className="navbar-links">
            <Link href="/" className={`nav-link ${active === 'home' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/chat" className={`nav-link ${active === 'chat' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Assistant</Link>
            <Link href="/dashboard" className={`nav-link ${active === 'dashboard' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link href="/learning-path" className={`nav-link ${active === 'path' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Path</Link>
          </div>
          <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme" title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            {theme === 'light' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            )}
          </button>
          <Link href="/chat" className="btn btn-primary btn-sm navbar-cta" onClick={() => setMenuOpen(false)}>Get Started</Link>
        </div>
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {menuOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
          </svg>
        </button>
      </div>
    </nav>
  );
}
