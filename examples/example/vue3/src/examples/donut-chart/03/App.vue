<script setup lang="ts">
import { DonutChart } from '@expcat/tigercat-vue/DonutChart'
import type { PieChartDatum } from '@expcat/tigercat-vue'

const data: PieChartDatum[] = [
  { value: 335, label: '直接访问' },
  { value: 310, label: '邮件营销' },
  { value: 234, label: '联盟广告' },
  { value: 135, label: '视频广告' }
]

const total = data.reduce((sum, item) => sum + item.value, 0)
const percent = (value: number) => `${Math.round((value / total) * 100)}%`
const labelFormatter = (value: number) => percent(value)
const tooltipFormatter = (datum: PieChartDatum) =>
  `${datum.label}：${datum.value}（${percent(datum.value)}）`
</script>

<template>
  <div>
    <p class="mb-1 text-sm text-gray-500">外部标签 + 引导线 + 自定义标签/提示格式</p>
    <DonutChart
      :data="data"
      :width="420"
      :height="280"
      :inner-radius-ratio="0.6"
      show-labels
      label-position="outside"
      :label-formatter="labelFormatter"
      show-tooltip
      :tooltip-formatter="tooltipFormatter"
      :center-value="percent(data[0].value)"
      center-label="直接访问占比" />
  </div>
</template>
