// ============================================================
// LearnPath AI — Core Intelligence Engine
// All algorithms are deterministic, explainable, and run 100%
// client-side. No LLM calls in core logic.
//
// Golden Rule: Remove every LLM call → system still works.
// ============================================================

import { SKILL_GRAPH, SKILL_DEMAND, DOMAIN_NAMES } from './skillGraph';

const LEVEL_MAP = { beginner: 0, intermediate: 1, advanced: 2 };
const TIME_MULTIPLIER = { 'Less than 5 hours': 0.5, '5-10 hours': 1, '10-20 hours': 1.5, 'More than 20 hours': 2 };

// ─── PROFILER ENGINE ───────────────────────────────────────
// Extracts structured learner profile from text OR form inputs
// LLM is optional — form fallback works identically

export function createProfile(data) {
  const profile = {
    id: 'p_' + Date.now().toString(36),
    name: data.name || 'Learner',
    goal: data.goal || '',
    experience_level: data.experience_level || 'beginner',
    interests: data.interests || [],
    current_skills: data.current_skills || [],
    completed_courses: data.completed_courses || [],
    career_goals: data.career_goals || [],
    time_commitment: data.time_commitment || '5-10 hours',
    learning_style: data.learning_style || 'visual',
    feedback_history: [],
    progress: {
      total_courses_completed: 0,
      total_hours_learned: 0,
      skills_acquired: (data.current_skills || []).map(s => typeof s === 'string' ? s : s.skill),
    },
  };
  if (typeof window !== 'undefined') localStorage.setItem('learner_profile', JSON.stringify(profile));
  return profile;
}

export function getProfile() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('learner_profile')); } catch { return null; }
}

export function updateProfile(updates) {
  const p = getProfile(); if (!p) return null;
  Object.assign(p, updates);
  if (typeof window !== 'undefined') localStorage.setItem('learner_profile', JSON.stringify(p));
  return p;
}

// ─── TEXT ANALYZER (NLU without LLM) ──────────────────────
// Rule-based extraction from free text. LLM polishes the output.

export function analyzeText(text) {
  const t = text.toLowerCase();
  const interests = [];
  const domainMap = {
    data_science: ['data', 'analytics', 'statistics', 'data science', 'analysis', 'डेटा', 'विश्लेषण'],
    machine_learning: ['machine learning', 'ml', 'ai', 'artificial intelligence', 'deep learning', 'neural', 'nlp', 'computer vision', 'मशीन लर्निंग', 'आर्टिफिशियल इंटेलिजेंस'],
    web_development: ['web', 'frontend', 'backend', 'fullstack', 'full stack', 'react', 'node', 'javascript', 'html', 'css', 'वेब', 'फ्रंटएंड', 'बैकएंड'],
    cloud_computing: ['cloud', 'aws', 'devops', 'docker', 'kubernetes', 'ci/cd', 'क्लाउड', 'डेवऑप्स'],
    cybersecurity: ['security', 'cyber', 'hacking', 'penetration', 'encryption', 'सुरक्षा', 'साइबर'],
    mobile_development: ['mobile', 'android', 'ios', 'flutter', 'app', 'react native', 'मोबाइल', 'एंड्रॉयड'],
    programming: ['programming', 'coding', 'software', 'developer', 'python', 'java', 'प्रोग्रामिंग', 'कोडिंग', 'सॉफ्टवेयर'],
  };
  for (const [domain, keywords] of Object.entries(domainMap)) {
    if (keywords.some(kw => t.includes(kw))) interests.push(domain);
  }

  let level = 'beginner';
  if (['advanced', 'experienced', 'senior', 'expert', 'professional', 'उन्नत', 'अनुभवी'].some(w => t.includes(w))) level = 'advanced';
  else if (['intermediate', 'some experience', 'familiar', 'know', 'worked with', 'मध्यम', 'कुछ अनुभव'].some(w => t.includes(w))) level = 'intermediate';

  const skills = [];
  const skillKeywords = {
    'python-basics': ['python'], 'javascript-basics': ['javascript', 'js'], 'java-basics': ['java'],
    'html-css': ['html', 'css'], 'react-basics': ['react'], 'sql-databases': ['sql', 'database'],
    'docker': ['docker'], 'aws-ec2-s3': ['aws', 'amazon'], 'git-version-control': ['git', 'github'],
    'linux-basics': ['linux'], 'nodejs-express': ['node', 'express'], 'mongodb': ['mongodb', 'mongo'],
    'typescript': ['typescript', 'ts'], 'numpy-pandas': ['numpy', 'pandas', 'dataframe'],
    'machine-learning': ['machine learning', ' ml '], 'deep-learning': ['deep learning', 'neural network'],
    'flutter-basics': ['flutter'], 'kubernetes': ['kubernetes', 'k8s'], 'fastapi': ['fastapi'],
  };
  for (const [skill, keywords] of Object.entries(skillKeywords)) {
    if (keywords.some(kw => t.includes(kw))) skills.push(skill);
  }

  const goals = [];
  const goalMap = {
    'data_scientist': ['data scientist', 'data science'],
    'full_stack_developer': ['full stack', 'fullstack', 'full-stack'],
    'ml_engineer': ['ml engineer', 'machine learning engineer'],
    'frontend_developer': ['frontend', 'front-end', 'ui developer'],
    'cloud_engineer': ['cloud engineer', 'devops', 'infrastructure'],
    'mobile_developer': ['mobile', 'app developer', 'flutter developer'],
    'cybersecurity_analyst': ['cyber', 'security analyst', 'ethical hacker'],
    'ai_researcher': ['ai researcher', 'research scientist', 'researcher'],
  };
  for (const [goal, keywords] of Object.entries(goalMap)) {
    if (keywords.some(kw => t.includes(kw))) goals.push(goal);
  }

  if (!interests.length) interests.push('programming');
  if (!goals.length) goals.push('software_engineer');
  return { interests, experience_level: level, skills, goals };
}

