<script setup lang="ts">
import { BarChart } from '@expcat/tigercat-vue/BarChart'
import type { BarChartDatum } from '@expcat/tigercat-vue'

const data: BarChartDatum[] = [
  { x: 'Mon', y: 120 },
  { x: 'Tue', y: 200 },
  { x: 'Wed', y: 150 },
  { x: 'Thu', y: 80 },
  { x: 'Fri', y: 170 }
]
</script>

<template>
  <BarChart :data="data" :width="420" :height="240" />
</template>
