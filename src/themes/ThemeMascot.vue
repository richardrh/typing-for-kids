<script setup lang="ts">
import { computed } from 'vue'
import type { AnimalStats } from '../progress/progression'
import { lessons } from '../lessons/catalog'
import { getTheme, type ThemeId } from './catalog'
import { getEvolution, type AnimalPower } from './evolutions/catalog'
import AnimalPowerEffect from './evolutions/AnimalPowerEffect.vue'

const props = defineProps<{ theme: ThemeId; level: number; stage: AnimalStats['stage']; completedCount: number; power?: AnimalPower | null }>()
const animal = computed(() => getTheme(props.theme))
const evolution = computed(() => getEvolution(props.theme, props.stage))
const growth = computed(() => Math.min(1, Math.max(0, props.completedCount / lessons.length)))
const growthStyle = computed(() => ({
  '--animal-size': `${80 + growth.value * 108}px`,
  '--animal-shine': growth.value * .7,
  '--animal-mask': `url("${evolution.value.asset}")`,
}))
</script>

<template>
  <div class="animal-avatar" :class="[`stage-${stage}`, power ? `using-${power.effect}` : null]" :style="growthStyle"
    role="img" :aria-label="`${evolution.name}, ${animal.label}, level ${level}`" :data-level="level" :data-stage="stage" :data-completions="completedCount" :data-evolution="evolution.name">
    <span class="animal-halo" aria-hidden="true"></span>
    <div class="animal-art" aria-hidden="true">
      <div :key="`${theme}-${completedCount}`" class="animal-appearance">
        <img :src="evolution.asset" width="120" height="100" alt="" />
        <span class="animal-shine"></span>
      </div>
    </div>
    <svg v-if="stage === 'big' || stage === 'shiny'" class="animal-sparkles" viewBox="0 0 220 180" aria-hidden="true">
      <path d="m29 43 4 10 10 4-10 4-4 10-4-10-10-4 10-4Z" />
      <path d="m192 90 5 13 13 5-13 5-5 13-5-13-13-5 13-5Z" />
      <path v-if="stage === 'shiny'" d="m157 12 4 10 10 4-10 4-4 10-4-10-10-4 10-4Z" />
    </svg>
    <AnimalPowerEffect v-if="power" :power="power" />
  </div>
</template>

<style scoped>
.animal-avatar { position: relative; display: grid; place-items: end center; isolation: isolate; height: 178px; width: 100%; }
.animal-art { position: relative; width: var(--animal-size); max-width: 100%; margin-bottom: 8px; transition: width .45s ease; }
.animal-appearance { position: relative; animation: growth-pop .6s ease-out; transform-origin: center bottom; }
.animal-avatar[data-completions="0"] .animal-appearance { animation: none; }
@keyframes growth-pop { 0%, 100% { transform: scale(1); } 45% { transform: scale(1.1); } }
img { display: block; width: 100%; height: auto; filter: drop-shadow(0 6px 3px #24334330); }
.animal-halo { position: absolute; z-index: -1; inset: 20px 5px 5px; border-radius: 50%; background: radial-gradient(ellipse at center,white 5%,var(--soft) 65%,transparent 70%); }
.animal-shine { position: absolute; inset: 0; mask-image: var(--animal-mask); mask-size: contain; mask-repeat: no-repeat; mask-position: center; background: linear-gradient(120deg,transparent 15%,#fff9 33%,transparent 45%,#fff5 56%,transparent 64%); opacity: var(--animal-shine); transition: opacity .45s ease; }
.stage-shiny img { filter: drop-shadow(0 0 8px #efc54b) drop-shadow(0 7px 3px #24334330) saturate(1.2); }
.stage-shiny .animal-halo { background: radial-gradient(ellipse at center,#fff5ba 15%,#ffe38b88 48%,transparent 72%); }
.using-roar .animal-appearance { animation: roar-pose 1.2s ease-out; }
.using-stomp .animal-appearance { animation: stomp-pose 1.2s ease-out; }
.using-magic .animal-appearance, .using-shield .animal-appearance { animation: magic-pose 1.2s ease-out; }
.using-splash .animal-appearance { animation: splash-pose 1.2s ease-out; }
.using-dash .animal-appearance { animation: dash-pose 1.2s ease-out; }
@keyframes roar-pose { 0%,100% { transform: scale(1); } 25%,55% { transform: scale(1.08); } }
@keyframes stomp-pose { 0%,100% { transform: translateY(0); } 20% { transform: translateY(-9px) rotate(-3deg); } 35% { transform: translateY(3px); } }
@keyframes magic-pose { 0%,100% { transform: translateY(0); } 40%,65% { transform: translateY(-5px); } }
@keyframes splash-pose { 0%,100% { transform: translateY(0) rotate(0); } 35% { transform: translateY(-12px) rotate(-6deg); } }
@keyframes dash-pose { 0%,100% { transform: translateX(0); } 20% { transform: translateX(6px); } 45%,65% { transform: translateX(-9px); } }
.animal-sparkles { position: absolute; inset: 0; width: 100%; height: 100%; fill: #b88410; pointer-events: none; }
@media (max-width: 1049px) {
  .animal-avatar { flex: 0 0 116px; height: 116px; width: 116px; }
  .animal-art { width: calc(var(--animal-size) * .6); }
  .animal-halo { inset: 12px 0 0; }
}
@media (prefers-reduced-motion: reduce) {
  .animal-art, .animal-shine { transition: none; }
  .animal-avatar .animal-appearance { animation: none; }
}
</style>
