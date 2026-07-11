<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// QRCodeDemo
const modules = getDemoModules('qrcode')
</script>

<template>
  <DemoPage
    title="QRCode 二维码"
    description="将文本转换为二维码，支持自定义颜色、大小和纠错等级。"
    :modules="modules" />
</template>
