<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// PopconfirmDemo
const modules = getDemoModules('popconfirm')
</script>

<template>
  <DemoPage
    title="Popconfirm 弹出确认"
    description="用于在执行敏感操作时向用户确认。"
    :modules="modules" />
</template>
