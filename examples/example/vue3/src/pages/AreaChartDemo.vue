<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// AreaChartDemo
const modules = getDemoModules('area-chart')
</script>

<template>
  <DemoPage
    title="AreaChart 面积图"
    description="用于展示数据随时间变化的趋势，强调数量累积。"
    :modules="modules" />
</template>
