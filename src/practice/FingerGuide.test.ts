// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref, type App } from 'vue'
import VirtualKeyboard from './VirtualKeyboard.vue'

let app: App | undefined

afterEach(() => {
  app?.unmount()
  app = undefined
  document.body.replaceChildren()
})

async function mountKeyboard() {
  const character = ref('f')
  const complete = ref(false)
  const host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () => h(VirtualKeyboard, { nextCharacter: character.value, complete: complete.value, pressedKey: '' }),
  })
  app.mount(host)
  await nextTick()
  return { character, complete }
}

describe('visible finger guidance', () => {
  it('moves the highlighted finger with the next key and includes the opposite Shift pinky', async () => {
    const state = await mountKeyboard()
    expect(document.querySelector('[data-hand="left"] [data-finger="index"].is-target')).not.toBeNull()
    expect(document.querySelector('.is-shift')).toBeNull()
    state.character.value = 'A'
    await nextTick()
    expect(document.querySelector('[data-hand="left"] [data-finger="index"].is-target')).toBeNull()
    expect(document.querySelector('[data-hand="left"] [data-finger="pinky"].is-target')).not.toBeNull()
    expect(document.querySelector('[data-hand="right"] [data-finger="pinky"].is-shift')).not.toBeNull()
    expect(document.querySelector('.shift-right.highlighted')).not.toBeNull()
    expect(document.querySelector('.shift-left.highlighted')).toBeNull()
  })

  it('offers either thumb for Space and clears both hands when the sentence is complete', async () => {
    const state = await mountKeyboard()
    state.character.value = ' '
    await nextTick()
    expect(document.querySelector('[data-hand="left"] [data-finger="thumb"].is-target')).not.toBeNull()
    expect(document.querySelector('[data-hand="right"] [data-finger="thumb"].is-target')).not.toBeNull()
    expect(document.querySelectorAll('.hand-finger.is-target')).toHaveLength(2)
    expect(document.querySelector('.space-key.highlighted')).not.toBeNull()
    state.complete.value = true
    await nextTick()
    expect(document.querySelectorAll('.hand-finger.is-target, .hand-finger.is-shift')).toHaveLength(0)
    expect(document.querySelectorAll('.keyboard-key.highlighted')).toHaveLength(0)
  })

  it('uses the right pinky and left Shift for a question mark, without stale hints for an unknown key', async () => {
    const state = await mountKeyboard()
    state.character.value = '?'
    await nextTick()
    expect(document.querySelector('[data-hand="right"] [data-finger="pinky"].is-target')).not.toBeNull()
    expect(document.querySelector('[data-hand="left"] [data-finger="pinky"].is-shift')).not.toBeNull()
    expect(document.querySelector('.shift-left.highlighted')).not.toBeNull()
    state.character.value = ''
    await nextTick()
    expect(document.querySelectorAll('.hand-finger.is-target, .hand-finger.is-shift')).toHaveLength(0)
  })
})
