import dinosaur from './assets/dinosaur.svg'
import unicorn from './assets/unicorn.svg'
import turtle from './assets/turtle.svg'
import tiger from './assets/tiger.svg'
import orca from './assets/orca.svg'

export type ThemeId = 'dinosaur' | 'unicorn' | 'turtle' | 'tiger' | 'orca'

export interface Theme {
  id: ThemeId
  label: string
  asset: string
}

export const themes: readonly Theme[] = [
  { id: 'dinosaur', label: 'Dinosaur', asset: dinosaur },
  { id: 'unicorn', label: 'Unicorn', asset: unicorn },
  { id: 'turtle', label: 'Turtle', asset: turtle },
  { id: 'tiger', label: 'Tiger', asset: tiger },
  { id: 'orca', label: 'Orca', asset: orca },
]

export function getTheme(id: string): Theme {
  return themes.find((theme) => theme.id === id) ?? themes[0]
}

const STORAGE_KEY = 'typing-theme'

export function loadTheme(): ThemeId {
  try {
    const id = localStorage.getItem(STORAGE_KEY)
    return themes.some((theme) => theme.id === id) ? id as ThemeId : themes[0].id
  } catch {
    return themes[0].id
  }
}

export function saveTheme(id: ThemeId): void {
  if (!themes.some((theme) => theme.id === id)) return
  try { localStorage.setItem(STORAGE_KEY, id) } catch { /* storage unavailable */ }
}
