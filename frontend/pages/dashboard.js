import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getProfile, createProfile, getRecommendations, getLearningPath } from '../lib/engine';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [recs, setRecs] = useState(null);
  const [path, setPath] = useState(null);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = getProfile();
    if (p) {
      setProfile(p);
      setRecs(getRecommendations(p));
      setPath(getLearningPath(p));
    }
    setLoading(false);
  }, []);

  const createDemo = () => {
    const p = createProfile({ name: 'Demo Learner', interests: ['machine_learning', 'data_science'], experience_level: 'intermediate', current_skills: ['python', 'basic_programming'], career_goals: ['data_scientist'], time_commitment: '10-20 hours' });
    setProfile(p);
    setRecs(getRecommendations(p));
    setPath(getLearningPath(p));
  };

  if (loading) return <div className="page-wrapper"><nav className="navbar"><div className="container navbar-inner"><div className="navbar-brand"><span>&#129302;</span><Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}><span>LearnPath AI</span></Link></div></div></nav><main className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><div className="loading-spinner" style={{ width: 40, height: 40 }} /></main></div>;

  if (!profile) return (
    <div className="page-wrapper">
      <Head><title>Dashboard - LearnPath AI</title></Head>
      <nav className="navbar"><div className="container navbar-inner"><div className="navbar-brand"><span>&#129302;</span><Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}><span>LearnPath AI</span></Link></div><div className="navbar-links"><Link href="/" className="nav-link">Home</Link><Link href="/chat" className="nav-link">AI Assistant</Link><Link href="/dashboard" className="nav-link active">Dashboard</Link></div></div></nav>
      <main className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2 style={{ marginBottom: 16 }}>No Profile Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Create a profile to see your personalized dashboard.</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link href="/chat" className="btn btn-primary">Start with AI Assistant</Link>
          <button className="btn btn-secondary" onClick={createDemo}>Create Demo Profile</button>
        </div>
      </main>
    </div>
  );

  const progressPct = path ? Math.round((profile.progress.total_courses_completed / Math.max(path.total_courses, 1)) * 100) : 0;

  return (
    <div className="page-wrapper">
      <Head><title>Dashboard - LearnPath AI</title></Head>
      <nav className="navbar"><div className="container navbar-inner"><div className="navbar-brand"><span>&#129302;</span><Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}><span>LearnPath AI</span></Link></div><div className="navbar-links"><Link href="/" className="nav-link">Home</Link><Link href="/chat" className="nav-link">AI Assistant</Link><Link href="/dashboard" className="nav-link active">Dashboard</Link><Link href="/learning-path" className="nav-link">My Path</Link></div></div></nav>
      <main className="container main-content">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Welcome back, {profile.name}!</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Level: <span className="badge badge-primary">{profile.experience_level}</span>{' '}&middot;{' '}
            Interests: {profile.interests.map((i, idx) => <span key={idx} className="badge badge-primary" style={{ marginLeft: 4 }}>{i.replace(/_/g, ' ')}</span>)}
          </p>
        </div>

        <div className="tabs">
          {['overview', 'courses', 'skills', 'milestones'].map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <>
            <div className="grid-4" style={{ marginBottom: 32 }}>
              <div className="stat-card"><div className="stat-value">{profile.progress.total_courses_completed}</div><div className="stat-label">Courses Done</div></div>
              <div className="stat-card"><div className="stat-value">{profile.current_skills.length}</div><div className="stat-label">Skills</div></div>
              <div className="stat-card"><div className="stat-value">{path?.milestones?.length || 0}</div><div className="stat-label">Milestones</div></div>
              <div className="stat-card"><div className="stat-value">{path?.estimated_weeks || 0}w</div><div className="stat-label">Est. Duration</div></div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontWeight: 600 }}>Overall Progress</span><span style={{ color: 'var(--text-secondary)' }}>{progressPct}%</span></div>
              <div className="progress-bar" style={{ height: 12 }}><div className="progress-fill" style={{ width: `${progressPct}%` }} /></div>
            </div>
            {path && (
              <div className="dashboard-grid">
                <div>
                  <h3 style={{ marginBottom: 16, fontSize: '1.1rem' }}>Recommended Courses</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {recs?.slice(0, 5).map((r, i) => (
                      <div key={i} className="course-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div><h4 style={{ fontSize: '0.95rem', marginBottom: 4 }}>{r.course.title}</h4><p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.explanation}</p></div>
                          <span className="badge badge-primary">{Math.round(r.score * 100)}%</span>
                        </div>
                        <div className="course-meta"><span>{r.course.level}</span><span>&middot;</span><span>{r.course.duration_hours}h</span><span>&middot;</span><span>{r.course.provider}</span><span>&middot;</span><span>{'★'.repeat(Math.round(r.course.rating))} {r.course.rating}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 style={{ marginBottom: 16, fontSize: '1.1rem' }}>Next Milestones</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {path.milestones.slice(0, 5).map((ms, i) => (
                      <div key={i} className="card" style={{ padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: ms.type === 'path_complete' ? 'var(--success)' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 700 }}>{ms.phase}</div>
                          <div><div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{ms.title}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ms.description || 'Keep going!'}</div></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'courses' && (
          <div>
            <h3 style={{ marginBottom: 16 }}>All Recommendations</h3>
            <div className="grid-2">
              {recs?.map((r, i) => (
                <div key={i} className="course-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}><h4>{r.course.title}</h4><span className="badge badge-primary">{Math.round(r.score * 100)}%</span></div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{r.explanation}</p>
                  <div className="course-meta"><span className="badge badge-primary">{r.course.level}</span><span>{r.course.duration_hours}h</span><span>{r.course.provider}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'skills' && (
          <div>
            <h3 style={{ marginBottom: 16 }}>Your Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {profile.current_skills.map((s, i) => <span key={i} className="skill-tag acquired">&#10003; {typeof s === 'string' ? s : s.skill}</span>)}
            </div>
            {path?.skill_gaps?.length > 0 && <><h3 style={{ marginBottom: 16 }}>Skills to Develop</h3><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{path.skill_gaps.map((s, i) => <span key={i} className="skill-tag missing">&#9679; {s.replace(/_/g, ' ')}</span>)}</div></>}
          </div>
        )}

        {tab === 'milestones' && path && (
          <div>
            {path.phases.map((phase, i) => (
              <div key={i} style={{ marginBottom: 32 }}>
                <div className="phase-header"><div className="phase-number">{phase.phase}</div><div><h3 style={{ fontSize: '1rem', margin: 0 }}>{phase.name}</h3><p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{phase.description} &middot; ~{phase.duration_weeks} weeks</p></div></div>
                <div className="path-timeline">
                  {phase.courses.map((c, j) => (
                    <div key={j} className={`path-node ${c.completed ? 'completed' : ''}`}>
                      <div className="course-card"><div style={{ display: 'flex', justifyContent: 'space-between' }}><h4 style={{ fontSize: '0.9rem' }}>{c.title}</h4>{c.completed && <span className="badge badge-success">Completed</span>}</div><div className="course-meta"><span>{c.duration_hours}h</span><span>&middot;</span><span>{c.provider}</span><span>&middot;</span><span>{c.skills.slice(0, 3).join(', ')}</span></div></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
