import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { getLearningPath, getProfile, toggleSkillComplete, computePathProgress } from '../lib/engine';
import ExplanationModal from '../components/ExplanationModal';

export default function LearningPathPage() {
  const [path, setPath] = useState(null);
  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState({ overall: 0, phases: [] });
  const [expanded, setExpanded] = useState({});
  const [modal, setModal] = useState({ open: false, title: '', content: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = getProfile();
    setProfile(p);
    if (p) {
      const lp = getLearningPath(p);
      setPath(lp);
      setProgress(computePathProgress(p, lp));
    }
    setLoading(false);
  }, []);

  if (loading) return (
    <div className="page-wrapper">
      <NavBar />
      <main className="container loading-container">
        <div className="loading-spinner" />
      </main>
    </div>
  );

  if (!path) return (
    <div className="page-wrapper">
      <Head><title>Learning Path — LearnPath AI</title></Head>
      <NavBar active="path" />
      <main className="container page-body">
        <div className="empty-state">
          <h2>No Learning Path Yet</h2>
          <p>Complete your profile through the AI Assistant to generate a personalized learning path.</p>
          <Link href="/chat" className="btn btn-primary">Start with AI Assistant</Link>
        </div>
      </main>
    </div>
  );

  const togglePhase = (idx) => setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));

  const handleToggle = (skillId) => {
    const updated = toggleSkillComplete(profile, skillId);
    if (!updated) return;
    setProfile({ ...updated });
    setProgress(computePathProgress(updated, path));
  };

  return (
    <div className="page-wrapper">
      <Head><title>Learning Path — LearnPath AI</title></Head>
      <NavBar active="path" />
      <main className="container page-body">
        <div className="page-header">
          <h1 className="page-title">Your Learning Path</h1>
          <p className="page-subtitle">{path.career_title} · {path.total_skills} skills · {path.estimated_weeks} weeks estimated</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card stat-card--accent">
            <div className="stat-value t-num">{path.total_skills}</div>
            <div className="stat-label">Skills to Learn</div>
          </div>
          <div className="stat-card">
            <div className="stat-value t-num">{path.estimated_weeks}w</div>
            <div className="stat-label">Est. Weeks</div>
          </div>
          <div className="stat-card">
            <div className="stat-value t-num">{path.phases.length}</div>
            <div className="stat-label">Phases</div>
          </div>
          <div className="stat-card">
            <div className="stat-value t-num">{path.difficulty_distribution?.beginner || 0}</div>
            <div className="stat-label">Beginner</div>
          </div>
        </div>

        <div className="overall-progress">
          <div className="overall-progress-head">
            <span className="t-label">Overall Progress</span>
            <span className="t-num">{progress.overall}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress.overall}%` }} />
          </div>
        </div>

        <div className="path-phases">
          {path.phases.map((phase, i) => (
            <div key={i} className={`phase-section ${expanded[i] ? 'expanded' : ''}`}>
              <div className="phase-header" onClick={() => togglePhase(i)}>
                <div className="phase-badge">Phase {phase.phase}</div>
                <div className="phase-header-body">
                  <h3 className="phase-title">{phase.name}</h3>
                  <p className="phase-desc">{phase.description}</p>
                </div>
                <div className="phase-header-meta">
                  <span className="phase-progress">{progress.phases[i] ? `${progress.phases[i].done}/${progress.phases[i].total}` : '0/0'}</span>
                  <span className="phase-duration">{phase.duration_weeks}w</span>
                  <span className={`phase-chevron ${expanded[i] ? 'open' : ''}`}>&#9662;</span>
                </div>
              </div>
              {expanded[i] && (
                <div className="phase-body">
                  <div className="phase-courses">
                    {phase.courses.map((course, j) => {
                      const isDone = (profile.completed_courses || []).includes(course.skill_id);
                      return (
                      <div
                        key={j}
                        className={`course-card ${isDone ? 'course-card--done' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setModal({ open: true, title: course.title, content: course }); }}
                      >
                        <div className="course-card-top">
                          <div className="course-card-info">
                            <h4 className="course-card-title">{course.title}</h4>
                            <p className="course-card-meta">{course.provider} · {course.duration_hours}h · {course.level}</p>
                          </div>
                          <span className="badge badge-accent course-type-badge">{isDone ? '✓ Done' : course.type}</span>
                        </div>
                        {course.description && <p className="course-card-desc">{course.description}</p>}
                        <div className="course-card-actions">
                          {course.provider_url && (
                            <a
                              className="course-card-link"
                              href={course.provider_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Open course on {course.provider} ↗
                            </a>
                          )}
                          <button
                            className={`btn btn-sm ${isDone ? 'btn-ghost' : 'btn-primary'} course-complete-btn`}
                            onClick={(e) => { e.stopPropagation(); handleToggle(course.skill_id); }}
                          >
                            {isDone ? 'Mark Incomplete' : 'Mark Complete'}
                          </button>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                  {phase.projects && phase.projects.length > 0 && (
                    <div className="phase-sublist">
                      <div className="phase-sublist-title">Projects</div>
                      <div className="phase-subgrid">
                        {phase.projects.map((p, k) => (
                          <div key={k} className="sub-card sub-card--project">
                            <span className="sub-card-badge">Build</span>
                            <span className="sub-card-title">{p.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {phase.assessments && phase.assessments.length > 0 && (
                    <div className="phase-sublist">
                      <div className="phase-sublist-title">Assessments</div>
                      <div className="phase-subgrid">
                        {phase.assessments.map((a, k) => (
                          <div key={k} className="sub-card sub-card--assess">
                            <span className="sub-card-badge">Check</span>
                            <span className="sub-card-title">{a.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      <ExplanationModal open={modal.open} onClose={() => setModal({ open: false })} title={modal.title} content={modal.content} />
    </div>
  );
}
