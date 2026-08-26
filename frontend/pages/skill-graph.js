import { useState, useRef, useEffect, useCallback } from 'react';
import Head from 'next/head';
import NavBar from '../components/NavBar';
import { SKILL_GRAPH, SKILL_DEMAND, DOMAIN_NAMES } from '../lib/skillGraph';

const DOMAIN_COLORS = {
  programming: '#3b82f6', web_development: '#22c55e', data_science: '#f59e0b',
  machine_learning: '#8b5cf6', cloud_computing: '#06b6d4', cybersecurity: '#ef4444',
  mobile_development: '#ec4899', math: '#6366f1', mlops: '#14b8a6',
};

function layoutGraph(skills) {
  const levels = {};
  const placed = new Set();
  const roots = skills.filter(s => s.prerequisites.length === 0);
  roots.forEach(r => { levels[r.id] = 0; placed.add(r.id); });
  let changed = true;
  let iter = 0;
  while (changed && iter < 20) {
    changed = false; iter++;
    for (const s of skills) {
      if (placed.has(s.id)) continue;
      const prereqs = s.prerequisites.filter(p => placed.has(p));
      if (prereqs.length === s.prerequisites.length && s.prerequisites.length > 0) {
        levels[s.id] = Math.max(...prereqs.map(p => levels[p])) + 1;
        placed.add(s.id); changed = true;
      }
    }
  }
  skills.forEach(s => { if (!placed.has(s.id)) levels[s.id] = 0; });
  const byLevel = {};
  Object.entries(levels).forEach(([id, lv]) => { (byLevel[lv] = byLevel[lv] || []).push(id); });
  const positions = {};
  Object.entries(byLevel).forEach(([lv, ids]) => {
    ids.forEach((id, i) => {
      positions[id] = { x: 120 + parseInt(lv) * 160, y: 60 + i * 50 };
    });
  });
  return { positions, levels };
}

