import AIMentor from '../components/AIMentor'
import { useEffect, useRef, useState } from 'react'
import { Play, SlidersHorizontal, Terminal, Trash2, Loader2 } from 'lucide-react'

const PYODIDE_VERSION = '0.26.4'
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

// Loaded once per page, even if the component remounts
let pyodidePromise = null
function getPyodide() {
  if (pyodidePromise) return pyodidePromise
  pyodidePromise = new Promise((resolve, reject) => {
    const start = () => window.loadPyodide({ indexURL: PYODIDE_URL }).then(resolve, reject)
    if (window.loadPyodide) return start()
    const script = document.createElement('script')
    script.src = `${PYODIDE_URL}pyodide.js`
    script.onload = start
    script.onerror = () => reject(new Error('Could not download Pyodide. Check your internet connection.'))
    document.head.appendChild(script)
  }).catch((err) => {
    pyodidePromise = null // allow a retry on the next mount
    throw err
  })
  return pyodidePromise
}

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

export default function Playground({ labId = null }) {
  const [code, setCode] = useState(PRESETS['Linear Regression'])
  const [out, setOut] = useState('')
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [loadError, setLoadError] = useState(null)
  const [running, setRunning] = useState(false)
  const [version, setVersion] = useState('')
  const py = useRef(null)

  useEffect(() => {
    let alive = true
    getPyodide()
      .then((p) => {
        if (!alive) return
        py.current = p
        setVersion(p.runPython('import sys; ".".join(map(str, sys.version_info[:2]))'))
        setStatus('ready')
      })
      .catch((err) => {
        if (!alive) return
        setLoadError(err.message)
        setStatus('error')
      })
    return () => { alive = false }
  }, [])

  const run = async () => {
    if (!py.current || running) return
    setRunning(true)
    setOut('')
    let buf = ''
    py.current.setStdout({ batched: (s) => (buf += s + '\n') })
    py.current.setStderr({ batched: (s) => (buf += s + '\n') })
    try {
      await py.current.loadPackagesFromImports(code) // downloads numpy etc. on first use
      await py.current.runPythonAsync(code)
    } catch (e) {
      // Keep the traceback so students can practise reading it
      buf += String(e.message).trim() + '\n'
    }
    setOut(buf.trimEnd() || '# (no output)')
    setRunning(false)
  }

  const onKeyDown = (e) => {
    // Ctrl/Cmd + Enter runs the code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      run()
      return
    }
    // Tab inserts 4 spaces instead of leaving the editor
    if (e.key === 'Tab') {
      e.preventDefault()
      const { selectionStart: s, selectionEnd: end, value } = e.target
      const next = value.slice(0, s) + '    ' + value.slice(end)
      setCode(next)
      requestAnimationFrame(() => { e.target.selectionStart = e.target.selectionEnd = s + 4 })
    }
  }

  const statusText =
    status === 'ready' ? `Pyodide Python ${version} Ready`
    : status === 'error' ? 'Failed to load Pyodide'
    : 'Loading Pyodide…'
  const statusColor =
    status === 'ready' ? 'text-emerald-400' : status === 'error' ? 'text-rose-400' : 'text-amber-400'

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-edge bg-panel px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <SlidersHorizontal className="size-4 text-indigo-300" />
          <span className="font-semibold text-slate-300">Preset Templates:</span>
          {Object.keys(PRESETS).map((k) => (
            <button
              key={k}
              onClick={() => { setCode(PRESETS[k]); setOut('') }}
              className="rounded-md border border-edge bg-ink px-3 py-1.5 font-mono text-xs hover:border-emerald-500/50"
            >
              {k}
            </button>
          ))}
        </div>
        <button
          onClick={run}
          disabled={status !== 'ready' || running}
          title="Ctrl + Enter"
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-ink disabled:opacity-50"
        >
          {running
            ? <><Loader2 className="size-4 animate-spin" /> Running</>
            : <><Play className="size-4 fill-ink" /> Run Code</>}
        </button>
      </div>

      {status === 'error' && (
        <p className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {loadError}
        </p>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <section className="overflow-hidden rounded-xl border border-edge bg-panel">
          <div className="flex items-center gap-2 border-b border-edge px-4 py-2.5 text-xs">
            <i className="size-3 rounded-full bg-red-500" /><i className="size-3 rounded-full bg-amber-500" /><i className="size-3 rounded-full bg-emerald-500" />
            <span className="ml-2 font-mono text-slate-300">ml_model.py</span>
            <span className={`ml-auto font-mono font-semibold ${statusColor}`}>● {statusText}</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            aria-label="Python editor"
            className="h-[300px] w-full resize-none bg-transparent p-5 font-mono text-sm leading-6 outline-none"
          />
        </section>

        <div className="space-y-5">
          <section className="rounded-xl border border-edge bg-panel">
            <div className="flex items-center justify-between border-b border-edge px-4 py-2.5 text-sm font-semibold">
              <span className="flex items-center gap-2 font-mono"><Terminal className="size-4 text-emerald-400" /> Terminal Output</span>
              <button onClick={() => setOut('')} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white">
                <Trash2 className="size-3.5" /> Clear
              </button>
            </div>
            <pre className="min-h-20 whitespace-pre-wrap p-4 font-mono text-sm text-slate-300">
              {out || <span className="text-slate-500"># In-Browser Python Runtime ready. Click 'Run Code' to execute.</span>}
            </pre>
          </section>

          <AIMentor currentCode={code} errorMessage={out} />
        </div>
      </div>
    </div>
  )
}