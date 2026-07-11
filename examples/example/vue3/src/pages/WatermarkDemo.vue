<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// WatermarkDemo
const modules = getDemoModules('watermark')
</script>

<template>
  <DemoPage
    title="Watermark 水印"
    description="在页面上添加水印，支持文字和图片，防止信息泄露。"
    :modules="modules" />
</template>
