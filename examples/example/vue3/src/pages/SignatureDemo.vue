<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// SignatureDemo
const modules = getDemoModules('signature')
</script>

<template>
  <DemoPage
    title="Signature 手写签名"
    description="手写签名画板，支持颜色、线宽、清空和 PNG / SVG 导出。"
    :modules="modules" />
</template>
