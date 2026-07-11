<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// DescriptionsDemo
const modules = getDemoModules('descriptions')
</script>

<template>
  <DemoPage
    title="Descriptions 描述列表"
    description="用于展示结构化数据、详情信息的描述列表组件。"
    :modules="modules" />
</template>
