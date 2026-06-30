<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <h1 class="text-3xl font-bold mb-2">SunburstChart 旭日图</h1>
    <p class="text-gray-500 mb-8">以多层同心弧展示层级数据结构。</p>

    <DemoBlock
      title="组合展示"
      description="合并展示基础用法、内径 & 标签、自定义颜色，减少重复示例块。"
      :code="fullPageSnippet">
      <div class="space-y-6">
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">层级数据自动展开为多层弧</p>
          <SunburstChart :data="sunburstData" :width="360" :height="360" hoverable show-legend />
        </section>
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">内径 & 标签</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">innerRadiusRatio 创建甜甜圈效果</p>
          <SunburstChart
            :data="sunburstData"
            :width="360"
            :height="360"
            :inner-radius-ratio="0.3"
            show-labels
            hoverable
            selectable />
        </section>
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义颜色</h3>
          <SunburstChart
            :data="sunburstData"
            :width="360"
            :height="360"
            :colors="['#6366f1', '#ec4899', '#14b8a6', '#f59e0b']"
            hoverable />
        </section>
      </div>
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { SunburstChart } from '@expcat/tigercat-vue/SunburstChart'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './SunburstChartDemo.vue?raw'

const sunburstData = [
  {
    label: '亚洲',
    value: 60,
    children: [
      { label: '中国', value: 35 },
      { label: '日本', value: 15 },
      { label: '印度', value: 10 }
    ]
  },
  {
    label: '欧洲',
    value: 25,
    children: [
      { label: '德国', value: 12 },
      { label: '法国', value: 8 },
      { label: '英国', value: 5 }
    ]
  },
  { label: '美洲', value: 15 }
]
</script>
