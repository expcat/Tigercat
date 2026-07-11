<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// TreeSelectDemo
const modules = getDemoModules('tree-select')
</script>

<template>
  <DemoPage
    title="TreeSelect 树选择"
    description="树形结构选择器，适用于组织架构等层级数据。"
    :modules="modules" />
</template>
