import { useState } from 'react';
import Head from 'next/head';
import NavBar from '../components/NavBar';
import { SKILL_GRAPH, SKILL_DEMAND, DOMAIN_NAMES } from '../lib/skillGraph';

const DOMAIN_COLORS = {
  programming: '#7c5cfc', web_development: '#34d399', data_science: '#fbbf24',
  machine_learning: '#c084fc', cloud_computing: '#22d3ee', cybersecurity: '#f87171',
  mobile_development: '#fb7185', math: '#9b80ff', mlops: '#2dd4bf',
};

const skillMap = Object.fromEntries(SKILL_GRAPH.skills.map(s => [s.id, s]));
const paths = Object.entries(SKILL_GRAPH.career_paths).map(([id, p]) => ({ id, ...p }));

export default function CareerPathsPage() {
  const [selected, setSelected] = useState(['data_scientist', 'full_stack_developer']);

  const selectedPaths = paths.filter(p => selected.includes(p.id));
  const overlap = {};
  if (selectedPaths.length >= 2) {
    const sets = selectedPaths.map(p => new Set(p.target_skills));
    for (let i = 0; i < sets.length; i++) {
      for (let j = i + 1; j < sets.length; j++) {
        const common = [...sets[i]].filter(s => sets[j].has(s));
        if (common.length > 0) overlap[`${selectedPaths[i].display_name} ↔ ${selectedPaths[j].display_name}`] = common;
      }
    }
  }

  const togglePath = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev);
  };

  return (
    <div className="page-wrapper">
      <Head><title>Career Paths — LearnPath AI</title></Head>
      <NavBar active="career" />
      <main className="container" style={{ paddingTop: 72, paddingBottom: 48 }}>
        <div className="page-header">
          <h1 className="page-title">Career Path Comparison</h1>
          <p className="page-subtitle">Compare career paths side by side. Find overlap and transferable skills.</p>
        </div>

        <div className="toggle-group" style={{ marginBottom: 28 }}>
          {paths.map(p => (
            <button key={p.id} className={`toggle-btn ${selected.includes(p.id) ? 'active' : ''}`} onClick={() => togglePath(p.id)}>
              {p.display_name} ({p.target_skills.length})
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(selectedPaths.length, 3)}, 1fr)`, gap: 16, marginBottom: 28 }}>
          {selectedPaths.map(p => (
            <div key={p.id} className="career-card">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4, letterSpacing: '-0.02em' }}>{p.display_name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.6 }}>{p.description}</p>
              <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                <div className="career-stat"><span className="career-stat-val" style={{ color: 'var(--accent-2)' }}>{p.avg_salary}</span><span className="career-stat-lbl">Salary</span></div>
                <div className="career-stat"><span className="career-stat-val" style={{ color: 'var(--green)' }}>{p.growth_rate}</span><span className="career-stat-lbl">Growth</span></div>
                <div className="career-stat"><span className="career-stat-val" style={{ color: 'var(--text)' }}>{p.target_skills.length}</span><span className="career-stat-lbl">Skills</span></div>
              </div>
              <div className="form-label" style={{ marginBottom: 8 }}>Required Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {p.target_skills.map(s => {
                  const sk = skillMap[s];
                  const color = DOMAIN_COLORS[sk?.domain] || 'var(--text-3)';
                  return <span key={s} className="skill-tag" style={{ borderColor: `${color}30`, color }}>{sk?.name || s}</span>;
                })}
              </div>
            </div>
          ))}
        </div>

        {Object.keys(overlap).length > 0 && (
          <section className="career-overlap-card">
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 14 }}>Skill Overlap Analysis</h2>
            {Object.entries(overlap).map(([pair, skills]) => (
              <div key={pair} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>{pair} — {skills.length} shared skills</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {skills.map(s => <span key={s} className="skill-tag acquired">{skillMap[s]?.name || s}</span>)}
                </div>
              </div>
            ))}
            <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.6, marginTop: 4 }}>Learning shared skills first maximizes transferability across career paths.</p>
          </section>
        )}
      </main>
    </div>
  );
}
