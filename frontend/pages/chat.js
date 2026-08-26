import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import NavBar from '../components/NavBar';
import { createProfile, getProfile, getRecommendations, getLearningPath, getSkillGaps } from '../lib/engine';
import { getSkillById, DOMAIN_NAMES } from '../lib/skillGraph';

const DOMAIN_COLORS = {
  programming: 'var(--purple)',
  web_development: 'var(--green)',
  data_science: 'var(--amber)',
  machine_learning: 'var(--purple)',
  cloud_computing: 'var(--cyan)',
  cybersecurity: 'var(--red)',
  mobile_development: '#fb7185',
  math: '#9b80ff',
  mlops: 'var(--green)',
};

const ONBOARDING_STEPS = [
  { q: 'What field or career are you interested in?', field: 'primary_interest', opts: ['Data Science & Analytics', 'Web Development', 'Machine Learning & AI', 'Cloud Computing & DevOps', 'Cybersecurity', 'Mobile Development', 'Software Engineering'] },
  { q: "What's your current experience level?", field: 'experience_level', opts: ['Beginner (New to the field)', 'Intermediate (Some experience)', 'Advanced (Experienced professional)'] },
  { q: 'How much time can you dedicate per week?', field: 'time_commitment', opts: ['Less than 5 hours', '5-10 hours', '10-20 hours', 'More than 20 hours'] },
  { q: "What's your primary goal?", field: 'career_goal', opts: ['Career change to tech', 'Get a promotion', 'Start freelancing', 'Build personal projects', 'Academic/research', 'Just learning for fun'] },
  { q: 'What skills do you already know?\n\nClick the skill buttons below to select, then click "Done".', field: 'current_skills', opts: ['Python', 'JavaScript', 'HTML & CSS', 'React', 'SQL', 'Git', 'Java', 'C++', 'None — complete beginner'], multi: true },
];

function buildProfile(data) {
  const levelMap = { 'Beginner': 'beginner', 'Intermediate': 'intermediate', 'Advanced': 'advanced' };
  const lvl = Object.entries(levelMap).find(([k]) => (data.experience_level || '').includes(k));
  const level = lvl ? lvl[1] : 'beginner';
  const map = { 'Data Science & Analytics': 'data_science', 'Web Development': 'web_development', 'Machine Learning & AI': 'machine_learning', 'Cloud Computing & DevOps': 'cloud_computing', 'Cybersecurity': 'cybersecurity', 'Mobile Development': 'mobile_development', 'Software Engineering': 'programming' };
  const interests = [data.primary_interest || 'programming'].map(i => map[i] || i.toLowerCase().replace(/\s+/g, '_'));
  const skillMap = { 'Python': 'python-basics', 'JavaScript': 'javascript-basics', 'HTML & CSS': 'html-css', 'React': 'react-basics', 'SQL': 'sql-databases', 'Git': 'git-version-control', 'Java': 'java-basics', 'C++': 'data-structures-algorithms' };
  const SKIP = new Set(['None — complete beginner', 'Done']);
  const currentSkills = (Array.isArray(data.current_skills) ? data.current_skills : [data.current_skills])
    .filter(s => s && !SKIP.has(s))
    .map(s => skillMap[s] || s.toLowerCase().replace(/\s+/g, '-'))
    .filter(Boolean);
  return createProfile({ name: 'Learner', interests, experience_level: level, time_commitment: data.time_commitment || '5-10 hours', career_goals: [data.career_goal || 'career change to tech'], current_skills: currentSkills.map(s => ({ skill: s })) });
}

function formatProfileSummary(profile, path) {
  if (!profile) return '';
  const skills = profile.current_skills.map(s => typeof s === 'object' ? s.skill : s);
  const lines = [`Level: ${profile.experience_level}`, `Interests: ${profile.interests.map(i => i.replace(/_/g, ' ')).join(', ')}`, `Current skills: ${skills.join(', ') || 'None yet'}`];
  if (path) lines.push(`Path: ${path.total_skills} skills across ${path.phases.length} phases (~${path.estimated_weeks} weeks)`);
  return lines.join('\n');
}

function getNextAction(profile) {
  try {
    const recs = getRecommendations(profile, 1);
    if (recs.length > 0) return `Start with: ${recs[0].course.title} (${recs[0].course.duration_hours}h)`;
  } catch {}
  return 'Check your learning path for next steps.';
}

function TypingText({ text, speed = 12, onDone }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(''); setDone(false); let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i >= text.length) { setDisplayed(text); setDone(true); clearInterval(interval); onDone?.(); return; }
      setDisplayed(text.substring(0, i));
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return <span style={{ whiteSpace: 'pre-wrap' }}>{displayed}{!done && <span className="typing-cursor">|</span>}</span>;
}

