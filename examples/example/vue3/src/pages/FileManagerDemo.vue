<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// FileManagerDemo
const modules = getDemoModules('file-manager')
</script>

<template>
  <DemoPage
    title="FileManager 文件管理器"
    description="文件浏览管理组件，支持列表/网格视图和搜索。"
    :modules="modules" />
</template>
