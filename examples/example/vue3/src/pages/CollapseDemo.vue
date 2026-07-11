<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// CollapseDemo
const modules = getDemoModules('collapse')
</script>

<template>
  <DemoPage
    title="Collapse 折叠面板"
    description="可以折叠/展开的内容区域，用于将复杂的区域折叠起来。"
    :modules="modules" />
</template>
