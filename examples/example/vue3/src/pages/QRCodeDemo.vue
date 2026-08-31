<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// QRCodeDemo
const modules = getDemoModules('qrcode')
</script>

<template>
  <DemoPage
    title="QRCode 二维码"
    description="把 value 编成可扫描的 QR。过期态仅在绑定刷新回调时出现 button。"
    :modules="modules" />
</template>
