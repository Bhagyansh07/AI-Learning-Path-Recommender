const RATE_LIMIT = new Map();
const RATE_WINDOW = 60000;
const RATE_MAX = 15;
const ALLOWED_ORIGINS = ['https://frontend-mu-jet-18.vercel.app', 'http://localhost:3000'];

function isRateLimited(ip) {
  const now = Date.now();
  const entry = RATE_LIMIT.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    RATE_LIMIT.set(ip, { start: now, count: 1 });
    if (RATE_LIMIT.size > 5000) {
      for (const [k, v] of RATE_LIMIT) { if (now - v.start > RATE_WINDOW) RATE_LIMIT.delete(k); }
    }
    return false;
  }
  entry.count++;
  return entry.count > RATE_MAX;
}

function setCors(res, origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', allowed);
}

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>"'&]/g, c => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' }[c] || c)).slice(0, 2000);
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (req.method === 'OPTIONS') {
    setCors(res, origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') { setCors(res, origin); return res.status(405).json({ error: 'Method not allowed' }); }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) { setCors(res, origin); return res.status(429).json({ error: 'Too many requests. Please wait a moment.' }); }

  setCors(res, origin);

  const { message, context, mode } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) { setCors(res, origin); return res.status(400).json({ error: 'Valid message required' }); }
  if (message.length > 2000) { setCors(res, origin); return res.status(400).json({ error: 'Message too long (max 2000 characters)' }); }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.length < 10) {
    return res.status(200).json({ source: 'fallback', response: getFallback(message, mode) });
  }

  try {
    const safeMsg = sanitize(message);
    let prompt;
    if (mode === 'chat') {
      const ctx = context ? `\nLearner level: ${sanitize(context.level || '')}, interests: ${(context.interests || []).slice(0, 5).map(sanitize).join(', ')}, skills: ${(context.skills || []).slice(0, 10).map(sanitize).join(', ')}` : '';
      prompt = `You are LearnPath AI, a friendly learning assistant for a course recommendation platform.\n${ctx}\n\nUser: ${safeMsg}\n\nRespond in 2-3 sentences max. Be helpful and encouraging. If recommending something, explain why briefly.`;
    } else if (mode === 'explain') {
      prompt = `Explain why this course is recommended in 2-3 sentences. Be concise and encouraging.\nCourse: ${safeMsg}\n\nExplanation:`;
    } else {
      prompt = `Extract a learning profile from this text. Return ONLY valid JSON with: interests (array of domains), experience_level (beginner/intermediate/advanced), skills (array), goals (array).\nText: "${safeMsg}"\nJSON:`;
    }

    const model = 'gemini-2.0-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.5, maxOutputTokens: 300 } }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return res.status(200).json({ source: 'fallback', response: getFallback(message, mode) });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    if (!text) return res.status(200).json({ source: 'fallback', response: getFallback(message, mode) });

    if (mode === 'chat') return res.status(200).json({ source: 'gemini', response: text });
    if (mode === 'explain') return res.status(200).json({ source: 'gemini', explanation: text });
    try {
      const cleaned = text.startsWith('```') ? text.split('\n', 1).slice(1).join('\n').split('```')[0].trim() : text;
      return res.status(200).json({ source: 'gemini', data: JSON.parse(cleaned) });
    } catch {
      return res.status(200).json({ source: 'fallback', data: getFallbackProfile(message) });
    }
  } catch (err) {
    console.error('Gemini fetch error:', err.message);
    return res.status(200).json({ source: 'fallback', response: getFallback(message, mode) });
  }
}

function getFallback(msg, mode) {
  const m = (msg || '').toLowerCase();
  if (mode === 'explain') return 'This course is recommended because it aligns with your interests and matches your skill level. It will help you build practical, in-demand skills.';
  if (m.includes('hello') || m.includes('hi') || m.includes('hey')) return "Hello! I'm LearnPath AI. Tell me your learning goals and I'll create a personalized roadmap for you!";
  if (m.includes('recommend') || m.includes('suggest') || m.includes('what should')) return "Set up your profile through the onboarding, and I'll suggest the best courses tailored for you!";
  if (m.includes('skill') || m.includes('gap')) return "Check the Dashboard Skills tab to see your acquired skills and gaps. Focus on high-priority skills first!";
  if (m.includes('career') || m.includes('job')) return "Our system maps courses to career paths with salary data. Complete onboarding to see which careers match you!";
  if (m.includes('next') || m.includes('what now')) return "Check your Learning Path page to see your next recommended course!";
  return "I can help with course recommendations, learning paths, skill gaps, and career guidance. What would you like to know?";
}

function getFallbackProfile(text) {
  const t = (text || '').toLowerCase();
  const interests = [];
  if (['data', 'analytics', 'statistics'].some(w => t.includes(w))) interests.push('data_science');
  if (['ml', 'machine learning', 'ai', 'artificial intelligence'].some(w => t.includes(w))) interests.push('machine_learning');
  if (['web', 'frontend', 'react', 'javascript'].some(w => t.includes(w))) interests.push('web_development');
  if (['cloud', 'aws', 'devops'].some(w => t.includes(w))) interests.push('cloud_computing');
  if (!interests.length) interests.push('programming');
  return { interests, experience_level: 'beginner', skills: [], goals: ['software_engineer'] };
}
