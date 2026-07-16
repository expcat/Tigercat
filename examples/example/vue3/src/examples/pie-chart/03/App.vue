<script setup lang="ts">
import { PieChart } from '@expcat/tigercat-vue/PieChart'
import type { PieChartDatum } from '@expcat/tigercat-vue'

const data: PieChartDatum[] = [
  { value: 45, label: '移动端' },
  { value: 30, label: '桌面端' },
  { value: 15, label: '平板' },
  { value: 10, label: '其他' }
]

const labelFormatter = (value: number) => `${value}%`
const tooltipFormatter = (datum: PieChartDatum) => `${datum.label}：${datum.value}%`
</script>

<template>
  <div>
    <p class="mb-1 text-sm text-gray-500">colors 调色板 + 内部标签 + 自定义提示 + 渐变</p>
    <PieChart
      :data="data"
      :width="420"
      :height="280"
      :colors="['#2563eb', '#22c55e', '#f59e0b', '#94a3b8']"
      show-labels
      label-position="inside"
      :label-formatter="labelFormatter"
      show-tooltip
      :tooltip-formatter="tooltipFormatter"
      gradient
      show-legend
      legend-position="right" />
  </div>
</template>
