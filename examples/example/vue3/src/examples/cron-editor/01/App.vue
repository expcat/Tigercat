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
    <Space direction="vertical" :size="12">
      <CronEditor v-model="cron" />
      <Text>表达式: {{ cron }}</Text>
    </Space>
  </div>
</template>
