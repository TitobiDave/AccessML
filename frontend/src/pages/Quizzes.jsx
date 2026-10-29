import { useEffect, useState } from 'react'
import { RotateCw, ArrowRight, ArrowLeft, Check, X, ListChecks, Loader2 } from 'lucide-react'
import { USER_ID, fetchProgress } from '../progress.js'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function getJson(path, options) {
  const res = await fetch(`${API_BASE}${path}`, options)
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}

export default function Quizzes({ quizId = null }) {
  const [activeId, setActiveId] = useState(quizId)
  return activeId == null
    ? <QuizList onOpen={setActiveId} />
    : <QuizRunner key={activeId} quizId={activeId} onExit={() => setActiveId(null)} />
}

/* ---------------------------------------------------------------- list */

function QuizList({ onOpen }) {
  const [quizzes, setQuizzes] = useState(null)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      getJson('/api/quizzes', { signal: controller.signal }),
      fetchProgress(USER_ID, controller.signal),
    ])
      .then(([q, p]) => { setQuizzes(q); setProgress(p) })
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message) })
    return () => controller.abort()
  }, [])

  if (error) return <p className="text-red-400">{error}</p>
  if (!quizzes) return <p className="text-slate-400">Loading quizzes...</p>

  const completed = new Set(progress?.completed_lesson_ids ?? [])
  const best = Object.fromEntries((progress?.quizzes ?? []).map((p) => [p.quiz_id, p]))

  return (
    <div className="mx-auto max-w-[960px]">
      <h2 className="text-2xl font-bold">Quizzes</h2>
      <p className="mt-1 text-sm text-slate-400">
        Pick a lesson to take its quiz. Passing it marks the lesson as completed.
      </p>

      {quizzes.length === 0 && <p className="mt-6 text-slate-400">No quizzes yet.</p>}

      <ul className="mt-6 space-y-3">
        {quizzes.map((q) => {
          const isDone = completed.has(q.lesson_id)
          const b = best[q.id]
          return (
            <li key={q.id}>
              <button
                onClick={() => onOpen(q.id)}
                className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-edge bg-panel px-5 py-4 text-left transition hover:border-emerald-500/50"
              >
                <span className="flex items-center gap-4">
                  <span className={`grid size-10 shrink-0 place-items-center rounded-full ${isDone ? 'bg-emerald-500 text-ink' : 'bg-ink text-slate-400 ring-1 ring-edge'}`}>
                    {isDone ? <Check className="size-5" strokeWidth={3} /> : <ListChecks className="size-5" />}
                  </span>
                  <span>
                    <span className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Lesson {q.lesson_number}
                    </span>
                    <span className="block font-semibold text-white">{q.lesson_title}</span>
                    <span className="mt-0.5 block text-sm text-slate-400">
                      {q.title} · {q.question_count} questions · pass at {Math.round(q.pass_ratio * 100)}%
                    </span>
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-3 text-sm">
                  {b && (
                    <span className={b.passed ? 'text-emerald-400' : 'text-amber-400'}>
                      Best {b.best_score}/{b.total}
                    </span>
                  )}
                  <span className="text-slate-400">{isDone ? 'Completed' : 'Not completed'}</span>
                  <ArrowRight className="size-4 text-slate-500 group-hover:text-emerald-400" />
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* -------------------------------------------------------------- runner */

function QuizRunner({ quizId, onExit }) {
  const [quiz, setQuiz] = useState(null)
  const [error, setError] = useState(null)
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState(null)
  const [answers, setAnswers] = useState([])
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    getJson(`/api/quizzes/${quizId}`, { signal: controller.signal })
      .then(setQuiz)
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message) })
    return () => controller.abort()
  }, [quizId])

  const restart = () => { setI(0); setPicked(null); setAnswers([]); setResult(null); setError(null) }

  if (error) {
    return (
      <div className="mx-auto max-w-[960px]">
        <p className="text-red-400">{error}</p>
        <button onClick={onExit} className="mt-4 text-sm text-slate-300 hover:text-white">Back to quizzes</button>
      </div>
    )
  }
  if (!quiz) return <p className="text-slate-400">Loading quiz...</p>

  const questions = quiz.questions
  const q = questions[i]
  const isLast = i === questions.length - 1

  const submit = async (finalAnswers) => {
    setSubmitting(true)
    try {
      const data = await getJson(`/api/quizzes/${quiz.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: USER_ID, answers: finalAnswers }),
      })
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const next = () => {
    const finalAnswers = [...answers, picked]
    setAnswers(finalAnswers)
    setPicked(null)
    if (isLast) submit(finalAnswers)
    else setI((n) => n + 1)
  }

  /* ---- result screen ---- */
  if (result) {
    const byId = Object.fromEntries(result.results.map((r) => [r.question_id, r]))
    return (
      <div className="mx-auto max-w-[960px] rounded-2xl border border-edge bg-panel p-8">
        <div className="py-6 text-center">
          <p className={`text-4xl font-bold ${result.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
            {result.score} / {result.total}
          </p>
          <p className="mt-2 text-slate-300">
            {result.passed
              ? 'Passed. This lesson is now marked as completed.'
              : `Not quite. You need ${Math.round(quiz.pass_ratio * 100)}% to pass. Review the lesson and try again.`}
          </p>
        </div>

        <ol className="mt-4 space-y-4">
          {questions.map((question, idx) => {
            const r = byId[question.id]
            const mine = answers[idx]
            return (
              <li key={question.id} className="rounded-xl border border-edge bg-ink p-4">
                <p className="flex items-start gap-2 font-semibold">
                  {r.correct
                    ? <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" strokeWidth={3} />
                    : <X className="mt-0.5 size-4 shrink-0 text-rose-400" strokeWidth={3} />}
                  <span className="whitespace-pre-wrap">{question.prompt}</span>
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Your answer: <span className={r.correct ? 'text-emerald-300' : 'text-rose-300'}>
                    {mine == null ? 'skipped' : question.options[mine]}
                  </span>
                </p>
                {!r.correct && (
                  <p className="text-sm text-slate-400">
                    Correct answer: <span className="text-emerald-300">{question.options[r.correct_index]}</span>
                  </p>
                )}
              </li>
            )
          })}
        </ol>

        <div className="mt-8 flex items-center justify-between border-t border-edge pt-5">
          <button onClick={onExit} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white">
            <ArrowLeft className="size-4" /> All quizzes
          </button>
          <button onClick={restart} className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-ink">
            <RotateCw className="size-4" /> {result.passed ? 'Retake' : 'Try again'}
          </button>
        </div>
      </div>
    )
  }

  /* ---- question screen ---- */
  return (
    <div className="mx-auto max-w-[960px] rounded-2xl border border-edge bg-panel p-8">
      <div className="flex justify-between text-sm font-bold">
        <span className="uppercase tracking-wider text-emerald-400">{quiz.title}</span>
        <span className="text-slate-300">Question {i + 1} of {questions.length}</span>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-edge">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${((i + 1) / questions.length) * 100}%` }} />
      </div>

      <h2 className="mt-8 whitespace-pre-wrap text-2xl font-bold leading-snug">{q.prompt}</h2>
      <p className="mt-2 text-sm text-slate-400">Select the best option from the choices below:</p>

      <div className="mt-6 space-y-3" role="radiogroup">
        {q.options.map((o, idx) => (
          <button
            key={idx}
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
        <button onClick={onExit} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white">
          <ArrowLeft className="size-4" /> All quizzes
        </button>
        <button
          disabled={picked === null || submitting}
          onClick={next}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-ink disabled:cursor-not-allowed disabled:bg-edge disabled:text-slate-500"
        >
          {submitting
            ? <><Loader2 className="size-4 animate-spin" /> Submitting</>
            : <>{isLast ? 'Finish' : 'Next Question'} <ArrowRight className="size-4" /></>}
        </button>
      </div>
    </div>
  )
}