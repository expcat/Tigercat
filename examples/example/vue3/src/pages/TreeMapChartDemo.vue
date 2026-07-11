<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// TreeMapChartDemo
const modules = getDemoModules('treemap-chart')
</script>

<template>
  <DemoPage
    title="TreeMapChart 矩形树图"
    description="以嵌套矩形展示层级数据的占比关系。"
    :modules="modules" />
</template>
