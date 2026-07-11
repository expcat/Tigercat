<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// TreeDemo
const modules = getDemoModules('tree')
</script>

<template>
  <DemoPage title="Tree 树形控件" description="用于展示层级结构的树形数据。" :modules="modules" />
</template>
