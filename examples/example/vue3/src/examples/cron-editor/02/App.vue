<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { Text } from '@expcat/tigercat-vue/Text'
import { ref } from 'vue'
import { CronEditor } from '@expcat/tigercat-vue/CronEditor'

const cron = ref('0 9 * * 1-5')
const advancedCron = ref('*/15 9-18 * * 1-5')
const validationText = ref('有效表达式')

function handleAdvancedChange(
  _next: string,
  validation: { valid: boolean; issues: Array<{ message: string }> }
) {
  validationText.value = validation.valid
    ? '有效表达式'
    : (validation.issues[0]?.message ?? '无效表达式')
}
</script>

<template>
  <div class="min-w-0">
    <Space direction="vertical" :size="16">
      <CronEditor v-model="advancedCron" @change="handleAdvancedChange" />
      <Text>校验结果: {{ validationText }}</Text>
      <CronEditor default-value="0 0 * * *" size="sm" />
      <CronEditor model-value="60 * * * *" />
      <CronEditor model-value="0 0 * * *" disabled />
    </Space>
  </div>
</template>
