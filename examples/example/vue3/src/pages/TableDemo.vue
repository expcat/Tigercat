<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// TableDemo
const modules = getDemoModules('table')
</script>

<template>
  <DemoPage
    title="Table 表格"
    description="用于展示行列数据的表格组件，支持排序、筛选、分页等功能。"
    :modules="modules" />
</template>
