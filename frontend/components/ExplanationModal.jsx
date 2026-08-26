import { useEffect } from 'react';
import { getSkillById, getDownstreamSkills, getCareerRelevance, SKILL_DEMAND, DOMAIN_NAMES } from '../lib/skillGraph';

export default function ExplanationModal({ skill, profile, isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleEsc); document.body.style.overflow = ''; };
  }, [isOpen, onClose]);

  if (!isOpen || !skill) return null;

  const skillId = skill.skill_id || skill.id;
  const skillName = skill.title || skill.name || 'Unknown Skill';
  const skillData = getSkillById(skillId);
  const userSkills = new Set((profile?.current_skills || []).map(s => typeof s === 'object' ? s.skill : s));

  const prerequisites = Array.isArray(skill.prerequisites) ? skill.prerequisites : Array.isArray(skillData?.prerequisites) ? skillData.prerequisites : [];
  const metPrereqs = prerequisites.filter(p => userSkills.has(p));
  const unmetPrereqs = prerequisites.filter(p => !userSkills.has(p));

  const downstream = getDownstreamSkills(skillId);
  const careers = getCareerRelevance(skillId);
  const demand = SKILL_DEMAND[skillId];
  const hours = skill.duration_hours || skillData?.estimated_hours || 0;
  const level = skill.level || (skillData?.difficulty <= 2 ? 'beginner' : skillData?.difficulty <= 3 ? 'intermediate' : 'advanced');
  const domain = skillData?.domain;
  const resources = skillData?.resources || [];

  const explanation = skill.explanation || skill.why_this || skillData?.name
    ? `This skill is recommended because it builds the foundation for ${downstream.length > 0 ? downstream.map(d => d.name).join(', ') : 'advanced topics in your target career path'}.`
    : 'Recommended for your learning path.';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3 className="modal-title">Why {skillName}?</h3>

        <section className="modal-section">
          <h4>In Your Path Because</h4>
          <p>{explanation}</p>
        </section>

        {downstream.length > 0 && (
          <section className="modal-section">
            <h4>Unlocks {downstream.length} Downstream Skill{downstream.length > 1 ? 's' : ''}</h4>
            <div className="modal-tags">
              {downstream.map(d => <span key={d.id} className="modal-tag">{d.name}</span>)}
            </div>
          </section>
        )}

        <section className="modal-section">
          <h4>Prerequisites</h4>
          {prerequisites.length === 0 ? (
            <p className="modal-prereq-all">No prerequisites — start immediately.</p>
          ) : (
            <>
              <p className="modal-prereq-count">{metPrereqs.length} of {prerequisites.length} met</p>
              {metPrereqs.length > 0 && (
                <div className="modal-tags">
                  {metPrereqs.map(p => <span key={p} className="modal-tag met">{getSkillById(p)?.name || p} ✓</span>)}
                </div>
              )}
              {unmetPrereqs.length > 0 && (
                <div className="modal-tags">
                  {unmetPrereqs.map(p => <span key={p} className="modal-tag unmet">{getSkillById(p)?.name || p}</span>)}
                </div>
              )}
            </>
          )}
        </section>

        {resources.length > 0 && (
          <section className="modal-section">
            <h4>Resources</h4>
            <div className="modal-resources">
              {resources.slice(0, 3).map((r, i) => (
                <div key={i} className="modal-resource">
                  <span className="modal-resource-type">{r.type}</span>
                  <span className="modal-resource-title">{r.title}</span>
                  <span className="modal-resource-platform">{r.platform}{r.free ? ' (Free)' : ''}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {careers.length > 0 && (
          <section className="modal-section">
            <h4>Career Relevance</h4>
            <div className="modal-tags">
              {careers.map(c => <span key={c.id} className="modal-tag career">{c.name}</span>)}
            </div>
          </section>
        )}

        <div className="modal-meta-row">
          <div className="modal-meta-item">
            <span className="modal-meta-label">Time</span>
            <span className="modal-meta-value">{hours}h</span>
          </div>
          <div className="modal-meta-item">
            <span className="modal-meta-label">Difficulty</span>
            <span className="modal-meta-value">{level}</span>
          </div>
          {domain && (
            <div className="modal-meta-item">
              <span className="modal-meta-label">Domain</span>
              <span className="modal-meta-value">{DOMAIN_NAMES[domain] || domain}</span>
            </div>
          )}
          {demand !== undefined && (
            <div className="modal-meta-item">
              <span className="modal-meta-label">Job Demand</span>
              <span className="modal-meta-value">{Math.round(demand * 100)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
