<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('masonry')
</script>

<template>
  <DemoPage
    title="Masonry 瀑布流"
    description="响应式列数与间距的瀑布流布局，动态插入自动重排。"
    :modules="modules" />
</template>
