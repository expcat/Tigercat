<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// WatermarkDemo
const modules = getDemoModules('watermark')
</script>

<template>
  <DemoPage
    title="Watermark 水印"
    description="gap 是透明间距。默认墨水跟正文色。图片失败会回退文字。"
    :modules="modules" />
</template>
