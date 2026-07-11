<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// KanbanDemo
const modules = getDemoModules('kanban')
</script>

<template>
  <DemoPage
    title="Kanban 看板"
    description="可拖拽的看板面板，支持卡片和列拖拽排序。"
    :modules="modules" />
</template>
