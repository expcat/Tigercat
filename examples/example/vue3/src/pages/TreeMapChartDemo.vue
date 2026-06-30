<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <h1 class="text-3xl font-bold mb-2">TreeMapChart 矩形树图</h1>
    <p class="text-gray-500 mb-8">以嵌套矩形展示层级数据的占比关系。</p>

    <DemoBlock
      title="组合展示"
      description="合并展示基础用法、层级数据、自定义样式，减少重复示例块。"
      :code="fullPageSnippet">
      <div class="space-y-6">
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">扁平数据，自动分配颜色</p>
          <TreeMapChart :data="flatData" :width="500" :height="300" hoverable show-legend />
        </section>
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">层级数据</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">children 嵌套结构</p>
          <TreeMapChart :data="nestedData" :width="500" :height="300" hoverable />
        </section>
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义样式</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">gap、showLabels、颜色</p>
          <TreeMapChart
            :data="flatData"
            :width="500"
            :height="300"
            :gap="4"
            :show-labels="true"
            :colors="['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']"
            selectable />
        </section>
      </div>
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { TreeMapChart } from '@expcat/tigercat-vue/TreeMapChart'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './TreeMapChartDemo.vue?raw'

const flatData = [
  { label: '技术部', value: 40 },
  { label: '产品部', value: 25 },
  { label: '设计部', value: 15 },
  { label: '市场部', value: 12 },
  { label: '行政部', value: 8 }
]

const nestedData = [
  {
    label: '前端',
    value: 50,
    children: [
      { label: 'Vue', value: 30 },
      { label: 'React', value: 20 }
    ]
  },
  {
    label: '后端',
    value: 30,
    children: [
      { label: 'Node', value: 15 },
      { label: 'Go', value: 15 }
    ]
  },
  { label: '运维', value: 20 }
]
</script>
