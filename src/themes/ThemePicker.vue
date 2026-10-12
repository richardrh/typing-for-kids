<script setup lang="ts">
import { themes, type ThemeId } from './catalog'

defineProps<{ modelValue: ThemeId }>()
const emit = defineEmits<{ 'update:modelValue': [value: ThemeId] }>()
</script>

<template>
  <div class="theme-picker" aria-label="Choose a theme">
    <button v-for="theme in themes" :key="theme.id" type="button" :aria-label="theme.label" :aria-pressed="modelValue === theme.id" @click="emit('update:modelValue', theme.id)">
      <img :src="theme.asset" alt="" aria-hidden="true">
      <span>{{ theme.label }}</span>
    </button>
  </div>
</template>
