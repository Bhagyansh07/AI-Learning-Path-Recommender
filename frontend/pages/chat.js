import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { createProfile, getProfile, getRecommendations, getLearningPath } from '../lib/engine';

const NavBar = ({ active }) => (
  <nav className="navbar">
    <div className="container navbar-inner">
      <div className="navbar-brand">
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>PA</div>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}><span>Pragya AI</span></Link>
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
  const lines = [`Profile: ${profile.experience_level} level`];
  lines.push(`Interests: ${profile.interests.map(i => i.replace(/_/g, ' ')).join(', ')}`);
  lines.push(`Skills: ${profile.current_skills.map(s => typeof s === 'object' ? s.skill : s).join(', ') || 'None yet'}`);
  if (path) lines.push(`Path: ${path.total_courses} courses across ${path.phases.length} phases (~${path.estimated_weeks} weeks)`);
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
        text: `Welcome back! Here's your profile summary:\n\n${formatProfileSummary(existing, path)}\n\nWhat would you like to explore?`,
        suggestions: ['Recommend courses', 'Show my learning path', 'What skills do I need?', 'Explain my path']
      }]);
    } else {
      setOnboarding(0);
      setMessages([{
        id: 1, type: 'ai',
        text: "Welcome to Pragya AI! I'm your personal learning assistant powered by Google Gemini.\n\nLet me understand your goals so I can build your personalized learning path.\n\n" + ONBOARDING_STEPS[0].q,
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

    let summaryText = "Your profile is ready!\n\n";
    summaryText += formatProfileSummary(profile, path);
    summaryText += "\n\nHere are your top course recommendations:\n";
    recs.slice(0, 3).forEach((r, i) => {
      summaryText += `\n${i + 1}. ${r.course.title} (${r.course.duration_hours}h) - ${Math.round(r.score * 100)}% match`;
      summaryText += `\n   ${r.explanation}`;
    });
    summaryText += "\n\nYou can now ask me anything about your learning journey!";

    setMessages(prev => [...prev, {
      id: Date.now() + 100, type: 'ai', text: summaryText,
      suggestions: ['Recommend courses for me', 'Show my learning path', 'What skills do I need?', 'Why these recommendations?']
    }]);
    setOnboarding(null);
    setLoading(false);
  };

  const handleSuggestion = (s) => {
    if (onboarding !== null) {
      handleOnboardingChoice(s);
    } else {
      sendMessage(s);
    }
  };

  const handleOnboardingChoice = (choice) => {
    const step = ONBOARDING_STEPS[onboarding];
    const newD = { ...onbData, [step.field]: choice };
    setOnbData(newD);
    const userMsg = { id: Date.now(), type: 'user', text: choice };
    const next = onboarding + 1;

    if (next < ONBOARDING_STEPS.length) {
      setOnboarding(next);
      setMessages(prev => [...prev, userMsg, {
        id: Date.now() + 1, type: 'ai',
        text: ONBOARDING_STEPS[next].q,
        suggestions: ONBOARDING_STEPS[next].opts
      }]);
    } else {
      setMessages(prev => [...prev, userMsg]);
      completeOnboarding(newD);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text }]);
    setInput('');
    setLoading(true);

    const profile = getProfile();
    const path = profile ? getLearningPath(profile) : null;
    const recs = profile ? getRecommendations(profile) : null;

    const context = profile ? {
      level: profile.experience_level,
      interests: profile.interests,
      skills: profile.current_skills.map(s => typeof s === 'object' ? s.skill : s),
      career_goals: profile.career_goals,
      total_courses: path ? path.total_courses : 0,
      phases: path ? path.phases.map(p => p.name) : [],
      skill_gaps: path ? path.skill_gaps : [],
    } : null;

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, context, mode: 'chat' }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: Date.now() + 1, type: 'ai',
        text: data.response || "I'm here to help! Ask me about courses, skills, career paths, or your learning journey.",
        suggestions: []
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, type: 'ai',
        text: "I'm here to help! Try asking about courses, skills, or career paths.",
        suggestions: []
      }]);
    }
    setLoading(false);
  };

  return (
    <div className="page-wrapper">
      <Head><title>AI Learning Assistant - Chat</title></Head>
      <NavBar active="chat" />
      <div className="bg-glow" />
      <main className="container" style={{ paddingTop: 12 }}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <span className="tech-badge">Powered by Google Gemini AI</span>
        </div>
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
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form className="chat-input-area" onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}>
            <input
              type="text"
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={onboarding !== null ? "Type your answer or click a suggestion above..." : "Ask me anything about learning..."}
            />
            <button type="submit" className="chat-send" disabled={loading || !input.trim()}>
              {loading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
