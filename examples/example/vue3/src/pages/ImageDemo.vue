<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// ImageDemo
const modules = getDemoModules('image')
</script>

<template>
  <DemoPage
    title="Image 图片"
    description="默认可键盘预览、懒加载、失败回退、悬停放大、组图连续切换。"
    :modules="modules" />
</template>
