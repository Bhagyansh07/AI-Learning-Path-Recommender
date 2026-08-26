import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { createProfile, getProfile, getRecommendations, getLearningPath, getSkillGaps, analyzeText } from '../lib/engine';

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

const ONBOARDING_STEPS = [
  { q: 'What field or career are you interested in?', field: 'primary_interest', opts: ['Data Science & Analytics', 'Web Development', 'Machine Learning & AI', 'Cloud Computing & DevOps', 'Cybersecurity', 'Mobile Development', 'Software Engineering'] },
  { q: "What's your current experience level?", field: 'experience_level', opts: ['Beginner (New to the field)', 'Intermediate (Some experience)', 'Advanced (Experienced professional)'] },
  { q: 'How much time can you dedicate per week?', field: 'time_commitment', opts: ['Less than 5 hours', '5-10 hours', '10-20 hours', 'More than 20 hours'] },
  { q: "What's your primary goal?", field: 'career_goal', opts: ['Career change to tech', 'Get a promotion', 'Start freelancing', 'Build personal projects', 'Academic/research', 'Just learning for fun'] },
];

function buildProfile(data) {
  const levelMap = { 'Beginner': 'beginner', 'Intermediate': 'intermediate', 'Advanced': 'advanced' };
  const lvl = Object.entries(levelMap).find(([k]) => (data.experience_level || '').includes(k));
  const level = lvl ? lvl[1] : 'beginner';
  const interests = [data.primary_interest || 'programming'].map(i => {
    const map = { 'Data Science & Analytics': 'data_science', 'Web Development': 'web_development', 'Machine Learning & AI': 'machine_learning', 'Cloud Computing & DevOps': 'cloud_computing', 'Cybersecurity': 'cybersecurity', 'Mobile Development': 'mobile_development', 'Software Engineering': 'programming' };
    return map[i] || i.toLowerCase().replace(/\s+/g, '_');
  });
  return createProfile({
    name: 'Learner', interests, experience_level: level,
    time_commitment: data.time_commitment || '5-10 hours',
    career_goals: [data.career_goal || 'career change to tech'],
  });
}

