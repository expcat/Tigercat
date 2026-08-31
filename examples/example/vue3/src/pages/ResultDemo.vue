<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// ResultDemo
const modules = getDemoModules('result')
</script>

<template>
  <DemoPage
    title="Result 结果页"
    description="操作结果页。有 title 时用 heading；HTTP 状态画数字，不自动补文案。默认不是 live region。"
    :modules="modules" />
</template>
