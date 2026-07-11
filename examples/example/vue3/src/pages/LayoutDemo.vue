<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// LayoutDemo
const modules = getDemoModules('layout')
</script>

<template>
  <DemoPage title="Layout 布局" description="协助进行页面级整体布局。" :modules="modules" />
</template>
