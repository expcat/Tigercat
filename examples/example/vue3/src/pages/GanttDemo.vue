<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// GanttDemo
const modules = getDemoModules('gantt')
</script>

<template>
  <DemoPage
    title="Gantt 甘特图"
    description="用 SVG 时间轴展示任务排期、进度和依赖关系。"
    :modules="modules" />
</template>
