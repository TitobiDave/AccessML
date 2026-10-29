import { useEffect, useState } from 'react'
import { BookOpen, Code2, SquareCheckBig, Award, Flame, Wand2, Brain, Route } from 'lucide-react'
import AIMentor from './components/AIMentor' // adjust path if needed
import Lessons from './pages/Lessons.jsx'
import Playground from './pages/Playground.jsx'
import Quizzes from './pages/Quizzes.jsx'
import Certificate from './pages/Certificate.jsx'
import Roadmap from './pages/Roadmap.jsx'
import { TRACKS } from './tracks.js'
import { fetchProgress } from './progress.js'

const TABS = [
  { id: 'roadmap', label: 'Roadmap', icon: Route, color: 'text-sky-400' },
  { id: 'lessons', label: 'Lessons', icon: BookOpen, color: 'text-emerald-400' },
  { id: 'playground', label: 'Playground', icon: Code2, color: 'text-slate-300' },
  { id: 'quizzes', label: 'Quizzes', icon: SquareCheckBig, color: 'text-amber-400' },
  { id: 'certificate', label: 'Certificate', icon: Award, color: 'text-purple-400' },
]

const ALL_STEPS = TRACKS.flatMap((t) => t.steps)

// Lesson ids in roadmap order, used for Back / Next between lessons
const LESSON_IDS = ALL_STEPS.map((s) => s.lessonId).filter((id) => id != null)

export default function App() {
  const [tab, setTab] = useState('roadmap')
  const [lessonId, setLessonId] = useState(null)
  const [quizId, setQuizId] = useState(null)
  const [labId, setLabId] = useState(null)
  const [progress, setProgress] = useState(null)

  // Load progress on start and again whenever the user returns to the roadmap
  useEffect(() => {
    if (tab !== 'roadmap') return
    const controller = new AbortController()
    fetchProgress(undefined, controller.signal)
      .then(setProgress)
      .catch((err) => {
        if (err.name !== 'AbortError') console.error('Could not load progress', err)
      })
    return () => controller.abort()
  }, [tab])

  const completedIds = progress?.completed_lesson_ids ?? []
  const percent = progress?.percent ?? 0
  const streak = progress?.streak_days ?? 0

  // go(tab, { lessonId, quizId, labId }): switch tab and remember which item was picked
  const go = (target, ids = {}) => {
    if (ids.lessonId != null) setLessonId(ids.lessonId)
    if (ids.quizId != null) setQuizId(ids.quizId)
    if (ids.labId != null) setLabId(ids.labId)
    setTab(target)
  }

  // If the Lessons tab is opened directly, fall back to the first lesson
  const currentLessonId = lessonId ?? LESSON_IDS[0] ?? 1
  const idx = LESSON_IDS.indexOf(currentLessonId)
  const prevId = idx > 0 ? LESSON_IDS[idx - 1] : null
  const nextId = idx >= 0 && idx < LESSON_IDS.length - 1 ? LESSON_IDS[idx + 1] : null

  return (
    <div className="min-h-screen">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-edge bg-nav px-6 py-3 lg:px-32">
        <div className="flex items-center gap-4">
          <div className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 via-sky-500 to-indigo-600">
            <Brain className="size-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">AccessML</h1>
              <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 ring-1 ring-emerald-500/30">
                QWEN 2.5
              </span>
            </div>
            <p className="text-xs text-slate-400">Free ML Powered by Open Weights</p>
          </div>
          <div className="ml-2 hidden items-center gap-3 rounded-xl border border-edge px-4 py-2 md:flex">
            <Flame className="size-4 text-orange-400" />
            <span className="text-sm font-semibold text-amber-300">{streak} Day Streak</span>
            <span className="h-5 w-px bg-edge" />
            <span className="grid size-8 place-items-center rounded-full bg-purple-500 text-xs font-bold">
              AR
            </span>
          </div>
        </div>

        <nav className="flex gap-1 rounded-xl border border-edge bg-ink/60 p-1">
          {TABS.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                tab === id ? 'bg-edge text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className={`size-4 ${color}`} /> {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <div className="w-40">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Progress</span>
              <span className="font-semibold text-emerald-400">{percent}%</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-edge">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-200 hover:bg-indigo-500/20">
            <Wand2 className="size-4" /> AI Tutor
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-6 py-8 lg:px-12">
        {tab === 'roadmap' && <Roadmap go={go} completedIds={completedIds} />}

        {tab === 'lessons' && (
          <Lessons
            key={currentLessonId}
            lessonId={currentLessonId}
            goQuiz={(id) => go('quizzes', { quizId: id })}
            goLab={(id) => go('playground', { labId: id })}
            onPrev={prevId != null ? () => go('lessons', { lessonId: prevId }) : undefined}
            onNext={nextId != null ? () => go('lessons', { lessonId: nextId }) : undefined}
          />
        )}

        {tab === 'playground' && <Playground labId={labId} />}
        {tab === 'quizzes' && <Quizzes quizId={quizId} />}
        {tab === 'certificate' && <Certificate />}
      </main>
    </div>
  )
}