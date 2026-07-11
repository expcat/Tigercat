<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// SkeletonDemo
const modules = getDemoModules('skeleton')
</script>

<template>
  <DemoPage
    title="Skeleton 骨架屏"
    description="用于在内容加载时显示占位符的骨架屏组件，提升用户体验。"
    :modules="modules" />
</template>
