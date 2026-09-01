<script setup lang="ts">
import { computed } from 'vue'
import { Switch } from '@expcat/tigercat-vue/Switch'
import type { DemoLang } from '@demo-shared/app-config'
import { demoChrome } from '@demo-shared/chrome'

const props = defineProps<{ lang?: DemoLang; modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

const lang = computed<DemoLang>(() => props.lang ?? 'zh-CN')
</script>

<template>
  <div class="flex items-center gap-2 shrink-0">
    <span class="text-sm font-medium text-gray-700 whitespace-nowrap shrink-0 dark:text-gray-200">
      {{ demoChrome(lang).dark }}
    </span>
    <Switch
      :model-value="props.modelValue"
      size="sm"
      @update:model-value="(next: boolean) => emit('update:modelValue', next)" />
  </div>
</template>