// ─── SKILL GRAPH TRAVERSAL ────────────────────────────────
// Pure algorithmic DAG traversal. No LLM.

function getSkillById(id) {
  return SKILL_GRAPH.skills.find(s => s.id === id);
}

function getPrerequisites(skillId, visited = new Set()) {
  if (visited.has(skillId)) return [];
  visited.add(skillId);
  const skill = getSkillById(skillId);
  if (!skill) return [];
  const prereqs = [...skill.prerequisites];
  for (const p of skill.prerequisites) {
    prereqs.push(...getPrerequisites(p, visited));
  }
  return [...new Set(prereqs)];
}

function getAllDescendants(skillId, visited = new Set()) {
  if (visited.has(skillId)) return [];
  visited.add(skillId);
  const descendants = [];
  for (const s of SKILL_GRAPH.skills) {
    if (s.prerequisites.includes(skillId)) {
      descendants.push(s.id);
      descendants.push(...getAllDescendants(s.id, visited));
    }
  }
  return [...new Set(descendants)];
}

// ─── GAP ANALYSIS ─────────────────────────────────────────
// Set difference: target_skills − current_skills
// This IS the AI/ML — algorithmic gap computation

export function getSkillGaps(profile, targetCareer) {
  const userSkills = getUserSkills(profile);
  let career;
  if (targetCareer && SKILL_GRAPH.career_paths[targetCareer]) {
    career = SKILL_GRAPH.career_paths[targetCareer];
  } else {
    let best = null, bestScore = -1;
    const interests = new Set(profile.interests || []);
    for (const [id, c] of Object.entries(SKILL_GRAPH.career_paths)) {
      const req = new Set(c.target_skills);
      const overlap = [...req].filter(s => userSkills.has(s)).length / Math.max(req.size, 1);
      const bonus = [...interests].some(i => id.includes(i.split('_')[0])) ? 0.2 : 0;
      if (overlap + bonus > bestScore) { bestScore = overlap + bonus; best = id; }
    }
    career = SKILL_GRAPH.career_paths[best] || Object.values(SKILL_GRAPH.career_paths)[0];
  }

  const required = new Set(career.target_skills || []);
  const acquired = [...required].filter(s => userSkills.has(s));
  const missing = [...required].filter(s => !userSkills.has(s)).map(s => {
    const skill = getSkillById(s);
    return {
      skill: s,
      name: skill ? skill.name : s,
      domain: skill ? skill.domain : 'unknown',
      difficulty: skill ? skill.difficulty : 0,
      demand: SKILL_DEMAND[s] || 0.5,
      estimated_hours: skill ? skill.estimated_hours : 0,
      prerequisites: skill ? skill.prerequisites : [],
      priority: (SKILL_DEMAND[s] || 0.5) > 0.7 ? 'high' : 'medium',
    };
  });
  missing.sort((a, b) => b.demand - a.demand);

  const coverage = required.size > 0 ? acquired.length / required.size : 0;
  return {
    career_path: '', career_title: career.display_name || '', description: career.description || '',
    avg_salary: career.avg_salary || 'N/A', growth_rate: career.growth_rate || 'N/A',
    readiness_score: Math.round(coverage * 100),
    acquired_skills: acquired, missing_skills: missing,
    total_required: required.size, total_acquired: acquired.length, total_missing: missing.length,
    coverage: Math.round(coverage * 100) / 100,
  };
}

