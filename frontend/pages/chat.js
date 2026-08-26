import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import NavBar from '../components/NavBar';
import { createProfile, getProfile, getRecommendations, getLearningPath, getSkillGaps } from '../lib/engine';

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

function processMessage(text, profile) {
  const lower = text.toLowerCase();
  try {
    // ── GREETINGS ──
    if (lower.match(/\b(hello|hi|hey|namaste|hii|helloo|yo|sup|aur bhai|kaise ho|kya haal)\b/)) {
      return `Hello! I'm your LearnPath AI assistant. I can help you with:\n\n- Course recommendations\n- Learning path details\n- Skill gap analysis\n- Time estimates\n- Career guidance\n\nJust ask me anything!`;
    }

    // ── THANKS / BYE ──
    if (lower.match(/\b(thanks|thank|dhanyavad|shukriya|bye|goodbye|alvida|chalo|theek hai)\b/)) {
      return lower.match(/\b(bye|goodbye|alvida|chalo)\b/) 
        ? "Goodbye! Keep up the great work on your learning journey. See you next time!"
        : "You're welcome! Keep learning and stay consistent. If you need anything else, just ask!";
    }

    // ── HELP ──
    if (lower.match(/\b(help|kya kar|kya kar sakta|kya bol|batao)\b/)) {
      return "Try asking:\n• \"Recommend courses for me\"\n• \"Show my learning path\"\n• \"What skills do I need?\"\n• \"How long will this take?\"\n• \"DSA kaise karu?\"\n• \"2 months mein kya seekhu?\"\n• \"Career options batao\"";
    }

    // ── DSA / SPECIFIC TOPIC + TIME COMBO ──
    const timeMatch = lower.match(/(\d+)\s*(mahine|month|months|hafta|week|weeks|din|day|days|ghante|hour|hours)/);
    const topicKeywords = ['dsa', 'data structure', 'algorithm', 'algorithms', 'coding', 'competitive', 'problem solving', 'cp'];
    const isTopicQuery = topicKeywords.some(k => lower.includes(k));
    const isTimeQuery = !!timeMatch || lower.match(/\b(kitna time|how long|duration|timeline|deadline|by when|kab tak|kab tak mein)\b/);

    if (isTopicQuery || (isTimeQuery && lower.match(/\b(kya|what|seekh|learn|padh|study|karna|kare|karu|start|shuru)\b/))) {
      const months = timeMatch ? parseInt(timeMatch[1]) : null;
      const path = getLearningPath(profile);
      const gapData = getSkillGaps(profile);
      const allSkills = path.phases.flatMap(p => p.courses);
      const dsaSkills = allSkills.filter(s => {
        const t = (s.title || '').toLowerCase();
        return t.includes('data structure') || t.includes('algorithm') || t.includes('dsa') || t.includes('problem');
      });

      let response = '';
      if (months) {
        const hoursPerWeek = profile.time_commitment.includes('More than 20') ? 25 : profile.time_commitment.includes('10-20') ? 15 : profile.time_commitment.includes('5-10') ? 7 : 4;
        const totalHours = months * 4 * hoursPerWeek;
        response = `Here's a plan for DSA in ${months} months:\n\n`;
        response += `Your time: ~${hoursPerWeek} hrs/week → ${totalHours} hours total in ${months} months\n\n`;
        if (dsaSkills.length > 0) {
          response += `DSA skills in your path:\n`;
          dsaSkills.forEach((s, i) => { response += `${i + 1}. ${s.title} (${s.duration_hours}h)\n`; });
          response += `\n`;
        }
        response += `Tips for ${months}-month DSA plan:\n`;
        response += `1. Start with arrays & strings (Week 1-2)\n`;
        response += `2. Linked lists & stacks (Week 3-4)\n`;
        response += `3. Trees & graphs (Month 2)\n`;
        response += `4. Dynamic programming (Month 2-3)\n`;
        response += `5. Practice 2-3 problems daily on LeetCode\n\n`;
        response += `Target: Solve 150-200 problems in ${months} months.\n`;
        response += `Your current readiness: ${gapData.readiness_score}%\n\n`;
        response += `Want course recommendations for DSA? Ask me "recommend courses"!`;
      } else {
        response = `DSA (Data Structures & Algorithms) is essential for your career in ${gapData.career_title}.\n\n`;
        if (dsaSkills.length > 0) {
          response += `In your learning path:\n`;
          dsaSkills.forEach((s, i) => { response += `${i + 1}. ${s.title} (${s.duration_hours}h)\n`; });
          response += `\n`;
        }
        response += `Key topics to cover:\n• Arrays & Strings\n• Linked Lists\n• Stacks & Queues\n• Trees & Graphs\n• Dynamic Programming\n• Sorting & Searching\n\n`;
        response += `How many months do you have? Tell me like "2 months mein DSA karna hai" and I'll make a plan!`;
      }
      return response;
    }

    // ── TIME + FIELD COMBO (e.g. "2 months mein data science") ──
    if (timeMatch && lower.match(/\b(data science|machine learning|web dev|full stack|cloud|devops|cyber|mobile|android|ios|flutter|ai|nlp|deep learning)\b/)) {
      const months = parseInt(timeMatch[1]);
      const hoursPerWeek = profile.time_commitment.includes('More than 20') ? 25 : profile.time_commitment.includes('10-20') ? 15 : profile.time_commitment.includes('5-10') ? 7 : 4;
      const totalHours = months * 4 * hoursPerWeek;
      const path = getLearningPath(profile);
      const gapData = getSkillGaps(profile);
      return `Here's your ${months}-month plan for ${gapData.career_title}:\n\n` +
        `Time: ~${hoursPerWeek} hrs/week → ${totalHours} hours total\n` +
        `Skills in path: ${path.total_courses}\n` +
        `Your readiness: ${gapData.readiness_score}%\n\n` +
        `Path breakdown:\n` +
        path.phases.slice(0, Math.min(months, path.phases.length)).map(p => `Phase ${p.phase}: ${p.name} — ${p.courses.length} skills (${p.duration_weeks}w)`).join('\n') +
        `\n\nWant specific course recommendations? Ask "recommend courses"!`;
    }

    // ── RECOMMENDATIONS ──
    if (lower.match(/\b(recommend|suggest|what should|kya padhu|kya seekhe|kya karu|course|courses|padhai|seekhna)\b/)) {
      const recs = getRecommendations(profile, 3);
      if (recs.length === 0) return "No recommendations available yet. Try completing your onboarding first!";
      return "Here are your top recommendations:\n\n" + recs.map((r, i) => `${i + 1}. ${r.course.title} (${r.course.duration_hours}h) — ${Math.round(r.score * 100)}% match\n   ${r.explanation}`).join('\n\n');
    }

    // ── LEARNING PATH ──
    if (lower.match(/\b(path|roadmap|learning path|raasta|plan|kya padhega|kya seekhega)\b/)) {
      const path = getLearningPath(profile);
      if (path.phases.length === 0) return "Your path is empty. Try completing onboarding first!";
      return `Your learning path has ${path.total_courses} skills across ${path.phases.length} phases.\n\nEstimated time: ${path.estimated_weeks} weeks (~${path.estimated_hours}h)\n\nPhases:\n` + path.phases.map(p => `${p.phase}. ${p.name} — ${p.courses.length} skills, ~${p.duration_weeks} weeks`).join('\n');
    }

    // ── SKILL GAPS ──
    if (lower.match(/\b(skill|gap|need|kya aata|kya aati|kya nahi aata|missing|acquired)\b/)) {
      const gapData = getSkillGaps(profile);
      return `Your readiness for ${gapData.career_title}: ${gapData.readiness_score}%\n\nAcquired: ${gapData.acquired_skills.join(', ') || 'None yet'}\nMissing: ${gapData.missing_skills.slice(0, 5).map(s => s.name).join(', ')}`;
    }

    // ── WHY / EXPLAIN ──
    if (lower.match(/\b(why|explain|kyun|kyu|kaise|how does|how do)\b/)) {
      const recs = getRecommendations(profile, 1);
      if (recs[0]) return `Why ${recs[0].course.title}?\n\n${recs[0].why_this}\n\nDifficulty: ${recs[0].difficulty_reason}\n${recs[0].prerequisite_info.message}`;
      return "No recommendations available yet. Complete the onboarding first!";
    }

    // ── SKIP ──
    if (lower.match(/\b(skip|can i skip|chhod sakta|skip karu)\b/)) {
      const recs = getRecommendations(profile, 1);
      if (recs[0]) {
        const prereqInfo = recs[0].prerequisite_info;
        if (!prereqInfo.met) return `Skipping "${recs[0].course.title}" is not recommended.\n\n${prereqInfo.message}\n\nYou need these prerequisites first before moving to this skill.`;
        return `You can skip "${recs[0].course.title}" if you already know the material, but it's recommended for your path. The ${recs[0].difficulty_reason}.`;
      }
      return "No recommendations available yet. Complete the onboarding first!";
    }

    // ── TIME / DURATION ──
    if (lower.match(/\b(how long|time|duration|weeks|kitna time|mahine|month|hafta|week|kab|when)\b/)) {
      const path = getLearningPath(profile);
      return `Based on your ${profile.time_commitment} commitment:\n\nTotal time: ~${path.estimated_hours} hours\nEstimated duration: ${path.estimated_weeks} weeks\nSkills to learn: ${path.total_courses}\n\nThis adjusts automatically if you change your time commitment.`;
    }

    // ── NEXT STEP ──
    if (lower.match(/\b(next|what now|start|aage|shuru|begin)\b/)) {
      return `Here's what you should do next:\n\n${getNextAction(profile)}\n\nOr check your dashboard for the full overview.`;
    }

    // ── CAREER ──
    if (lower.match(/\b(career|job|salary|placement|interview|resume|hiring|package|lpa|salary)\b/)) {
      const gapData = getSkillGaps(profile);
      return `You're targeting: ${gapData.career_title}\n\nReadiness: ${gapData.readiness_score}%\nAvg Salary: ${gapData.avg_salary}\nGrowth Rate: ${gapData.growth_rate}\n\nMissing skills: ${gapData.missing_skills.slice(0, 3).map(s => s.name).join(', ')}`;
    }

    // ── FIELD-SPECIFIC ──
    if (lower.match(/\b(data science|machine learning|web dev|full stack|frontend|backend|cloud|devops|cyber|mobile|android|ios|flutter|ai|nlp|deep learning|python|java|javascript|react|node)\b/)) {
      const gapDataLocal = getSkillGaps(profile);
      const recsLocal = getRecommendations(profile, 5);
      const pathLocal = getLearningPath(profile);
      return `For your target field (${gapDataLocal.career_title}), here's what I recommend:\n\n` +
        recsLocal.slice(0, 3).map((r, i) => `${i + 1}. ${r.course.title} (${r.course.duration_hours}h) — ${Math.round(r.score * 100)}% match`).join('\n') +
        `\n\nYour path: ${pathLocal.total_courses} skills across ${pathLocal.phases.length} phases (~${pathLocal.estimated_weeks} weeks).\n\nAsk me "recommend courses" for more details!`;
    }

    // ── DASHBOARD ──
    if (lower.match(/\b(dashboard|progress|overview)\b/)) {
      return "Check your Dashboard for a full overview of your progress, skill coverage, and learning phases. Click the Dashboard link in the navigation above!";
    }

    // ── CATCH-ALL: ALWAYS RESPOND WITH PROFILE DATA ──
    const gapData = getSkillGaps(profile);
    const recs = getRecommendations(profile, 3);
    const path = getLearningPath(profile);
    return `I heard you! Here's what I can help with based on your profile:\n\n` +
      `Your target: ${gapData.career_title} (${gapData.readiness_score}% ready)\n` +
      `Path: ${path.total_courses} skills, ~${path.estimated_weeks} weeks\n\n` +
      `Top recommendations:\n` +
      recs.slice(0, 3).map((r, i) => `${i + 1}. ${r.course.title} (${r.course.duration_hours}h)`).join('\n') +
      `\n\nTry asking:\n• "DSA kaise karu?"\n• "2 months mein kya seekhu?"\n• "Recommend courses"\n• "Show my learning path"\n• "What skills do I need?"\n• "Career options batao"`;
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
      let summary = "Your profile is ready!\n\n" + formatProfileSummary(profile, path) + "\n\nNext action: " + nextAction + "\n\nTop recommendations:\n";
      recs.slice(0, 3).forEach((r, i) => { summary += `\n${i + 1}. ${r.course.title} (${r.course.duration_hours}h) — ${Math.round(r.score * 100)}% match\n   ${r.explanation}`; });
      summary += "\n\nAsk me anything about your learning journey!";
      setMessages(prev => [...prev, { id: Date.now() + 100, type: 'ai', text: summary, suggestions: ['Recommend courses for me', 'Show my learning path', 'How long will this take?', 'What should I start with?'] }]);
    } catch (e) {
      console.error('completeOnboarding error:', e);
      setMessages(prev => [...prev, { id: Date.now() + 100, type: 'ai', text: "Profile created! Check your Dashboard for recommendations, or ask me anything.", suggestions: ['Recommend courses', 'Show my learning path'] }]);
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
      if (choice === 'None — I\'m a complete beginner') {
        finishMultiSelect(true);
        return;
      }
      if (choice === 'Done — proceed' || choice === 'Done') {
        finishMultiSelect(false);
        return;
      }
      const newSelected = selectedSkills.includes(choice) ? selectedSkills.filter(s => s !== choice) : [...selectedSkills, choice];
      setSelectedSkills(newSelected);
      const displaySkills = newSelected.length > 0 ? newSelected.join(', ') : 'None selected yet';
      const aiMsg = {
        id: Date.now(), type: 'ai',
        text: `Selected: ${displaySkills}\n\nClick "Done" when finished, or keep selecting skills.`,
        suggestions: [...newSelected, 'Done — proceed']
      };
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
        if (step.multi && (text.toLowerCase() === 'done' || text.toLowerCase() === 'done — proceed')) {
          finishMultiSelect(false);
          return;
        }
        if (step.multi && text.toLowerCase() === 'none') {
          finishMultiSelect(true);
          return;
        }
        if (step.multi) {
          const matched = step.opts.filter(o => o !== 'None — I\'m a complete beginner' && (text.toLowerCase().includes(o.toLowerCase()) || o.toLowerCase().includes(text.toLowerCase())));
          if (matched.length > 0) {
            matched.forEach(m => handleOnboardingChoice(m));
            safeSetLoading(false);
            return;
          }
          const exactMatch = step.opts.find(o => o.toLowerCase().split(' ')[0] === text.toLowerCase().split(' ')[0]);
          if (exactMatch) { handleOnboardingChoice(exactMatch); safeSetLoading(false); return; }
          const aiMsg = { id: Date.now() + 1, type: 'ai', text: `I didn't recognize "${text}". Please click one of the skill buttons above, or type the exact skill name.`, suggestions: [...step.opts.filter(o => o !== 'None — I\'m a complete beginner'), 'None — I\'m a complete beginner', 'Done — proceed'] };
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
        aiResponse = "I need your profile to give personalized answers. Please complete the onboarding first, or try the demo profiles on the Dashboard page.";
      }
      if (!aiResponse) aiResponse = await callLLM(text, profile);
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', text: aiResponse || "I can help with course recommendations, learning paths, skill gaps, and career guidance. Try asking about your learning path, skill gaps, or what to study next!", suggestions: ['Recommend courses', 'Show my learning path', 'What skills do I need?', 'How long will this take?'] }]);
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
                <div>
                  <div className="chat-bubble" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
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
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form className="chat-input-area" onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}>
            <input type="text" className="chat-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder={onboarding !== null ? "Type your answer or click a suggestion above..." : "Ask me anything about learning..."} disabled={false} />
            <button type="submit" className="chat-send" disabled={loading || !input.trim()}>{loading ? '...' : 'Send'}</button>
          </form>
        </div>
      </main>
    </div>
  );
}
