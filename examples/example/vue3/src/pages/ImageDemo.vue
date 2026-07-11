<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// ImageDemo
const modules = getDemoModules('image')
</script>

<template>
  <DemoPage
    title="Image 图片"
    description="图片展示组件，支持适配模式、懒加载、错误回退、点击预览、多图组预览。"
    :modules="modules" />
</template>
