<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// TimelineDemo
const modules = getDemoModules('timeline')
</script>

<template>
  <DemoPage
    title="Timeline 时间线"
    description="垂直展示时间流信息的时间线组件，支持多种模式与自定义渲染。"
    :modules="modules" />
</template>
