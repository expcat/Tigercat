<script setup lang="ts">
import { BarChart } from '@expcat/tigercat-vue/BarChart'
import type { BarChartDatum } from '@expcat/tigercat-vue'

const data: BarChartDatum[] = [
  { x: '一月', y: 3200 },
  { x: '二月', y: 4100 },
  { x: '三月', y: 2800 },
  { x: '四月', y: 5200 }
]

const valueLabelFormatter = (datum: BarChartDatum) => `¥${(datum.y / 1000).toFixed(1)}k`
const tooltipFormatter = (datum: BarChartDatum) => `${datum.x}：${datum.y} 元`
</script>

<template>
  <div class="space-y-6">
    <div>
      <p class="mb-1 text-sm text-gray-500">valueLabelPosition="top" + 自定义标签格式</p>
      <BarChart
        :data="data"
        :width="420"
        :height="220"
        show-value-labels
        value-label-position="top"
        :value-label-formatter="valueLabelFormatter" />
    </div>
    <div>
      <p class="mb-1 text-sm text-gray-500">valueLabelPosition="inside" + 自定义提示</p>
      <BarChart
        :data="data"
        :width="420"
        :height="220"
        show-value-labels
        value-label-position="inside"
        show-tooltip
        :tooltip-formatter="tooltipFormatter" />
    </div>
  </div>
</template>
