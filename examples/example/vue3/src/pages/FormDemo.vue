<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// FormDemo
const modules = getDemoModules('form')
</script>

<template>
  <DemoPage
    title="Form 表单"
    description="由输入框和选择器组成，用以收集、校验、提交数据。"
    :modules="modules" />
</template>
