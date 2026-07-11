<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// ProgressDemo
const modules = getDemoModules('progress')
</script>

<template>
  <DemoPage
    title="Progress 进度条"
    description="用于展示操作进度的组件，支持线形和圆形两种展示方式。"
    :modules="modules" />
</template>
