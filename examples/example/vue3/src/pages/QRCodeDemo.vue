<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// QRCodeDemo
const modules = getDemoModules('qrcode')
</script>

<template>
  <DemoPage
    title="QRCode 二维码"
    description="把 value 编成可扫描的 QR。可选纠错等级和中心图标。状态包含已扫描。"
    :modules="modules" />
</template>