export default function SkillGraphPage() {
  const svgRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [filter, setFilter] = useState('all');

  const skills = SKILL_GRAPH.skills;
  const { positions } = layoutGraph(skills);
  const skillsMap = Object.fromEntries(skills.map(s => [s.id, s]));

  const filteredSkills = filter === 'all' ? skills : skills.filter(s => s.domain === filter);
  const filteredIds = new Set(filteredSkills.map(s => s.id));

  const handleMouseDown = (e) => { setDragging(true); setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }); };
  const handleMouseMove = (e) => { if (dragging) setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const handleMouseUp = () => setDragging(false);
  const handleWheel = (e) => { e.preventDefault(); setZoom(z => Math.max(0.3, Math.min(3, z + (e.deltaY > 0 ? -0.1 : 0.1)))); };

  const domains = [...new Set(skills.map(s => s.domain))];
  const selectedSkill = selected ? skillsMap[selected] : null;
  const prereqChain = selected ? skills.filter(s => skillsMap[selected]?.prerequisites.includes(s.id)).map(s => s.name) : [];
  const downstream = selected ? skills.filter(s => s.prerequisites.includes(selected)).map(s => s.name) : [];

  return (
    <div className="page-wrapper">
      <Head><title>Skill Graph — LearnPath AI</title></Head>
      <NavBar active="graph" />
      <main className="container" style={{ paddingTop: 64, paddingBottom: 40 }}>
        <h1 className="page-title">Skill Dependency Graph</h1>
        <p className="page-subtitle">Interactive DAG — {skills.length} skills, {SKILL_GRAPH.skills.reduce((a, s) => a + s.prerequisites.length, 0)} prerequisite edges. Pan, zoom, click nodes for details.</p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilter('all')}>All ({skills.length})</button>
          {domains.map(d => (
            <button key={d} className={`btn btn-sm`} style={{ background: filter === d ? DOMAIN_COLORS[d] : 'var(--surface)', color: filter === d ? '#fff' : 'var(--text)', border: `1px solid ${DOMAIN_COLORS[d]}` }} onClick={() => setFilter(d)}>
              {DOMAIN_NAMES[d] || d}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', position: 'relative', height: 520, cursor: dragging ? 'grabbing' : 'grab' }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={handleWheel}>
            <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4, zIndex: 10 }}>
              <button className="btn btn-sm btn-secondary" onClick={() => setZoom(z => Math.min(3, z + 0.2))}>+</button>
              <button className="btn btn-sm btn-secondary" onClick={() => setZoom(z => Math.max(0.3, z - 0.2))}>−</button>
              <button className="btn btn-sm btn-secondary" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>Reset</button>
            </div>
            <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 1200 800`} style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}>
              <defs>
                <marker id="arrow" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto"><path d="M0,0 L10,3 L0,6" fill="var(--text-3)" fillOpacity="0.3" /></marker>
              </defs>
              {skills.map(s => {
                const from = positions[s.id];
                if (!from) return null;
                return s.prerequisites.map(pId => {
                  const to = positions[pId];
                  if (!to) return null;
                  const visible = filteredIds.has(s.id) && filteredIds.has(pId);
                  return <line key={`${s.id}-${pId}`} x1={to.x} y1={to.y} x2={from.x} y2={from.y} stroke="var(--text-3)" strokeOpacity={visible ? 0.3 : 0.08} strokeWidth={1} markerEnd="url(#arrow)" />;
                });
              })}
              {skills.map(s => {
                const pos = positions[s.id];
                if (!pos) return null;
                const visible = filteredIds.has(s.id);
                const isSelected = selected === s.id;
                const isHovered = hovered === s.id;
                const demand = SKILL_DEMAND[s.id] || 0.5;
                const color = DOMAIN_COLORS[s.domain] || '#666';
                return (
                  <g key={s.id} onClick={() => setSelected(isSelected ? null : s.id)} onMouseEnter={() => setHovered(s.id)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer', opacity: visible ? 1 : 0.15 }}>
                    <circle cx={pos.x} cy={pos.y} r={isSelected ? 18 : isHovered ? 16 : 14} fill={color} fillOpacity={isSelected ? 0.9 : 0.7} stroke={isSelected ? '#fff' : 'none'} strokeWidth={isSelected ? 2 : 0} style={{ transition: 'all 0.2s ease' }} />
                    {demand > 0.8 && <circle cx={pos.x + 10} cy={pos.y - 10} r={4} fill="#22c55e" />}
                    {visible && <text x={pos.x} y={pos.y + 28} textAnchor="middle" fontSize={9} fill="var(--text)" fontWeight={isSelected ? 700 : 400} style={{ pointerEvents: 'none' }}>{s.name.length > 18 ? s.name.substring(0, 16) + '…' : s.name}</text>}
                  </g>
                );
              })}
            </svg>
          </div>

          {selectedSkill && (
            <div style={{ width: 300, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: DOMAIN_COLORS[selectedSkill.domain] }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>{selectedSkill.name}</h3>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: 12 }}>
                {DOMAIN_NAMES[selectedSkill.domain]} · Difficulty {selectedSkill.difficulty} · {selectedSkill.estimated_hours}h
              </div>
              {prereqChain.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 4 }}>Prerequisites</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{prereqChain.map(p => <span key={p} style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--bg-3)', borderRadius: 4, border: '1px solid var(--border)' }}>{p}</span>)}</div>
                </div>
              )}
              {downstream.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 4 }}>Unlocks</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{downstream.map(d => <span key={d} style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--accent-dim)', borderRadius: 4, border: '1px solid var(--accent)', color: 'var(--accent)' }}>{d}</span>)}</div>
                </div>
              )}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>
                Job Demand: {Math.round((SKILL_DEMAND[selectedSkill.id] || 0.5) * 100)}%
              </div>
              {selectedSkill.resources?.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 4 }}>Resources</div>
                  {selectedSkill.resources.slice(0, 2).map((r, i) => (
                    <div key={i} style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginBottom: 2 }}>• {r.title} ({r.platform})</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
