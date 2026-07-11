<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// SunburstChartDemo
const modules = getDemoModules('sunburst-chart')
</script>

<template>
  <DemoPage
    title="SunburstChart 旭日图"
    description="以多层同心弧展示层级数据结构。"
    :modules="modules" />
</template>
