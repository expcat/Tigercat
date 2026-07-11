<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// StatisticDemo
const modules = getDemoModules('statistic')
</script>

<template>
  <DemoPage
    title="Statistic 统计"
    description="展示统计数值，支持精度、前缀后缀和千分位分隔。"
    :modules="modules" />
</template>
