<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// BarChartDemo
const modules = getDemoModules('bar-chart')
</script>

<template>
  <DemoPage
    title="BarChart 柱状图"
    description="用于展示分类数据的柱状图，支持渐变填充、数值标签、入场动画等 ECharts 风格特性。"
    :modules="modules" />
</template>
