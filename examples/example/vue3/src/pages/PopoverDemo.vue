<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// PopoverDemo
const modules = getDemoModules('popover')
</script>

<template>
  <DemoPage title="Popover 气泡卡片" description="用于显示复杂的自定义内容。" :modules="modules" />
</template>
