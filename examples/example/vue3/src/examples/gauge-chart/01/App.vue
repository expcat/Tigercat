<script setup lang="ts">
import { GaugeChart } from '@expcat/tigercat-vue/GaugeChart'

const segments = [
  { range: [0, 40] as [number, number], color: '#ef4444' },
  { range: [40, 70] as [number, number], color: '#f59e0b' },
  { range: [70, 100] as [number, number], color: '#10b981' }
]
</script>

<template>
  <div class="min-w-0">
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
  </div>
</template>
