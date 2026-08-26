import { COURSES, SKILLS, CAREER_PATHS, PREREQUISITES, COURSE_TO_SKILLS } from './data';

const STOP_WORDS = new Set(["the","a","an","is","are","was","were","in","on","at","to","for","of","with","by","from","and","or","but","not","this","that","it","as","be","has","had","have","do","does","did","will","would","can","could","should","may","might","shall","need","must","using","learn","build","your","you"]);

const LEVEL_MAP = { beginner: 0, intermediate: 1, advanced: 2 };

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9_]/g, ' ').split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

function cosineSim(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0, magA = 0, magB = 0;
  for (const k of keys) {
    dot += (a[k] || 0) * (b[k] || 0);
    magA += (a[k] || 0) ** 2;
    magB += (b[k] || 0) ** 2;
  }
  return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
}

function computeIDF(documents) {
  const df = {};
  const N = documents.length;
  for (const doc of documents) {
    const unique = new Set(tokenize(doc));
    for (const t of unique) df[t] = (df[t] || 0) + 1;
  }
  const idf = {};
  for (const [t, freq] of Object.entries(df)) idf[t] = Math.log((N + 1) / (freq + 1)) + 1;
  return idf;
}

function tfidfVector(text, idf) {
  const tokens = tokenize(text);
  const tf = {};
  for (const t of tokens) tf[t] = (tf[t] || 0) + 1;
  const vec = {};
  for (const [t, count] of Object.entries(tf)) {
    vec[t] = (count / tokens.length) * (idf[t] || 1);
  }
  return vec;
}

function courseText(c) {
  return [c.title, c.domain.replace(/_/g, ' '), c.description, (c.skills_taught || []).join(' '), c.level, c.provider].join(' ');
}

const IDF = computeIDF(COURSES.map(courseText));
const COURSE_VECS = COURSES.map(c => tfidfVector(courseText(c), IDF));

export function tfidfScore(query, topK = 20) {
  const qVec = tfidfVector(query, IDF);
  const scores = COURSES.map((c, i) => ({ course: c, score: cosineSim(qVec, COURSE_VECS[i]) }));
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, topK);
}

export function createProfile(data) {
  const profile = {
    id: 'p_' + Date.now().toString(36),
    name: data.name || 'Learner',
    experience_level: data.experience_level || 'beginner',
    interests: data.interests || [],
    current_skills: data.current_skills || [],
    completed_courses: data.completed_courses || [],
    career_goals: data.career_goals || [],
    time_commitment: data.time_commitment || '5-10 hours',
    progress: { total_courses_completed: 0, total_hours_learned: 0, skills_acquired: data.current_skills || [] },
  };
  if (typeof window !== 'undefined') localStorage.setItem('learner_profile', JSON.stringify(profile));
  return profile;
}

export function getProfile() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('learner_profile')); } catch { return null; }
}

export function updateProfile(updates) {
  const p = getProfile();
  if (!p) return null;
  Object.assign(p, updates);
  if (typeof window !== 'undefined') localStorage.setItem('learner_profile', JSON.stringify(p));
  return p;
}

function getUserSkills(profile) {
  const s = new Set();
  (profile.current_skills || []).forEach(sk => s.add(typeof sk === 'object' ? sk.skill : sk));
  (profile.completed_courses || []).forEach(cid => {
    (COURSE_TO_SKILLS[cid] || []).forEach(sk => s.add(sk));
  });
  return s;
}

