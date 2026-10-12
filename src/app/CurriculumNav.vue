<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useRoute } from 'vue-router'
import { categories, lessons } from '../lessons/catalog'
import type { CategoryId } from '../lessons/types'

const props = defineProps<{ currentCategory: CategoryId; completed: readonly string[] }>()
const route = useRoute()
const expanded = ref(window.matchMedia('(min-width: 1050px)').matches)
const menu = ref<HTMLDetailsElement | null>(null)
const items = computed(() => categories.map(category => {
  const entries = lessons.filter(lesson => lesson.categoryId === category.id)
  return {
    ...category,
    total: entries.length,
    completed: entries.filter(lesson => props.completed.includes(lesson.id)).length,
    target: entries.find(lesson => !props.completed.includes(lesson.id)) ?? entries[0],
  }
}))

function closeOnSmallScreen() {
  if (!window.matchMedia('(min-width: 1050px)').matches) expanded.value = false
}

function open() {
  expanded.value = true
  nextTick(() => {
    menu.value?.querySelector('summary')?.focus()
    menu.value?.scrollIntoView({ block: 'nearest' })
  })
}
defineExpose({ open })
</script>

<template>
  <details ref="menu" class="curriculum-nav" :open="expanded" @toggle="expanded = ($event.target as HTMLDetailsElement).open">
    <summary>Keyboard skills</summary>
    <nav aria-label="Keyboard skill categories">
      <RouterLink v-for="category in items" :key="category.id"
        class="category-link" :class="{ selected: currentCategory === category.id }"
        :aria-current="currentCategory === category.id ? 'location' : undefined"
        :to="{ name: 'lesson', params: { lessonId: category.target.id }, query: route.query }"
        @click="closeOnSmallScreen">
        <span class="category-number" aria-hidden="true">{{ category.level }}</span>
        <span class="category-title">{{ category.title }}</span>
        <span class="category-completion" :aria-label="`${category.completed} of ${category.total} lessons complete`">{{ category.completed }}/{{ category.total }}</span>
      </RouterLink>
    </nav>
  </details>
</template>

<style scoped>
.curriculum-nav { border: 2px solid var(--border); border-radius: 20px; background: rgba(255,255,255,.96); box-shadow: 0 5px 0 rgba(45,75,80,.12); overflow: clip; }
summary { padding: 18px; font-size: 20px; font-weight: 800; cursor: pointer; }
nav { display: grid; gap: 5px; padding: 0 10px 12px; }
.category-link { display: grid; grid-template-columns: 28px minmax(0,1fr) auto; align-items: center; gap: 9px; min-height: 54px; padding: 10px 7px; border: 2px solid transparent; border-radius: 12px; color: #243343; text-decoration: none; }
.category-link:hover { background: var(--soft); }
.category-link.selected { background: var(--soft); border-color: var(--accent); }
.category-number { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 9px; background: var(--soft); color: var(--accent-deep); font-weight: 800; }
.category-title { font-size: 17px; font-weight: 700; }
.category-completion { font-size: 16px; color: #435567; font-variant-numeric: tabular-nums; }
@media (min-width: 650px) and (max-width: 1049px) { nav { grid-template-columns: repeat(2, minmax(0,1fr)); } }
</style>
