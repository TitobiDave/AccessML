import { Play, RotateCcw, RotateCw, Clock, Tag, Terminal, ArrowRight } from 'lucide-react'

const BADGES = [
  { label: 'Mean Squared Error (MSE)', cls: 'text-emerald-300' },
  { label: 'Gradient Descent Optimization', cls: 'text-indigo-300' },
  { label: 'NumPy Feature Matrices', cls: 'text-teal-300' },
]

const COMPONENTS = [
  ['Weights (w):', 'Slopes representing feature impact.'],
  ['Bias (b):', 'Offset term shifting the decision boundary.'],
  ['Loss Function (MSE):', 'Quantifies squared errors between actual target y and predicted ŷ.'],
]

export default function Lessons({ goQuiz, goLab }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_620px]">
      <div className="space-y-5">
        <section className="overflow-hidden rounded-2xl border border-edge bg-panel">
          <div className="relative grid aspect-[16/8.5] place-items-center bg-[repeating-linear-gradient(90deg,#052e1a_0_14px,#031a10_14px_28px)]">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-ink/90" />
            <button aria-label="Play lesson video" className="relative grid size-20 place-items-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 transition hover:scale-105">
              <Play className="size-8 fill-ink text-ink" />
            </button>
            <span className="absolute bottom-4 left-5 rounded-lg border border-edge bg-ink/80 px-3 py-1.5 text-sm font-medium">
              Module 3: Supervised Learning &amp; Linear Regression
            </span>
            <span className="absolute bottom-4 right-5 flex items-center gap-1.5 rounded-lg border border-edge bg-ink/80 px-3 py-1.5 text-sm">
              <Clock className="size-4 text-emerald-400" /> 14:20
            </span>
          </div>
          <div className="flex items-center gap-4 border-t border-edge px-4 py-3 text-sm text-slate-400">
            <button className="flex items-center gap-1 hover:text-white"><RotateCcw className="size-4" /> 10s</button>
            <button className="flex items-center gap-1 hover:text-white"><RotateCw className="size-4" /> 10s</button>
            <span className="h-5 w-px bg-edge" />
            <span className="font-medium text-slate-200">Topic: Cost Function &amp; Gradient Descent</span>
            <span className="ml-auto rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/30">HD 1080p</span>
          </div>
        </section>

        <section className="rounded-2xl border border-edge bg-panel p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-300">
            <Tag className="size-4 text-amber-400" /> Interactive concept badges (click to explore in code lab)
          </h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {BADGES.map((b) => (
              <button key={b.label} onClick={goLab} className={`rounded-lg border border-edge bg-ink/60 px-4 py-2 text-sm font-semibold hover:border-emerald-500/50 ${b.cls}`}>
                {b.label}
              </button>
            ))}
          </div>
        </section>
      </div>

      <aside className="flex flex-col rounded-2xl border border-edge bg-panel">
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between border-b border-edge pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Lesson 3.2 Notes</p>
              <h2 className="mt-1 text-xl font-bold">Introduction to Supervised Learning</h2>
            </div>
            <button onClick={goLab} className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-300">
              Code Lab <Terminal className="size-4" />
            </button>
          </div>
          <p className="mt-5 text-[15px] leading-7 text-slate-300">
            Supervised learning involves training a model on labeled input/output data pairs so it can predict outputs for unobserved inputs.
          </p>
          <pre className="mt-4 rounded-xl border border-edge bg-ink px-4 py-3 font-mono text-sm text-emerald-400">Hypothesis Function: ŷ = w · X + b</pre>
          <h4 className="mt-6 font-semibold">Key Components:</h4>
          <ul className="mt-2 space-y-2 pl-4 text-[15px] leading-7 text-slate-300">
            {COMPONENTS.map(([k, v]) => (
              <li key={k}><b className="text-white">{k}</b> {v}</li>
            ))}
          </ul>
          <p className="mt-5 text-[15px] leading-7 text-slate-300">
            In the Code Lab, we will use Python and Scikit-Learn to fit a model to dataset points automatically.
          </p>
        </div>
        <div className="flex items-center justify-between border-t border-edge px-6 py-4">
          <div>
            <p className="text-sm font-bold">Finished this lesson?</p>
            <p className="text-sm text-slate-400">Test your knowledge in the module quiz.</p>
          </div>
          <button onClick={goQuiz} className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-ink hover:bg-emerald-400">
            Take Quiz <ArrowRight className="size-4" />
          </button>
        </div>
      </aside>
    </div>
  )
}
