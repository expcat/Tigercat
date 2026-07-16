<script setup lang="ts">
import { RadarChart } from '@expcat/tigercat-vue/RadarChart'
import type { RadarChartDatum } from '@expcat/tigercat-vue'

const data: RadarChartDatum[] = [
  { label: '速度', value: 80 },
  { label: '稳定', value: 65 },
  { label: '设计', value: 90 },
  { label: '续航', value: 70 },
  { label: '价格', value: 50 }
]

const levelLabelFormatter = (value: number) => `${value}分`
const labelFormatter = (datum: RadarChartDatum) => `${datum.label} ${datum.value}`
const tooltipFormatter = (datum: RadarChartDatum) => `${datum.label}：${datum.value} 分`
</script>

<template>
  <div>
    <p class="mb-1 text-sm text-gray-500">labelFormatter + levelLabelFormatter + 自定义提示</p>
    <RadarChart
      :data="data"
      :width="380"
      :height="300"
      :max-value="100"
      show-level-labels
      :level-label-formatter="levelLabelFormatter"
      :label-formatter="labelFormatter"
      :label-offset="18"
      show-tooltip
      :tooltip-formatter="tooltipFormatter" />
  </div>
</template>
