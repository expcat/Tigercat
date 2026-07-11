<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// ColorPickerDemo
const modules = getDemoModules('color-picker')
</script>

<template>
  <DemoPage
    title="ColorPicker 颜色选择器"
    description="用于选择颜色，支持透明度、预设颜色和多种格式。"
    :modules="modules" />
</template>
