<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// FloatButtonDemo
const modules = getDemoModules('float-button')
</script>

<template>
  <DemoPage
    title="FloatButton 悬浮按钮"
    description="悬浮在页面角落的操作按钮，支持分组展开。"
    :modules="modules" />
</template>
