<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// SignatureDemo
const modules = getDemoModules('signature')
</script>

<template>
  <DemoPage
    title="Signature 手写签名"
    description="受控值为 SVG data URL 或空字符串；toDataURL 可导出 PNG / JPEG / SVG。"
    :modules="modules" />
</template>
