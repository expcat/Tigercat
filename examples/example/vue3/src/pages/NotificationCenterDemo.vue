<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// NotificationCenterDemo
const modules = getDemoModules('notification-center')
</script>

<template>
  <DemoPage
    title="NotificationCenter 通知中心"
    description="组合组件，提供通知分组、已读筛选与批量标记。"
    :modules="modules" />
</template>
