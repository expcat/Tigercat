<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// StatisticDemo
const modules = getDemoModules('statistic')
</script>

<template>
  <DemoPage
    title="Statistic 统计"
    description="数字走 Intl + ConfigProvider locale。animated 在 mount 后播；减少动态时直接终值。"
    :modules="modules" />
</template>
