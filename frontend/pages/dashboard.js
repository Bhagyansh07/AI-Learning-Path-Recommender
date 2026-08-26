import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import NavBar from '../components/NavBar';
import ExplanationModal from '../components/ExplanationModal';
import { getProfile, getRecommendations, getLearningPath, getSkillGaps, getDemoProfiles, submitFeedback, createProfile } from '../lib/engine';
import { getSkillById, SKILL_DEMAND, DOMAIN_NAMES } from '../lib/skillGraph';

const FEEDBACK_OPTIONS = [
  { value: 'easy', label: 'Too Easy', color: '#22c55e' },
  { value: 'good', label: 'Just Right', color: '#3b82f6' },
  { value: 'hard', label: 'Too Hard', color: '#ef4444' },
];

const DOMAIN_COLORS = {
  programming: '#3b82f6', web_development: '#8b5cf6', data_science: '#06b6d4',
  machine_learning: '#f59e0b', cloud_computing: '#10b981', cybersecurity: '#ef4444',
  mobile_development: '#ec4899', math: '#6366f1', mlops: '#f97316',
};

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

function ScoringBreakdown({ recs }) {
  const factors = [
    { key: 'skill_gap', label: 'Skill Gap', weight: '35%', color: '#3b82f6' },
    { key: 'career_relevance', label: 'Career', weight: '25%', color: '#8b5cf6' },
    { key: 'ml_similarity', label: 'Demand', weight: '20%', color: '#06b6d4' },
    { key: 'difficulty_fit', label: 'Difficulty', weight: '10%', color: '#10b981' },
    { key: 'prerequisite_fit', label: 'Prereqs', weight: '10%', color: '#f59e0b' },
  ];

  if (!recs.length) return null;

  return (
    <div style={{ padding: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Scoring Breakdown</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>How each recommendation is scored</p>
        </div>
        <Link href="/algorithm" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>See Algorithm →</Link>
      </div>

      {recs.slice(0, 3).map((rec, ri) => (
        <div key={ri} style={{ marginBottom: ri < 2 ? 14 : 0, padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{rec.course.title}</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>{Math.round(rec.score * 100)}%</span>
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            {factors.map(f => {
              const val = rec.breakdown?.[f.key] || 0;
              return (
                <div key={f.key} style={{ flex: 1, position: 'relative' }} title={`${f.label}: ${Math.round(val * 100)}%`}>
                  <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${val * 100}%`, background: f.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
            {factors.map(f => (
              <div key={f.key} style={{ flex: 1, textAlign: 'center' }}>
                <span style={{ fontSize: '0.55rem', color: f.color, fontWeight: 600 }}>{Math.round((rec.breakdown?.[f.key] || 0) * 100)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'center' }}>
        {factors.map(f => (
          <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            <div style={{ width: 6, height: 6, borderRadius: 2, background: f.color, flexShrink: 0 }} />
            {f.label} {f.weight}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectsTracker({ profile, path }) {
  const completedSet = new Set(profile?.completed_courses || []);
  const allSkills = useMemo(() => {
    if (!path) return [];
    return path.phases.flatMap(ph => ph.courses.map(c => {
      const skillData = getSkillById(c.skill_id);
      const project = skillData?.resources?.find(r => r.type === 'project');
      return { ...c, project, completed: completedSet.has(c.skill_id) };
    })).filter(s => s.project);
  }, [path, completedSet]);

  const completedProjects = allSkills.filter(s => s.completed).length;

  return (
    <div style={{ padding: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Projects & Assessments</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{completedProjects}/{allSkills.length} projects completed</p>
        </div>
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <div style={{ width: 80, height: 5, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${allSkills.length ? (completedProjects / allSkills.length) * 100 : 0}%`, background: 'var(--skill-acquired)', borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--skill-acquired)' }}>{allSkills.length ? Math.round((completedProjects / allSkills.length) * 100) : 0}%</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
        {allSkills.slice(0, 12).map((s, i) => (
          <div key={i} style={{ padding: '10px 12px', background: s.completed ? 'rgba(5,150,105,0.04)' : 'var(--bg-secondary)', borderRadius: 8, border: '1px solid ' + (s.completed ? 'rgba(5,150,105,0.15)' : 'var(--border)'), opacity: s.completed ? 0.7 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)' }}>{s.project.title}</span>
              {s.completed && <span style={{ fontSize: '0.65rem', color: 'var(--skill-acquired)', fontWeight: 600 }}>✓</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              <span style={{ padding: '1px 4px', borderRadius: 3, background: 'var(--primary-subtle)', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>Project</span>
              <span style={{ color: DOMAIN_COLORS[s.domain] || 'var(--text-muted)' }}>{DOMAIN_NAMES[s.domain] || s.domain}</span>
              <span>· Level {s.project.difficulty || 1}</span>
            </div>
          </div>
        ))}
      </div>
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

        <NextActionCard profile={profile} recs={recs} />

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-value">{path ? path.total_courses : 0}</div><div className="stat-label">Skills to Learn</div></div>
          <div className="stat-card"><div className="stat-value">{path ? path.estimated_weeks : 0}w</div><div className="stat-label">Est. Duration</div></div>
          <div className="stat-card"><div className="stat-value">{gap ? gap.readiness_score : 0}%</div><div className="stat-label">Career Readiness</div></div>
          <div className="stat-card"><div className="stat-value">{profile.completed_courses?.length || 0}</div><div className="stat-label">Completed</div></div>
        </div>

        {path && <ProgressChart path={path} profile={profile} />}

        <ScoringBreakdown recs={recs} />

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
                {showWhy === i && <ExplanationModal skill={r} profile={profile} isOpen={true} onClose={() => setShowWhy(null)} />}
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

        <ProjectsTracker profile={profile} path={path} />

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
