<script setup lang="ts">
import { RadarChart } from '@expcat/tigercat-vue/RadarChart'
import type { RadarChartDatum } from '@expcat/tigercat-vue'

const data: RadarChartDatum[] = [
  { label: '速度', value: 80 },
  { label: '稳定', value: 65 },
  { label: '设计', value: 90 },
  { label: '续航', value: 70 },
  { label: '价格', value: 50 }
]
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <div>
      <p class="mb-1 text-sm text-gray-500">data 单系列 + levels=4 + 多边形网格 + 虚线</p>
      <RadarChart
        :data="data"
        :width="300"
        :height="240"
        :max-value="100"
        :levels="4"
        grid-shape="polygon"
        grid-line-style="dashed"
        stroke-color="#7c3aed"
        fill-color="#7c3aed"
        :fill-opacity="0.2"
        :stroke-width="2" />
    </div>
    <div>
      <p class="mb-1 text-sm text-gray-500">showGrid=false + showAxis=false（只留形状与标签）</p>
      <RadarChart
        :data="data"
        :width="300"
        :height="240"
        :max-value="100"
        :show-grid="false"
        :show-axis="false" />
    </div>
  </div>
</template>
