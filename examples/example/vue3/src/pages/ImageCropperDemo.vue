<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// ImageCropperDemo
const modules = getDemoModules('image-cropper')
</script>

<template>
  <DemoPage
    title="ImageCropper 图片裁剪"
    description="交互式图片裁剪组件，支持自由裁剪、固定宽高比、辅助线、Canvas 输出。"
    :modules="modules" />
</template>
