<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('image-compare')
</script>

<template>
  <DemoPage
    title="ImageCompare 图片对比"
    description="叠放 before/after 图片，拖动或键盘调整对比滑块。支持横向与纵向，src 与插槽均可。"
    :modules="modules" />
</template>
