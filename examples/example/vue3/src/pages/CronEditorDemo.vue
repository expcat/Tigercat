<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { Text } from '@expcat/tigercat-vue/Text'
import { ref } from 'vue'
import { CronEditor } from '@expcat/tigercat-vue/CronEditor'
import DemoBlock from '../components/DemoBlock.vue'

const cron = ref('0 9 * * 1-5')
const advancedCron = ref('*/15 9-18 * * 1-5')
const validationText = ref('有效表达式')

const basicScriptSnippet = `import { ref } from 'vue'

const cron = ref('0 9 * * 1-5')`

const basicSnippet = `<CronEditor v-model="cron" />
<Text>表达式: {{ cron }}</Text>`

const featureSnippet = `<CronEditor
  v-model="advancedCron"
  @change="(_, validation) => {
    validationText = validation.valid ? '有效表达式' : validation.issues[0]?.message ?? '无效表达式'
  }" />

<CronEditor default-value="0 0 * * *" size="sm" />
<CronEditor model-value="60 * * * *" />
<CronEditor model-value="0 0 * * *" disabled />`

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
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <h1 class="text-3xl font-bold mb-2">CronEditor Cron 编辑器</h1>
    <p class="text-gray-500 mb-8">用于编辑和校验 5 段 Cron 表达式。</p>

    <DemoBlock title="基本用法" :code="basicSnippet" :script="basicScriptSnippet">
      <Space direction="vertical" :size="12">
        <CronEditor v-model="cron" />
        <Text>表达式: {{ cron }}</Text>
      </Space>
    </DemoBlock>

    <DemoBlock
      title="预设、校验与状态"
      description="支持预设选择、字段可视化编辑和错误提示。"
      :code="featureSnippet">
      <Space direction="vertical" :size="16">
        <CronEditor v-model="advancedCron" @change="handleAdvancedChange" />
        <Text>校验结果: {{ validationText }}</Text>
        <CronEditor default-value="0 0 * * *" size="sm" />
        <CronEditor model-value="60 * * * *" />
        <CronEditor model-value="0 0 * * *" disabled />
      </Space>
    </DemoBlock>
  </div>
</template>
