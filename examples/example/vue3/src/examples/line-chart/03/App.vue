<script setup lang="ts">
import { LineChart } from '@expcat/tigercat-vue/LineChart'
import type { LineChartDatum } from '@expcat/tigercat-vue'

const data: LineChartDatum[] = [
  { x: 'W1', y: 12 },
  { x: 'W2', y: 26 },
  { x: 'W3', y: 18 },
  { x: 'W4', y: 34 }
]

const tooltipFormatter = (datum: LineChartDatum) => `${datum.x}：${datum.y} 单`
</script>

<template>
  <div class="w-full max-w-xl">
    <p class="mb-1 text-sm text-gray-500">
      lineColor + strokeWidth + pointSize + 自定义提示 + responsive
    </p>
    <LineChart
      :data="data"
      :height="220"
      responsive
      line-color="#7c3aed"
      :stroke-width="3"
      :point-size="6"
      show-tooltip
      :tooltip-formatter="tooltipFormatter" />
  </div>
</template>
