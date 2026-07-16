<script setup lang="ts">
import { HeatmapChart } from '@expcat/tigercat-vue/HeatmapChart'

const xLabels = Array.from({ length: 24 }, (_, index) => `${index}时`)
const yLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const data = yLabels.flatMap((y, yIndex) =>
  xLabels.map((x, xIndex) => ({
    x,
    y,
    value: ((xIndex * 7 + yIndex * 13) % 40) + (xIndex % 5) * 12
  }))
)
</script>

<template>
  <div>
    <p class="mb-1 text-sm text-gray-500">renderMode="canvas"：{{ data.length }} 个单元格的大矩阵</p>
    <HeatmapChart
      :data="data"
      :x-labels="xLabels"
      :y-labels="yLabels"
      :width="620"
      :height="220"
      render-mode="canvas"
      :cell-gap="1"
      :cell-radius="1"
      min-color="#ecfdf5"
      max-color="#047857"
      show-tooltip />
  </div>
</template>
