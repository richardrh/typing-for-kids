<script setup lang="ts">
import type { Finger, FingerPlacement, ShiftHand } from './keyMapping'

defineProps<{ hand: ShiftHand; primary?: FingerPlacement; shift?: ShiftHand }>()
const fingers: readonly { finger: Finger; path: string }[] = [
  { finger: 'pinky', path: 'M8 68V36Q8 27 17 27Q26 27 26 36V66Z' },
  { finger: 'ring', path: 'M29 60V23Q29 13 38 13Q47 13 47 23V60Z' },
  { finger: 'middle', path: 'M50 59V15Q50 5 59 5Q69 5 69 15V59Z' },
  { finger: 'index', path: 'M72 62V24Q72 14 81 14Q91 14 91 24V64Z' },
  { finger: 'thumb', path: 'M91 71 110 49Q117 42 123 48Q129 53 123 60L107 85Q99 96 85 94Z' },
]
</script>

<template>
  <svg class="hand-diagram" viewBox="0 0 132 100" aria-hidden="true" :data-hand="hand">
    <g :transform="hand === 'right' ? 'translate(132 0) scale(-1 1)' : undefined">
      <rect class="hand-palm" x="17" y="48" width="80" height="47" rx="20" />
      <path v-for="finger in fingers" :key="finger.finger" :d="finger.path" :data-finger="finger.finger" class="hand-finger"
        :class="{ 'is-target': primary?.finger === finger.finger && (primary.hand === hand || primary.hand === 'either'), 'is-shift': shift === hand && finger.finger === 'pinky' }" />
    </g>
  </svg>
</template>

<style scoped>
.hand-palm, .hand-finger { fill: #e6eef2; stroke: #718694; stroke-width: 2; stroke-linejoin: round; }
.hand-finger.is-target { fill: var(--accent, #267446); stroke: var(--accent-deep, #164f32); stroke-width: 3; }
.hand-finger.is-shift { fill: #e5b344; stroke: #79560f; stroke-width: 3; }
</style>
