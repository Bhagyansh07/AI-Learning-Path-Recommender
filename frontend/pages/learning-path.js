import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getProfile, getLearningPath, getRecommendations } from '../lib/engine';

const NavBar = ({ active }) => (
  <nav className="navbar">
    <div className="container navbar-inner">
      <div className="navbar-brand">
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>PA</div>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}><span>Pragya AI</span></Link>
      </div>
      <div className="navbar-links">
        <Link href="/" className={`nav-link ${active === 'home' ? 'active' : ''}`}>Home</Link>
        <Link href="/chat" className={`nav-link ${active === 'chat' ? 'active' : ''}`}>AI Assistant</Link>
        <Link href="/dashboard" className={`nav-link ${active === 'dashboard' ? 'active' : ''}`}>Dashboard</Link>
        <Link href="/learning-path" className={`nav-link ${active === 'path' ? 'active' : ''}`}>My Path</Link>
      </div>
    </div>
  </nav>
);

export default function LearningPath() {
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = getProfile();
    if (p) setPath(getLearningPath(p));
    setLoading(false);
  }, []);

  if (loading) return <div className="page-wrapper"><NavBar active="path" /><main className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><div className="loading-spinner" style={{ width: 40, height: 40 }} /></main></div>;

  if (!path) return (
    <div className="page-wrapper">
      <Head><title>Learning Path - Pragya AI</title></Head>
      <NavBar active="path" />
      <div className="bg-glow" />
      <main className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ fontSize: '3rem', marginBottom: 20 }}>&#128506;</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>No Learning Path Yet</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '1.05rem' }}>Complete the onboarding to generate your personalized learning path.</p>
        <Link href="/chat" className="btn btn-primary" style={{ padding: '14px 28px' }}>Start with AI Assistant</Link>
      </main>
    </div>
  );

  return (
    <div className="page-wrapper">
      <Head><title>Learning Path - Pragya AI</title></Head>
      <NavBar active="path" />
      <div className="bg-glow" />
      <main className="container main-content">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Your Learning Path</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
            <span className="badge badge-primary" style={{ marginRight: 6 }}>{path.target_level}</span>
            {path.total_courses} courses &middot; ~{path.estimated_hours}h &middot; ~{path.estimated_weeks} weeks
          </p>
        </div>
        <div className="grid-4" style={{ marginBottom: 32 }}>
          {[
            { val: path.total_courses, label: 'Courses', icon: '&#128218;' },
            { val: path.phases.length, label: 'Phases', icon: '&#128200;' },
            { val: `${path.estimated_hours}h`, label: 'Total Hours', icon: '&#128337;' },
            { val: path.milestones.length, label: 'Milestones', icon: '&#127919;' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontSize: '1.3rem', marginBottom: 8 }} dangerouslySetInnerHTML={{ __html: s.icon }} />
              <div className="stat-value">{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
        {path.phases.map((phase, pi) => (
          <div key={pi} style={{ marginBottom: 40 }}>
            <div className="phase-header">
              <div className="phase-number">{phase.phase}</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>{phase.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>{phase.description}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-light)' }}>~{phase.duration_weeks} weeks</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{phase.courses.length} courses</div>
              </div>
            </div>
            <div className="path-timeline">
              {phase.courses.map((c, i) => (
                <div key={i} className={`path-node ${c.completed ? 'completed' : i === 0 ? 'active' : ''}`}>
                  <div className="course-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span className={`badge ${c.completed ? 'badge-success' : 'badge-primary'}`}>{c.completed ? 'Completed' : 'Course'}</span>
                          <span className={`badge ${c.level === 'beginner' ? 'badge-success' : c.level === 'intermediate' ? 'badge-warning' : 'badge-danger'}`}>{c.level}</span>
                        </div>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 4 }}>{c.title}</h4>
                        <div className="course-meta"><span>{c.duration_hours}h</span><span>&middot;</span><span>{c.provider || 'Self-paced'}</span><span>&middot;</span><span>{c.skills.slice(0, 3).join(', ')}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {path.skill_gaps?.length > 0 && (
          <div className="card" style={{ marginTop: 32 }}>
            <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Skills to Develop ({path.skill_gaps.length})</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {path.skill_gaps.map((s, i) => <span key={i} className="skill-tag missing">{s.replace(/_/g, ' ')}</span>)}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
