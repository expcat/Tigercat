<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// PaginationDemo
const modules = getDemoModules('pagination')
</script>

<template>
  <DemoPage
    title="Pagination 分页"
    description="用于在数据量较大时进行分页展示，支持多种模式、快速跳页、页码选择等特性。"
    :modules="modules" />
</template>
