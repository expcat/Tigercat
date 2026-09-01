<script setup lang="ts">
import { AreaChart } from '@expcat/tigercat-vue/AreaChart'
import type { AreaChartSeries, LineChartDatum } from '@expcat/tigercat-vue'

const data: LineChartDatum[] = [
  { x: 'Jan', y: 40 },
  { x: 'Feb', y: 55 },
  { x: 'Mar', y: 60 },
  { x: 'Apr', y: 70 },
  { x: 'May', y: 65 }
]

const stacked: AreaChartSeries[] = [
  {
    name: '线上',
    data: [
      { x: 'Jan', y: 4 },
      { x: 'Feb', y: 8 },
      { x: 'Mar', y: 3 }
    ]
  },
  {
    name: '门店',
    data: [
      { x: 'Jan', y: 2 },
      { x: 'Mar', y: 6 },
      { x: 'Apr', y: -1 }
    ]
  }
]
</script>

<template>
  <div class="space-y-6">
    <div>
      <p class="mb-1 text-sm text-gray-500">data 单系列 + areaColor + fillOpacity</p>
      <AreaChart
        :data="data"
        :width="420"
        :height="200"
        area-color="#0891b2"
        :fill-opacity="0.35" />
    </div>
    <div>
      <p class="mb-1 text-sm text-gray-500">
        stacked + monotone：缺的 x 补 0，负值单独堆在零线下方
      </p>
      <AreaChart
        :series="stacked"
        :width="420"
        :height="220"
        stacked
        curve="monotone"
        show-legend />
    </div>
  </div>
</template>
