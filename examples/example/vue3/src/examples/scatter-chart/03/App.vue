<script setup lang="ts">
import { ScatterChart } from '@expcat/tigercat-vue/ScatterChart'
import type { ScatterChartDatum } from '@expcat/tigercat-vue'

const data: ScatterChartDatum[] = [
  { x: 12, y: 2400, label: '华东' },
  { x: 28, y: 3600, label: '华南' },
  { x: 45, y: 2900, label: '华北' },
  { x: 62, y: 4800, label: '西南' }
]

const formatK = (value: number | string) => `${Number(value) / 1000}k`
</script>

<template>
  <div>
    <p class="mb-1 text-sm text-gray-500">坐标轴标题 + 刻度格式化 + 图例（colors 循环配色）</p>
    <ScatterChart
      :data="data"
      :width="460"
      :height="260"
      :colors="['#2563eb', '#22c55e', '#f59e0b', '#ef4444']"
      x-axis-label="门店数"
      y-axis-label="销售额"
      :x-ticks="4"
      :y-ticks="4"
      :y-tick-format="formatK"
      :point-size="9"
      show-legend
      legend-position="bottom" />
  </div>
</template>
