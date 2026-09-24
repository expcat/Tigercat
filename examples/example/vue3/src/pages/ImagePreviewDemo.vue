<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('image-preview')
</script>

<template>
  <DemoPage
    title="ImagePreview 图片预览"
    description="全屏预览支持缩放、旋转、水平翻转、下载当前图和回到 1:1。多图循环。工具条项可用 toolbarItem 替换。"
    :modules="modules" />
</template>
