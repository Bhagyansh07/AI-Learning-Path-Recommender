import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getProfile, getLearningPath, getSkillGaps, submitFeedback } from '../lib/engine';

const NavBar = ({ active }) => (
  <nav className="navbar">
    <div className="container navbar-inner">
      <div className="navbar-brand">
        <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'white' }}>LP</div>
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

const FEEDBACK_OPTS = [
  { value: 'easy', label: 'Too Easy', color: '#22c55e' },
  { value: 'good', label: 'Just Right', color: '#3b82f6' },
  { value: 'hard', label: 'Too Hard', color: '#ef4444' },
];

function SkillCard({ skill, index }) {
  const [showWhy, setShowWhy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleFeedback = (val) => {
    setFeedback(val);
    submitFeedback(skill.skill_id, val, skill.duration_hours);
  };

  return (
    <div className={`skill-card ${skill.completed ? 'completed' : ''}`}>
      <div className="skill-card-number">{index + 1}</div>
      <div className="skill-card-content">
        <h4 className="skill-card-title">{skill.title}</h4>
        <div className="skill-card-meta">
          <span>{skill.provider}</span>
          <span>·</span>
          <span>{skill.duration_hours}h</span>
          <span>·</span>
          <span className={`level-badge ${skill.level}`}>{skill.level}</span>
        </div>
        <div className="skill-card-actions">
          <button className="btn-xs btn-outline" onClick={() => setShowWhy(!showWhy)}>
            {showWhy ? 'Hide' : 'Why this?'}
          </button>
          {!feedback && !skill.completed && (
            <div className="feedback-inline">
              {FEEDBACK_OPTS.map(o => (
                <button key={o.value} className="feedback-btn-sm" style={{ borderColor: o.color, color: o.color }} onClick={() => handleFeedback(o.value)}>{o.label}</button>
              ))}
            </div>
          )}
          {feedback && <span className="feedback-thanks-sm">Thanks!</span>}
        </div>
        {showWhy && (
          <div className="why-panel">
            <p><strong>Why this skill:</strong> {skill.explanation || 'Recommended for your learning path.'}</p>
            {skill.prerequisites?.length > 0 && (
              <p><strong>Prerequisites:</strong> {skill.prerequisites.join(', ')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LearningPath() {
  const [path, setPath] = useState(null);
  const [gap, setGap] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = getProfile();
    setProfile(p);
    if (p) {
      setPath(getLearningPath(p));
      setGap(getSkillGaps(p));
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="page-wrapper"><NavBar active="path" /><main className="container" style={{ paddingTop: 64 }}><div className="loading-text">Loading...</div></main></div>;

  if (!profile || !path) return (
    <div className="page-wrapper">
      <Head><title>Learning Path — LearnPath AI</title></Head>
      <NavBar active="path" />
      <main className="container" style={{ paddingTop: 64 }}>
        <div className="empty-state">
          <h2>No learning path yet</h2>
          <p>Complete the AI assistant onboarding to generate your personalized path.</p>
          <Link href="/chat" className="btn btn-primary">Start AI Assistant</Link>
        </div>
      </main>
    </div>
  );

  return (
    <div className="page-wrapper">
      <Head><title>My Learning Path — LearnPath AI</title></Head>
      <NavBar active="path" />
      <main className="container" style={{ paddingTop: 64, paddingBottom: 40 }}>
        <div className="path-header">
          <div>
            <h1 className="page-title">My Learning Path</h1>
            <p className="page-subtitle">{gap?.career_title || 'Personalized'} — {path.total_courses} skills · ~{path.estimated_weeks} weeks · {path.estimated_hours}h total</p>
          </div>
          {gap && (
            <div className="readiness-badge">
              <div className="readiness-circle">
                <span className="readiness-value">{gap.readiness_score}%</span>
              </div>
              <span className="readiness-label">Ready</span>
            </div>
          )}
        </div>

        {/* Milestones */}
        {path.milestones && path.milestones.length > 0 && (
          <div className="milestones-bar">
            {path.milestones.map((m, i) => (
              <div key={i} className={`milestone ${m.type}`}>
                <div className="milestone-dot" />
                <span className="milestone-text">{m.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* Phases */}
        <div className="path-phases">
          {path.phases.map((phase, i) => (
            <div key={i} className="phase-section">
              <div className="phase-header">
                <div className="phase-badge">Phase {phase.phase}</div>
                <div>
                  <h2 className="phase-title">{phase.name}</h2>
                  <p className="phase-desc">{phase.description} — {phase.duration_weeks} weeks</p>
                </div>
              </div>
              <div className="skills-list">
                {phase.courses.map((skill, j) => (
                  <SkillCard key={j} skill={skill} index={j} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {path.phases.length === 0 && (
          <div className="empty-state">
            <h3>No skills to learn</h3>
            <p>Your profile matches the target career path. Try exploring advanced topics.</p>
          </div>
        )}
      </main>
    </div>
  );
}
