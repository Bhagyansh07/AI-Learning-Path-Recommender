import { useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useTheme } from './ThemeContext';

const NAV_LINKS = [
  { href: '/', key: 'home', label: 'Home' },
  { href: '/chat', key: 'chat', label: 'Assistant' },
  { href: '/dashboard', key: 'dashboard', label: 'Dashboard' },
  { href: '/learning-path', key: 'path', label: 'Path' },
  { href: '/skill-graph', key: 'graph', label: 'Graph' },
  { href: '/algorithm', key: 'algorithm', label: 'Algorithm' },
  { href: '/career-paths', key: 'career', label: 'Careers' },
];

export default function NavBar({ active }) {
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    router.events.on('routeChangeStart', close);
    return () => router.events.off('routeChangeStart', close);
  }, [router.events]);

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? 'hidden' : '';
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="navbar-brand" onClick={closeMenu}>
          <div className="navbar-logo">LP</div>
          <span>LearnPath AI</span>
        </Link>
        <div className="navbar-links">
          {NAV_LINKS.map((l) => (
            <Link key={l.key} href={l.href} className={`nav-link ${active === l.key ? 'active' : ''}`}>{l.label}</Link>
          ))}
        </div>
        <div className="navbar-right">
          <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
            {theme === 'light' ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            )}
          </button>
          <Link href="/chat" className="btn btn-primary btn-sm navbar-cta" onClick={closeMenu}>Get Started</Link>
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            aria-label="Toggle menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {menuOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && typeof document !== 'undefined' && createPortal(
        <div className="mobile-menu">
          {NAV_LINKS.map((l) => (
            <a
              key={l.key}
              href={l.href}
              className={`mobile-menu-link ${active === l.key ? 'active' : ''}`}
              onClick={closeMenu}
            >
              {l.label}
            </a>
          ))}
          <div className="mobile-menu-divider" />
          <button type="button" className="mobile-menu-link mobile-menu-theme" onClick={toggle}>
            {theme === 'light' ? '☾ Light Mode' : '☀ Dark Mode'}
          </button>
          <a href="/chat" className="btn btn-primary mobile-menu-cta" onClick={closeMenu}>Get Started</a>
        </div>,
        document.body
      )}
    </nav>
  );
}
