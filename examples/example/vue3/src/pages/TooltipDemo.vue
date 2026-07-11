<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// TooltipDemo
const modules = getDemoModules('tooltip')
</script>

<template>
  <DemoPage
    title="Tooltip 气泡提示"
    description="用于显示简洁的文本提示信息。"
    :modules="modules" />
</template>