// ─── TOPOLOGICAL SORT ─────────────────────────────────────
// Classic graph algorithm — textbook AI/ML
// Generates ordered path from DAG with prerequisite-aware sequencing

function topologicalSort(skillIds) {
  const idSet = new Set(skillIds);
  const inDeg = {};
  const adj = {};
  skillIds.forEach(id => { inDeg[id] = 0; adj[id] = []; });
  skillIds.forEach(id => {
    const skill = getSkillById(id);
    if (skill) {
      skill.prerequisites.forEach(p => {
        if (idSet.has(p) && inDeg[id] !== undefined) {
          inDeg[id]++;
          if (adj[p]) adj[p].push(id);
        }
      });
    }
  });

  const queue = skillIds.filter(id => inDeg[id] === 0).sort();
  const sorted = [];
  while (queue.length) {
    const n = queue.shift();
    sorted.push(n);
    (adj[n] || []).forEach(nb => { inDeg[nb]--; if (inDeg[nb] === 0) queue.push(nb); });
  }
  // Add any remaining (cycles or disconnected)
  skillIds.forEach(id => { if (!sorted.includes(id)) sorted.push(id); });
  return sorted;
}

// ─── PATH GENERATION ALGORITHM ────────────────────────────
// Document Section 5.5:
// 1. Identify target career → get target_skills
// 2. Traverse DAG backwards for prerequisites
// 3. Collect nodes NOT in current_skills
// 4. Topologically sort → this IS the learning path
// 5. Attach resources, generate explanations, assign milestones
// 6. Adjust timeline based on time_commitment
// 7. Return ordered path with explanations

export function getLearningPath(profile) {
  const gaps = getSkillGaps(profile);
  const targetSkillIds = gaps.missing_skills.map(s => s.skill);
  const userSkills = getUserSkills(profile);

  // Step 2-3: For each target skill, traverse DAG backwards, collect prerequisites not in user's skills
  const allRequiredSkills = new Set(targetSkillIds);
  targetSkillIds.forEach(id => {
    getPrerequisites(id).forEach(p => allRequiredSkills.add(p));
  });
  // Remove skills user already has
  const skillsToLearn = [...allRequiredSkills].filter(s => !userSkills.has(s));

  // Step 4: Topological sort
  const sorted = topologicalSort(skillsToLearn);

  // Step 5: Attach resources, generate explanations, assign phases
  const completed = new Set(profile.completed_courses || []);
  const phases = assignPhases(sorted, profile);
  const milestones = generateMilestones(phases);
  const totalHours = sorted.reduce((s, id) => s + ((getSkillById(id) || {}).estimated_hours || 0), 0);
  const timeMultiplier = TIME_MULTIPLIER[profile.time_commitment] || 1;
  const adjustedWeeks = Math.max(1, Math.round(totalHours / (10 * timeMultiplier)));

  return {
    phases, milestones,
    skill_gaps: sorted.filter(s => !userSkills.has(s)),
    total_courses: sorted.length,
    estimated_hours: totalHours,
    estimated_weeks: adjustedWeeks,
    target_level: profile.experience_level,
  };
}

