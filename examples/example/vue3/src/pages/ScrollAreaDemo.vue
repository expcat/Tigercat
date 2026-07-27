<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('scroll-area')
</script>

<template>
  <DemoPage
    title="ScrollArea 滚动区域"
    description="样式化滚动条容器，支持横纵向滚动、滚动阴影与命令式 scrollTo。"
    :modules="modules" />
</template>
