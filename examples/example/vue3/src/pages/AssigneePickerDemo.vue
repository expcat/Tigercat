<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('assignee-picker')
</script>

<template>
  <DemoPage
    title="AssigneePicker 受理人选择"
    description="搜索并选择调用方提供的人员。"
    :modules="modules" />
</template>
