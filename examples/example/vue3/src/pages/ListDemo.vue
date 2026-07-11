<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// ListDemo
const modules = getDemoModules('list')
</script>

<template>
  <DemoPage
    title="List 列表"
    description="通用列表组件，用于展示一系列相似的数据项。"
    :modules="modules" />
</template>
