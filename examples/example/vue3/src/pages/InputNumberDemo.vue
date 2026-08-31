<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('input-number')
</script>

<template>
  <DemoPage
    title="InputNumber 数字输入"
    description="十进制步进的数字框，支持格式化、双侧控件与键盘 Home/End。"
    :modules="modules" />
</template>
