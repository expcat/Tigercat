<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('config-provider')
</script>

<template>
  <DemoPage
    title="ConfigProvider 全局配置"
    description="为组件树统一提供语言、主题、配色模式和文字方向。"
    :modules="modules" />
</template>
