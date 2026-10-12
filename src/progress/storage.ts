import { getLesson } from '../lessons/catalog'
import type { Lesson } from '../lessons/types'

export interface Progress {
  version: 1
  completed: string[]
  best: Record<string, number>
}

export interface TypingSession {
  version: 1
  lessonId: string
  text: string
  typed: string
  attempts: number
  mistakes: number
  /** Legacy version-1 sessions may omit elapsed time and migrate to zero. */
  elapsedMs?: number
}

export const PROGRESS_STORAGE_KEY = 'little-keys-progress'
export const SESSION_STORAGE_KEY = 'little-keys-session'
export const SOUND_PREFERENCE_KEY = 'little-keys-sound'

const emptyProgress = (): Progress => ({ version: 1, completed: [], best: {} })


function storage(kind: 'localStorage' | 'sessionStorage'): Storage | undefined {
  try {
    return globalThis[kind]
  } catch {
    return undefined
  }
}

function readJson(kind: 'localStorage' | 'sessionStorage', key: string): unknown {
  try {
    const value = storage(kind)?.getItem(key)
    return value ? JSON.parse(value) : undefined
  } catch {
    return undefined
  }
}

function writeJson(kind: 'localStorage' | 'sessionStorage', key: string, value: unknown): void {
  try {
    storage(kind)?.setItem(key, JSON.stringify(value))
  } catch {
    // Browser storage can be blocked or full. Practice still works without it.
  }
}

function clearStored(kind: 'localStorage' | 'sessionStorage', key: string): void {
  try {
    storage(kind)?.removeItem(key)
  } catch {
    // Ignore unavailable storage.
  }
}

function sanitiseProgress(value: unknown): Progress {
  if (!value || typeof value !== 'object') return emptyProgress()
  const candidate = value as Record<string, unknown>
  // Version-less records are the format used by the original application and
  // are intentionally accepted as a one-time migration.
  if (candidate.version !== undefined && candidate.version !== 1) return emptyProgress()

  const completed = Array.isArray(candidate.completed)
    ? [...new Set(candidate.completed.filter((id): id is string => typeof id === 'string' && !!getLesson(id)))]
    : []
  const bestValue = candidate.best
  const best: Record<string, number> = {}
  if (bestValue && typeof bestValue === 'object') {
    for (const [id, score] of Object.entries(bestValue)) {
      if (getLesson(id) && typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 100) {
        best[id] = score
      }
    }
  }
  return { version: 1, completed, best }
}

export function loadProgress(): Progress {
  return sanitiseProgress(readJson('localStorage', PROGRESS_STORAGE_KEY))
}

export function recordCompletion(lessonId: string, accuracy: number): Progress {
  const progress = loadProgress()
  if (!getLesson(lessonId) || !Number.isFinite(accuracy)) return progress
  const score = Math.max(0, Math.min(100, Math.round(accuracy)))
  const best = progress.best[lessonId]
  const next: Progress = {
    version: 1,
    completed: progress.completed.includes(lessonId) ? progress.completed : [...progress.completed, lessonId],
    best: { ...progress.best, [lessonId]: typeof best === 'number' ? Math.max(best, score) : score },
  }
  writeJson('localStorage', PROGRESS_STORAGE_KEY, next)
  return next
}

function validSession(value: unknown): TypingSession | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Record<string, unknown>
  if (candidate.version !== 1 || typeof candidate.lessonId !== 'string' || typeof candidate.text !== 'string' || typeof candidate.typed !== 'string') return null
  const attempts = candidate.attempts
  const mistakes = candidate.mistakes
  if (
    typeof attempts !== 'number' ||
    typeof mistakes !== 'number' ||
    !Number.isInteger(attempts) ||
    !Number.isInteger(mistakes) ||
    attempts < 0 ||
    mistakes < 0 ||
    mistakes > attempts ||
    attempts < candidate.typed.length
  ) return null
  const elapsedMs = candidate.elapsedMs === undefined ? 0 : candidate.elapsedMs
  if (typeof elapsedMs !== 'number' || !Number.isFinite(elapsedMs) || elapsedMs < 0) return null
  const lesson = getLesson(candidate.lessonId)
  // Target text is theme-dependent. loadSession compares it with the currently
  // displayed lesson, while this structural check only validates the ID.
  if (!lesson || candidate.typed.length > candidate.text.length) return null
  return {
    version: 1,
    lessonId: candidate.lessonId,
    text: candidate.text,
    typed: candidate.typed,
    attempts,
    mistakes,
    elapsedMs,
  }
}

export function loadSession(lesson: Lesson): TypingSession | null {
  const raw = readJson('sessionStorage', SESSION_STORAGE_KEY)
  const session = validSession(raw)
  if (
    raw &&
    typeof raw === 'object' &&
    (raw as Record<string, unknown>).lessonId === lesson.id &&
    (raw as Record<string, unknown>).text !== lesson.text
  ) {
    clearStored('sessionStorage', SESSION_STORAGE_KEY)
  }
  return session && session.lessonId === lesson.id && session.text === lesson.text ? session : null
}

export function saveSession(session: TypingSession): void {
  if (!validSession(session)) return
  writeJson('sessionStorage', SESSION_STORAGE_KEY, session)
}

export function clearSession(): void {
  clearStored('sessionStorage', SESSION_STORAGE_KEY)
}

export function getLastLessonId(): string | null {
  const value = validSession(readJson('sessionStorage', SESSION_STORAGE_KEY))
  return value?.lessonId ?? null
}

export function loadSoundPreference(): boolean {
  const value = readJson('localStorage', SOUND_PREFERENCE_KEY)
  return typeof value === 'boolean' ? value : true
}

export function saveSoundPreference(enabled: boolean): void {
  writeJson('localStorage', SOUND_PREFERENCE_KEY, enabled)
}
