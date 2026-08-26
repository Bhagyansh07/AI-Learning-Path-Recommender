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
  const [toast, setToast] = useState(null);
  const handle = (val) => {
    setGiven(val);
    submitFeedback(skillId, val, 0);
    const msgs = { easy: 'Advanced project added to your path.', good: 'Great progress! Keep going.', hard: 'Foundational warm-up added before this skill.' };
    setToast(msgs[val]);
    setTimeout(() => setToast(null), 3000);
    onFeedback?.();
  };
  if (given) return <div className="feedback-thanks">Thanks for your feedback!</div>;
  return (
    <>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--primary)', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600, zIndex: 9999, boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.2s ease' }}>{toast}</div>}
      <div className="feedback-buttons">
        <span className="feedback-label">How was this?</span>
        {FEEDBACK_OPTIONS.map(o => <button key={o.value} className="feedback-btn" style={{ borderColor: o.color, color: o.color }} onClick={() => handle(o.value)}>{o.label}</button>)}
      </div>
    </>
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

function ProgressChart({ path, profile }) {
  const phases = path?.phases || [];
  const completedSet = new Set(profile?.completed_courses || []);
  const allPathSkillIds = phases.flatMap(ph => ph.courses.map(c => c.skill_id));
  const total = allPathSkillIds.length || 1;
  const completed = allPathSkillIds.filter(id => completedSet.has(id)).length;
  const pct = Math.min(Math.round((completed / total) * 100), 100);
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
      <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--bg-tertiary)" strokeWidth="6" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--primary)" strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>{pct}%</div>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Progress Overview</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {phases.map((p, i) => {
            const phaseCompleted = p.courses.filter(c => completedSet.has(c.skill_id)).length;
            const phasePct = Math.round((phaseCompleted / Math.max(p.courses.length, 1)) * 100);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: 80, flexShrink: 0 }}>Phase {p.phase}</span>
                <div style={{ flex: 1, height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${phasePct}%`, background: 'var(--primary)', borderRadius: 3, transition: 'width 0.5s ease' }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: 30, textAlign: 'right' }}>{phaseCompleted}/{p.courses.length}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NextActionCard({ profile, recs }) {
  if (!recs.length) return null;
  const top = recs[0];
  return (
    <div style={{ padding: 20, background: 'var(--primary-subtle)', border: '1px solid var(--primary)', borderRadius: 12, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: '1.2rem' }}>🎯</span>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>Next Recommended Action</h3>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{top.course.title}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{top.course.provider} · {top.course.duration_hours}h · {top.course.level}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{Math.round(top.score * 100)}%</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>match</div>
        </div>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>{top.explanation}</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <Link href="/learning-path" className="btn btn-primary btn-sm">Start Learning</Link>
        <Link href="/chat" className="btn btn-secondary btn-sm">Ask AI Assistant</Link>
      </div>
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
    if (p) {
      setRecs(getRecommendations(p, 5));
      setPath(getLearningPath(p));
      setGap(getSkillGaps(p));
    } else setDemoprofiles(getDemoProfiles());
    setLoading(false);
  }, []);

  const refresh = () => {
    const p = getProfile();
    if (p) {
      setProfile(p);
      setRecs(getRecommendations(p, 5));
      setPath(getLearningPath(p));
      setGap(getSkillGaps(p));
    }
  };

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

        {/* Next Action */}
        <NextActionCard profile={profile} recs={recs} />

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-value">{path ? path.total_courses : 0}</div><div className="stat-label">Skills to Learn</div></div>
          <div className="stat-card"><div className="stat-value">{path ? path.estimated_weeks : 0}w</div><div className="stat-label">Est. Duration</div></div>
          <div className="stat-card"><div className="stat-value">{gap ? gap.readiness_score : 0}%</div><div className="stat-label">Career Readiness</div></div>
          <div className="stat-card"><div className="stat-value">{profile.completed_courses?.length || 0}</div><div className="stat-label">Completed</div></div>
        </div>

        {path && <ProgressChart path={path} profile={profile} />}

        <div className="dashboard-grid" style={{ marginTop: 24 }}>
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
