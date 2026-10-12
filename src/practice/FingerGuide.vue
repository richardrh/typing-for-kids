<script setup lang="ts">
import { computed } from 'vue'
import { fingerForKey, type KeyTarget } from './keyMapping'
import HandDiagram from './HandDiagram.vue'

const props = defineProps<{ target?: KeyTarget; character: string; complete: boolean }>()
const primary = computed(() => props.complete || !props.target ? undefined : fingerForKey(props.target.key))
const shift = computed(() => primary.value ? props.target?.shift : undefined)
const handNames = { left: 'Left', right: 'Right', either: 'Either' } as const
const instruction = computed(() => primary.value ? `${handNames[primary.value.hand]} ${primary.value.finger}` : '')
const keyLabel = computed(() => props.target?.key === 'space' ? 'Space' : props.target?.key === 'backspace' ? 'Backspace' : props.character)
</script>

<template>
  <div class="finger-guide" role="group" aria-label="Finger placement">
    <HandDiagram class="hand-left" hand="left" :primary="primary" :shift="shift" />
    <HandDiagram class="hand-right" hand="right" :primary="primary" :shift="shift" />
    <p id="finger-instruction" class="finger-instruction">
      <template v-if="primary">
        <span class="finger-primary"><strong>{{ instruction }}</strong><span aria-hidden="true">→</span><span class="sr-only"> on </span><kbd>{{ keyLabel }}</kbd></span>
        <span v-if="shift" class="finger-shift">+ {{ handNames[shift] }} pinky <kbd>Shift</kbd></span>
      </template>
      <span v-else>{{ complete ? 'Sentence complete!' : 'Enter to retry, or Backspace to fix.' }}</span>
    </p>
  </div>
</template>

<style scoped>
.finger-guide { display: grid; grid-template-columns: 90px minmax(0,240px) 90px; align-items: center; justify-content: center; gap: 10px; margin: 0 auto 12px; padding-bottom: 8px; border-bottom: 1px solid #bfcfd8; }
.hand-diagram { display: block; width: 90px; height: 68px; }
.hand-left { grid-column: 1; grid-row: 1; }
.hand-right { grid-column: 3; grid-row: 1; }
.finger-instruction { grid-column: 2; grid-row: 1; margin: 0; color: #243343; text-align: center; font-size: 17px; line-height: 1.4; }
.finger-primary { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 6px; }
kbd { display: inline-block; min-width: 28px; padding: 2px 7px; border: 1px solid var(--accent, #267446); border-bottom-width: 3px; border-radius: 6px; background: white; color: var(--accent-deep, #164f32); font: inherit; font-weight: 800; }
.finger-shift { display: block; margin-top: 4px; font-size: 15px; }
.finger-shift kbd { color: #704e0c; border-color: #ad8222; background: #fff1bd; }
@media (max-width: 600px) {
  .finger-guide { grid-template-columns: 64px minmax(0,1fr) 64px; gap: 5px; margin-bottom: 10px; }
  .hand-diagram { width: 64px; height: 49px; }
  .finger-instruction { font-size: 15px; }
  .finger-shift { font-size: 14px; }
  kbd { padding: 1px 5px; }
}
</style>
