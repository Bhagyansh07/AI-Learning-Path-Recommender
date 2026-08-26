import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import NavBar from '../components/NavBar';
import { SKILL_GRAPH, DOMAIN_NAMES } from '../lib/skillGraph';

const DOMAIN_COLORS = {
  programming: '#3b82f6', web_development: '#8b5cf6', data_science: '#06b6d4',
  machine_learning: '#f59e0b', cloud_computing: '#10b981', cybersecurity: '#ef4444',
  mobile_development: '#ec4899', math: '#6366f1', mlops: '#f97316',
};

function CountUp({ end, suffix = '', duration = 1200 }) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = end / (duration / 16);
    const interval = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(interval); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(interval);
  }, [visible, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Home() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const domains = Object.entries(DOMAIN_NAMES).map(([key, name]) => ({
    name, color: DOMAIN_COLORS[key],
    count: SKILL_GRAPH.skills.filter(s => s.domain === key).length,
  }));

  return (
    <div className="page-wrapper">
      <Head>
        <title>LearnPath AI — Personalized AI Learning Paths</title>
        <meta name="description" content="AI-powered personalized learning path recommender. Stop guessing what to learn next." />
      </Head>
      <NavBar active="home" />
      <main className="container">
        <section className="hero" style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(8px)', transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={{ marginBottom: 16 }}>
            <span className="badge badge-primary">AI-Powered Curriculum Engine</span>
          </div>
          <h1>Your Personalized<br /><span className="accent">AI Learning Path</span></h1>
          <p>Stop guessing what to learn next. Our engine analyzes your goals, skills, and interests to build a structured roadmap designed for you.</p>
          <div className="hero-actions">
            <Link href="/chat" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>Start Learning Journey</Link>
            <Link href="/skill-graph" className="btn btn-secondary" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>Explore Skill Graph</Link>
          </div>
        </section>

        <div className="stats-bar">
          <div className="stats-bar-item"><div className="stats-bar-value"><CountUp end={65} /></div><div className="stats-bar-label">Skills in DAG</div></div>
          <div className="stats-bar-item"><div className="stats-bar-value"><CountUp end={8} /></div><div className="stats-bar-label">Career Paths</div></div>
          <div className="stats-bar-item"><div className="stats-bar-value"><CountUp end={5} /></div><div className="stats-bar-label">Scoring Factors</div></div>
          <div className="stats-bar-item"><div className="stats-bar-value">100%</div><div className="stats-bar-label">Works Offline</div></div>
        </div>

        <section style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
            {domains.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 9999, background: 'var(--color-card)', border: '1px solid var(--color-border)', fontSize: '0.72rem', fontWeight: 500 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: d.color }} />
                <span style={{ color: 'var(--color-ink-2)' }}>{d.name}</span>
                <span style={{ color: 'var(--color-ink-3)', fontSize: '0.65rem' }}>({d.count})</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Three steps to your personalized learning path</p>
          <div className="grid-3" style={{ marginBottom: 48 }}>
            {[
              { num: '01', title: 'Tell Us Your Goals', desc: 'Chat with our AI assistant in natural language. Describe what you want to learn and where you want to go.' },
              { num: '02', title: 'AI Analyzes & Recommends', desc: 'Our engine analyzes your profile, identifies skill gaps, and recommends the best courses and projects.' },
              { num: '03', title: 'Follow Your Roadmap', desc: 'Get a structured learning path with milestones, prerequisites, and progress tracking.' },
            ].map((step, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{step.num}</div>
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
              { icon: '01', title: 'Conversational AI', desc: 'Describe your goals naturally. Our AI understands what you need and recommends the best path.' },
              { icon: '02', title: 'Smart Profiling', desc: 'Captures your interests, experience level, and learning patterns automatically.' },
              { icon: '03', title: 'Hybrid Scoring', desc: '5-factor scoring: skill gap, career relevance, ML similarity, difficulty, prerequisites.' },
              { icon: '04', title: 'Learning Roadmaps', desc: 'Structured paths with prerequisites, milestones, and estimated timelines.' },
              { icon: '05', title: 'Explainable AI', desc: 'Every recommendation comes with a clear explanation of why it fits you.' },
              { icon: '06', title: 'Progress Dashboard', desc: 'Visualize your skills, milestones, and learning progress in real-time.' },
              { icon: '07', title: 'Interactive Skill Graph', desc: 'Explore the 65-skill DAG visually. See prerequisite chains and domain relationships.' },
              { icon: '08', title: 'Algorithm Transparency', desc: 'See exactly how topological sort, gap analysis, and hybrid scoring work.' },
              { icon: '09', title: 'India-First Design', desc: 'NPTEL, SWAYAM resources. Indian salary data. Aligned with NEP 2020 and Skill India vision.' },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: '48px 0' }}>
          <div className="card" style={{ maxWidth: 520, margin: '0 auto', padding: '36px 32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 6, letterSpacing: '-0.025em' }}>Ready to Start?</h2>
            <p style={{ color: 'var(--color-ink-2)', marginBottom: 20, fontSize: '0.9rem' }}>Tell our AI assistant your learning goal and get a personalized roadmap in seconds.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/chat" className="btn btn-primary">Chat with AI Assistant</Link>
              <Link href="/skill-graph" className="btn btn-secondary">Explore Skill Graph</Link>
              <Link href="/algorithm" className="btn btn-secondary">See the Algorithm</Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="container">LearnPath AI — Built for <a href="https://hcltech.com" target="_blank" rel="noopener noreferrer">HCLTech AMPlified</a> Round 2</div>
      </footer>
    </div>
  );
}
