import { useState, useRef, useEffect, useCallback } from 'react';
import Head from 'next/head';
import NavBar from '../components/NavBar';
import { createProfile, getProfile, getRecommendations, getLearningPath, getSkillGaps } from '../lib/engine';
import { getSkillById, DOMAIN_NAMES } from '../lib/skillGraph';

const DOMAIN_COLORS = {
  programming: '#3b82f6', web_development: '#8b5cf6', data_science: '#06b6d4',
  machine_learning: '#f59e0b', cloud_computing: '#10b981', cybersecurity: '#ef4444',
  mobile_development: '#ec4899', math: '#6366f1', mlops: '#f97316',
};

const ONBOARDING_STEPS = [
  { q: 'What field or career are you interested in?', field: 'primary_interest', opts: ['Data Science & Analytics', 'Web Development', 'Machine Learning & AI', 'Cloud Computing & DevOps', 'Cybersecurity', 'Mobile Development', 'Software Engineering'] },
  { q: "What's your current experience level?", field: 'experience_level', opts: ['Beginner (New to the field)', 'Intermediate (Some experience)', 'Advanced (Experienced professional)'] },
  { q: 'How much time can you dedicate per week?', field: 'time_commitment', opts: ['Less than 5 hours', '5-10 hours', '10-20 hours', 'More than 20 hours'] },
  { q: "What's your primary goal?", field: 'career_goal', opts: ['Career change to tech', 'Get a promotion', 'Start freelancing', 'Build personal projects', 'Academic/research', 'Just learning for fun'] },
  { q: 'What skills do you already know?\n\nClick the skill buttons below to select, then click "Done" to continue.', field: 'current_skills', opts: ['Python', 'JavaScript', 'HTML & CSS', 'React', 'SQL', 'Git', 'Java', 'C++', 'None — I\'m a complete beginner'], multi: true },
];

function buildProfile(data) {
  const levelMap = { 'Beginner': 'beginner', 'Intermediate': 'intermediate', 'Advanced': 'advanced' };
  const lvl = Object.entries(levelMap).find(([k]) => (data.experience_level || '').includes(k));
  const level = lvl ? lvl[1] : 'beginner';
  const map = { 'Data Science & Analytics': 'data_science', 'Web Development': 'web_development', 'Machine Learning & AI': 'machine_learning', 'Cloud Computing & DevOps': 'cloud_computing', 'Cybersecurity': 'cybersecurity', 'Mobile Development': 'mobile_development', 'Software Engineering': 'programming' };
  const interests = [data.primary_interest || 'programming'].map(i => map[i] || i.toLowerCase().replace(/\s+/g, '_'));
  const skillMap = {
    'Python': 'python-basics', 'JavaScript': 'javascript-basics', 'HTML & CSS': 'html-css',
    'React': 'react-basics', 'SQL': 'sql-databases', 'Git': 'git-version-control',
    'Java': 'java-basics', 'C++': 'data-structures-algorithms',
  };
  const SKIP = new Set(['None — I\'m a complete beginner', 'Done', 'Done — proceed']);
  const currentSkills = (Array.isArray(data.current_skills) ? data.current_skills : [data.current_skills])
    .filter(s => s && !SKIP.has(s))
    .map(s => skillMap[s] || s.toLowerCase().replace(/\s+/g, '-'))
    .filter(Boolean);
  return createProfile({ name: 'Learner', interests, experience_level: level, time_commitment: data.time_commitment || '5-10 hours', career_goals: [data.career_goal || 'career change to tech'], current_skills: currentSkills.map(s => ({ skill: s })) });
}

function formatProfileSummary(profile, path) {
  if (!profile) return '';
  const skills = profile.current_skills.map(s => typeof s === 'object' ? s.skill : s);
  const lines = [`Level: ${profile.experience_level}`, `Interests: ${profile.interests.map(i => i.replace(/_/g, ' ')).join(', ')}`, `Current skills: ${skills.join(', ') || 'None yet'}`];
  if (path) lines.push(`Path: ${path.total_courses} skills across ${path.phases.length} phases (~${path.estimated_weeks} weeks)`);
  return lines.join('\n');
}

function getNextAction(profile) {
  try {
    const recs = getRecommendations(profile, 1);
    if (recs.length > 0) return `Start with: ${recs[0].course.title} (${recs[0].course.duration_hours}h)`;
  } catch {}
  return 'Check your learning path for next steps.';
}

