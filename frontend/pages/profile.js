import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import NavBar from '../components/NavBar';
import { getProfile } from '../lib/engine';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setProfile(getProfile()); setLoading(false); }, []);

  if (loading) return <div className="page-wrapper"><NavBar active="home" /><main className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><div className="loading-spinner" style={{ width: 40, height: 40 }} /></main></div>;

  return (
    <div className="page-wrapper">
      <Head><title>Profile — LearnPath AI</title></Head>
      <NavBar active="home" />
      <main className="container" style={{ padding: '32px 0 40px' }}>
        {profile ? (
          <>
            <h1 className="page-title" style={{ marginBottom: 24 }}>Learner Profile</h1>
            <div className="dashboard-grid">
              <div>
                <div className="card" style={{ marginBottom: 16 }}>
                  <h3>Basic Info</h3>
                  <div className="grid-2">
                    <div><div className="form-label">Name</div><div style={{ fontWeight: 600, color: 'var(--text)' }}>{profile.name}</div></div>
                    <div><div className="form-label">Experience Level</div><span className="badge badge-primary">{profile.experience_level}</span></div>
                    <div><div className="form-label">Time Commitment</div><div style={{ color: 'var(--text-secondary)' }}>{profile.time_commitment}</div></div>
                  </div>
                </div>
                <div className="card" style={{ marginBottom: 16 }}>
                  <h3>Interests & Goals</h3>
                  <div className="form-label">Interests</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                    {profile.interests.map((i, idx) => <span key={idx} className="badge badge-primary">{i.replace(/_/g, ' ')}</span>)}
                  </div>
                  <div className="form-label">Career Goals</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {profile.career_goals.map((g, idx) => <span key={idx} className="badge badge-warning">{g.replace(/_/g, ' ')}</span>)}
                  </div>
                </div>
                <div className="card">
                  <h3>Completed Courses</h3>
                  {profile.completed_courses.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {profile.completed_courses.map((c, i) => <div key={i} style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 6, fontSize: '0.85rem', color: 'var(--text)' }}>{c}</div>)}
                    </div>
                  ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No courses completed yet.</p>}
                </div>
              </div>
              <div>
                <div className="card" style={{ marginBottom: 16 }}>
                  <h3>Progress Stats</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Courses Completed</span><span style={{ fontWeight: 600, color: 'var(--text)' }}>{profile.completed_courses?.length || 0}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Hours Learned</span><span style={{ fontWeight: 600, color: 'var(--text)' }}>{profile.progress.total_hours_learned}h</span></div>
                  </div>
                </div>
                <div className="card">
                  <h3>Current Skills ({profile.current_skills.length})</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {profile.current_skills.map((s, i) => <span key={i} className="skill-tag acquired">{typeof s === 'string' ? s : s.skill}</span>)}
                    {profile.current_skills.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Complete courses to acquire new skills</p>}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <h2>No Profile Yet</h2>
            <p>Create a profile through the AI Assistant chat to get started.</p>
            <Link href="/chat" className="btn btn-primary">Start with AI Assistant</Link>
          </div>
        )}
      </main>
    </div>
  );
}
