<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// CardDemo
const modules = getDemoModules('card')
</script>

<template>
  <DemoPage
    title="Card 卡片"
    description="用于内容展示的卡片容器组件，支持多种样式和布局选项。"
    :modules="modules" />
</template>
