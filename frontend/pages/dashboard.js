import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import NavBar from '../components/NavBar';
import { getProfile, getRecommendations, getLearningPath, getSkillGaps, getDemoProfiles, submitFeedback, createProfile } from '../lib/engine';

const FEEDBACK_OPTIONS = [
  { value: 'easy', label: 'Too Easy', color: '#22c55e' },
  { value: 'good', label: 'Just Right', color: '#3b82f6' },
  { value: 'hard', label: 'Too Hard', color: '#ef4444' },
];

function WhyThisPanel({ rec }) {
  if (!rec) return null;
  return (
    <div className="why-this-panel">
      <div className="panel-header"><span>💡</span><h4>Why this recommendation?</h4></div>
      <p className="panel-text">{rec.why_this}</p>
      <div className="panel-details">
        <div className="detail-row"><span className="detail-label">Difficulty</span><span className="detail-value">{rec.difficulty_reason}</span></div>
        <div className="detail-row"><span className="detail-label">Prerequisites</span><span className="detail-value">{rec.prerequisite_info.message}</span></div>
        {rec.breakdown && (
          <div className="breakdown-row">
            {Object.entries(rec.breakdown).map(([k, v]) => (
              <div key={k} className="breakdown-item"><span className="breakdown-label">{k.replace(/_/g, ' ')}</span><span className="breakdown-value">{Math.round(v * 100)}%</span></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FeedbackButtons({ skillId, onFeedback }) {
  const [given, setGiven] = useState(null);
  const handle = (val) => { setGiven(val); submitFeedback(skillId, val, 0); onFeedback?.(); };
  if (given) return <div className="feedback-thanks">Thanks for your feedback!</div>;
  return (
    <div className="feedback-buttons">
      <span className="feedback-label">How was this?</span>
      {FEEDBACK_OPTIONS.map(o => <button key={o.value} className="feedback-btn" style={{ borderColor: o.color, color: o.color }} onClick={() => handle(o.value)}>{o.label}</button>)}
    </div>
  );
}

function SkillGapBar({ name, acquired }) {
  return (
    <div className="skill-gap-item">
      <div className="skill-gap-header"><span className="skill-name">{name}</span><span className={`skill-status ${acquired ? 'acquired' : 'missing'}`}>{acquired ? 'Acquired' : 'Missing'}</span></div>
      <div className="skill-gap-bar"><div className={`skill-gap-fill ${acquired ? 'acquired' : 'missing'}`} style={{ width: acquired ? '100%' : '40%' }} /></div>
    </div>
  );
}

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [recs, setRecs] = useState([]);
  const [path, setPath] = useState(null);
  const [gap, setGap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWhy, setShowWhy] = useState(null);
  const [demoprofiles, setDemoprofiles] = useState([]);

  useEffect(() => {
    const p = getProfile();
    setProfile(p);
    if (p) { setRecs(getRecommendations(p, 5)); setPath(getLearningPath(p)); setGap(getSkillGaps(p)); }
    else setDemoprofiles(getDemoProfiles());
    setLoading(false);
  }, []);

  const refresh = () => { if (profile) { setRecs(getRecommendations(profile, 5)); setPath(getLearningPath(profile)); setGap(getSkillGaps(profile)); } };

  const loadDemo = (demo) => {
    const p = createProfile(demo.data);
    setProfile(p); setRecs(getRecommendations(p, 5)); setPath(getLearningPath(p)); setGap(getSkillGaps(p)); setDemoprofiles([]);
  };

  if (loading) return <div className="page-wrapper"><NavBar active="dashboard" /><main className="container" style={{ paddingTop: 64 }}><div className="loading-text">Loading...</div></main></div>;

  if (!profile) return (
    <div className="page-wrapper">
      <Head><title>Dashboard — LearnPath AI</title></Head>
      <NavBar active="dashboard" />
      <main className="container" style={{ paddingTop: 64 }}>
        <div className="empty-state">
          <h2>No profile yet</h2>
          <p>Create your profile to get personalized recommendations.</p>
          <Link href="/chat" className="btn btn-primary">Start AI Assistant</Link>
          {demoprofiles.length > 0 && (
            <div className="demo-section">
              <p>Or try a demo profile:</p>
              <div className="demo-grid">
                {demoprofiles.map((d, i) => <button key={i} className="demo-card" onClick={() => loadDemo(d)}><span className="demo-name">{d.name}</span><span className="demo-level">{d.data.experience_level}</span></button>)}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );

  return (
    <div className="page-wrapper">
      <Head><title>Dashboard — LearnPath AI</title></Head>
      <NavBar active="dashboard" />
      <main className="container" style={{ paddingTop: 64, paddingBottom: 40 }}>
        <div className="dashboard-header">
          <h1 className="page-title">Your Dashboard</h1>
          <p className="page-subtitle">Profile: <strong>{profile.name}</strong> — Level: <strong>{profile.experience_level}</strong></p>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-value">{path ? path.total_courses : 0}</div><div className="stat-label">Skills to Learn</div></div>
          <div className="stat-card"><div className="stat-value">{path ? path.estimated_weeks : 0}w</div><div className="stat-label">Est. Duration</div></div>
          <div className="stat-card"><div className="stat-value">{gap ? gap.readiness_score : 0}%</div><div className="stat-label">Career Readiness</div></div>
          <div className="stat-card"><div className="stat-value">{profile.progress?.total_courses_completed || 0}</div><div className="stat-label">Completed</div></div>
        </div>

        <div className="dashboard-grid">
          <section className="dashboard-section">
            <h2 className="section-title">Recommended Skills</h2>
            {recs.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Complete your profile to get recommendations.</p>}
            {recs.map((r, i) => (
              <div key={i} className="rec-card">
                <div className="rec-header">
                  <div className="rec-info"><h3 className="rec-title">{r.course.title}</h3><p className="rec-meta">{r.course.provider} · {r.course.duration_hours}h · {r.course.level}</p></div>
                  <div className="rec-score">{Math.round(r.score * 100)}%</div>
                </div>
                <p className="rec-explanation">{r.explanation}</p>
                <div className="rec-actions">
                  <button className="btn-outline" onClick={() => setShowWhy(showWhy === i ? null : i)}>{showWhy === i ? 'Hide' : 'Why this?'}</button>
                  <Link href="/learning-path" className="btn-outline">View Path</Link>
                </div>
                {showWhy === i && <WhyThisPanel rec={r} />}
                <FeedbackButtons skillId={r.skill_id} onFeedback={refresh} />
              </div>
            ))}
          </section>

          {gap && (
            <section className="dashboard-section">
              <h2 className="section-title">Skill Coverage — {gap.career_title}</h2>
              <div className="skill-coverage-bar">
                <div className="coverage-fill" style={{ width: `${gap.readiness_score}%` }} />
                <span className="coverage-text">{gap.readiness_score}% Ready</span>
              </div>
              <div className="skill-gaps-list">
                {gap.missing_skills.slice(0, 8).map((s, i) => <SkillGapBar key={i} name={s.name} acquired={false} />)}
                {gap.acquired_skills.map((s, i) => <SkillGapBar key={`a${i}`} name={s} acquired={true} />)}
              </div>
              {gap.avg_salary && <p className="gap-info">Average Salary: {gap.avg_salary} · Growth Rate: {gap.growth_rate}</p>}
            </section>
          )}
        </div>

        {path && (
          <section className="dashboard-section" style={{ marginTop: 24 }}>
            <h2 className="section-title">Learning Path Overview</h2>
            <div className="path-phases">
              {path.phases.map((phase, i) => (
                <div key={i} className="phase-card">
                  <div className="phase-header" style={{ borderBottom: 'none', padding: 0 }}>
                    <div className="phase-badge">Phase {phase.phase}</div>
                    <div><h3 className="phase-name">{phase.name}</h3><p className="phase-desc">{phase.description}</p></div>
                    <span className="phase-duration" style={{ marginLeft: 'auto' }}>{phase.duration_weeks} weeks</span>
                  </div>
                  <div className="phase-skills">
                    {phase.courses.slice(0, 6).map((c, j) => <span key={j} className="skill-tag">{c.title}</span>)}
                    {phase.courses.length > 6 && <span className="skill-tag more">+{phase.courses.length - 6} more</span>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Link href="/learning-path" className="btn btn-primary">View Full Learning Path</Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
