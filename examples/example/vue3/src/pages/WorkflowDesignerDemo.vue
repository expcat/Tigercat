<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('workflow-designer')
</script>

<template>
  <DemoPage
    title="WorkflowDesigner 流程设计器"
    description="摘要卡扫读，点选后编辑。复用 WorkflowTimelineStep，可选子路径。不是 BPMN。"
    :modules="modules" />
</template>
