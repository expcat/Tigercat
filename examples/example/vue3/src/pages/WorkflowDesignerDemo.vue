<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('workflow-designer')
</script>

<template>
  <DemoPage
    title="WorkflowDesigner 流程设计器"
    description="中轴摘要卡画布，多分岔横向展开，结构操作在 Inspector。复用 WorkflowTimelineStep，可选子路径。不是 BPMN。"
    :modules="modules" />
</template>
