<script setup lang="ts">
import { getTheme, type ThemeId } from './catalog'

defineProps<{ theme: ThemeId }>()
</script>

<template>
  <img class="mascot" :src="getTheme(theme).asset" alt="" aria-hidden="true">
</template>