export function hybridScore(profile, courseId, mlScore = 0) {
  const course = COURSES.find(c => c.course_id === courseId);
  if (!course) return { total: 0, breakdown: {} };
  const userSkills = getUserSkills(profile);
  const courseSkills = new Set(course.skills_taught || []);
  const missing = [...courseSkills].filter(s => !userSkills.has(s));

  const skillGapScore = courseSkills.size === 0 ? 0.5 : Math.min((missing.length / courseSkills.size) * 0.6 + missing.reduce((sum, s) => sum + ((SKILLS[s] || {}).demand_score || 0.5), 0) / Math.max(missing.length, 1) * 0.4, 1);
  const interestMatch = (profile.interests || []).includes(course.domain) ? 0.9 : 0.3;
  const mlNorm = Math.min(Math.max(mlScore / 3, 0), 1);
  const diff = Math.abs((LEVEL_MAP[profile.experience_level] || 0) - (LEVEL_MAP[course.level] || 0));
  const diffScore = diff === 0 ? 1 : diff === 1 ? 0.6 : 0.2;
  const prereqs = PREREQUISITES[courseId] || [];
  const prereqScore = prereqs.length === 0 ? 1 : prereqs.filter(p => (profile.completed_courses || []).includes(p)).length / prereqs.length;

  const total = skillGapScore * 0.35 + interestMatch * 0.25 + mlNorm * 0.20 + diffScore * 0.10 + prereqScore * 0.10;
  return { total: Math.round(total * 10000) / 10000, breakdown: { skill_gap: +skillGapScore.toFixed(3), career_relevance: +interestMatch.toFixed(3), ml_similarity: +mlNorm.toFixed(3), difficulty_fit: +diffScore.toFixed(3), prerequisite_fit: +prereqScore.toFixed(3) } };
}

export function getRecommendations(profile, topK = 10) {
  const query = [...(profile.interests || []), profile.experience_level, ...(profile.career_goals || [])].join(' ');
  const mlResults = tfidfScore(query, 20);
  const mlMap = {};
  mlResults.forEach(r => mlMap[r.course.course_id] = r.score);

  const completed = new Set(profile.completed_courses || []);
  const ranked = COURSES.filter(c => !completed.has(c.course_id)).map(c => {
    const ml = mlMap[c.course_id] || 0;
    const score = hybridScore(profile, c.course_id, ml);
    return {
      course_id: c.course_id,
      course: { ...c },
      score: score.total,
      breakdown: score.breakdown,
      explanation: generateExplanation(c, profile),
    };
  });
  ranked.sort((a, b) => b.score - a.score);
  return ranked.slice(0, topK);
}

function generateExplanation(course, profile) {
  const userSkills = getUserSkills(profile);
  const newSkills = (course.skills_taught || []).filter(s => !userSkills.has(s));
  const interestMatch = (profile.interests || []).includes(course.domain);
  let reason = `This ${course.level}-level course`;
  if (interestMatch) reason += ` directly matches your interest in ${course.domain.replace(/_/g, ' ')}`;
  else reason += ` in ${course.domain.replace(/_/g, ' ')}`;
  if (newSkills.length > 0) reason += ` and will teach you ${newSkills.slice(0, 3).join(', ')}`;
  reason += `. Duration: ${course.duration_hours}h on ${course.provider}.`;
  return reason;
}

