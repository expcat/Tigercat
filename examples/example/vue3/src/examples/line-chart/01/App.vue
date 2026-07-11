<script setup lang="ts">
import { LineChart } from '@expcat/tigercat-vue/LineChart'
import type { LineChartSeries } from '@expcat/tigercat-vue'

const series: LineChartSeries[] = [
  {
    name: '销售额',
    data: [
      { x: 'Q1', y: 120 },
      { x: 'Q2', y: 180 },
      { x: 'Q3', y: 150 },
      { x: 'Q4', y: 200 }
    ]
  },
  {
    name: '利润',
    data: [
      { x: 'Q1', y: 40 },
      { x: 'Q2', y: 60 },
      { x: 'Q3', y: 45 },
      { x: 'Q4', y: 80 }
    ],
    strokeDasharray: '5,3'
  }
]
</script>

<template>
  <LineChart
    :series="series"
    :width="420"
    :height="240"
    curve="monotone"
    show-area
    :area-opacity="0.2"
    show-points
    point-hollow
    animated
    hoverable
    selectable
    show-legend
    legend-position="right" />
</template>
