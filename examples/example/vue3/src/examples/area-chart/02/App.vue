<script setup lang="ts">
import { AreaChart } from '@expcat/tigercat-vue/AreaChart'
import type { LineChartDatum } from '@expcat/tigercat-vue'

const data: LineChartDatum[] = [
  { x: 'Jan', y: 40 },
  { x: 'Feb', y: 55 },
  { x: 'Mar', y: 60 },
  { x: 'Apr', y: 70 },
  { x: 'May', y: 65 }
]
</script>

<template>
  <div class="space-y-6">
    <div>
      <p class="mb-1 text-sm text-gray-500">data 单系列 + areaColor + fillOpacity</p>
      <AreaChart :data="data" :width="420" :height="200" area-color="#0891b2" :fill-opacity="0.35" />
    </div>
    <div>
      <p class="mb-1 text-sm text-gray-500">showPoints=false + includeZero=false（紧凑基线）</p>
      <AreaChart
        :data="data"
        :width="420"
        :height="200"
        :show-points="false"
        :include-zero="false" />
    </div>
  </div>
</template>
