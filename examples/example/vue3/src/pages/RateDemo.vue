<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// RateDemo
const modules = getDemoModules('rate')
</script>

<template>
  <DemoPage
    title="Rate 评分"
    description="半星跟阅读方向。只读用 readOnly（可聚焦）；disabled 才出 Tab。"
    :modules="modules" />
</template>
