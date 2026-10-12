import { beforeEach, describe, expect, it, vi } from 'vitest'
import { lessons } from '../lessons/catalog'
import { themes } from '../themes/catalog'
import { getAnimalStats } from './progression'
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

class BlockedStorage {
  getItem(): string | null {
    throw new Error('blocked')
  }

  setItem(): void {
    throw new Error('blocked')
  }

  removeItem(): void {
    throw new Error('blocked')
  }
}

const lesson = lessons[0]
const legacyLessonIds = [
  'f-j-bumps',
  'home-row-hello',
  'home-row-garden',
  'easy-animal-words',
  'animal-actions',
  'playground-words',
  'silly-sentence',
  'tiny-adventure',
]

beforeEach(() => {
  vi.stubGlobal('localStorage', new MemoryStorage())
  vi.stubGlobal('sessionStorage', new MemoryStorage())
})

describe('progress storage', () => {
  it('migrates all original lessons to the saved animal only', () => {
    localStorage.setItem('typing-theme', 'tiger')
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({
      completed: legacyLessonIds,
      best: { 'f-j-bumps': 80, 'tiny-adventure': 95 },
    }))

    const progress = loadProgress()
    expect(progress.version).toBe(2)
    expect(progress.animals.tiger.completed).toEqual(legacyLessonIds)
    expect(progress.animals.tiger.best).toEqual({ 'f-j-bumps': 80, 'tiny-adventure': 95 })
    expect(progress.animals.dinosaur.completed).toEqual([])
    expect(JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) as string).version).toBe(2)
  })

  it('returns independent empty animals for malformed or unsupported data', () => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, '{not json')
    expect(loadProgress().animals.dinosaur).toEqual({ completed: [], best: {} })

    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ version: 2, completed: [lesson.id] }))
    const progress = loadProgress()
    expect(progress.version).toBe(2)
    expect(Object.values(progress.animals).every(animal => animal.completed.length === 0)).toBe(true)
  })

  it('handles blocked storage without throwing', () => {
    vi.stubGlobal('localStorage', new BlockedStorage())
    const progress = recordCompletion('dinosaur', lesson.id, 80)
    expect(progress.animals.dinosaur.completed).toEqual([lesson.id])
    expect(() => loadProgress()).not.toThrow()
  })

  it('keeps animals independent when recording completions', () => {
    recordCompletion('dinosaur', lesson.id, 80)
    const other = lessons[1]
    recordCompletion('unicorn', other.id, 90)

    const progress = loadProgress()
    expect(progress.animals.dinosaur.completed).toEqual([lesson.id])
    expect(progress.animals.unicorn.completed).toEqual([other.id])
    expect(progress.animals.dinosaur.best).toEqual({ [lesson.id]: 80 })
  })

  it('rejects unknown lessons and invalid accuracy without changing progress', () => {
    const original = recordCompletion('dinosaur', lesson.id, 80)
    expect(recordCompletion('dinosaur', 'unknown-lesson', 100)).toEqual(original)
    expect(recordCompletion('dinosaur', lesson.id, Number.NaN)).toEqual(original)
    expect(recordCompletion('dinosaur', lesson.id, -1)).toEqual(original)
    expect(recordCompletion('dinosaur', lesson.id, 101)).toEqual(original)
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
    expect(recordCompletion('dinosaur', lesson.id, 90).animals.dinosaur.best[lesson.id]).toBe(90)
    expect(recordCompletion('dinosaur', lesson.id, 70).animals.dinosaur.best[lesson.id]).toBe(90)
  })

  it('adds shark progress to an older save without changing existing animal scores', () => {
    recordCompletion('dinosaur', lesson.id, 95)
    const oldSave = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY)!)
    delete oldSave.animals.shark
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(oldSave))
    const restored = loadProgress()
    expect(getAnimalStats(restored, 'dinosaur')).toMatchObject({ score: 195, completedCount: 1 })
    expect(getAnimalStats(restored, 'shark')).toMatchObject({ score: 0, completedCount: 0, stage: 'baby' })
    recordCompletion('shark', lesson.id, 100)
    expect(getAnimalStats(loadProgress(), 'shark').score).toBe(200)
    expect(getAnimalStats(loadProgress(), 'dinosaur').score).toBe(195)
  })

  it('accepts every declared theme id', () => {
    for (const theme of themes) {
      expect(recordCompletion(theme.id, lesson.id, 50).animals[theme.id].completed).toContain(lesson.id)
    }
  })
})

describe('animal progression', () => {
  it('counts duplicate retries once and awards only improved accuracy', () => {
    recordCompletion('dinosaur', lesson.id, 60)
    recordCompletion('dinosaur', lesson.id, 40)
    expect(getAnimalStats(loadProgress(), 'dinosaur')).toMatchObject({ score: 160, completedCount: 1 })

    recordCompletion('dinosaur', lesson.id, 85)
    expect(getAnimalStats(loadProgress(), 'dinosaur')).toMatchObject({ score: 185, completedCount: 1 })
  })

  it('transitions level after four distinct lessons', () => {
    for (const item of lessons.slice(0, 4)) recordCompletion('dinosaur', item.id, 100)
    expect(getAnimalStats(loadProgress(), 'dinosaur')).toMatchObject({
      level: 2,
      completedCount: 4,
      lessonsToNextLevel: 4,
      score: 800,
      stage: 'young',
    })
  })

  it.each([
    [3, 'baby'], [4, 'young'], [7, 'young'], [8, 'growing'],
    [15, 'growing'], [16, 'big'], [27, 'big'], [28, 'shiny'],
  ] as const)('selects the correct form after %i completed exercises', (count, stage) => {
    for (const item of lessons.slice(0, count)) recordCompletion('orca', item.id, 100)
    expect(getAnimalStats(loadProgress(), 'orca').stage).toBe(stage)
  })

  it('clamps at max level and never produces invalid scores', () => {
    for (const item of lessons) recordCompletion('dinosaur', item.id, 100)
    const stats = getAnimalStats(loadProgress(), 'dinosaur')
    expect(stats).toMatchObject({ level: 10, completedCount: 36, lessonsToNextLevel: 0, isMaxLevel: true, stage: 'shiny' })
    expect(Number.isFinite(stats.score)).toBe(true)
    expect(stats.score).toBe(7200)
  })

  it('does not share earned progression between animals', () => {
    for (const item of lessons.slice(0, 4)) recordCompletion('dinosaur', item.id, 100)
    expect(getAnimalStats(loadProgress(), 'dinosaur').level).toBe(2)
    expect(getAnimalStats(loadProgress(), 'unicorn')).toMatchObject({ level: 1, completedCount: 0, score: 0 })
  })

  it('defensively ignores malformed best values', () => {
    const malformed = {
      version: 2,
      animals: Object.fromEntries(themes.map(theme => [
        theme.id,
        { completed: [lesson.id, lesson.id], best: { [lesson.id]: Number.NaN } },
      ])),
    }
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(malformed))
    expect(getAnimalStats(loadProgress(), 'dinosaur')).toMatchObject({ score: 100, completedCount: 1 })
  })
})
