import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getProfile, createProfile, getRecommendations, getLearningPath, submitFeedback, getDemoProfiles } from '../lib/engine';

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

function FeedbackButtons({ courseId, onFeedback }) {
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(null);
  const handle = (r) => { setRating(r); setSubmitted(true); submitFeedback(courseId, r, 0); if (onFeedback) onFeedback(); };
  if (submitted) return <span className="badge badge-success">Rated: {rating}</span>;
  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
      <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }} onClick={() => handle('easy')}>Too Easy</button>
      <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }} onClick={() => handle('just_right')}>Just Right</button>
      <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }} onClick={() => handle('hard')}>Too Hard</button>
    </div>
  );
}

function WhyThisPanel({ rec }) {
  const [open, setOpen] = useState(false);
  if (!rec.why_this) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem', padding: '4px 10px', color: 'var(--primary-light)' }} onClick={() => setOpen(!open)}>
        {open ? 'Hide' : 'Why this?'}
      </button>
      {open && (
        <div style={{ marginTop: 8, padding: 12, background: 'rgba(99,102,241,0.05)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.1)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <div style={{ marginBottom: 8, color: 'var(--text-primary)', fontWeight: 600 }}>Recommendation Rationale:</div>
          <div>{rec.why_this}</div>
          {rec.difficulty_reason && <div style={{ marginTop: 6, color: 'var(--text-muted)' }}>Difficulty: {rec.difficulty_reason}</div>}
          {rec.prerequisite_info && <div style={{ marginTop: 6, color: rec.prerequisite_info.met ? 'var(--success)' : 'var(--warning)' }}>{rec.prerequisite_info.message}</div>}
          {rec.breakdown && (
            <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
              {Object.entries(rec.breakdown).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                  <span>{k.replace(/_/g, ' ')}</span><span style={{ fontWeight: 600 }}>{Math.round(v * 100)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [recs, setRecs] = useState(null);
  const [path, setPath] = useState(null);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const p = getProfile();
    if (p) { setProfile(p); setRecs(getRecommendations(p)); setPath(getLearningPath(p)); }
    setLoading(false);
  }, [refreshKey]);

  const refresh = () => { const p = getProfile(); if (p) { setProfile(p); setRecs(getRecommendations(p)); setPath(getLearningPath(p)); } };

  const loadDemo = (demoData) => {
    const p = createProfile(demoData);
    setProfile(p); setRecs(getRecommendations(p)); setPath(getLearningPath(p)); setRefreshKey(k => k + 1);
  };

  const demos = getDemoProfiles();

  if (loading) return <div className="page-wrapper"><NavBar active="dashboard" /><main className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><div className="loading-spinner" style={{ width: 40, height: 40 }} /></main></div>;

  if (!profile) return (
    <div className="page-wrapper">
      <Head><title>Dashboard - LearnPath AI</title></Head>
      <NavBar active="dashboard" />
      <div className="bg-glow" />
      <main className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ fontSize: '3rem', marginBottom: 20 }}>&#128202;</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>No Profile Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '1.05rem' }}>Create a profile or load a demo to see your personalized dashboard.</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/chat" className="btn btn-primary" style={{ padding: '14px 28px' }}>Start with AI Assistant</Link>
        </div>
        <div style={{ marginTop: 40 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-secondary)' }}>Or try a demo profile:</h3>
          <div className="grid-3" style={{ maxWidth: 800, margin: '0 auto' }}>
            {demos.map((d, i) => (
              <button key={i} className="feature-card" style={{ cursor: 'pointer', textAlign: 'center', border: '1px solid var(--border)' }} onClick={() => loadDemo(d.data)}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>{i === 0 ? '&#128202;' : i === 1 ? '&#128187;' : '&#129302;'}</div>
                <h3 style={{ fontSize: '0.95rem', marginBottom: 4 }}>{d.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.data.experience_level} &middot; {d.data.interests.join(', ').replace(/_/g, ' ')}</p>
              </button>
            ))}
          </div>
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
              <div className="progress-bar" style={{ height: 12 }}><div className="progress-fill" style={{ width: `${progressPct}%` }} /></div>
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
                        <div className="course-meta"><span>{r.course.level}</span><span>&middot;</span><span>{r.course.duration_hours}h</span><span>&middot;</span><span>{r.course.provider}</span><span>&middot;</span><span>{'&#9733;'.repeat(Math.round(r.course.rating))} {r.course.rating}</span></div>
                        <WhyThisPanel rec={r} />
                        <FeedbackButtons courseId={r.course_id} onFeedback={() => { refresh(); setRefreshKey(k => k + 1); }} />
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
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: ms.type === 'path_complete' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #6366f1, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 800, flexShrink: 0 }}>{ms.phase}</div>
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
                  <WhyThisPanel rec={r} />
                  <FeedbackButtons courseId={r.course_id} onFeedback={() => { refresh(); setRefreshKey(k => k + 1); }} />
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
