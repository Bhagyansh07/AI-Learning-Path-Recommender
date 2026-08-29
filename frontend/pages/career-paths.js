import { useState } from 'react';
import Head from 'next/head';
import NavBar from '../components/NavBar';
import { Footer } from '../components/LegalLayout';
import { SKILL_GRAPH, SKILL_DEMAND, DOMAIN_NAMES } from '../lib/skillGraph';

const DOMAIN_VAR = {
  programming: 'var(--purple)',
  web_development: 'var(--green)',
  data_science: 'var(--amber)',
  machine_learning: 'var(--purple)',
  cloud_computing: 'var(--cyan)',
  cybersecurity: 'var(--red)',
  mobile_development: 'var(--red)',
  math: 'var(--purple)',
  mlops: 'var(--cyan)',
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
            <button
              key={p.id}
              className={`toggle-btn ${selected.includes(p.id) ? 'active' : ''}`}
              onClick={() => togglePath(p.id)}
            >
              {p.display_name} ({p.target_skills.length})
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(selectedPaths.length, 3)}, 1fr)`, gap: 16, marginBottom: 28 }}>
          {selectedPaths.map(p => (
            <div key={p.id} className="career-card">
              <div className="t-heading" style={{ fontSize: '1rem', marginBottom: 4 }}>{p.display_name}</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.6 }}>{p.description}</p>
              <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                <div className="career-stat">
                  <span className="career-stat-val t-num" style={{ color: 'var(--accent-2)' }}>{p.avg_salary}</span>
                  <span className="career-stat-lbl">Salary</span>
                </div>
                <div className="career-stat">
                  <span className="career-stat-val t-num" style={{ color: 'var(--green)' }}>{p.growth_rate}</span>
                  <span className="career-stat-lbl">Growth</span>
                </div>
                <div className="career-stat">
                  <span className="career-stat-val t-num">{p.target_skills.length}</span>
                  <span className="career-stat-lbl">Skills</span>
                </div>
              </div>
              <div className="form-label" style={{ marginBottom: 8 }}>Required Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {p.target_skills.map(s => {
                  const sk = skillMap[s];
                  return (
                    <span key={s} className="skill-tag" style={{ borderColor: `${DOMAIN_VAR[sk?.domain] || 'var(--text-3)'}30`, color: DOMAIN_VAR[sk?.domain] || 'var(--text-3)' }}>
                      {sk?.name || s}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {Object.keys(overlap).length > 0 && (
          <section className="career-overlap-card">
            <div className="t-label" style={{ marginBottom: 12 }}>Skill Overlap Analysis</div>
            {Object.entries(overlap).map(([pair, skills]) => (
              <div key={pair} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>
                  {pair} <span className="t-num" style={{ color: 'var(--accent-2)' }}>— {skills.length} shared skills</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {skills.map(s => (
                    <span key={s} className="skill-tag acquired">{skillMap[s]?.name || s}</span>
                  ))}
                </div>
              </div>
            ))}
            <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.6, marginTop: 4, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              Learning shared skills first maximizes transferability across career paths.
            </p>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
