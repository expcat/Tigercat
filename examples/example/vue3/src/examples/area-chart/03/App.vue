<script setup lang="ts">
import { AreaChart } from '@expcat/tigercat-vue/AreaChart'
import type { AreaChartSeries } from '@expcat/tigercat-vue'

const series: AreaChartSeries[] = [
  {
    name: '移动端',
    data: [
      { x: 'Q1', y: 40 },
      { x: 'Q2', y: 55 },
      { x: 'Q3', y: 60 },
      { x: 'Q4', y: 70 }
    ]
  },
  {
    name: '桌面端',
    data: [
      { x: 'Q1', y: 30 },
      { x: 'Q2', y: 35 },
      { x: 'Q3', y: 40 },
      { x: 'Q4', y: 45 }
    ]
  }
]

const percent = (value: number | string) => `${value}%`
</script>

<template>
  <div class="space-y-6">
    <div>
      <p class="mb-1 text-sm text-gray-500">非堆叠多系列 + 坐标轴标题 + 刻度格式化</p>
      <AreaChart
        :series="series"
        :width="420"
        :height="220"
        x-axis-label="季度"
        y-axis-label="占比"
        :y-ticks="4"
        :y-tick-format="percent"
        grid-line-style="dotted"
        show-legend />
    </div>
    <div>
      <p class="mb-1 text-sm text-gray-500">showGrid=false + showAxis=false（迷你趋势）</p>
      <AreaChart
        :series="series"
        :width="420"
        :height="120"
        :show-grid="false"
        :show-axis="false"
        gradient />
    </div>
  </div>
</template>
