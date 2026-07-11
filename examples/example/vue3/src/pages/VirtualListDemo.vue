<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// VirtualListDemo
const modules = getDemoModules('virtual-list')
</script>

<template>
  <DemoPage
    title="VirtualList 虚拟列表"
    description="虚拟滚动渲染大量列表项，只渲染可视区域内的元素。"
    :modules="modules" />
</template>
