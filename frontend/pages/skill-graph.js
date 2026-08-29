import { useState, useRef, useEffect } from 'react';
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

function layoutGraph(skills) {
  const levels = {};
  const placed = new Set();
  const roots = skills.filter(s => s.prerequisites.length === 0);
  roots.forEach(r => { levels[r.id] = 0; placed.add(r.id); });
  let changed = true, iter = 0;
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
  return { positions };
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
      <main className="container" style={{ paddingTop: 72, paddingBottom: 48 }}>
        <div className="page-header">
          <h1 className="page-title">Skill Dependency Graph</h1>
          <p className="page-subtitle">Interactive DAG — {skills.length} skills, {skills.reduce((a, s) => a + s.prerequisites.length, 0)} prerequisite edges. Pan, zoom, click nodes.</p>
        </div>

        <div className="toggle-group" style={{ marginBottom: 16 }}>
          <button className={`toggle-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All ({skills.length})
          </button>
          {domains.map(d => (
            <button
              key={d}
              className={`toggle-btn ${filter === d ? 'active' : ''}`}
              style={filter === d ? { background: DOMAIN_VAR[d], borderColor: DOMAIN_VAR[d] } : {}}
              onClick={() => setFilter(d)}
            >
              {DOMAIN_NAMES[d] || d}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div
            className={`graph-container ${dragging ? 'dragging' : ''}`}
            style={{ flex: 1, height: 540 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <div className="graph-controls">
              <button className="btn btn-sm btn-secondary" onClick={() => setZoom(z => Math.min(3, z + 0.2))}>+</button>
              <button className="btn btn-sm btn-secondary" onClick={() => setZoom(z => Math.max(0.3, z - 0.2))}>−</button>
              <button className="btn btn-sm btn-secondary" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>Reset</button>
            </div>
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              viewBox="0 0 1200 800"
              style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}
            >
              <defs>
                <marker id="arrow" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto">
                  <path d="M0,0 L10,3 L0,6" fill="var(--text-3)" fillOpacity="0.25" />
                </marker>
              </defs>
              {skills.map(s => {
                const from = positions[s.id];
                if (!from) return null;
                return s.prerequisites.map(pId => {
                  const to = positions[pId];
                  if (!to) return null;
                  const visible = filteredIds.has(s.id) && filteredIds.has(pId);
                  return (
                    <line
                      key={`${s.id}-${pId}`}
                      x1={to.x} y1={to.y}
                      x2={from.x} y2={from.y}
                      stroke="var(--text-3)"
                      strokeOpacity={visible ? 0.25 : 0.06}
                      strokeWidth={1}
                      markerEnd="url(#arrow)"
                    />
                  );
                });
              })}
              {skills.map(s => {
                const pos = positions[s.id];
                if (!pos) return null;
                const visible = filteredIds.has(s.id);
                const isSelected = selected === s.id;
                const isHovered = hovered === s.id;
                const demand = SKILL_DEMAND[s.id] || 0.5;
                const color = DOMAIN_VAR[s.domain] || 'var(--text-3)';
                return (
                  <g
                    key={s.id}
                    onClick={() => setSelected(isSelected ? null : s.id)}
                    onMouseEnter={() => setHovered(s.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: 'pointer', opacity: visible ? 1 : 0.12 }}
                  >
                    <circle
                      cx={pos.x} cy={pos.y}
                      r={isSelected ? 18 : isHovered ? 16 : 14}
                      fill={color}
                      fillOpacity={isSelected ? 0.95 : 0.7}
                      stroke={isSelected ? 'var(--text)' : 'none'}
                      strokeWidth={isSelected ? 2.5 : 0}
                      style={{ transition: 'all 0.2s ease' }}
                    />
                    {demand > 0.8 && (
                      <circle cx={pos.x + 10} cy={pos.y - 10} r={4} fill="var(--green)" />
                    )}
                    {visible && (
                      <text
                        x={pos.x} y={pos.y + 28}
                        textAnchor="middle"
                        fontSize={9}
                        fill="var(--text)"
                        fontWeight={isSelected ? 700 : 400}
                        style={{ pointerEvents: 'none' }}
                      >
                        {s.name.length > 18 ? s.name.substring(0, 16) + '…' : s.name}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {selectedSkill && (
            <div className="graph-sidebar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: DOMAIN_VAR[selectedSkill.domain] }} />
                <h3 className="t-heading" style={{ fontSize: '1rem' }}>{selectedSkill.name}</h3>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: 14 }}>
                {DOMAIN_NAMES[selectedSkill.domain]} · Difficulty {selectedSkill.difficulty} · {selectedSkill.estimated_hours}h
              </div>
              {prereqChain.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div className="form-label" style={{ marginBottom: 6 }}>Prerequisites</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {prereqChain.map(p => <span key={p} className="skill-tag">{p}</span>)}
                  </div>
                </div>
              )}
              {downstream.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div className="form-label" style={{ marginBottom: 6 }}>Unlocks</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {downstream.map(d => (
                      <span key={d} className="skill-tag acquired">{d}</span>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', marginBottom: 14 }}>
                Job Demand: <span className="t-num" style={{ fontWeight: 700, color: 'var(--accent-2)' }}>
                  {Math.round((SKILL_DEMAND[selectedSkill.id] || 0.5) * 100)}%
                </span>
              </div>
              {selectedSkill.resources?.length > 0 && (
                <div>
                  <div className="form-label" style={{ marginBottom: 6 }}>Resources</div>
                  {selectedSkill.resources.slice(0, 2).map((r, i) => (
                    <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-2)', marginBottom: 4 }}>
                      {r.title} ({r.platform})
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
