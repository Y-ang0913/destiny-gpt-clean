import { useState } from 'react'

export default function Home() {
  const [input, setInput] = useState('')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/log-to-notion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: input })
    })
    const data = await res.json()
    setReply(data.reply)
    setLoading(false)
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>AI 命理问答系统</h1>
      <form onSubmit={handleSubmit}>
        <textarea rows={3} style={{ width: '100%' }} value={input} onChange={e => setInput(e.target.value)} />
        <br />
        <button type="submit" disabled={loading}>提交</button>
      </form>
      <p>{loading ? '正在生成中…' : reply}</p>
    </main>
  )
}
