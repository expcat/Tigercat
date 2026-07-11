<script setup lang="ts">
import { GaugeChart } from '@expcat/tigercat-vue/GaugeChart'

const segments = [
  { range: [0, 40] as [number, number], color: '#ef4444' },
  { range: [40, 70] as [number, number], color: '#f59e0b' },
  { range: [70, 100] as [number, number], color: '#10b981' }
]
const formatValue = (value: number) => `${value}%`
</script>

<template>
  <GaugeChart
    :value="82"
    :width="320"
    :height="220"
    label="健康指数"
    :segments="segments"
    :arc-width="28"
    :start-angle="180"
    :end-angle="360"
    :value-formatter="formatValue" />
</template>
