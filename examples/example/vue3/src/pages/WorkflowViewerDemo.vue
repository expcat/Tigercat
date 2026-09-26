<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('workflow-viewer')
</script>

<template>
  <DemoPage
    title="WorkflowViewer 审批树"
    description="只读审批拓扑：分岔与 loopTo 退回环，复用 WorkflowTimelineStep。不是第二套 Timeline，不是 BPMN。"
    :modules="modules" />
</template>
