<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// LineChartDemo
const modules = getDemoModules('line-chart')
</script>

<template>
  <DemoPage
    title="LineChart 折线图"
    description="用于展示数据随时间或类别变化趋势。"
    :modules="modules" />
</template>
