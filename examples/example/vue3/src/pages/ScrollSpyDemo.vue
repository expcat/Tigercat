<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// ScrollSpyDemo
const modules = getDemoModules('scroll-spy')
</script>

<template>
  <DemoPage
    title="ScrollSpy 滚动监听"
    description="监听内容滚动并自动高亮当前导航项，适合文档目录、长表单和设置页。"
    :modules="modules" />
</template>
