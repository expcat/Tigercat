<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// TaskBoardDemo
const modules = getDemoModules('task-board')
</script>

<template>
  <DemoPage
    title="TaskBoard 任务看板"
    description="可拖拽的任务看板，支持卡片跨列流转、列排序、WIP 限制等。"
    :modules="modules" />
</template>
