// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref, type App } from 'vue'
import { lessons } from '../lessons/catalog'
import { getAnimalStats } from '../progress/progression'
import { loadProgress, recordCompletion, PROGRESS_STORAGE_KEY } from '../progress/storage'
import type { ThemeId } from '../themes/catalog'
import AnimalProgressCard from './AnimalProgressCard.vue'

let app: App | undefined

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
  sessionStorage.clear()
})

afterEach(() => {
  app?.unmount()
  app = undefined
  vi.useRealTimers()
  document.body.replaceChildren()
})

async function mountAnimal() {
  const theme = ref<ThemeId>('tiger')
  const progress = ref(loadProgress())
  const host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () => h(AnimalProgressCard, { theme: theme.value, stats: getAnimalStats(progress.value, theme.value) }),
  })
  app.mount(host)
  await nextTick()
  return { theme, progress }
}

describe('earned animal powers', () => {
  it('unlocks after reaching the required level and plays a temporary effect without awarding points', async () => {
    const state = await mountAnimal()
    expect(document.querySelector<HTMLButtonElement>('.animal-power')!.disabled).toBe(true)
    expect(document.querySelector('.animal-power')!.textContent).toContain('3')
    expect(document.querySelector('.next-evolution strong')!.textContent).toContain('Level 2')
    for (const lesson of lessons.slice(0, 4)) state.progress.value = recordCompletion('tiger', lesson.id, 100)
    await nextTick()
    expect(document.querySelector('.animal-avatar')!.getAttribute('data-stage')).toBe('young')
    expect(document.querySelector<HTMLButtonElement>('.animal-power')!.disabled).toBe(true)
    expect(document.querySelector('.animal-power')!.textContent).toContain('3')
    for (const lesson of lessons.slice(4, 8)) state.progress.value = recordCompletion('tiger', lesson.id, 100)
    await nextTick()
    const button = document.querySelector<HTMLButtonElement>('.animal-power')!
    expect(button.disabled).toBe(false)
    const saved = localStorage.getItem(PROGRESS_STORAGE_KEY)
    button.click()
    await nextTick()
    expect(document.querySelector('[data-effect="roar"]')).not.toBeNull()
    expect(button.disabled).toBe(true)
    expect(localStorage.getItem(PROGRESS_STORAGE_KEY)).toBe(saved)
    vi.advanceTimersByTime(1200)
    await nextTick()
    expect(document.querySelector('.power-effect')).toBeNull()
    expect(button.disabled).toBe(false)
    expect(getAnimalStats(state.progress.value, 'tiger').score).toBe(1600)
  })

  it('cancels an active power when switching to a different animal', async () => {
    const state = await mountAnimal()
    for (const lesson of lessons.slice(0, 16)) state.progress.value = recordCompletion('tiger', lesson.id, 100)
    await nextTick()
    document.querySelector<HTMLButtonElement>('.animal-power')!.click()
    await nextTick()
    expect(document.querySelector('[data-effect="roar"]')).not.toBeNull()
    state.theme.value = 'orca'
    await nextTick()
    expect(document.querySelector('.power-effect')).toBeNull()
    expect(document.querySelector<HTMLButtonElement>('.animal-power')!.disabled).toBe(true)
    expect(getAnimalStats(state.progress.value, 'orca').score).toBe(0)
  })

  it('plays the shark dash without sharing another animal’s earned progress', async () => {
    const state = await mountAnimal()
    state.theme.value = 'shark'
    for (const lesson of lessons.slice(0, 8)) state.progress.value = recordCompletion('shark', lesson.id, 100)
    await nextTick()
    document.querySelector<HTMLButtonElement>('.animal-power')!.click()
    await nextTick()
    expect(document.querySelector('[data-effect="dash"]')).not.toBeNull()
    expect(getAnimalStats(state.progress.value, 'shark').score).toBe(1600)
    expect(getAnimalStats(state.progress.value, 'tiger').score).toBe(0)
  })
})