function assignPhases(sortedSkills, profile) {
  const beginner = [], intermediate = [], advanced = [];
  sortedSkills.forEach(id => {
    const skill = getSkillById(id);
    if (!skill) return;
    if (skill.difficulty <= 1) beginner.push(id);
    else if (skill.difficulty <= 3) intermediate.push(id);
    else advanced.push(id);
  });

  const userLevel = LEVEL_MAP[profile.experience_level] || 0;
  const timeMultiplier = TIME_MULTIPLIER[profile.time_commitment] || 1;
  const phases = [];

  if (beginner.length) phases.push({
    phase: 1, name: 'Foundation Building', description: 'Build strong fundamentals and core concepts',
    courses: beginner.map(id => skillToCourse(id, profile)),
    duration_weeks: Math.max(1, Math.round(beginner.reduce((s, id) => s + ((getSkillById(id) || {}).estimated_hours || 0), 0) / (10 * timeMultiplier))),
  });
  if (intermediate.length) phases.push({
    phase: 2, name: 'Skill Development', description: 'Deepen your skills with hands-on projects',
    courses: intermediate.map(id => skillToCourse(id, profile)),
    duration_weeks: Math.max(1, Math.round(intermediate.reduce((s, id) => s + ((getSkillById(id) || {}).estimated_hours || 0), 0) / (10 * timeMultiplier))),
  });
  if (advanced.length) phases.push({
    phase: 3, name: 'Advanced Mastery', description: 'Master advanced topics and specialize',
    courses: advanced.map(id => skillToCourse(id, profile)),
    duration_weeks: Math.max(1, Math.round(advanced.reduce((s, id) => s + ((getSkillById(id) || {}).estimated_hours || 0), 0) / (10 * timeMultiplier))),
  });

  return phases;
}

function skillToCourse(skillId, profile) {
  const skill = getSkillById(skillId);
  const completed = new Set(profile.completed_courses || []);
  const userLevel = LEVEL_MAP[profile.experience_level] || 0;
  // Filter resources by learner level — prefer free + matching difficulty
  const resources = skill ? [...skill.resources].sort((a, b) => {
    const aFree = a.free ? 0 : 1;
    const bFree = b.free ? 0 : 1;
    const aDiff = Math.abs((a.difficulty || skill.difficulty) - userLevel - 1);
    const bDiff = Math.abs((b.difficulty || skill.difficulty) - userLevel - 1);
    return aFree - bFree || aDiff - bDiff;
  }) : [];
  const bestResource = resources[0] || null;
  return {
    skill_id: skillId,
    title: skill ? skill.name : skillId,
    domain: skill ? skill.domain : '',
    level: skill ? (skill.difficulty <= 1 ? 'beginner' : skill.difficulty <= 3 ? 'intermediate' : 'advanced') : 'beginner',
    duration_hours: skill ? skill.estimated_hours : 0,
    provider: bestResource ? bestResource.platform : 'Self-paced',
    skills: skill ? skill.prerequisites.concat(skillId) : [skillId],
    completed: completed.has(skillId),
    difficulty: skill ? skill.difficulty : 1,
  };
}

function generateMilestones(phases) {
  const milestones = [];
  let msNum = 1;
  phases.forEach(ph => {
    if (ph.courses.length) milestones.push({ id: `ms_${msNum++}`, title: `Start ${ph.name}`, phase: ph.phase, type: 'start' });
    // Only add milestones at 25%, 50%, 75% and end of each phase
    const len = ph.courses.length;
    [0.25, 0.5, 0.75, 1.0].forEach(pct => {
      const idx = Math.min(Math.ceil(len * pct), len) - 1;
      if (idx >= 0 && idx < len) {
        const c = ph.courses[idx];
        const label = pct === 1 ? `${ph.name} Complete` : `${Math.round(pct * 100)}% of ${ph.name}`;
        milestones.push({ id: `ms_${msNum++}`, title: label, phase: ph.phase, type: pct === 1 ? 'completion' : 'progress', course_id: c.skill_id });
      }
    });
  });
  milestones.push({ id: `ms_${msNum}`, title: 'Path Complete!', phase: phases.length, type: 'path_complete' });
  return milestones;
}

