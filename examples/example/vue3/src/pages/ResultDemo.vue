<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// ResultDemo
const modules = getDemoModules('result')
</script>

<template>
  <DemoPage
    title="Result 结果页"
    description="用于反馈操作结果，包括成功、失败、警告和 HTTP 状态码。"
    :modules="modules" />
</template>
