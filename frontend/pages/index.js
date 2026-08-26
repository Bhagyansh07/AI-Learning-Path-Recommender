import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  return (
    <div className="page-wrapper">
      <Head>
        <title>LearnPath AI - Personalized AI Learning Paths</title>
        <meta name="description" content="AI-powered personalized learning path recommender. Stop guessing what to learn next." />
      </Head>

      <nav className="navbar">
        <div className="container navbar-inner">
          <div className="navbar-brand">
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'white' }}>LP</div>
            <span>LearnPath AI</span>
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
        <section className="hero" style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(12px)', transition: 'all 0.5s ease' }}>
          <div style={{ marginBottom: 16 }}>
            <span className="badge badge-primary">AI-Powered Curriculum Engine</span>
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
            <Link href="/chat" className="btn btn-primary" style={{ padding: '10px 24px' }}>
              Start Learning Journey
            </Link>
            <Link href="/dashboard" className="btn btn-secondary" style={{ padding: '10px 24px' }}>
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
          <div className="grid-3" style={{ marginBottom: 48 }}>
            {[
              { icon: '1', title: 'Tell Us Your Goals', desc: 'Chat with our AI assistant in natural language. Describe what you want to learn and where you want to go.' },
              { icon: '2', title: 'AI Analyzes & Recommends', desc: 'Our engine analyzes your profile, identifies skill gaps, and recommends the best courses and projects.' },
              { icon: '3', title: 'Follow Your Roadmap', desc: 'Get a structured learning path with milestones, prerequisites, and progress tracking.' },
            ].map((step, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon" style={{ fontWeight: 700, color: 'var(--primary)' }}>{step.icon}</div>
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
              { icon: '💬', title: 'Conversational AI', desc: 'Describe your goals naturally. Our AI understands what you need and recommends the best path.' },
              { icon: '🎯', title: 'Smart Profiling', desc: 'Captures your interests, experience level, and learning patterns automatically.' },
              { icon: '🧠', title: 'Hybrid Scoring', desc: '5-factor scoring: skill gap, career relevance, ML similarity, difficulty, prerequisites.' },
              { icon: '🗺️', title: 'Learning Roadmaps', desc: 'Structured paths with prerequisites, milestones, and estimated timelines.' },
              { icon: '💡', title: 'Explainable AI', desc: 'Every recommendation comes with a clear explanation of why it fits you.' },
              { icon: '📊', title: 'Progress Dashboard', desc: 'Visualize your skills, milestones, and learning progress in real-time.' },
            ].map((feature, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ textAlign: 'center', padding: '48px 0' }}>
          <div className="card" style={{ maxWidth: 560, margin: '0 auto', padding: '40px 32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>Ready to Start?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.95rem' }}>
              Tell our AI assistant your learning goal and get a personalized roadmap in seconds.
            </p>
            <Link href="/chat" className="btn btn-primary" style={{ padding: '10px 24px' }}>
              Chat with AI Assistant
            </Link>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          LearnPath AI &mdash; Built for <a href="https://hcltech.com" target="_blank" rel="noopener noreferrer">HCLTech AMPlified</a> Round 2
        </div>
      </footer>
    </div>
  );
}
