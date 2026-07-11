<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// DrawerDemo
const modules = getDemoModules('drawer')
</script>

<template>
  <DemoPage
    title="Drawer 抽屉"
    description="从页面边缘滑出的面板，用于展示详细信息或进行操作。"
    :modules="modules" />
</template>
