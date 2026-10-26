import { useEffect, useRef, useState } from 'react'
import { Wand2, Play, SlidersHorizontal, Terminal, Trash2, Bot } from 'lucide-react'

const PRESETS = {
  'Linear Regression': `import numpy as np

# 1. Feature Matrix X (Study Hours) & Target y (Test Scores)
X = np.array([1, 2, 3, 4, 5])
y = np.array([50, 60, 70, 80, 90])

# 2. Simple Linear Regression Weights
weight = 10.0
bias = 40.0

y_pred = weight * X + bias
mse = np.mean((y - y_pred) ** 2)
print("Predictions:", y_pred)
print("MSE:", mse)
`,
  'NumPy Tensors': `import numpy as np

A = np.array([[1, 2], [3, 4]])
B = np.eye(2)
print("A @ B =\\n", A @ B)
print("Shape:", A.shape)
`,
  'Gradient Descent Error Bug': `import numpy as np

X = np.array([1, 2, 3, 4, 5])
y = np.array([50, 60, 70, 80, 90])
w, b, lr = 0.0, 0.0, 0.01

for _ in range(100):
    y_pred = w * X + b
    dw = (2 / len(X)) * np.sum((y_pred - y) * X)
    db = (2 / len(X)) * np.sum(y_pred - y)
    w = w + lr * dw   # BUG: should subtract the gradient
    b = b + lr * db

print("w, b =", w, b)
`,
}

const IDLE = "No code errors detected yet. If your script throws an exception or wrong result, click 'Fix / Debug with AI' for step-by-step corrections and Socratic hints."

export default function Playground() {
  const [code, setCode] = useState(PRESETS['Linear Regression'])
  const [out, setOut] = useState('')
  const [hint, setHint] = useState(IDLE)
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)
  const py = useRef(null)

  useEffect(() => {
    let alive = true
    window.loadPyodide?.().then((p) => { py.current = p; alive && setReady(true) })
    return () => { alive = false }
  }, [])

  const run = async () => {
    if (!py.current) return
    let buf = ''
    py.current.setStdout({ batched: (s) => (buf += s + '\n') })
    py.current.setStderr({ batched: (s) => (buf += s + '\n') })
    try {
      await py.current.loadPackagesFromImports(code)
      await py.current.runPythonAsync(code)
    } catch (e) {
      buf += String(e.message).split('\n').slice(-4).join('\n')
    }
    setOut(buf || '# (no output)')
  }

  const debug = async () => {
    const key = import.meta.env.VITE_GROQ_API_KEY
    if (!key) return setHint('Add VITE_GROQ_API_KEY to .env to enable AI debugging.')
    setBusy(true)
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: 'qwen-2.5-coder-32b',
          messages: [
            { role: 'system', content: 'You are a Socratic ML tutor. Find bugs in the Python code, give a short hint first, then the fix.' },
            { role: 'user', content: `Code:\n${code}\n\nOutput:\n${out}` },
          ],
        }),
      })
      const data = await res.json()
      setHint(data.choices?.[0]?.message?.content ?? 'No response from the model.')
    } catch {
      setHint('Could not reach the AI service. Check your key and network.')
    }
    setBusy(false)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-edge bg-panel px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <SlidersHorizontal className="size-4 text-indigo-300" />
          <span className="font-semibold text-slate-300">Preset Templates:</span>
          {Object.keys(PRESETS).map((k) => (
            <button key={k} onClick={() => { setCode(PRESETS[k]); setOut(''); setHint(IDLE) }} className="rounded-md border border-edge bg-ink px-3 py-1.5 font-mono text-xs hover:border-emerald-500/50">{k}</button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={debug} disabled={busy} className="flex items-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-200 disabled:opacity-50">
            <Wand2 className="size-4" /> {busy ? 'Thinking…' : 'Fix / Debug with AI'}
          </button>
          <button onClick={run} disabled={!ready} className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-ink disabled:opacity-50">
            <Play className="size-4 fill-ink" /> Run Code
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <section className="overflow-hidden rounded-xl border border-edge bg-panel">
          <div className="flex items-center gap-2 border-b border-edge px-4 py-2.5 text-xs">
            <i className="size-3 rounded-full bg-red-500" /><i className="size-3 rounded-full bg-amber-500" /><i className="size-3 rounded-full bg-emerald-500" />
            <span className="ml-2 font-mono text-slate-300">ml_model.py</span>
            <span className={`ml-auto font-mono font-semibold ${ready ? 'text-emerald-400' : 'text-amber-400'}`}>
              ● {ready ? 'Pyodide Python 3.11 Ready' : 'Loading Pyodide…'}
            </span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            aria-label="Python editor"
            className="h-[300px] w-full resize-none bg-transparent p-5 font-mono text-sm leading-6 outline-none"
          />
        </section>

        <div className="space-y-5">
          <section className="rounded-xl border border-edge bg-panel">
            <div className="flex items-center justify-between border-b border-edge px-4 py-2.5 text-sm font-semibold">
              <span className="flex items-center gap-2 font-mono"><Terminal className="size-4 text-emerald-400" /> Terminal Output</span>
              <button onClick={() => setOut('')} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"><Trash2 className="size-3.5" /> Clear</button>
            </div>
            <pre className="min-h-20 whitespace-pre-wrap p-4 font-mono text-sm text-slate-300">
              {out || <span className="text-slate-500"># In-Browser Python Runtime ready. Click 'Run Code' to execute.</span>}
            </pre>
          </section>

          <section className="rounded-xl border border-edge border-l-4 border-l-indigo-500 bg-panel p-4">
            <div className="flex items-center justify-between border-b border-edge pb-3">
              <span className="flex items-center gap-2 text-sm font-bold"><Bot className="size-4 text-indigo-300" /> Qwen 2.5 Coder 32B (AI Correction Engine)</span>
              <span className="rounded border border-edge bg-ink px-2 py-0.5 font-mono text-[10px] text-slate-400">Groq API LPU</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm italic leading-6 text-slate-300">{hint}</p>
            <p className="mt-3 flex justify-between text-xs text-slate-500">
              <span>Evaluates code syntax &amp; numerical convergence</span><span className="font-mono text-emerald-400">Latency ~0.3s</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
