<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@tigercat/vue'
import { themes, applyTheme } from '../../../shared/themes'

const currentTheme = ref('default')

const handleThemeChange = (value: string) => {
  currentTheme.value = value
  applyTheme(value)
}

const themeOptions = themes.map(t => ({ label: t.name, value: t.value }))
</script>

<template>
  <div class="flex items-center gap-2 shrink-0">
    <span class="text-sm font-medium text-gray-700 whitespace-nowrap shrink-0">主题：</span>
    <Select 
      :model-value="currentTheme"
      @update:model-value="handleThemeChange"
      :options="themeOptions"
      size="sm"
      class="w-40 max-w-full"
    />
  </div>
</template>
