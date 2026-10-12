export interface Score {
  attempts: number
  mistakes: number
  accuracy: number
}

/** Return a whole-number accuracy percentage for a typing attempt. */
export function calculateAccuracy(attempts: number, mistakes: number): number {
  if (!Number.isFinite(attempts) || attempts <= 0) return 100
  const safeAttempts = Math.max(0, Math.floor(attempts))
  const safeMistakes = Math.max(0, Math.min(safeAttempts, Math.floor(mistakes)))
  return Math.max(0, Math.round(((safeAttempts - safeMistakes) / safeAttempts) * 100))
}

export function scoreTyping(attempts: number, mistakes: number): Score {
  return {
    attempts,
    mistakes,
    accuracy: calculateAccuracy(attempts, mistakes),
  }
}
