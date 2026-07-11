<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// SpotlightDemo
const modules = getDemoModules('spotlight')
</script>

<template>
  <DemoPage
    title="Spotlight 命令面板"
    description="支持分组结果、模糊搜索与键盘导航的命令面板。"
    :modules="modules" />
</template>
