<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// InputDemo
const modules = getDemoModules('input')
</script>

<template>
  <DemoPage
    title="Input 输入框"
    description="通过鼠标或键盘输入内容，是最基础的表单域的包装。"
    :modules="modules" />
</template>
