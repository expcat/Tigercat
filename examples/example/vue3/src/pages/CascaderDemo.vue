<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// CascaderDemo
const modules = getDemoModules('cascader')
</script>

<template>
  <DemoPage
    title="Cascader 级联选择"
    description="多级联动选择器，适用于省市区等层级数据。"
    :modules="modules" />
</template>
