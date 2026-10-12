<script setup lang="ts">
import type { AnimalPower } from './catalog'

defineProps<{ power: AnimalPower }>()
const stars = [{ x: 38, y: 37 }, { x: 88, y: 15 }, { x: 174, y: 26 }, { x: 201, y: 73 }, { x: 25, y: 112 }]
</script>

<template>
  <svg class="power-effect" :class="`effect-${power.effect}`" :data-effect="power.effect" :data-strength="power.strength"
    viewBox="0 0 220 180" aria-hidden="true">
    <g v-if="power.effect === 'roar'" fill="none" stroke="#e5a224" stroke-width="4">
      <ellipse v-for="ring in power.strength + 1" :key="ring" class="roar-ring" cx="110" cy="104" :rx="28 + ring * 15" :ry="22 + ring * 12" :style="{ animationDelay: `${(ring - 1) * .09}s` }" />
    </g>
    <g v-else-if="power.effect === 'stomp'">
      <ellipse class="ground-wave" cx="110" cy="161" rx="85" ry="13" fill="none" stroke="#b67524" stroke-width="4" />
      <path class="ground-crack" d="m23 158 29-7 13 13 33-9 18 10 28-12 19 9 35-7" fill="none" stroke="#9b6223" stroke-width="4" stroke-linecap="round" />
      <g v-for="rock in power.strength + 2" :key="rock" class="flying-rock" :style="{ animationDelay: `${rock * .04}s` }">
        <path :d="`m${25 + rock * 29} 152 4-9 9 3-2 9Z`" fill="#bd8757" />
      </g>
      <path v-if="power.strength === 3" class="meteor-trail" d="m160 14-35 48 22-9-20 41 42-52-22 9Z" fill="#edbd35" stroke="#b8791a" stroke-width="2" />
    </g>
    <g v-else-if="power.effect === 'magic'">
      <path v-if="power.strength >= 2" class="rainbow" d="M21 129C14 6 205 6 199 129" fill="none" stroke="#e29bd8" stroke-width="9" />
      <path v-if="power.strength >= 2" class="rainbow" d="M33 129C30 24 190 24 187 129" fill="none" stroke="#8bcbdc" stroke-width="7" />
      <g v-for="(star, index) in stars.slice(0, power.strength + 2)" :key="index" :transform="`translate(${star.x} ${star.y})`">
        <path class="magic-star" :style="{ animationDelay: `${index * .07}s` }" d="m0-12 4 8 9 1-7 6 2 10-8-5-8 5 2-10-7-6 9-1Z" fill="#ffdc6b" stroke="#a27519" stroke-width="1.5" />
      </g>
    </g>
    <g v-else-if="power.effect === 'shield'">
      <path class="shield-shell" d="M110 17 190 49v53c0 34-38 55-80 69-42-14-80-35-80-69V49Z" fill="#72ddd22b" stroke="#279d99" stroke-width="4" />
      <path v-if="power.strength >= 2" class="shield-lines" d="m110 20 38 43-18 60-20 44-20-44-18-60Zm-80 30 42 13 76 0 42-13M33 111l57 12 40 0 57-12" fill="none" stroke="#47bbae" stroke-width="2" />
      <circle v-if="power.strength === 3" class="shield-orbit" cx="110" cy="95" r="83" fill="none" stroke="#72c3ee" stroke-width="5" stroke-dasharray="8 17" />
    </g>
    <g v-else-if="power.effect === 'splash'">
      <path class="ocean-wave" d="M8 146q25-28 51 0t51 0 51 0 51 0v22H8Z" fill="#53b5dd" opacity=".75" />
      <path v-if="power.strength >= 2" class="ocean-wave wave-two" d="M15 128q25-28 48 0t48 0 48 0 48 0" fill="none" stroke="#8cd7ef" stroke-width="7" />
      <g class="water-drops" fill="#79cce9" stroke="#318bac" stroke-width="1.5">
        <path d="m30 80 8 16a9 9 0 1 1-16 0Z" /><path d="m190 68 8 16a9 9 0 1 1-16 0Z" />
        <path v-if="power.strength >= 2" d="m64 27 7 15a8 8 0 1 1-14 0Z" />
        <path v-if="power.strength === 3" d="m153 17 7 15a8 8 0 1 1-14 0Z" />
      </g>
    </g>
    <g v-else-if="power.effect === 'dash'" fill="none" stroke-linecap="round">
      <path v-for="trail in power.strength + 2" :key="trail" class="dash-trail"
        :d="`M${125 - trail * 6} ${45 + trail * 22}h${42 + trail * 8}`"
        stroke="#46b9d2" :stroke-width="power.strength + 2" :style="{ animationDelay: `${trail * .06}s` }" />
      <path class="dash-bow" d="M42 48Q10 95 42 144" stroke="#8edeee" stroke-width="5" />
      <path v-if="power.strength === 3" class="dash-bow" d="M30 39Q-3 95 30 153" stroke="#ead66d" stroke-width="3" />
    </g>
  </svg>
</template>

<style scoped>
.power-effect { position: absolute; z-index: 3; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.roar-ring { transform-origin: 110px 104px; animation: roar 1s ease-out both; }
@keyframes roar { from { transform: scale(.45); opacity: 1; } to { transform: scale(1.18); opacity: 0; } }
.ground-wave { transform-origin: 110px 161px; animation: ground-wave 1s ease-out both; }
@keyframes ground-wave { from { transform: scaleX(.4); opacity: 1; } to { transform: scaleX(1.15); opacity: 0; } }
.ground-crack { animation: reveal .8s ease-out both; }
.flying-rock { animation: rock-hop .75s ease-out both; }
@keyframes rock-hop { 0%,100% { transform: translateY(0); opacity: 0; } 40% { transform: translateY(-23px); opacity: 1; } }
.meteor-trail { animation: meteor .8s ease-out both; }
@keyframes meteor { from { transform: translate(14px,-12px); opacity: .2; } to { transform: translate(-10px,18px); opacity: 0; } }
.magic-star { transform-box: fill-box; transform-origin: center; animation: star-burst .8s ease-out both; }
@keyframes star-burst { 0% { transform: scale(.4) rotate(-12deg); opacity: 0; } 45% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(.9) rotate(12deg); opacity: 0; } }
.rainbow, .shield-shell, .shield-lines { animation: reveal 1.15s ease-in-out both; }
@keyframes reveal { 0%,100% { opacity: .15; } 35%,70% { opacity: 1; } }
.shield-orbit { transform-origin: 110px 95px; animation: orbit 1.15s ease-out both; }
@keyframes orbit { from { transform: rotate(-20deg); opacity: .3; } to { transform: rotate(20deg); opacity: 1; } }
.ocean-wave { animation: wave .95s ease-out both; }
.wave-two { animation-delay: .08s; }
@keyframes wave { from { transform: translateY(14px); opacity: .2; } 50% { opacity: 1; } to { transform: translateY(-8px); opacity: .3; } }
.water-drops { animation: water .9s ease-out both; }
@keyframes water { from { transform: translateY(15px); opacity: .2; } 50% { transform: translateY(-7px); opacity: 1; } to { transform: translateY(5px); opacity: .2; } }
.dash-trail { animation: dash-trail .9s ease-out both; }
.dash-bow { animation: reveal 1.15s ease-in-out both; }
@keyframes dash-trail { from { transform: translateX(-12px); opacity: 1; } to { transform: translateX(18px); opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .power-effect * { animation: none !important; transform: none; opacity: 1; }
}
</style>
