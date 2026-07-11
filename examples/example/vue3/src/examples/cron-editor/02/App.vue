<script setup lang="ts">
import { ref } from 'vue'
import type { CronValidationResult } from '@expcat/tigercat-core'
import { CronEditor } from '@expcat/tigercat-vue/CronEditor'

const value = ref('*/15 9-18 * * 1-5')
const validation = ref('有效表达式')
const presets = [
  { label: '每天上午九点', value: '0 9 * * *' },
  { label: '工作日每十五分钟', value: '*/15 9-18 * * 1-5' }
]

const handleChange = (_value: string, result: CronValidationResult) => {
  validation.value = result.valid ? '有效表达式' : (result.issues[0]?.message ?? '无效表达式')
}
</script>

<template>
  <div class="space-y-2">
    <CronEditor
      v-model="value"
      :presets="presets"
      size="lg"
      aria-label="编辑并校验执行计划"
      @change="handleChange" />
    <p class="text-sm text-gray-600 dark:text-gray-300">{{ validation }}</p>
  </div>
</template>
