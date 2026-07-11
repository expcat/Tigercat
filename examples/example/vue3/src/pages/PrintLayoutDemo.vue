<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// PrintLayoutDemo
const modules = getDemoModules('print-layout')
</script>

<template>
  <DemoPage
    title="PrintLayout 打印布局"
    description="用于预览和打印的页面布局组件，支持 A4/Letter 尺寸、页眉页脚和分页。"
    :modules="modules" />
</template>
