<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <h1 class="text-3xl font-bold mb-2">GaugeChart 仪表盘</h1>
    <p class="text-gray-500 mb-8">环形仪表盘，展示单一指标的进度或状态。</p>

    <DemoBlock
      title="组合展示"
      description="合并展示基础用法、颜色分段、自定义弧形，减少重复示例块。"
      :code="fullPageSnippet">
      <div class="space-y-6">
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">value、min、max</p>
          <div class="flex gap-8 items-end">
            <GaugeChart :value="72" label="完成率" />
            <GaugeChart :value="35" :max="50" label="得分" />
          </div>
        </section>
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">颜色分段</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">segments 按区间着色，自定义格式化</p>
          <GaugeChart
            :value="82"
            :width="320"
            :height="220"
            label="健康指数"
            :segments="segments"
            :value-formatter="(v) => v + '%'" />
        </section>
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义弧形</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">arcWidth、startAngle、endAngle</p>
          <GaugeChart
            :value="60"
            :width="280"
            :height="200"
            :arc-width="30"
            :start-angle="180"
            :end-angle="360"
            :show-ticks="false"
            color="#10b981" />
        </section>
      </div>
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { GaugeChart } from '@expcat/tigercat-vue/GaugeChart'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './GaugeChartDemo.vue?raw'

const segments = [
  { range: [0, 40] as [number, number], color: '#ef4444' },
  { range: [40, 70] as [number, number], color: '#f59e0b' },
  { range: [70, 100] as [number, number], color: '#10b981' }
]
</script>
