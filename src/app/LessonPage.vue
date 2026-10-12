<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { themedLessons } from '../lessons/themed'
import { loadProgress } from '../progress/storage'
import TypingPractice from '../practice/TypingPractice.vue'
import ThemePicker from '../themes/ThemePicker.vue'
import type { ThemeId } from '../themes/catalog'
import NotFoundPage from './NotFoundPage.vue'

const props = defineProps<{ theme: ThemeId }>()
defineEmits<{ 'theme-change': [theme: ThemeId] }>()
const route = useRoute()
const router = useRouter()
const progress = ref(loadProgress())
const lessons = computed(() => themedLessons(props.theme))
const selectedIndex = computed(() => lessons.value.findIndex(item => item.id === route.params.lessonId))
const lesson = computed(() => lessons.value[selectedIndex.value])
const nextLesson = computed(() => lessons.value[selectedIndex.value + 1])

function selectLesson(event: Event) {
  const id = (event.target as HTMLSelectElement).value
  void router.push({ name: 'lesson', params: { lessonId: id }, query: route.query })
}
</script>

<template>
  <template v-if="lesson">
    <header class="site-header">
      <a class="brand" href="/">Typing for Kids</a>
      <label class="lesson-picker">
        <span>Lesson</span>
        <select :value="lesson.id" @change="selectLesson">
          <option v-for="(item, index) in lessons" :key="item.id" :value="item.id">
            {{ index + 1 }}. {{ item.title }}{{ progress.completed.includes(item.id) ? ' — complete' : '' }}
          </option>
        </select>
      </label>
    </header>
    <main>
      <ThemePicker :model-value="theme" @update:model-value="$emit('theme-change', $event)" />
      <TypingPractice :key="`${lesson.id}-${theme}`" :lesson="lesson" :theme="theme" :has-next="Boolean(nextLesson)"
        @complete="progress = loadProgress()"
        @next="router.push({ name: 'lesson', params: { lessonId: nextLesson.id }, query: route.query })" />
    </main>
  </template>
  <NotFoundPage v-else />
</template>
