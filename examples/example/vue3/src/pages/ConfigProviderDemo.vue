<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('config-provider')
</script>

<template>
  <DemoPage
    title="ConfigProvider 全局配置"
    description="应用根 ConfigProvider 管理 document 的 theme / colorScheme / dir / lang；内层 theme 作用于子树，document=false 时仅提供 context。"
    :modules="modules" />
</template>
