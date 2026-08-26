import { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import NavBar from '../components/NavBar';
import ExplanationModal from '../components/ExplanationModal';
import { getProfile, getLearningPath, getSkillGaps, submitFeedback, getRecommendations } from '../lib/engine';

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--primary)', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600, zIndex: 9999, boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.2s ease' }}>{msg}</div>;
}

function SkillCard({ skill, index, onFeedback, profile }) {
  const [showWhy, setShowWhy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [completed, setCompleted] = useState(skill.completed);
  const [toast, setToast] = useState(null);

  const handleFeedback = (val) => {
    setFeedback(val);
    setCompleted(true);
    submitFeedback(skill.skill_id, val, skill.duration_hours);
    const msgs = {
      easy: `"${skill.title}" marked complete. Advanced project added to your path.`,
      good: `"${skill.title}" marked complete. Great progress!`,
      hard: `"${skill.title}" marked complete. Foundational warm-up added before this skill.`,
    };
    setToast(msgs[val]);
    onFeedback?.();
  };

  return (
    <div className={`skill-card ${completed ? 'completed' : ''}`}>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
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
          <button className="btn-outline" style={{ fontSize: '0.75rem', padding: '3px 8px' }} onClick={() => setShowWhy(true)}>Why this?</button>
          {!feedback && !completed && (
            <div className="feedback-inline">
              <button className="feedback-btn-sm" style={{ borderColor: '#22c55e', color: '#22c55e' }} onClick={() => handleFeedback('easy')}>Too Easy</button>
              <button className="feedback-btn-sm" style={{ borderColor: '#3b82f6', color: '#3b82f6' }} onClick={() => handleFeedback('good')}>Just Right</button>
              <button className="feedback-btn-sm" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleFeedback('hard')}>Too Hard</button>
            </div>
          )}
          {completed && <span className="feedback-thanks-sm">{feedback ? 'Completed ✓' : 'Completed'}</span>}
        </div>
      </div>
      <ExplanationModal skill={skill} profile={profile} isOpen={showWhy} onClose={() => setShowWhy(false)} />
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
    if (allPathSkillIds.length === 0) return { completed: 0, total: 0, pct: 0 };
    const completed = allPathSkillIds.filter(id => completedSet.has(id)).length;
    return { completed, total: allPathSkillIds.length, pct: Math.min(Math.round((completed / allPathSkillIds.length) * 100), 100) };
  }, [path, profile]);

  if (loading) return <div className="page-wrapper"><NavBar active="path" /><main className="container" style={{ paddingTop: 64 }}><div className="loading-text">Loading...</div></main></div>;

  if (!profile || !path || path.phases.length === 0) return (
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

  const totalSkills = progress.total;
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
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{totalSkills - progress.completed}</div>
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
                  {phase.courses.map((skill, j) => <SkillCard key={skill.skill_id || j} skill={skill} index={j} onFeedback={refresh} profile={profile} />)}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
