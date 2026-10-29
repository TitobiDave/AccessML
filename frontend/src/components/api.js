// All calls to the AccessML backend live here. In dev, Vite proxies /api -> http://localhost:8000
async function post(path, body) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Cannot reach the backend. Is it running on port 8000? (uvicorn main:app --reload)')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = typeof data.detail === 'string' ? data.detail : 'Please enter some code first.'
    throw new Error(msg)
  }
  return data
}

export const debugCode = (code, output) => post('/tutor/debug', { code, output }).then((d) => d.reply)
export const askTutor = (question, lessonId = null) =>
  post('/tutor/ask', { question, lesson_id: lessonId }).then((d) => d.reply)