function TypingText({ text, speed = 12, onDone }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i >= text.length) {
        setDisplayed(text);
        setDone(true);
        clearInterval(interval);
        onDone?.();
        return;
      }
      setDisplayed(text.substring(0, i));
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <span style={{ whiteSpace: 'pre-wrap' }}>{displayed}{!done && <span className="typing-cursor">|</span>}</span>;
}

function RecommendationCard({ rec, index }) {
  const skill = getSkillById(rec.skill_id);
  const domain = skill?.domain || 'programming';
  const color = DOMAIN_COLORS[domain] || '#6b7280';

  return (
    <div style={{ margin: '8px 0', padding: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, borderLeft: `3px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{rec.course.title}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{rec.course.provider} · {rec.course.duration_hours}h · {rec.course.level}</div>
        </div>
        <div style={{ padding: '3px 8px', borderRadius: 6, background: `${color}15`, color, fontSize: '0.75rem', fontWeight: 700 }}>
          {Math.round(rec.score * 100)}%
        </div>
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{rec.explanation}</div>
      {rec.why_this && (
        <div style={{ marginTop: 6, padding: '6px 8px', background: 'var(--bg-3)', borderRadius: 6, fontSize: '0.7rem', color: 'var(--text-3)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--text-2)' }}>Why:</strong> {rec.why_this}
        </div>
      )}
    </div>
  );
}

function RichResponse({ type, data, profile }) {
  if (type === 'recommendations') {
    return (
      <div>
        {data.map((rec, i) => <RecommendationCard key={i} rec={rec} index={i} />)}
      </div>
    );
  }
  if (type === 'learning_path') {
    return (
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <div style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--accent-dim)', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600 }}>{data.total_courses} skills</div>
          <div style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--bg-4)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-2)' }}>{data.phases.length} phases</div>
          <div style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--bg-4)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-2)' }}>~{data.estimated_weeks} weeks</div>
        </div>
        {data.phases.map((p, i) => (
          <div key={i} style={{ padding: '8px 0', borderBottom: i < data.phases.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>Phase {p.phase}: {p.name} ({p.duration_weeks}w)</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {p.courses.slice(0, 5).map((c, j) => (
                <span key={j} style={{ padding: '2px 6px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 600, background: 'var(--bg-4)', color: 'var(--text-2)' }}>{c.title}</span>
              ))}
              {p.courses.length > 5 && <span style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>+{p.courses.length - 5} more</span>}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (type === 'skill_gaps') {
    const missing = data.missing_skills.slice(0, 6);
    const acquired = data.acquired_skills.slice(0, 4);
    return (
      <div>
        <div style={{ padding: 10, background: 'var(--accent-dim)', borderRadius: 8, marginBottom: 8, textAlign: 'center' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)' }}>{data.readiness_score}%</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginLeft: 6 }}>Ready for {data.career_title}</span>
        </div>
        {missing.length > 0 && (
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 4 }}>Missing Skills</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {missing.map((s, i) => (
                <span key={i} style={{ padding: '3px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600, background: 'rgba(245,158,11,0.08)', color: 'var(--amber)' }}>{s.name}</span>
              ))}
            </div>
          </div>
        )}
        {acquired.length > 0 && (
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 4 }}>Acquired</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {acquired.map((s, i) => (
                <span key={i} style={{ padding: '3px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600, background: 'rgba(5,150,105,0.08)', color: 'var(--green)' }}>{typeof s === 'string' ? (getSkillById(s)?.name || s) : s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
}

function processMessage(text, profile) {
  const lower = text.toLowerCase();
  try {
    if (lower.match(/\b(hello|hi|hey|namaste|hii|helloo|yo|sup|aur bhai|kaise ho|kya haal)\b/)) {
      return { text: `Hello! I'm your LearnPath AI assistant. I can help you with:\n\n- Course recommendations\n- Learning path details\n- Skill gap analysis\n- Time estimates\n- Career guidance\n\nJust ask me anything!` };
    }
    if (lower.match(/\b(thanks|thank|dhanyavad|shukriya|bye|goodbye|alvida|chalo|theek hai)\b/)) {
      return { text: lower.match(/\b(bye|goodbye|alvida|chalo)\b/) ? "Goodbye! Keep up the great work on your learning journey. See you next time!" : "You're welcome! Keep learning and stay consistent. If you need anything else, just ask!" };
    }
    if (lower.match(/\b(help|kya kar|kya kar sakta|kya bol|batao)\b/)) {
      return { text: "Try asking:\n• \"Recommend courses for me\"\n• \"Show my learning path\"\n• \"What skills do I need?\"\n• \"How long will this take?\"\n• \"DSA kaise karu?\"\n• \"2 months mein kya seekhu?\"\n• \"Career options batao\"" };
    }

    const timeMatch = lower.match(/(\d+)\s*(mahine|month|months|hafta|week|weeks|din|day|days|ghante|hour|hours)/);
    const topicKeywords = ['dsa', 'data structure', 'algorithm', 'algorithms', 'coding', 'competitive', 'problem solving', 'cp'];
    const isTopicQuery = topicKeywords.some(k => lower.includes(k));
    const isTimeQuery = !!timeMatch || lower.match(/\b(kitna time|how long|duration|timeline|deadline|by when|kab tak|kab tak mein)\b/);

    if (isTopicQuery || (isTimeQuery && lower.match(/\b(kya|what|seekh|learn|padh|study|karna|kare|karu|start|shuru)\b/))) {
      const months = timeMatch ? parseInt(timeMatch[1]) : null;
      const path = getLearningPath(profile);
      const gapData = getSkillGaps(profile);
      let response = '';
      if (months) {
        const hoursPerWeek = profile.time_commitment.includes('More than 20') ? 25 : profile.time_commitment.includes('10-20') ? 15 : profile.time_commitment.includes('5-10') ? 7 : 4;
        const totalHours = months * 4 * hoursPerWeek;
        response = `Here's a plan for DSA in ${months} months:\n\nYour time: ~${hoursPerWeek} hrs/week → ${totalHours} hours total\n\nTips for ${months}-month DSA plan:\n1. Start with arrays & strings (Week 1-2)\n2. Linked lists & stacks (Week 3-4)\n3. Trees & graphs (Month 2)\n4. Dynamic programming (Month 2-3)\n5. Practice 2-3 problems daily on LeetCode\n\nTarget: Solve 150-200 problems in ${months} months.\nYour readiness: ${gapData.readiness_score}%`;
      } else {
        response = `DSA is essential for your career in ${gapData.career_title}.\n\nKey topics to cover:\n• Arrays & Strings\n• Linked Lists\n• Stacks & Queues\n• Trees & Graphs\n• Dynamic Programming\n\nHow many months do you have? Tell me like "2 months mein DSA karna hai"!`;
      }
      return { text: response };
    }

    if (timeMatch && lower.match(/\b(data science|machine learning|web dev|full stack|cloud|devops|cyber|mobile|android|ios|flutter|ai|nlp|deep learning)\b/)) {
      const months = parseInt(timeMatch[1]);
      const path = getLearningPath(profile);
      const gapData = getSkillGaps(profile);
      return { text: `Here's your ${months}-month plan for ${gapData.career_title}:\n\nSkills in path: ${path.total_courses}\nReadiness: ${gapData.readiness_score}%\n\n` + path.phases.slice(0, Math.min(months, path.phases.length)).map(p => `Phase ${p.phase}: ${p.name} — ${p.courses.length} skills (${p.duration_weeks}w)`).join('\n') };
    }

    if (lower.match(/\b(recommend|suggest|what should|kya padhu|kya seekhe|kya karu|course|courses|padhai|seekhna)\b/)) {
      const recs = getRecommendations(profile, 3);
      if (recs.length === 0) return { text: "No recommendations available yet. Try completing your onboarding first!" };
      return { rich: 'recommendations', data: recs, text: `Here are your top ${recs.length} recommendations:` };
    }

    if (lower.match(/\b(path|roadmap|learning path|raasta|plan|kya padhega|kya seekhega)\b/)) {
      const path = getLearningPath(profile);
      if (path.phases.length === 0) return { text: "Your path is empty. Try completing onboarding first!" };
      return { rich: 'learning_path', data: path, text: `Your personalized learning path:` };
    }

    if (lower.match(/\b(skill|gap|need|kya aata|kya aati|kya nahi aata|missing|acquired)\b/)) {
      const gapData = getSkillGaps(profile);
      return { rich: 'skill_gaps', data: gapData, text: `Your skill analysis for ${gapData.career_title}:` };
    }

    if (lower.match(/\b(why|explain|kyun|kyu|kaise|how does|how do)\b/)) {
      const recs = getRecommendations(profile, 1);
      if (recs[0]) return { text: `Why ${recs[0].course.title}?\n\n${recs[0].why_this}\n\nDifficulty: ${recs[0].difficulty_reason}\n${recs[0].prerequisite_info.message}` };
      return { text: "No recommendations available yet. Complete the onboarding first!" };
    }

    if (lower.match(/\b(skip|can i skip|chhod sakta|skip karu)\b/)) {
      const recs = getRecommendations(profile, 1);
      if (recs[0]) {
        const prereqInfo = recs[0].prerequisite_info;
        if (!prereqInfo.met) return { text: `Skipping "${recs[0].course.title}" is not recommended.\n\n${prereqInfo.message}` };
        return { text: `You can skip "${recs[0].course.title}" if you already know the material, but it's recommended for your path.` };
      }
      return { text: "No recommendations available yet." };
    }

    if (lower.match(/\b(how long|time|duration|weeks|kitna time|mahine|month|hafta|week|kab|when)\b/)) {
      const path = getLearningPath(profile);
      return { text: `Based on your ${profile.time_commitment} commitment:\n\nTotal time: ~${path.estimated_hours} hours\nDuration: ${path.estimated_weeks} weeks\nSkills to learn: ${path.total_courses}` };
    }

    if (lower.match(/\b(next|what now|start|aage|shuru|begin)\b/)) {
      return { text: `Here's what you should do next:\n\n${getNextAction(profile)}\n\nOr check your dashboard for the full overview.` };
    }

    if (lower.match(/\b(career|job|salary|placement|interview|resume|hiring|package|lpa|salary)\b/)) {
      const gapData = getSkillGaps(profile);
      return { text: `You're targeting: ${gapData.career_title}\n\nReadiness: ${gapData.readiness_score}%\nAvg Salary: ${gapData.avg_salary}\nGrowth Rate: ${gapData.growth_rate}\n\nMissing skills: ${gapData.missing_skills.slice(0, 3).map(s => s.name).join(', ')}` };
    }

    if (lower.match(/\b(data science|machine learning|web dev|full stack|frontend|backend|cloud|devops|cyber|mobile|android|ios|flutter|ai|nlp|deep learning|python|java|javascript|react|node)\b/)) {
      const recsLocal = getRecommendations(profile, 3);
      const gapDataLocal = getSkillGaps(profile);
      return { rich: 'recommendations', data: recsLocal, text: `For ${gapDataLocal.career_title} (${gapDataLocal.readiness_score}% ready):` };
    }

    if (lower.match(/\b(dashboard|progress|overview)\b/)) {
      return { text: "Check your Dashboard for a full overview of your progress, skill coverage, and learning phases." };
    }

    const gapData = getSkillGaps(profile);
    const recs = getRecommendations(profile, 3);
    return { rich: 'recommendations', data: recs, text: `I heard you! Here's what I found for ${gapData.career_title} (${gapData.readiness_score}% ready):` };
  } catch (e) {
    console.error('processMessage error:', e.message);
    return null;
  }
}

async function callLLM(text, profile) {
  try {
    const context = profile ? { level: profile.experience_level, interests: profile.interests, skills: profile.current_skills.map(s => typeof s === 'object' ? s.skill : s) } : null;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, context, mode: 'chat' }), signal: controller.signal });
    clearTimeout(timeout);
    const data = await res.json();
    return data.response || null;
  } catch (e) { if (e.name !== 'AbortError') console.error('LLM call failed:', e.message); return null; }
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [onboarding, setOnboarding] = useState(null);
  const [onbData, setOnbData] = useState({});
  const [selectedSkills, setSelectedSkills] = useState([]);
  const endRef = useRef(null);
  const loadingRef = useRef(false);

  const safeSetLoading = (val) => { loadingRef.current = val; setLoading(val); };

  useEffect(() => {
    try {
      const existing = getProfile();
      if (existing) {
        const path = getLearningPath(existing);
        const nextAction = getNextAction(existing);
        setMessages([{ id: 1, type: 'ai', text: `Welcome back! Here's your profile:\n\n${formatProfileSummary(existing, path)}\n\nNext action: ${nextAction}\n\nWhat would you like to explore?`, suggestions: ['Recommend courses', 'Show my learning path', 'What skills do I need?', 'How long will this take?'] }]);
      } else {
        setOnboarding(0);
        setMessages([{ id: 1, type: 'ai', text: "Welcome to LearnPath AI! I'll build your personalized learning path.\n\nYou can click a suggestion below OR type your own answer.\n\n" + ONBOARDING_STEPS[0].q, suggestions: ONBOARDING_STEPS[0].opts }]);
      }
    } catch (e) {
      console.error('Chat init error:', e);
      setMessages([{ id: 1, type: 'ai', text: "Welcome! Something went wrong during setup. Let's try again.", suggestions: ['Start over'] }]);
    }
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const finishMultiSelect = (skipped = false) => {
    const step = ONBOARDING_STEPS[onboarding];
    const skills = skipped ? [] : selectedSkills;
    const newD = { ...onbData, [step.field]: skills };
    setOnbData(newD);
    setSelectedSkills([]);
    const userMsg = { id: Date.now(), type: 'user', text: skipped ? 'None — complete beginner' : skills.join(', ') || 'No skills selected' };
    const next = onboarding + 1;
    if (next < ONBOARDING_STEPS.length) {
      setOnboarding(next);
      setMessages(prev => [...prev, userMsg, { id: Date.now() + 1, type: 'ai', text: ONBOARDING_STEPS[next].q, suggestions: ONBOARDING_STEPS[next].opts }]);
    } else {
      setMessages(prev => [...prev, userMsg]);
      completeOnboarding({ ...newD, current_skills: skills });
    }
  };

  const completeOnboarding = (data) => {
    safeSetLoading(true);
    try {
      const profile = buildProfile(data);
      const path = getLearningPath(profile);
      const recs = getRecommendations(profile);
      const nextAction = getNextAction(profile);
      const skills = profile.current_skills.map(s => typeof s === 'object' ? s.skill : s);
      const summaryMsg = {
        id: Date.now() + 100, type: 'ai',
        text: `Your profile is ready!\n\nLevel: ${profile.experience_level}\nInterests: ${profile.interests.map(i => i.replace(/_/g, ' ')).join(', ')}\nSkills: ${skills.join(', ') || 'None yet'}\nTime: ${profile.time_commitment}\n\nLearning Path:\n• ${path.total_courses} skills to learn\n• ${path.phases.length} phases\n• ~${path.estimated_weeks} weeks (~${path.estimated_hours}h)\n\nNext: ${nextAction}`,
        rich: 'recommendations',
        richData: recs.slice(0, 2),
        suggestions: ['Show my learning path', 'Recommend courses', 'How long will this take?', 'What skills do I need?']
      };
      setMessages(prev => [...prev, summaryMsg]);
    } catch (e) {
      console.error('completeOnboarding error:', e);
      setMessages(prev => [...prev, { id: Date.now() + 100, type: 'ai', text: "Profile created! Check your Dashboard for recommendations.", suggestions: ['Recommend courses', 'Show my learning path'] }]);
    }
    setOnboarding(null);
    safeSetLoading(false);
  };

  const handleSuggestion = (s) => {
    if (onboarding !== null) handleOnboardingChoice(s);
    else sendMessage(s);
  };

  const handleOnboardingChoice = (choice) => {
    const step = ONBOARDING_STEPS[onboarding];
    const isMulti = step.multi;
    if (isMulti) {
      if (choice === 'None — I\'m a complete beginner') { finishMultiSelect(true); return; }
      if (choice === 'Done — proceed' || choice === 'Done') { finishMultiSelect(false); return; }
      const newSelected = selectedSkills.includes(choice) ? selectedSkills.filter(s => s !== choice) : [...selectedSkills, choice];
      setSelectedSkills(newSelected);
      const displaySkills = newSelected.length > 0 ? newSelected.join(', ') : 'None selected yet';
      const aiMsg = { id: Date.now(), type: 'ai', text: `Selected: ${displaySkills}\n\nClick "Done" when finished, or keep selecting.`, suggestions: [...newSelected, 'Done — proceed'] };
      setMessages(prev => [...prev, { id: Date.now() - 1, type: 'user', text: newSelected.includes(choice) ? `+ ${choice}` : `- ${choice}` }, aiMsg]);
      return;
    }
    const newD = { ...onbData, [step.field]: choice };
    setOnbData(newD);
    const userMsg = { id: Date.now(), type: 'user', text: choice };
    const next = onboarding + 1;
    if (next < ONBOARDING_STEPS.length) {
      setOnboarding(next);
      setMessages(prev => [...prev, userMsg, { id: Date.now() + 1, type: 'ai', text: ONBOARDING_STEPS[next].q, suggestions: ONBOARDING_STEPS[next].opts }]);
    } else {
      setMessages(prev => [...prev, userMsg]);
      completeOnboarding({ ...newD, current_skills: selectedSkills });
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text }]);
    setInput('');
    safeSetLoading(true);

    try {
      const profile = getProfile();

      if (onboarding !== null) {
        const step = ONBOARDING_STEPS[onboarding];
        if (step.multi && (text.toLowerCase() === 'done' || text.toLowerCase() === 'done — proceed')) { finishMultiSelect(false); safeSetLoading(false); return; }
        if (step.multi && text.toLowerCase() === 'none') { finishMultiSelect(true); safeSetLoading(false); return; }
        if (step.multi) {
          const matched = step.opts.filter(o => o !== 'None — I\'m a complete beginner' && (text.toLowerCase().includes(o.toLowerCase()) || o.toLowerCase().includes(text.toLowerCase())));
          if (matched.length > 0) { matched.forEach(m => handleOnboardingChoice(m)); safeSetLoading(false); return; }
          const aiMsg = { id: Date.now() + 1, type: 'ai', text: `I didn't recognize "${text}". Please click one of the buttons above.`, suggestions: [...step.opts.filter(o => o !== 'None — I\'m a complete beginner'), 'None — I\'m a complete beginner', 'Done — proceed'] };
          setMessages(prev => [...prev, aiMsg]);
          safeSetLoading(false);
          return;
        }
        const exactMatch = step.opts.find(o => o.toLowerCase() === text.toLowerCase());
        const partialMatch = step.opts.find(o => text.toLowerCase().includes(o.toLowerCase().split(' ')[0].toLowerCase()) && text.toLowerCase().length >= 3);
        const match = exactMatch || partialMatch;
        if (match) { handleOnboardingChoice(match); safeSetLoading(false); return; }
        const hint = { id: Date.now() + 1, type: 'ai', text: `Please select from the options above, or type one of:\n${step.opts.map(o => `• ${o}`).join('\n')}`, suggestions: step.opts };
        setMessages(prev => [...prev, hint]);
        safeSetLoading(false);
        return;
      }

      let aiResponse = profile ? processMessage(text, profile) : null;
      if (!aiResponse && !profile) {
        aiResponse = { text: "I need your profile to give personalized answers. Please complete the onboarding first, or try the demo profiles on the Dashboard page." };
      }
      if (!aiResponse) {
        const llmResponse = await callLLM(text, profile);
        aiResponse = { text: llmResponse || "I can help with course recommendations, learning paths, skill gaps, and career guidance. Try asking about your learning path, skill gaps, or what to study next!" };
      }

      const aiMsg = {
        id: Date.now() + 1,
        type: 'ai',
        text: aiResponse.text,
        rich: aiResponse.rich,
        richData: aiResponse.data || aiResponse.richData,
        suggestions: aiResponse.rich ? ['Show my learning path', 'How long will this take?', 'What skills do I need?'] : ['Recommend courses', 'Show my learning path', 'What skills do I need?', 'How long will this take?'],
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error('sendMessage error:', e);
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', text: "Something went wrong. Please try again.", suggestions: ['Recommend courses', 'Show my learning path', 'Help'] }]);
    }
    safeSetLoading(false);
  };

  return (
    <div className="page-wrapper">
      <Head><title>AI Learning Assistant — LearnPath AI</title></Head>
      <NavBar active="chat" />
      <main className="container" style={{ paddingTop: 16 }}>
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.type}`}>
                <div className={`chat-avatar ${msg.type === 'ai' ? 'ai' : 'human'}`}>{msg.type === 'ai' ? 'AI' : 'You'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="chat-bubble">
                    <TypingText text={msg.text} speed={msg.text.length > 200 ? 4 : 8} />
                    {msg.rich && msg.richData && (
                      <div style={{ marginTop: 8 }}>
                        <RichResponse type={msg.rich} data={msg.richData} profile={getProfile()} />
                      </div>
                    )}
                  </div>
                  {msg.suggestions?.length > 0 && (
                    <div className="chat-suggestions">
                      {msg.suggestions.map((s, i) => <button key={i} className="chat-suggestion" onClick={() => handleSuggestion(s)}>{s}</button>)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-message ai">
                <div className="chat-avatar ai">AI</div>
                <div className="chat-bubble" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="loading-spinner" />
                  <span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form className="chat-input-area" onSubmit={(e) => { e.preventDefault(); if (!loading && input.trim()) sendMessage(input); }}>
            <input type="text" className="chat-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder={onboarding !== null ? "Type your answer or click a suggestion above..." : "Ask me anything about learning..."} disabled={loading} aria-label="Chat message input" />
            <button type="submit" className="chat-send" disabled={loading || !input.trim()}>{loading ? '...' : 'Send'}</button>
          </form>
        </div>
      </main>
    </div>
  );
}
