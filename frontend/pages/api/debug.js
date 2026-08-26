export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).end();
  const key = process.env.GEMINI_API_KEY;
  return res.status(200).json({
    keySet: !!key && key.length > 10,
    keyLength: key ? key.length : 0,
    keyPrefix: key ? key.substring(0, 6) : 'none',
  });
}
