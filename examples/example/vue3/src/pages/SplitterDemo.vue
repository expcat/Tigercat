<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// SplitterDemo
const modules = getDemoModules('splitter')
</script>

<template>
  <DemoPage
    title="Splitter 分割面板"
    description="可拖拽分割面板，支持水平/垂直、嵌套和最小尺寸。"
    :modules="modules" />
</template>
