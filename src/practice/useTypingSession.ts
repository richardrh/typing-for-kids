import { computed, isRef, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import type { Lesson } from '../lessons/types'
import { clearSession, loadSession, saveSession, type TypingSession } from '../progress/storage'
import { calculateAccuracy } from './scoring'

export interface ChangedText {
  start: number
  value: string
}

/** Find the smallest changed span between two input values. */
export function insertedCharacters(previous: string, next: string): ChangedText {
  let start = 0
  while (start < previous.length && start < next.length && previous[start] === next[start]) start += 1

  let suffix = 0
  while (
    suffix < previous.length - start &&
    suffix < next.length - start &&
    previous[previous.length - suffix - 1] === next[next.length - suffix - 1]
  ) {
    suffix += 1
  }

  const nextEnd = next.length - suffix
  return { start, value: next.slice(start, nextEnd) }
}

type LessonSource = Lesson | Ref<Lesson>

export interface TypingSessionController {
  lesson: Ref<Lesson>
  typed: Ref<string>
  attempts: Ref<number>
  mistakes: Ref<number>
  started: Ref<boolean>
  complete: Ref<boolean>
  cursorPosition: Ref<number>
  elapsedMs: Ref<number>
  accuracy: Readonly<Ref<number>>
  wpm: Readonly<Ref<number>>
  nextCharacter: Readonly<Ref<string>>
  start(): void
  blur(): void
  restart(): void
  updateSelection(event: Event): void
  handleInput(event: Event): boolean
  handleBeforeInput(event: InputEvent): void
  preventPaste(event: ClipboardEvent): void
}

function clockNow(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}


export function useTypingSession(source: LessonSource): TypingSessionController {
  const lesson = isRef(source) ? source : ref(source)
  const typed = ref('')
  const attempts = ref(0)
  const mistakes = ref(0)
  const started = ref(false)
  const complete = ref(false)
  const cursorPosition = ref(0)
  const elapsedMs = ref(0)
  const focused = ref(false)
  let activeSince: number | null = null
  let timer: ReturnType<typeof setInterval> | undefined

  function syncElapsed(): void {
    if (activeSince === null) return
    const now = clockNow()
    elapsedMs.value += Math.max(0, now - activeSince)
    activeSince = now
  }

  function pauseClock(): void {
    syncElapsed()
    activeSince = null
  }

  function resumeClock(): void {
    if (activeSince === null && started.value && !complete.value && focused.value && (typeof document === 'undefined' || document.visibilityState !== 'hidden')) {
      activeSince = clockNow()
    }
  }

  function restore(): void {
    pauseClock()
    const saved = loadSession(lesson.value)
    if (saved) {
      typed.value = saved.typed
      attempts.value = saved.attempts
      mistakes.value = saved.mistakes
      elapsedMs.value = saved.elapsedMs ?? 0
      started.value = saved.typed.length > 0 || saved.attempts > 0
      complete.value = saved.typed === lesson.value.text
      cursorPosition.value = saved.typed.length
      if (complete.value) pauseClock()
      else resumeClock()
      return
    }
    typed.value = ''
    attempts.value = 0
    mistakes.value = 0
    elapsedMs.value = 0
    started.value = false
    complete.value = false
    cursorPosition.value = 0
  }

  watch(() => `${lesson.value.id}\u0000${lesson.value.text}`, restore, { immediate: true })

  const accuracy = computed(() => calculateAccuracy(attempts.value, mistakes.value))
  const correctCharacters = computed(() => {
    let count = 0
    for (let index = 0; index < typed.value.length; index += 1) {
      if (typed.value[index] === lesson.value.text[index]) count += 1
    }
    return count
  })
  const wpm = computed(() => {
    const minutes = elapsedMs.value / 60_000
    if (correctCharacters.value === 0 || elapsedMs.value < 1_000) return 0
    return Math.round((correctCharacters.value / 5) / minutes)
  })
  const nextCharacter = computed(() => lesson.value.text[cursorPosition.value] ?? '')

  function persist(): void {
    if (!started.value || complete.value) return
    syncElapsed()
    const session: TypingSession = {
      version: 1,
      lessonId: lesson.value.id,
      text: lesson.value.text,
      typed: typed.value,
      attempts: attempts.value,
      mistakes: mistakes.value,
      elapsedMs: elapsedMs.value,
    }
    saveSession(session)
  }

  /** Focus marks the active editing surface; the first character starts timing. */
  function start(): void {
    focused.value = true
    resumeClock()
  }

  function blur(): void {
    focused.value = false
    pauseClock()
    persist()
  }

  function restart(): void {
    clearSession()
    pauseClock()
    typed.value = ''
    attempts.value = 0
    mistakes.value = 0
    elapsedMs.value = 0
    started.value = false
    complete.value = false
    cursorPosition.value = 0
  }

  function updateSelection(event: Event): void {
    const input = event.target as HTMLInputElement | null
    if (!input) return
    cursorPosition.value = input.selectionStart ?? input.value.length
  }

  function handleInput(event: Event): boolean {
    if (complete.value) return false
    const input = event.target as HTMLInputElement | null
    if (!input) return false
    const inputType = (event as InputEvent).inputType
    if (inputType === 'insertFromPaste' || inputType === 'insertFromDrop') {
      input.value = typed.value
      return false
    }
    const next = input.value.slice(0, lesson.value.text.length)
    const changed = insertedCharacters(typed.value, next)
    if (changed.value.length > 0 && !started.value) {
      started.value = true
      focused.value = true
      resumeClock()
    }
    for (let offset = 0; offset < changed.value.length; offset += 1) {
      attempts.value += 1
      if (changed.value[offset] !== lesson.value.text[changed.start + offset]) mistakes.value += 1
    }
    typed.value = next
    cursorPosition.value = input.selectionStart ?? next.length
    if (next === lesson.value.text) {
      syncElapsed()
      complete.value = true
      pauseClock()
      clearSession()
    } else {
      persist()
    }
    return complete.value
  }

  function handleBeforeInput(event: InputEvent): void {
    if (event.inputType === 'insertFromPaste' || event.inputType === 'insertFromDrop') event.preventDefault()
  }

  function preventPaste(event: ClipboardEvent): void {
    event.preventDefault()
  }

  function handleVisibility(): void {
    if (typeof document === 'undefined' || document.visibilityState !== 'hidden') {
      resumeClock()
      return
    }
    pauseClock()
    persist()
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibility)
    timer = setInterval(() => {
      syncElapsed()
      persist()
    }, 250)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', handleVisibility)
    clearInterval(timer)
    timer = undefined
    pauseClock()
    persist()
  })

  return {
    lesson,
    typed,
    attempts,
    mistakes,
    started,
    complete,
    cursorPosition,
    elapsedMs,
    accuracy,
    wpm,
    nextCharacter,
    start,
    blur,
    restart,
    updateSelection,
    handleInput,
    handleBeforeInput,
    preventPaste,
  }
}
