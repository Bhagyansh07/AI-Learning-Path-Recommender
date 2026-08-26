import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import NavBar from '../components/NavBar';
import { getProfile } from '../lib/engine';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try { setProfile(getProfile()); } catch (e) { console.error('Profile load error:', e); }
    setLoading(false);
  }, []);

  if (loading) return (
    <div className="page-wrapper">
      <NavBar />
      <main className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="loading-spinner" style={{ width: 40, height: 40 }} />
      </main>
    </div>
  );

  const completedCourses = profile?.completed_courses || [];
  const currentSkills = profile?.current_skills || [];
  const progress = profile?.progress || { total_hours_learned: 0, skills_acquired: [] };

  return (
    <div className="page-wrapper">
      <Head><title>Profile — LearnPath AI</title></Head>
      <NavBar />
      <main className="container" style={{ paddingTop: 72, paddingBottom: 48 }}>
        {profile ? (
          <>
            <div className="page-header">
              <h1 className="page-title">Learner Profile</h1>
              <p className="page-subtitle">{profile.name} · {profile.experience_level}</p>
            </div>

            <div className="stats-grid" style={{ marginBottom: 20 }}>
              <div className="stat-card">
                <div className="stat-value t-num" style={{ color: 'var(--accent-2)' }}>{completedCourses.length}</div>
                <div className="stat-label">Courses Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-value t-num" style={{ color: 'var(--green)' }}>{progress.total_hours_learned}h</div>
                <div className="stat-label">Hours Learned</div>
              </div>
              <div className="stat-card">
                <div className="stat-value t-num" style={{ color: 'var(--cyan)' }}>{currentSkills.length}</div>
                <div className="stat-label">Skills Acquired</div>
              </div>
              <div className="stat-card">
                <div className="stat-value t-num" style={{ color: 'var(--purple)' }}>{(profile.interests || []).length}</div>
                <div className="stat-label">Interests</div>
              </div>
            </div>

            <div className="dashboard-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card">
                  <div className="t-label" style={{ marginBottom: 12 }}>Basic Info</div>
                  <div className="grid-2" style={{ gap: 14 }}>
                    <div>
                      <div className="form-label">Name</div>
                      <div className="t-heading" style={{ fontSize: '0.95rem' }}>{profile.name}</div>
                    </div>
                    <div>
                      <div className="form-label">Level</div>
                      <span className="badge badge-accent">{profile.experience_level}</span>
                    </div>
                    <div>
                      <div className="form-label">Time Commitment</div>
                      <span className="badge badge-amber">{profile.time_commitment}</span>
                    </div>
                    <div>
                      <div className="form-label">Profile</div>
                      <span className="badge">{completedCourses.length} courses done</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="t-label" style={{ marginBottom: 12 }}>Interests & Goals</div>
                  <div className="form-label" style={{ marginBottom: 6 }}>Interests</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                    {(profile.interests || []).map((i, idx) => (
                      <span key={idx} className="badge badge-accent">{i.replace(/_/g, ' ')}</span>
                    ))}
                  </div>
                  <div className="form-label" style={{ marginBottom: 6 }}>Career Goals</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(profile.career_goals || []).map((g, idx) => (
                      <span key={idx} className="badge badge-amber">{g.replace(/_/g, ' ')}</span>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div className="t-label" style={{ marginBottom: 12 }}>Completed Courses</div>
                  {completedCourses.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {completedCourses.map((c, i) => (
                        <div key={i} style={{ padding: '8px 12px', background: 'var(--bg-3)', borderRadius: 'var(--r-sm)', fontSize: '0.82rem', color: 'var(--text)', border: '1px solid var(--border)' }}>{c}</div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-state" style={{ padding: '20px 0' }}>No courses completed yet.</p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card">
                  <div className="t-label" style={{ marginBottom: 14 }}>Progress Stats</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>Courses Completed</span>
                      <span className="t-num" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-2)' }}>{completedCourses.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>Hours Learned</span>
                      <span className="t-num" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--green)' }}>{progress.total_hours_learned}h</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="t-label" style={{ marginBottom: 12 }}>Current Skills ({currentSkills.length})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {currentSkills.map((s, i) => (
                      <span key={i} className="skill-tag acquired">{typeof s === 'string' ? s : s.skill}</span>
                    ))}
                    {currentSkills.length === 0 && (
                      <p style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>Complete courses to acquire new skills.</p>
                    )}
                  </div>
                </div>

                <div className="card">
                  <div className="t-label" style={{ marginBottom: 12 }}>Quick Actions</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link href="/chat" className="btn btn-primary btn-sm">AI Assistant</Link>
                    <Link href="/skill-graph" className="btn btn-secondary btn-sm">Skill Graph</Link>
                    <Link href="/career-paths" className="btn btn-secondary btn-sm">Career Paths</Link>
                    <Link href="/algorithm" className="btn btn-secondary btn-sm">Algorithm</Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <h2 className="t-heading">No Profile Yet</h2>
            <p>Create a profile through the AI Assistant chat to get started.</p>
            <Link href="/chat" className="btn btn-primary">Start with AI Assistant</Link>
          </div>
        )}
      </main>
    </div>
  );
}
