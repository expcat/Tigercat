<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// AnchorDemo
const modules = getDemoModules('anchor')
</script>

<template>
  <DemoPage
    title="Anchor 锚点"
    description="用于跳转到页面指定位置的导航组件。"
    :modules="modules" />
</template>
