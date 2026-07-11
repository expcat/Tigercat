<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// VirtualTableDemo
const modules = getDemoModules('virtual-table')
</script>

<template>
  <DemoPage
    title="VirtualTable 虚拟表格"
    description="虚拟滚动表格，可高效渲染大量数据行。"
    :modules="modules" />
</template>
