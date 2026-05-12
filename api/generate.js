import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const rateLimitMap = new Map();
const RATE_LIMIT_MS = 30_000;

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function isRateLimited(ip) {
  const now = Date.now();
  const lastRequest = rateLimitMap.get(ip);
  if (lastRequest && now - lastRequest < RATE_LIMIT_MS) return true;
  rateLimitMap.set(ip, now);
  for (const [key, ts] of rateLimitMap.entries()) {
    if (now - ts > RATE_LIMIT_MS * 2) rateLimitMap.delete(key);
  }
  return false;
}

const TONE_DESCRIPTIONS = {
  constructive: 'supportive, growth-oriented, and encouraging while being honest about areas for improvement',
  direct: 'clear, candid, and straightforward without being harsh — focused on facts and impact',
  formal: 'professional, objective, and corporate in tone — suitable for official HR documentation',
};

const SYSTEM_PROMPT = `You are a senior HR professional and executive coach with 20 years of experience writing performance reviews for Fortune 500 companies. Your reviews are known for being specific, behavioral, fair, and immediately actionable.

When writing a performance review, you always:
- Use specific, observable language rather than vague adjectives
- Ground every assessment in concrete outcomes and measurable impact
- Avoid filler phrases like "is a valuable team member" or "continues to grow"
- Write prose paragraphs — never bullet points inside sections
- Ensure the review would hold up to HR and legal scrutiny

Always respond using exactly these four section headers in Markdown:

## Overall Performance
[2–3 sentences summarizing this employee's performance level and overall impact during the review period]

## Key Strengths
[3–4 specific strengths written as flowing prose, each grounded in a concrete example or observable outcome]

## Areas for Growth
[2–3 development areas framed constructively, each with a specific, actionable suggestion for improvement]

## Goals for Next Period
[3–4 SMART goals directly tied to the areas for growth and the demands of the role, written as clear goal statements]`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Rate limit exceeded. Please wait 30 seconds before generating again.' });
  }

  const { role, accomplishments, improvements, tone } = req.body || {};

  if (!role?.trim() || !accomplishments?.trim()) {
    return res.status(400).json({ error: 'Role and Key Accomplishments are required.' });
  }

  const toneDescription = TONE_DESCRIPTIONS[tone] || TONE_DESCRIPTIONS.constructive;

  const userPrompt = `Write a performance review with a ${toneDescription} tone.

**Role / Title:** ${role.trim()}

**Key Accomplishments This Review Period:**
${accomplishments.trim()}

**Areas Identified for Improvement:**
${improvements?.trim() || 'None provided — use professional judgment based on the role and accomplishments described.'}

Generate a complete, polished performance review. Start directly with "## Overall Performance" — no preamble, no sign-off.`;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (err) {
    console.error('Anthropic API error:', err.message);
    res.write(`data: ${JSON.stringify({ error: 'Generation failed. Please try again.' })}\n\n`);
    res.end();
  }
}