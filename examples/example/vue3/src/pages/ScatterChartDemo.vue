<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// ScatterChartDemo
const modules = getDemoModules('scatter-chart')
</script>

<template>
  <DemoPage
    title="ScatterChart 散点图"
    description="用于展示二维数值分布，默认扁平风格，可选渐变填充与入场动画。"
    :modules="modules" />
</template>
