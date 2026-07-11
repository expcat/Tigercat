<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// AutoCompleteDemo
const modules = getDemoModules('auto-complete')
</script>

<template>
  <DemoPage
    title="AutoComplete 自动补全"
    description="输入框自动完成，根据输入内容过滤候选项。"
    :modules="modules" />
</template>
