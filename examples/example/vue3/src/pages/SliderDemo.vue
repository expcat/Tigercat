<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// SliderDemo
const modules = getDemoModules('slider')
</script>

<template>
  <DemoPage
    title="Slider 滑块"
    description="通过拖动滑块在一个固定区间内进行选择。"
    :modules="modules" />
</template>
