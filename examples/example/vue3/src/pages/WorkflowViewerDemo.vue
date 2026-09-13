<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('workflow-viewer')
</script>

<template>
  <DemoPage
    title="WorkflowViewer 审批树"
    description="只读钉钉风审批树，复用 WorkflowTimelineStep。不是第二套 Timeline，不是 BPMN。"
    :modules="modules" />
</template>
