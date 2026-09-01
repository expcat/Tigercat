<script setup lang="ts">
import { ScatterChart } from '@expcat/tigercat-vue/ScatterChart'
import type { ScatterChartDatum } from '@expcat/tigercat-vue'

const data: ScatterChartDatum[] = [
  { x: 12, y: 2400, label: '华东', size: 120, color: '#2563eb' },
  { x: 28, y: 3600, label: '华南', size: 80, color: '#22c55e' },
  { x: 45, y: 2900, label: '华北', size: 200, color: '#f59e0b' },
  { x: 62, y: 4800, label: '西南', size: 40, color: '#ef4444' }
]

const formatK = (value: number | string) => `${Number(value) / 1000}k`

const onPointClick = (index: number, datum: ScatterChartDatum) => {
  console.info(index, datum.label)
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <p class="mb-1 text-sm text-gray-500">
        坐标轴标题 + 每个点一项图例。sizeScale 把 size 当度量，gradient 仍用 item.color
      </p>
      <ScatterChart
        :data="data"
        :width="460"
        :height="260"
        x-axis-label="门店数"
        y-axis-label="销售额"
        :x-ticks="4"
        :y-ticks="4"
        :y-tick-format="formatK"
        :size-scale="{ minRadius: 5, maxRadius: 14 }"
        gradient
        show-legend
        legend-position="bottom" />
    </div>
    <div>
      <p class="mb-1 text-sm text-gray-500">只传 onPointClick，不必再开 selectable</p>
      <ScatterChart :data="data" :width="460" :height="220" @point-click="onPointClick" />
    </div>
  </div>
</template>
