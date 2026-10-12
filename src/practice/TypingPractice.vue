<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRef, watch } from 'vue'
import type { ThemeId } from '../themes/catalog'
import type { Lesson } from '../lessons/types'
import { recordCompletion } from '../progress/storage'
import { useKeySound } from './useKeySound'
import { physicalKeyId } from './keyMapping'
import { useTypingSession } from './useTypingSession'
import VirtualKeyboard from './VirtualKeyboard.vue'

const props = defineProps<{
  lesson: Lesson
  theme: ThemeId
  hasNext: boolean
}>()

const emit = defineEmits<{
  next: []
  complete: []
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const pressedKey = ref('')
let pressedTimer: ReturnType<typeof setTimeout> | undefined
const session = useTypingSession(toRef(props, 'lesson'))
const sound = useKeySound()
const { typed, started, complete, cursorPosition, accuracy, wpm } = session
const statusMessage = computed(() => {
  if (complete.value) return `Lesson complete at ${accuracy.value} percent accuracy.`
  if (!started.value) return 'Ready. Start typing the words shown.'
  return 'Typing.'
})

function showKeyActivity(event: KeyboardEvent): void {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
  if (event.code || key === 'Backspace' || key.length === 1) {
    pressedKey.value = physicalKeyId(event.code, key)
    clearTimeout(pressedTimer)
    pressedTimer = setTimeout(() => {
      pressedKey.value = ''
    }, 120)
  }
  sound.playKey(event.key, event.isTrusted)
}

function isElementTarget(target: EventTarget | null): target is Element {
  return typeof Element !== 'undefined' && target instanceof Element
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!isElementTarget(target)) return false
  let element: Element | null = target
  while (element) {
    const tag = element.tagName.toLowerCase()
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
    if (element.hasAttribute('contenteditable') && element.getAttribute('contenteditable') !== 'false') return true
    element = element.parentElement
  }
  return false
}

function isNativeActionTarget(target: EventTarget | null): boolean {
  return isElementTarget(target) && Boolean(target.closest('button, a, summary, [role="button"]'))
}

function handleBackgroundEdit(event: KeyboardEvent): void {
  const input = inputRef.value
  if (!input || complete.value) return

  const start = Math.max(0, Math.min(input.value.length, input.selectionStart ?? cursorPosition.value))
  const end = Math.max(start, Math.min(input.value.length, input.selectionEnd ?? start))
  const direction = input.selectionDirection ?? 'none'
  input.focus()
  input.setSelectionRange(start, end, direction)

  if (event.key === 'Backspace') {
    if (start !== end) input.setRangeText('', start, end, 'start')
    else if (start > 0) input.setRangeText('', start - 1, start, 'start')
  } else {
    const capacity = props.lesson.text.length - (input.value.length - (end - start))
    if (capacity <= 0) return
    input.setRangeText(event.key, start, end, 'end')
  }
  input.dispatchEvent(new InputEvent('input', {
    bubbles: true,
    inputType: event.key === 'Backspace' ? 'deleteContentBackward' : 'insertText',
    data: event.key === 'Backspace' ? null : event.key,
  }))
}

function handleBackgroundKeydown(event: KeyboardEvent): void {
  if (event.defaultPrevented || event.isComposing || event.key === 'Process') return
  if (event.ctrlKey || event.metaKey || event.altKey) return
  if (event.target === inputRef.value || isEditableTarget(event.target)) return

  if (event.key === 'Enter') {
    if (!isNativeActionTarget(event.target)) handleEnter(event)
    return
  }

  if (complete.value || (event.key === ' ' && isNativeActionTarget(event.target))) return
  if (event.key !== 'Backspace' && event.key.length !== 1) return
  event.preventDefault()
  showKeyActivity(event)
  handleBackgroundEdit(event)
}

function focusInput(): void {
  nextTick(() => {
    if (!complete.value) inputRef.value?.focus()
  })
}

function restart(): void {
  session.restart()
  focusInput()
}

function handleEnter(event: KeyboardEvent): void {
  if (event.repeat || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return
  if (complete.value && props.hasNext) {
    event.preventDefault()
    emit('next')
  } else if (!props.lesson.text.startsWith(typed.value)) {
    event.preventDefault()
    restart()
  }
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.ctrlKey || event.metaKey || event.altKey) return
  if (event.key === 'Enter') {
    handleEnter(event)
    return
  }
  if (complete.value) return
  showKeyActivity(event)
}

function handleInput(event: Event): void {
  if (session.handleInput(event)) {
    recordCompletion(props.theme, props.lesson.id, session.accuracy.value)
    emit('complete')
  }
}

watch(() => `${props.lesson.id}\u0000${props.lesson.text}`, focusInput)
onMounted(() => {
  document.addEventListener('keydown', handleBackgroundKeydown)
  focusInput()
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleBackgroundKeydown)
  clearTimeout(pressedTimer)
})


</script>

<template>
  <section class="practice" aria-label="Typing practice">
    <div class="lesson-heading">
      <h1>{{ lesson.title }}</h1>
      <span class="accuracy">{{ wpm }} WPM · {{ accuracy }}% accuracy</span>
    </div>
    <div class="exercise" :class="{ complete }">
      <div class="typing-surface" :class="{ active: started && !complete }">
        <div class="text-tray" aria-hidden="true">
          <span
            v-for="(character, index) in lesson.text"
            :key="`${lesson.id}-${index}`"
            class="text-character"
            :class="{
              correct: typed[index] && typed[index] === character,
              wrong: typed[index] && typed[index] !== character,
              current: index === cursorPosition && !complete,
            }"
          >{{ character }}</span>
        </div>
        <label class="sr-only" for="typing-input">Type the words shown</label>
        <p id="typing-target" class="sr-only">{{ lesson.text }}. Use Backspace to correct mistakes.</p>
        <input
          id="typing-input"
          ref="inputRef"
          :value="typed"
          :maxlength="lesson.text.length"
          :readonly="complete"
          autocomplete="off"
          autocapitalize="off"
          autocorrect="off"
          :spellcheck="false"
          inputmode="text"
          aria-describedby="typing-target finger-instruction"
          @focus="session.start"
          @blur="session.blur"
          @keydown="handleKeydown"
          @input="handleInput"
          @beforeinput="session.handleBeforeInput"
          @paste="session.preventPaste"
          @drop.prevent
          @select="session.updateSelection"
          @click="session.updateSelection"
          @keyup="session.updateSelection"
        >
      </div>
      <div class="practice-actions">
        <button
          type="button"
          class="sound-toggle"
          :aria-pressed="sound.enabled.value"
          @click="sound.toggle(); focusInput()"
        >Sound {{ sound.enabled.value ? 'on' : 'off' }}</button>
        <button v-if="started || complete" type="button" @click="restart">{{ complete ? 'Try again' : 'Restart' }}</button>
        <strong v-if="complete" class="completion" role="status">Lesson complete!</strong>
        <button v-if="complete && hasNext" class="primary" type="button" aria-keyshortcuts="Enter" @click="emit('next')">Next sentence <span aria-hidden="true">↵</span></button>
      </div>
    </div>

    <VirtualKeyboard :next-character="session.nextCharacter.value" :complete="complete" :pressed-key="pressedKey" />
    <details class="keyboard-help">
      <summary>Where do my fingers go?</summary>
      <p>{{ lesson.fingerHint }} Use a thumb for the space bar.</p>
    </details>
    <p class="sr-only" aria-live="polite">{{ statusMessage }}</p>
  </section>
</template>
