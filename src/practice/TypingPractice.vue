<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRef, watch } from 'vue'
import ThemeMascot from '../themes/ThemeMascot.vue'
import type { ThemeId } from '../themes/catalog'
import type { Lesson } from '../lessons/types'
import { recordCompletion } from '../progress/storage'
import { useKeySound } from './useKeySound'
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

function focusInput(): void {
  nextTick(() => {
    if (!complete.value) inputRef.value?.focus()
  })
}

function restart(): void {
  session.restart()
  focusInput()
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.ctrlKey || event.metaKey || event.altKey) return
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
  if (key === 'Backspace' || key.length === 1) {
    pressedKey.value = key
    clearTimeout(pressedTimer)
    pressedTimer = setTimeout(() => {
      pressedKey.value = ''
    }, 120)
  }
  sound.playKey(event.key, event.isTrusted)
}

function handleInput(event: Event): void {
  if (session.handleInput(event)) {
    recordCompletion(props.lesson.id, session.accuracy.value)
    emit('complete')
  }
}

watch(() => `${props.lesson.id}\u0000${props.lesson.text}`, focusInput)
onMounted(focusInput)
onBeforeUnmount(() => {
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
      <ThemeMascot :theme="theme" />
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
          :disabled="complete"
          autocomplete="off"
          autocapitalize="off"
          autocorrect="off"
          :spellcheck="false"
          inputmode="text"
          aria-describedby="typing-target"
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
        <button v-if="complete && hasNext" class="primary" type="button" @click="emit('next')">Next lesson <span aria-hidden="true">→</span></button>
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
