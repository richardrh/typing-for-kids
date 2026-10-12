import { getLesson } from '../lessons/catalog'
import type { ThemeId } from '../themes/catalog'
import type { Progress } from './storage'

export const LESSONS_PER_LEVEL = 4
const MAX_LEVEL = 10

export interface AnimalStats {
  score: number
  level: number
  completedCount: number
  lessonsToNextLevel: number
  isMaxLevel: boolean
  stage: 'baby' | 'young' | 'growing' | 'big' | 'shiny'
}

export function getAnimalStats(progress: Progress, theme: ThemeId): AnimalStats {
  const animal = progress?.animals?.[theme]
  const completed = animal?.completed
  const uniqueCompleted = new Set<string>()
  if (Array.isArray(completed)) {
    for (const lessonId of completed) {
      if (typeof lessonId === 'string' && getLesson(lessonId)) uniqueCompleted.add(lessonId)
    }
  }

  let score = 0
  for (const lessonId of uniqueCompleted) {
    const accuracy = animal?.best?.[lessonId]
    const validAccuracy = typeof accuracy === 'number' && Number.isFinite(accuracy) && accuracy >= 0 && accuracy <= 100
      ? accuracy
      : 0
    score += 100 + validAccuracy
  }

  const completedCount = uniqueCompleted.size
  const level = Math.min(MAX_LEVEL, 1 + Math.floor(completedCount / LESSONS_PER_LEVEL))
  const isMaxLevel = level === MAX_LEVEL
  const stage = level === 1 ? 'baby' : level === 2 ? 'young' : level <= 4 ? 'growing' : level <= 7 ? 'big' : 'shiny'
  return {
    score,
    level,
    completedCount,
    lessonsToNextLevel: isMaxLevel ? 0 : LESSONS_PER_LEVEL - (completedCount % LESSONS_PER_LEVEL),
    isMaxLevel,
    stage,
  }
}
