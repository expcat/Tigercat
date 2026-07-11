<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// HeatmapChartDemo
const modules = getDemoModules('heatmap-chart')
</script>

<template>
  <DemoPage
    title="HeatmapChart 热力图"
    description="矩阵热力图，用颜色深浅展示数据密度。"
    :modules="modules" />
</template>
