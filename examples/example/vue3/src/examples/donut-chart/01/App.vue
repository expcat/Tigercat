<script setup lang="ts">
import { DonutChart } from '@expcat/tigercat-vue/DonutChart'
import type { PieChartDatum } from '@expcat/tigercat-vue'

const data: PieChartDatum[] = [
  { value: 335, label: '直接访问' },
  { value: 310, label: '邮件营销' },
  { value: 234, label: '联盟广告' },
  { value: 135, label: '视频广告' }
]
</script>

<template>
  <DonutChart :data="data" :width="380" :height="280" />
</template>
