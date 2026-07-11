<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// RadarChartDemo
const modules = getDemoModules('radar-chart')
</script>

<template>
  <DemoPage title="RadarChart 雷达图" description="用于展示多维指标对比。" :modules="modules" />
</template>
