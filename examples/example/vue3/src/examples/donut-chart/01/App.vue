<script setup lang="ts">
import { DonutChart } from '@expcat/tigercat-vue/DonutChart'
import type { PieChartDatum } from '@expcat/tigercat-vue'

const data: PieChartDatum[] = [
  { value: 335, label: '直接访问' },
  { value: 310, label: '邮件营销' },
  { value: 234, label: '联盟广告' },
  { value: 135, label: '视频广告' }
]
const total = data.reduce((sum, item) => sum + item.value, 0)
</script>

<template>
  <DonutChart
    :data="data"
    :width="380"
    :height="280"
    :inner-radius-ratio="0.5"
    :pad-angle="0.06"
    :hover-offset="14"
    hoverable
    selectable
    show-labels
    show-legend
    legend-position="right"
    show-tooltip
    :center-value="total"
    center-label="访问量" />
</template>