function RecommendationCard({ rec }) {
  const skill = getSkillById(rec.skill_id);
  const domain = skill?.domain || 'programming';
  const color = DOMAIN_COLORS[domain] || 'var(--text-3)';
  return (
    <div className="rec-card" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="rec-header">
        <div>
          <div className="rec-title">{rec.course.title}</div>
          <div className="rec-meta">{rec.course.provider} · {rec.course.duration_hours}h · {rec.course.level}</div>
        </div>
        <span className="rec-score">{Math.round(rec.score * 100)}%</span>
      </div>
      <div className="rec-explanation">{rec.explanation}</div>
      {rec.why_this && (
        <div style={{ marginTop: 8, padding: '8px 10px', background: 'var(--bg-3)', borderRadius: 'var(--r-sm)', fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--text-2)' }}>Why:</strong> {rec.why_this}
        </div>
      )}
    </div>
  );
}

export default function Chat() {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState({});
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [onboardComplete, setOnboardComplete] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, step]);

  useEffect(() => {
    const p = getProfile();
    if (p) { setProfile(p); setOnboardComplete(true); }
  }, []);

  const addBotMessage = useCallback((text, extra = {}) => {
    setMessages(prev => [...prev, { role: 'assistant', text, ...extra }]);
  }, []);

  const finishOnboarding = useCallback(() => {
    const p = buildProfile(answers);
    setProfile(p);
    setOnboardComplete(true);
    const path = getLearningPath(p);
    const summary = formatProfileSummary(p, path);
    const nextAction = getNextAction(p);
    addBotMessage(`Profile created!\n\n${summary}\n\nNext step: ${nextAction}\n\nYou can now ask me anything about your learning journey, or visit the Dashboard for a detailed view.`);
    setStep(-1);
  }, [answers, addBotMessage]);

  const handleSkillToggle = (skill) => {
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const handleOnboardSelect = (value) => {
    const currentField = ONBOARDING_STEPS[step]?.field;
    if (ONBOARDING_STEPS[step]?.multi) {
      if (value === 'Done') {
        setAnswers(prev => ({ ...prev, [currentField]: selectedSkills.length > 0 ? selectedSkills : ['None — complete beginner'] }));
        setSelectedSkills([]);
        if (step < ONBOARDING_STEPS.length - 1) setStep(step + 1);
        else finishOnboarding();
      } else {
        handleSkillToggle(value);
      }
    } else {
      setAnswers(prev => ({ ...prev, [currentField]: value }));
      if (step < ONBOARDING_STEPS.length - 1) setStep(step + 1);
      else finishOnboarding();
    }
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);
    try {
      const profileData = profile ? { level: profile.experience_level, interests: profile.interests, skills: profile.current_skills.map(s => typeof s === 'object' ? s.skill : s) } : null;
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, context: profileData, mode: 'chat' }),
      });
      const data = await res.json();
      const reply = data.response || data.explanation || "I'm not sure how to respond. Try asking about courses, skills, or career paths.";
      addBotMessage(reply);
    } catch {
      addBotMessage("I couldn't process that right now. Please try again.");
    }
    setLoading(false);
  };

  const startChat = () => {
    setOnboardComplete(true);
    addBotMessage("Hi! I'm LearnPath AI. Ask me anything about your learning journey — courses, skills, career paths, or learning strategies.");
  };

  const quickActions = [
    { label: 'Recommend courses', msg: 'Recommend courses for me' },
    { label: 'My skill gaps', msg: 'What are my skill gaps?' },
    { label: 'Career advice', msg: 'What career path suits me?' },
  ];

  if (!onboardComplete && step === -1) {
    return (
      <div className="page-wrapper">
        <Head><title>AI Assistant — LearnPath AI</title></Head>
        <NavBar active="chat" />
        <main className="container" style={{ paddingTop: 72, paddingBottom: 48, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: 480 }}>
            <div style={{ width: 56, height: 56, borderRadius: 'var(--r-lg)', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '1.4rem' }}>
              <span style={{ color: '#fff', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>LP</span>
            </div>
            <span className="t-label" style={{ display: 'block', marginBottom: 12 }}>LearnPath AI</span>
            <h1 className="t-heading" style={{ marginBottom: 8 }}>Your AI Learning Assistant</h1>
            <p className="t-small" style={{ color: 'var(--text-3)', marginBottom: 32, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>
              Get personalized course recommendations, skill assessments, and career guidance powered by AI.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => setStep(0)} style={{ padding: '12px 28px', fontSize: '0.88rem' }}>
                Start Onboarding
              </button>
              <button className="btn btn-secondary" onClick={startChat} style={{ padding: '12px 28px', fontSize: '0.88rem' }}>
                Skip — Chat Freely
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (step >= 0 && step < ONBOARDING_STEPS.length) {
    const current = ONBOARDING_STEPS[step];
    const isMulti = current.multi;
    const progress = ((step + 1) / ONBOARDING_STEPS.length) * 100;
    return (
      <div className="page-wrapper">
        <Head><title>Onboarding — LearnPath AI</title></Head>
        <NavBar active="chat" />
        <main className="container" style={{ paddingTop: 72, paddingBottom: 48, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 560, width: '100%' }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span className="t-label">Step {step + 1} of {ONBOARDING_STEPS.length}</span>
                <span className="t-num" style={{ fontSize: '0.75rem', color: 'var(--accent-2)' }}>{Math.round(progress)}%</span>
              </div>
              <div className="skill-coverage-bar" style={{ height: 4 }}>
                <div className="coverage-fill" style={{ width: `${progress}%`, height: '100%', borderRadius: 4 }} />
              </div>
            </div>
            <div className="onboarding-question">{current.q}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {current.opts.map((opt, i) => (
                <button
                  key={i}
                  className={`onboarding-option${selectedSkills.includes(opt) ? ' selected' : ''}`}
                  onClick={() => handleOnboardSelect(opt)}
                >
                  {isMulti && (
                    <span style={{ width: 18, height: 18, borderRadius: 'var(--r-sm)', border: `2px solid ${selectedSkills.includes(opt) ? 'var(--accent)' : 'var(--border-3)'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: 10, flexShrink: 0, background: selectedSkills.includes(opt) ? 'var(--accent)' : 'transparent', transition: 'all 0.12s' }}>
                      {selectedSkills.includes(opt) && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      )}
                    </span>
                  )}
                  {opt}
                </button>
              ))}
              {isMulti && (
                <button
                  className="btn btn-primary"
                  style={{ marginTop: 8, width: '100%', padding: '12px 20px' }}
                  onClick={() => handleOnboardSelect('Done')}
                >
                  Done — Continue
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Head><title>AI Assistant — LearnPath AI</title></Head>
      <NavBar active="chat" />
      <main className="container" style={{ paddingTop: 52, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 14px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a7 7 0 0 1 7 7v1a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/>
                <path d="M9 17v1a3 3 0 0 0 6 0v-1"/>
                <circle cx="12" cy="9" r="1" fill="var(--accent-2)"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>AI Learning Assistant</h1>
              <p className="t-tiny" style={{ color: 'var(--text-3)', margin: 0 }}>
                {profile ? `${profile.experience_level} · ${profile.interests.map(i => i.replace(/_/g, ' ')).join(', ')}` : 'Ask anything about learning'}
              </p>
            </div>
          </div>
          <span className="badge badge-green">Online</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--r-lg)', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 6, letterSpacing: '-0.01em' }}>How can I help?</h2>
              <p className="t-small" style={{ color: 'var(--text-3)', marginBottom: 20, maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>
                Ask about courses, skills, career paths, or learning strategies.
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 420, margin: '0 auto' }}>
                {quickActions.map((a, i) => (
                  <button
                    key={i}
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setInput('');
                      setMessages(prev => [...prev, { role: 'user', text: a.msg }]);
                      setLoading(true);
                      fetch('/api/gemini', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: a.msg, context: profile ? { level: profile.experience_level, interests: profile.interests, skills: profile.current_skills.map(s => typeof s === 'object' ? s.skill : s) } : null, mode: 'chat' }),
                      }).then(r => r.json()).then(d => { addBotMessage(d.response || "I can help with that!"); setLoading(false); }).catch(() => { addBotMessage("Try again."); setLoading(false); });
                    }}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12, paddingLeft: m.role === 'assistant' ? 0 : 48, paddingRight: m.role === 'user' ? 0 : 48 }}>
              {m.role === 'assistant' && (
                <div style={{ width: 28, height: 28, borderRadius: 'var(--r-sm)', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 2, flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a7 7 0 0 1 7 7v1a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/>
                    <circle cx="12" cy="9" r="1" fill="var(--accent-2)"/>
                  </svg>
                </div>
              )}
              <div style={{
                padding: '10px 14px',
                borderRadius: m.role === 'user' ? 'var(--r-lg) var(--r-lg) 4px var(--r-lg)' : 'var(--r-lg) var(--r-lg) var(--r-lg) 4px',
                maxWidth: '75%',
                background: m.role === 'user' ? 'var(--accent)' : 'var(--surface)',
                border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                fontSize: '0.85rem',
                lineHeight: 1.65,
                color: m.role === 'user' ? '#fff' : 'var(--text)',
              }}>
                {typeof m.content === 'string' ? m.content : m.text}
                {m.recommendations && <div style={{ marginTop: 10 }}>{m.recommendations.map((rec, j) => <RecommendationCard key={j} rec={rec} />)}</div>}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-start', paddingLeft: 48, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 'var(--r-sm)', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 2, flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a7 7 0 0 1 7 7v1a7 7 0 0 1-14 0V9a7 7 0 0 1 7-7z"/>
                  <circle cx="12" cy="9" r="1" fill="var(--accent-2)"/>
                </svg>
              </div>
              <div style={{ padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg) var(--r-lg) var(--r-lg) 4px', color: 'var(--text-3)', fontSize: '0.85rem' }}>
                <TypingText text="Thinking..." />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: '14px 0 18px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              className="form-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Type your message..."
              style={{ flex: 1, padding: '11px 14px' }}
              disabled={loading}
            />
            <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()} style={{ padding: '11px 20px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}