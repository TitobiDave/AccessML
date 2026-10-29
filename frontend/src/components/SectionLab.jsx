import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { FlaskConical, Play, CheckCircle2, Loader2, Lightbulb, RotateCcw } from 'lucide-react'
import { getPyodide, runPython } from '../pyodide.js'
import { USER_ID } from '../progress.js'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const MD = [
  'text-[15px] leading-7 text-slate-300 [&_p]:my-3 [&_strong]:text-white',
  '[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6',
  '[&_code]:rounded [&_code]:bg-ink [&_code]:px-1.5 [&_code]:font-mono [&_code]:text-[13px] [&_code]:text-emerald-400',
  '[&_pre]:my-3 [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-edge [&_pre]:bg-ink [&_pre]:p-3',
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
].join(' ')

export default function SectionLab({ lab, passed, onPassed }) {
  const [code, setCode] = useState(lab.starter_code)
  const [out, setOut] = useState('')
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [hints, setHints] = useState(0)

  useEffect(() => {
    getPyodide().then(() => setReady(true)).catch((e) => setOut(e.message))
  }, [])

  const run = async () => {
    const output = await runPython(code)
    setOut(output || '# (no output)')
    return output
  }

  const check = async () => {
    setBusy(true)
    setResult(null)
    try {
      const output = await run()
      const res = await fetch(`${API_BASE}/api/labs/${lab.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 1, code, output }),
      })
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      const data = await res.json()
      setResult(data)
      if (data.passed) onPassed?.(data)
    } catch (err) {
      setResult({ passed: false, message: err.message })
    } finally {
      setBusy(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key !== 'Tab') return
    e.preventDefault()
    const { selectionStart: s, selectionEnd: end, value } = e.target
    setCode(value.slice(0, s) + '    ' + value.slice(end))
    requestAnimationFrame(() => { e.target.selectionStart = e.target.selectionEnd = s + 4 })
  }

  return (
    <section className="mt-12 rounded-2xl border border-emerald-500/30 bg-panel">
      <header className="flex items-center justify-between gap-3 border-b border-edge px-5 py-3">
        <h3 className="flex items-center gap-2 font-bold text-white">
          <FlaskConical className="size-5 text-emerald-400" /> Lab: {lab.title}
        </h3>
        {passed && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
            <CheckCircle2 className="size-4" /> Passed
          </span>
        )}
      </header>

      <div className="px-5 py-4">
        <div className={MD}><ReactMarkdown>{lab.instructions}</ReactMarkdown></div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          aria-label="Python editor"
          className="mt-3 h-64 w-full resize-y rounded-xl border border-edge bg-ink p-4 font-mono text-sm leading-6 outline-none focus:border-emerald-500/50"
        />

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            onClick={async () => { setBusy(true); await run(); setBusy(false) }}
            disabled={!ready || busy}
            className="flex items-center gap-2 rounded-lg border border-edge px-4 py-2 text-sm font-semibold text-slate-200 hover:border-emerald-500/50 disabled:opacity-50"
          >
            <Play className="size-4" /> Run
          </button>
          <button
            onClick={check}
            disabled={!ready || busy}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-ink hover:bg-emerald-400 disabled:opacity-50"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
            Run &amp; check
          </button>
          <button
            onClick={() => { setCode(lab.starter_code); setOut(''); setResult(null) }}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
          >
            <RotateCcw className="size-4" /> Reset
          </button>
          {!ready && <span className="text-xs text-amber-400">Loading Python…</span>}
        </div>

        {out && (
          <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-edge bg-ink p-4 font-mono text-sm text-slate-300">{out}</pre>
        )}

        {result && (
          <p className={`mt-3 rounded-lg border px-4 py-3 text-sm font-semibold ${
            result.passed
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              : 'border-amber-400/40 bg-amber-400/10 text-amber-200'
          }`}>
            {result.message}
            {result.lesson_completed && ' You finished every lab in this lesson.'}
          </p>
        )}

        {lab.hints?.length > 0 && !passed && (
          <div className="mt-4">
            {lab.hints.slice(0, hints).map((h, i) => (
              <p key={i} className="mb-2 flex gap-2 text-sm text-slate-300">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-400" /> {h}
              </p>
            ))}
            {hints < lab.hints.length && (
              <button onClick={() => setHints((n) => n + 1)} className="text-sm font-semibold text-amber-300 hover:text-amber-200">
                Show a hint ({hints}/{lab.hints.length})
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}