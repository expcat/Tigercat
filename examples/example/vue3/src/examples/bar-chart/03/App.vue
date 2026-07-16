<script setup lang="ts">
import { BarChart } from '@expcat/tigercat-vue/BarChart'
import type { BarChartDatum } from '@expcat/tigercat-vue'

const data: BarChartDatum[] = [
  { x: 'A', y: 45 },
  { x: 'B', y: 72 },
  { x: 'C', y: 38 },
  { x: 'D', y: 60 }
]
</script>

<template>
  <div class="space-y-6">
    <div>
      <p class="mb-1 text-sm text-gray-500">colors 循环配色 + 坐标轴标题</p>
      <BarChart
        :data="data"
        :width="420"
        :height="220"
        :colors="['#2563eb', '#22c55e', '#f59e0b', '#ef4444']"
        x-axis-label="分组"
        y-axis-label="数量" />
    </div>
    <div>
      <p class="mb-1 text-sm text-gray-500">barColor 单色 + barMaxWidth + barPaddingInner + 无网格</p>
      <BarChart
        :data="data"
        :width="420"
        :height="200"
        bar-color="#0891b2"
        :bar-max-width="28"
        :bar-padding-inner="0.5"
        :show-grid="false" />
    </div>
  </div>
</template>
