const URL_BASE = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
let promise = null

export function getPyodide() {
  if (promise) return promise
  promise = new Promise((resolve, reject) => {
    const start = () => window.loadPyodide({ indexURL: URL_BASE }).then(resolve, reject)
    if (window.loadPyodide) return start()
    const s = document.createElement('script')
    s.src = `${URL_BASE}pyodide.js`
    s.onload = start
    s.onerror = () => reject(new Error('Could not download Pyodide. Check your connection.'))
    document.head.appendChild(s)
  }).catch((err) => { promise = null; throw err })
  return promise
}

// Runs code in a fresh namespace so variables from earlier runs can't leak in
export async function runPython(code) {
  const py = await getPyodide()
  let buf = ''
  py.setStdout({ batched: (s) => (buf += s + '\n') })
  py.setStderr({ batched: (s) => (buf += s + '\n') })
  const ns = py.globals.get('dict')()
  try {
    await py.loadPackagesFromImports(code)
    await py.runPythonAsync(code, { globals: ns })
  } catch (e) {
    buf += String(e.message).trim() + '\n'
  } finally {
    ns.destroy()
  }
  return buf.trimEnd()
}