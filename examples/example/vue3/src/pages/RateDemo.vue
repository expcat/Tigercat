<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// RateDemo
const modules = getDemoModules('rate')
</script>

<template>
  <DemoPage
    title="Rate 评分"
    description="评分组件，支持半星、自定义字符和禁用状态。"
    :modules="modules" />
</template>
