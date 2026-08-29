import NavBar from './NavBar';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function LegalLayout({ title, lastUpdated, children }) {
  const router = useRouter();

  return (
    <div className="page-wrapper">
      <NavBar active="legal" />
      <main style={{ flex: 1, padding: '40px 16px 64px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-3)', fontSize: '0.8rem',
              marginBottom: '20px', padding: 0,
            }}
          >
            &#8592; Back
          </button>
          <div className="page-header-wrap">
            <h1 className="hero-title" style={{ fontSize: '1.9rem', marginBottom: 6 }}>{title}</h1>
            {lastUpdated && (
              <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', marginBottom: 24 }}>
                Last updated: {lastUpdated}
              </p>
            )}
            <div className="hero-sub" style={{ border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: '24px 26px', fontSize: '0.95rem', color: 'var(--text-2)', lineHeight: 1.75 }}>
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function Footer() {
  const groups = [
    {
      heading: 'Legal',
      links: [
        { href: '/legal/privacy-policy', label: 'Privacy Policy' },
        { href: '/legal/terms-of-service', label: 'Terms of Service' },
        { href: '/legal/cookie-policy', label: 'Cookie Policy' },
        { href: '/legal/data-processing', label: 'Data Processing Agreement' },
      ],
    },
    {
      heading: 'Policies',
      links: [
        { href: '/legal/disclaimer', label: 'Disclaimer' },
        { href: '/legal/security', label: 'Security Policy' },
        { href: '/legal/accessibility', label: 'Accessibility Statement' },
        { href: '/legal/help-center', label: 'Help Center' },
      ],
    },
  ];

  return (
    <footer className="footer" style={{ marginTop: 'auto', padding: '36px 0', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 28, textAlign: 'left' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--accent)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: '0.7rem' }}>LP</div>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>LearnPath AI</span>
          </div>
          <p style={{ color: 'var(--text-3)', fontSize: '0.78rem', lineHeight: 1.6, maxWidth: 240 }}>
            Personalized AI-powered learning paths for every learner.
          </p>
        </div>
        {groups.map((g) => (
          <div key={g.heading}>
            <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.8rem', marginBottom: 10 }}>{g.heading}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {g.links.map((l) => (
                <li key={l.href} style={{ marginBottom: 7 }}>
                  <Link href={l.href} style={{ color: 'var(--text-3)', textDecoration: 'none', fontSize: '0.76rem' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, fontSize: '0.7rem', color: 'var(--text-3)' }}>
        &copy; {new Date().getFullYear()} LearnPath AI — Team NightCoders, JECRC University. All rights reserved.
      </div>
    </footer>
  );
}
