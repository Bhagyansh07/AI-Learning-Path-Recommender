import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import NavBar from '../components/NavBar';
import { SKILL_GRAPH, DOMAIN_NAMES } from '../lib/skillGraph';

const DOMAIN_COLORS = {
  programming: '#e8590c', web_development: '#2dd4a0', data_science: '#f0b429',
  machine_learning: '#a78bfa', cloud_computing: '#3ecfcf', cybersecurity: '#ef6461',
  mobile_development: '#f472b6', math: '#818cf8', mlops: '#34d399',
};

function AnimatedNumber({ value, suffix = '' }) {
  const [displayed, setDisplayed] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    let frame = 0;
    const total = 40;
    const animate = () => {
      frame++;
      const progress = frame / total;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(value * eased));
      if (frame < total) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, value]);
  return <span ref={ref}>{displayed}{suffix}</span>;
}

export default function Home() {
  const [ready, setReady] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setReady(true)); }, []);

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

      <main style={{ paddingTop: 52 }}>
        {/* HERO — asymmetric split, not generic center-aligned */}
        <section className="container" style={{ padding: '64px 24px 48px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 48, alignItems: 'end', opacity: ready ? 1 : 0, transform: ready ? 'none' : 'translateY(12px)', transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div>
              <div className="t-label" style={{ marginBottom: 12 }}>HCLTech AMPlified Round 2</div>
              <h1 className="t-display" style={{ marginBottom: 16 }}>
                Stop guessing.<br />
                Start learning.
              </h1>
              <p style={{ fontSize: '1rem', color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 480, marginBottom: 28 }}>
                LearnPath AI builds a personalized roadmap from your goals, skills, and interests.
                Every recommendation explained. Every algorithm transparent.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <Link href="/chat" className="btn btn-primary">Get your path</Link>
                <Link href="/algorithm" className="btn btn-secondary">How it works</Link>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { val: 65, label: 'Skills in DAG', color: 'var(--accent)' },
                { val: 8, label: 'Career paths', color: 'var(--green)' },
                { val: 5, label: 'Scoring factors', color: 'var(--cyan)' },
                { val: 100, label: '% client-side', suffix: '%', color: 'var(--amber)' },
              ].map((s, i) => (
                <div key={i} style={{ padding: '18px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
                  <div className="t-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, marginBottom: 2 }}>
                    <AnimatedNumber value={s.val} suffix={s.suffix || ''} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DOMAIN STRIP — horizontal scroll, dense */}
        <section className="container" style={{ paddingBottom: 48 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {domains.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 100, fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-2)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: d.color }} />
                {d.name} <span style={{ color: 'var(--text-3)' }}>({d.count})</span>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS — horizontal numbered flow, not vertical cards */}
        <section className="container" style={{ paddingBottom: 56 }}>
          <div className="t-label" style={{ marginBottom: 16 }}>Process</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
            {[
              { n: '01', title: 'Describe your goal', body: 'Chat with our AI assistant in natural language. English or Hindi — it understands both.' },
              { n: '02', title: 'Engine analyzes', body: 'Topological sort, gap analysis, 5-factor scoring — all runs in your browser.' },
              { n: '03', title: 'Follow the path', body: 'Structured roadmap with prerequisites, milestones, and progress tracking.' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '24px 20px', background: 'var(--surface)', border: '1px solid var(--border)', position: 'relative' }}>
                <div className="t-num" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--border-2)', marginBottom: 12 }}>{s.n}</div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 8, letterSpacing: '-0.01em' }}>{s.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.6 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES — editorial layout, alternating emphasis */}
        <section className="container" style={{ paddingBottom: 56 }}>
          <div className="t-label" style={{ marginBottom: 16 }}>Capabilities</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {/* Big feature */}
            <div style={{ gridRow: 'span 2', padding: 28, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ padding: '4px 10px', background: 'var(--accent-dim)', color: 'var(--accent-2)', borderRadius: 100, fontSize: '0.65rem', fontWeight: 700, display: 'inline-block', marginBottom: 14 }}>Core</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 10, letterSpacing: '-0.02em' }}>5-Factor Hybrid Scoring</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.65 }}>
                  Skill gap, career relevance, job demand, difficulty fit, prerequisite readiness.
                  Each skill scored against your profile. No black box — every factor visible.
                </p>
              </div>
              <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--bg-3)', borderRadius: 'var(--r-md)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: 'var(--text-3)', lineHeight: 1.7 }}>
                <span style={{ color: 'var(--accent-2)' }}>score</span> = {'\n'}
                {'  '}gap × <span style={{ color: 'var(--cyan)' }}>0.35</span> + career × <span style={{ color: 'var(--green)' }}>0.25</span>{'\n'}
                {'  '}+ demand × <span style={{ color: 'var(--amber)' }}>0.20</span> + difficulty × <span style={{ color: 'var(--purple)' }}>0.10</span>{'\n'}
                {'  '}+ prereqs × <span style={{ color: 'var(--accent-2)' }}>0.10</span>
              </div>
            </div>
            {/* Small features */}
            {[
              { title: 'Conversational AI', desc: 'Natural language input. Hindi and English. Type what you want to learn.' },
              { title: 'Explainable recommendations', desc: 'Every suggestion comes with a clear why. No opaque AI decisions.' },
              { title: 'Interactive Skill Graph', desc: '65-skill DAG. Pan, zoom, click nodes. See prerequisite chains visually.' },
              { title: 'Algorithm Transparency', desc: 'Watch topological sort run live. Adjust scoring sliders. See gap analysis in action.' },
            ].map((f, i) => (
              <div key={i} style={{ padding: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 6, letterSpacing: '-0.01em' }}>{f.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.55 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TECH SPECS — dense, monospace feel */}
        <section className="container" style={{ paddingBottom: 56 }}>
          <div className="t-label" style={{ marginBottom: 16 }}>Under the hood</div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', lineHeight: 1.8, color: 'var(--text-2)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 40px' }}>
              <div><span style={{ color: 'var(--text-3)' }}>engine</span> <span style={{ color: 'var(--text)' }}>lib/engine.js</span></div>
              <div><span style={{ color: 'var(--text-3)' }}>graph</span> <span style={{ color: 'var(--text)' }}>65 nodes, {SKILL_GRAPH.skills.reduce((a, s) => a + s.prerequisites.length, 0)} edges</span></div>
              <div><span style={{ color: 'var(--text-3)' }}>sort</span> <span style={{ color: 'var(--text)' }}>Kahn's topological (O(V+E))</span></div>
              <div><span style={{ color: 'var(--text-3)' }}>scoring</span> <span style={{ color: 'var(--text)' }}>5-factor weighted hybrid</span></div>
              <div><span style={{ color: 'var(--text-3)' }}>profiler</span> <span style={{ color: 'var(--text)' }}>rule-based NLU (no LLM)</span></div>
              <div><span style={{ color: 'var(--text-3)' }}>feedback</span> <span style={{ color: 'var(--text)' }}>Elo-inspired weight updates</span></div>
              <div><span style={{ color: 'var(--text-3)' }}>explanation</span> <span style={{ color: 'var(--text)' }}>deterministic generator</span></div>
              <div><span style={{ color: 'var(--text-3)' }}>api</span> <span style={{ color: 'var(--text)' }}>Gemini (NLU polish only)</span></div>
            </div>
          </div>
        </section>

        {/* CTA — minimal, not loud */}
        <section className="container" style={{ paddingBottom: 64 }}>
          <div style={{ padding: '40px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', textAlign: 'center' }}>
            <h2 className="t-heading" style={{ marginBottom: 8 }}>Try it yourself</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-3)', marginBottom: 24 }}>
              Describe your learning goal. Get a roadmap in seconds.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Link href="/chat" className="btn btn-primary">Open AI Assistant</Link>
              <Link href="/skill-graph" className="btn btn-secondary">Explore the graph</Link>
              <Link href="/algorithm" className="btn btn-secondary">See the algorithm</Link>
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
