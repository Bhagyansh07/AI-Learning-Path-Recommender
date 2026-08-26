import { useState, useEffect } from 'react';
import Head from 'next/head';
import NavBar from '../components/NavBar';
import { SKILL_GRAPH, SKILL_DEMAND } from '../lib/skillGraph';

const DEMO_SKILLS = ['python-basics', 'numpy-pandas', 'statistics-basics', 'machine-learning', 'supervised-learning', 'deep-learning', 'data-structures-algorithms', 'sql-databases'];
const skillMap = Object.fromEntries(SKILL_GRAPH.skills.map(s => [s.id, s]));

function TopoDemo() {
  const [sorted, setSorted] = useState([]);
  const [queue, setQueue] = useState([]);
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);

  const startSort = () => {
    const inDeg = {};
    DEMO_SKILLS.forEach(id => { inDeg[id] = (skillMap[id]?.prerequisites || []).filter(p => DEMO_SKILLS.includes(p)).length; });
    const q = Object.entries(inDeg).filter(([, d]) => d === 0).map(([id]) => id);
    setQueue(q); setSorted([]); setStep(0); setRunning(true);
  };

  useEffect(() => {
    if (!running || sorted.length === DEMO_SKILLS.length) { if (sorted.length === DEMO_SKILLS.length) setRunning(false); return; }
    const timer = setTimeout(() => {
      setQueue(prev => {
        if (prev.length === 0) { setRunning(false); return []; }
        const current = prev[0];
        const next = prev.slice(1);
        setSorted(s => [...s, current]);
        DEMO_SKILLS.filter(id => skillMap[id]?.prerequisites.includes(current)).forEach(id => {
          const inDeg = DEMO_SKILLS.filter(p => skillMap[id]?.prerequisites.includes(p) && ![...sorted, current].includes(p)).length;
          if (inDeg === 0 && !next.includes(id)) next.push(id);
        });
        setStep(s => s + 1);
        return next;
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [running, sorted, queue]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className="btn btn-primary btn-sm" onClick={startSort} disabled={running}>Run Topological Sort</button>
        <button className="btn btn-secondary btn-sm" onClick={() => { setSorted([]); setQueue([]); setStep(0); setRunning(false); }}>Reset</button>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Input Queue</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {queue.length === 0 && !running && sorted.length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Click "Run" to start</span>}
            {queue.map(id => <span key={id} style={{ padding: '4px 8px', background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)' }}>{skillMap[id]?.name || id}</span>)}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>Sorted Output (Step {step})</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {sorted.map((id, i) => (
              <span key={id} style={{ padding: '4px 8px', background: i === sorted.length - 1 ? '#22c55e' : 'var(--bg-4)', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, color: i === sorted.length - 1 ? '#fff' : 'var(--text)' }}>
                {i + 1}. {skillMap[id]?.name || id}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoringDemo() {
  const [skillGap, setSkillGap] = useState(35);
  const [careerMatch, setCareerMatch] = useState(25);
  const [demand, setDemand] = useState(20);
  const [difficulty, setDifficulty] = useState(10);
  const [prereqs, setPrereqs] = useState(10);
  const total = skillGap + careerMatch + demand + difficulty + prereqs;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Skill Gap', value: skillGap, set: setSkillGap, color: '#3b82f6', max: 50 },
          { label: 'Career Match', value: careerMatch, set: setCareerMatch, color: '#22c55e', max: 40 },
          { label: 'Job Demand', value: demand, set: setDemand, color: '#f59e0b', max: 30 },
          { label: 'Difficulty Fit', value: difficulty, set: setDifficulty, color: '#8b5cf6', max: 20 },
          { label: 'Prerequisites', value: prereqs, set: setPrereqs, color: '#06b6d4', max: 20 },
        ].map(f => (
          <div key={f.label} style={{ background: 'var(--bg-3)', borderRadius: 8, padding: 10, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 4 }}>{f.label}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: f.color }}>{f.value}%</div>
            <input type="range" min={0} max={f.max} value={f.value} onChange={e => f.set(parseInt(e.target.value))} style={{ width: '100%', accentColor: f.color, marginTop: 4 }} />
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Final Score</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)' }}>{total}%</span>
        </div>
        <div style={{ height: 20, background: 'var(--bg-4)', borderRadius: 10, overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${(skillGap/total)*100}%`, background: '#3b82f6', transition: 'width 0.3s' }} />
          <div style={{ width: `${(careerMatch/total)*100}%`, background: '#22c55e', transition: 'width 0.3s' }} />
          <div style={{ width: `${(demand/total)*100}%`, background: '#f59e0b', transition: 'width 0.3s' }} />
          <div style={{ width: `${(difficulty/total)*100}%`, background: '#8b5cf6', transition: 'width 0.3s' }} />
          <div style={{ width: `${(prereqs/total)*100}%`, background: '#06b6d4', transition: 'width 0.3s' }} />
        </div>
      </div>
    </div>
  );
}

function GapDemo() {
  const demoProfile = { current_skills: ['python-basics', 'sql-databases', 'git-version-control'] };
  const targetSkills = ['machine-learning', 'deep-learning', 'nlp', 'numpy-pandas', 'statistics-basics'];
  const userSet = new Set(demoProfile.current_skills);
  const gaps = targetSkills.map(id => ({ ...skillMap[id], acquired: userSet.has(id) }));
  const acquired = gaps.filter(g => g.acquired).length;
  const pct = Math.round((acquired / gaps.length) * 100);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>Target: ML Engineer (demo profile)</span>
        <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)' }}>{pct}% ready</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
        {gaps.map(g => (
          <div key={g.id} style={{ padding: '8px 12px', background: g.acquired ? 'rgba(5,150,105,0.08)' : 'rgba(239,68,68,0.05)', border: `1px solid ${g.acquired ? 'rgba(5,150,105,0.3)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text)' }}>{g.name}</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: g.acquired ? '#059669' : '#dc2626' }}>{g.acquired ? '✓ Acquired' : '✗ Missing'}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: 10, background: 'var(--bg-3)', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-2)' }}>
        Algorithm: Set Difference — <code>target_skills ∩ ¬ user_skills</code> → {gaps.filter(g => !g.acquired).length} skills to learn
      </div>
    </div>
  );
}

export default function AlgorithmPage() {
  return (
    <div className="page-wrapper">
      <Head><title>Algorithm Transparency — LearnPath AI</title></Head>
      <NavBar active="algorithm" />
      <main className="container" style={{ paddingTop: 64, paddingBottom: 40 }}>
        <h1 className="page-title">Algorithm Transparency</h1>
        <p className="page-subtitle">See exactly how our AI works. Every algorithm is deterministic, explainable, and runs client-side.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>1. Topological Sort (DAG Traversal)</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: 16 }}>Kahn's algorithm ensures prerequisites are always learned before dependent skills. Watch nodes with zero in-degree get processed first.</p>
            <TopoDemo />
          </section>

          <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>2. 5-Factor Hybrid Scoring</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: 16 }}>Each skill is scored on 5 weighted factors. Adjust the sliders to see how the final score changes.</p>
            <ScoringDemo />
          </section>

          <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>3. Skill Gap Analysis (Set Difference)</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: 16 }}>Compares your current skills against career path requirements using set operations.</p>
            <GapDemo />
          </section>
        </div>
      </main>
    </div>
  );
}
