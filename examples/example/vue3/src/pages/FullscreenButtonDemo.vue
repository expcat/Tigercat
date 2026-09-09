<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('fullscreen-button')
</script>

<template>
  <DemoPage
    title="FullscreenButton 全屏按钮"
    description="进入/退出浏览器全屏。无权限或 SSR 时按钮禁用，不抛错。也可用 useFullscreen。"
    :modules="modules" />
</template>