function formatProfileSummary(profile, path) {
  if (!profile) return '';
  const lines = [`Level: ${profile.experience_level}`];
  lines.push(`Interests: ${profile.interests.map(i => i.replace(/_/g, ' ')).join(', ')}`);
  lines.push(`Current skills: ${profile.current_skills.map(s => typeof s === 'object' ? s.skill : s).join(', ') || 'None yet'}`);
  if (path) lines.push(`Path: ${path.total_courses} skills across ${path.phases.length} phases (~${path.estimated_weeks} weeks)`);
  return lines.join('\n');
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [onboarding, setOnboarding] = useState(null);
  const [onbData, setOnbData] = useState({});
  const endRef = useRef(null);

  useEffect(() => {
    const existing = getProfile();
    if (existing) {
      const path = getLearningPath(existing);
      setMessages([{
        id: 1, type: 'ai',
        text: `Welcome back! Here's your profile:\n\n${formatProfileSummary(existing, path)}\n\nWhat would you like to explore?`,
        suggestions: ['Recommend courses', 'Show my learning path', 'What skills do I need?', 'Explain my path']
      }]);
    } else {
      setOnboarding(0);
      setMessages([{
        id: 1, type: 'ai',
        text: "Welcome to LearnPath AI! I'll build your personalized learning path.\n\n" + ONBOARDING_STEPS[0].q,
        suggestions: ONBOARDING_STEPS[0].opts
      }]);
    }
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const completeOnboarding = async (data) => {
    setLoading(true);
    const profile = buildProfile(data);
    const path = getLearningPath(profile);
    const recs = getRecommendations(profile);
    let summary = "Your profile is ready!\n\n";
    summary += formatProfileSummary(profile, path);
    summary += "\n\nTop recommendations:\n";
    recs.slice(0, 3).forEach((r, i) => {
      summary += `\n${i + 1}. ${r.course.title} (${r.course.duration_hours}h) — ${Math.round(r.score * 100)}% match`;
      summary += `\n   ${r.explanation}`;
    });
    summary += "\n\nAsk me anything about your learning journey!";
    setMessages(prev => [...prev, { id: Date.now() + 100, type: 'ai', text: summary, suggestions: ['Recommend courses for me', 'Show my learning path', 'What skills do I need?', 'Why these recommendations?'] }]);
    setOnboarding(null);
    setLoading(false);
  };

  const handleSuggestion = (s) => { if (onboarding !== null) handleOnboardingChoice(s); else sendMessage(s); };

  const handleOnboardingChoice = (choice) => {
    const step = ONBOARDING_STEPS[onboarding];
    const newD = { ...onbData, [step.field]: choice };
    setOnbData(newD);
    const userMsg = { id: Date.now(), type: 'user', text: choice };
    const next = onboarding + 1;
    if (next < ONBOARDING_STEPS.length) {
      setOnboarding(next);
      setMessages(prev => [...prev, userMsg, { id: Date.now() + 1, type: 'ai', text: ONBOARDING_STEPS[next].q, suggestions: ONBOARDING_STEPS[next].opts }]);
    } else {
      setMessages(prev => [...prev, userMsg]);
      completeOnboarding(newD);
    }
  };

  // LLM is ONLY used here for natural language polish — NOT for core logic
  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text }]);
    setInput('');
    setLoading(true);

    const profile = getProfile();
    let aiResponse = '';

    // Core logic: algorithmic response first
    if (profile) {
      const lower = text.toLowerCase();
      if (lower.includes('recommend') || lower.includes('suggest') || lower.includes('what should')) {
        const recs = getRecommendations(profile, 3);
        aiResponse = "Here are your top recommendations:\n\n" + recs.map((r, i) =>
          `${i + 1}. ${r.course.title} (${r.course.duration_hours}h) — ${Math.round(r.score * 100)}% match\n   ${r.explanation}`
        ).join('\n\n');
      } else if (lower.includes('path') || lower.includes('roadmap') || lower.includes('learning path')) {
        const path = getLearningPath(profile);
        aiResponse = `Your learning path has ${path.total_courses} skills across ${path.phases.length} phases.\n\nEstimated time: ${path.estimated_weeks} weeks (~${path.estimated_hours}h)\n\nPhases:\n` +
          path.phases.map(p => `${p.phase}. ${p.name} — ${p.courses.length} skills, ~${p.duration_weeks} weeks`).join('\n');
      } else if (lower.includes('skill') || lower.includes('gap') || lower.includes('need')) {
        const gaps = getSkillGaps ? null : null;
        const gapData = getSkillGaps(profile);
        aiResponse = `Your readiness for ${gapData.career_title}: ${gapData.readiness_score}%\n\nAcquired: ${gapData.acquired_skills.join(', ') || 'None yet'}\nMissing: ${gapData.missing_skills.slice(0, 5).map(s => s.name).join(', ')}`;
      } else if (lower.includes('why') || lower.includes('explain')) {
        const recs = getRecommendations(profile, 1);
        if (recs[0]) aiResponse = `Why ${recs[0].course.title}?\n\n${recs[0].why_this}\n\nDifficulty: ${recs[0].difficulty_reason}\n${recs[0].prerequisite_info.message}`;
      } else {
        // Fallback: try LLM for natural language polish
        aiResponse = await callLLM(text, profile);
      }
    } else {
      aiResponse = await callLLM(text, null);
    }

    setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', text: aiResponse || "I can help with course recommendations, learning paths, skill gaps, and career guidance.", suggestions: [] }]);
    setLoading(false);
  };

  // LLM call — optional, for NLG polish only
  const callLLM = async (text, profile) => {
    try {
      const context = profile ? { level: profile.experience_level, interests: profile.interests, skills: profile.current_skills.map(s => typeof s === 'object' ? s.skill : s) } : null;
      const res = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, context, mode: 'chat' }) });
      const data = await res.json();
      return data.response || null;
    } catch { return null; }
  };

  return (
    <div className="page-wrapper">
      <Head><title>AI Learning Assistant — LearnPath AI</title></Head>
      <NavBar active="chat" />
      <main className="container" style={{ paddingTop: 16 }}>
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.type}`}>
                <div className={`chat-avatar ${msg.type === 'ai' ? 'ai' : 'human'}`}>{msg.type === 'ai' ? 'AI' : 'You'}</div>
                <div>
                  <div className="chat-bubble" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                  {msg.suggestions?.length > 0 && (
                    <div className="chat-suggestions">
                      {msg.suggestions.map((s, i) => <button key={i} className="chat-suggestion" onClick={() => handleSuggestion(s)}>{s}</button>)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-message ai">
                <div className="chat-avatar ai">AI</div>
                <div className="chat-bubble" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="loading-spinner" />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form className="chat-input-area" onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}>
            <input type="text" className="chat-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder={onboarding !== null ? "Type your answer or click a suggestion above..." : "Ask me anything about learning..."} />
            <button type="submit" className="chat-send" disabled={loading || !input.trim()}>{loading ? '...' : 'Send'}</button>
          </form>
        </div>
      </main>
    </div>
  );
}
