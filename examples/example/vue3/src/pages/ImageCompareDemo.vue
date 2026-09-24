<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('image-compare')
</script>

<template>
  <DemoPage
    title="ImageCompare 图片对比"
    description="叠放 before/after。两侧可加标题，标题进入滑块值文本。页面仍可滚动。"
    :modules="modules" />
</template>
