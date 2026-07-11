<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// BreadcrumbDemo
const modules = getDemoModules('breadcrumb')
</script>

<template>
  <DemoPage
    title="Breadcrumb 面包屑"
    description="显示当前页面在系统层级结构中的位置，并能向上返回。"
    :modules="modules" />
</template>
