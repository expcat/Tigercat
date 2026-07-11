<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// OrgChartDemo
const modules = getDemoModules('org-chart')
</script>

<template>
  <DemoPage
    title="OrgChart 组织结构图"
    description="基于 Tree 数据结构生成 SVG 组织结构图，支持选中、悬停和方向切换。"
    :modules="modules" />
</template>
