<script setup lang="ts">
import { PieChart } from '@expcat/tigercat-vue/PieChart'
import type { PieChartDatum } from '@expcat/tigercat-vue'

const data: PieChartDatum[] = [
  { value: 40, label: '产品 A', color: '#5470c6' },
  { value: 28, label: '产品 B', color: '#91cc75' },
  { value: 22, label: '产品 C', color: '#fac858' },
  { value: 15, label: '产品 D', color: '#ee6666' }
]
</script>

<template>
  <PieChart
    :data="data"
    :width="440"
    :height="320"
    show-labels
    label-position="outside"
    hoverable
    selectable
    shadow
    show-legend
    legend-position="right"
    show-tooltip />
</template>
