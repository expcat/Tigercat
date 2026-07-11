<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// BackTopDemo
const modules = getDemoModules('backtop')
</script>

<template>
  <DemoPage title="BackTop 回到顶部" description="返回页面顶部的操作按钮。" :modules="modules" />
</template>
