export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, context, mode } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.length < 10) {
    return res.status(200).json({ source: 'fallback', response: getFallback(message, mode) });
  }

  try {
    let prompt;
    if (mode === 'chat') {
      const ctx = context ? `\nLearner level: ${context.level}, interests: ${context.interests?.join(', ')}, skills: ${context.skills?.join(', ')}` : '';
      prompt = `You are LearnPath AI, a friendly learning assistant for a course recommendation platform.\n${ctx}\n\nUser: ${message}\n\nRespond in 2-3 sentences max. Be helpful and encouraging. If recommending something, explain why briefly.`;
    } else if (mode === 'explain') {
      prompt = `Explain why this course is recommended in 2-3 sentences. Be concise and encouraging.\nCourse: ${message}\n\nExplanation:`;
    } else {
      prompt = `Extract a learning profile from this text. Return ONLY valid JSON with: interests (array of domains), experience_level (beginner/intermediate/advanced), skills (array), goals (array).\nText: "${message}"\nJSON:`;
    }

    const model = 'gemini-2.5-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.5, maxOutputTokens: 300 } }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      return res.status(200).json({ source: 'fallback', response: getFallback(message, mode) });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    if (!text) {
      console.error('Gemini empty response:', JSON.stringify(data).slice(0, 200));
      return res.status(200).json({ source: 'fallback', response: getFallback(message, mode) });
    }

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
  const m = msg.toLowerCase();
  if (mode === 'explain') return 'This course is recommended because it aligns with your interests and matches your skill level. It will help you build practical, in-demand skills.';
  if (m.includes('hello') || m.includes('hi') || m.includes('hey')) return "Hello! I'm LearnPath AI. Tell me your learning goals and I'll create a personalized roadmap for you!";
  if (m.includes('recommend') || m.includes('suggest') || m.includes('what should')) return "Set up your profile through the onboarding, and I'll suggest the best courses tailored for you!";
  if (m.includes('skill') || m.includes('gap')) return "Check the Dashboard Skills tab to see your acquired skills and gaps. Focus on high-priority skills first!";
  if (m.includes('career') || m.includes('job')) return "Our system maps courses to career paths with salary data. Complete onboarding to see which careers match you!";
  if (m.includes('next') || m.includes('what now')) return "Check your Learning Path page to see your next recommended course!";
  return "I can help with course recommendations, learning paths, skill gaps, and career guidance. What would you like to know?";
}

function getFallbackProfile(text) {
  const t = text.toLowerCase();
  const interests = [];
  if (['data', 'analytics', 'statistics'].some(w => t.includes(w))) interests.push('data_science');
  if (['ml', 'machine learning', 'ai', 'artificial intelligence'].some(w => t.includes(w))) interests.push('machine_learning');
  if (['web', 'frontend', 'react', 'javascript'].some(w => t.includes(w))) interests.push('web_development');
  if (['cloud', 'aws', 'devops'].some(w => t.includes(w))) interests.push('cloud_computing');
  if (!interests.length) interests.push('programming');
  return { interests, experience_level: 'beginner', skills: [], goals: ['software_engineer'] };
}
