const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// No auth yet, so everything runs as user 1. Replace when you add login.
export const USER_ID = 1

export async function fetchProgress(userId = USER_ID, signal) {
  const res = await fetch(`${API_BASE}/api/users/${userId}/progress`, { signal })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json() // { percent, streak_days, completed_lesson_ids, quizzes, labs }
}

export async function completeLesson(lessonId, userId = USER_ID) {
  const res = await fetch(`${API_BASE}/api/users/${userId}/lessons/${lessonId}/complete`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json() // updated ProgressOut
}

// done    = the step's lesson id is in completed_lesson_ids
// current = the first step that isn't done
// todo    = everything after that
export function withStatus(tracks, completedIds = []) {
  const doneIds = new Set(completedIds)
  let currentTaken = false

  return tracks.map((t) => ({
    ...t,
    steps: t.steps.map((s) => {
      let status = 'todo'
      if (s.lessonId != null && doneIds.has(s.lessonId)) {
        status = 'done'
      } else if (!currentTaken) {
        status = 'current'
        currentTaken = true
      }
      return { ...s, status }
    }),
  }))
}