import { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import NavBar from '../components/NavBar';
import { getProfile, getLearningPath, getSkillGaps, submitFeedback } from '../lib/engine';

function SkillCard({ skill, index, onFeedback }) {
  const [showWhy, setShowWhy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [completed, setCompleted] = useState(skill.completed);

  const handleFeedback = (val) => {
    setFeedback(val);
    setCompleted(true);
    submitFeedback(skill.skill_id, val, skill.duration_hours);
    onFeedback?.();
  };

  return (
    <div className={`skill-card ${completed ? 'completed' : ''}`}>
      <div className="skill-card-number" style={completed ? { background: 'rgba(5,150,105,0.1)', color: 'var(--skill-acquired)' } : {}}>
        {completed ? '✓' : index + 1}
      </div>
      <div className="skill-card-content">
        <h4 className="skill-card-title" style={completed ? { textDecoration: 'line-through', opacity: 0.6 } : {}}>{skill.title}</h4>
        <div className="skill-card-meta">
          <span>{skill.provider}</span><span>·</span><span>{skill.duration_hours}h</span><span>·</span>
          <span className={`level-badge ${skill.level}`}>{skill.level}</span>
        </div>
        <div className="skill-card-actions">
          <button className="btn-outline" style={{ fontSize: '0.75rem', padding: '3px 8px' }} onClick={() => setShowWhy(!showWhy)}>{showWhy ? 'Hide' : 'Why this?'}</button>
          {!feedback && !completed && (
            <div className="feedback-inline">
              <button className="feedback-btn-sm" style={{ borderColor: '#22c55e', color: '#22c55e' }} onClick={() => handleFeedback('easy')}>Too Easy</button>
              <button className="feedback-btn-sm" style={{ borderColor: '#3b82f6', color: '#3b82f6' }} onClick={() => handleFeedback('good')}>Just Right</button>
              <button className="feedback-btn-sm" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleFeedback('hard')}>Too Hard</button>
            </div>
          )}
          {completed && <span className="feedback-thanks-sm">{feedback ? 'Thanks!' : 'Completed'}</span>}
        </div>
        {showWhy && (
          <div className="why-panel">
            <p><strong>Why this skill:</strong> {skill.explanation || 'Recommended for your learning path.'}</p>
            {skill.prerequisites?.length > 0 && <p><strong>Prerequisites:</strong> {skill.prerequisites.join(', ')}</p>}
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
  const [, forceUpdate] = useState(0);

  const refresh = useCallback(() => {
    const p = getProfile();
    if (p) {
      setProfile(p);
      setPath(getLearningPath(p));
      setGap(getSkillGaps(p));
      forceUpdate(n => n + 1);
    }
  }, []);

  useEffect(() => { refresh(); setLoading(false); }, [refresh]);

  const progress = useMemo(() => {
    if (!path || !profile) return { completed: 0, total: 1, pct: 0 };
    const completedSet = new Set(profile.completed_courses || []);
    const allPathSkillIds = path.phases.flatMap(ph => ph.courses.map(c => c.skill_id));
    const total = allPathSkillIds.length || 1;
    const completed = allPathSkillIds.filter(id => completedSet.has(id)).length;
    return { completed, total, pct: Math.min(Math.round((completed / total) * 100), 100) };
  }, [path, profile]);

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

  const totalSkills = path.total_courses || 1;
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (progress.pct / 100) * circumference;

  return (
    <div className="page-wrapper">
      <Head><title>My Learning Path — LearnPath AI</title></Head>
      <NavBar active="path" />
      <main className="container" style={{ paddingTop: 64, paddingBottom: 40 }}>
        <div className="path-header">
          <div>
            <h1 className="page-title">My Learning Path</h1>
            <p className="page-subtitle">{gap?.career_title || 'Personalized'} — {totalSkills} skills · ~{path.estimated_weeks} weeks · {path.estimated_hours}h total</p>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
              <svg width="80" height="80" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--bg-tertiary)" strokeWidth="6" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--primary)" strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>{progress.pct}%</div>
              </div>
            </div>
            {gap && (
              <div className="readiness-badge">
                <div className="readiness-circle"><span className="readiness-value">{gap.readiness_score}%</span></div>
                <span className="readiness-label">Ready</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>{progress.completed}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed</div>
          </div>
          <div style={{ flex: 1, padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{progress.total - progress.completed}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Remaining</div>
          </div>
          <div style={{ flex: 1, padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{path.estimated_weeks}w</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Duration</div>
          </div>
        </div>

        {path.milestones?.length > 0 && path.milestones.length <= 10 && (
          <div className="milestones-bar">
            {path.milestones.map((m, i) => (
              <div key={i} className={`milestone ${m.type}`}><div className="milestone-dot" /><span className="milestone-text">{m.title}</span></div>
            ))}
          </div>
        )}

        <div className="path-phases">
          {path.phases.map((phase, i) => {
            const completedSet = new Set(profile?.completed_courses || []);
            const phaseCompleted = phase.courses.filter(c => completedSet.has(c.skill_id)).length;
            const phasePct = Math.round((phaseCompleted / Math.max(phase.courses.length, 1)) * 100);
            return (
              <div key={i} className="phase-section">
                <div className="phase-header">
                  <div className="phase-badge">Phase {phase.phase}</div>
                  <div style={{ flex: 1 }}>
                    <h2 className="phase-title">{phase.name}</h2>
                    <p className="phase-desc">{phase.description} — {phase.duration_weeks} weeks</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <div style={{ flex: 1, height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${phasePct}%`, background: 'var(--primary)', borderRadius: 2, transition: 'width 0.4s ease' }} />
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{phaseCompleted}/{phase.courses.length}</span>
                    </div>
                  </div>
                </div>
                <div className="skills-list">
                  {phase.courses.map((skill, j) => <SkillCard key={skill.skill_id || j} skill={skill} index={j} onFeedback={refresh} />)}
                </div>
              </div>
            );
          })}
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
