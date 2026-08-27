import Head from 'next/head';
import Link from 'next/link';
import NavBar from '../components/NavBar';
import { getProfile, getRecommendations, getLearningPath, getSkillGaps, getDemoProfiles, createProfile } from '../lib/engine';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [recs, setRecs] = useState([]);
  const [path, setPath] = useState(null);
  const [gap, setGap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoprofiles, setDemoprofiles] = useState([]);

  useEffect(() => {
    const p = getProfile();
    setProfile(p);
    if (p) { setRecs(getRecommendations(p, 5)); setPath(getLearningPath(p)); setGap(getSkillGaps(p)); }
    else setDemoprofiles(getDemoProfiles());
    setLoading(false);
  }, []);

  const refresh = () => {
    const p = getProfile();
    if (p) { setProfile(p); setRecs(getRecommendations(p, 5)); setPath(getLearningPath(p)); setGap(getSkillGaps(p)); }
  };

  const loadDemo = (demo) => {
    const p = createProfile(demo.data);
    setProfile(p); setRecs(getRecommendations(p, 5)); setPath(getLearningPath(p)); setGap(getSkillGaps(p)); setDemoprofiles([]);
  };

  if (loading) return (
    <div className="page-wrapper">
      <NavBar active="dashboard" />
      <main className="container" style={{ paddingTop: 72 }}>
        <div className="empty-state">
          <p>Loading...</p>
        </div>
      </main>
    </div>
  );

  if (!profile) return (
    <div className="page-wrapper">
      <Head><title>Dashboard — LearnPath AI</title></Head>
      <NavBar active="dashboard" />
      <main className="container" style={{ paddingTop: 72 }}>
        <div className="empty-state">
          <h2>No profile yet</h2>
          <p>Create your profile to get personalized recommendations.</p>
          <Link href="/chat" className="btn btn-primary">Start AI Assistant</Link>
          {demoprofiles.length > 0 && (
            <div className="demo-section">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: 12 }}>Or try a demo profile:</p>
              <div className="demo-grid">
                {demoprofiles.map((d, i) => (
                  <button key={i} className="demo-card" onClick={() => loadDemo(d)}>
                    <span className="demo-name">{d.name}</span>
                    <span className="demo-level">{d.data.experience_level}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );

  const topRec = recs[0];
  const totalPathSkills = path ? path.phases.flatMap(p => p.courses).length : 0;
  const completedCount = profile.completed_courses?.length || 0;

  return (
    <div className="page-wrapper">
      <Head><title>Dashboard — LearnPath AI</title></Head>
      <NavBar active="dashboard" />
      <main className="container" style={{ paddingTop: 72, paddingBottom: 48 }}>
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{profile.name} · {profile.experience_level} · {profile.interests?.map(i => i.replace(/_/g, ' ')).join(', ')}</p>
        </div>

        {topRec && (
          <div className="card card-glow" style={{ marginBottom: 24, borderLeft: '3px solid var(--accent)' }}>
            <div className="rec-header">
              <div>
                <div className="t-label">Next Recommended</div>
                <h3 className="rec-title">{topRec.course.title}</h3>
                <p className="rec-meta">{topRec.course.provider} · {topRec.course.duration_hours}h · {topRec.course.level}</p>
              </div>
              <div className="rec-score t-num">{Math.round(topRec.score * 100)}%</div>
            </div>
            <p className="rec-explanation">{topRec.explanation}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link href="/learning-path" className="btn btn-primary btn-sm">Start Learning</Link>
              <Link href="/chat" className="btn btn-secondary btn-sm">Ask AI</Link>
              {topRec.course.provider_url && (
                <a href={topRec.course.provider_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">Open course ↗</a>
              )}
            </div>
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value t-num">{totalPathSkills}</div>
            <div className="stat-label">Skills to Learn</div>
          </div>
          <div className="stat-card">
            <div className="stat-value t-num">{path ? path.estimated_weeks : 0}w</div>
            <div className="stat-label">Est. Duration</div>
          </div>
          <div className="stat-card">
            <div className="stat-value t-num">{gap ? gap.readiness_score : 0}%</div>
            <div className="stat-label">Career Readiness</div>
          </div>
          <div className="stat-card">
            <div className="stat-value t-num">{completedCount}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        <div className="dashboard-grid" style={{ marginTop: 24 }}>
          <section>
            <h2 className="section-title">Recommended Skills</h2>
            {recs.map((r, i) => (
              <div key={i} className="rec-card">
                <div className="rec-header">
                  <div>
                    <h3 className="rec-title">{r.course.title}</h3>
                    <p className="rec-meta">{r.course.provider} · {r.course.duration_hours}h · {r.course.level}</p>
                  </div>
                  <div className="rec-score t-num">{Math.round(r.score * 100)}%</div>
                </div>
                <p className="rec-explanation">{r.explanation}</p>
                {r.course.provider_url && (
                  <a href={r.course.provider_url} target="_blank" rel="noopener noreferrer" className="course-card-link" style={{ marginTop: 10 }}>Open course on {r.course.provider} ↗</a>
                )}
              </div>
            ))}
          </section>

          {gap && (
            <section>
              <h2 className="section-title">Skill Coverage — {gap.career_title}</h2>
              <div className="skill-coverage-bar">
                <div className="coverage-fill" style={{ width: `${gap.readiness_score}%` }} />
                <span className="coverage-text">{gap.readiness_score}% Ready</span>
              </div>
              <div className="skill-gaps-list">
                {gap.missing_skills.slice(0, 8).map((s, i) => (
                  <div key={i} className="skill-gap-item">
                    <div className="skill-gap-header">
                      <span className="skill-name">{s.name}</span>
                      <span className="skill-status missing">Missing</span>
                    </div>
                    <div className="skill-gap-bar">
                      <div className="skill-gap-fill missing" style={{ width: '40%' }} />
                    </div>
                  </div>
                ))}
                {gap.acquired_skills.map((s, i) => (
                  <div key={`a${i}`} className="skill-gap-item">
                    <div className="skill-gap-header">
                      <span className="skill-name">{typeof s === 'string' ? s : s}</span>
                      <span className="skill-status acquired">Acquired</span>
                    </div>
                    <div className="skill-gap-bar">
                      <div className="skill-gap-fill acquired" style={{ width: '100%' }} />
                    </div>
                  </div>
                ))}
              </div>
              {gap.avg_salary && (
                <p className="gap-info" style={{ marginTop: 16, color: 'var(--text-3)', fontSize: '0.8rem' }}>
                  Avg Salary: {gap.avg_salary} · Growth: {gap.growth_rate}
                </p>
              )}
            </section>
          )}
        </div>

        {path && (
          <section style={{ marginTop: 32 }}>
            <h2 className="section-title">Learning Path Overview</h2>
            <div className="path-phases">
              {path.phases.map((phase, i) => (
                <div key={i} className="phase-section">
                  <div className="phase-header">
                    <div className="phase-badge">Phase {phase.phase}</div>
                    <div style={{ flex: 1 }}>
                      <h3 className="phase-title">{phase.name}</h3>
                      <p className="phase-desc">{phase.description} — {phase.duration_weeks} weeks</p>
                    </div>
                  </div>
                  <div style={{ padding: '0 20px 14px' }}>
                    <div className="phase-skills">
                      {phase.courses.slice(0, 6).map((c, j) => (
                        <span key={j} className="skill-tag">{c.title}</span>
                      ))}
                      {phase.courses.length > 6 && (
                        <span className="skill-tag more">+{phase.courses.length - 6} more</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Link href="/learning-path" className="btn btn-primary">View Full Learning Path</Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}