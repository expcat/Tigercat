<script setup lang="ts">
import { ref } from 'vue'
import { Segmented, Space, Text } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const selected = ref<string | number>('daily')

const basicSnippet = `<Segmented
  v-model="selected"
  :options="[
    { label: '日', value: 'daily' },
    { label: '周', value: 'weekly' },
    { label: '月', value: 'monthly' },
    { label: '年', value: 'yearly' }
  ]"
/>`

const sizeSnippet = `<Space direction="vertical" :size="12">
  <Segmented size="sm" :options="options" :model-value="'a'" />
  <Segmented size="md" :options="options" :model-value="'a'" />
  <Segmented size="lg" :options="options" :model-value="'a'" />
  <Segmented block :options="options" :model-value="'a'" />
</Space>`

const disabledSnippet = `<Segmented
  :options="[
    { label: '可选A', value: 'a' },
    { label: '禁用B', value: 'b', disabled: true },
    { label: '可选C', value: 'c' }
  ]"
  :model-value="'a'"
/>
<Segmented disabled :options="options" :model-value="'a'" />`

const simpleOpts = [
  { label: '选项 A', value: 'a' },
  { label: '选项 B', value: 'b' },
  { label: '选项 C', value: 'c' }
]
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-2">Segmented 分段控制器</h1>
    <p class="text-gray-500 mb-8">分段选择器，类似 iOS UISegmentedControl。</p>

    <DemoBlock title="基本用法" description="v-model 双向绑定选中值" :code="basicSnippet">
      <Space direction="vertical" :size="12">
        <Segmented
          v-model="selected"
          :options="[
            { label: '日', value: 'daily' },
            { label: '周', value: 'weekly' },
            { label: '月', value: 'monthly' },
            { label: '年', value: 'yearly' }
          ]" />
        <Text>当前选中: {{ selected }}</Text>
      </Space>
    </DemoBlock>

    <DemoBlock title="尺寸与通栏" description="sm/md/lg 尺寸，block 撑满宽度" :code="sizeSnippet">
      <Space direction="vertical" :size="12" class="w-full">
        <Segmented size="sm" :options="simpleOpts" model-value="a" />
        <Segmented size="md" :options="simpleOpts" model-value="a" />
        <Segmented size="lg" :options="simpleOpts" model-value="a" />
        <Segmented block :options="simpleOpts" model-value="a" />
      </Space>
    </DemoBlock>

    <DemoBlock title="禁用" description="整体禁用 或 单个选项禁用" :code="disabledSnippet">
      <Space direction="vertical" :size="12">
        <Segmented
          :options="[
            { label: '可选A', value: 'a' },
            { label: '禁用B', value: 'b', disabled: true },
            { label: '可选C', value: 'c' }
          ]"
          model-value="a" />
        <Segmented disabled :options="simpleOpts" model-value="a" />
      </Space>
    </DemoBlock>
  </div>
</template>
