<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// StepsDemo
const modules = getDemoModules('steps')
</script>

<template>
  <DemoPage
    title="Steps 步骤条"
    description="引导用户按照流程完成任务的导航条。"
    :modules="modules" />
</template>
