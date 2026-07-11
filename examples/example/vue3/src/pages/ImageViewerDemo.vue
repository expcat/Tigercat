<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// ImageViewerDemo
const modules = getDemoModules('image-viewer')
</script>

<template>
  <DemoPage
    title="ImageViewer 图片查看器"
    description="全屏图片预览，支持缩放、旋转和多图切换。"
    :modules="modules" />
</template>
