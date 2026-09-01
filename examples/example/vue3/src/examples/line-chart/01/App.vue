<script setup lang="ts">
import { LineChart } from '@expcat/tigercat-vue/LineChart'
import type { LineChartDatum } from '@expcat/tigercat-vue'

const data: LineChartDatum[] = [
  { x: 'Q1', y: 120 },
  { x: 'Q2', y: 180 },
  { x: 'Q3', y: 150 },
  { x: 'Q4', y: 200 }
]
</script>

<template>
  <LineChart :data="data" :width="420" :height="240" />
</template>
