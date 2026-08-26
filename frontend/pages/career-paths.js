import { useState } from 'react';
import Head from 'next/head';
import NavBar from '../components/NavBar';
import { SKILL_GRAPH, SKILL_DEMAND, DOMAIN_NAMES } from '../lib/skillGraph';

const DOMAIN_COLORS = {
  programming: '#3b82f6', web_development: '#22c55e', data_science: '#f59e0b',
  machine_learning: '#8b5cf6', cloud_computing: '#06b6d4', cybersecurity: '#ef4444',
  mobile_development: '#ec4899', math: '#6366f1', mlops: '#14b8a6',
};

const skillMap = Object.fromEntries(SKILL_GRAPH.skills.map(s => [s.id, s]));
const paths = Object.entries(SKILL_GRAPH.career_paths).map(([id, p]) => ({ id, ...p }));

export default function CareerPathsPage() {
  const [selected, setSelected] = useState(['data_scientist', 'full_stack_developer']);

  const selectedPaths = paths.filter(p => selected.includes(p.id));
  const allSkills = {};
  selectedPaths.forEach(p => {
    (p.target_skills || []).forEach(s => {
      if (!allSkills[s]) allSkills[s] = { name: skillMap[s]?.name || s, paths: [], domain: skillMap[s]?.domain };
      allSkills[s].paths.push(p.display_name);
    });
  });

  const overlap = {};
  if (selectedPaths.length >= 2) {
    const sets = selectedPaths.map(p => new Set(p.target_skills));
    for (let i = 0; i < sets.length; i++) {
      for (let j = i + 1; j < sets.length; j++) {
        const common = [...sets[i]].filter(s => sets[j].has(s));
        overlap[`${selectedPaths[i].display_name} ↔ ${selectedPaths[j].display_name}`] = common;
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
      <main className="container" style={{ paddingTop: 64, paddingBottom: 40 }}>
        <h1 className="page-title">Career Path Comparison</h1>
        <p className="page-subtitle">Compare career paths side by side. Find overlap, transferable skills, and the best path for you.</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {paths.map(p => (
            <button key={p.id} className={`btn btn-sm`} style={{ background: selected.includes(p.id) ? 'var(--primary)' : 'var(--bg-card)', color: selected.includes(p.id) ? '#fff' : 'var(--text)', border: '1px solid var(--border)' }} onClick={() => togglePath(p.id)}>
              {p.display_name} ({p.target_skills.length})
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(selectedPaths.length, 3)}, 1fr)`, gap: 16, marginBottom: 24 }}>
          {selectedPaths.map(p => (
            <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{p.display_name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{p.description}</p>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div><div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Salary</div><div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>{p.avg_salary}</div></div>
                <div><div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Growth</div><div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#22c55e' }}>{p.growth_rate}</div></div>
                <div><div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Skills</div><div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>{p.target_skills.length}</div></div>
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Required Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {p.target_skills.map(s => {
                  const sk = skillMap[s];
                  return <span key={s} style={{ padding: '2px 6px', background: DOMAIN_COLORS[sk?.domain] + '15', border: `1px solid ${DOMAIN_COLORS[sk?.domain]}40`, borderRadius: 4, fontSize: '0.65rem', color: DOMAIN_COLORS[sk?.domain] }}>{sk?.name || s}</span>;
                })}
              </div>
            </div>
          ))}
        </div>

        {Object.keys(overlap).length > 0 && (
          <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Skill Overlap Analysis</h2>
            {Object.entries(overlap).map(([pair, skills]) => (
              <div key={pair} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{pair} — {skills.length} shared skills ({Math.round((skills.length / Math.max(...selectedPaths.map(p => p.target_skills.length))) * 100)}% overlap)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {skills.map(s => <span key={s} style={{ padding: '3px 8px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600, color: '#22c55e' }}>{skillMap[s]?.name || s}</span>)}
                </div>
              </div>
            ))}
            <div style={{ marginTop: 8, padding: 10, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              💡 Learning shared skills first maximizes transferability across career paths.
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
