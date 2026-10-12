<script setup lang="ts">
defineProps<{
  nextCharacter: string
  complete: boolean
  pressedKey: string
}>()

const keyboardRows = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
]
</script>

<template>
  <div class="keyboard" aria-label="Keyboard showing the next key">
    <div v-for="(row, rowIndex) in keyboardRows" :key="rowIndex" class="keyboard-row">
      <span
        v-for="key in row"
        :key="key"
        class="key-cap"
        :class="{
          highlighted: !complete && nextCharacter === key,
          pressed: pressedKey === key,
          bump: key === 'f' || key === 'j',
        }"
      >{{ key }}</span>
      <span
        v-if="rowIndex === 0"
        class="key-cap backspace"
        :class="{ pressed: pressedKey === 'Backspace' }"
        aria-label="Backspace"
      >⌫</span>
    </div>
    <div class="keyboard-row">
      <span
        class="key-cap space-key"
        :class="{ highlighted: !complete && nextCharacter === ' ', pressed: pressedKey === ' ' }"
        aria-label="Space"
      >␣</span>
    </div>
  </div>
</template>
