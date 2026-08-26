import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const API_BASE = 'http://localhost:5000/api';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileId, setProfileId] = useState(null);
  const [onboarding, setOnboarding] = useState(null);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    startChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startChat = async () => {
    try {
      const res = await fetch(`${API_BASE}/onboarding`);
      const data = await res.json();
      setOnboarding(data);

      setMessages([{
        id: 1,
        type: 'ai',
        text: data.welcome_message + '\n\n' + data.steps[0].question,
        suggestions: data.steps[0].options,
      }]);
    } catch (err) {
      setMessages([{
        id: 1,
        type: 'ai',
        text: "Hello! I'm your AI Learning Assistant. Tell me what you'd like to learn, and I'll create a personalized learning path for you!",
        suggestions: ['I want to become a Data Scientist', 'Help me learn Web Development', 'What is Machine Learning?'],
      }]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (onboarding && onboardingStep < onboarding.steps.length) {
      handleOnboardingChoice(suggestion);
    } else {
      setInput(suggestion);
      sendMessage(suggestion);
    }
  };

  const handleOnboardingChoice = async (choice) => {
    const step = onboarding.steps[onboardingStep];
    const newData = { ...onboardingData, [step.field]: choice };
    setOnboardingData(newData);

    const userMsg = {
      id: messages.length + 1,
      type: 'user',
      text: choice,
    };

    const nextStep = onboardingStep + 1;

    if (nextStep < onboarding.steps.length) {
      setOnboardingStep(nextStep);
      const aiMsg = {
        id: messages.length + 2,
        type: 'ai',
        text: onboarding.steps[nextStep].question,
        suggestions: onboarding.steps[nextStep].options,
      };
      setMessages(prev => [...prev, userMsg, aiMsg]);
    } else {
      setMessages(prev => [...prev, userMsg]);
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/profile/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Learner',
            ...newData,
            interests: [newData.primary_interest || 'general'],
            experience_level: newData.experience_level?.includes('Beginner') ? 'beginner' :
              newData.experience_level?.includes('Advanced') ? 'advanced' : 'intermediate',
          }),
        });
        const data = await res.json();
        setProfileId(data.profile.id);

        setMessages(prev => [...prev, {
          id: prev.length + 1,
          type: 'ai',
          text: `Great! I've created your profile. Now let me generate your personalized learning path based on your interest in **${newData.primary_interest}**...\n\nYou can now:\n- Ask me anything about your learning journey\n- Type any question in natural language`,
          suggestions: ['Recommend courses for me', 'Show my learning path', 'What skills do I need?'],
        }]);
        setOnboarding(null);
      } catch (err) {
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          type: 'ai',
          text: "Profile created! You can now ask me anything about your learning journey.",
          suggestions: ['Recommend courses for me', 'Show my learning path'],
        }]);
        setOnboarding(null);
      }
      setLoading(false);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = {
      id: messages.length + 1,
      type: 'user',
      text: text,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          profile_id: profileId,
        }),
      });
      const data = await res.json();

      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'ai',
        text: data.response,
        suggestions: data.suggestions || [],
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'ai',
        text: "I'm having trouble connecting to the backend. Please make sure the Python server is running on port 5000.",
        suggestions: [],
      }]);
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!onboarding) {
      sendMessage(input);
    }
  };

  return (
    <div className="page-wrapper">
      <Head>
        <title>AI Learning Assistant - Chat</title>
      </Head>

      <nav className="navbar">
        <div className="container navbar-inner">
          <div className="navbar-brand">
            <div style={{ fontSize: '1.5rem' }}>&#129302;</div>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}><span>LearnPath AI</span></Link>
          </div>
          <div className="navbar-links">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/chat" className="nav-link active">AI Assistant</Link>
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
            <Link href="/learning-path" className="nav-link">My Path</Link>
          </div>
        </div>
      </nav>

      <main className="container" style={{ paddingTop: '16px' }}>
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.type}`}>
                <div className={`chat-avatar ${msg.type === 'ai' ? 'ai' : 'human'}`}>
                  {msg.type === 'ai' ? 'AI' : 'You'}
                </div>
                <div>
                  <div className="chat-bubble" style={{ whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </div>
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="chat-suggestions">
                      {msg.suggestions.map((s, i) => (
                        <button key={i} className="chat-suggestion" onClick={() => handleSuggestionClick(s)}>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-message ai">
                <div className="chat-avatar ai">AI</div>
                <div className="chat-bubble">
                  <div className="loading-spinner" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSubmit}>
            <input
              type="text"
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={onboarding ? "Click a suggestion above..." : "Type your message..."}
              disabled={onboarding !== null}
            />
            <button type="submit" className="chat-send" disabled={loading || onboarding !== null}>
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
