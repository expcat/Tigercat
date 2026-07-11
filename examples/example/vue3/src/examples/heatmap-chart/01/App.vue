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
</script>

<template>
  <HeatmapChart
    :data="data"
    :x-labels="days"
    :y-labels="periods"
    :width="500"
    :height="280"
    show-values
    min-color="#fef3c7"
    max-color="#dc2626"
    :cell-radius="4"
    hoverable
    selectable />
</template>
