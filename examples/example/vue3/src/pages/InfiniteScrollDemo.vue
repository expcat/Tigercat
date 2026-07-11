<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// InfiniteScrollDemo
const modules = getDemoModules('infinite-scroll')
</script>

<template>
  <DemoPage
    title="InfiniteScroll 无限滚动"
    description="滚动到底部自动加载更多内容。"
    :modules="modules" />
</template>
