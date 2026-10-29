import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Clock, ArrowRight, ArrowLeft, ChevronRight, ChevronLeft,
  ListChecks, Sigma, Lightbulb, Check, List, Lock,
} from 'lucide-react'
import SectionLab from '../components/SectionLab.jsx'
import { USER_ID, completeLesson, fetchProgress } from '../progress.js'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function fetchLesson(lessonId, signal) {
  const res = await fetch(`${API_BASE}/api/lessons/${lessonId}`, { signal })
  if (!res.ok) {
    throw new Error(res.status === 404 ? 'Lesson not found.' : `Request failed (${res.status})`)
  }
  return res.json()
}

function formatMinutes(totalSeconds) {
  return `${Math.max(1, Math.round(totalSeconds / 60))} min`
}

// Styles for rendered markdown (Tailwind preflight strips defaults)
const PROSE = [
  'text-[16px] leading-8 text-slate-300',
  '[&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white',
  '[&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:font-semibold [&_h4]:text-white',
  '[&_p]:my-4',
  '[&_a]:text-emerald-400 [&_a]:underline',
  '[&_strong]:text-white',
  '[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1',
  '[&_blockquote]:my-5 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-400/60 [&_blockquote]:bg-amber-400/5 [&_blockquote]:py-2 [&_blockquote]:pl-4 [&_blockquote]:italic',
  '[&_code]:rounded [&_code]:bg-ink [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[14px] [&_code]:text-emerald-400',
  '[&_pre]:my-5 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-edge [&_pre]:bg-ink [&_pre]:p-4',
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-slate-200',
  '[&_table]:my-5 [&_table]:w-full [&_table]:text-left [&_table]:text-sm [&_th]:border-b [&_th]:border-edge [&_th]:px-3 [&_th]:py-2 [&_th]:text-slate-400 [&_td]:border-b [&_td]:border-edge/60 [&_td]:px-3 [&_td]:py-2',
].join(' ')

