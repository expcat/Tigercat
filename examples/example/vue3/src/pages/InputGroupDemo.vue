<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// InputGroupDemo
const modules = getDemoModules('input-group')
</script>

<template>
  <DemoPage
    title="InputGroup 输入框组"
    description="将多个输入元素组合在一起，支持前后缀和紧凑模式。"
    :modules="modules" />
</template>
