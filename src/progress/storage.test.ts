import { beforeEach, describe, expect, it, vi } from 'vitest'
import { lessons } from '../lessons/catalog'
import {
  PROGRESS_STORAGE_KEY,
  SESSION_STORAGE_KEY,
  getLastLessonId,
  loadProgress,
  loadSession,
  recordCompletion,
} from './storage'

class MemoryStorage {
  private values = new Map<string, string>()

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }

  removeItem(key: string): void {
    this.values.delete(key)
  }
}

const lesson = lessons[0]

beforeEach(() => {
  vi.stubGlobal('localStorage', new MemoryStorage())
  vi.stubGlobal('sessionStorage', new MemoryStorage())
})

describe('progress storage', () => {
  it('migrates the original version-less progress shape and filters unknown IDs', () => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ completed: [lesson.id, 'gone'], best: { [lesson.id]: 80, gone: 99 } }))

    expect(loadProgress()).toEqual({ version: 1, completed: [lesson.id], best: { [lesson.id]: 80 } })
  })

  it('returns empty progress for malformed or unsupported data', () => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, '{not json')
    expect(loadProgress()).toEqual({ version: 1, completed: [], best: {} })
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ version: 2, completed: [lesson.id] }))
    expect(loadProgress()).toEqual({ version: 1, completed: [], best: {} })
  })

  it('compares provided target text and preserves resumable elapsed time', () => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
      version: 1,
      lessonId: lesson.id,
      text: 'themed words',
      typed: 'x',
      attempts: 1,
      mistakes: 1,
      elapsedMs: 1250,
    }))
    expect(getLastLessonId()).toBe(lesson.id)
    expect(loadSession({ ...lesson, text: 'themed words' })?.elapsedMs).toBe(1250)
    expect(loadSession(lesson)).toBeNull()
  })

  it('rejects impossible session counters', () => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
      version: 1,
      lessonId: lesson.id,
      text: lesson.text,
      typed: 'x',
      attempts: 0,
      mistakes: 0,
    }))
    expect(loadSession(lesson)).toBeNull()
  })

  it('migrates a current session without elapsed time', () => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
      version: 1,
      lessonId: lesson.id,
      text: lesson.text,
      typed: 'x',
      attempts: 1,
      mistakes: 1,
    }))
    expect(loadSession(lesson)?.elapsedMs).toBe(0)
    expect(getLastLessonId()).toBe(lesson.id)
  })

  it('keeps the best score when recording a lower completion', () => {
    expect(recordCompletion(lesson.id, 90).best[lesson.id]).toBe(90)
    expect(recordCompletion(lesson.id, 70).best[lesson.id]).toBe(90)
  })
})
