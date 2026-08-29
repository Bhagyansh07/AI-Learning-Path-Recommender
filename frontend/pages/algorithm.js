import { useState, useEffect } from 'react';
import Head from 'next/head';
import NavBar from '../components/NavBar';
import { Footer } from '../components/LegalLayout';
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
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button className="btn btn-primary btn-sm" onClick={startSort} disabled={running}>Run Topological Sort</button>
        <button className="btn btn-secondary btn-sm" onClick={() => { setSorted([]); setQueue([]); setStep(0); setRunning(false); }}>Reset</button>
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="form-label" style={{ marginBottom: 8 }}>Input Queue</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {queue.length === 0 && !running && sorted.length === 0 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Click Run to start</span>
            )}
            {queue.map(id => (
              <span key={id} className="skill-tag" style={{ borderColor: 'var(--accent)', color: 'var(--accent-2)', background: 'var(--accent-dim)' }}>
                {skillMap[id]?.name || id}
              </span>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="form-label" style={{ marginBottom: 8 }}>
            Sorted Output <span className="t-num" style={{ color: 'var(--accent-2)' }}>(Step {step})</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {sorted.map((id, i) => (
              <span
                key={id}
                className={`skill-tag ${i === sorted.length - 1 ? 'acquired' : ''}`}
              >
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

  // Compute total with safe fallback (avoid division-by-zero)
  const rawTotal = skillGap + careerMatch + demand + difficulty + prereqs;
  const total = rawTotal > 0 ? rawTotal : 1;

  // Normalized percentages so progress bars always sum to 100%
  const norm = rawTotal > 0 ? 100 / rawTotal : 0;

  const factors = [
    { label: 'Skill Gap', value: skillGap, set: setSkillGap, color: 'var(--purple)', max: 50 },
    { label: 'Career Match', value: careerMatch, set: setCareerMatch, color: 'var(--green)', max: 40 },
    { label: 'Job Demand', value: demand, set: setDemand, color: 'var(--amber)', max: 30 },
    { label: 'Difficulty Fit', value: difficulty, set: setDifficulty, color: 'var(--cyan)', max: 20 },
    { label: 'Prerequisites', value: prereqs, set: setPrereqs, color: 'var(--accent-2)', max: 20 },
  ];

  // Normalized values for progress bars
  const normValues = factors.map(f => Math.round(f.value * norm));

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 16 }}>
        {factors.map(f => (
          <div key={f.label} className="card" style={{ padding: 14 }}>
            <div className="form-label" style={{ marginBottom: 6 }}>{f.label}</div>
            <div className="t-num" style={{ fontSize: '1.2rem', fontWeight: 800, color: f.color }}>{f.value}%</div>
            <input
              type="range"
              min={0}
              max={f.max}
              value={f.value}
              onChange={e => f.set(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: f.color }}
            />
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span className="t-label">Final Score</span>
          <span className="t-num" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-2)' }}>{rawTotal > 0 ? Math.round(rawTotal * norm) : 0}%</span>
        </div>
        <div style={{ height: 24, background: 'var(--bg-4)', borderRadius: 'var(--r-sm)', overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${skillGap * norm}%`, background: 'var(--purple)', transition: 'width 0.3s' }} />
          <div style={{ width: `${careerMatch * norm}%`, background: 'var(--green)', transition: 'width 0.3s' }} />
          <div style={{ width: `${demand * norm}%`, background: 'var(--amber)', transition: 'width 0.3s' }} />
          <div style={{ width: `${difficulty * norm}%`, background: 'var(--cyan)', transition: 'width 0.3s' }} />
          <div style={{ width: `${prereqs * norm}%`, background: 'var(--accent-2)', transition: 'width 0.3s' }} />
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Skill Gap', color: 'var(--purple)' },
            { label: 'Career', color: 'var(--green)' },
            { label: 'Demand', color: 'var(--amber)' },
            { label: 'Difficulty', color: 'var(--cyan)' },
            { label: 'Prereqs', color: 'var(--accent-2)' },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', color: 'var(--text-3)' }}>
              <div style={{ width: 6, height: 6, borderRadius: 2, background: f.color }} />
              {f.label}
            </div>
          ))}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span className="form-label" style={{ margin: 0 }}>Target: ML Engineer (demo profile)</span>
        <span className="t-num" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-2)' }}>{pct}% ready</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 8 }}>
        {gaps.map(g => (
          <div
            key={g.id}
            style={{
              padding: '10px 14px',
              background: g.acquired ? 'var(--green-dim)' : 'var(--red-dim)',
              border: `1px solid ${g.acquired ? 'color-mix(in srgb, var(--green) 25%, transparent)' : 'color-mix(in srgb, var(--red) 25%, transparent)'}`,
              borderRadius: 'var(--r-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{g.name}</span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: g.acquired ? 'var(--green)' : 'var(--red)',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {g.acquired ? 'Acquired' : 'Missing'}
            </span>
          </div>
        ))}
      </div>
      <div className="algo-code" style={{ marginTop: 14 }}>
        <span className="kw">Algorithm</span>: Set Difference — <span className="kw">target_skills</span> ∩ ¬ <span className="kw">user_skills</span> → <span className="num">{gaps.filter(g => !g.acquired).length}</span> skills to learn
      </div>
    </div>
  );
}

export default function AlgorithmPage() {
  return (
    <div className="page-wrapper">
      <Head><title>Algorithm Transparency — LearnPath AI</title></Head>
      <NavBar active="algorithm" />
      <main className="container" style={{ paddingTop: 72, paddingBottom: 48 }}>
        <div className="page-header">
          <h1 className="page-title">Algorithm Transparency</h1>
          <p className="page-subtitle">See exactly how our AI works. Every algorithm is deterministic, explainable, and runs client-side.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <section className="algo-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 className="t-heading" style={{ fontSize: '1.05rem' }}>1. Topological Sort (DAG Traversal)</h2>
              <span className="algo-tag">O(V + E)</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 16 }}>
              Kahn's algorithm ensures prerequisites are always learned before dependent skills. Watch nodes with zero in-degree get processed first.
            </p>
            <TopoDemo />
            <div className="algo-code" style={{ marginTop: 14 }}>
              <span className="kw">function</span> <span className="fn">topologicalSort</span>(skillIds) {'{\n'}
              {'  '}<span className="kw">const</span> inDeg = <span className="fn">computeInDegrees</span>(skillIds);{'\n'}
              {'  '}<span className="kw">const</span> queue = <span className="fn">getZeroInDegreeNodes</span>(inDeg);{'\n'}
              {'  '}<span className="kw">while</span> (queue.length) {'{\n'}
              {'    '}<span className="kw">const</span> node = queue.<span className="fn">shift</span>();{'\n'}
              {'    '}sorted.<span className="fn">push</span>(node);{'\n'}
              {'    '}<span className="fn">decrementNeighbors</span>(node, inDeg, queue);{'\n'}
              {'  }'}{'}\n'}
              {'  '}<span className="kw">return</span> sorted; <span className="str">// Valid learning order</span>
              {'\n}'}
            </div>
          </section>

          <section className="algo-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 className="t-heading" style={{ fontSize: '1.05rem' }}>2. 5-Factor Hybrid Scoring</h2>
              <span className="algo-tag">Weighted</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 16 }}>
              Each skill is scored on 5 weighted factors. Adjust the sliders to see how the final score changes.
            </p>
            <ScoringDemo />
          </section>

          <section className="algo-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 className="t-heading" style={{ fontSize: '1.05rem' }}>3. Skill Gap Analysis (Set Difference)</h2>
              <span className="algo-tag">Set Theory</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 16 }}>
              Compares your current skills against career path requirements using set operations.
            </p>
            <GapDemo />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
