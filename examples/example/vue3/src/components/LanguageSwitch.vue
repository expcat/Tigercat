<script setup lang="ts">
import { Select } from '@expcat/tigercat-vue'
import { DEMO_LANG_OPTIONS, type DemoLang } from '@demo-shared/app-config'

const props = defineProps<{ modelValue: DemoLang }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: DemoLang): void }>()

const options = DEMO_LANG_OPTIONS.map((o) => ({ label: o.label, value: o.value }))

const handleChange = (value: string) => {
  if (value === 'zh-CN' || value === 'en-US') emit('update:modelValue', value)
}
</script>

<template>
  <div class="flex items-center gap-2 shrink-0">
    <span class="text-sm font-medium text-gray-700 whitespace-nowrap shrink-0 dark:text-gray-200">
      Lang:
    </span>
    <Select :model-value="props.modelValue"
            @update:model-value="handleChange"
            :options="options"
            size="sm"
            class="w-28 max-w-full" />
  </div>
</template>
