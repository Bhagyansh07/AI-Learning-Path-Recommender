import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getProfile, getLearningPath, getRecommendations } from '../lib/engine';

export default function LearningPath() {
  const [path, setPath] = useState(null);
  const [recs, setRecs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = getProfile();
    if (p) { setPath(getLearningPath(p)); setRecs(getRecommendations(p)); }
    setLoading(false);
  }, []);

  if (loading) return <div className="page-wrapper"><nav className="navbar"><div className="container navbar-inner"><div className="navbar-brand"><span>&#129302;</span><Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}><span>LearnPath AI</span></Link></div></div></nav><main className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><div className="loading-spinner" style={{ width: 40, height: 40 }} /></main></div>;

  if (!path) return (
    <div className="page-wrapper">
      <Head><title>Learning Path - LearnPath AI</title></Head>
      <nav className="navbar"><div className="container navbar-inner"><div className="navbar-brand"><span>&#129302;</span><Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}><span>LearnPath AI</span></Link></div><div className="navbar-links"><Link href="/" className="nav-link">Home</Link><Link href="/chat" className="nav-link">AI Assistant</Link><Link href="/dashboard" className="nav-link">Dashboard</Link></div></div></nav>
      <main className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2 style={{ marginBottom: 16 }}>No Learning Path Yet</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Complete the onboarding to generate your personalized learning path.</p>
        <Link href="/chat" className="btn btn-primary">Start with AI Assistant</Link>
      </main>
    </div>
  );

  return (
    <div className="page-wrapper">
      <Head><title>Learning Path - LearnPath AI</title></Head>
      <nav className="navbar"><div className="container navbar-inner"><div className="navbar-brand"><span>&#129302;</span><Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}><span>LearnPath AI</span></Link></div><div className="navbar-links"><Link href="/" className="nav-link">Home</Link><Link href="/chat" className="nav-link">AI Assistant</Link><Link href="/dashboard" className="nav-link">Dashboard</Link><Link href="/learning-path" className="nav-link active">My Path</Link></div></div></nav>
      <main className="container main-content">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Your Learning Path</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Target: {path.target_level} &middot; {path.total_courses} courses &middot; ~{path.estimated_hours}h &middot; ~{path.estimated_weeks} weeks</p>
        </div>
        <div className="grid-4" style={{ marginBottom: 32 }}>
          <div className="stat-card"><div className="stat-value">{path.total_courses}</div><div className="stat-label">Courses</div></div>
          <div className="stat-card"><div className="stat-value">{path.phases.length}</div><div className="stat-label">Phases</div></div>
          <div className="stat-card"><div className="stat-value">{path.estimated_hours}h</div><div className="stat-label">Total Hours</div></div>
          <div className="stat-card"><div className="stat-value">{path.milestones.length}</div><div className="stat-label">Milestones</div></div>
        </div>
        {path.phases.map((phase, pi) => (
          <div key={pi} style={{ marginBottom: 40 }}>
            <div className="phase-header"><div className="phase-number">{phase.phase}</div><div style={{ flex: 1 }}><h3 style={{ fontSize: '1.1rem', margin: 0 }}>{phase.name}</h3><p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>{phase.description}</p></div><div style={{ textAlign: 'right' }}><div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-light)' }}>~{phase.duration_weeks} weeks</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{phase.courses.length} courses</div></div></div>
            <div className="path-timeline">
              {phase.courses.map((c, i) => (
                <div key={i} className={`path-node ${c.completed ? 'completed' : i === 0 ? 'active' : ''}`}>
                  <div className="course-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span className={`badge ${c.completed ? 'badge-success' : 'badge-primary'}`}>&#128218; Course</span>
                          <span className={`badge ${c.level === 'beginner' ? 'badge-success' : c.level === 'intermediate' ? 'badge-warning' : 'badge-danger'}`}>{c.level}</span>
                        </div>
                        <h4 style={{ fontSize: '0.95rem', marginBottom: 4 }}>{c.title}</h4>
                        <div className="course-meta"><span>{c.duration_hours}h</span><span>&middot;</span><span>{c.provider || 'Self-paced'}</span><span>&middot;</span><span>{c.skills.slice(0, 3).join(', ')}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {path.skill_gaps?.length > 0 && <div className="card" style={{ marginTop: 32 }}><h3 style={{ marginBottom: 16 }}>&#128269; Skill Gaps to Fill</h3><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{path.skill_gaps.map((s, i) => <span key={i} className="skill-tag missing">{s.replace(/_/g, ' ')}</span>)}</div></div>}
      </main>
    </div>
  );
}
