<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// DividerDemo
const modules = getDemoModules('divider')
</script>

<template>
  <DemoPage title="Divider 分割线" description="区隔内容的分割线。" :modules="modules" />
</template>
