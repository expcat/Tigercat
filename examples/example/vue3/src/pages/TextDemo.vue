<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// TextDemo
const modules = getDemoModules('text')
</script>

<template>
  <DemoPage title="Text 文本" description="文本的基本格式。" :modules="modules" />
</template>