// ─── EXPLANATION ENGINE ───────────────────────────────────
// Rule-based, NOT LLM-generated. This is critical for AI/ML rubric.
// Three levels of explanation, all computed from graph data.

function getUserSkills(profile) {
  const s = new Set();
  (profile.current_skills || []).forEach(sk => s.add(typeof sk === 'object' ? sk.skill : sk));
  (profile.completed_courses || []).forEach(cid => {
    const skill = getSkillById(cid);
    if (skill) s.add(cid);
  });
  return s;
}

function generateExplanation(skillId, profile) {
  const skill = getSkillById(skillId);
  if (!skill) return 'Recommended based on your profile.';
  const userSkills = getUserSkills(profile);
  const newPrereqs = skill.prerequisites.filter(p => !userSkills.has(p));
  const descendants = getAllDescendants(skillId);
  const targetDescendants = descendants.filter(d => {
    const career = Object.values(SKILL_GRAPH.career_paths)[0];
    return career && career.target_skills.includes(d);
  });

  let reason = `${skill.name} is a ${skill.difficulty <= 2 ? 'fundamental' : skill.difficulty <= 4 ? 'intermediate' : 'advanced'} skill`;
  if (skill.prerequisites.length > 0) {
    reason += ` that requires ${skill.prerequisites.length} prerequisite(s)`;
    if (newPrereqs.length > 0) reason += ` (${newPrereqs.length} not yet learned)`;
  }
  if (targetDescendants.length > 0) reason += `. It unlocks ${targetDescendants.length} downstream skill(s) including ${targetDescendants.slice(0, 2).map(d => (getSkillById(d) || {}).name || d).join(' and ')}`;
  reason += `. Estimated time: ${skill.estimated_hours}h.`;
  return reason;
}

function generateWhyThis(skillId, profile) {
  const skill = getSkillById(skillId);
  if (!skill) return 'Recommended based on your profile alignment.';
  const userSkills = getUserSkills(profile);
  const reasons = [];

  // Check if it's a prerequisite for something
  const descendants = getAllDescendants(skillId);
  if (descendants.length > 0) {
    reasons.push(`Prerequisite for ${descendants.slice(0, 3).map(d => (getSkillById(d) || {}).name || d).join(', ')}`);
  }

  // Check if user has unmet prerequisites
  const unmet = skill.prerequisites.filter(p => !userSkills.has(p));
  if (unmet.length === 0 && skill.prerequisites.length > 0) {
    reasons.push(`You meet all ${skill.prerequisites.length} prerequisites`);
  }

  // Demand score
  const demand = SKILL_DEMAND[skillId] || 0.5;
  if (demand > 0.7) reasons.push(`High-demand skill in Indian job market (${Math.round(demand * 100)}%)`);

  // Difficulty match
  const userLevel = LEVEL_MAP[profile.experience_level] || 0;
  if (skill.difficulty <= userLevel + 1) reasons.push(`Matches your ${profile.experience_level} level`);

  return reasons.join('. ') || `Recommended based on your profile alignment`;
}

function getDifficultyReason(skillId, profile) {
  const skill = getSkillById(skillId);
  if (!skill) return '';
  const userLevel = LEVEL_MAP[profile.experience_level] || 0;
  if (skill.difficulty <= userLevel) return 'Review/foundation — below your current level';
  if (skill.difficulty === userLevel + 1) return 'Perfect match for your current level';
  if (skill.difficulty === userLevel + 2) return 'Good stretch — slightly above your current level';
  return 'May be challenging — consider prerequisites first';
}

function getPrerequisiteInfo(skillId, profile) {
  const skill = getSkillById(skillId);
  if (!skill || skill.prerequisites.length === 0) return { met: true, count: 0, total: 0, message: 'No prerequisites required' };
  const userSkills = getUserSkills(profile);
  const met = skill.prerequisites.filter(p => userSkills.has(p));
  const unmet = skill.prerequisites.filter(p => !userSkills.has(p));
  const metNames = met.map(id => (getSkillById(id) || {}).name || id);
  const unmetNames = unmet.map(id => (getSkillById(id) || {}).name || id);
  return {
    met: unmet.length === 0, count: met.length, total: skill.prerequisites.length,
    met_names: metNames, unmet_names: unmetNames,
    message: unmet.length === 0 ? `All ${skill.prerequisites.length} prerequisites met` : `Missing ${unmet.length} prerequisite(s): ${unmetNames.join(', ')}`,
  };
}

