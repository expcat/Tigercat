<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// CronEditorDemo
const modules = getDemoModules('cron-editor')
</script>

<template>
  <DemoPage
    title="CronEditor Cron 编辑器"
    description="用于编辑和校验 5 段 Cron 表达式。"
    :modules="modules" />
</template>
