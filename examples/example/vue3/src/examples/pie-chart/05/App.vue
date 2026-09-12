<script setup lang="ts">
import { PieChart } from '@expcat/tigercat-vue/PieChart'
import type { PieChartDatum } from '@expcat/tigercat-vue'

const data: PieChartDatum[] = [
  { value: 335, label: '直接访问' },
  { value: 310, label: '邮件营销' },
  { value: 234, label: '联盟广告' },
  { value: 135, label: '视频广告' }
]
</script>

<template>
  <div>
    <p class="mb-1 text-sm text-gray-500">colors + animated + gradient + 描边</p>
    <PieChart
      :data="data"
      :width="380"
      :height="280"
      :inner-radius-ratio="0.6"
      :colors="['#2563eb', '#0891b2', '#22c55e', '#f59e0b']"
      animated
      gradient
      :border-width="3"
      border-color="#ffffff"
      show-legend
      legend-position="right" />
  </div>
</template>
