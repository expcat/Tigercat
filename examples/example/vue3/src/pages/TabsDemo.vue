<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// TabsDemo
const modules = getDemoModules('tabs')
</script>

<template>
  <DemoPage title="Tabs 标签页" description="用于内容的分类与切换。" :modules="modules" />
</template>
