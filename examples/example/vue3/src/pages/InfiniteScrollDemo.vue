<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// InfiniteScrollDemo
const modules = getDemoModules('infinite-scroll')
</script>

<template>
  <DemoPage
    title="InfiniteScroll 无限滚动"
    description="滚到阈值自动加载更多。容器必须定高。02 是横向。"
    :modules="modules" />
</template>
