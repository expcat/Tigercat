<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('marquee')
</script>

<template>
  <DemoPage
    title="Marquee 跑马灯"
    description="循环滚动子内容。悬停或焦点在区域内时暂停，并遵循 prefers-reduced-motion。"
    :modules="modules" />
</template>
