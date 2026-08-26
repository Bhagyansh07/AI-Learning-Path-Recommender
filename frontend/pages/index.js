import Head from 'next/head';
import Link from 'next/link';

const API_BASE = 'http://localhost:5000/api';

export default function Home() {
  return (
    <div className="page-wrapper">
      <Head>
        <title>AI Learning Path Recommender</title>
        <meta name="description" content="Personalized AI-powered learning paths tailored to your goals" />
      </Head>

      <nav className="navbar">
        <div className="container navbar-inner">
          <div className="navbar-brand">
            <div style={{ fontSize: '1.5rem' }}>&#129302;</div>
            <span>LearnPath AI</span>
          </div>
          <div className="navbar-links">
            <Link href="/" className="nav-link active">Home</Link>
            <Link href="/chat" className="nav-link">AI Assistant</Link>
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
            <Link href="/learning-path" className="nav-link">My Path</Link>
          </div>
        </div>
      </nav>

      <main className="container">
        <section className="hero">
          <h1>
            Your Personalized<br />
            <span>AI Learning Path</span>
          </h1>
          <p>
            Stop guessing what to learn next. Our AI analyzes your goals, skills, and interests
            to create a structured roadmap just for you.
          </p>
          <div className="hero-actions">
            <Link href="/chat" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 28px' }}>
              Start Learning Journey
            </Link>
            <Link href="/dashboard" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '14px 28px' }}>
              View Dashboard
            </Link>
          </div>
        </section>

        <section>
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Three simple steps to your personalized learning path</p>
          <div className="grid-3" style={{ marginBottom: '60px' }}>
            {[
              {
                icon: '1',
                title: 'Tell Us Your Goals',
                desc: 'Chat with our AI assistant in natural language. Describe what you want to learn and where you want to go.',
              },
              {
                icon: '2',
                title: 'AI Analyzes & Recommends',
                desc: 'Our engine analyzes your profile, identifies skill gaps, and recommends the best courses and projects.',
              },
              {
                icon: '3',
                title: 'Follow Your Roadmap',
                desc: 'Get a structured learning path with milestones, prerequisites, and progress tracking.',
              },
            ].map((step, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                  {step.icon}
                </div>
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
              { icon: '💬', title: 'Conversational AI', desc: 'Describe your goals in natural language. Our AI understands what you need.' },
              { icon: '🎯', title: 'Smart Profiling', desc: 'Captures your interests, experience level, and learning patterns.' },
              { icon: '🧠', title: 'AI Recommendations', desc: 'TF-IDF powered course and project recommendations based on your profile.' },
              { icon: '🗺️', title: 'Learning Roadmaps', desc: 'Structured paths with prerequisites, milestones, and estimated timelines.' },
              { icon: '💡', title: 'Explainable AI', desc: 'Every recommendation comes with a clear explanation of why.' },
              { icon: '📊', title: 'Progress Dashboard', desc: 'Visualize your skills, milestones, and learning progress.' },
            ].map((feature, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="card" style={{ maxWidth: 600, margin: '0 auto', padding: '40px' }}>
            <h2 style={{ marginBottom: 12 }}>Ready to Start?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              Tell our AI assistant your learning goal and get a personalized roadmap in seconds.
            </p>
            <Link href="/chat" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 28px' }}>
              Chat with AI Assistant
            </Link>
          </div>
        </section>
      </main>

      <footer style={{ padding: '24px 0', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <div className="container">
          AI-Powered Personalized Learning Path Recommender &mdash; HCL Amplified Project
        </div>
      </footer>
    </div>
  );
}
