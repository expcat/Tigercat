<script setup lang="ts">
import { AreaChart } from '@expcat/tigercat-vue/AreaChart'
import type { AreaChartSeries } from '@expcat/tigercat-vue'

const series: AreaChartSeries[] = [
  {
    name: '移动端',
    data: [
      { x: 'Jan', y: 40 },
      { x: 'Feb', y: 55 },
      { x: 'Mar', y: 60 },
      { x: 'Apr', y: 70 }
    ]
  },
  {
    name: '桌面端',
    data: [
      { x: 'Jan', y: 30 },
      { x: 'Feb', y: 35 },
      { x: 'Mar', y: 40 },
      { x: 'Apr', y: 45 }
    ]
  }
]
</script>

<template>
  <AreaChart
    :series="series"
    :width="420"
    :height="240"
    stacked
    gradient
    curve="monotone"
    show-points
    point-hollow
    animated
    hoverable
    selectable
    show-legend
    legend-position="right" />
</template>