export function getLearningPath(profile) {
  const recs = getRecommendations(profile, 15);
  const completed = new Set(profile.completed_courses || []);
  const selectedIds = recs.map(r => r.course_id);

  const prereqMap = {};
  selectedIds.forEach(id => { prereqMap[id] = (PREREQUISITES[id] || []).filter(p => selectedIds.includes(p)); });
  const inDeg = {};
  selectedIds.forEach(id => inDeg[id] = 0);
  selectedIds.forEach(id => (prereqMap[id] || []).forEach(p => { if (inDeg[id] !== undefined) inDeg[id]++; }));
  const queue = selectedIds.filter(id => inDeg[id] === 0).sort();
  const sorted = [];
  const adj = {};
  selectedIds.forEach(id => adj[id] = []);
  selectedIds.forEach(id => (prereqMap[id] || []).forEach(p => { if (adj[p]) adj[p].push(id); }));
  while (queue.length) {
    const n = queue.shift();
    sorted.push(n);
    (adj[n] || []).forEach(nb => { inDeg[nb]--; if (inDeg[nb] === 0) queue.push(nb); });
  }
  selectedIds.forEach(id => { if (!sorted.includes(id)) sorted.push(id); });

  const beginner = sorted.filter(id => (COURSES.find(c => c.course_id === id) || {}).level === 'beginner');
  const intermediate = sorted.filter(id => (COURSES.find(c => c.course_id === id) || {}).level === 'intermediate');
  const advanced = sorted.filter(id => (COURSES.find(c => c.course_id === id) || {}).level === 'advanced');

  const phases = [];
  if (beginner.length) phases.push({ phase: 1, name: 'Foundation Building', description: 'Build strong fundamentals', courses: beginner.map(id => courseStep(id, completed)), duration_weeks: Math.max(1, Math.round(beginner.reduce((s, id) => s + (COURSES.find(c => c.course_id === id) || {}).duration_hours || 0, 0) / 10)) });
  if (intermediate.length) phases.push({ phase: 2, name: 'Skill Development', description: 'Deepen your skills with projects', courses: intermediate.map(id => courseStep(id, completed)), duration_weeks: Math.max(1, Math.round(intermediate.reduce((s, id) => s + (COURSES.find(c => c.course_id === id) || {}).duration_hours || 0, 0) / 10)) });
  if (advanced.length) phases.push({ phase: 3, name: 'Advanced Mastery', description: 'Master advanced topics', courses: advanced.map(id => courseStep(id, completed)), duration_weeks: Math.max(1, Math.round(advanced.reduce((s, id) => s + (COURSES.find(c => c.course_id === id) || {}).duration_hours || 0, 0) / 10)) });

  const milestones = [];
  let msNum = 1;
  phases.forEach(ph => {
    if (ph.courses.length) milestones.push({ id: `ms_${msNum++}`, title: `Start ${ph.name}`, phase: ph.phase, type: 'start' });
    ph.courses.forEach(c => { if (c.level !== 'beginner') milestones.push({ id: `ms_${msNum++}`, title: `Complete: ${c.title}`, phase: ph.phase, type: 'completion', course_id: c.course_id }); });
  });
  milestones.push({ id: `ms_${msNum}`, title: 'Path Complete!', phase: phases.length, type: 'path_complete' });

  const userSkills = getUserSkills(profile);
  const allRequired = new Set();
  sorted.forEach(id => (COURSE_TO_SKILLS[id] || []).forEach(s => allRequired.add(s)));
  const skillGaps = [...allRequired].filter(s => !userSkills.has(s));
  const totalHours = sorted.reduce((s, id) => s + ((COURSES.find(c => c.course_id === id) || {}).duration_hours || 0), 0);

  return { phases, milestones, skill_gaps: skillGaps, total_courses: sorted.length, estimated_hours: totalHours, estimated_weeks: Math.max(1, Math.round(totalHours / 10)), target_level: profile.experience_level };
}

function courseStep(id, completed) {
  const c = COURSES.find(x => x.course_id === id) || {};
  return { course_id: id, title: c.title || id, domain: c.domain || '', level: c.level || 'beginner', duration_hours: c.duration_hours || 0, provider: c.provider || '', skills: c.skills_taught || [], completed: completed.has(id) };
}

