<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Select } from '@tigercat/vue'
import { themes, applyTheme } from '@demo-shared/themes'
import { getStoredTheme, setStoredTheme } from '@demo-shared/prefs'
import type { DemoLang } from '@demo-shared/app-config'

const props = defineProps<{ lang?: DemoLang }>()

const lang = computed<DemoLang>(() => props.lang ?? 'zh-CN')

const themeNameByValue: Record<string, Record<DemoLang, string>> = {
  default: { 'zh-CN': '默认蓝色', 'en-US': 'Default Blue' },
  green: { 'zh-CN': '绿色主题', 'en-US': 'Green' },
  purple: { 'zh-CN': '紫色主题', 'en-US': 'Purple' },
  orange: { 'zh-CN': '橙色主题', 'en-US': 'Orange' },
  pink: { 'zh-CN': '粉色主题', 'en-US': 'Pink' },
}

const currentTheme = ref(getStoredTheme())

const handleThemeChange = (value: string) => {
  currentTheme.value = value
  setStoredTheme(value)
  applyTheme(value)
}

const themeOptions = computed(() =>
  themes.map((t) => ({
    label: themeNameByValue[t.value]?.[lang.value] ?? t.name,
    value: t.value,
  }))
)

onMounted(() => {
  applyTheme(currentTheme.value)
})
</script>

<template>
  <div class="flex items-center gap-2 shrink-0">
    <span class="text-sm font-medium text-gray-700 whitespace-nowrap shrink-0 dark:text-gray-200">
      {{ lang === 'zh-CN' ? '主题：' : 'Theme:' }}
    </span>
    <Select :model-value="currentTheme" @update:model-value="handleThemeChange" :options="themeOptions" size="sm"
      class="w-40 max-w-full" />
  </div>
</template>
