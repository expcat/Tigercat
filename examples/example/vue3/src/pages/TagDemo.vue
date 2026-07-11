<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// TagDemo
const modules = getDemoModules('tag')
</script>

<template>
  <DemoPage title="Tag 标签" description="用于标记和分类的小型标签组件。" :modules="modules" />
</template>
