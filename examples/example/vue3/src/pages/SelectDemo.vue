<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// SelectDemo
const modules = getDemoModules('select')
</script>

<template>
  <DemoPage
    title="Select 选择器"
    description="当选项过多时，使用下拉菜单展示并选择内容。"
    :modules="modules" />
</template>
