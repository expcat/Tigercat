<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// AlertDemo
const modules = getDemoModules('alert')
</script>

<template>
  <DemoPage
    title="Alert 警告提示"
    description="用于页面中展示重要的提示信息，支持成功、警告、失败、信息等多种状态。"
    :modules="modules" />
</template>
