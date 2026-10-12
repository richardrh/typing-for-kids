// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref, type App } from 'vue'
import { lessons } from '../lessons/catalog'
import { loadProgress, SESSION_STORAGE_KEY } from '../progress/storage'
import TypingPractice from './TypingPractice.vue'

let app: App | undefined

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

afterEach(() => {
  app?.unmount()
  app = undefined
  document.body.replaceChildren()
})

async function mountPractice(count = 2) {
  app = createApp({
    setup() {
      const index = ref(0)
      return () => h(TypingPractice, {
        key: lessons[index.value].id,
        lesson: lessons[index.value],
        theme: 'unicorn',
        hasNext: index.value + 1 < count,
        onNext: () => { index.value += 1 },
      })
    },
  })
  const host = document.createElement('div')
  document.body.append(host)
  app.mount(host)
  await nextTick()
}

function typingInput() {
  return document.querySelector<HTMLInputElement>('#typing-input')!
}

async function finishSentence() {
  const input = typingInput()
  input.value = document.querySelector('.text-tray')!.textContent!
  input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: input.value }))
  await nextTick()
}

describe('Enter between sentences', () => {
  it('retains focus after completion and opens a fresh focused exercise with Enter', async () => {
    await mountPractice()
    const firstInput = typingInput()
    firstInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await nextTick()
    expect(typingInput()).toBe(firstInput)
    expect(document.querySelector('.text-tray')!.textContent).toBe(lessons[0].text)

    await finishSentence()
    expect(document.activeElement).toBe(firstInput)
    expect(firstInput.readOnly).toBe(true)
    expect(firstInput.disabled).toBe(false)
    firstInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    await nextTick()
    await nextTick()

    expect(document.querySelector('.text-tray')!.textContent).toBe(lessons[1].text)
    expect(typingInput().value).toBe('')
    expect(typingInput().readOnly).toBe(false)
    expect(document.activeElement).toBe(typingInput())
  })

  it('does not advance for held Enter, composition, modified shortcuts, or unrelated controls', async () => {
    await mountPractice()
    await finishSentence()
    const input = typingInput()
    for (const flags of [{ repeat: true }, { isComposing: true }, { ctrlKey: true }, { metaKey: true }, { altKey: true }]) {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, ...flags }))
      await nextTick()
      expect(typingInput()).toBe(input)
    }
    document.querySelector('.sound-toggle')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await nextTick()
    expect(typingInput()).toBe(input)
  })

  it('leaves the final completed sentence in place when no next exercise exists', async () => {
    await mountPractice(1)
    await finishSentence()
    const input = typingInput()
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await nextTick()
    expect(typingInput()).toBe(input)
    expect(input.value).toBe(lessons[0].text)
    expect(document.querySelector('.completion')).not.toBeNull()
  })

  it.each(['input', 'background'] as const)('retries a failed sentence with Enter from the %s without awarding progress', async location => {
    await mountPractice()
    const input = typingInput()
    input.value = `x${lessons[0].text.slice(1)}`
    input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: input.value }))
    await nextTick()
    expect(input.readOnly).toBe(false)
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).not.toBeNull()
    if (location === 'background') input.blur()
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    ;(location === 'input' ? input : document.body).dispatchEvent(event)
    await nextTick()
    await nextTick()

    expect(event.defaultPrevented).toBe(true)
    expect(typingInput()).toBe(input)
    expect(input.value).toBe('')
    expect(document.querySelector('.text-tray')!.textContent).toBe(lessons[0].text)
    expect(document.activeElement).toBe(input)
    expect(input.selectionStart).toBe(0)
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
    expect(loadProgress().animals.unicorn.completed).toEqual([])

    await finishSentence()
    expect(loadProgress().animals.unicorn.best[lessons[0].id]).toBe(100)
  })

  it('keeps an unfinished correct prefix, but allows retrying an uncorrected early mistake', async () => {
    await mountPractice()
    const input = typingInput()
    const prefix = lessons[0].text.slice(0, 3)
    input.value = prefix
    input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: prefix }))
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await nextTick()
    expect(input.value).toBe(prefix)

    input.value = 'x'
    input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: 'x' }))
    for (const flags of [{ repeat: true }, { isComposing: true }, { ctrlKey: true }, { metaKey: true }, { altKey: true }]) {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, ...flags }))
      await nextTick()
      expect(input.value).toBe('x')
    }
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await nextTick()
    expect(input.value).toBe('')
    expect(document.querySelector('.text-tray')!.textContent).toBe(lessons[0].text)
  })

  it('advances a corrected successful sentence even when its accuracy is below 100 percent', async () => {
    await mountPractice()
    const input = typingInput()
    input.value = 'x'
    input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: 'x' }))
    await finishSentence()
    expect(loadProgress().animals.unicorn.best[lessons[0].id]).toBeLessThan(100)
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await nextTick()
    expect(document.querySelector('.text-tray')!.textContent).toBe(lessons[1].text)
  })
})

