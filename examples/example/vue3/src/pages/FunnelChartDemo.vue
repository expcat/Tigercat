<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// FunnelChartDemo
const modules = getDemoModules('funnel-chart')
</script>

<template>
  <DemoPage
    title="FunnelChart 漏斗图"
    description="展示数据从大到小递减的流程或转化率。"
    :modules="modules" />
</template>
