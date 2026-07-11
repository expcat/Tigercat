<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// NotificationDemo
const modules = getDemoModules('notification')
</script>

<template>
  <DemoPage
    title="Notification 通知"
    description="全局显示通知提示信息，支持多种展示位置、关闭与定时消失。"
    :modules="modules" />
</template>
