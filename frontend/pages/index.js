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

function AnimatedGraphBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrame;
    let nodes = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };

    const initNodes = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      nodes = Array.from({ length: 30 }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        r: 2 + Math.random() * 3,
        color: Object.values(DOMAIN_COLORS)[Math.floor(Math.random() * 9)],
        pulse: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (time) => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.08 * (1 - dist / 150)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        n.pulse += 0.02;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        const pulseScale = 1 + Math.sin(n.pulse) * 0.15;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * pulseScale, 0, Math.PI * 2);
        ctx.fillStyle = n.color + '40';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();
      });

      animFrame = requestAnimationFrame(draw);
    };

    resize();
    initNodes();
    draw(0);
    window.addEventListener('resize', () => { resize(); initNodes(); });

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.6 }} />;
}

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
        <section className="hero" style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(12px)', transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)', position: 'relative', overflow: 'hidden', padding: '100px 0 60px' }}>
          <AnimatedGraphBackground />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: 16 }}>
              <span className="badge badge-primary">AI-Powered Curriculum Engine</span>
            </div>
            <h1>Your Personalized<br /><span>AI Learning Path</span></h1>
            <p>Stop guessing what to learn next. Our engine analyzes your goals, skills, and interests to build a structured roadmap designed for you.</p>
            <div className="hero-actions">
              <Link href="/chat" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem', borderRadius: 10, boxShadow: '0 4px 14px rgba(37,99,235,0.25)' }}>Start Learning Journey</Link>
              <Link href="/skill-graph" className="btn btn-secondary" style={{ padding: '12px 28px', fontSize: '0.95rem', borderRadius: 10 }}>Explore Skill Graph</Link>
            </div>
          </div>
        </section>

        <div className="stats-bar">
          <div className="stats-bar-item"><div className="stats-bar-value"><CountUp end={65} /></div><div className="stats-bar-label">Skills in DAG</div></div>
          <div className="stats-bar-item"><div className="stats-bar-value"><CountUp end={8} /></div><div className="stats-bar-label">Career Paths</div></div>
          <div className="stats-bar-item"><div className="stats-bar-value"><CountUp end={5} /></div><div className="stats-bar-label">Scoring Factors</div></div>
          <div className="stats-bar-item"><div className="stats-bar-value">100%</div><div className="stats-bar-label">Works Offline</div></div>
        </div>

        <section style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {domains.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 500 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>({d.count})</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Three simple steps to your personalized learning path</p>
          <div className="grid-3" style={{ marginBottom: 48 }}>
            {[
              { icon: '1', title: 'Tell Us Your Goals', desc: 'Chat with our AI assistant in natural language. Describe what you want to learn and where you want to go.' },
              { icon: '2', title: 'AI Analyzes & Recommends', desc: 'Our engine analyzes your profile, identifies skill gaps, and recommends the best courses and projects.' },
              { icon: '3', title: 'Follow Your Roadmap', desc: 'Get a structured learning path with milestones, prerequisites, and progress tracking.' },
            ].map((step, i) => (
              <div key={i} className="feature-card" style={{ transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden' }}>
                <div className="feature-icon" style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.5rem' }}>{step.icon}</div>
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
              { icon: '🌐', title: 'Interactive Skill Graph', desc: 'Explore the 65-skill DAG visually. See prerequisite chains and domain relationships.' },
              { icon: '🔬', title: 'Algorithm Transparency', desc: 'See exactly how topological sort, gap analysis, and hybrid scoring work.' },
              { icon: '🇮🇳', title: 'India-First Design', desc: 'NPTEL, SWAYAM resources. Indian salary data. Aligned with NEP 2020 and Skill India vision.' },
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
          <div className="card" style={{ maxWidth: 560, margin: '0 auto', padding: '40px 32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>Ready to Start?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.95rem' }}>Tell our AI assistant your learning goal and get a personalized roadmap in seconds.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
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
