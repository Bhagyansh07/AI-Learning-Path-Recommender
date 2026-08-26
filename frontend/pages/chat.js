import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import NavBar from '../components/NavBar';
import { createProfile, getProfile, getRecommendations, getLearningPath, getSkillGaps } from '../lib/engine';
import { getSkillById, DOMAIN_NAMES } from '../lib/skillGraph';

const DOMAIN_COLORS = {
  programming: '#7c5cfc', web_development: '#34d399', data_science: '#fbbf24',
  machine_learning: '#c084fc', cloud_computing: '#22d3ee', cybersecurity: '#f87171',
  mobile_development: '#fb7185', math: '#9b80ff', mlops: '#2dd4bf',
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
    <div style={{ margin: '8px 0', padding: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, borderLeft: `3px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{rec.course.title}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{rec.course.provider} · {rec.course.duration_hours}h · {rec.course.level}</div>
        </div>
        <span style={{ padding: '3px 8px', borderRadius: 6, background: `color-mix(in srgb, ${color} 15%, transparent)`, color, fontSize: '0.75rem', fontWeight: 700 }}>{Math.round(rec.score * 100)}%</span>
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{rec.explanation}</div>
      {rec.why_this && <div style={{ marginTop: 6, padding: '6px 8px', background: 'var(--bg-3)', borderRadius: 6, fontSize: '0.7rem', color: 'var(--text-3)', lineHeight: 1.5 }}><strong style={{ color: 'var(--text-2)' }}>Why:</strong> {rec.why_this}</div>}
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
        <main className="container" style={{ paddingTop: 72, paddingBottom: 48 }}>
          <div className="empty-state">
            <h2>Welcome to LearnPath AI</h2>
            <p>Let's set up your profile to give you personalized recommendations.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
              <button className="btn btn-primary" onClick={() => setStep(0)}>Start Onboarding</button>
              <button className="btn btn-secondary" onClick={startChat}>Skip — Chat Freely</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (step >= 0 && step < ONBOARDING_STEPS.length) {
    const current = ONBOARDING_STEPS[step];
    const isMulti = current.multi;
    return (
      <div className="page-wrapper">
        <Head><title>Onboarding — LearnPath AI</title></Head>
        <NavBar active="chat" />
        <main className="container" style={{ paddingTop: 72, paddingBottom: 48 }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Step {step + 1} of {ONBOARDING_STEPS.length}</span>
                <span className="t-num" style={{ fontSize: '0.75rem', color: 'var(--accent-2)' }}>{Math.round(((step) / ONBOARDING_STEPS.length) * 100)}%</span>
              </div>
              <div style={{ height: 3, background: 'var(--bg-4)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(step / ONBOARDING_STEPS.length) * 100}%`, background: 'var(--accent)', borderRadius: 4, transition: 'width 0.3s ease' }} />
              </div>
            </div>
            <div className="onboarding-question">{current.q}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {current.opts.map((opt, i) => (
                <button key={i} className={`onboarding-option ${selectedSkills.includes(opt) ? 'selected' : ''}`} onClick={() => handleOnboardSelect(opt)} style={{ textAlign: 'left' }}>
                  {isMulti && <span style={{ marginRight: 8, fontSize: '0.75rem', color: 'var(--text-3)' }}>{selectedSkills.includes(opt) ? '●' : '○'}</span>}
                  {opt}
                </button>
              ))}
              {isMulti && <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => handleOnboardSelect('Done')}>Done</button>}
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
      <main className="container" style={{ paddingTop: 72, paddingBottom: 0, height: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 12px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>AI Learning Assistant</h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', margin: 0 }}>{profile ? `${profile.experience_level} · ${profile.interests.map(i => i.replace(/_/g, ' ')).join(', ')}` : 'Ask anything about learning'}</p>
          </div>
          <span className="badge badge-green">Online</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: 60 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>How can I help?</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginBottom: 16 }}>Ask about courses, skills, career paths, or learning strategies.</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                {quickActions.map((a, i) => <button key={i} className="btn btn-secondary btn-sm" onClick={() => { setInput(''); setMessages(prev => [...prev, { role: 'user', text: a.msg }]); setLoading(true); fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: a.msg, context: profile ? { level: profile.experience_level, interests: profile.interests, skills: profile.current_skills.map(s => typeof s === 'object' ? s.skill : s) } : null, mode: 'chat' }) }).then(r => r.json()).then(d => { addBotMessage(d.response || "I can help with that!"); setLoading(false); }).catch(() => { addBotMessage("Try again."); setLoading(false); }); }}>{a.label}</button>)}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ padding: '10px 16px', marginBottom: 8, borderRadius: 10, maxWidth: '80%', marginLeft: m.role === 'user' ? 'auto' : 0, marginRight: m.role === 'assistant' ? 'auto' : 0, background: m.role === 'user' ? 'var(--accent)' : 'var(--surface)', color: m.role === 'user' ? '#fff' : 'var(--text)', border: `1px solid ${m.role === 'user' ? 'var(--accent)' : 'var(--border)'}`, fontSize: '0.85rem', lineHeight: 1.6 }}>
              {typeof m.content === 'string' ? m.content : m.text}
              {m.recommendations && <div style={{ marginTop: 8 }}>{m.recommendations.map((rec, j) => <RecommendationCard key={j} rec={rec} />)}</div>}
            </div>
          ))}
          {loading && <div style={{ padding: '10px 16px', color: 'var(--text-3)', fontSize: '0.82rem' }}><TypingText text="Thinking..." /></div>}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: '12px 0 20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type your message..." style={{ flex: 1 }} disabled={loading} />
            <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()}>Send</button>
          </div>
        </div>
      </main>
    </div>
  );
}
