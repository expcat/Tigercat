<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('image-preview')
</script>

<template>
  <DemoPage
    title="ImagePreview 图片预览"
    description="全屏图片预览，支持缩放、旋转和多图切换。用 minScale/maxScale 限制缩放。"
    :modules="modules" />
</template>
