<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// PieChartDemo
const modules = getDemoModules('pie-chart')
</script>

<template>
  <DemoPage
    title="PieChart 饼图"
    description="饼图与环形图：innerRadiusRatio 挖环，外部标签引导线、中心文案、图例与渐变。"
    :modules="modules" />
</template>
