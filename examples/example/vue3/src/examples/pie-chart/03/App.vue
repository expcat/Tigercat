<script setup lang="ts">
import { PieChart } from '@expcat/tigercat-vue/PieChart'
import type { PieChartDatum } from '@expcat/tigercat-vue'

const data: PieChartDatum[] = [
  { value: 120, label: '移动端' },
  { value: 80, label: '桌面端' },
  { value: 40, label: '平板' },
  { value: 24, label: '其他' }
]
</script>

<template>
  <PieChart
    :data="data"
    :width="420"
    :height="280"
    show-labels
    label-position="inside"
    gradient
    show-legend
    legend-position="right" />
</template>
