<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// ColorSwatchDemo
const modules = getDemoModules('color-swatch')
</script>

<template>
  <DemoPage
    title="ColorSwatch 色板选择器"
    description="用于从预设色板或自定义色组中快速选择颜色。"
    :modules="modules" />
</template>
