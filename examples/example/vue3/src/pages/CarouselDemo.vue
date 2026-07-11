<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// CarouselDemo
const modules = getDemoModules('carousel')
</script>

<template>
  <DemoPage
    title="Carousel 轮播图"
    description="轮播组件，用于展示图片、卡片等内容。"
    :modules="modules" />
</template>
