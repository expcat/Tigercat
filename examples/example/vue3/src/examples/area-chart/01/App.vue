<script setup lang="ts">
import { AreaChart } from '@expcat/tigercat-vue/AreaChart'
import type { LineChartDatum } from '@expcat/tigercat-vue'

const data: LineChartDatum[] = [
  { x: 'Jan', y: 40 },
  { x: 'Feb', y: 55 },
  { x: 'Mar', y: 60 },
  { x: 'Apr', y: 70 }
]
</script>

<template>
  <AreaChart :data="data" :width="420" :height="240" />
</template>
