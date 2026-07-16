<script setup lang="ts">
import { HeatmapChart } from '@expcat/tigercat-vue/HeatmapChart'

const days = ['周一', '周二', '周三', '周四', '周五']
const periods = ['上午', '下午', '晚上']
const values = [18, 42, 65, 31, 78, 54, 27, 88, 46, 63, 35, 71, 58, 24, 92]
const data = days.flatMap((day, dayIndex) =>
  periods.map((period, periodIndex) => ({
    x: day,
    y: period,
    value: values[dayIndex * periods.length + periodIndex] ?? 0
  }))
)

const percent = (value: number) => `${value}%`
</script>

<template>
  <div>
    <p class="mb-1 text-sm text-gray-500">valueFormatter + cellGap/cellRadius + colorSpace="oklch"</p>
    <HeatmapChart
      :data="data"
      :x-labels="days"
      :y-labels="periods"
      :width="500"
      :height="260"
      show-values
      :value-formatter="percent"
      :cell-gap="4"
      :cell-radius="6"
      color-space="oklch"
      min-color="#e0f2fe"
      max-color="#1d4ed8"
      show-tooltip />
  </div>
</template>
