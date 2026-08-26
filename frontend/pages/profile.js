import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getProfile } from '../lib/engine';

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

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setProfile(getProfile()); setLoading(false); }, []);

  if (loading) return <div className="page-wrapper"><NavBar active="home" /><main className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><div className="loading-spinner" style={{ width: 40, height: 40 }} /></main></div>;

  return (
    <div className="page-wrapper">
      <Head><title>Profile - LearnPath AI</title></Head>
      <NavBar active="home" />
      <div className="bg-glow" />
      <main className="container main-content">
        {profile ? (
          <>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 24 }}>Learner Profile</h1>
            <div className="dashboard-grid">
              <div>
                <div className="card" style={{ marginBottom: 24 }}>
                  <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Basic Info</h3>
                  <div className="grid-2">
                    <div><div className="form-label">Name</div><div style={{ fontSize: '1rem', fontWeight: 600 }}>{profile.name}</div></div>
                    <div><div className="form-label">Experience Level</div><span className="badge badge-primary">{profile.experience_level}</span></div>
                    <div><div className="form-label">Time Commitment</div><div style={{ fontSize: '0.95rem' }}>{profile.time_commitment}</div></div>
                  </div>
                </div>
                <div className="card" style={{ marginBottom: 24 }}>
                  <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Interests & Goals</h3>
                  <div className="form-label">Interests</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>{profile.interests.map((i, idx) => <span key={idx} className="badge badge-primary">{i.replace(/_/g, ' ')}</span>)}</div>
                  <div className="form-label">Career Goals</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{profile.career_goals.map((g, idx) => <span key={idx} className="badge badge-warning">{g.replace(/_/g, ' ')}</span>)}</div>
                </div>
                <div className="card">
                  <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Completed Courses</h3>
                  {profile.completed_courses.length > 0 ? <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{profile.completed_courses.map((c, i) => <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius-sm)' }}>{c}</div>)}</div> : <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No courses completed yet. Start your learning journey!</p>}
                </div>
              </div>
              <div>
                <div className="card" style={{ marginBottom: 24 }}>
                  <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Progress Stats</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: '0.85rem' }}>Courses Completed</span><span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{profile.progress.total_courses_completed}</span></div></div>
                    <div><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: '0.85rem' }}>Hours Learned</span><span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{profile.progress.total_hours_learned}h</span></div></div>
                  </div>
                </div>
                <div className="card">
                  <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Current Skills ({profile.current_skills.length})</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {profile.current_skills.map((s, i) => <span key={i} className="skill-tag acquired">{typeof s === 'string' ? s : s.skill}</span>)}
                    {profile.current_skills.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Complete courses to acquire new skills</p>}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 20 }}>&#128100;</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>No Profile Yet</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '1.05rem' }}>Create a profile through the AI Assistant chat to get started.</p>
            <Link href="/chat" className="btn btn-primary" style={{ padding: '14px 28px' }}>Start with AI Assistant</Link>
          </div>
        )}
      </main>
    </div>
  );
}
