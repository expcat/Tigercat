<script setup lang="ts">
import { ScatterChart } from '@expcat/tigercat-vue/ScatterChart'
import type { ScatterChartDatum } from '@expcat/tigercat-vue'

const data: ScatterChartDatum[] = [
  { x: 10, y: 25, size: 8, color: '#2563eb', label: 'A' },
  { x: 25, y: 60, size: 12, color: '#22c55e', label: 'B' },
  { x: 40, y: 35, size: 10, color: '#f59e0b', label: 'C' },
  { x: 55, y: 75, size: 14, color: '#ef4444', label: 'D' }
]
</script>

<template>
  <ScatterChart
    :data="data"
    :width="420"
    :height="260"
    include-zero
    grid-line-style="dotted"
    point-style="diamond"
    gradient
    :point-border-width="1.5"
    animated
    hoverable
    selectable
    show-tooltip />
</template>