export function getSkillGaps(profile, targetCareer) {
  const userSkills = getUserSkills(profile);
  let career;
  if (targetCareer && CAREER_PATHS[targetCareer]) {
    career = CAREER_PATHS[targetCareer];
  } else {
    let best = null, bestScore = -1;
    const interests = new Set(profile.interests || []);
    for (const [id, c] of Object.entries(CAREER_PATHS)) {
      const req = new Set(c.required_skills);
      const overlap = [...req].filter(s => userSkills.has(s)).length / Math.max(req.size, 1);
      const bonus = [...interests].some(i => id.includes(i.split('_')[0])) ? 0.2 : 0;
      if (overlap + bonus > bestScore) { bestScore = overlap + bonus; best = id; }
    }
    career = CAREER_PATHS[best] || Object.values(CAREER_PATHS)[0];
  }

  const required = new Set(career.required_skills || []);
  const niceToHave = new Set(career.nice_to_have || []);
  const acquired = [...required].filter(s => userSkills.has(s));
  const missingReq = [...required].filter(s => !userSkills.has(s)).map(s => ({ skill: s, category: (SKILLS[s] || {}).category || 'unknown', level: (SKILLS[s] || {}).level || 'unknown', demand: (SKILLS[s] || {}).demand_score || 0, priority: 'high' }));
  const missingNice = [...niceToHave].filter(s => !userSkills.has(s)).map(s => ({ skill: s, category: (SKILLS[s] || {}).category || 'unknown', level: (SKILLS[s] || {}).level || 'unknown', demand: (SKILLS[s] || {}).demand_score || 0, priority: 'medium' }));
  missingReq.sort((a, b) => b.demand - a.demand);
  missingNice.sort((a, b) => b.demand - a.demand);

  const coverage = required.size > 0 ? acquired.length / required.size : 0;
  return {
    career_path: '', career_title: career.display_name || '', description: career.description || '',
    avg_salary: career.avg_salary || 'N/A', growth_rate: career.growth_rate || 'N/A',
    readiness_score: Math.round(coverage * 100),
    acquired_skills: acquired, missing_skills: [...missingReq, ...missingNice],
    total_required: required.size, total_acquired: acquired.length, total_missing: missingReq.length,
    coverage: Math.round(coverage * 100) / 100,
  };
}

export function getCareerPaths() {
  return Object.entries(CAREER_PATHS).map(([id, c]) => ({ id, ...c }));
}

export function analyzeText(text) {
  const t = text.toLowerCase();
  const interests = [];
  const domainMap = {
    data_science: ['data', 'analytics', 'statistics', 'data science'],
    machine_learning: ['machine learning', 'ml', 'ai', 'artificial intelligence', 'deep learning', 'neural'],
    web_development: ['web', 'frontend', 'backend', 'fullstack', 'react', 'node', 'javascript', 'html', 'css'],
    cloud_computing: ['cloud', 'aws', 'devops', 'docker', 'kubernetes'],
    cybersecurity: ['security', 'cyber', 'hacking', 'penetration'],
    mobile_development: ['mobile', 'android', 'ios', 'flutter', 'app'],
    programming: ['programming', 'coding', 'software', 'developer', 'python', 'java'],
  };
  for (const [domain, keywords] of Object.entries(domainMap)) {
    if (keywords.some(kw => t.includes(kw))) interests.push(domain);
  }

  let level = 'beginner';
  if (['advanced', 'experienced', 'senior', 'expert'].some(w => t.includes(w))) level = 'advanced';
  else if (['intermediate', 'some experience', 'familiar', 'know'].some(w => t.includes(w))) level = 'intermediate';

  const skills = [];
  ['python', 'javascript', 'java', 'html', 'css', 'react', 'sql', 'docker', 'aws', 'git', 'node', 'typescript', 'mongodb', 'linux'].forEach(s => { if (t.includes(s)) skills.push(s); });

  const goals = [];
  if (t.includes('data scientist')) goals.push('data_scientist');
  if (t.includes('full stack') || t.includes('fullstack')) goals.push('full_stack_developer');
  if (t.includes('ml engineer') || t.includes('machine learning engineer')) goals.push('ml_engineer');
  if (t.includes('frontend')) goals.push('frontend_developer');
  if (t.includes('cloud')) goals.push('cloud_engineer');
  if (t.includes('mobile') || t.includes('app developer')) goals.push('mobile_developer');
  if (t.includes('cyber') || t.includes('security')) goals.push('cybersecurity_analyst');

  if (!interests.length) interests.push('programming');
  if (!goals.length) goals.push('software_engineer');

  return { interests, experience_level: level, skills, goals };
}
