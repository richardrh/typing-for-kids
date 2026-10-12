<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categories } from '../lessons/catalog'
import { themedLessons } from '../lessons/themed'
import { loadProgress } from '../progress/storage'
import { getAnimalStats } from '../progress/progression'
import TypingPractice from '../practice/TypingPractice.vue'
import ThemePicker from '../themes/ThemePicker.vue'
import type { ThemeId } from '../themes/catalog'
import AnimalProgressCard from './AnimalProgressCard.vue'
import CurriculumNav from './CurriculumNav.vue'
import NotFoundPage from './NotFoundPage.vue'

const props = defineProps<{ theme: ThemeId }>()
defineEmits<{ 'theme-change': [theme: ThemeId] }>()
const siteRoot = import.meta.env.BASE_URL
const route = useRoute()
const router = useRouter()
const progress = ref(loadProgress())
const reward = ref('')
const curriculum = useTemplateRef('curriculum')
const lessons = computed(() => themedLessons(props.theme))
const selectedIndex = computed(() => lessons.value.findIndex(item => item.id === route.params.lessonId))
const lesson = computed(() => lessons.value[selectedIndex.value])
const nextLesson = computed(() => lessons.value[selectedIndex.value + 1])
const category = computed(() => categories.find(item => item.id === lesson.value?.categoryId))
const categoryLessons = computed(() => lessons.value.filter(item => item.categoryId === category.value?.id))
const animalProgress = computed(() => progress.value.animals[props.theme])
const stats = computed(() => getAnimalStats(progress.value, props.theme))

function completedLesson() {
  const previousScore = stats.value.score
  progress.value = loadProgress()
  const gained = stats.value.score - previousScore
  reward.value = gained > 0 ? `+${gained} points` : 'Best score saved'
}

watch(() => `${route.params.lessonId}-${props.theme}`, () => { reward.value = '' })
</script>

<template>
  <template v-if="lesson && category">
    <header class="site-header">
      <a class="brand" :href="siteRoot">Typing for Kids</a>
      <button class="skills-shortcut" type="button" aria-controls="keyboard-skills" @click="curriculum?.open()">Keyboard skills</button>
    </header>
    <main class="learning-main">
      <ThemePicker :model-value="theme" @update:model-value="$emit('theme-change', $event)" />
      <div class="learning-layout">
        <aside class="learning-sidebar">
          <AnimalProgressCard :theme="theme" :stats="stats" />
          <CurriculumNav ref="curriculum" id="keyboard-skills" :current-category="category.id" :completed="animalProgress.completed" />
        </aside>
        <div class="lesson-workspace">
          <nav class="lesson-steps" :aria-label="`${category.title} lessons`">
            <RouterLink v-for="(item, index) in categoryLessons" :key="item.id"
              :to="{ name: 'lesson', params: { lessonId: item.id }, query: route.query }"
              class="lesson-step" :class="{ selected: lesson.id === item.id, completed: animalProgress.completed.includes(item.id) }"
              :aria-current="lesson.id === item.id ? 'step' : undefined">
              <span class="step-number">{{ index + 1 }}</span>
              <span>{{ item.title }}</span>
              <span v-if="animalProgress.completed.includes(item.id)" class="step-check" aria-label="complete">✓</span>
            </RouterLink>
          </nav>
          <p v-if="reward" class="lesson-reward" role="status">{{ reward }}</p>
          <TypingPractice :key="`${lesson.id}-${theme}`" :lesson="lesson" :theme="theme" :has-next="Boolean(nextLesson)"
            @complete="completedLesson"
            @next="router.push({ name: 'lesson', params: { lessonId: nextLesson.id }, query: route.query })" />
        </div>
      </div>
    </main>
  </template>
  <NotFoundPage v-else />
</template>
