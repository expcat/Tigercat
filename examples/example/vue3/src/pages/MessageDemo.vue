<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// MessageDemo
const modules = getDemoModules('message')
</script>

<template>
  <DemoPage
    title="Message 消息提示"
    description="全局展示操作反馈信息，支持多种状态、自动关闭、队列管理等功能。"
    :modules="modules" />
</template>
