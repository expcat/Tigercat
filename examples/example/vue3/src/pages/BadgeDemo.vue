<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// BadgeDemo
const modules = getDemoModules('badge')
</script>

<template>
  <DemoPage
    title="Badge 徽章"
    description="用于标记和通知的徽章组件，支持点状、数字、文本等多种展示方式。"
    :modules="modules" />
</template>