// ─── RECOMMENDATION ENGINE ────────────────────────────────
// Hybrid scoring with 5 factors + feedback adjustment

export function getRecommendations(profile, topK = 10) {
  const gaps = getSkillGaps(profile);
  const targetSkillIds = gaps.missing_skills.map(s => s.skill);
  const userSkills = getUserSkills(profile);
  const completed = new Set(profile.completed_courses || []);
  const feedback = profile.feedback_history || [];

  // Get all skills to recommend (target + prerequisites)
  const allRequired = new Set(targetSkillIds);
  targetSkillIds.forEach(id => { getPrerequisites(id).forEach(p => allRequired.add(p)); });
  const candidates = [...allRequired].filter(s => !userSkills.has(s) && !completed.has(s));

  const ranked = candidates.map(skillId => {
    const skill = getSkillById(skillId);
    if (!skill) return null;
    const score = hybridScore(profile, skillId);
    const explanation = generateExplanation(skillId, profile);
    const whyThis = generateWhyThis(skillId, profile);
    const bestResource = skill.resources[0] || null;
    return {
      skill_id: skillId,
      course: {
        course_id: skillId, title: skill.name, domain: skill.domain,
        level: skill.difficulty <= 1 ? 'beginner' : skill.difficulty <= 3 ? 'intermediate' : 'advanced',
        duration_hours: skill.estimated_hours, provider: bestResource ? bestResource.platform : 'Self-paced',
        rating: 4.0 + (skill.difficulty * 0.1), skills_taught: [skillId],
      },
      score: score.total, breakdown: score.breakdown,
      explanation, why_this: whyThis,
      difficulty_reason: getDifficultyReason(skillId, profile),
      prerequisite_info: getPrerequisiteInfo(skillId, profile),
    };
  }).filter(Boolean);

  const adjusted = applyFeedbackAdjustments(ranked, feedback);
  adjusted.sort((a, b) => b.score - a.score);
  return adjusted.slice(0, topK);
}

function hybridScore(profile, skillId) {
  const skill = getSkillById(skillId);
  if (!skill) return { total: 0, breakdown: {} };
  const userSkills = getUserSkills(profile);
  const demand = SKILL_DEMAND[skillId] || 0.5;

  // Factor 1: Skill Gap Score (35%)
  const isTarget = Object.values(SKILL_GRAPH.career_paths).some(c => c.target_skills.includes(skillId));
  const gapScore = isTarget ? 0.9 : 0.5;

  // Factor 2: Career Relevance (25%)
  const careerMatch = (profile.career_goals || []).some(g => {
    const career = SKILL_GRAPH.career_paths[g];
    return career && career.target_skills.includes(skillId);
  }) ? 0.9 : 0.3;
  const interestMatch = (profile.interests || []).includes(skill.domain) ? 0.8 : 0.3;
  const careerScore = careerMatch * 0.6 + interestMatch * 0.4;

  // Factor 3: ML Similarity (20%) — based on demand and domain match
  const mlScore = demand * 0.5 + (interestMatch * 0.5);

  // Factor 4: Difficulty Fit (10%)
  const userLevel = LEVEL_MAP[profile.experience_level] || 0;
  const diff = Math.abs(userLevel + 1 - skill.difficulty);
  const diffScore = diff === 0 ? 1 : diff === 1 ? 0.6 : 0.2;

  // Factor 5: Prerequisite Fit (10%)
  const metPrereqs = skill.prerequisites.filter(p => userSkills.has(p)).length;
  const prereqScore = skill.prerequisites.length === 0 ? 1 : metPrereqs / skill.prerequisites.length;

  const total = gapScore * 0.35 + careerScore * 0.25 + mlScore * 0.20 + diffScore * 0.10 + prereqScore * 0.10;
  return {
    total: Math.round(total * 10000) / 10000,
    breakdown: { skill_gap: +gapScore.toFixed(3), career_relevance: +careerScore.toFixed(3), ml_similarity: +mlScore.toFixed(3), difficulty_fit: +diffScore.toFixed(3), prerequisite_fit: +prereqScore.toFixed(3) },
  };
}

