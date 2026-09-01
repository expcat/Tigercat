<script setup lang="ts">
import { computed } from 'vue'
import { Select } from '@expcat/tigercat-vue/Select'
import { DEMO_THEME_PRESETS } from '@demo-shared/themes'
import type { DemoLang } from '@demo-shared/app-config'

const props = defineProps<{ lang?: DemoLang; modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const lang = computed<DemoLang>(() => props.lang ?? 'zh-CN')

const handleThemeChange = (value: string | number | (string | number)[] | undefined) => {
  const themeValue = String(Array.isArray(value) ? value[0] : value)
  if (themeValue) emit('update:modelValue', themeValue)
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
      {{ lang === 'zh-CN' ? '主题：' : 'Theme:' }}
    </span>
    <Select
      :model-value="props.modelValue"
      @update:model-value="handleThemeChange"
      :options="themeOptions"
      size="sm"
      class="w-40 max-w-full" />
  </div>
</template>
