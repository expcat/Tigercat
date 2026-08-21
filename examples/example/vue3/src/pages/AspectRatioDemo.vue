<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('aspect-ratio')
</script>

<template>
  <DemoPage
    title="AspectRatio 宽高比容器"
    description="数字或分数字符串指定宽高比，子内容铺满容器。"
    :modules="modules" />
</template>
