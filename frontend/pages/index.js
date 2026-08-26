import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div className="page-wrapper">
      <Head>
        <title>Pragya AI - Personalized AI Learning Paths</title>
        <meta name="description" content="AI-powered personalized learning path recommender. Stop guessing what to learn next." />
      </Head>
      <div className="bg-glow" />

      <nav className="navbar">
        <div className="container navbar-inner">
          <div className="navbar-brand">
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
            }}>PA</div>
            <span>Pragya AI</span>
          </div>
          <div className="navbar-links">
            <Link href="/" className="nav-link active">Home</Link>
            <Link href="/chat" className="nav-link">AI Assistant</Link>
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
            <Link href="/learning-path" className="nav-link">My Path</Link>
            <Link href="/chat" className="btn btn-primary btn-sm" style={{ marginLeft: 8 }}>Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="container">
        <section className="hero" style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(30px)', transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <div style={{ marginBottom: 20 }}>
            <span className="tech-badge">Powered by Google Gemini AI</span>
          </div>
          <h1>
            Your Personalized<br />
            <span>AI Learning Path</span>
          </h1>
          <p>
            Stop guessing what to learn next. Our AI analyzes your goals, skills, and interests
            to create a structured roadmap designed specifically for you.
          </p>
          <div className="hero-actions">
            <Link href="/chat" className="btn btn-primary" style={{ fontSize: '1rem', padding: '16px 32px' }}>
              Start Learning Journey
            </Link>
            <Link href="/dashboard" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '16px 32px' }}>
              View Dashboard
            </Link>
          </div>
        </section>

        <div className="stats-bar">
          <div className="stats-bar-item">
            <div className="stats-bar-value">20+</div>
            <div className="stats-bar-label">Curated Courses</div>
          </div>
          <div className="stats-bar-item">
            <div className="stats-bar-value">12</div>
            <div className="stats-bar-label">Career Paths</div>
          </div>
          <div className="stats-bar-item">
            <div className="stats-bar-value">70+</div>
            <div className="stats-bar-label">Skills Tracked</div>
          </div>
          <div className="stats-bar-item">
            <div className="stats-bar-value">5</div>
            <div className="stats-bar-label">Scoring Factors</div>
          </div>
        </div>

        <section>
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Three simple steps to your personalized learning path</p>
          <div className="grid-3" style={{ marginBottom: 60 }}>
            {[
              { icon: '💬', title: 'Tell Us Your Goals', desc: 'Chat with our AI assistant in natural language. Describe what you want to learn and where you want to go.' },
              { icon: '🧠', title: 'AI Analyzes & Recommends', desc: 'Our engine analyzes your profile, identifies skill gaps, and recommends the best courses and projects.' },
              { icon: '🗺️', title: 'Follow Your Roadmap', desc: 'Get a structured learning path with milestones, prerequisites, and progress tracking.' },
            ].map((step, i) => (
              <div key={i} className="feature-card animate-in">
                <div className="feature-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section-title">Features</h2>
          <p className="section-subtitle">Everything you need for an effective learning journey</p>
          <div className="features-grid">
            {[
              { icon: '💬', title: 'Conversational AI', desc: 'Describe your goals naturally. Our Gemini-powered AI understands what you need.' },
              { icon: '🎯', title: 'Smart Profiling', desc: 'Captures your interests, experience level, and learning patterns automatically.' },
              { icon: '🧠', title: 'Hybrid Scoring', desc: '5-factor scoring: skill gap, career relevance, ML similarity, difficulty, prerequisites.' },
              { icon: '🗺️', title: 'Learning Roadmaps', desc: 'Structured paths with prerequisites, milestones, and estimated timelines.' },
              { icon: '💡', title: 'Explainable AI', desc: 'Every recommendation comes with a clear explanation of why it fits you.' },
              { icon: '📊', title: 'Progress Dashboard', desc: 'Visualize your skills, milestones, and learning progress in real-time.' },
            ].map((feature, i) => (
              <div key={i} className="feature-card animate-in">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="card" style={{ maxWidth: 640, margin: '0 auto', padding: '48px 40px', textAlign: 'center', border: '1px solid rgba(99,102,241,0.2)' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>Ready to Start?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '1.05rem' }}>
              Tell our AI assistant your learning goal and get a personalized roadmap in seconds.
            </p>
            <Link href="/chat" className="btn btn-primary" style={{ fontSize: '1rem', padding: '16px 32px' }}>
              Chat with AI Assistant
            </Link>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          Pragya AI &mdash; Built for <a href="https://hcltech.com" target="_blank" rel="noopener noreferrer">HCLTech AMPlified</a> Round 2
        </div>
      </footer>
    </div>
  );
}
