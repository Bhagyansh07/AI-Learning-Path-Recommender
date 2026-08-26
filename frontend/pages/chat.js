import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { createProfile, getProfile, analyzeText } from '../lib/engine';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileId, setProfileId] = useState(null);
  const [step, setStep] = useState(0);
  const [onbData, setOnbData] = useState({});
  const endRef = useRef(null);
  const steps = [
    { q: 'What field or career are you interested in?', field: 'primary_interest', opts: ['Data Science & Analytics', 'Web Development', 'Machine Learning & AI', 'Cloud Computing & DevOps', 'Cybersecurity', 'Mobile Development', 'Software Engineering'] },
    { q: "What's your current experience level?", field: 'experience_level', opts: ['Beginner (New to the field)', 'Intermediate (Some experience)', 'Advanced (Experienced professional)'] },
    { q: 'How much time can you dedicate per week?', field: 'time_commitment', opts: ['Less than 5 hours', '5-10 hours', '10-20 hours', 'More than 20 hours'] },
    { q: "What's your primary goal?", field: 'career_goal', opts: ['Career change to tech', 'Get a promotion', 'Start freelancing', 'Build personal projects', 'Academic/research', 'Just learning for fun'] },
  ];

  useEffect(() => {
    const existing = getProfile();
    if (existing) {
      setProfileId(existing.id);
      setMessages([{ id: 1, type: 'ai', text: `Welcome back, ${existing.name}! What would you like to explore?`, suggestions: ['Recommend courses', 'Show my learning path', 'What skills do I need?'] }]);
    } else {
      setMessages([{ id: 1, type: 'ai', text: "Welcome to LearnPath AI! I'm your personal learning assistant. Let me understand your goals.\n\n" + steps[0].q, suggestions: steps[0].opts }]);
    }
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSuggestion = (s) => {
    if (step < steps.length) {
      handleChoice(s);
    } else {
      setInput(s);
      sendMessage(s);
    }
  };

  const handleChoice = async (choice) => {
    const newD = { ...onbData, [steps[step].field]: choice };
    setOnbData(newD);
    const userMsg = { id: Date.now(), type: 'user', text: choice };
    const next = step + 1;

    if (next < steps.length) {
      setStep(next);
      setMessages(prev => [...prev, userMsg, { id: Date.now() + 1, type: 'ai', text: steps[next].q, suggestions: steps[next].opts }]);
    } else {
      setMessages(prev => [...prev, userMsg]);
      setLoading(true);

      const levelMap = { 'Beginner': 'beginner', 'Intermediate': 'intermediate', 'Advanced': 'advanced' };
      const lvl = Object.entries(levelMap).find(([k]) => (newD.experience_level || '').includes(k));
      const level = lvl ? lvl[1] : 'beginner';

      const interests = [newD.primary_interest || 'programming'].map(i => {
        const map = { 'Data Science & Analytics': 'data_science', 'Web Development': 'web_development', 'Machine Learning & AI': 'machine_learning', 'Cloud Computing & DevOps': 'cloud_computing', 'Cybersecurity': 'cybersecurity', 'Mobile Development': 'mobile_development', 'Software Engineering': 'programming' };
        return map[i] || i.toLowerCase().replace(/\s+/g, '_');
      });

      const profile = createProfile({
        name: 'Learner', interests, experience_level: level,
        time_commitment: newD.time_commitment || '5-10 hours',
        career_goals: [newD.career_goal || 'career change to tech'],
      });
      setProfileId(profile.id);

      setMessages(prev => [...prev, { id: Date.now() + 2, type: 'ai', text: `Great! I've created your profile. Your personalized learning path is ready!\n\nYou can now:\n- Ask me anything about your learning journey\n- View your Dashboard for recommendations\n- Check your Learning Path for milestones`, suggestions: ['Recommend courses for me', 'Show my learning path', 'What skills do I need?'] }]);
      setLoading(false);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text }]);
    setInput('');
    setLoading(true);

    const profile = getProfile();
    const context = profile ? { level: profile.experience_level, interests: profile.interests, skills: profile.current_skills.map(s => typeof s === 'object' ? s.skill : s) } : null;

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, context, mode: 'chat' }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', text: data.response || data.explanation || "I'm here to help! Ask me anything about learning.", suggestions: [] }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', text: "I'm here to help! Try asking about courses, skills, or career paths.", suggestions: [] }]);
    }
    setLoading(false);
  };

  return (
    <div className="page-wrapper">
      <Head><title>AI Learning Assistant - Chat</title></Head>
      <nav className="navbar"><div className="container navbar-inner"><div className="navbar-brand"><div style={{ fontSize: '1.5rem' }}>&#129302;</div><Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}><span>LearnPath AI</span></Link></div><div className="navbar-links"><Link href="/" className="nav-link">Home</Link><Link href="/chat" className="nav-link active">AI Assistant</Link><Link href="/dashboard" className="nav-link">Dashboard</Link><Link href="/learning-path" className="nav-link">My Path</Link></div></div></nav>
      <main className="container" style={{ paddingTop: '16px' }}>
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.type}`}>
                <div className={`chat-avatar ${msg.type === 'ai' ? 'ai' : 'human'}`}>{msg.type === 'ai' ? 'AI' : 'You'}</div>
                <div>
                  <div className="chat-bubble" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                  {msg.suggestions?.length > 0 && <div className="chat-suggestions">{msg.suggestions.map((s, i) => <button key={i} className="chat-suggestion" onClick={() => handleSuggestion(s)}>{s}</button>)}</div>}
                </div>
              </div>
            ))}
            {loading && <div className="chat-message ai"><div className="chat-avatar ai">AI</div><div className="chat-bubble"><div className="loading-spinner" /></div></div>}
            <div ref={endRef} />
          </div>
          <form className="chat-input-area" onSubmit={(e) => { e.preventDefault(); if (step >= steps.length) sendMessage(input); }}>
            <input type="text" className="chat-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder={step < steps.length ? "Click a suggestion above..." : "Type your message..."} disabled={step < steps.length} />
            <button type="submit" className="chat-send" disabled={loading || step < steps.length}>Send</button>
          </form>
        </div>
      </main>
    </div>
  );
}
