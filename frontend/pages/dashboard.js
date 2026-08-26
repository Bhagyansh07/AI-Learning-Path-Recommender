import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const API_BASE = 'http://localhost:5000/api';

export default function Dashboard() {
  const [profileId, setProfileId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('profileId') : null;
    if (saved) {
      setProfileId(saved);
      loadDashboard(saved);
    } else {
      setLoading(false);
    }
  }, []);

  const loadDashboard = async (pid) => {
    try {
      const [profRes, recRes, pathRes] = await Promise.all([
        fetch(`${API_BASE}/profile/${pid}`),
        fetch(`${API_BASE}/recommend/${pid}`),
        fetch(`${API_BASE}/path/${pid}`),
      ]);
      const profData = await profRes.json();
      const recData = await recRes.json();
      const pathData = await pathRes.json();

      setProfile(profData.profile);
      setRecommendations(recData);
      setLearningPath(pathData.learning_path);
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
    setLoading(false);
  };

  const createDemoProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/profile/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Demo Learner',
          primary_interest: 'Machine Learning & AI',
          experience_level: 'intermediate',
          time_commitment: '10-20 hours',
          career_goal: 'career change to tech',
          interests: ['machine_learning', 'data_science'],
          current_skills: [
            { skill: 'python', source: 'course' },
            { skill: 'basic_programming', source: 'course' },
          ],
        }),
      });
      const data = await res.json();
      localStorage.setItem('profileId', data.profile.id);
      setProfileId(data.profile.id);
      loadDashboard(data.profile.id);
    } catch (err) {
      setLoading(false);
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

  if (!profile) {
    return (
      <div className="page-wrapper">
        <Head><title>Dashboard - LearnPath AI</title></Head>
        <nav className="navbar">
          <div className="container navbar-inner">
            <div className="navbar-brand">
              <span>&#129302;</span>
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}><span>LearnPath AI</span></Link>
            </div>
            <div className="navbar-links">
              <Link href="/" className="nav-link">Home</Link>
              <Link href="/chat" className="nav-link">AI Assistant</Link>
              <Link href="/dashboard" className="nav-link active">Dashboard</Link>
            </div>
          </div>
        </nav>
        <main className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
          <h2 style={{ marginBottom: 16 }}>No Profile Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            Create a profile to see your personalized dashboard.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link href="/chat" className="btn btn-primary">Start with AI Assistant</Link>
            <button className="btn btn-secondary" onClick={createDemoProfile}>
              Create Demo Profile
            </button>
          </div>
        </main>
      </div>
    );
  }

  const progressPct = learningPath
    ? Math.round((profile.progress.total_courses_completed / Math.max(learningPath.total_courses, 1)) * 100)
    : 0;

  return (
    <div className="page-wrapper">
      <Head><title>Dashboard - LearnPath AI</title></Head>
      <nav className="navbar">
        <div className="container navbar-inner">
          <div className="navbar-brand">
            <span>&#129302;</span>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}><span>LearnPath AI</span></Link>
          </div>
          <div className="navbar-links">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/chat" className="nav-link">AI Assistant</Link>
            <Link href="/dashboard" className="nav-link active">Dashboard</Link>
            <Link href="/learning-path" className="nav-link">My Path</Link>
          </div>
        </div>
      </nav>

      <main className="container main-content">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Welcome back, {profile.name}!</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Level: <span className="badge badge-primary">{profile.experience_level}</span>
            {' '}&middot;{' '}
            Interests: {profile.interests.map((i, idx) => (
              <span key={idx} className="badge badge-primary" style={{ marginLeft: 4 }}>
                {i.replace(/_/g, ' ')}
              </span>
            ))}
          </p>
        </div>

        <div className="tabs">
          {['overview', 'courses', 'skills', 'milestones'].map(tab => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid-4" style={{ marginBottom: 32 }}>
              <div className="stat-card">
                <div className="stat-value">{profile.progress.total_courses_completed}</div>
                <div className="stat-label">Courses Done</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{profile.progress.skills_acquired.length || profile.current_skills.length}</div>
                <div className="stat-label">Skills</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{learningPath?.milestones?.length || 0}</div>
                <div className="stat-label">Milestones</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{learningPath?.estimated_weeks || 0}w</div>
                <div className="stat-label">Est. Duration</div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>Overall Progress</span>
                <span style={{ color: 'var(--text-secondary)' }}>{progressPct}%</span>
              </div>
              <div className="progress-bar" style={{ height: 12 }}>
                <div className="progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            {learningPath && (
              <div className="dashboard-grid">
                <div>
                  <h3 style={{ marginBottom: 16, fontSize: '1.1rem' }}>Recommended Courses</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {recommendations?.courses?.slice(0, 5).map((rec, i) => (
                      <div key={i} className="course-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', marginBottom: 4 }}>{rec.course.title}</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {rec.explanation}
                            </p>
                          </div>
                          <span className="badge badge-primary">
                            {Math.round(rec.score * 100)}% match
                          </span>
                        </div>
                        <div className="course-meta">
                          <span>{rec.course.level}</span>
                          <span>&middot;</span>
                          <span>{rec.course.duration_hours}h</span>
                          <span>&middot;</span>
                          <span>{rec.course.provider}</span>
                          <span>&middot;</span>
                          <span>{'★'.repeat(Math.round(rec.course.rating))} {rec.course.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ marginBottom: 16, fontSize: '1.1rem' }}>Next Milestones</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {learningPath.milestones.slice(0, 5).map((ms, i) => (
                      <div key={i} className="card" style={{ padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: ms.type === 'path_complete' ? 'var(--success)' : 'var(--primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '0.8rem', fontWeight: 700,
                          }}>
                            {ms.phase}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{ms.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ms.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'courses' && (
          <div>
            <h3 style={{ marginBottom: 16 }}>All Recommendations</h3>
            <div className="grid-2">
              {recommendations?.courses?.map((rec, i) => (
                <div key={i} className="course-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h4>{rec.course.title}</h4>
                    <span className="badge badge-primary">{Math.round(rec.score * 100)}%</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                    {rec.explanation}
                  </p>
                  <div className="course-meta">
                    <span className="badge badge-primary">{rec.course.level}</span>
                    <span>{rec.course.duration_hours}h</span>
                    <span>{rec.course.provider}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div>
            <h3 style={{ marginBottom: 16 }}>Your Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {profile.current_skills.map((skill, i) => (
                <span key={i} className="skill-tag acquired">
                  &#10003; {typeof skill === 'string' ? skill : skill.skill}
                </span>
              ))}
            </div>

            {learningPath?.skill_gaps?.length > 0 && (
              <>
                <h3 style={{ marginBottom: 16 }}>Skills to Develop</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {learningPath.skill_gaps.map((skill, i) => (
                    <span key={i} className="skill-tag missing">
                      &#9679; {skill.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'milestones' && learningPath && (
          <div>
            {learningPath.phases.map((phase, i) => (
              <div key={i} style={{ marginBottom: 32 }}>
                <div className="phase-header">
                  <div className="phase-number">{phase.phase}</div>
                  <div>
                    <h3 style={{ fontSize: '1rem', margin: 0 }}>{phase.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                      {phase.description} &middot; ~{phase.duration_weeks} weeks
                    </p>
                  </div>
                </div>
                <div className="path-timeline">
                  {phase.courses.map((course, j) => (
                    <div key={j} className={`path-node ${course.completed ? 'completed' : ''}`}>
                      <div className="course-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <h4 style={{ fontSize: '0.9rem' }}>{course.title}</h4>
                          {course.completed && <span className="badge badge-success">Completed</span>}
                        </div>
                        <div className="course-meta">
                          <span>{course.duration_hours}h</span>
                          <span>&middot;</span>
                          <span>{course.provider}</span>
                          <span>&middot;</span>
                          <span>{course.skills.slice(0, 3).join(', ')}</span>
                        </div>
                      </div>
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