export default function Lessons({ goQuiz, onPrev, onNext, onFinish, lessonId = 1 }) {
  const [lesson, setLesson] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [visited, setVisited] = useState(() => new Set([0]))
  const [passed, setPassed] = useState(() => new Set()) // ids of labs this user has passed
  const [progressReady, setProgressReady] = useState(false)
  const [finishing, setFinishing] = useState(false)

  // Load the lesson
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setPage(0)
    setVisited(new Set([0]))

    fetchLesson(lessonId, controller.signal)
      .then((data) => {
        setLesson(data)
        // Open the section named in the URL hash, if any (e.g. #loops)
        const i = data.content.sections.findIndex((s) => s.slug === location.hash.slice(1))
        if (i > 0) {
          setPage(i)
          setVisited(new Set([0, i]))
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [lessonId])

  // Load which labs this user has already passed
  useEffect(() => {
    const controller = new AbortController()
    setProgressReady(false)
    fetchProgress(USER_ID, controller.signal)
      .then((p) => {
        setPassed(new Set((p.labs ?? []).filter((l) => l.completed).map((l) => l.lab_id)))
        setProgressReady(true)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setProgressReady(true) // fail open: start with nothing passed
      })
    return () => controller.abort()
  }, [lessonId])

  const sections = lesson?.content?.sections ?? []
  const labs = lesson?.labs ?? []
  const total = sections.length

  // A section is unlocked-past when it has no lab, or its lab is passed
  const labFor = (s) => labs.find((l) => l.section_slug === s?.slug)
  const sectionPassed = (s) => {
    const l = labFor(s)
    return !l || passed.has(l.id)
  }
  const firstLocked = sections.findIndex((s) => !sectionPassed(s))
  const maxReachable = firstLocked === -1 ? Math.max(total - 1, 0) : firstLocked

  // If the page is ahead of the user's progress (e.g. a #hash link), pull them back
  useEffect(() => {
    if (progressReady && total && page > maxReachable) setPage(maxReachable)
  }, [progressReady, maxReachable, total]) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to top and sync the hash whenever the page changes
  useEffect(() => {
    if (!total) return
    window.scrollTo({ top: 0, behavior: 'smooth' })
    history.replaceState(null, '', `#${sections[page]?.slug ?? ''}`)
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <p className="text-slate-400">Loading lesson...</p>
  if (error) return <p className="text-red-400">{error}</p>

  const { content, quizzes = [] } = lesson
  const section = sections[page]
  const lab = labFor(section)
  const locked = !sectionPassed(section)
  const isFirst = page === 0
  const isLast = page >= total - 1
  const progress = total ? Math.round(((page + 1) / total) * 100) : 100
  const nextLabel = isLast ? (onNext ? 'Complete & next lesson' : 'Complete lesson') : 'Next'

  const goTo = (i) => {
    const next = Math.min(Math.max(i, 0), Math.min(total - 1, maxReachable))
    setPage(next)
    setVisited((prev) => new Set(prev).add(next))
  }

  const handleBack = () => (isFirst ? onPrev?.() : goTo(page - 1))

  const handleNext = async () => {
    if (!isLast) return goTo(page + 1)
    setFinishing(true)
    try {
      await completeLesson(lesson.id) // idempotent
    } catch (err) {
      console.error('Could not save progress', err)
    }
    setFinishing(false)
    ;(onNext ?? onFinish)?.()
  }

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col">
      {/* Breadcrumb header */}
      <header className="border-b border-edge pb-5">
        <nav className="flex items-center gap-1.5 text-sm text-slate-400">
          <span>Module {lesson.module_id}</span>
          <ChevronRight className="size-4" />
          <span>Lesson {lesson.number}</span>
          {section && (
            <>
              <ChevronRight className="size-4" />
              <span className="text-emerald-400">{section.title}</span>
            </>
          )}
        </nav>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
          <span className="flex items-center gap-1.5 rounded-lg border border-edge bg-panel px-3 py-1.5 text-sm text-slate-300">
            <Clock className="size-4 text-emerald-400" /> {formatMinutes(lesson.duration_seconds)} read
          </span>
        </div>
        <p className="mt-2 text-slate-400">{lesson.topic}</p>

        {total > 0 && (
          <div className="mt-4">
            <div className="h-1.5 overflow-hidden rounded-full bg-edge">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              Section {page + 1} of {total}
            </p>
          </div>
        )}
      </header>

      <div className="grid flex-1 gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Reading column: one section (and its lab) per page */}
        <article className="min-w-0">
          {isFirst && content.intro && (
            <div className={`${PROSE} mb-8 rounded-xl border border-edge bg-panel px-5 py-1`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content.intro}</ReactMarkdown>
            </div>
          )}

          {section && (
            <section key={section.slug} id={section.slug}>
              <h2 className="flex items-center gap-3 text-3xl font-bold text-white">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-base font-bold text-emerald-400 ring-1 ring-emerald-500/30">
                  {page + 1}
                </span>
                {section.title}
              </h2>

              <div className={`${PROSE} mt-4`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.body}</ReactMarkdown>
              </div>

              {section.formula && (
                <figure className="my-6 overflow-hidden rounded-xl border border-edge bg-ink">
                  <figcaption className="flex items-center gap-2 border-b border-edge bg-panel px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <Sigma className="size-4 text-emerald-400" /> Formula
                  </figcaption>
                  <pre className="overflow-x-auto px-4 py-4 font-mono text-base text-emerald-400">
                    {section.formula}
                  </pre>
                </figure>
              )}

              {section.key_components?.length > 0 && (
                <div className="my-8">
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
                    <Lightbulb className="size-5 text-amber-400" /> Key components
                  </h3>
                  <ul className="space-y-3">
                    {section.key_components.map(({ term, description }) => (
                      <li
                        key={term}
                        className="rounded-xl border border-edge border-l-4 border-l-emerald-500 bg-panel px-4 py-3"
                      >
                        <p className="font-semibold text-white">{term}</p>
                        <p className="mt-1 text-[15px] leading-7 text-slate-300">{description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {lab && (
                <SectionLab
                  key={lab.id}
                  lab={lab}
                  passed={passed.has(lab.id)}
                  onPassed={() => setPassed((prev) => new Set(prev).add(lab.id))}
                />
              )}
            </section>
          )}

          {isLast && content.closing && (
            <p className="mt-8 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-[15px] leading-7 text-slate-200">
              {content.closing}
            </p>
          )}
        </article>

        {/* Right rail */}
        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          {total > 0 && (
            <section className="rounded-2xl border border-edge bg-panel p-5">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <List className="size-4 text-emerald-400" /> Sections
              </h3>
              <ol className="mt-3 space-y-1">
                {sections.map((s, i) => {
                  const active = i === page
                  const lockedItem = i > maxReachable
                  const sLab = labFor(s)
                  const done = !active && !lockedItem && (sLab ? passed.has(sLab.id) : visited.has(i))
                  return (
                    <li key={s.slug}>
                      <button
                        onClick={() => goTo(i)}
                        disabled={lockedItem}
                        aria-current={active ? 'step' : undefined}
                        className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          active
                            ? 'bg-emerald-500/10 font-semibold text-emerald-300'
                            : 'text-slate-400 hover:bg-ink/60 hover:text-white'
                        }`}
                      >
                        <span
                          className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                            active
                              ? 'bg-emerald-500 text-ink'
                              : done
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-ink text-slate-500 ring-1 ring-edge'
                          }`}
                        >
                          {lockedItem ? <Lock className="size-3.5" /> : done ? <Check className="size-3.5" /> : i + 1}
                        </span>
                        {s.title}
                      </button>
                    </li>
                  )
                })}
              </ol>
            </section>
          )}

          {content.badges?.length > 0 && (
            <section className="rounded-2xl border border-edge bg-panel p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">In this lesson</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {content.badges.map((label) => (
                  <span
                    key={label}
                    className="rounded-md border border-edge bg-ink/60 px-2.5 py-1 text-xs font-semibold text-emerald-300"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </section>
          )}

          {quizzes.length > 0 && (
            <section className="rounded-2xl border border-edge bg-panel p-5">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <ListChecks className="size-4 text-amber-400" /> Quizzes
              </h3>
              <ul className="mt-3 space-y-2">
                {quizzes.map((quiz) => (
                  <li key={quiz.id}>
                    <button
                      onClick={() => goQuiz?.(quiz.id)}
                      className="group flex w-full items-center justify-between gap-3 rounded-lg border border-edge bg-ink/60 px-3 py-2.5 text-left hover:border-amber-400/50"
                    >
                      <span>
                        <span className="block text-sm font-semibold text-white">{quiz.title}</span>
                        <span className="text-xs text-slate-400">{quiz.question_count} questions</span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-slate-500 group-hover:text-amber-400" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>

      {/* Sticky pagination bar */}
      <footer className="sticky bottom-0 -mx-1 flex items-center justify-between gap-3 border-t border-edge bg-ink/90 px-1 py-4 backdrop-blur">
        <button
          onClick={handleBack}
          disabled={isFirst && !onPrev}
          className="flex items-center gap-2 rounded-lg border border-edge px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white disabled:opacity-40"
        >
          <ArrowLeft className="size-4" />
          {isFirst ? 'Previous lesson' : 'Back'}
        </button>

        {total > 1 && (
          <nav aria-label="Section pages" className="hidden items-center gap-1 sm:flex">
            <button
              onClick={() => goTo(page - 1)}
              disabled={isFirst}
              aria-label="Previous section"
              className="grid size-8 place-items-center rounded-md text-slate-400 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </button>
            {sections.map((s, i) => (
              <button
                key={s.slug}
                onClick={() => goTo(i)}
                disabled={i > maxReachable}
                aria-label={`Go to section ${i + 1}: ${s.title}`}
                aria-current={i === page ? 'page' : undefined}
                className={`grid size-8 place-items-center rounded-md text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-30 ${
                  i === page
                    ? 'bg-emerald-500 text-ink'
                    : 'text-slate-400 hover:bg-panel hover:text-white'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => goTo(page + 1)}
              disabled={isLast || page >= maxReachable}
              aria-label="Next section"
              className="grid size-8 place-items-center rounded-md text-slate-400 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="size-4" />
            </button>
          </nav>
        )}

        <div className="flex items-center gap-3">
          {locked && <span className="text-xs text-amber-400">Pass the lab to continue</span>}
          {isLast && quizzes[0] && (
            <button
              onClick={() => goQuiz?.(quizzes[0].id)}
              disabled={locked}
              className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-40"
            >
              Take quiz
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={locked || finishing}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2 text-sm font-bold text-ink hover:bg-emerald-400 disabled:opacity-40"
          >
            {nextLabel} <ArrowRight className="size-4" />
          </button>
        </div>
      </footer>
    </div>
  )
}