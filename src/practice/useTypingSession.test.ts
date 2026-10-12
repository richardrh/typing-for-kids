// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, type App } from 'vue'
import { insertedCharacters, useTypingSession, type TypingSessionController } from './useTypingSession'
import type { Lesson } from '../lessons/types'

const lesson: Lesson = {
  id: 'test',
  title: 'Test',
  text: 'ab',
  fingerHint: '',
  categoryId: 'home-row',
  allowedCharacters: 'ab ',
}
const apps: App[] = []

function mountSession(target: Lesson) {
  let session!: TypingSessionController
  const app = createApp({
    setup() {
      session = useTypingSession(target)
      return () => null
    },
  })
  const host = document.createElement('div')
  document.body.append(host)
  app.mount(host)
  apps.push(app)
  return session
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'performance'] })
  localStorage.clear()
  sessionStorage.clear()
})

afterEach(() => {
  apps.splice(0).forEach(app => app.unmount())
  document.body.replaceChildren()
  vi.useRealTimers()
})

function input(value: string, selectionStart = value.length): Event {
  return { target: { value, selectionStart } } as unknown as Event
}
describe('insertedCharacters', () => {
  it('finds insertions and replacement boundaries', () => {
    expect(insertedCharacters('ac', 'abc')).toEqual({ start: 1, value: 'b' })
    expect(insertedCharacters('abc', 'aXc')).toEqual({ start: 1, value: 'X' })
    expect(insertedCharacters('abc', 'a')).toEqual({ start: 1, value: '' })
  })
})

describe('useTypingSession', () => {
  it('retains a mistake after the character is corrected', async () => {
    const session = mountSession(lesson)
    await nextTick()
    session.start()
    session.handleInput(input('x'))
    session.handleInput(input(''))
    session.handleInput(input('a'))

    expect(session.typed.value).toBe('a')
    expect(session.attempts.value).toBe(2)
    expect(session.mistakes.value).toBe(1)
    expect(session.accuracy.value).toBe(50)
  })

  it('scores replacement at the changed index, not at the end', async () => {
    const session = mountSession({ ...lesson, text: 'abc' })
    await nextTick()
    session.start()
    session.handleInput(input('ab'))
    session.handleInput(input('aX'))

    expect(session.attempts.value).toBe(3)
    expect(session.mistakes.value).toBe(1)
    expect(session.cursorPosition.value).toBe(2)
  })

  it('does not start timing on focus and resets all progress', async () => {
    const session = mountSession({ ...lesson, text: 'abc' })
    await nextTick()
    session.start()
    expect(session.started.value).toBe(false)
    session.handleInput(input('a'))
    expect(session.started.value).toBe(true)
    session.restart()
    expect(session.typed.value).toBe('')
    expect(session.attempts.value).toBe(0)
    expect(session.mistakes.value).toBe(0)
    expect(session.elapsedMs.value).toBe(0)
    expect(session.started.value).toBe(false)
  })

  it('calculates speed from correct current characters after one measurable second', async () => {
    const session = mountSession({ ...lesson, text: 'abcde' })
    await nextTick()
    session.start()
    session.handleInput(input('xbcde'))
    expect(session.wpm.value).toBe(0)
    vi.advanceTimersByTime(6000)
    expect(session.wpm.value).toBe(8)
    session.blur()
    vi.advanceTimersByTime(6000)
    expect(session.elapsedMs.value).toBe(6000)
    expect(session.wpm.value).toBe(8)
  })
})