describe('Background keyboard recovery', () => {
  it('focuses the input and inserts the first character exactly once', async () => {
    await mountPractice()
    const input = typingInput()
    input.blur()

    const event = new KeyboardEvent('keydown', { key: 'f', code: 'KeyF', bubbles: true, cancelable: true })
    document.body.dispatchEvent(event)
    await nextTick()

    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(input)
    expect(input.value).toBe('f')
  })

  it('uses the prior selection for background replacement and deletion', async () => {
    await mountPractice()
    const input = typingInput()
    input.value = 'fff'
    input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: 'fff' }))
    input.setSelectionRange(1, 2)
    input.blur()

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true }))
    await nextTick()
    expect(input.value).toBe('faf')

    input.setSelectionRange(1, 2)
    input.blur()
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }))
    await nextTick()
    expect(input.value).toBe('ff')
  })

  it('respects the sentence length when recovering focus from a full incorrect answer', async () => {
    await mountPractice()
    const input = typingInput()
    const fullAnswer = 'x'.repeat(lessons[0].text.length)
    input.value = fullAnswer
    input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: fullAnswer }))
    input.setSelectionRange(fullAnswer.length, fullAnswer.length)
    input.blur()
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', bubbles: true, cancelable: true }))
    await nextTick()
    expect(input.value).toBe(fullAnswer)
    expect(document.activeElement).toBe(input)
    input.setSelectionRange(0, 1)
    input.blur()
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', bubbles: true, cancelable: true }))
    await nextTick()
    expect(input.value).toBe(`f${fullAnswer.slice(1)}`)
  })

  it('does not advance an incomplete lesson from background Enter', async () => {
    await mountPractice()
    const input = typingInput()
    input.blur()
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    document.body.dispatchEvent(event)
    await nextTick()

    expect(event.defaultPrevented).toBe(false)
    expect(document.querySelector('.text-tray')!.textContent).toBe(lessons[0].text)
  })

  it('advances a completed lesson from background Enter', async () => {
    await mountPractice()
    await finishSentence()
    const input = typingInput()
    input.blur()

    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    document.body.dispatchEvent(event)
    await nextTick()
    await nextTick()

    expect(event.defaultPrevented).toBe(true)
    expect(document.querySelector('.text-tray')!.textContent).toBe(lessons[1].text)
    expect(document.activeElement).toBe(typingInput())
  })

  it('leaves native controls alone but resumes from printable button keys', async () => {
    await mountPractice()
    const input = typingInput()
    const button = document.querySelector<HTMLButtonElement>('.sound-toggle')!
    button.focus()

    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    button.dispatchEvent(enter)
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    button.dispatchEvent(space)
    expect(enter.defaultPrevented).toBe(false)
    expect(space.defaultPrevented).toBe(false)
    expect(input.value).toBe('')

    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', code: 'KeyF', bubbles: true, cancelable: true }))
    await nextTick()
    expect(input.value).toBe('f')
    expect(document.activeElement).toBe(input)
  })

  it('ignores editable controls and their contenteditable ancestors', async () => {
    await mountPractice()
    const input = typingInput()
    const controls: HTMLElement[] = [
      Object.assign(document.createElement('input'), { type: 'text' }),
      document.createElement('textarea'),
      document.createElement('select'),
    ]
    const editable = document.createElement('div')
    editable.setAttribute('contenteditable', 'true')
    const editableChild = document.createElement('span')
    editable.append(editableChild)
    const targets = [...controls, editableChild]
    document.body.append(...controls, editable)

    for (const control of targets) {
      const event = new KeyboardEvent('keydown', { key: 'f', bubbles: true, cancelable: true })
      control.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
    }
    expect(input.value).toBe('')
  })

  it('removes background handling when the practice unmounts', async () => {
    await mountPractice()
    app!.unmount()
    app = undefined
    const event = new KeyboardEvent('keydown', { key: 'f', bubbles: true, cancelable: true })
    document.body.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
    expect(document.querySelector('#typing-input')).toBeNull()
  })
})
