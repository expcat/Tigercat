<script setup lang="ts">
import { ref } from 'vue'
import { ColorSwatch, Space, Text } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const color = ref('#3b82f6')
const brandColor = ref('#2563eb')
const statusColor = ref('#16a34a')

const brandGroups = [
  {
    label: 'Brand',
    colors: [
      { value: '#0f172a', label: 'Ink' },
      { value: '#2563eb', label: 'Blue' },
      { value: '#0891b2', label: 'Cyan' },
      { value: '#059669', label: 'Green' }
    ]
  },
  {
    label: 'Neutral',
    colors: ['#f8fafc', '#cbd5e1', '#64748b', '#1e293b']
  }
]

const basicScriptSnippet = `import { ref } from 'vue'

const color = ref('#3b82f6')`

const basicSnippet = `<ColorSwatch v-model="color" />
<Text>选中颜色: {{ color }}</Text>`

const groupSnippet = `<ColorSwatch v-model="brandColor" :groups="brandGroups" :columns="4" />

<ColorSwatch
  v-model="statusColor"
  :colors="[
    { value: '#16a34a', label: 'Success' },
    { value: '#f59e0b', label: 'Warning' },
    { value: '#dc2626', label: 'Danger', disabled: true }
  ]" />

<ColorSwatch model-value="#64748b" size="sm" disabled />`
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <h1 class="text-3xl font-bold mb-2">ColorSwatch 色板选择器</h1>
    <p class="text-gray-500 mb-8">用于从预设色板或自定义色组中快速选择颜色。</p>

    <DemoBlock title="基本用法" :code="basicSnippet" :script="basicScriptSnippet">
      <Space :size="16" align="center">
        <ColorSwatch v-model="color" />
        <Text>选中颜色: {{ color }}</Text>
      </Space>
    </DemoBlock>

    <DemoBlock
      title="自定义色组"
      description="groups 支持分组标签，colors 支持禁用与自定义无障碍标签。"
      :code="groupSnippet">
      <Space direction="vertical" :size="16">
        <ColorSwatch v-model="brandColor" :groups="brandGroups" :columns="4" />
        <ColorSwatch
          v-model="statusColor"
          :colors="[
            { value: '#16a34a', label: 'Success' },
            { value: '#f59e0b', label: 'Warning' },
            { value: '#dc2626', label: 'Danger', disabled: true }
          ]" />
        <Space :size="12" align="center">
          <ColorSwatch model-value="#64748b" size="sm" disabled />
          <Text>禁用状态</Text>
        </Space>
      </Space>
    </DemoBlock>
  </div>
</template>
