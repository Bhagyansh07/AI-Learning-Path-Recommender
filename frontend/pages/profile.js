import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import API_BASE from '../config';

export default function Profile() {
  const [profileId, setProfileId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('profileId') : null;
    if (saved) {
      setProfileId(saved);
      loadProfile(saved);
    } else {
      setLoading(false);
    }
  }, []);

  const loadProfile = async (pid) => {
    try {
      const res = await fetch(`${API_BASE}/profile/${pid}`);
      const data = await res.json();
      setProfile(data.profile);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const markCourseComplete = async (courseId) => {
    if (!profileId) return;
    try {
      const res = await fetch(`${API_BASE}/progress/${profileId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete_course', course_id: courseId }),
      });
      const data = await res.json();
      setProfile(data.profile);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <nav className="navbar">
          <div className="container navbar-inner">
            <div className="navbar-brand">
              <span>&#129302;</span>
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}><span>LearnPath AI</span></Link>
            </div>
          </div>
        </nav>
        <main className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div className="loading-spinner" style={{ width: 40, height: 40 }} />
        </main>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Head><title>Profile - LearnPath AI</title></Head>
      <nav className="navbar">
        <div className="container navbar-inner">
          <div className="navbar-brand">
            <span>&#129302;</span>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}><span>LearnPath AI</span></Link>
          </div>
          <div className="navbar-links">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/chat" className="nav-link">AI Assistant</Link>
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
            <Link href="/learning-path" className="nav-link">My Path</Link>
          </div>
        </div>
      </nav>

      <main className="container main-content">
        {profile ? (
          <>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 24 }}>Learner Profile</h1>
            <div className="dashboard-grid">
              <div>
                <div className="card" style={{ marginBottom: 24 }}>
                  <h3 style={{ marginBottom: 16 }}>&#128100; Basic Info</h3>
                  <div className="grid-2">
                    <div>
                      <div className="form-label">Name</div>
                      <div style={{ fontSize: '1rem', fontWeight: 600 }}>{profile.name}</div>
                    </div>
                    <div>
                      <div className="form-label">Experience Level</div>
                      <span className="badge badge-primary">{profile.experience_level}</span>
                    </div>
                    <div>
                      <div className="form-label">Learning Style</div>
                      <div style={{ fontSize: '0.95rem' }}>{profile.learning_style || 'Visual'}</div>
                    </div>
                    <div>
                      <div className="form-label">Time Commitment</div>
                      <div style={{ fontSize: '0.95rem' }}>{profile.time_commitment}</div>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ marginBottom: 24 }}>
                  <h3 style={{ marginBottom: 16 }}>&#127919; Interests & Goals</h3>
                  <div className="form-label">Interests</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {profile.interests.map((interest, i) => (
                      <span key={i} className="badge badge-primary">{interest.replace(/_/g, ' ')}</span>
                    ))}
                  </div>
                  <div className="form-label">Career Goals</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {profile.career_goals.map((goal, i) => (
                      <span key={i} className="badge badge-warning">{goal.replace(/_/g, ' ')}</span>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h3 style={{ marginBottom: 16 }}>&#128736; Completed Courses</h3>
                  {profile.completed_courses.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {profile.completed_courses.map((cid, i) => (
                        <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius-sm)' }}>
                          {cid}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      No courses completed yet. Start your learning journey!
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="card" style={{ marginBottom: 24 }}>
                  <h3 style={{ marginBottom: 16 }}>&#128200; Progress Stats</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.85rem' }}>Courses Completed</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {profile.progress.total_courses_completed}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.85rem' }}>Hours Learned</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {profile.progress.total_hours_learned}h
                        </span>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.85rem' }}>Streak</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {profile.progress.streak_days} days
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 style={{ marginBottom: 16 }}>&#127891; Current Skills ({profile.current_skills.length})</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {profile.current_skills.map((skill, i) => (
                      <span key={i} className="skill-tag acquired">
                        {typeof skill === 'string' ? skill : skill.skill}
                      </span>
                    ))}
                    {profile.current_skills.length === 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Complete courses to acquire new skills
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <h2 style={{ marginBottom: 16 }}>No Profile Yet</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              Create a profile through the AI Assistant chat to get started.
            </p>
            <Link href="/chat" className="btn btn-primary">Start with AI Assistant</Link>
          </div>
        )}
      </main>
    </div>
  );
}
