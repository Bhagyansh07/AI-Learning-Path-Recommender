import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getProfile, createProfile, getRecommendations, getLearningPath } from '../lib/engine';

const NavBar = ({ active }) => (
  <nav className="navbar">
    <div className="container navbar-inner">
      <div className="navbar-brand">
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>LP</div>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}><span>LearnPath AI</span></Link>
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

  if (loading) return <div className="page-wrapper"><NavBar active="dashboard" /><main className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><div className="loading-spinner" style={{ width: 40, height: 40 }} /></main></div>;

  if (!profile) return (
    <div className="page-wrapper">
      <Head><title>Dashboard - LearnPath AI</title></Head>
      <NavBar active="dashboard" />
      <div className="bg-glow" />
      <main className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ fontSize: '3rem', marginBottom: 20 }}>&#128202;</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>No Profile Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '1.05rem' }}>Create a profile to see your personalized dashboard.</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link href="/chat" className="btn btn-primary" style={{ padding: '14px 28px' }}>Start with AI Assistant</Link>
          <button className="btn btn-secondary" onClick={createDemo} style={{ padding: '14px 28px' }}>Create Demo Profile</button>
        </div>
      </main>
    </div>
  );

  const progressPct = path ? Math.round((profile.progress.total_courses_completed / Math.max(path.total_courses, 1)) * 100) : 0;

  return (
    <div className="page-wrapper">
      <Head><title>Dashboard - LearnPath AI</title></Head>
      <NavBar active="dashboard" />
      <div className="bg-glow" />
      <main className="container main-content">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Welcome back, {profile.name}!</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
            <span className="badge badge-primary" style={{ marginRight: 8 }}>{profile.experience_level}</span>
            {profile.interests.map((i, idx) => <span key={idx} className="badge badge-primary" style={{ marginLeft: 4 }}>{i.replace(/_/g, ' ')}</span>)}
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
              {[
                { val: profile.progress.total_courses_completed, label: 'Courses Done', icon: '&#128218;' },
                { val: profile.current_skills.length, label: 'Skills', icon: '&#129504;' },
                { val: path?.milestones?.length || 0, label: 'Milestones', icon: '&#127919;' },
                { val: `${path?.estimated_weeks || 0}w`, label: 'Est. Duration', icon: '&#128337;' },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div style={{ fontSize: '1.3rem', marginBottom: 8 }} dangerouslySetInnerHTML={{ __html: s.icon }} />
                  <div className="stat-value">{s.val}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Overall Progress</span>
                <span style={{ color: 'var(--primary-light)', fontWeight: 700 }}>{progressPct}%</span>
              </div>
              <div className="progress-bar" style={{ height: 12 }}>
                <div className="progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
            {path && (
              <div className="dashboard-grid">
                <div>
                  <h3 style={{ marginBottom: 16, fontSize: '1.05rem', fontWeight: 700 }}>Recommended Courses</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {recs?.slice(0, 5).map((r, i) => (
                      <div key={i} className="course-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1, marginRight: 12 }}>
                            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 4 }}>{r.course.title}</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.explanation}</p>
                          </div>
                          <span className="badge badge-primary">{Math.round(r.score * 100)}%</span>
                        </div>
                        <div className="course-meta"><span>{r.course.level}</span><span>&middot;</span><span>{r.course.duration_hours}h</span><span>&middot;</span><span>{r.course.provider}</span><span>&middot;</span><span>{'★'.repeat(Math.round(r.course.rating))} {r.course.rating}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 style={{ marginBottom: 16, fontSize: '1.05rem', fontWeight: 700 }}>Next Milestones</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {path.milestones.slice(0, 5).map((ms, i) => (
                      <div key={i} className="card" style={{ padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: ms.type === 'path_complete' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #6366f1, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 800, flexShrink: 0, boxShadow: `0 4px 12px ${ms.type === 'path_complete' ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.3)'}` }}>{ms.phase}</div>
                          <div><div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{ms.title}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{ms.description || 'Keep going!'}</div></div>
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
            <h3 style={{ marginBottom: 16, fontWeight: 700 }}>All Recommendations</h3>
            <div className="grid-2">
              {recs?.map((r, i) => (
                <div key={i} className="course-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}><h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.course.title}</h4><span className="badge badge-primary">{Math.round(r.score * 100)}%</span></div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{r.explanation}</p>
                  <div className="course-meta"><span className="badge badge-primary">{r.course.level}</span><span>{r.course.duration_hours}h</span><span>{r.course.provider}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'skills' && (
          <div>
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Your Skills ({profile.current_skills.length})</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {profile.current_skills.map((s, i) => <span key={i} className="skill-tag acquired">&#10003; {typeof s === 'string' ? s : s.skill}</span>)}
              </div>
            </div>
            {path?.skill_gaps?.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Skills to Develop ({path.skill_gaps.length})</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {path.skill_gaps.map((s, i) => <span key={i} className="skill-tag missing">&#9679; {s.replace(/_/g, ' ')}</span>)}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'milestones' && path && (
          <div>
            {path.phases.map((phase, i) => (
              <div key={i} style={{ marginBottom: 32 }}>
                <div className="phase-header"><div className="phase-number">{phase.phase}</div><div><h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>{phase.name}</h3><p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{phase.description} &middot; ~{phase.duration_weeks} weeks</p></div></div>
                <div className="path-timeline">
                  {phase.courses.map((c, j) => (
                    <div key={j} className={`path-node ${c.completed ? 'completed' : ''}`}>
                      <div className="course-card"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{c.title}</h4>{c.completed && <span className="badge badge-success">Done</span>}</div><div className="course-meta"><span>{c.duration_hours}h</span><span>&middot;</span><span>{c.provider}</span><span>&middot;</span><span>{c.skills.slice(0, 3).join(', ')}</span></div></div>
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
