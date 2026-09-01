<script setup lang="ts">
import { computed } from 'vue'
import { Select } from '@expcat/tigercat-vue/Select'
import { DEMO_THEME_PRESETS, resolveDemoTheme } from '@demo-shared/themes'
import type { DemoLang } from '@demo-shared/app-config'
import { demoChrome } from '@demo-shared/chrome'
import type { ThemePresetName } from '@expcat/tigercat-core'

const props = defineProps<{ lang?: DemoLang; modelValue: ThemePresetName }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: ThemePresetName): void }>()

const lang = computed<DemoLang>(() => props.lang ?? 'zh-CN')

const handleThemeChange = (value: string | number | (string | number)[] | undefined) => {
  const themeValue = String(Array.isArray(value) ? value[0] : value)
  if (themeValue) emit('update:modelValue', resolveDemoTheme(themeValue))
}

const themeOptions = computed(() =>
  DEMO_THEME_PRESETS.map((preset) => ({
    label: preset.label[lang.value],
    value: preset.value
  }))
)
</script>

<template>
  <div class="flex items-center gap-2 shrink-0">
    <span class="text-sm font-medium text-gray-700 whitespace-nowrap shrink-0 dark:text-gray-200">
      {{ demoChrome(lang).theme }}
    </span>
    <Select
      :model-value="props.modelValue"
      @update:model-value="handleThemeChange"
      :options="themeOptions"
      size="sm"
      class="w-40 max-w-full" />
  </div>
</template>
