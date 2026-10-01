<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('copy-button')
</script>

<template>
  <DemoPage
    title="CopyButton 复制按钮"
    description="基础复制按钮，显示复制结果与失败提示。"
    :modules="modules" />
</template>
