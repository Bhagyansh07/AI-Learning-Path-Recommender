import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { getLearningPath, getProfile } from '../lib/engine';
import ExplanationModal from '../components/ExplanationModal';

export default function LearningPathPage() {
  const [path, setPath] = useState(null);
  const [profile, setProfile] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [modal, setModal] = useState({ open: false, title: '', content: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = getProfile();
    setProfile(p);
    if (p) setPath(getLearningPath(p));
    setLoading(false);
  }, []);

  if (loading) return <div className="page-wrapper"><NavBar /><main className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><div className="loading-spinner" style={{ width: 40, height: 40 }} /></main></div>;

  if (!path) return (
    <div className="page-wrapper">
      <Head><title>Learning Path — LearnPath AI</title></Head>
      <NavBar active="path" />
      <main className="container" style={{ paddingTop: 72, paddingBottom: 48 }}>
        <div className="empty-state">
          <h2>No Learning Path Yet</h2>
          <p>Complete your profile through the AI Assistant to generate a personalized learning path.</p>
          <Link href="/chat" className="btn btn-primary">Start with AI Assistant</Link>
        </div>
      </main>
    </div>
  );

  const togglePhase = (idx) => setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));

  return (
    <div className="page-wrapper">
      <Head><title>Learning Path — LearnPath AI</title></Head>
      <NavBar active="path" />
      <main className="container" style={{ paddingTop: 72, paddingBottom: 48 }}>
        <div className="page-header">
          <h1 className="page-title">Your Learning Path</h1>
          <p className="page-subtitle">{path.career_title} · {path.total_skills} skills · {path.estimated_weeks} weeks estimated</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 28 }}>
          <div className="stat-card" style={{ background: 'var(--accent-dim)', borderColor: 'color-mix(in srgb, var(--accent) 25%, transparent)' }}>
            <div className="stat-value t-num" style={{ color: 'var(--accent-2)', fontSize: '1.3rem' }}>{path.total_skills}</div>
            <div className="stat-label">Skills to Learn</div>
          </div>
          <div className="stat-card">
            <div className="stat-value t-num" style={{ fontSize: '1.3rem' }}>{path.estimated_weeks}w</div>
            <div className="stat-label">Est. Weeks</div>
          </div>
          <div className="stat-card">
            <div className="stat-value t-num" style={{ fontSize: '1.3rem' }}>{path.phases.length}</div>
            <div className="stat-label">Phases</div>
          </div>
          <div className="stat-card">
            <div className="stat-value t-num" style={{ fontSize: '1.3rem' }}>{path.difficulty_distribution?.beginner || 0}</div>
            <div className="stat-label">Beginner</div>
          </div>
        </div>

        <div className="path-phases" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {path.phases.map((phase, i) => (
            <div key={i} className={`phase-section ${expanded[i] ? 'expanded' : ''}`} onClick={() => togglePhase(i)}>
              <div className="phase-header">
                <div className="phase-badge">Phase {phase.phase}</div>
                <div style={{ flex: 1, cursor: 'pointer' }}>
                  <h3 className="phase-title">{phase.name}</h3>
                  <p className="phase-desc">{phase.description}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{phase.duration_weeks}w</span>
                  <span className={`phase-chevron ${expanded[i] ? 'open' : ''}`} style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>▼</span>
                </div>
              </div>
              {expanded[i] && (
                <div style={{ padding: '0 20px 14px' }}>
                  <div className="phase-courses" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {phase.courses.map((course, j) => (
                      <div key={j} className="course-card" onClick={(e) => { e.stopPropagation(); setModal({ open: true, title: course.title, content: course }); }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '0.88rem', fontWeight: 600, margin: '0 0 4px', color: 'var(--text)' }}>{course.title}</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', margin: 0 }}>{course.provider} · {course.duration_hours}h · {course.level}</p>
                          </div>
                          <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>{course.type}</span>
                        </div>
                        {course.description && <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', marginTop: 8, lineHeight: 1.5 }}>{course.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      <ExplanationModal open={modal.open} onClose={() => setModal({ open: false })} title={modal.title} content={modal.content} />
    </div>
  );
}
