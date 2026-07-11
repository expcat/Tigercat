<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// CodeDemo
const modules = getDemoModules('code')
</script>

<template>
  <DemoPage title="Code 代码展示" description="展示代码片段并支持一键复制。" :modules="modules" />
</template>
