<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// SegmentedDemo
const modules = getDemoModules('segmented')
</script>

<template>
  <DemoPage
    title="Segmented 分段控制器"
    description="分段选择器，类似 iOS UISegmentedControl。"
    :modules="modules" />
</template>
