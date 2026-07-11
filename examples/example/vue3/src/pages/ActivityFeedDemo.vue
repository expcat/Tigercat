<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// ActivityFeedDemo
const modules = getDemoModules('activity-feed')
</script>

<template>
  <DemoPage
    title="ActivityFeed 活动动态流"
    description="组合组件，适配审计日志与动态信息流。"
    :modules="modules" />
</template>
