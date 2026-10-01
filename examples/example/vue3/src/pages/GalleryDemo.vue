<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('gallery')
</script>

<template>
  <DemoPage
    title="Gallery 画廊"
    description="缩略图导航、当前项计数与图片预览。"
    :modules="modules" />
</template>
