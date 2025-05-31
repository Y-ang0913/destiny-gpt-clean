import { Configuration, OpenAIApi } from 'openai'
import { writeToNotion } from '../../utils/notion'


export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { question } = req.body
  if (!question) return res.status(400).json({ error: 'Question is required' })

  const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }))
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: question }]
  })

  const reply = completion.choices[0]?.message?.content || 'No response.'

  await writeToNotion({
    question,
    reply,
    time: new Date().toISOString(),
    source: 'Vercel',
    note: 'Auto'
  })

  res.status(200).json({ reply })
}
