<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// GridDemo
const modules = getDemoModules('grid')
</script>

<template>
  <DemoPage
    title="Grid 栅格"
    description="通过基础的 24 分栏，迅速简便地创建布局。"
    :modules="modules" />
</template>
