<script setup lang="ts">
import { RadarChart } from '@expcat/tigercat-vue/RadarChart'
import type { RadarChartSeries } from '@expcat/tigercat-vue'

const series: RadarChartSeries[] = [
  {
    name: '产品 A',
    data: [
      { label: '速度', value: 80 },
      { label: '稳定', value: 65 },
      { label: '设计', value: 90 },
      { label: '续航', value: 70 },
      { label: '价格', value: 50 }
    ]
  },
  {
    name: '产品 B',
    data: [
      { label: '速度', value: 72 },
      { label: '稳定', value: 78 },
      { label: '设计', value: 82 },
      { label: '续航', value: 66 },
      { label: '价格', value: 60 }
    ]
  }
]
</script>

<template>
  <RadarChart
    :series="series"
    :width="380"
    :height="280"
    :max-value="100"
    grid-shape="circle"
    show-split-area
    show-level-labels
    show-points
    :fill-opacity="0.18"
    hoverable
    selectable
    show-legend
    legend-position="right" />
</template>
