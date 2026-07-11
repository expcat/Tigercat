<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// DataTableWithToolbarDemo
const modules = getDemoModules('data-table-with-toolbar')
</script>

<template>
  <DemoPage
    title="DataTableWithToolbar 表格工具栏"
    description="搜索、筛选、批量操作与分页联动的组合组件。"
    :modules="modules" />
</template>
