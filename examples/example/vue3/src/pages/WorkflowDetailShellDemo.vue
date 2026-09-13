<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('workflow-detail-shell')
</script>

<template>
  <DemoPage
    title="WorkflowDetailShell 审批详情壳"
    description="一流粘底详情配方：form / tabs 滚动，ActionBar 钉底。不是 BPMN。"
    :modules="modules" />
</template>
