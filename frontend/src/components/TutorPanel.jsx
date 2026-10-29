import { useState } from 'react'

export default function TutorPanel({ onClose }) {
  const [question, setQuestion] = useState('')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)

  const ask = async () => {
    if (!question.trim()) return
    setLoading(true)
    setReply('')
    try {
      const res = await fetch('http://127.0.0.1:8000/api/tutor/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || `Request failed (${res.status})`)
      }
      const data = await res.json()
      setReply(data.reply)
    } catch (err) {
      setReply(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed right-4 top-20 z-50 w-96 rounded-xl border border-edge bg-nav p-4 shadow-2xl">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-white">AI Tutor</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
      </div>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question..."
        className="h-24 w-full rounded-lg border border-edge bg-ink p-2 text-sm text-white"
      />
      <button
        onClick={ask}
        disabled={loading}
        className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Thinking...' : 'Ask'}
      </button>
      {reply && (
        <div className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-ink p-3 text-sm text-slate-200">
          {reply}
        </div>
      )}
    </div>
  )
}