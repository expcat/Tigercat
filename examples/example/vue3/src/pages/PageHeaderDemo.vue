<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('page-header')
</script>

<template>
  <DemoPage
    title="PageHeader 页头"
    description="页面级导航页头：可选返回、面包屑/标题/副标题与右侧操作区，不是 Layout 的顶栏 Header。"
    :modules="modules" />
</template>
