<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// PieChartDemo
const modules = getDemoModules('pie-chart')
</script>

<template>
  <DemoPage
    title="PieChart 饼图"
    description="ECharts 风格饼图：悬停偏移、边框分隔、外部标签引导线、阴影等特效。"
    :modules="modules" />
</template>
