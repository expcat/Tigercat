<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// SegmentedDemo
const modules = getDemoModules('segmented')
</script>

<template>
  <DemoPage
    title="Segmented 分段控制器"
    description="真 radiogroup。每组需要 aria-label。指示条跟阅读方向。"
    :modules="modules" />
</template>
