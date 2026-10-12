<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { LESSONS_PER_LEVEL, type AnimalStats } from '../progress/progression'
import { getTheme, type ThemeId } from '../themes/catalog'
import ThemeMascot from '../themes/ThemeMascot.vue'
import { getEvolution, getNextEvolution, getNextPowerEvolution } from '../themes/evolutions/catalog'

const props = defineProps<{ theme: ThemeId; stats: AnimalStats }>()
const announcement = ref('')
const evolution = computed(() => getEvolution(props.theme, props.stats.stage))
const nextEvolution = computed(() => getNextEvolution(props.theme, props.stats.stage))
const nextPower = computed(() => getNextPowerEvolution(props.theme, props.stats.stage))
const powerActive = ref(false)
const powerAnnouncement = ref('')
let powerTimer: number | undefined

function activatePower() {
  if (!evolution.value.power || powerActive.value) return
  powerActive.value = true
  powerAnnouncement.value = `${getTheme(props.theme).label} uses ${evolution.value.power.name}!`
  powerTimer = window.setTimeout(() => {
    powerActive.value = false
    powerAnnouncement.value = ''
  }, 1200)
}

watch(() => `${props.theme}-${props.stats.stage}`, () => {
  window.clearTimeout(powerTimer)
  powerActive.value = false
  powerAnnouncement.value = ''
})
onBeforeUnmount(() => window.clearTimeout(powerTimer))
watch(() => [props.theme, props.stats.completedCount] as const, ([theme, count], [previousTheme, previousCount]) => {
  if (theme !== previousTheme || count <= previousCount) {
    announcement.value = ''
    return
  }
  announcement.value = count % LESSONS_PER_LEVEL === 0
    ? `${getTheme(theme).label} grew to level ${props.stats.level}!`
    : `${getTheme(theme).label} grew!`
})
</script>

<template>
  <section class="animal-progress" aria-label="Your animal's progress">
    <ThemeMascot :theme="theme" :level="stats.level" :stage="stats.stage" :completed-count="stats.completedCount" :power="powerActive ? evolution.power : null" />
    <div class="growth-details">
      <h2>{{ getTheme(theme).label }} <span>Level {{ stats.level }}</span></h2>
      <p class="evolution-name">{{ evolution.name }}</p>
      <p class="earned-score">{{ stats.score.toLocaleString() }} <span>points</span></p>
      <progress :value="stats.isMaxLevel ? LESSONS_PER_LEVEL : LESSONS_PER_LEVEL - stats.lessonsToNextLevel" :max="LESSONS_PER_LEVEL" aria-label="Lessons toward the next animal level" />
      <p class="next-growth">{{ stats.isMaxLevel ? 'Fully grown!' : `${stats.lessonsToNextLevel} more ${stats.lessonsToNextLevel === 1 ? 'lesson' : 'lessons'} to level ${stats.level + 1}` }}</p>
      <p v-if="announcement" class="growth-announcement" role="status">{{ announcement }}</p>
      <button class="animal-power primary" type="button" :disabled="!evolution.power || powerActive" @click="activatePower">
        {{ evolution.power ? `${powerActive ? 'Using ' : ''}${evolution.power.name}` : `Power at level ${nextPower?.minLevel}` }}
      </button>
      <p class="sr-only" role="status">{{ powerAnnouncement }}</p>
      <details class="evolution-guide">
        <summary>Features &amp; next evolution</summary>
        <ul><li v-for="feature in evolution.features" :key="feature">{{ feature }}</li></ul>
        <div v-if="nextEvolution" class="next-evolution">
          <img :src="nextEvolution.asset" width="96" height="80" alt="" />
          <strong>{{ nextEvolution.name }} · Level {{ nextEvolution.minLevel }}</strong>
          <p>{{ nextEvolution.features.join(', ') }}.</p>
          <p v-if="nextEvolution.power">Power: {{ nextEvolution.power.name }}</p>
        </div>
        <p v-else>Final evolution unlocked.</p>
      </details>
    </div>
  </section>
</template>

<style scoped>
.animal-progress { padding: 12px 16px 20px; border: 2px solid var(--border); border-radius: 22px; background: linear-gradient(155deg,#fff,var(--soft)); box-shadow: 0 6px 0 rgba(45,75,80,.13), inset 0 2px 0 white; text-align: center; }
h2 { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 8px; margin: 0; font-size: 21px; }
h2 span { color: var(--accent-deep); font-size: 18px; }
.earned-score { margin: 10px 0; font-size: 30px; font-weight: 800; color: var(--accent-deep); font-variant-numeric: tabular-nums; }
.earned-score span { font-size: 18px; font-weight: 600; }
progress { display: block; appearance: none; width: 100%; height: 12px; border: 0; border-radius: 10px; overflow: hidden; background: #dce8e9; accent-color: var(--accent); }
progress::-webkit-progress-bar { background: #dce8e9; border-radius: 10px; }
progress::-webkit-progress-value { background: var(--accent); border-radius: 10px; }
progress::-moz-progress-bar { background: var(--accent); border-radius: 10px; }
.next-growth { margin: 10px 0 0; font-size: 16px; line-height: 1.4; }
.growth-announcement { margin: 10px 0 0; color: var(--accent-deep); font-weight: 800; }
.evolution-name { margin: 7px 0 0; color: var(--accent-deep); font-size: 18px; font-weight: 700; }
.animal-power { width: 100%; margin-top: 14px; font-size: 17px; }
.animal-power:disabled { cursor: default; box-shadow: none; transform: none; background: #e5edf0; border-color: #c4d0d8; color: #4e6070; }
.evolution-guide { margin-top: 14px; font-size: 16px; line-height: 1.45; text-align: left; }
.evolution-guide summary { padding: 5px 0; font-weight: 700; cursor: pointer; }
.evolution-guide ul { padding-left: 20px; margin: 10px 0; }
.next-evolution { padding-top: 12px; border-top: 1px solid var(--border); }
.next-evolution img { display: block; margin: 0 auto 8px; }
.next-evolution p { margin: 6px 0 0; }
@media (max-width: 1049px) {
  .animal-progress { display: flex; align-items: center; gap: 14px; padding: 10px 16px; }
  .growth-details { flex: 1; min-width: 0; text-align: left; }
  h2 { justify-content: flex-start; }
  .earned-score { margin: 6px 0; font-size: 25px; }
}
</style>
