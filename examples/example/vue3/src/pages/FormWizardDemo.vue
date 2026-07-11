<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// FormWizardDemo
const modules = getDemoModules('form-wizard')
</script>

<template>
  <DemoPage
    title="FormWizard 表单向导"
    description="多步表单流，支持校验阻断与完成态。"
    :modules="modules" />
</template>
