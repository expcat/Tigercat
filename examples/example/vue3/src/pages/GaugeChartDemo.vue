<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// GaugeChartDemo
const modules = getDemoModules('gauge-chart')
</script>

<template>
  <DemoPage
    title="GaugeChart 仪表盘"
    description="环形仪表盘，展示单一指标的进度或状态。"
    :modules="modules" />
</template>