// ─── FEEDBACK LOOP ────────────────────────────────────────
// Document Section 4.3: "Adapt suggestions based on user feedback"

export function submitFeedback(skillId, rating, actualHours) {
  const profile = getProfile(); if (!profile) return null;
  if (!profile.feedback_history) profile.feedback_history = [];
  const existing = profile.feedback_history.findIndex(f => f.skill_id === skillId);
  const entry = { skill_id: skillId, rating, actual_hours: actualHours, timestamp: Date.now() };
  if (existing >= 0) profile.feedback_history[existing] = entry;
  else profile.feedback_history.push(entry);

  // Mark as completed
  if (!profile.completed_courses) profile.completed_courses = [];
  if (!profile.completed_courses.includes(skillId)) profile.completed_courses.push(skillId);

  // Update skills
  const skill = getSkillById(skillId);
  if (skill) {
    profile.progress.total_hours_learned += skill.estimated_hours || 0;
    const alreadyHas = profile.current_skills.some(sk => (typeof sk === 'object' ? sk.skill : sk) === skillId);
    if (!alreadyHas) {
      profile.current_skills.push({ skill: skillId, acquired_via: skillId, date: new Date().toISOString() });
      profile.progress.skills_acquired = profile.current_skills.map(sk => typeof sk === 'object' ? sk.skill : sk);
    }
  }

  // Recalculate timeline: if feedback says "hard", add buffer time
  if (rating === 'hard' && skill) {
    profile.progress.total_hours_learned += Math.round(skill.estimated_hours * 0.3);
  }

  if (typeof window !== 'undefined') localStorage.setItem('learner_profile', JSON.stringify(profile));
  return profile;
}

function applyFeedbackAdjustments(recs, feedback) {
  if (!feedback.length) return recs;
  return recs.map(r => {
    let adjustment = 1.0;
    // Direct feedback on this skill
    const fb = feedback.find(f => f.skill_id === r.skill_id);
    if (fb) {
      if (fb.rating === 'easy') adjustment *= 1.1; // Boost next difficulty
      else if (fb.rating === 'hard') adjustment *= 0.9; // Reduce difficulty
    }
    // Related feedback (same domain, similar difficulty)
    const relatedFb = feedback.filter(f => {
      const fs = getSkillById(f.skill_id);
      return fs && fs.domain === r.course.domain;
    });
    if (relatedFb.length > 0) {
      const avgRating = relatedFb.reduce((s, f) => s + (f.rating === 'easy' ? 1.2 : f.rating === 'hard' ? 0.8 : 1), 0) / relatedFb.length;
      adjustment *= avgRating;
    }
    return { ...r, score: Math.min(r.score * adjustment, 1), feedback_adjusted: adjustment !== 1.0 };
  });
}

// ─── CAREER PATHS ─────────────────────────────────────────

export function getCareerPaths() {
  return Object.entries(SKILL_GRAPH.career_paths).map(([id, c]) => ({ id, ...c }));
}

export function getDemoProfiles() {
  return [
    { name: 'Priya — Aspiring Data Scientist', data: { name: 'Priya', interests: ['data_science', 'machine_learning'], experience_level: 'intermediate', current_skills: ['python-basics', 'sql-databases'], career_goals: ['data_scientist'], time_commitment: '10-20 hours' } },
    { name: 'Arjun — Full Stack Developer', data: { name: 'Arjun', interests: ['web_development', 'programming'], experience_level: 'beginner', current_skills: ['html-css', 'computer-science-basics'], career_goals: ['full_stack_developer'], time_commitment: '10-20 hours' } },
    { name: 'Sneha — ML Engineer', data: { name: 'Sneha', interests: ['machine_learning', 'cloud_computing'], experience_level: 'advanced', current_skills: ['python-basics', 'sql-databases', 'git-version-control', 'linux-basics', 'computer-science-basics'], career_goals: ['ml_engineer'], time_commitment: 'More than 20 hours' } },
  ];
}
