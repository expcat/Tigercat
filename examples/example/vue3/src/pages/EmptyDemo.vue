<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// EmptyDemo
const modules = getDemoModules('empty')
</script>

<template>
  <DemoPage
    title="Empty 空状态"
    description="空状态时的占位提示，支持多种预设样式。"
    :modules="modules" />
</template>
