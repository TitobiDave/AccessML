import { useState } from 'react'
import { RotateCw, ArrowRight } from 'lucide-react'

const QUESTIONS = [
  { q: 'Which loss function is most commonly used for evaluating standard Linear Regression models?',
    options: ['Cross-Entropy Loss', 'Mean Squared Error (MSE)', 'Binary Log-Loss', 'Kullback-Leibler Divergence'], answer: 1 },
  { q: 'What does the bias term (b) do in ŷ = w · X + b?',
    options: ['Scales every feature', 'Shifts the prediction up or down', 'Measures the error', 'Sets the learning rate'], answer: 1 },
  { q: 'In gradient descent, which direction do the weights move at each step?',
    options: ['Along the gradient', 'Against the gradient', 'Randomly', 'Toward zero always'], answer: 1 },
]

export default function Quizzes() {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const done = i >= QUESTIONS.length
  const q = QUESTIONS[i]

  const restart = () => { setI(0); setPicked(null); setScore(0) }
  const next = () => {
    if (picked === q.answer) setScore((s) => s + 1)
    setPicked(null)
    setI((n) => n + 1)
  }

  return (
    <div className="mx-auto max-w-[960px] rounded-2xl border border-edge bg-panel p-8">
      {done ? (
        <div className="py-10 text-center">
          <p className="text-4xl font-bold text-emerald-400">{score} / {QUESTIONS.length}</p>
          <p className="mt-2 text-slate-400">{score === QUESTIONS.length ? 'Perfect score. Module 3 complete.' : 'Review the lesson notes and try again.'}</p>
          <button onClick={restart} className="mt-6 rounded-lg bg-emerald-500 px-5 py-2 font-bold text-ink">Restart quiz</button>
        </div>
      ) : (
        <>
          <div className="flex justify-between text-sm font-bold">
            <span className="uppercase tracking-wider text-emerald-400">Module 3 Checkpoint</span>
            <span className="text-slate-300">Question {i + 1} of {QUESTIONS.length}</span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-edge">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${((i + 1) / QUESTIONS.length) * 100}%` }} />
          </div>
          <h2 className="mt-8 text-2xl font-bold leading-snug">{q.q}</h2>
          <p className="mt-2 text-sm text-slate-400">Select the best option from the choices below:</p>
          <div className="mt-6 space-y-3" role="radiogroup">
            {q.options.map((o, idx) => (
              <button
                key={o}
                role="radio"
                aria-checked={picked === idx}
                onClick={() => setPicked(idx)}
                className={`flex w-full items-center justify-between rounded-xl border px-5 py-4 text-left text-sm font-semibold transition ${
                  picked === idx ? 'border-emerald-500 bg-emerald-500/10' : 'border-edge bg-ink hover:border-slate-600'
                }`}
              >
                {o}
                <span className={`size-4 rounded-full border-2 ${picked === idx ? 'border-emerald-400 bg-emerald-400' : 'border-slate-600'}`} />
              </button>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-edge pt-5">
            <button onClick={restart} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"><RotateCw className="size-4" /> Restart Quiz</button>
            <button
              disabled={picked === null}
              onClick={next}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-ink disabled:cursor-not-allowed disabled:bg-edge disabled:text-slate-500"
            >
              {i === QUESTIONS.length - 1 ? 'Finish' : 'Next Question'} <ArrowRight className="size-4" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
