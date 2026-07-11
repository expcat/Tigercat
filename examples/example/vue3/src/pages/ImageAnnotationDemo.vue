<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// ImageAnnotationDemo
const modules = getDemoModules('image-annotation')
</script>

<template>
  <DemoPage
    title="ImageAnnotation 图片标注"
    description="用 SVG 覆层在图片上绘制矩形、圆形、多边形和自由画笔标注，坐标以归一化数据保存。"
    :modules="modules" />
</template>
