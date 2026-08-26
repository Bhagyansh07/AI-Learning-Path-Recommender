import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import API_BASE from '../config';

export default function LearningPath() {
  const [profileId, setProfileId] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('profileId') : null;
    if (saved) {
      setProfileId(saved);
      loadPath(saved);
    } else {
      setLoading(false);
    }
  }, []);

  const loadPath = async (pid) => {
    try {
      const [pathRes, recRes] = await Promise.all([
        fetch(`${API_BASE}/path/${pid}`),
        fetch(`${API_BASE}/recommend/${pid}`),
      ]);
      const pathData = await pathRes.json();
      const recData = await recRes.json();
      setLearningPath(pathData.learning_path);
      setRecommendations(recData);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
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

  if (!learningPath) {
    return (
      <div className="page-wrapper">
        <Head><title>Learning Path - LearnPath AI</title></Head>
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
            </div>
          </div>
        </nav>
        <main className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
          <h2 style={{ marginBottom: 16 }}>No Learning Path Yet</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            Complete the onboarding to generate your personalized learning path.
          </p>
          <Link href="/chat" className="btn btn-primary">Start with AI Assistant</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Head><title>Learning Path - LearnPath AI</title></Head>
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
            <Link href="/learning-path" className="nav-link active">My Path</Link>
          </div>
        </div>
      </nav>

      <main className="container main-content">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Your Learning Path</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Target: {learningPath.target_level} &middot; {learningPath.total_courses} courses &middot; {learningPath.total_projects} projects &middot; ~{learningPath.estimated_weeks} weeks
          </p>
        </div>

        <div className="grid-4" style={{ marginBottom: 32 }}>
          <div className="stat-card">
            <div className="stat-value">{learningPath.total_courses}</div>
            <div className="stat-label">Courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{learningPath.total_projects}</div>
            <div className="stat-label">Projects</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{learningPath.estimated_hours}h</div>
            <div className="stat-label">Total Hours</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{learningPath.milestones.length}</div>
            <div className="stat-label">Milestones</div>
          </div>
        </div>

        {learningPath.phases.map((phase, phaseIdx) => (
          <div key={phaseIdx} style={{ marginBottom: 40 }}>
            <div className="phase-header">
              <div className="phase-number">{phase.phase}</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{phase.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  {phase.description}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-light)' }}>
                  ~{phase.duration_weeks} weeks
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {phase.courses.length} courses
                  {phase.projects?.length ? ` + ${phase.projects.length} projects` : ''}
                </div>
              </div>
            </div>

            <div className="path-timeline">
              {phase.courses.map((course, i) => (
                <div key={i} className={`path-node ${course.completed ? 'completed' : i === 0 ? 'active' : ''}`}>
                  <div className="course-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span className={`badge ${course.completed ? 'badge-success' : 'badge-primary'}`}>
                            {course.type === 'project' ? '&#128736; Project' : '&#128218; Course'}
                          </span>
                          <span className={`badge ${course.level === 'beginner' ? 'badge-success' : course.level === 'intermediate' ? 'badge-warning' : 'badge-danger'}`}>
                            {course.level}
                          </span>
                          {course.milestone_type === 'milestone' && (
                            <span className="badge badge-warning">&#127942; Milestone</span>
                          )}
                        </div>
                        <h4 style={{ fontSize: '0.95rem', marginBottom: 4 }}>{course.title}</h4>
                        <div className="course-meta">
                          <span>{course.duration_hours}h</span>
                          <span>&middot;</span>
                          <span>{course.provider || 'Self-paced'}</span>
                          <span>&middot;</span>
                          <span>{course.skills.slice(0, 3).join(', ')}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {course.url && (
                          <a href={course.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                            Start &#8594;
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {phase.projects?.map((project, i) => (
                <div key={`p${i}`} className="path-node">
                  <div className="course-card" style={{ borderLeft: '3px solid var(--accent)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span className="badge badge-warning">&#128736; Hands-on Project</span>
                        <h4 style={{ fontSize: '0.95rem', margin: '8px 0 4px' }}>{project.title}</h4>
                        <div className="course-meta">
                          <span>{project.duration_hours}h</span>
                          <span>&middot;</span>
                          <span>{project.skills.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {learningPath.skill_gaps?.length > 0 && (
          <div className="card" style={{ marginTop: 32 }}>
            <h3 style={{ marginBottom: 16 }}>&#128269; Skill Gaps to Fill</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {learningPath.skill_gaps.map((skill, i) => (
                <span key={i} className="skill-tag missing">{skill.replace(/_/g, ' ')}</span>
              ))}
            </div>
          </div>
        )}

        {recommendations?.projects && (
          <div style={{ marginTop: 32 }}>
            <h3 style={{ marginBottom: 16 }}>&#128736; Recommended Projects</h3>
            <div className="grid-2">
              {recommendations.projects.map((rec, i) => (
                <div key={i} className="course-card">
                  <h4 style={{ fontSize: '0.95rem', marginBottom: 6 }}>{rec.project.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                    {rec.project.description}
                  </p>
                  <div className="course-meta">
                    <span>{rec.project.duration_hours}h</span>
                    <span>&middot;</span>
                    <span>{rec.project.skills_practiced.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
