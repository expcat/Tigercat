<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// WatermarkDemo
const modules = getDemoModules('watermark')
</script>

<template>
  <DemoPage
    title="Watermark 水印"
    description="平铺水印。行距、密度和打印可见性只改样式变量，不重绘画布。"
    :modules="modules" />
</template>
