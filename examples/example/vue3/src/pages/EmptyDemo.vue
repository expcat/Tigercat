<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// EmptyDemo
const modules = getDemoModules('empty')
</script>

<template>
  <DemoPage
    title="Empty 空状态"
    description="空状态占位。preset 换默认文案和内置插图（simple 无图）。"
    :modules="modules" />
</template>
