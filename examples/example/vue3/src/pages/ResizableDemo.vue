<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// ResizableDemo
const modules = getDemoModules('resizable')
</script>

<template>
  <DemoPage
    title="Resizable 可调整大小容器"
    description="拖拽手柄改变元素尺寸，支持锁定宽高比和约束范围。"
    :modules="modules" />
</template>
