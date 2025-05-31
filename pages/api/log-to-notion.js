import { writeToNotion } from '../../utils/notion';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Question is required' });

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const completionRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: question }]
      })
    });

    const data = await completionRes.json();
    const reply = data.choices?.[0]?.message?.content || 'No response.';

    await writeToNotion({
      question,
      reply,
      time: new Date().toISOString(),
      source: 'Vercel',
      note: 'Auto'
    });

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
