<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('context-menu')
</script>

<template>
  <DemoPage
    title="ContextMenu 右键菜单"
    description="在触发区域右键打开菜单，支持坐标定位、嵌套子菜单与键盘导航。"
    :modules="modules" />
</template>
