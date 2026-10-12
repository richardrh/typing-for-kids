<script setup lang="ts">
import { computed } from 'vue'
import { keyTarget, shiftKeyId } from './keyMapping'
import FingerGuide from './FingerGuide.vue'

interface KeyboardKey {
  readonly id: string
  readonly label: string
  readonly shifted?: string
  readonly ariaLabel?: string
  readonly className?: string
}

const props = defineProps<{
  nextCharacter: string
  complete: boolean
  pressedKey: string
}>()

const keyboardRows: readonly (readonly KeyboardKey[])[] = [
  [
    { id: '`', label: '`', shifted: '~' },
    { id: '1', label: '1', shifted: '!' },
    { id: '2', label: '2', shifted: '@' },
    { id: '3', label: '3', shifted: '#' },
    { id: '4', label: '4', shifted: '$' },
    { id: '5', label: '5', shifted: '%' },
    { id: '6', label: '6', shifted: '^' },
    { id: '7', label: '7', shifted: '&' },
    { id: '8', label: '8', shifted: '*' },
    { id: '9', label: '9', shifted: '(' },
    { id: '0', label: '0', shifted: ')' },
    { id: '-', label: '-', shifted: '_' },
    { id: '=', label: '=', shifted: '+' },
    { id: 'backspace', label: '⌫', ariaLabel: 'Backspace', className: 'backspace' },
  ],
  [
    { id: 'q', label: 'q' },
    { id: 'w', label: 'w' },
    { id: 'e', label: 'e' },
    { id: 'r', label: 'r' },
    { id: 't', label: 't' },
    { id: 'y', label: 'y' },
    { id: 'u', label: 'u' },
    { id: 'i', label: 'i' },
    { id: 'o', label: 'o' },
    { id: 'p', label: 'p' },
    { id: '[', label: '[', shifted: '{' },
    { id: ']', label: ']', shifted: '}' },
    { id: '\\', label: '\\', shifted: '|', ariaLabel: 'Backslash' },
  ],
  [
    { id: 'a', label: 'a' },
    { id: 's', label: 's' },
    { id: 'd', label: 'd' },
    { id: 'f', label: 'f', className: 'bump' },
    { id: 'g', label: 'g' },
    { id: 'h', label: 'h' },
    { id: 'j', label: 'j', className: 'bump' },
    { id: 'k', label: 'k' },
    { id: 'l', label: 'l' },
    { id: ';', label: ';', shifted: ':' },
    { id: "'", label: "'", shifted: '"' },
  ],
  [
    { id: 'shift-left', label: 'Shift', ariaLabel: 'Left Shift', className: 'shift-key shift-left' },
    { id: 'z', label: 'z' },
    { id: 'x', label: 'x' },
    { id: 'c', label: 'c' },
    { id: 'v', label: 'v' },
    { id: 'b', label: 'b' },
    { id: 'n', label: 'n' },
    { id: 'm', label: 'm' },
    { id: ',', label: ',', shifted: '<' },
    { id: '.', label: '.', shifted: '>' },
    { id: '/', label: '/', shifted: '?' },
    { id: 'shift-right', label: 'Shift', ariaLabel: 'Right Shift', className: 'shift-key shift-right' },
  ],
]

const target = computed(() => keyTarget(props.nextCharacter))
const highlightedKeys = computed(() => {
  if (props.complete || !target.value) return []
  const keys = [target.value.key]
  if (target.value.shift) keys.push(shiftKeyId(target.value.shift))
  return keys
})


</script>

<template>
  <div class="keyboard keyboard-advanced" aria-label="Keyboard showing the next key">
    <FingerGuide :target="target" :character="nextCharacter" :complete="complete" />
    <div v-for="(row, rowIndex) in keyboardRows" :key="rowIndex" class="keyboard-row">
      <span
        v-for="key in row"
        :key="key.id"
        class="key-cap keyboard-key"
        :class="[key.className, { highlighted: highlightedKeys.includes(key.id), pressed: pressedKey === key.id }]"
        :aria-label="key.ariaLabel"
      >
        <span v-if="key.shifted" class="shifted-legend">{{ key.shifted }}</span>
        <span>{{ key.label }}</span>
      </span>
    </div>
    <div class="keyboard-row">
      <span
        class="key-cap space-key keyboard-key"
        :class="{ highlighted: !complete && target?.key === 'space', pressed: pressedKey === 'space' }"
        aria-label="Space"
      >␣</span>
    </div>
  </div>
</template>

<style scoped>
.keyboard-advanced {
  overflow-x: hidden;
}

.keyboard-advanced .keyboard-row {
  min-width: 0;
}

.keyboard-advanced .keyboard-key {
  min-width: 0;
  flex-basis: clamp(17px, 5.4vw, 64px);
  padding: 3px;
  font-size: clamp(14px, 2.5vw, 27px);
}

.keyboard-advanced .keyboard-key.backspace {
  flex-basis: clamp(40px, 7vw, 76px);
  font-size: clamp(16px, 2.3vw, 24px);
}

.keyboard-advanced .keyboard-key.shift-key {
  flex-basis: clamp(54px, 8vw, 92px);
  font-size: clamp(12px, 1.9vw, 20px);
}

.keyboard-advanced .shifted-legend {
  position: absolute;
  top: 4px;
  font-size: .45em;
  line-height: 1;
  opacity: .78;
}

.keyboard-advanced .space-key {
  flex-basis: clamp(150px, 39vw, 360px);
}

.keyboard-advanced .shift-key.highlighted {
  color: #704e0c;
  border-color: #ad8222;
  border-bottom-color: #79560f;
  background: linear-gradient(145deg, #fff1bd, #e5b344);
  text-shadow: none;
}
</style>
