import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import NavBar from '../components/NavBar';
import { SKILL_GRAPH, DOMAIN_NAMES } from '../lib/skillGraph';

const DOMAIN_COLORS = {
  programming: '#6366f1', web_development: '#a855f7', data_science: '#06b6d4',
  machine_learning: '#f59e0b', cloud_computing: '#22c55e', cybersecurity: '#ef4444',
  mobile_development: '#ec4899', math: '#818cf8', mlops: '#f97316',
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
  useEffect(() => { setTimeout(() => setVisible(true), 30); }, []);

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

      <main>
        {/* HERO — Asymmetric: left text, right stats */}
        <section className="container hero" style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(6px)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div className="hero-grid">
            <div>
              <div className="hero-badge">
                <span className="badge badge-accent">AI-Powered Curriculum Engine</span>
              </div>
              <h1 className="t-display">Your personalized<br /><span className="hl">AI learning path.</span></h1>
              <p className="hero-desc">Stop guessing what to learn next. Our engine analyzes your goals, skills, and interests to build a structured roadmap — designed for you.</p>
              <div className="hero-actions">
                <Link href="/chat" className="btn btn-primary">Start Learning Journey</Link>
                <Link href="/skill-graph" className="btn btn-secondary">Explore Skill Graph</Link>
              </div>
            </div>
            <div className="hero-stats">
              <div className="hero-stat-row">
                <div className="hero-stat"><div className="hero-stat-val"><CountUp end={65} /></div><div className="hero-stat-lbl">Skills in DAG</div></div>
                <div className="hero-stat"><div className="hero-stat-val"><CountUp end={8} /></div><div className="hero-stat-lbl">Career Paths</div></div>
              </div>
              <div className="hero-divider" />
              <div className="hero-stat-row">
                <div className="hero-stat"><div className="hero-stat-val"><CountUp end={5} /></div><div className="hero-stat-lbl">Scoring Factors</div></div>
                <div className="hero-stat"><div className="hero-stat-val">100%</div><div className="hero-stat-lbl">Works Offline</div></div>
              </div>
              <div className="hero-divider" />
              <p className="hero-note">Built for HCLTech AMPlified Round 2. Every algorithm runs client-side — no API dependency for core logic.</p>
            </div>
          </div>
        </section>

        {/* DOMAINS */}
        <section className="container" style={{ paddingBottom: 48 }}>
          <div className="domain-pills">
            {domains.map((d, i) => (
              <div key={i} className="domain-pill">
                <div className="domain-dot" style={{ background: d.color }} />
                {d.name} <span style={{ opacity: 0.5 }}>({d.count})</span>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS — 3 steps, horizontal */}
        <section className="container section">
          <div className="section-header">
            <div className="t-label">Process</div>
            <h2 className="t-heading">How it works</h2>
          </div>
          <div className="feature-row">
            {[
              { n: '01', title: 'Tell us your goals', desc: 'Chat with our AI assistant in natural language. Describe what you want to learn.' },
              { n: '02', title: 'AI analyzes your profile', desc: 'Our engine identifies skill gaps and recommends the best courses and projects.' },
              { n: '03', title: 'Follow your roadmap', desc: 'Get a structured path with milestones, prerequisites, and progress tracking.' },
            ].map((s, i) => (
              <div key={i} className="feature-cell">
                <div className="feature-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES — 2-column alternating */}
        <section className="container section">
          <div className="section-header">
            <div className="t-label">Capabilities</div>
            <h2 className="t-heading">Built for real learning</h2>
          </div>
          <div className="feature-row">
            {[
              { n: '01', title: 'Conversational AI', desc: 'Describe your goals naturally. Our AI understands what you need and recommends the best path.' },
              { n: '02', title: 'Smart Profiling', desc: 'Captures your interests, experience level, and learning patterns automatically.' },
              { n: '03', title: 'Hybrid Scoring', desc: '5-factor scoring: skill gap, career relevance, demand, difficulty, prerequisites.' },
              { n: '04', title: 'Learning Roadmaps', desc: 'Structured paths with prerequisites, milestones, and estimated timelines.' },
              { n: '05', title: 'Explainable AI', desc: 'Every recommendation comes with a clear explanation of why it fits you.' },
              { n: '06', title: 'Progress Dashboard', desc: 'Visualize your skills, milestones, and learning progress in real-time.' },
              { n: '07', title: 'Interactive Skill Graph', desc: 'Explore the 65-skill DAG visually. See prerequisite chains and domain relationships.' },
              { n: '08', title: 'Algorithm Transparency', desc: 'See exactly how topological sort, gap analysis, and hybrid scoring work.' },
            ].map((f, i) => (
              <div key={i} className="feature-cell">
                <div className="feature-num">{f.n}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-box">
              <h2 className="t-heading">Ready to start?</h2>
              <p>Tell our AI assistant your learning goal and get a personalized roadmap in seconds.</p>
              <div className="cta-actions">
                <Link href="/chat" className="btn btn-primary">Chat with AI Assistant</Link>
                <Link href="/skill-graph" className="btn btn-secondary">Explore Skill Graph</Link>
                <Link href="/algorithm" className="btn btn-secondary">See the Algorithm</Link>
              </div>
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
