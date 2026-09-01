<script setup lang="ts">
import { PieChart } from '@expcat/tigercat-vue/PieChart'
import type { PieChartDatum } from '@expcat/tigercat-vue'

const data: PieChartDatum[] = [
  { value: 40, label: '产品 A' },
  { value: 28, label: '产品 B' },
  { value: 22, label: '产品 C' },
  { value: 15, label: '产品 D' }
]
</script>

<template>
  <PieChart :data="data" :width="440" :height="320" />
</template>
