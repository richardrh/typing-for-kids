<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadTheme, saveTheme, themes, type ThemeId } from '../themes/catalog'

const route = useRoute()
const router = useRouter()
const theme = ref<ThemeId>(loadTheme())

watch(() => route.query.theme, value => {
  const selected = themes.find(item => item.id === value)
  if (selected) {
    theme.value = selected.id
    saveTheme(selected.id)
  }
}, { immediate: true })

function changeTheme(value: ThemeId) {
  theme.value = value
  saveTheme(value)
  void router.replace({ query: { ...route.query, theme: value } })
}
</script>

<template>
  <div class="app-shell" :data-theme="theme">
    <RouterView v-slot="{ Component }">
      <component :is="Component" :theme="theme" @theme-change="changeTheme" />
    </RouterView>
  </div>
</template>
